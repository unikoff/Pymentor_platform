from dataclasses import FrozenInstanceError
from pathlib import Path

import pytest
from sqlalchemy.engine import make_url

from pymentor_core.app.settings import Settings


@pytest.fixture
def tmp_path():
    # Settings only constructs paths; no temporary directory or file is needed.
    return Path(__file__).resolve().parent


@pytest.fixture
def pg_env():
    return {
        "PYMENTOR_PROFILE": "postgres_redis",
        "DATABASE_URL": "postgresql+asyncpg://core:secret@postgres.core.svc.cluster.local/core",
        "REDIS_URL": "redis://:redis-secret@redis.core.svc.cluster.local:6379/0",
        "PYMENTOR_REDIS_PREFIX": "production:core:",
        "PYMENTOR_LOGIN_RECOVERY_KEY": "ab" * 32,
    }


def load(env, root, profile=None):
    return Settings.from_environment(profile, env, legacy_root=root)


def test_legacy_fallback_is_anchored_and_old_url_normalized(tmp_path, monkeypatch):
    root = tmp_path / "legacy"
    monkeypatch.chdir(tmp_path)
    expected = root.resolve() / "test.db"
    for value in (None, "", "sqlite:///./test.db"):
        env = {"PYMENTOR_PROFILE": "legacy_sqlite"}
        if value is not None:
            env["DATABASE_URL"] = value
        settings = load(env, root)
        assert Path(make_url(settings.database_url).database) == expected
        assert settings.synchronous_database_url == settings.async_database_url == settings.database_url
    assert not expected.exists()


def test_legacy_accepts_memory_and_absolute_file(tmp_path):
    for value in ("sqlite://", "sqlite:///:memory:", f"sqlite:///{(tmp_path / 'other.db').as_posix()}"):
        assert make_url(load({"DATABASE_URL": value}, tmp_path, "legacy_sqlite").database_url).drivername == "sqlite"


@pytest.mark.parametrize("value", ["sqlite:///relative.db", "sqlite:///./other.db", "postgresql+psycopg://u:p@host/db", "not a url"])
def test_legacy_rejects_other_urls(value, tmp_path):
    with pytest.raises(ValueError):
        load({"DATABASE_URL": value}, tmp_path, "legacy_sqlite")


def test_profile_required_and_explicit_profile_wins(tmp_path):
    for value in (None, "", "unknown"):
        with pytest.raises(ValueError):
            load({} if value is None else {"PYMENTOR_PROFILE": value}, tmp_path)
    assert load({"PYMENTOR_PROFILE": "unknown"}, tmp_path, "legacy_sqlite").profile == "legacy_sqlite"
    with pytest.raises(ValueError):
        load({"PYMENTOR_PROFILE": "legacy_sqlite"}, tmp_path, "")


def test_postgres_normalizes_drivers_without_connections(pg_env, tmp_path):
    settings = load(pg_env, tmp_path)
    assert make_url(settings.synchronous_database_url).drivername == "postgresql+psycopg"
    assert make_url(settings.async_database_url).drivername == "postgresql+asyncpg"
    assert make_url(settings.synchronous_database_url).host == "postgres.core.svc.cluster.local"
    assert make_url(settings.synchronous_database_url).password == "secret"
    assert settings.redis_url == pg_env["REDIS_URL"]
    assert all(secret not in repr(settings) for secret in ("secret", "ab" * 32, "postgres.core.svc"))
    with pytest.raises(FrozenInstanceError):
        settings.profile = "legacy_sqlite"


@pytest.mark.parametrize("url", ["", "sqlite:///:memory:", "postgresql://u:p@host/db", "postgresql+psycopg://u:p@/db", "postgresql+psycopg://host/db", "postgresql+psycopg://u:p@host/", "bad secret url"])
def test_postgres_rejects_missing_or_invalid_database(pg_env, tmp_path, url):
    pg_env["DATABASE_URL"] = url
    with pytest.raises(ValueError) as exc:
        load(pg_env, tmp_path)
    assert "secret" not in str(exc.value)


@pytest.mark.parametrize("field,value", [
    ("REDIS_URL", ""), ("REDIS_URL", "http://redis.local"), ("REDIS_URL", "redis:///0"),
    ("REDIS_URL", "redis://host:bad"), ("PYMENTOR_REDIS_PREFIX", " "),
    ("PYMENTOR_REDIS_PREFIX", "pymentor-c216-test:unsafe"),
    ("PYMENTOR_LOGIN_RECOVERY_KEY", ""), ("PYMENTOR_LOGIN_RECOVERY_KEY", "g" * 64),
    ("PYMENTOR_LOGIN_RECOVERY_KEY", "a" * 63),
])
def test_postgres_rejects_invalid_dependencies(pg_env, tmp_path, field, value):
    pg_env[field] = value
    with pytest.raises(ValueError):
        load(pg_env, tmp_path)


def test_optional_course_transport(pg_env, tmp_path):
    assert load(pg_env, tmp_path).course_transport == "local"
    pg_env.update(PYMENTOR_COURSE_TRANSPORT="http", COURSE_CONTENT_URL="https://course.core.svc.cluster.local/api")
    assert load(pg_env, tmp_path).course_content_url == pg_env["COURSE_CONTENT_URL"]
    for value in ("", "ftp://host/path", "http:///missing", "http://host:wrong"):
        pg_env["COURSE_CONTENT_URL"] = value
        with pytest.raises(ValueError):
            load(pg_env, tmp_path)
    pg_env["PYMENTOR_COURSE_TRANSPORT"] = "invalid"
    with pytest.raises(ValueError):
        load(pg_env, tmp_path)


def test_explicit_database_requirement_never_falls_back_to_legacy_file(tmp_path):
    with pytest.raises(ValueError, match="DATABASE_URL"):
        load({"PYMENTOR_REQUIRE_DATABASE_URL": "1"},tmp_path,"legacy_sqlite")
