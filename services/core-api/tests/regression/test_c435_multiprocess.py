"""Cross-process idempotent login against the disposable PostgreSQL/Redis lab."""

import asyncio
from contextlib import AsyncExitStack
from hashlib import sha256
import hmac
import os
from pathlib import Path
import socket
import subprocess
import sys
import time
from uuid import UUID
from uuid import uuid4

import httpx
from sqlalchemy import text

from pymentor_core.adapters.runtime import RuntimeIdentitySessions as AsyncIdentitySessions
from pymentor_core.modules.identity.login_recovery import derive_login_token
from pymentor_core.adapters.redis.sessions import SessionDigest
from runtime_scenarios import run_scenario


RECOVERY_KEY_HEX = "42" * 32


def _free_local_port():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def _stop_processes(processes):
    for process in processes:
        if process.poll() is None:
            try:
                process.terminate()
            except OSError:
                pass
    for process in processes:
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            try:
                process.kill()
            except OSError:
                pass
            process.wait(timeout=5)


def test_same_login_retry_across_two_local_processes_replaces_only_oldest(monkeypatch):
    monkeypatch.setenv("KNOWI_LOGIN_RECOVERY_KEY", RECOVERY_KEY_HEX)

    async def scenario(db, store, user_id, email, password):
        service = AsyncIdentitySessions(
            db, store, recovery_key=bytes.fromhex(RECOVERY_KEY_HEX)
        )
        initial_tokens = [
            (await service.login(email, password)).token for _ in range(3)
        ]
        initial_digests = [
            str(SessionDigest(sha256(token.encode("utf-8")).hexdigest()))
            for token in initial_tokens
        ]
        async with db.unit_of_work() as uow:
            initial_rows = await uow.session.execute(text(
                "SELECT session_token FROM sessions WHERE user_id=:id ORDER BY created_at, id"
            ), {"id": user_id})
            assert [row[0] for row in initial_rows] == initial_digests

        async def active_session_digests():
            async with db.unit_of_work() as uow:
                rows = await uow.session.execute(text(
                    "SELECT session_token FROM sessions WHERE user_id=:id ORDER BY created_at, id"
                ), {"id": user_id})
                return [row[0] for row in rows]

        prefix = store._prefix
        owned_redis_keys = {store._user_key(user_id)}

        def remember_token(token):
            digest = str(SessionDigest(sha256(token.encode("utf-8")).hexdigest()))
            owned_redis_keys.update({
                f"{prefix}token:{digest}",
                f"{prefix}token:prepared:{digest}",
            })

        for token in initial_tokens:
            remember_token(token)

        processes = []
        operation_id = str(uuid4())
        lost_operation = None
        ports = [_free_local_port(), _free_local_port()]
        while ports[1] == ports[0]:
            ports[1] = _free_local_port()
        roots = [f"http://127.0.0.1:{port}" for port in ports]
        env = os.environ.copy()
        env.pop("PYMENTOR_DUAL_LOCAL_TEST", None)
        env.pop("PYMENTOR_REDIS_PREFIX", None)
        env.pop("PYMENTOR_LOGIN_RECOVERY_KEY", None)
        backend_path = str((Path(__file__).resolve().parents[4] / 'backend'))
        inherited_pythonpath = env.get("PYTHONPATH")
        env.update(
            PYTHONPATH=os.pathsep.join(filter(None, (backend_path, inherited_pythonpath))),
            DATABASE_URL=db.engine.url.set(drivername="postgresql+psycopg").render_as_string(hide_password=False),
            REDIS_URL=os.environ["KNOWI_TEST_REDIS_URL"],
            KNOWI_REDIS_PREFIX=prefix,
            KNOWI_LOGIN_RECOVERY_KEY=RECOVERY_KEY_HEX,
            PYMENTOR_SCHEMA_MODE="managed",
            PYMENTOR_LOCAL_NOTIFICATIONS="0",
            PYTHON_DOTENV_DISABLED="1",
            PYTHONDONTWRITEBYTECODE="1",
        )

        try:
            for port in ports:
                processes.append(subprocess.Popen(
                    [
                        sys.executable, "-m", "uvicorn", "pymentor_core.app.asgi:create_app",
                        "--factory", "--host", "127.0.0.1", "--port", str(port),
                        "--log-level", "warning",
                    ],
                    env=env,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                ))

            async with httpx.AsyncClient(timeout=2, trust_env=False) as probe:
                for process, root in zip(processes, roots):
                    deadline = time.monotonic() + 15
                    while True:
                        assert process.poll() is None, "Core ASGI process exited before readiness"
                        try:
                            ready = await probe.get(f"{root}/health/ready")
                            if ready.status_code == 200:
                                break
                        except (httpx.ConnectError, httpx.TimeoutException):
                            pass
                        if time.monotonic() >= deadline:
                            raise AssertionError("Core ASGI process did not become ready")
                        await asyncio.sleep(0.1)

            headers = {"Idempotency-Key": operation_id}
            payload = {"email": email, "password": password}
            async with AsyncExitStack() as stack:
                clients = [
                    await stack.enter_async_context(
                        httpx.AsyncClient(timeout=10, trust_env=False)
                    )
                    for _ in range(2)
                ]
                start = asyncio.Event()

                async def post_login(client, root):
                    await start.wait()
                    return await client.post(
                        f"{root}/api/user/login", json=payload, headers=headers
                    )

                requests = [
                    asyncio.create_task(post_login(clients[index], roots[index]))
                    for index in range(2)
                ]
                start.set()
                responses = await asyncio.gather(*requests)
                first_tokens = [response.cookies.get("session") for response in responses]
                for token in first_tokens:
                    if token:
                        remember_token(token)

                assert all(response.status_code == 200 for response in responses), [
                    response.status_code for response in responses
                ]
                assert all(response.json()["user"]["id"] == user_id for response in responses)
                assert all(first_tokens)
                assert len(set(first_tokens)) == 1
                assert responses[0].headers["set-cookie"] == responses[1].headers["set-cookie"]

                new_digest = str(SessionDigest(
                    sha256(first_tokens[0].encode("utf-8")).hexdigest()
                ))
                expected_digests = {
                    initial_digests[1], initial_digests[2], new_digest
                }
                before_retry = await active_session_digests()
                assert len(before_retry) == 3
                assert set(before_retry) == expected_digests

                async with httpx.AsyncClient(timeout=10, trust_env=False) as retry_client:
                    retry = await retry_client.post(
                        f"{roots[1]}/api/user/login", json=payload, headers=headers
                    )
                retry_token = retry.cookies.get("session")
                if retry_token:
                    remember_token(retry_token)
                assert retry.status_code == 200
                assert retry.json()["user"]["id"] == user_id
                assert retry_token == first_tokens[0]
                assert retry.headers["set-cookie"] == responses[0].headers["set-cookie"]
                after_retry = await active_session_digests()
                assert len(after_retry) == 3
                assert after_retry == before_retry

            async with db.unit_of_work() as uow:
                operation = (await uow.session.execute(text(
                    "SELECT status FROM login_operations WHERE operation_id=:operation AND user_id=:id"
                ), {"operation": operation_id, "id": user_id})).scalar_one()
            assert operation == "committed"

            async with httpx.AsyncClient(timeout=10, trust_env=False) as verifier:
                checks = await asyncio.gather(
                    verifier.get(f"{roots[0]}/api/user/me", cookies={"session": initial_tokens[0]}),
                    verifier.get(f"{roots[1]}/api/user/me", cookies={"session": initial_tokens[1]}),
                    verifier.get(f"{roots[0]}/api/user/me", cookies={"session": initial_tokens[2]}),
                    verifier.get(f"{roots[1]}/api/user/me", cookies={"session": first_tokens[0]}),
                )
            assert [response.status_code for response in checks] == [401, 200, 200, 200]
            assert all(response.json()["user"]["id"] == user_id for response in checks[1:])

            # Forward one real login request, receive the server's success,
            # then close the client connection without delivering the response.
            # Retrying through the other process must recover the same result.
            lost_operation = str(uuid4())
            observed_success = asyncio.Event()
            handler_done = asyncio.Event()
            proxy_errors = []

            async def drop_response(reader, writer):
                upstream_writer = None
                try:
                    request_head = await reader.readuntil(b"\r\n\r\n")
                    content_length = next(int(line.split(b":", 1)[1].strip())
                        for line in request_head.split(b"\r\n")
                        if line.lower().startswith(b"content-length:"))
                    request_body = await reader.readexactly(content_length)
                    upstream_reader, upstream_writer = await asyncio.open_connection("127.0.0.1", ports[0])
                    upstream_writer.write(request_head + request_body)
                    await upstream_writer.drain()
                    response_head = await upstream_reader.readuntil(b"\r\n\r\n")
                    if not response_head.startswith(b"HTTP/1.1 200 "):
                        raise RuntimeError("upstream login failed")
                    response_length = next(int(line.split(b":", 1)[1].strip())
                        for line in response_head.split(b"\r\n")
                        if line.lower().startswith(b"content-length:"))
                    await upstream_reader.readexactly(response_length)
                    observed_success.set()
                except Exception:
                    proxy_errors.append("proxy failed")
                finally:
                    if upstream_writer is not None:
                        upstream_writer.close()
                        await upstream_writer.wait_closed()
                    writer.close()
                    await writer.wait_closed()
                    handler_done.set()

            proxy = await asyncio.start_server(drop_response, "127.0.0.1", 0)
            try:
                proxy_port = proxy.sockets[0].getsockname()[1]
                async with httpx.AsyncClient(timeout=10, trust_env=False) as lost_client:
                    try:
                        await lost_client.post(f"http://127.0.0.1:{proxy_port}/api/user/login",
                            json=payload, headers={"Idempotency-Key": lost_operation})
                    except httpx.RemoteProtocolError:
                        pass
                    else:
                        raise AssertionError("the test proxy must drop the HTTP response")
                await asyncio.wait_for(observed_success.wait(), timeout=5)
                assert not proxy_errors
            finally:
                proxy.close()
                await proxy.wait_closed()
                await asyncio.wait_for(handler_done.wait(), timeout=5)
            before_recovery = await active_session_digests()
            async with httpx.AsyncClient(timeout=10, trust_env=False) as recovery_client:
                recovered = await recovery_client.post(f"{roots[1]}/api/user/login", json=payload,
                                                       headers={"Idempotency-Key": lost_operation})
            assert recovered.status_code == 200
            recovered_token = recovered.cookies.get("session")
            assert recovered_token
            remember_token(recovered_token)
            assert await active_session_digests() == before_recovery
            async with httpx.AsyncClient(timeout=10, trust_env=False) as verifier:
                assert (await verifier.get(f"{roots[1]}/api/user/me", cookies={"session": recovered_token})).status_code == 200
        finally:
            _stop_processes(processes)
            # A response may have been lost after the server created a gate.
            # Derive that one known synthetic token from the account generation.
            async with db.unit_of_work() as uow:
                generation = await uow.session.scalar(text(
                    "SELECT lifecycle_id FROM account_lifecycles WHERE user_id=:id"
                ), {"id": user_id})
            if generation is not None:
                generation_key = hmac.new(bytes.fromhex(RECOVERY_KEY_HEX),
                    b"pymentor:identity:account-lifecycle:v1\x00" + UUID(generation).bytes,
                    sha256).digest()
                for issued_operation in (operation_id, lost_operation):
                    if issued_operation is not None:
                        remember_token(derive_login_token(generation_key, user_id, issued_operation))
            if owned_redis_keys:
                await store._client.delete(*sorted(owned_redis_keys))

    run_scenario(scenario)
