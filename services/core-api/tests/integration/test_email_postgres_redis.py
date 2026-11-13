"""Email flows on the opt-in disposable PostgreSQL/Redis Core profile.

Run in a fresh process with PYMENTOR_TEST_PG_URL and PYMENTOR_TEST_REDIS_URL.
The existing dual-local factory enforces the database allowlist and schema revision.
"""

import os
import hashlib
import asyncio
from concurrent.futures import ThreadPoolExecutor
from threading import Barrier, Event
from uuid import uuid4

import pytest


def test_email_flows_with_postgres_redis(monkeypatch):
    pg = os.environ.get("PYMENTOR_TEST_PG_URL")
    redis = os.environ.get("PYMENTOR_TEST_REDIS_URL")
    if not pg or not redis:
        pytest.skip("requires disposable PostgreSQL and Redis")
    if redis != "redis://127.0.0.1:57146/0":
        raise ValueError("Redis is outside the disposable local allowlist")

    for key, value in {
        "PYMENTOR_DUAL_LOCAL_TEST": "1",
        "PYMENTOR_TEST_REDIS_PREFIX": f"pymentor-c216-test:{uuid4()}:",
        "PYMENTOR_TEST_LOGIN_RECOVERY_KEY": "ab" * 32,
        "PYMENTOR_EMAIL_TOKEN_SECRET": "synthetic-test-secret-at-least-32-bytes",
        "PYMENTOR_COOKIE_SECURE": "0",
    }.items():
        monkeypatch.setenv(key, value)

    from fastapi.testclient import TestClient
    from tools.lab.dual_local import create_app
    app = create_app()
    from pymentor_core.adapters.sql import email_auth
    sent = []
    monkeypatch.setattr(email_auth, "send_account_email", lambda config, email, purpose, token: sent.append((email, purpose, token)))
    email = f"email-sprint-{uuid4()}@example.test"
    initial = "Synthetic-old-password-123"
    updated = "Synthetic-new-password-456"

    with TestClient(app) as client:
        def login(password):
            # Avoid simultaneous host-scoped and domainless cookies after explicit
            # cookie swaps in this test; the server must receive exactly one session.
            client.cookies.clear()
            return client.post("/api/user/login", json={"email": email, "password": password}, headers={"Idempotency-Key": str(uuid4())})

        registered = client.post("/api/user/register", json={"username": "Synthetic", "email": email, "password": initial})
        assert registered.status_code == 200, registered.text
        assert registered.json()["user"]["verified"] is False
        assert sent[-1][:2] == (email, "verify_email")
        sent.clear()
        assert client.post("/api/user/password-reset/request", json={"email": email}).status_code == 202
        assert sent == []
        signed_in = login(initial)
        assert signed_in.status_code == 200, signed_in.text
        original_cookie = client.cookies.get("session")
        assert signed_in.json()["user"]["verified"] is False
        assert client.post("/api/user/password-change/request").status_code == 403
        assert sent == []
        assert login(initial).status_code == 200
        second_cookie = client.cookies.get("session")
        assert second_cookie != original_cookie
        verify = client.post("/api/user/email-verification/request")
        assert verify.status_code == 200, verify.text
        assert sent[-1][:2] == (email, "verify_email")
        response = client.post("/api/user/email-verification/confirm", json={"token": sent[-1][2]})
        assert response.status_code == 200, response.text
        assert client.get("/api/user/me").json()["user"]["verified"] is True
        reset = client.post("/api/user/password-reset/request", json={"email": email})
        # The earlier request is rate-limited; verification does not bypass that limit.
        assert reset.status_code == 202
        assert sent[-1][1] == "verify_email"
        change = client.post("/api/user/password-change/request")
        assert change.status_code == 200, change.text
        assert sent[-1][:2] == (email, "change_password")
        token = sent[-1][2]
        changed = client.post("/api/user/password-reset/confirm", json={"token": token, "new_password": updated})
        assert changed.status_code == 200, changed.text
        current = client.get("/api/user/me")
        assert current.status_code == 200 and current.json()["user"]["verified"] is True
        client.cookies.set("session", original_cookie)
        assert client.get("/api/user/me").status_code == 401
        client.cookies.set("session", second_cookie)
        assert client.post("/api/user/password-reset/confirm", json={"token": token, "new_password": initial}).status_code == 400
        assert login(initial).status_code == 401
        assert login(updated).status_code == 200
        client.cookies.set("session", original_cookie)
        assert client.get("/api/user/me").status_code == 401
        assert login(updated).status_code == 200
        # Expire only this synthetic user's request limit to represent a new minute.
        from redis import Redis
        digest = hashlib.sha256(("reset-email\0" + email).encode()).hexdigest()
        cache = Redis.from_url(redis)
        try:
            cache.delete(f'{os.environ["PYMENTOR_TEST_REDIS_PREFIX"]}email-rate:{digest}')
        finally:
            cache.close()
        reset = client.post("/api/user/password-reset/request", json={"email": email})
        assert reset.status_code == 202
        assert sent[-1][:2] == (email, "reset_password")
        final = "Synthetic-final-password-789"
        response = client.post("/api/user/password-reset/confirm", json={"token": sent[-1][2], "new_password": final})
        assert response.status_code == 200, response.text
        assert client.get("/api/user/me").status_code == 200
        assert login(updated).status_code == 401
        assert login(final).status_code == 200
        cache = Redis.from_url(redis)
        try:
            cache.delete(f'{os.environ["PYMENTOR_TEST_REDIS_PREFIX"]}email-rate:{digest}')
        finally:
            cache.close()
        assert client.post("/api/user/password-reset/request", json={"email": email}).status_code == 202
        reset_token = sent[-1][2]
        assert sent[-1][1] == "reset_password"
        from pymentor_core.app.database import SessionLocal
        barrier = Barrier(2)

        def attempt(password):
            with SessionLocal() as db:
                barrier.wait(timeout=5)
                return email_auth.confirm_password(db, reset_token, password)

        candidates = ["Synthetic-race-password-1", "Synthetic-race-password-2"]
        with ThreadPoolExecutor(max_workers=2) as executor:
            results = list(executor.map(attempt, candidates))
        assert sorted(results) == [False, True]
        assert client.get("/api/user/me").status_code == 401
        winning_password = candidates[results.index(True)]
        cache = Redis.from_url(redis)
        try:
            cache.delete(f'{os.environ["PYMENTOR_TEST_REDIS_PREFIX"]}email-rate:{digest}')
        finally:
            cache.close()
        assert client.post("/api/user/password-reset/request", json={"email": email}).status_code == 202
        next_token = sent[-1][2]
        store = app.state.local_async_identity.redis
        original_add = store.add_user_sessions
        reserved, release = Event(), Event()

        async def hold_projection(*args, **kwargs):
            reserved.set()
            if not await asyncio.to_thread(release.wait, 10):
                raise TimeoutError("test login was not released")
            return await original_add(*args, **kwargs)

        monkeypatch.setattr(store, "add_user_sessions", hold_projection)
        with ThreadPoolExecutor(max_workers=1) as executor:
            pending_login = executor.submit(login, winning_password)
            try:
                assert reserved.wait(10), "login did not reach its reserved operation"
                changed = client.post("/api/user/password-reset/confirm", json={"token": next_token, "new_password": "Synthetic-after-race-123"})
                assert changed.status_code == 200, changed.text
            finally:
                release.set()
            assert pending_login.result(timeout=10).status_code == 401
