"""Behavioral guardrails for the PostgreSQL/Redis-only Core runtime."""
from pathlib import Path

import pytest
from sqlalchemy.engine import make_url

from pymentor_core.app.settings import Settings


def configured_env():
    return {
        "DATABASE_URL": "postgresql+asyncpg://core:secret@postgres/core",
        "REDIS_URL": "redis://redis/0",
        "KNOWI_REDIS_PREFIX": "pg02:core:",
        "KNOWI_LOGIN_RECOVERY_KEY": "ab" * 32,
    }


def test_valid_dependencies_select_the_only_runtime_without_a_profile_flag():
    settings = Settings.from_environment(environ=configured_env(), legacy_root=Path.cwd())
    assert settings.profile == "postgres_redis"
    assert make_url(settings.synchronous_database_url).drivername == "postgresql+psycopg"


@pytest.mark.parametrize("profile", ["legacy_sqlite", "unknown", ""])
def test_explicit_retired_profile_cannot_enable_a_second_runtime(profile):
    with pytest.raises(ValueError):
        Settings.from_environment(profile, configured_env(), legacy_root=Path.cwd())


def test_explicit_postgres_marker_cannot_hide_a_retired_environment_profile():
    env = configured_env()
    env["PYMENTOR_PROFILE"] = "legacy_sqlite"
    with pytest.raises(ValueError):
        Settings.from_environment("postgres_redis", env, legacy_root=Path.cwd())


@pytest.mark.parametrize("url", ["", "sqlite:///:memory:", "sqlite:///./test.db"])
def test_missing_or_sqlite_database_is_rejected_without_profile_flag(url):
    env = configured_env()
    env["DATABASE_URL"] = url
    with pytest.raises(ValueError):
        Settings.from_environment(environ=env, legacy_root=Path.cwd())


def test_default_state_location_does_not_follow_a_retired_profile(monkeypatch):
    from pymentor_core.app.paths import PROJECT_ROOT, state_directory

    monkeypatch.delenv("PYMENTOR_STATE_DIR", raising=False)
    monkeypatch.setenv("PYMENTOR_PROFILE", "legacy_sqlite")
    assert state_directory() == PROJECT_ROOT / "data" / "core-api"
