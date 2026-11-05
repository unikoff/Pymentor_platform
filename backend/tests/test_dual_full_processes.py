"""Two actual local Core processes share PostgreSQL and async Redis sessions."""

import asyncio
from hashlib import sha256
import os
from pathlib import Path
import socket
import subprocess
import sys
import time
from urllib.parse import urlsplit
from uuid import uuid4

import httpx
import pytest
import redis
from sqlalchemy import create_engine, text

from c222_pg_guard import validate_test_url
from identity.passwords import hash_password


def test_two_local_full_core_processes_share_async_sessions():
    pg_url, redis_url = os.getenv("PYMENTOR_TEST_PG_URL"), os.getenv("PYMENTOR_TEST_REDIS_URL")
    if not pg_url or not redis_url:
        pytest.skip("requires disposable local PostgreSQL and Redis")
    pg = validate_test_url(pg_url).set(drivername="postgresql+psycopg")
    parsed = urlsplit(redis_url)
    if (parsed.scheme != "redis" or parsed.hostname != "127.0.0.1" or parsed.port != 57146
            or parsed.path not in {"", "/0"} or parsed.username or parsed.password or parsed.query or parsed.fragment):
        raise ValueError("Expected the disposable local Redis")

    def free_port():
        with socket.socket() as sock:
            sock.bind(("127.0.0.1", 0))
            return sock.getsockname()[1]

    engine = create_engine(pg, pool_size=2, max_overflow=0, hide_parameters=True,
                           connect_args={"connect_timeout": 3})
    prefix = f"pymentor-c216-test:{uuid4()}:"
    email, password = f"dual-replica-{uuid4().hex}@example.test", "Synthetic-Replica-Password-42"
    user_id = None
    processes = []
    redis_client = redis.Redis.from_url(redis_url, socket_timeout=2)
    try:
        with engine.begin() as conn:
            assert tuple(conn.execute(text("SELECT current_database(), current_user")).one()) == (
                "pymentor_test", "pymentor_test")
            user_id = conn.execute(text(
                "INSERT INTO users(username,email,password_hash) VALUES (:name,:email,:password) RETURNING id"
            ), {"name": "Synthetic Replica", "email": email, "password": hash_password(password)}).scalar_one()
        env = os.environ.copy()
        env.pop("DATABASE_URL", None)
        env.update(PYTHONPATH=str(Path(__file__).resolve().parents[1]), PYMENTOR_DUAL_LOCAL_TEST="1",
                   PYMENTOR_TEST_PG_URL=pg_url, PYMENTOR_TEST_REDIS_URL=redis_url,
                   PYMENTOR_TEST_REDIS_PREFIX=prefix, PYTHON_DOTENV_DISABLED="1",
                   PYMENTOR_LOCAL_NOTIFICATIONS="0", PYTHONDONTWRITEBYTECODE="1")
        ports = (free_port(), free_port())
        assert ports[0] != ports[1]
        for port in ports:
            processes.append(subprocess.Popen(
                [sys.executable, "-m", "uvicorn", "dual_local:create_app", "--factory", "--host",
                 "127.0.0.1", "--port", str(port), "--log-level", "warning"],
                env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            ))

        async def scenario():
            from contextlib import AsyncExitStack
            roots = [f"http://127.0.0.1:{port}" for port in ports]
            async with httpx.AsyncClient(timeout=2, trust_env=False) as probe:
                for process, root in zip(processes, roots):
                    deadline = time.monotonic() + 15
                    while True:
                        assert process.poll() is None, "test Core process exited before readiness"
                        try:
                            response = await probe.get(f"{root}/health/ready")
                            if response.status_code == 200:
                                break
                        except (httpx.ConnectError, httpx.TimeoutException):
                            pass
                        if time.monotonic() >= deadline:
                            raise AssertionError("test Core process was not ready")
                        await asyncio.sleep(0.1)
            async with AsyncExitStack() as stack:
                clients = [await stack.enter_async_context(httpx.AsyncClient(timeout=10, trust_env=False)) for _ in range(4)]
                responses = await asyncio.gather(*(
                    client.post(f"{roots[index % 2]}/api/user/login", json={"email": email, "password": password})
                    for index, client in enumerate(clients)
                ))
                assert all(response.status_code == 200 and response.json()["user"]["id"] == user_id
                           for response in responses)
                checks = await asyncio.gather(*(
                    client.get(f"{roots[(index + 1) % 2]}/api/user/me") for index, client in enumerate(clients)
                ))
                assert sorted(response.status_code for response in checks) == [200, 200, 200, 401]
                active = next(index for index, response in enumerate(checks) if response.status_code == 200)
                token = clients[active].cookies.get("session")
                key = f"{prefix}token:{sha256(token.encode()).hexdigest()}"
                assert redis_client.delete(key) == 1
                assert (await clients[active].get(f"{roots[active % 2]}/api/user/me")).status_code == 401
                with engine.connect() as conn:
                    assert conn.execute(text(
                        "SELECT count(*) FROM sessions WHERE user_id=:id AND session_token=:token"
                    ), {"id": user_id, "token": sha256(token.encode()).hexdigest()}).scalar_one() == 1
        asyncio.run(scenario())
    finally:
        for process in processes:
            if process.poll() is None:
                process.terminate()
        for process in processes:
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait(timeout=5)
        try:
            if user_id is not None:
                user_key = f"{prefix}user:{user_id}"
                hashes = [value.decode("ascii") for value in redis_client.zrange(user_key, 0, -1)]
                assert all(len(value) == 64 and all(char in "0123456789abcdef" for char in value) for value in hashes)
                redis_client.delete(user_key, *(f"{prefix}token:{digest}" for digest in hashes))
        finally:
            redis_client.close()
            if user_id is not None:
                with engine.begin() as conn:
                    conn.execute(text("DELETE FROM sessions WHERE user_id=:id"), {"id": user_id})
                    conn.execute(text("DELETE FROM users WHERE id=:id AND email=:email"),
                                 {"id": user_id, "email": email})
            engine.dispose()
