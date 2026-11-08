from __future__ import annotations

import asyncio
import json
import os
from datetime import datetime, timezone
from unittest import TestCase
from unittest.mock import patch

from fastapi import FastAPI
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from core.dependencies import get_db
from core.web import configure_web
from db import models
from db.engine import Base
from notifications.delivery import drain_notifications
from notifications.telegram import TelegramDeliveryError
from routers.admin.router import admin_router
from routers.landings import service as landing_service
from routers.landings.public import router as public_landing_router


async def _request(
    app, method: str, path, *, payload=None, cookie: str | None = None, extra_headers=None,
    include_content_length: bool = True,
):
    body = json.dumps(payload).encode("utf-8") if payload is not None else b""
    headers = [(b"host", b"testserver")]
    if include_content_length:
        headers.append((b"content-length", str(len(body)).encode()))
    if payload is not None:
        headers.append((b"content-type", b"application/json"))
    if cookie:
        headers.append((b"cookie", cookie.encode("latin-1")))
    if extra_headers:
        headers.extend((name.lower().encode("latin-1"), value.encode("latin-1")) for name, value in extra_headers.items())
    messages = []
    delivered = False

    async def receive():
        nonlocal delivered
        if delivered:
            return {"type": "http.request", "body": b"", "more_body": False}
        delivered = True
        return {"type": "http.request", "body": body, "more_body": False}

    async def send(message):
        messages.append(message)

    await app(
        {"type": "http", "asgi": {"version": "3.0", "spec_version": "2.3"},
         "http_version": "1.1", "method": method, "scheme": "http", "path": path,
         "raw_path": path.encode(), "query_string": b"", "headers": headers,
         "server": ("testserver", 80), "client": ("127.0.0.1", 12345)},
        receive,
        send,
    )
    start = next(message for message in messages if message["type"] == "http.response.start")
    response_body = b"".join(
        message.get("body", b"") for message in messages if message["type"] == "http.response.body"
    )
    return start["status"], json.loads(response_body) if response_body else None


class LandingAdminRouteTests(TestCase):
    def setUp(self) -> None:
        self.engine = create_engine(
            "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
        )
        Base.metadata.create_all(self.engine)
        self.sessions = sessionmaker(bind=self.engine)
        with self.sessions() as db:
            admin = models.User(username="Admin", email="admin@example.test", _password_hash="hash", is_admin=True)
            student = models.User(username="Student", email="student@example.test", _password_hash="hash")
            db.add_all([admin, student])
            db.flush()
            self.admin_id = admin.id
            self.student_id = student.id
            db.add_all([
                models.Session(user_id=admin.id, session_token="admin-session", created_at=datetime.now(timezone.utc)),
                models.Session(user_id=student.id, session_token="student-session", created_at=datetime.now(timezone.utc)),
            ])
            db.commit()
        self.app = FastAPI()
        configure_web(self.app)
        self.app.include_router(admin_router, prefix="/api/admin")
        self.app.include_router(public_landing_router, prefix="/api/landings")

        def override_get_db():
            with self.sessions() as db:
                yield db

        self.app.dependency_overrides[get_db] = override_get_db

    def tearDown(self) -> None:
        self.app.dependency_overrides.clear()
        Base.metadata.drop_all(self.engine)
        self.engine.dispose()

    def test_landing_configuration_requires_admin_authorization(self) -> None:
        anonymous_status, _ = asyncio.run(_request(self.app, "GET", "/api/admin/landings"))
        student_status, _ = asyncio.run(
            _request(self.app, "GET", "/api/admin/landings", cookie="session=student-session")
        )

        self.assertEqual(anonymous_status, 401)
        self.assertEqual(student_status, 403)

    def test_bot_configuration_uses_external_secret_ref_and_never_returns_token(self) -> None:
        created_status, created = asyncio.run(
            _request(
                self.app,
                "POST",
                "/api/admin/landings",
                payload={"slug": "backend", "title": "Pymentor", "description": "Основной лендинг"},
                cookie="session=admin-session",
            )
        )
        self.assertEqual(created_status, 201)

        with patch.dict(
            os.environ,
            {"PYMENTOR_LANDING_BOT_CREDENTIALS": json.dumps({"backend-bot-v1": "never-return-this-token"})},
        ), patch("routers.landings.admin.verify_telegram_destination", return_value="pymentor_bot"):
            configured_status, configured = asyncio.run(
                _request(
                    self.app,
                    "PUT",
                    f"/api/admin/landings/{created['id']}/telegram",
                    payload={"secret_ref": "backend-bot-v1", "chat_id": "12345"},
                    cookie="session=admin-session",
                )
            )

        self.assertEqual(configured_status, 200)
        self.assertEqual(configured["bot_username"], "pymentor_bot")
        self.assertNotIn("never-return-this-token", json.dumps(configured))

    def test_bot_verification_does_not_hold_database_connection(self) -> None:
        created_status, created = asyncio.run(
            _request(self.app, "POST", "/api/admin/landings",
                     payload={"slug": "verify-release", "title": "Test", "description": ""},
                     cookie="session=admin-session")
        )
        self.assertEqual(created_status, 201)
        checked_out = 0
        calls = 0

        def checkout(*_args):
            nonlocal checked_out
            checked_out += 1

        def checkin(*_args):
            nonlocal checked_out
            checked_out -= 1

        def verify(_token, _chat_id):
            nonlocal calls
            calls += 1
            self.assertEqual(checked_out, 0, "Telegram check must not hold a DB connection")
            return "synthetic_bot"

        event.listen(self.engine, "checkout", checkout)
        event.listen(self.engine, "checkin", checkin)
        try:
            with patch.dict(os.environ, {"PYMENTOR_LANDING_BOT_CREDENTIALS": json.dumps({"test-ref": "test-token"})}), \
                    patch("routers.landings.admin.verify_telegram_destination", side_effect=verify):
                status_code, config = asyncio.run(
                    _request(self.app, "PUT", f"/api/admin/landings/{created['id']}/telegram",
                             payload={"secret_ref": "test-ref", "chat_id": "12345"},
                             cookie="session=admin-session")
                )
            self.assertEqual(status_code, 200)
            self.assertEqual(config["bot_username"], "synthetic_bot")
            self.assertEqual(calls, 1)
            self.assertEqual(checked_out, 0)
        finally:
            event.remove(self.engine, "checkout", checkout)
            event.remove(self.engine, "checkin", checkin)

    def test_failed_bot_verification_preserves_previous_configuration(self) -> None:
        _, created = asyncio.run(
            _request(self.app, "POST", "/api/admin/landings",
                     payload={"slug": "verify-failure", "title": "Test", "description": ""},
                     cookie="session=admin-session")
        )
        url = f"/api/admin/landings/{created['id']}/telegram"
        credentials = {"PYMENTOR_LANDING_BOT_CREDENTIALS": json.dumps({"test-ref": "test-token"})}
        with patch.dict(os.environ, credentials):
            with patch("routers.landings.admin.verify_telegram_destination", return_value="old_bot"):
                status_code, original = asyncio.run(
                    _request(self.app, "PUT", url, payload={"secret_ref": "test-ref", "chat_id": "123"},
                             cookie="session=admin-session")
                )
            self.assertEqual(status_code, 200)
            with patch("routers.landings.admin.verify_telegram_destination",
                       side_effect=TelegramDeliveryError("test failure", retryable=True)):
                status_code, _ = asyncio.run(
                    _request(self.app, "PUT", url, payload={"secret_ref": "test-ref", "chat_id": "456"},
                             cookie="session=admin-session")
                )
            self.assertEqual(status_code, 503)
            status_code, after = asyncio.run(_request(self.app, "GET", url, cookie="session=admin-session"))
        self.assertEqual(status_code, 200)
        self.assertEqual(after, original)

    def test_connection_test_event_is_allowlisted_idempotent_and_payload_redacted(self) -> None:
        _, landing = asyncio.run(
            _request(
                self.app,
                "POST",
                "/api/admin/landings",
                payload={"slug": "backend", "title": "Pymentor", "description": ""},
                cookie="session=admin-session",
            )
        )
        with patch.dict(
            os.environ,
            {"PYMENTOR_LANDING_BOT_CREDENTIALS": json.dumps({"backend-bot-v1": "external-token"})},
        ), patch("routers.landings.admin.verify_telegram_destination", return_value="pymentor_bot"):
            asyncio.run(
                _request(
                    self.app,
                    "PUT",
                    f"/api/admin/landings/{landing['id']}/telegram",
                    payload={"secret_ref": "backend-bot-v1", "chat_id": "12345"},
                    cookie="session=admin-session",
                )
            )

        key = "123e4567-e89b-12d3-a456-426614174000"
        path = f"/api/admin/landings/{landing['id']}/events"
        status_code, created = asyncio.run(
            _request(
                self.app,
                "POST",
                path,
                payload={"event_type": "telegram_connection_test.v1", "payload": {}},
                cookie="session=admin-session",
                extra_headers={"Idempotency-Key": key},
            )
        )
        repeated_status, repeated = asyncio.run(
            _request(
                self.app,
                "POST",
                path,
                payload={"event_type": "telegram_connection_test.v1", "payload": {}},
                cookie="session=admin-session",
                extra_headers={"Idempotency-Key": key},
            )
        )
        changed_status, _ = asyncio.run(
            _request(
                self.app,
                "POST",
                path,
                payload={"event_type": "telegram_connection_test.v1", "payload": {"email": "private@example.test"}},
                cookie="session=admin-session",
                extra_headers={"Idempotency-Key": key},
            )
        )
        status_status, event_status = asyncio.run(
            _request(
                self.app,
                "GET",
                f"/api/admin/landings/{landing['id']}/events/{created['event_id']}",
                cookie="session=admin-session",
            )
        )

        self.assertEqual(status_code, 202)
        self.assertEqual(repeated_status, 200)
        self.assertEqual(created["landing_id"], landing["id"])
        self.assertEqual(created["event_type"], "telegram_connection_test.v1")
        self.assertEqual(created["schema_version"], 1)
        self.assertTrue(repeated["duplicate"])
        self.assertEqual(created["event_id"], repeated["event_id"])
        self.assertEqual(changed_status, 409)
        self.assertEqual(status_status, 200)
        self.assertNotIn("payload", event_status)
        self.assertNotIn("private@example.test", json.dumps(event_status))

    def test_test_event_rate_limit_and_disabled_destination(self) -> None:
        _, landing = asyncio.run(
            _request(
                self.app,
                "POST",
                "/api/admin/landings",
                payload={"slug": "backend", "title": "Pymentor", "description": ""},
                cookie="session=admin-session",
            )
        )
        with patch.dict(
            os.environ,
            {"PYMENTOR_LANDING_BOT_CREDENTIALS": json.dumps({"backend-bot-v1": "external-token"})},
        ), patch("routers.landings.admin.verify_telegram_destination", return_value="pymentor_bot"):
            asyncio.run(
                _request(
                    self.app,
                    "PUT",
                    f"/api/admin/landings/{landing['id']}/telegram",
                    payload={"secret_ref": "backend-bot-v1", "chat_id": "12345"},
                    cookie="session=admin-session",
                )
            )
        path = f"/api/admin/landings/{landing['id']}/events"
        codes = [
            asyncio.run(
                _request(
                    self.app,
                    "POST",
                    path,
                    payload={"event_type": "telegram_connection_test.v1", "payload": {}},
                    cookie="session=admin-session",
                    extra_headers={"Idempotency-Key": f"123e4567-e89b-12d3-a456-42661417400{index}"},
                )
            )[0]
            for index in range(1, 5)
        ]
        disabled_status, _ = asyncio.run(
            _request(
                self.app,
                "DELETE",
                f"/api/admin/landings/{landing['id']}/telegram",
                cookie="session=admin-session",
            )
        )
        after_disable_status, _ = asyncio.run(
            _request(
                self.app,
                "POST",
                path,
                payload={"event_type": "telegram_connection_test.v1", "payload": {}},
                cookie="session=admin-session",
                extra_headers={"Idempotency-Key": "123e4567-e89b-12d3-a456-426614174099"},
            )
        )

        self.assertEqual(codes, [202, 202, 202, 429])
        self.assertEqual(disabled_status, 200)
        self.assertEqual(after_disable_status, 409)

    def test_landing_event_request_body_has_a_small_size_limit(self) -> None:
        status_code, _ = asyncio.run(
            _request(
                self.app,
                "POST",
                "/api/admin/landings/unknown/events",
                payload={"event_type": "telegram_connection_test.v1", "payload": {"x": "x" * 3000}},
                cookie="session=admin-session",
                extra_headers={"Idempotency-Key": "123e4567-e89b-12d3-a456-426614174088"},
                include_content_length=False,
            )
        )

        self.assertEqual(status_code, 413)

    def test_public_consultation_submission_is_queued_and_idempotent(self) -> None:
        with self.sessions() as db:
            landing = landing_service.create_landing(
                db,
                slug="backend",
                title="Pymentor",
                description="Основной лендинг",
            )
            landing_service.configure_landing_telegram(
                db,
                landing.id,
                secret_ref="backend-bot-v1",
                chat_id="12345",
                bot_username="pymentor_bot",
            )

        payload = {
            "name": "Анна",
            "contact": "@anna",
            "goal": "Начать учить Python",
            "consent": True,
        }
        headers = {"Idempotency-Key": "123e4567-e89b-12d3-a456-426614174000"}
        with patch.dict(
            os.environ,
            {"PYMENTOR_LANDING_BOT_CREDENTIALS": json.dumps({"backend-bot-v1": "external-token"})},
        ):
            first_status, first = asyncio.run(
                _request(
                    self.app,
                    "POST",
                    "/api/landings/backend/consultations",
                    payload=payload,
                    extra_headers=headers,
                )
            )
            repeated_status, repeated = asyncio.run(
                _request(
                    self.app,
                    "POST",
                    "/api/landings/backend/consultations",
                    payload=payload,
                    extra_headers=headers,
                )
            )
            new_status, _ = asyncio.run(
                _request(
                    self.app,
                    "POST",
                    "/api/landings/backend/consultations",
                    payload={**payload, "consent_version": "consultation-v2"},
                    extra_headers={"Idempotency-Key": "123e4567-e89b-12d3-a456-426614174001"},
                )
            )

        self.assertEqual(first_status, 202)
        self.assertEqual(repeated_status, 200)
        self.assertTrue(first["accepted"])
        self.assertTrue(repeated["duplicate"])
        self.assertNotIn("@anna", json.dumps(first))
        self.assertEqual(new_status, 202)
        with self.sessions() as db:
            events = db.query(models.LandingNotificationOutbox).all()
            versions = {json.loads(event.payload_json)["consent_version"] for event in events}
        self.assertEqual(versions, {"consultation-v1", "consultation-v2"})

    def test_contact_options_reach_telegram_through_outbox(self) -> None:
        with self.sessions() as db:
            landing = landing_service.create_landing(db, slug="backend", title="Pymentor", description="")
            landing_service.configure_landing_telegram(
                db, landing.id, secret_ref="backend-bot-v1", chat_id="12345", bot_username="pymentor_bot"
            )

        contacts = ["+7 999 123-45-67", "user@example.com", "@example_user"]
        credentials = {"PYMENTOR_LANDING_BOT_CREDENTIALS": json.dumps({"backend-bot-v1": "external-token"})}
        with patch.dict(os.environ, credentials), patch("notifications.telegram._send_telegram_message") as send:
            for index, contact in enumerate(contacts):
                status_code, result = asyncio.run(_request(
                    self.app, "POST", "/api/landings/backend/consultations",
                    payload={"name": "Анна", "contact": contact, "consent": True, "consent_version": "consultation-v3"},
                    extra_headers={"Idempotency-Key": f"123e4567-e89b-12d3-a456-42661417400{index}"},
                ))
                self.assertEqual(status_code, 202)
                self.assertTrue(result["accepted"])
            counts = drain_notifications(session_factory=self.sessions, budget_seconds=5)

        self.assertEqual(counts["sent"], 3)
        messages = [entry.kwargs["text"] for entry in send.call_args_list]
        self.assertTrue(any("@example\\_user" in message for message in messages))
        self.assertTrue(any("user@example\\.com" in message for message in messages))
        self.assertTrue(any("123\\-45\\-67" in message for message in messages))
        self.assertTrue(all(entry.kwargs["chat_id"] == "12345" for entry in send.call_args_list))
        with self.sessions() as db:
            self.assertEqual(db.query(models.LandingNotificationOutbox).filter_by(status="sent").count(), 3)
