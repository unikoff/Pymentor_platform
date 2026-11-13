"""Golden tests of the existing SQL/bcrypt/cookie auth contract (C2.1.4).

Run alone with PYTHONPATH=backend. All user data and sessions are synthetic.
The app performs schema bootstrap at import time, so force that bootstrap
to SQLite memory *before* importing any backend code.
"""

from __future__ import annotations

import asyncio
import json
import os
import socketserver
import sys
import threading
from dataclasses import dataclass
from datetime import datetime
from datetime import timedelta, timezone
from email import policy
from email.parser import BytesParser
from http.cookies import SimpleCookie
from urllib.parse import parse_qs, urlsplit
from uuid import UUID

# Fail closed: neither module import nor an ASGI request may use a real database.
configured_db = os.environ.get("DATABASE_URL")
if configured_db not in (None, "sqlite://", "sqlite:///:memory:"):
    raise RuntimeError("Legacy auth tests require an in-memory SQLite DATABASE_URL")
os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ["PYTHON_DOTENV_DISABLED"] = "1"
os.environ["PYMENTOR_LOCAL_NOTIFICATIONS"] = "0"
os.environ["PYMENTOR_CAPTURE_CORE_FIXTURES"] = "0"
if 'pymentor_core.app.database' in sys.modules:
    url = sys.modules['pymentor_core.app.database'].engine.url
    assert url.get_backend_name() == "sqlite" and url.database in (None, ":memory:"), (
        "Run legacy auth golden tests with an in-memory SQLite database"
    )

import bcrypt
import pytest
from sqlalchemy import create_engine
from sqlalchemy import select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from pymentor_core.app.dependencies import get_db
from pymentor_core.adapters.sql import models
from pymentor_core.app.database import Base
from main import app


PASSWORD = "Synthetic-Only-Passphrase-42"
EMAIL = "legacy-student@example.test"
ADMIN_DENIED = {"detail": "Требуются права администратора"}
PUBLIC_FIELDS = {
    "id", "username", "email", "subscription_until",
    "subscription_plan", "has_active_subscription", "is_admin", "verified",
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
    assert user["verified"] is False
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


def test_passwords_over_bcrypt_byte_limit_are_validation_errors(memory_db):
    assert register(password="я" * 37).status == 422
    assert login(password="a" * 73).status == 422


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


def test_account_email_requests_require_authentication(memory_db):
    verify = call("POST", "/api/user/email-verification/request")
    change = call("POST", "/api/user/password-change/request")
    assert verify.status == 401
    assert change.status == 401


def test_unverified_and_unknown_email_have_the_same_recovery_reply(memory_db):
    assert register().status == 200
    unverified = call("POST", "/api/user/password-reset/request", body={"email": EMAIL})
    unknown = call("POST", "/api/user/password-reset/request", body={"email": "missing@example.test"})
    assert unverified.status == unknown.status == 202
    assert unverified.data == unknown.data


@pytest.fixture
def captured_account_email(monkeypatch):
    from pymentor_core.adapters.sql import email_auth
    from pymentor_core.modules.identity.api import email_actions

    sent = []
    monkeypatch.setenv("PYMENTOR_EMAIL_TOKEN_SECRET", "synthetic-only-secret-at-least-32-bytes")
    monkeypatch.setattr(email_actions, "_allowed", lambda *_args: True)
    monkeypatch.setattr(email_auth, "send_account_email", lambda config, recipient, purpose, token, **kwargs: sent.append((recipient, purpose, token)))
    return sent


@pytest.mark.parametrize("first_side", ["old", "new"])
def test_profile_name_and_email_change_flow(memory_db, captured_account_email, first_side):
    from pymentor_core.modules.identity.email_tokens import EmailTokens
    assert call("GET", "/api/user/email-change/capabilities").data == {"confirmations_required": 2}
    assert register().status == 200
    session = login().cookie().value
    assert call("PATCH", "/api/user/profile", body={"username": "  Новое имя  "}, cookie=session).data["user"]["username"] == "Новое имя"
    assert call("PATCH", "/api/user/profile", body={"username": "  "}, cookie=session).status == 422
    assert call("POST", "/api/user/email-change/request", body={"email": "next@example.test"}, cookie=session).status == 403
    with memory_db() as db:
        user = db.scalar(select(models.User).where(models.User.email == EMAIL))
        user.verified = True
        db.commit()
        reset_token = EmailTokens("synthetic-only-secret-at-least-32-bytes").issue("reset_password", user.id, user.email, user.password)
    assert call("POST", "/api/user/email-change/request", body={"email": "not-an-email"}, cookie=session).status == 422
    requested = call("POST", "/api/user/email-change/request", body={"email": "next@example.test"}, cookie=session)
    assert requested.status == 200
    old_recipient, purpose, old_token = captured_account_email[-2]
    new_recipient, new_purpose, new_token = captured_account_email[-1]
    assert (old_recipient, purpose) == (EMAIL, "change_email_dual")
    assert (new_recipient, new_purpose) == ("next@example.test", "change_email_dual")
    assert EmailTokens("synthetic-only-secret-at-least-32-bytes").read(old_token, "change_email") is None
    first, second = (old_token, new_token) if first_side == "old" else (new_token, old_token)
    assert call("GET", "/api/user/me", cookie=session).data["user"]["email"] == EMAIL
    confirmed = call("POST", "/api/user/email-change/confirm", body={"token": first})
    assert confirmed.status == 200 and confirmed.data["completed"] is False
    after_first = call("GET", "/api/user/me", cookie=session).data["user"]
    assert after_first["email"] == EMAIL and after_first["verified"] is True
    repeated = call("POST", "/api/user/email-change/confirm", body={"token": first})
    assert repeated.status == 200 and repeated.data["completed"] is False
    assert call("POST", "/api/user/email-change/confirm", body={"token": second}).data["completed"] is True
    after = call("GET", "/api/user/me", cookie=session).data["user"]
    assert after["email"] == "next@example.test" and after["verified"] is True
    assert call("POST", "/api/user/password-reset/confirm", body={"token": reset_token, "new_password": "Synthetic-new-password-42"}).status == 400
    assert call("POST", "/api/user/email-change/confirm", body={"token": second}).status == 400


@pytest.mark.parametrize("failure_side", ["old", "new"])
def test_email_change_conflicts_and_verification_delivery_error(memory_db, captured_account_email, monkeypatch, failure_side):
    from pymentor_core.adapters.sql import email_auth
    assert register().status == 200
    assert register(email="occupied@example.test").status == 200
    session = login().cookie().value
    with memory_db() as db:
        user = db.scalar(select(models.User).where(models.User.email == EMAIL))
        user.verified = True
        db.commit()
    assert call("POST", "/api/user/email-change/request", body={"email": "OCCUPIED@example.test"}, cookie=session).status == 409
    def fail_second(config, recipient, purpose, token, **kwargs):
        if recipient == (EMAIL if failure_side == "old" else "new@example.test"):
            raise OSError("synthetic SMTP failure")
        captured_account_email.append((recipient, purpose, token))
    monkeypatch.setattr(email_auth, "send_account_email", fail_second)
    result = call("POST", "/api/user/email-change/request", body={"email": "new@example.test"}, cookie=session)
    assert result.status == 503
    if failure_side == "new":
        token = captured_account_email[-1][2]
        assert call("POST", "/api/user/email-change/confirm", body={"token": token}).status == 409
    current = call("GET", "/api/user/me", cookie=session).data["user"]
    assert current["email"] == EMAIL and current["verified"] is True


def test_email_change_replay_after_return_and_revoked_confirmation(memory_db, captured_account_email):
    from pymentor_core.modules.identity.email_tokens import EmailTokens
    secret = "synthetic-only-secret-at-least-32-bytes"
    assert register().status == 200
    session = login().cookie().value
    with memory_db() as db:
        user = db.scalar(select(models.User).where(models.User.email == EMAIL))
        user.verified = True
        db.commit()
        stale = EmailTokens(secret).issue("change_email", user.id, user.email, user.password, new_email="stale@example.test")
        user.verified = False
        db.commit()
    assert call("POST", "/api/user/email-change/confirm", body={"token": stale}).status == 400
    with memory_db() as db:
        user = db.scalar(select(models.User).where(models.User.email == EMAIL))
        user.verified = True
        db.commit()
    assert call("POST", "/api/user/email-change/request", body={"email": "next@example.test"}, cookie=session).status == 200
    old_token, new_token = captured_account_email[-2][2], captured_account_email[-1][2]
    assert call("POST", "/api/user/email-change/confirm", body={"token": old_token}).data["completed"] is False
    assert call("POST", "/api/user/email-change/confirm", body={"token": new_token}).data["completed"] is True
    with memory_db() as db:
        user = db.scalar(select(models.User).where(models.User.email == "next@example.test"))
        user.email, user.verified = EMAIL, True
        db.commit()
    assert call("POST", "/api/user/email-change/confirm", body={"token": old_token}).status == 400


def test_email_change_address_taken_after_request(memory_db, captured_account_email):
    assert register().status == 200
    session = login().cookie().value
    with memory_db() as db:
        user = db.scalar(select(models.User).where(models.User.email == EMAIL))
        user.verified = True
        db.commit()
    assert call("POST", "/api/user/email-change/request", body={"email": "new@example.test"}, cookie=session).status == 200
    old_token, new_token = captured_account_email[-2][2], captured_account_email[-1][2]
    assert register(email="new@example.test").status == 200
    assert call("POST", "/api/user/email-change/confirm", body={"token": old_token}).data["completed"] is False
    assert call("POST", "/api/user/email-change/confirm", body={"token": new_token}).status == 400
    assert call("GET", "/api/user/me", cookie=session).data["user"]["email"] == EMAIL


def test_email_change_proofs_cannot_be_mixed_between_requests(memory_db, captured_account_email):
    assert register().status == 200
    session = login().cookie().value
    with memory_db() as db:
        user = db.scalar(select(models.User).where(models.User.email == EMAIL))
        user.verified = True
        db.commit()
    assert call("POST", "/api/user/email-change/request", body={"email": "first@example.test"}, cookie=session).status == 200
    first_old, first_new = captured_account_email[-2][2], captured_account_email[-1][2]
    assert call("POST", "/api/user/email-change/request", body={"email": "second@example.test"}, cookie=session).status == 200
    second_new = captured_account_email[-1][2]
    assert call("POST", "/api/user/email-change/confirm", body={"token": first_old}).data["completed"] is False
    assert call("POST", "/api/user/email-change/confirm", body={"token": second_new}).data["completed"] is False
    assert call("GET", "/api/user/me", cookie=session).data["user"]["email"] == EMAIL
    assert call("POST", "/api/user/email-change/confirm", body={"token": first_new}).data["completed"] is True
    assert call("GET", "/api/user/me", cookie=session).data["user"]["email"] == "first@example.test"
    assert call("POST", "/api/user/email-change/confirm", body={"token": second_new}).status == 400


def test_email_change_expired_request_keeps_original_address(memory_db, captured_account_email):
    assert register().status == 200
    session = login().cookie().value
    with memory_db() as db:
        user = db.scalar(select(models.User).where(models.User.email == EMAIL))
        user.verified = True
        db.commit()
    assert call("POST", "/api/user/email-change/request", body={"email": "new@example.test"}, cookie=session).status == 200
    token = captured_account_email[-1][2]
    with memory_db() as db:
        pending = db.scalar(select(models.EmailChangeRequest))
        pending.expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)
        db.commit()
    assert call("POST", "/api/user/email-change/confirm", body={"token": token}).status == 400
    assert call("GET", "/api/user/me", cookie=session).data["user"]["email"] == EMAIL


def test_registration_sends_verification_once_after_account_is_created(memory_db, captured_account_email):
    response = register()
    assert response.status == 200 and response.data["user"]["verified"] is False
    assert len(captured_account_email) == 1
    recipient, purpose, token = captured_account_email[0]
    assert (recipient, purpose) == (EMAIL, "verify_email")
    assert call("POST", "/api/user/email-verification/confirm", body={"token": token}).status == 200
    assert login().data["user"]["verified"] is True
    assert register().status == 400
    assert len(captured_account_email) == 1


def test_registration_survives_email_delivery_failure_and_can_resend(memory_db, captured_account_email, monkeypatch):
    from pymentor_core.adapters.sql import email_auth

    def unavailable(*_args, **_kwargs):
        raise OSError("synthetic SMTP failure")

    monkeypatch.setattr(email_auth, "send_account_email", unavailable)
    assert register().status == 200
    session = login().cookie().value
    assert call("GET", "/api/user/me", cookie=session).data["user"]["verified"] is False
    monkeypatch.setattr(email_auth, "send_account_email", lambda config, recipient, purpose, token: captured_account_email.append((recipient, purpose, token)))
    assert call("POST", "/api/user/email-verification/request", cookie=session).status == 200
    assert captured_account_email[0][:2] == (EMAIL, "verify_email")


def test_verify_then_recover_password_invalidates_all_sessions(memory_db, captured_account_email):
    assert register().status == 200
    first = login().cookie().value
    second = login().cookie().value
    request = call("POST", "/api/user/email-verification/request", cookie=first)
    assert request.status == 200
    recipient, purpose, verification_token = captured_account_email.pop()
    assert (recipient, purpose) == (EMAIL, "verify_email")
    assert call("GET", "/api/user/email-verification/confirm").status != 200
    reply = call("POST", "/api/user/email-verification/confirm", cookie=first, body={"token": verification_token})
    assert reply.status == 200
    assert call("GET", "/api/user/me", cookie=first).data["user"]["verified"] is True
    reply = call("POST", "/api/user/password-reset/request", body={"email": EMAIL})
    assert reply.status == 202
    recipient, purpose, reset_token = captured_account_email.pop()
    assert (recipient, purpose) == (EMAIL, "reset_password")
    new_password = "Another-safe-passphrase-43"
    changed = call("POST", "/api/user/password-reset/confirm", body={"token": reset_token, "new_password": new_password})
    assert changed.status == 200
    assert call("GET", "/api/user/me", cookie=first).status == 401
    assert call("GET", "/api/user/me", cookie=second).status == 401
    assert login(password=PASSWORD).status == 401
    assert login(password=new_password).status == 200
    assert call("POST", "/api/user/password-reset/confirm", body={"token": reset_token, "new_password": new_password}).status == 400


def test_unverified_user_cannot_request_password_change_or_recovery(memory_db, captured_account_email):
    assert register().status == 200
    assert captured_account_email.pop()[1] == "verify_email"
    session = login().cookie().value
    assert call("POST", "/api/user/password-reset/request", body={"email": EMAIL}).status == 202
    assert captured_account_email == []
    assert call("POST", "/api/user/password-change/request", cookie=session).status == 403
    assert captured_account_email == []
    assert login(password=PASSWORD).data["user"]["verified"] is False


def test_change_password_preserves_current_session_and_verification(memory_db, captured_account_email):
    assert register().status == 200
    first = login().cookie().value
    second = login().cookie().value
    assert call("POST", "/api/user/email-verification/request", cookie=first).status == 200
    assert call("POST", "/api/user/email-verification/confirm", body={"token": captured_account_email.pop()[2]}).status == 200
    assert call("POST", "/api/user/password-change/request", cookie=first).status == 200
    token = captured_account_email.pop()[2]
    assert call("POST", "/api/user/password-reset/confirm", cookie=first, body={"token": token, "new_password": "New-safe-passphrase-43"}).status == 200
    me = call("GET", "/api/user/me", cookie=first)
    assert me.status == 200 and me.data["user"]["verified"] is True
    assert call("GET", "/api/user/me", cookie=second).status == 401
    assert login(password=PASSWORD).status == 401
    assert login(password="New-safe-passphrase-43").status == 200


def test_change_password_never_preserves_a_different_users_session_for_the_owner(memory_db, captured_account_email):
    assert register().status == 200
    owner_session = login().cookie().value
    verification_token = captured_account_email.pop()[2]
    assert call("POST", "/api/user/email-verification/confirm", body={"token": verification_token}).status == 200
    assert call("POST", "/api/user/password-change/request", cookie=owner_session).status == 200
    token = captured_account_email.pop()[2]
    assert register(email="other@example.test").status == 200
    other_session = login(email="other@example.test").cookie().value
    assert call("POST", "/api/user/password-reset/confirm", cookie=other_session, body={"token": token, "new_password": "New-safe-passphrase-43"}).status == 200
    assert call("GET", "/api/user/me", cookie=owner_session).status == 401
    assert call("GET", "/api/user/me", cookie=other_session).status == 200


def test_reset_password_preserves_the_current_session_when_it_belongs_to_owner(memory_db, captured_account_email):
    assert register().status == 200
    current = login().cookie().value
    other = login().cookie().value
    assert call("POST", "/api/user/email-verification/request", cookie=current).status == 200
    assert call("POST", "/api/user/email-verification/confirm", body={"token": captured_account_email.pop()[2]}).status == 200
    assert call("POST", "/api/user/password-reset/request", body={"email": EMAIL}).status == 202
    token = captured_account_email.pop()[2]
    assert call("POST", "/api/user/password-reset/confirm", cookie=current, body={"token": token, "new_password": "New-safe-passphrase-43"}).status == 200
    assert call("GET", "/api/user/me", cookie=current).data["user"]["verified"] is True
    assert call("GET", "/api/user/me", cookie=other).status == 401


@pytest.mark.parametrize("purpose", ["password-reset", "password-change"])
def test_password_link_stops_working_if_email_is_no_longer_verified(memory_db, captured_account_email, purpose):
    assert register().status == 200
    with memory_db() as db:
        user = db.scalar(select(models.User).where(models.User.email == EMAIL))
        user.verified = True
        db.commit()
    if purpose == "password-reset":
        assert call("POST", "/api/user/password-reset/request", body={"email": EMAIL}).status == 202
    else:
        session = login().cookie().value
        assert call("POST", "/api/user/password-change/request", cookie=session).status == 200
    token = captured_account_email.pop()[2]
    with memory_db() as db:
        user = db.scalar(select(models.User).where(models.User.email == EMAIL))
        user.verified = False
        db.commit()
    assert call("POST", "/api/user/password-reset/confirm", body={"token": token, "new_password": "Another-safe-passphrase-43"}).status == 400
    assert login(password=PASSWORD).status == 200


def test_verification_link_confirms_its_owner_without_a_session(memory_db, captured_account_email):
    assert register().status == 200
    session = login().cookie().value
    assert call("POST", "/api/user/email-verification/request", cookie=session).status == 200
    token = captured_account_email.pop()[2]
    assert call("POST", "/api/user/email-verification/confirm", body={"token": token}).status == 200
    assert call("GET", "/api/user/me", cookie=session).data["user"]["verified"] is True
    assert call("POST", "/api/user/email-verification/confirm", body={"token": "invalid"}).status == 400


def test_verification_link_confirms_its_owner_not_another_logged_in_user(memory_db, captured_account_email):
    assert register().status == 200
    first = login().cookie().value
    assert call("POST", "/api/user/email-verification/request", cookie=first).status == 200
    token = captured_account_email.pop()[2]
    assert register(email="other@example.test").status == 200
    second = login(email="other@example.test").cookie().value
    assert call("POST", "/api/user/email-verification/confirm", cookie=second, body={"token": token}).status == 200
    assert call("GET", "/api/user/me", cookie=first).data["user"]["verified"] is True
    assert call("GET", "/api/user/me", cookie=second).data["user"]["verified"] is False


def test_verification_link_fails_if_account_email_changed(memory_db, captured_account_email):
    assert register().status == 200
    session = login().cookie().value
    assert call("POST", "/api/user/email-verification/request", cookie=session).status == 200
    token = captured_account_email.pop()[2]
    with memory_db() as db:
        user = db.scalar(select(models.User).where(models.User.email == EMAIL))
        user.email = "changed@example.test"
        db.commit()
    assert call("POST", "/api/user/email-verification/confirm", body={"token": token}).status == 400
    assert call("GET", "/api/user/me", cookie=session).data["user"]["verified"] is False


def test_email_request_limits_do_not_block_other_people_on_same_network(monkeypatch):
    from pymentor_core.modules.identity.api import email_actions

    monkeypatch.setattr(email_actions, "_attempts", {})
    monkeypatch.setattr(email_actions.time, "monotonic", lambda: 1000.0)
    assert all(email_actions._allowed("reset-ip", "synthetic-ip") for _ in range(20))
    assert not email_actions._allowed("reset-ip", "synthetic-ip")
    assert email_actions._allowed("reset-email", "student@example.test")
    assert not email_actions._allowed("reset-email", "student@example.test")
    assert email_actions._allowed("reset-email", "other@example.test")


def test_postgres_email_limit_uses_shared_store_without_raw_address():
    import anyio
    from types import SimpleNamespace
    from pymentor_core.modules.identity.api import email_actions

    calls = []
    class FakeStore:
        async def allow_email_request(self, digest, limit):
            calls.append((digest, limit))
            return True
    request = SimpleNamespace(app=SimpleNamespace(state=SimpleNamespace(
        profile="postgres_redis", local_async_identity=SimpleNamespace(redis=FakeStore())
    )))
    check = getattr(email_actions, "_request_allowed", None)
    assert callable(check)
    async def run():
        return await anyio.to_thread.run_sync(check, request, "reset-email", "private@example.test")
    assert anyio.run(run) is True
    assert len(calls) == 1 and len(calls[0][0]) == 64 and calls[0][1] == 1
    assert "private@example.test" not in calls[0][0]


def test_synthetic_account_flow_delivers_real_local_smtp_messages(memory_db, monkeypatch):
    from pymentor_core.modules.identity.api import email_actions

    messages = []
    class Sink(socketserver.StreamRequestHandler):
        def handle(self):
            self.wfile.write(b"220 local test SMTP\r\n")
            data_mode = False
            lines = []
            while line := self.rfile.readline():
                if data_mode:
                    if line == b".\r\n":
                        messages.append(BytesParser(policy=policy.default).parsebytes(b"".join(lines)))
                        data_mode = False
                        self.wfile.write(b"250 accepted\r\n")
                    else:
                        lines.append(line)
                elif line.upper().startswith((b"EHLO", b"HELO")):
                    self.wfile.write(b"250-localhost\r\n250 HELP\r\n")
                elif line.upper().startswith(b"DATA"):
                    data_mode = True
                    self.wfile.write(b"354 send data\r\n")
                elif line.upper().startswith(b"QUIT"):
                    self.wfile.write(b"221 bye\r\n")
                    break
                else:
                    self.wfile.write(b"250 ok\r\n")
                self.wfile.flush()

    def token_from_message(message):
        plain = message.get_body(preferencelist=("plain",)).get_content()
        link = next(line for line in plain.splitlines() if line.startswith("http://"))
        return parse_qs(urlsplit(link).fragment)["token"][0]

    monkeypatch.setattr(email_actions, "_attempts", {})
    monkeypatch.setenv("PYMENTOR_EMAIL_TOKEN_SECRET", "synthetic-only-secret-at-least-32-bytes")
    monkeypatch.setenv("PYMENTOR_EMAIL_PUBLIC_URL", "http://127.0.0.1:5173/backend")
    monkeypatch.setenv("PYMENTOR_SMTP_HOST", "127.0.0.1")
    monkeypatch.setenv("PYMENTOR_SMTP_FROM", "robot@example.test")
    monkeypatch.setenv("PYMENTOR_SMTP_STARTTLS", "0")
    monkeypatch.delenv("PYMENTOR_SMTP_USERNAME", raising=False)
    monkeypatch.delenv("PYMENTOR_SMTP_PASSWORD", raising=False)
    with socketserver.TCPServer(("127.0.0.1", 0), Sink) as server:
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        monkeypatch.setenv("PYMENTOR_SMTP_PORT", str(server.server_address[1]))
        try:
            assert register().status == 200
            assert len(messages) == 1
            assert messages[0]["To"] == EMAIL
            token = token_from_message(messages[0])
            session = login().cookie().value
            assert call("POST", "/api/user/email-verification/confirm", cookie=session, body={"token": token}).status == 200
            assert call("POST", "/api/user/password-reset/request", body={"email": EMAIL}).status == 202
            token = token_from_message(messages[-1])
            assert call("POST", "/api/user/password-reset/confirm", body={"token": token, "new_password": "Another-safe-passphrase-43"}).status == 200
            assert login(password="Another-safe-passphrase-43").status == 200
            assert len(messages) == 2
        finally:
            server.shutdown()
            thread.join(timeout=5)


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
        is_admin=True, verified=True, role="admin", subscription_plan="pro",
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
