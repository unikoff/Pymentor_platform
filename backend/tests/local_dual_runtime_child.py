"""Subprocess harness. Uses an explicit temporary SQLite or allowlisted test PostgreSQL."""

import json
import os
import sys
from hashlib import sha256
from datetime import date, datetime, timezone
from uuid import UUID, uuid4

from fastapi.testclient import TestClient
from sqlalchemy import text


def run(mode):
    if mode == "postgres":
        from dual_local import create_app
        app = create_app()
    elif mode == "sqlite":
        from pathlib import Path
        import tempfile
        from sqlalchemy.engine import make_url
        db_url = make_url(os.environ["DATABASE_URL"])
        temp_root = Path(os.environ["PYMENTOR_DUAL_TEMP_ROOT"]).resolve()
        db_path = Path(db_url.database or "").resolve()
        if (db_url.drivername != "sqlite" or db_path.name != "synthetic.sqlite3"
                or db_path.parent != temp_root or not temp_root.is_relative_to(Path(tempfile.gettempdir()).resolve())
                or db_path.exists()):
            raise RuntimeError("Expected a synthetic temporary SQLite database")
        from main import app
    else:
        raise ValueError("Invalid test mode")

    from db.engine import engine
    from db.engine import SessionLocal
    from db import models
    email = os.environ["PYMENTOR_DUAL_SYNTHETIC_EMAIL"]
    if not email.startswith("dual-") or not email.endswith("@example.test"):
        raise RuntimeError("Expected a synthetic email")
    password = "Synthetic-Dual-Password-42"
    if mode == "postgres":
        assert engine.pool.size() == 3 and engine.pool._max_overflow == 0 and engine.pool._timeout == 3
        with engine.connect() as connection:
            assert connection.get_isolation_level() == "READ COMMITTED"
    user_id = admin_id = slot_id = None
    admin_email = f"admin-{email}"
    issued_tokens = set()
    try:
        with TestClient(app) as client:
            def expect(response, status=200):
                if response.status_code != status:
                    raise AssertionError(f"{response.request.method} {response.request.url.path}: "
                                         f"expected {status}, got {response.status_code}: {response.text[:300]}")
                return response.json()

            def login(login_email, *, operation_id=None):
                headers = {}
                if mode == "postgres" and os.getenv("PYMENTOR_TEST_LOGIN_RECOVERY_KEY"):
                    headers["Idempotency-Key"] = operation_id or str(uuid4())
                response = client.post("/api/user/login", json={"email": login_email, "password": password},
                                       headers=headers)
                if response.status_code == 200 and client.cookies.get("session"):
                    issued_tokens.add(client.cookies.get("session"))
                return response

            ready = expect(client.get("/health/ready"))
            if mode == "postgres":
                import main
                expected_revision = main.DUAL_LOCAL_SCHEMA_REVISION
                expected_tables = main.DUAL_LOCAL_REQUIRED_TABLES
                try:
                    main.DUAL_LOCAL_SCHEMA_REVISION = "synthetic-incompatible-revision"
                    assert client.get("/health/ready").status_code == 503
                    main.DUAL_LOCAL_SCHEMA_REVISION = expected_revision
                    main.DUAL_LOCAL_REQUIRED_TABLES = (*expected_tables, "synthetic_missing_table")
                    assert client.get("/health/ready").status_code == 503
                finally:
                    main.DUAL_LOCAL_SCHEMA_REVISION = expected_revision
                    main.DUAL_LOCAL_REQUIRED_TABLES = expected_tables
            registration = expect(client.post("/api/user/register", json={
                "username": "Synthetic Dual", "email": email, "password": password}))
            user_id = registration["user"]["id"]
            with SessionLocal() as db:
                synthetic_user = db.query(models.User).filter_by(id=user_id, email=email).one()
                synthetic_user.subscription_until = datetime(2099, 1, 1, tzinfo=timezone.utc)
                synthetic_user.subscription_plan = "pro"
                admin_user = models.User(username="Synthetic Admin", email=admin_email,
                                         password=password, is_admin=True)
                db.add(admin_user)
                db.commit()
                admin_id = admin_user.id
            if mode == "postgres":
                sql_only_token = str(uuid4())
                with SessionLocal() as db:
                    db.add(models.Session(user_id=user_id, session_token=sql_only_token))
                    db.commit()
                assert client.get("/api/user/me", headers={"Cookie": f"session={sql_only_token}"}).status_code == 401
                with SessionLocal() as db:
                    db.query(models.Session).filter_by(user_id=user_id, session_token=sql_only_token).delete()
                    db.commit()
            logged_in = expect(login(email))
            if mode == "postgres":
                import redis
                from redis.exceptions import ConnectionError as RedisConnectionError
                from unittest.mock import patch
                token = client.cookies.get("session")
                digest = sha256(token.encode()).hexdigest()
                is_retry_mode = bool(os.getenv("PYMENTOR_TEST_LOGIN_RECOVERY_KEY"))
                key = f"{os.environ['PYMENTOR_TEST_REDIS_PREFIX']}token:{digest}" if is_retry_mode else f"{os.environ['PYMENTOR_TEST_REDIS_PREFIX']}token:prepared:{digest}"
                redis_client = redis.Redis.from_url(os.environ["PYMENTOR_TEST_REDIS_URL"], socket_timeout=2)
                try:
                    assert redis_client.get(key) == str(user_id).encode()
                finally:
                    redis_client.close()
                if is_retry_mode:
                    assert expect(client.get("/api/user/login-capabilities"))["idempotent_login"] is True
                    first = token
                    expect(login(email))
                    second = client.cookies.get("session")
                    expect(login(email))
                    third = client.cookies.get("session")
                    operation = str(uuid4())
                    expect(login(email, operation_id=operation))
                    confirmed = client.cookies.get("session")
                    expect(login(email, operation_id=operation))
                    assert client.cookies.get("session") == confirmed
                    assert client.get("/api/user/me", headers={"Cookie": f"session={first}"}).status_code == 401
                    for previous in (second, third):
                        assert client.get("/api/user/me", headers={"Cookie": f"session={previous}"}).status_code == 200
                with patch.object(app.state.local_async_identity.redis, "get_user",
                                  side_effect=RedisConnectionError("synthetic outage")):
                    assert client.get("/api/user/me").status_code == 503
                    assert client.get("/api/learning/catalog").status_code == 503
                with patch.object(app.state.local_async_identity.redis, "ping",
                                  side_effect=RedisConnectionError("synthetic outage")):
                    assert client.get("/health/ready").status_code == 503
                from identity.async_sessions import IdentityUnavailable
                with patch.object(app.state.local_async_identity, "check_async_database",
                                  side_effect=IdentityUnavailable("synthetic async PostgreSQL outage")):
                    assert client.get("/health/ready").status_code == 503
            current = expect(client.get("/api/user/me"))
            assert client.get("/api/admin/overview").status_code == 403
            visit = expect(client.post("/api/user/activity/visit", json={"activity_date": "2026-02-03"}))
            calendar = expect(client.get("/api/user/activity", params={"year": 2026, "month": 2}))
            summary = expect(client.get("/api/user/activity/summary"))
            catalog = expect(client.get("/api/learning/catalog"))
            tracks = expect(client.get("/api/learning/tracks"))
            lessons = expect(client.get("/api/learning/lessons"))
            slots = expect(client.get("/api/user/slots", params={"year": 2026, "month": 2}))
            free_task_id = "lesson-fa2f4f9cd78e77a18fb1778e-task-01"
            from content.catalog import find_task
            free_task = find_task(free_task_id)
            task_payload = {"code": 'print("\u0421\u0438\u0433\u043d\u0430\u043b \u043f\u0440\u0438\u043d\u044f\u0442")',
                            "task_revision": free_task["revision"]}
            task_run = expect(client.post(f"/api/learning/tasks/{free_task_id}/run", json=task_payload))
            task_submit = expect(client.post(f"/api/learning/tasks/{free_task_id}/submit", json=task_payload))
            assert task_run["ok"] is True and task_submit["ok"] is True and task_submit["score"] == 100
            with SessionLocal() as db:
                saved_task = db.query(models.UserTaskProgress).filter_by(user_id=user_id, task_id=free_task_id).one()
                assert saved_task.task_revision == free_task["revision"]

            admin_login = expect(login(admin_email))
            assert admin_login["user"]["is_admin"] is True
            admin_token = client.cookies.get("session")
            admin_headers = {"Cookie": f"session={admin_token}"}
            expect(login(email))
            expect(client.get("/api/admin/overview", headers=admin_headers))
            users = expect(client.get("/api/admin/users", params={"search": email}, headers=admin_headers))
            assert any(item["id"] == user_id for item in users["users"])
            profile = expect(client.get(f"/api/admin/users/{user_id}/profile",
                                        params={"year": 2026, "month": 2}, headers=admin_headers))
            account_ref = profile["profile"]["account_ref"]
            assert str(UUID(account_ref)) == account_ref and UUID(account_ref).version == 4
            stale_headers = {**admin_headers, "X-Account-Ref": str(uuid4())}
            assert client.delete(f"/api/admin/users/{user_id}", headers=stale_headers).status_code == 409
            assert expect(client.get("/api/user/me"))["user"]["id"] == user_id
            slot_day = date.fromisoformat(os.environ["PYMENTOR_DUAL_SLOT_DATE"])
            quota = expect(client.post(f"/api/admin/users/{user_id}/quota", headers=admin_headers,
                                       json={"year": slot_day.year, "month": slot_day.month, "add": 1}))
            assert quota["profile"]["quota"]["granted"] == 1
            with SessionLocal() as db:
                assert not db.query(models.BookingSlot.id).filter_by(slot_date=slot_day).first()
            created_slot = expect(client.post("/api/admin/slots", headers=admin_headers, json={
                "slot_date": slot_day.isoformat(), "start_time": "10:00", "duration_minutes": 60}))
            slot_id = created_slot["slot"]["id"]
            booked = expect(client.post(f"/api/user/slots/{slot_id}/book"))
            assert booked["slot"]["status"] == "mine"
            cancelled = expect(client.post(f"/api/user/slots/{slot_id}/cancel"))
            assert cancelled["slot"]["status"] == "free"
            assert expect(client.delete(f"/api/admin/slots/{slot_id}", headers=admin_headers))["deleted"] == slot_id
            lesson_id = "lesson-4e35c6caf92173c1cc1ab078"
            completed = expect(client.post(f"/api/learning/lessons/{lesson_id}/complete"))
            assert completed == {"lesson_id": lesson_id, "completed": True}
            assert expect(client.post(f"/api/learning/lessons/{lesson_id}/complete")) == completed
            catalog_after = expect(client.get("/api/learning/catalog"))
            progress = [lesson for course in catalog_after["courses"].values() for lesson in course
                        if lesson["id"] == lesson_id]
            assert len(progress) == 1 and progress[0]["completed"] is True
            interpreter = expect(client.post("/api/learning/interpreter/run", json={"code": "print(2 + 3)"}))
            assert interpreter["ok"] is True and interpreter["stdout"].strip() == "5"
            logout = expect(client.post("/api/user/logout"))
            denied = expect(client.get("/api/user/me"), 401)
            expect(login(email))
            reopened = expect(client.get("/api/learning/catalog"))
            reopened_progress = [lesson for course in reopened["courses"].values() for lesson in course
                                 if lesson["id"] == lesson_id]
            assert len(reopened_progress) == 1 and reopened_progress[0]["completed"] is True
            expect(client.post("/api/user/logout"))
            assert registration["user"]["id"] == logged_in["user"]["id"] == current["user"]["id"]
            assert calendar["days"] == ["2026-02-03"]
            assert visit["activity_date"] == "2026-02-03"
            public = {k: v for k, v in current["user"].items() if k != "id"}
            return {"ready": ready, "public": public, "login_message": logged_in["message"],
                    "visit_date": visit["activity_date"], "calendar_days": calendar["days"],
                    "summary_keys": sorted(summary), "catalog": catalog, "tracks": tracks,
                    "lessons": lessons, "slots": slots, "completed": completed,
                    "catalog_after": catalog_after, "interpreter": interpreter,
                    "task_run": task_run, "task_submit": task_submit,
                    "admin_booking": {"granted": quota["profile"]["quota"]["granted"],
                                      "booked": booked["slot"]["status"], "cancelled": cancelled["slot"]["status"]},
                    "logout": logout, "denied": denied}
    finally:
        if user_id is not None:
            try:
                if mode == "postgres":
                    import re
                    import redis
                    prefix = os.environ["PYMENTOR_TEST_REDIS_PREFIX"]
                    assert re.fullmatch(r"pymentor-c216-test:[0-9a-f-]{32,36}:", prefix)
                    redis_client = redis.Redis.from_url(os.environ["PYMENTOR_TEST_REDIS_URL"], socket_timeout=2)
                    try:
                        with engine.connect() as conn:
                            stored_tokens = conn.execute(text(
                                "SELECT session_token FROM sessions WHERE user_id IN (:user_id, :admin_id)"
                            ), {"user_id": user_id, "admin_id": admin_id or user_id}).scalars().all()
                        session_digests = [token if re.fullmatch(r"[0-9a-f]{64}", token)
                                           else sha256(token.encode()).hexdigest() for token in stored_tokens]
                        for cleanup_user in (user_id, admin_id):
                            if cleanup_user is None:
                                continue
                            user_key = f"{prefix}user:{cleanup_user}"
                            members = redis_client.zrange(user_key, 0, -1)
                            digests = [item.decode("ascii") for item in members]
                            assert all(re.fullmatch(r"[0-9a-f]{64}", digest) for digest in digests)
                            redis_client.delete(user_key, *(f"{prefix}token:{digest}" for digest in digests))
                        if session_digests:
                            redis_client.delete(*(f"{prefix}token:prepared:{digest}" for digest in session_digests))
                        issued_digests = {sha256(token.encode()).hexdigest() for token in issued_tokens}
                        if issued_digests:
                            redis_client.delete(*(f"{prefix}token:{digest}" for digest in issued_digests),
                                                *(f"{prefix}token:prepared:{digest}" for digest in issued_digests))
                    finally:
                        redis_client.close()
            finally:
                with engine.begin() as conn:
                    # Only this synthetic account and its dependent rows may be removed.
                    assert conn.execute(text("SELECT count(*) FROM users WHERE id=:id AND email=:email"),
                                        {"id": user_id, "email": email}).scalar() == 1
                    for table in ("sessions", "user_activity_days", "user_lesson_progress", "user_task_progress",
                                  "booking_quotas"):
                        conn.execute(text(f"DELETE FROM {table} WHERE user_id=:id"), {"id": user_id})
                    if slot_id is not None:
                        conn.execute(text("DELETE FROM booking_notification_outbox WHERE slot_id=:id"), {"id": slot_id})
                        conn.execute(text("DELETE FROM booking_slots WHERE id=:id"), {"id": slot_id})
                    conn.execute(text("DELETE FROM users WHERE id=:id AND email=:email"),
                                 {"id": user_id, "email": email})
                    if admin_id is not None:
                        conn.execute(text("DELETE FROM sessions WHERE user_id=:id"), {"id": admin_id})
                        conn.execute(text("DELETE FROM users WHERE id=:id AND email=:email"),
                                     {"id": admin_id, "email": admin_email})
        engine.dispose()


if __name__ == "__main__":
    print(json.dumps(run(sys.argv[1]), ensure_ascii=True, sort_keys=True))
