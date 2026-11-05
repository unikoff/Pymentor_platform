"""Golden tests of the existing SQL/bcrypt/cookie auth contract (C2.1.4).

Run alone with PYTHONPATH=backend. All user data and sessions are synthetic.
The app performs schema bootstrap at import time, so force that bootstrap
to SQLite memory *before* importing any backend code.
"""

from __future__ import annotations

import asyncio
import json
import os
import sys
from dataclasses import dataclass
from datetime import datetime, timedelta
from http.cookies import SimpleCookie
from uuid import UUID

# Fail closed: neither module import nor an ASGI request may use a real database.
configured_db = os.environ.get("DATABASE_URL")
if configured_db not in (None, "sqlite://", "sqlite:///:memory:"):
    raise RuntimeError("Legacy auth tests require an in-memory SQLite DATABASE_URL")
os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ["PYTHON_DOTENV_DISABLED"] = "1"
os.environ["PYMENTOR_LOCAL_NOTIFICATIONS"] = "0"
os.environ["PYMENTOR_CAPTURE_CORE_FIXTURES"] = "0"
if "db.engine" in sys.modules:
    url = sys.modules["db.engine"].engine.url
    assert url.get_backend_name() == "sqlite" and url.database in (None, ":memory:"), (
        "Run legacy auth golden tests with an in-memory SQLite database"
    )

import bcrypt
import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from core.dependencies import get_db
from db import models
from db.engine import Base
from main import app


PASSWORD = "Synthetic-Only-Passphrase-42"
EMAIL = "legacy-student@example.test"
ADMIN_DENIED = {"detail": "Требуются права администратора"}
PUBLIC_FIELDS = {
    "id", "username", "email", "subscription_until",
    "subscription_plan", "has_active_subscription", "is_admin",
}


@dataclass
class Reply:
    status: int
    headers: list[tuple[str, str]]
    data: object

    def header(self, name: str) -> str:
        matches = [value for key, value in self.headers if key == name.lower()]
        assert len(matches) == 1, (name, matches)
        return matches[0]

    def cookie(self):
        cookies = SimpleCookie()
        cookies.load(self.header("set-cookie"))
        assert "session" in cookies
        return cookies["session"]


def call(method: str, path: str, *, body: dict | None = None,
         cookie: str | None = None, headers: dict[str, str] | None = None) -> Reply:
    """Make a real in-process ASGI request, without sharing cookie state."""
    payload = json.dumps(body).encode("utf-8") if body is not None else b""
    raw_headers = [(b"host", b"testserver"),
                   (b"content-length", str(len(payload)).encode("ascii"))]
    if body is not None:
        raw_headers.append((b"content-type", b"application/json"))
    if cookie is not None:
        raw_headers.append((b"cookie", f"session={cookie}".encode("ascii")))
    raw_headers.extend((key.lower().encode("ascii"), value.encode("utf-8"))
                       for key, value in (headers or {}).items())
    messages = []

    async def perform():
        received = False

        async def receive():
            nonlocal received
            if received:
                return {"type": "http.disconnect"}
            received = True
            return {"type": "http.request", "body": payload, "more_body": False}

        async def send(message):
            messages.append(message)

        await app({
            "type": "http", "asgi": {"version": "3.0", "spec_version": "2.4"},
            "http_version": "1.1", "method": method, "scheme": "http",
            "path": path, "raw_path": path.encode("utf-8"),
            "root_path": "", "query_string": b"",
            "headers": raw_headers, "server": ("testserver", 80),
            "client": ("127.0.0.1", 12345),
        }, receive, send)

    asyncio.run(perform())
    start = next(item for item in messages if item["type"] == "http.response.start")
    response_bytes = b"".join(item.get("body", b"") for item in messages
                              if item["type"] == "http.response.body")
    return Reply(
        start["status"],
        [(key.decode("latin-1").lower(), value.decode("latin-1"))
         for key, value in start["headers"]],
        json.loads(response_bytes) if response_bytes else None,
    )


@pytest.fixture
def memory_db(monkeypatch):
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    sessions = sessionmaker(bind=engine, autocommit=False, autoflush=False)

    def override_get_db():
        with sessions() as db:
            yield db

    monkeypatch.setitem(app.dependency_overrides, get_db, override_get_db)
    monkeypatch.setenv("PYMENTOR_COOKIE_SECURE", "0")
    try:
        yield sessions
    finally:
        engine.dispose()


def register(*, email=EMAIL, **claims):
    payload = {"username": "Synthetic Student", "email": email, "password": PASSWORD}
    payload.update(claims)
    return call("POST", "/api/user/register", body=payload)


def login(*, email=EMAIL, password=PASSWORD, **claims):
    payload = {"email": email, "password": password}
    payload.update(claims)
    return call("POST", "/api/user/login", body=payload)


def assert_user(user, *, email=EMAIL, is_admin=False):
    assert set(user) == PUBLIC_FIELDS
    assert user["email"] == email
    assert user["username"] == "Synthetic Student"
    assert user["is_admin"] is is_admin
    assert user["subscription_until"] is None
    assert user["subscription_plan"] is None
    assert user["has_active_subscription"] is False
    assert isinstance(user["id"], int) and user["id"] > 0


def test_register_persists_real_salted_bcrypt_and_rejects_duplicates(memory_db):
    response = register()
    assert response.status == 200
    assert response.data["message"] == "Registration successful"
    assert_user(response.data["user"])
    assert len(response.data) == 2
    assert not any(key in response.data["user"] for key in ("password", "password_hash"))
    with memory_db() as db:
        user = db.scalar(select(models.User).where(models.User.email == EMAIL))
        assert user is not None
        hashed = user.password
        assert hashed != PASSWORD
        assert hashed.startswith(("$2a$", "$2b$", "$2y$"))
        assert bcrypt.checkpw(PASSWORD.encode(), hashed.encode())
        assert not bcrypt.checkpw(b"wrong synthetic password", hashed.encode())
        assert user.verify_password(PASSWORD)
        assert not user.verify_password("Incorrect-Passphrase")

    second = register(email="legacy-second@example.test")
    assert second.status == 200
    with memory_db() as db:
        other_hash = db.scalar(select(models.User).where(
            models.User.email == "legacy-second@example.test"
        )).password
    assert other_hash != hashed  # freshly salted, even for an identical password
    duplicate = register()
    assert duplicate.status == 400
    assert duplicate.data == {"detail": "Email already exists"}
    with memory_db() as db:
        assert len(db.scalars(select(models.User)).all()) == 2


@pytest.mark.parametrize("secure", [False, True])
def test_login_me_and_cookie_flags_lifetime(memory_db, monkeypatch, secure):
    monkeypatch.setenv("PYMENTOR_COOKIE_SECURE", "true" if secure else "0")
    assert register().status == 200
    bad = login(password="Totally-wrong-password")
    assert bad.status == 401
    assert bad.data == {"detail": "Invalid email or password"}
    assert not any(name == "set-cookie" for name, _ in bad.headers)

    response = login()
    assert response.status == 200
    assert response.data["message"] == "Login successful"
    assert_user(response.data["user"])
    assert len(response.data) == 2
    morsel = response.cookie()
    token = morsel.value
    assert str(UUID(token, version=4)) == token
    assert int(morsel["max-age"]) == 30 * 24 * 3600
    assert morsel["httponly"] is True
    assert morsel["samesite"].lower() == "lax"
    assert morsel["path"] == "/"
    assert bool(morsel["secure"]) is secure
    assert call("GET", "/api/user/me").data == {"detail": "No session token found"}
    assert call("GET", "/api/user/me", cookie="made-up-session").data == {
        "detail": "Invalid session"
    }

    with memory_db() as db:
        stored = db.scalar(select(models.Session).where(models.Session.session_token == token))
        assert stored is not None
        assert stored.user_id == response.data["user"]["id"]

    me = call("GET", "/api/user/me", cookie=token)
    assert me.status == 200
    assert me.data == {"user": response.data["user"]}


def test_logout_revokes_only_its_session_and_clears_cookie(memory_db):
    assert register().status == 200
    first = login().cookie().value
    second = login().cookie().value
    response = call("POST", "/api/user/logout", cookie=first)
    assert response.status == 200
    assert response.data == {"message": "Logout successful"}
    morsel = response.cookie()
    assert morsel.value == ""
    assert morsel["max-age"] == "0"
    assert morsel["path"] == "/"
    assert morsel["httponly"] is True
    assert morsel["samesite"].lower() == "lax"
    assert not morsel["secure"]
    invalid = call("GET", "/api/user/me", cookie=first)
    assert invalid.status == 401 and invalid.data == {"detail": "Invalid session"}
    assert call("GET", "/api/user/me", cookie=second).status == 200
    with memory_db() as db:
        assert [row.session_token for row in db.scalars(select(models.Session)).all()] == [second]
    missing = call("POST", "/api/user/logout")
    assert missing.status == 401
    assert missing.data == {"detail": "No session token found"}


def test_fourth_login_evicts_oldest_of_three_sql_sessions(memory_db):
    user_id = register().data["user"]["id"]
    tokens = []
    for i in range(4):
        reply = login()
        assert reply.status == 200
        token = reply.cookie().value
        tokens.append(token)
        # SQLite timestamps may share a second; set distinct historical times
        # so eviction ordering is unambiguous and exercises persisted created_at.
        with memory_db() as db:
            session = db.scalar(select(models.Session).where(
                models.Session.session_token == token
            ))
            assert session is not None
            session.created_at = datetime(2020, 1, 1) + timedelta(days=i)
            db.commit()
        if i < 3:
            assert call("GET", "/api/user/me", cookie=tokens[0]).status == 200

    assert len(set(tokens)) == 4
    with memory_db() as db:
        sessions = db.scalars(select(models.Session).where(
            models.Session.user_id == user_id
        )).all()
        assert len(sessions) == 3
        assert {s.session_token for s in sessions} == set(tokens[1:])
    oldest = call("GET", "/api/user/me", cookie=tokens[0])
    assert oldest.status == 401 and oldest.data == {"detail": "Invalid session"}
    assert all(call("GET", "/api/user/me", cookie=token).status == 200
               for token in tokens[1:])


def test_client_cannot_forge_admin_role_and_student_is_forbidden(memory_db):
    created = register(
        is_admin=True, role="admin", subscription_plan="pro",
        has_active_subscription=True, subscription_until="2099-01-01",
    )
    assert created.status == 200
    assert_user(created.data["user"])
    with memory_db() as db:
        stored = db.scalar(select(models.User).where(models.User.email == EMAIL))
        assert stored.is_admin is False
    forged = login(is_admin=True, role="admin")
    assert forged.status == 200
    assert_user(forged.data["user"])
    token = forged.cookie().value
    headers = {"x-user-role": "admin", "x-is-admin": "true", "x-user-id": "1"}
    me = call("GET", "/api/user/me", cookie=token, headers=headers)
    assert me.status == 200
    assert_user(me.data["user"])
    for method, path, body in (
        ("GET", "/api/admin/overview", None),
        ("POST", "/api/admin/slots", {
            "slot_date": "2031-01-02", "start_time": "10:00",
            "duration_minutes": 60,
        }),
    ):
        denied = call(method, path, body=body, cookie=token, headers=headers)
        assert denied.status == 403
        assert denied.data == ADMIN_DENIED

    # Server-owned administrative role in SQL, with a legacy opaque SQL token.
    historical_token = "b5151fd3-6cb4-4bd5-bcac-f84f36c4a701"
    with memory_db() as db:
        admin = models.User(
            username="SQL Historical Admin", email="old-admin@example.test",
            password=PASSWORD, is_admin=True,
        )
        db.add(admin)
        db.flush()
        db.add(models.Session(user_id=admin.id, session_token=historical_token))
        db.commit()
    admin_me = call("GET", "/api/user/me", cookie=historical_token)
    assert admin_me.status == 200
    assert admin_me.data["user"]["is_admin"] is True
    assert call("GET", "/api/admin/overview", cookie=historical_token).status == 200


def test_historical_prehashed_user_and_plain_sql_session_remain_valid(memory_db):
    historical_token = "7d9fa181-10c9-41bd-922b-7331b39fcc82"
    legacy_hash = bcrypt.hashpw(PASSWORD.encode(), bcrypt.gensalt()).decode()
    with memory_db() as db:
        user = models.User(
            username="Synthetic Student", email=EMAIL,
            password=legacy_hash,
        )
        db.add(user)
        db.flush()
        user_id = user.id
        assert user.password == legacy_hash
        db.add(models.Session(user_id=user_id, session_token=historical_token))
        db.commit()
    me = call("GET", "/api/user/me", cookie=historical_token)
    assert me.status == 200
    assert me.data["user"]["id"] == user_id
    assert_user(me.data["user"])
    assert login().status == 200
    assert call("POST", "/api/user/logout", cookie=historical_token).status == 200
    revoked = call("GET", "/api/user/me", cookie=historical_token)
    assert revoked.status == 401 and revoked.data == {"detail": "Invalid session"}


def test_permission_changes_apply_to_the_next_request_without_relogin(memory_db):
    assert register().status == 200
    token = login().cookie().value
    assert call("GET", "/api/admin/overview", cookie=token).status == 403
    with memory_db() as db:
        user = db.scalar(select(models.User).where(models.User.email == EMAIL))
        user.is_admin = True
        db.commit()
    assert call("GET", "/api/admin/overview", cookie=token).status == 200
    with memory_db() as db:
        user = db.scalar(select(models.User).where(models.User.email == EMAIL))
        user.is_admin = False
        db.commit()
    denied = call("GET", "/api/admin/overview", cookie=token)
    assert denied.status == 403 and denied.data == ADMIN_DENIED
