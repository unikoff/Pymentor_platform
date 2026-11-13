"""Runtime PostgreSQL selection must fail closed, including direct imports."""
import os
import subprocess
import sys

import pytest


@pytest.mark.parametrize("url", [None, "", "sqlite:///:memory:", "sqlite:///./test.db"])
def test_data_module_never_builds_a_missing_or_sqlite_engine(url):
    env = os.environ.copy()
    for key in ("DATABASE_URL", "PYMENTOR_PROFILE", "PYMENTOR_REQUIRE_DATABASE_URL",
                "PYMENTOR_DUAL_LOCAL_TEST"):
        env.pop(key, None)
    if url is not None:
        env["DATABASE_URL"] = url
    code = """
try:
    import pymentor_core.app.database
except (RuntimeError, ValueError):
    pass
else:
    raise AssertionError("non-PostgreSQL runtime engine was constructed")
"""
    result = subprocess.run([sys.executable, "-c", code], env=env,
                            capture_output=True, text=True, timeout=20)
    assert result.returncode == 0, result.stderr






@pytest.mark.parametrize("adapter", ["bookings", "landings"])
def test_write_adapters_reject_sqlite_sessions(adapter, monkeypatch):
    import importlib
    from sqlalchemy import create_engine
    from sqlalchemy.orm import Session

    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg://app:p@127.0.0.1:9/pg03")
    monkeypatch.delenv("PYMENTOR_DUAL_LOCAL_TEST", raising=False)
    module = importlib.import_module("pymentor_core.adapters.sql." + adapter)
    engine = create_engine("sqlite://")
    try:
        with Session(engine) as session:
            with pytest.raises(RuntimeError, match="PostgreSQL"):
                module._start_write_transaction(session)
    finally:
        engine.dispose()
