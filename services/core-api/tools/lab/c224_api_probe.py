"""Bounded API measurements for the owner-verified PYM-189 restore only.

The owner must verify both Docker resources, database privileges and the
synthetic-only contents before each run. This program performs read-only Docker
inspection through c225; it never starts, stops, creates or removes resources.
Two new synthetic accounts and their sessions are intentionally left in the
disposable database. No existing records or Redis keys are deleted.

Set PYMENTOR_TEST_PG_URL (asyncpg) and PYMENTOR_TEST_REDIS_URL in the process
environment; do not pass credentials on the command line. Run with
--run-id verify-e1b57ac6 --opt-in --owner-verified. Results are aggregate only.
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import secrets
import sys
import time
from datetime import datetime
from datetime import timezone
from pathlib import Path
from urllib.parse import urlsplit
from uuid import uuid4

RUN_ID = "verify-e1b57ac6"
ROOT = Path(__file__).resolve().parents[4]


def validate_urls(pg: str, redis: str) -> None:
    from sqlalchemy.engine import make_url
    from sqlalchemy.exc import ArgumentError

    try:
        db = make_url(pg)
        cache = urlsplit(redis)
        valid = (
            db.drivername == "postgresql+asyncpg"
            and db.host == "127.0.0.1"
            and db.port == 57152
            and db.database == "pymentor_test"
            and db.username in {"pymentor_app", "pymentor_test"}
            and not db.query
            and cache.scheme == "redis"
            and cache.hostname == "127.0.0.1"
            and cache.port == 57146
            and cache.path in {"", "/0"}
            and cache.username is None
            and cache.password is None
            and not cache.query
            and not cache.fragment
        )
    except (ArgumentError, ValueError, TypeError):
        valid = False
    if not valid:
        raise ValueError("Connections are outside the disposable local allowlist")


def validate_invocation(run_id: str, opt_in: bool, owner_verified: bool) -> None:
    if run_id != RUN_ID or not opt_in or not owner_verified:
        raise ValueError(
            "The designated run, explicit opt-in and owner verification are required"
        )


def verify_lab(lab, run_id: str) -> None:
    directory, state = lab._load(run_id)
    if state.get("phase") != "restore-created":
        raise ValueError("The lab is not in restore-created phase")
    names = state["names"]
    for side, running in (("source", False), ("restore", True)):
        volume, container = names[f"{side}_volume"], names[f"{side}_container"]
        lab._assert_volume(volume)
        lab._assert_container(container, volume, directory, require_running=running)


def configure_environment(env) -> None:
    # libpq can otherwise redirect a validated host via PGHOSTADDR/PGSERVICE.
    for key in list(env):
        if key.upper().startswith("PG"):
            del env[key]
    env.update(
        PYMENTOR_DUAL_LOCAL_TEST="1",
        PYMENTOR_LOCAL_NOTIFICATIONS="0",
        PYTHON_DOTENV_DISABLED="1",
        PYMENTOR_COOKIE_SECURE="0",
        PYMENTOR_TEST_REDIS_PREFIX=f"pymentor-c216-test:{uuid4()}:",
        PYMENTOR_TEST_LOGIN_RECOVERY_KEY=secrets.token_hex(32),
    )
    for key in (
        "PYMENTOR_PLATFORM_TELEGRAM_BOT_TOKEN",
        "PYMENTOR_PLATFORM_TELEGRAM_CHAT_ID",
        "REDIS_URL",
    ):
        env.pop(key, None)


def measure() -> dict:
    from fastapi.testclient import TestClient
    from sqlalchemy import event
    from tools.lab.dual_local import create_app

    app = create_app()  # Checks database identity and schema before importing main.
    from pymentor_core.app.database import SessionLocal
    from pymentor_core.app.database import engine
    from pymentor_core.adapters.sql.models import User

    nonce = uuid4().hex
    password = uuid4().hex + uuid4().hex
    student_email = f"c224-student-{nonce}@example.test"
    admin_email = f"c224-admin-{nonce}@example.test"
    with SessionLocal() as db:
        db.add_all(
            [
                User(
                    username="C224 synthetic student",
                    email=student_email,
                    password=password,
                    subscription_until=datetime(2099, 1, 1, tzinfo=timezone.utc),
                    subscription_plan="pro",
                ),
                User(
                    username="C224 synthetic admin",
                    email=admin_email,
                    password=password,
                    is_admin=True,
                ),
            ]
        )
        db.commit()

    totals = {"sync": 0, "async": 0}

    def hook(kind):
        def before_execute(conn, cursor, statement, parameters, context, executemany):
            totals[kind] += 1

        return before_execute

    sync_hook, async_hook = hook("sync"), hook("async")
    event.listen(engine, "before_cursor_execute", sync_hook)
    try:
        with TestClient(app) as client:
            async_engine = app.state.local_async_identity.database.engine.sync_engine
            event.listen(async_engine, "before_cursor_execute", async_hook)
            try:
                results = []

                def request(label, method, path, **kwargs):
                    before = totals.copy()
                    started = time.perf_counter()
                    response = client.request(method, path, **kwargs)
                    elapsed = (time.perf_counter() - started) * 1000
                    results.append(
                        {
                            "case": label,
                            "status": response.status_code,
                            "bytes": len(response.content),
                            "elapsed_ms": round(elapsed, 2),
                            "sql_sync": totals["sync"] - before["sync"],
                            "sql_async": totals["async"] - before["async"],
                        }
                    )
                    if response.status_code != 200:
                        raise RuntimeError(
                            "A measured request returned a non-200 status"
                        )

                request(
                    "student_login",
                    "POST",
                    "/api/user/login",
                    json={"email": student_email, "password": password},
                    headers={"Idempotency-Key": str(uuid4())},
                )
                request("catalog_progress", "GET", "/api/learning/catalog")
                request(
                    "calendar",
                    "GET",
                    "/api/user/activity",
                    params={"year": 2026, "month": 11},
                )
                request(
                    "booking_slots",
                    "GET",
                    "/api/user/slots",
                    params={"year": 2026, "month": 11},
                )
                request(
                    "admin_login",
                    "POST",
                    "/api/user/login",
                    json={"email": admin_email, "password": password},
                    headers={"Idempotency-Key": str(uuid4())},
                )
                request("admin_users", "GET", "/api/admin/users")
                request("admin_overview", "GET", "/api/admin/overview")
                return {"requests": results, "request_count": len(results)}
            finally:
                event.remove(async_engine, "before_cursor_execute", async_hook)
    finally:
        event.remove(engine, "before_cursor_execute", sync_hook)
        engine.dispose()


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-id", required=True)
    parser.add_argument("--opt-in", action="store_true")
    parser.add_argument("--owner-verified", action="store_true")
    args = parser.parse_args(argv)
    try:
        validate_invocation(args.run_id, args.opt_in, args.owner_verified)
        validate_urls(
            os.environ.get("PYMENTOR_TEST_PG_URL", ""),
            os.environ.get("PYMENTOR_TEST_REDIS_URL", ""),
        )
        import tools.lab.c225_local_pg_lab as lab

        verify_lab(lab, args.run_id)
        configure_environment(os.environ)
        logging.disable(logging.CRITICAL)
        result = measure()
        print(json.dumps(result))
        return 0
    except Exception:
        print(
            "Probe stopped; verify the local run, credentials, schema and synthetic seed. No response data is printed.",
            file=sys.stderr,
        )
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
