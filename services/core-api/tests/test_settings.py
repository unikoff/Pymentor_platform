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


@pytest.mark.parametrize("old_name,new_name", [
    ("PYMENTOR_REDIS_PREFIX", "KNOWI_REDIS_PREFIX"),
    ("PYMENTOR_LOGIN_RECOVERY_KEY", "KNOWI_LOGIN_RECOVERY_KEY"),
])
def test_session_setting_accepts_neutral_name_and_matching_transition(pg_env, tmp_path, old_name, new_name):
    original = pg_env[old_name]
    legacy_only = load(pg_env, tmp_path)
    pg_env[new_name] = original
    both = load(pg_env, tmp_path)
    del pg_env[old_name]
    neutral_only = load(pg_env, tmp_path)
    assert neutral_only == both == legacy_only


@pytest.mark.parametrize("old_name,new_name,other", [
    ("PYMENTOR_REDIS_PREFIX", "KNOWI_REDIS_PREFIX", "different:namespace:"),
    ("PYMENTOR_LOGIN_RECOVERY_KEY", "KNOWI_LOGIN_RECOVERY_KEY", "cd" * 32),
])
def test_session_setting_rejects_conflicting_names_without_leaking_values(pg_env, tmp_path, old_name, new_name, other):
    pg_env[new_name] = other
    with pytest.raises(ValueError) as exc:
        load(pg_env, tmp_path)
    assert old_name in str(exc.value) and new_name in str(exc.value)
    assert other not in str(exc.value) and pg_env[old_name] not in str(exc.value)


def test_empty_neutral_value_does_not_silently_override_legacy_session_key(pg_env, tmp_path):
    pg_env["KNOWI_LOGIN_RECOVERY_KEY"] = ""
    with pytest.raises(ValueError):
        load(pg_env, tmp_path)


@pytest.mark.parametrize("old_name,new_name,value", [
    ("PYMENTOR_REDIS_PREFIX", "KNOWI_REDIS_PREFIX", "pymentor-c216-test:unsafe"),
    ("PYMENTOR_LOGIN_RECOVERY_KEY", "KNOWI_LOGIN_RECOVERY_KEY", "not-a-valid-key"),
])
def test_neutral_session_names_keep_existing_validation(pg_env, tmp_path, old_name, new_name, value):
    del pg_env[old_name]
    pg_env[new_name] = value
    with pytest.raises(ValueError):
        load(pg_env, tmp_path)


def test_neutral_names_preserve_session_keys_and_login_retry(pg_env, tmp_path):
    from pymentor_core.adapters.runtime import RuntimeRedisSessionStore
    from pymentor_core.modules.identity.login_recovery import derive_login_token

    old = load(pg_env, tmp_path)
    pg_env["KNOWI_REDIS_PREFIX"] = pg_env.pop("PYMENTOR_REDIS_PREFIX")
    pg_env["KNOWI_LOGIN_RECOVERY_KEY"] = pg_env.pop("PYMENTOR_LOGIN_RECOVERY_KEY")
    new = load(pg_env, tmp_path)
    old_store = RuntimeRedisSessionStore(old.redis_url, prefix=old.redis_prefix)
    new_store = RuntimeRedisSessionStore(new.redis_url, prefix=new.redis_prefix)
    assert old_store._user_key(17) == new_store._user_key(17)
    operation = "00000000-0000-4000-8000-000000000001"
    assert derive_login_token(bytes.fromhex(old.login_recovery_key), 17, operation) == derive_login_token(
        bytes.fromhex(new.login_recovery_key), 17, operation
    )
