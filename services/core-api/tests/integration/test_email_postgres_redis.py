"""Email flows on the single Core runtime against task-owned disposable services."""

import os
import hashlib
import asyncio
from concurrent.futures import ThreadPoolExecutor
from threading import Barrier, Event
from uuid import uuid4

import pytest


@pytest.fixture
def email_runtime(monkeypatch):
    pg = os.environ.get("KNOWI_TEST_PG_URL")
    redis = os.environ.get("KNOWI_TEST_REDIS_URL")
    if os.getenv("KNOWI_PG02_INTEGRATION") != "1" or not pg or not redis:
        pytest.skip("requires disposable PostgreSQL and Redis")
    from sqlalchemy.engine import make_url
    url = make_url(pg)
    if (url.host, url.port, url.database, url.username) != ("127.0.0.1", 57382, "pymentor_test", "pymentor_test"):
        raise ValueError("PostgreSQL is outside the task-owned disposable allowlist")
    if redis != "redis://127.0.0.1:57381/0":
        raise ValueError("Redis is outside the disposable local allowlist")

    monkeypatch.delenv("PYMENTOR_DUAL_LOCAL_TEST", raising=False)
    monkeypatch.delenv("PYMENTOR_PROFILE", raising=False)
    for key, value in {
        "DATABASE_URL": pg,
        "REDIS_URL": redis,
        "KNOWI_REDIS_PREFIX": f"pg04-email:{uuid4()}:",
        "KNOWI_LOGIN_RECOVERY_KEY": "ab" * 32,
        "PYMENTOR_EMAIL_TOKEN_SECRET": "synthetic-test-secret-at-least-32-bytes",
        "PYMENTOR_COOKIE_SECURE": "0",
    }.items():
        monkeypatch.setenv(key, value)

    from pymentor_core.app.factory import create_app
    return create_app()


def test_email_flows_with_postgres_redis(monkeypatch, email_runtime):
    from fastapi.testclient import TestClient
    app = email_runtime
    redis = os.environ["KNOWI_TEST_REDIS_URL"]
    from pymentor_core.adapters.sql import email_auth
    sent = []
    monkeypatch.setattr(email_auth, "send_account_email", lambda config, email, purpose, token, **kwargs: sent.append((email, purpose, token)))
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
            cache.delete(f'{os.environ["KNOWI_REDIS_PREFIX"]}email-rate:{digest}')
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
            cache.delete(f'{os.environ["KNOWI_REDIS_PREFIX"]}email-rate:{digest}')
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
            cache.delete(f'{os.environ["KNOWI_REDIS_PREFIX"]}email-rate:{digest}')
        finally:
            cache.close()
        assert client.post("/api/user/password-reset/request", json={"email": email}).status_code == 202
        next_token = sent[-1][2]
        store = app.state.identity_sessions.redis
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


def test_email_change_requires_both_confirmations_and_rejects_replay(monkeypatch, email_runtime):
    from fastapi.testclient import TestClient
    from pymentor_core.adapters.sql import email_auth
    sent = []
    monkeypatch.setattr(email_auth, "send_account_email", lambda config, email, purpose, token, **kwargs: sent.append((email, purpose, token)))
    old, new = f"old-{uuid4()}@example.test", f"new-{uuid4()}@example.test"
    password = "Synthetic-double-confirm-123"
    with TestClient(email_runtime) as client:
        assert client.post("/api/user/register", json={"username": "Synthetic", "email": old, "password": password}).status_code == 200
        assert client.post("/api/user/email-verification/confirm", json={"token": sent[-1][2]}).status_code == 200
        assert client.post("/api/user/login", json={"email": old, "password": password}, headers={"Idempotency-Key": str(uuid4())}).status_code == 200
        sent.clear()
        assert client.post("/api/user/email-change/request", json={"email": new}).status_code == 200
        assert {item[0] for item in sent} == {old, new}
        first = client.post("/api/user/email-change/confirm", json={"token": sent[0][2]})
        assert first.status_code == 200 and first.json()["completed"] is False
        assert client.get("/api/user/me").json()["user"]["email"] == old
        second = client.post("/api/user/email-change/confirm", json={"token": sent[1][2]})
        assert second.status_code == 200 and second.json()["completed"] is True
        user = client.get("/api/user/me").json()["user"]
        assert user["email"] == new and user["verified"] is True
        assert client.post("/api/user/email-change/confirm", json={"token": sent[0][2]}).status_code == 400
        assert client.post("/api/user/login", json={"email": old, "password": password}, headers={"Idempotency-Key": str(uuid4())}).status_code == 401
        assert client.post("/api/user/login", json={"email": new, "password": password}, headers={"Idempotency-Key": str(uuid4())}).status_code == 200
