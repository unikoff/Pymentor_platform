"""Compare existing Core routes against disposable SQLite and PostgreSQL only."""

import json
import os
from pathlib import Path
import subprocess
import sys
from uuid import uuid4
from urllib.parse import urlsplit
from datetime import date
from datetime import timedelta

import pytest

from c222_pg_guard import validate_test_url
from tools.lab.dual_local import _validated_url
from tools.lab.dual_local import _validated_recovery_key
from tools.lab.dual_local import create_app


@pytest.mark.parametrize("url", [
    "postgresql+asyncpg://pymentor_test:p@localhost:57152/pymentor_test",
    "postgresql+asyncpg://pymentor_test:p@127.0.0.1:5432/pymentor_test",
    "postgresql+asyncpg://pymentor_test:p@127.0.0.1:57152/other",
    "postgresql+asyncpg://other:p@127.0.0.1:57152/pymentor_test",
    "postgresql+asyncpg://pymentor_test:p@127.0.0.1:57152/pymentor_test?sslmode=require",
    "postgresql+asyncpg://pymentor_test:p@example.com:57152/pymentor_test",
])
def test_local_postgres_mode_rejects_non_test_addresses(url):
    with pytest.raises(ValueError, match="disposable"):
        _validated_url(url)


def test_local_postgres_mode_never_activates_without_explicit_opt_in(monkeypatch):
    monkeypatch.delenv("PYMENTOR_DUAL_LOCAL_TEST", raising=False)
    monkeypatch.setenv("DATABASE_URL", "sentinel://must-not-change")
    with pytest.raises(RuntimeError, match="opt-in"):
        create_app()
    assert os.environ["DATABASE_URL"] == "sentinel://must-not-change"


@pytest.mark.parametrize("value", [None, "", "ab" * 31, "not-hex", "zz" * 32])
def test_local_postgres_mode_rejects_missing_or_invalid_recovery_key(value):
    with pytest.raises(ValueError, match="recovery key"):
        _validated_recovery_key(value)


def test_local_postgres_mode_accepts_explicit_256_bit_recovery_key():
    assert _validated_recovery_key("42" * 32) == bytes.fromhex("42" * 32)


def test_existing_core_routes_work_against_two_isolated_databases(tmp_path):
    pg_url = os.environ.get("PYMENTOR_TEST_PG_URL")
    redis_url = os.environ.get("PYMENTOR_TEST_REDIS_URL")
    if not pg_url or not redis_url:
        pytest.skip("requires explicitly configured disposable local PostgreSQL and Redis")
    validate_test_url(pg_url)
    parsed = urlsplit(redis_url)
    if (parsed.scheme != "redis" or parsed.hostname != "127.0.0.1" or parsed.port != 57146
            or parsed.path not in {"", "/0"} or parsed.username or parsed.password or parsed.query or parsed.fragment):
        raise ValueError("Expected the disposable local Redis")
    candidate = Path(__file__).resolve().parents[4]
    child = Path(__file__).with_name("local_dual_runtime_child.py")
    email = f"dual-{uuid4().hex}@example.test"
    slot_date = (date(2095, 1, 1) + timedelta(days=uuid4().int % 1000)).isoformat()
    outputs = {}
    for mode in ("sqlite", "postgres"):
        env = os.environ.copy()
        env.update(PYTHONPATH=os.pathsep.join((str(candidate / "services/core-api"),str(candidate / "backend"))), PYTHON_DOTENV_DISABLED="1",
                   PYMENTOR_LOCAL_NOTIFICATIONS="0", PYMENTOR_TEST_PG_URL=pg_url,
                   PYMENTOR_DUAL_SYNTHETIC_EMAIL=email, PYTHONDONTWRITEBYTECODE="1",
                   PYMENTOR_PUBLIC_RUNNER_ENABLED="1", PYMENTOR_DUAL_SLOT_DATE=slot_date)
        if mode == "sqlite":
            env.pop("PYMENTOR_DUAL_LOCAL_TEST", None)
            env["DATABASE_URL"] = f"sqlite:///{(tmp_path / 'synthetic.sqlite3').as_posix()}"
            env["PYMENTOR_DUAL_TEMP_ROOT"] = str(tmp_path)
            env["PYMENTOR_SCHEMA_MODE"] = "legacy"
        else:
            env.pop("DATABASE_URL", None)
            env["PYMENTOR_SCHEMA_MODE"] = "managed"
            env["PYMENTOR_DUAL_LOCAL_TEST"] = "1"
            env["PYMENTOR_TEST_REDIS_URL"] = redis_url
            env["PYMENTOR_TEST_REDIS_PREFIX"] = f"pymentor-c216-test:{uuid4()}:"
            env.setdefault("PYMENTOR_TEST_LOGIN_RECOVERY_KEY", "42" * 32)
        result = subprocess.run([sys.executable, str(child), mode], cwd=candidate,
                                env=env, capture_output=True, text=True, timeout=60)
        assert result.returncode == 0, f"{mode} synthetic child failed:\n{result.stderr[-4000:]}"
        outputs[mode] = json.loads(result.stdout.strip().splitlines()[-1])
    assert outputs["sqlite"] == outputs["postgres"]
