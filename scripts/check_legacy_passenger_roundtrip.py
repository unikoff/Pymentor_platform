"""Synthetic upgrade and rollback check against a fresh, disposable SQLite file.

Usage: python scripts/check_legacy_passenger_roundtrip.py OLD_EXPORTED_PROJECT
Both projects are imported in separate child processes through passenger_wsgi.
Never pass a database path: the parent creates one in a temporary directory.
"""
from __future__ import annotations

import json
import os
from contextlib import closing
from pathlib import Path
import sqlite3
import subprocess
import sys
import tempfile
from uuid import uuid4


def child() -> None:
    import httpx
    from passenger_wsgi import application

    payload = json.load(sys.stdin)
    transport = httpx.WSGITransport(app=application, script_name="/platform")
    with httpx.Client(transport=transport, base_url="http://localhost") as client:
        def request(method, path, *, data=None):
            response = client.request(method, path, json=data)
            if response.status_code != 200:
                raise RuntimeError(f"{method} {path}: HTTP {response.status_code}")
            return response.json()

        if payload["phase"] == "old-create":
            request("POST", "/user/register", data={"username": "synthetic", "email": payload["email"],
                                                    "password": payload["password"]})
            request("POST", "/user/login", data={"email": payload["email"], "password": payload["password"]})
            request("POST", "/user/activity/visit", data={"activity_date": "2026-02-03"})
        else:
            client.cookies.set("session", payload["token"], path="/")
            assert request("GET", "/user/me")["user"]["email"] == payload["email"]
            before = request("GET", "/user/activity?year=2026&month=2")
            assert "2026-02-03" in before["days"]
            if payload["phase"] == "new-check":
                request("POST", "/user/activity/visit", data={"activity_date": "2026-02-04"})
                client.cookies.clear()
                request("POST", "/user/login", data={"email": payload["email"], "password": payload["password"]})
            else:
                assert "2026-02-04" in before["days"]
        token = client.cookies.get("session")
        if not token:
            raise RuntimeError("Expected test session cookie")
        print(json.dumps({"token": token}))


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Expected the exported old project directory")
    candidate = Path(__file__).resolve().parents[1]
    old = Path(sys.argv[1]).resolve(strict=True)
    if old == candidate or not (old / "backend" / "main.py").is_file():
        raise SystemExit("Expected a separate old project export")
    payload = {"email": f"upgrade-{uuid4().hex}@example.test", "password": "Synthetic-Upgrade-Password-42"}
    with tempfile.TemporaryDirectory(prefix="pymentor-passenger-roundtrip-") as directory:
        db = Path(directory) / "synthetic.sqlite3"
        env = os.environ.copy()
        env.update(DATABASE_URL=f"sqlite:///{db.as_posix()}", PYTHON_DOTENV_DISABLED="1",
                   PYMENTOR_LOCAL_NOTIFICATIONS="0", PYTHONDONTWRITEBYTECODE="1")
        for key in ("PYMENTOR_DUAL_LOCAL_TEST", "PYMENTOR_SCHEMA_MODE", "PYMENTOR_COOKIE_SECURE"):
            env.pop(key, None)
        for phase, project in (("old-create", old), ("new-check", candidate), ("old-check", old)):
            env["PYTHONPATH"] = os.pathsep.join((str(project), str(project / "backend")))
            result = subprocess.run([sys.executable, str(Path(__file__).resolve()), "--child"], cwd=project,
                                    env=env, input=json.dumps({**payload, "phase": phase}),
                                    capture_output=True, text=True, timeout=60)
            if result.returncode:
                raise RuntimeError(f"{phase} failed:\n{result.stderr}")
            payload["token"] = json.loads(result.stdout)["token"]
        with closing(sqlite3.connect(db)) as connection:
            assert connection.execute("PRAGMA integrity_check").fetchone() == ("ok",)
            assert connection.execute("SELECT count(*) FROM users WHERE email=?", (payload["email"],)).fetchone() == (1,)
            assert connection.execute("SELECT count(*) FROM user_activity_days").fetchone() == (2,)
    print("PASS: old -> candidate -> old, Passenger WSGI, SQLite users, sessions and activity")


if __name__ == "__main__":
    child() if sys.argv[1:] == ["--child"] else main()
