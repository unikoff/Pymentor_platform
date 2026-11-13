"""Explicit, side-effect-free configuration for the Core application."""

from dataclasses import dataclass
from dataclasses import field
import os
from pathlib import Path
import re
from typing import Mapping
from urllib.parse import urlsplit

from sqlalchemy.engine import URL
from sqlalchemy.engine import make_url
from sqlalchemy.exc import ArgumentError


def _database_url(value: str) -> URL:
    try:
        return make_url(value)
    except (ArgumentError, ValueError, TypeError):
        raise ValueError("Invalid DATABASE_URL") from None


def _network_url(value: str, schemes: set[str], name: str) -> None:
    try:
        parsed = urlsplit(value)
        valid = (
            parsed.scheme in schemes
            and bool(parsed.hostname)
            and not parsed.fragment
            and (name != "REDIS_URL" or not parsed.query)
            and not any(char.isspace() for char in value)
        )
        # Accessing port also validates malformed or out-of-range ports.
        parsed.port
    except ValueError:
        valid = False
    if not valid:
        raise ValueError(f"Invalid {name}") from None


def _compatible_setting(env: Mapping[str, str], neutral: str, legacy: str) -> str:
    """Allow either name during rollout, but reject ambiguous session state."""
    if neutral in env and legacy in env and env[neutral] != env[legacy]:
        raise ValueError(f"Conflicting {neutral} and {legacy}")
    return env.get(neutral, env.get(legacy, ""))


@dataclass(frozen=True)
class Settings:
    profile: str
    database_url: str = field(repr=False)
    synchronous_database_url: str = field(repr=False)
    async_database_url: str = field(repr=False)
    redis_url: str | None = field(default=None, repr=False)
    redis_prefix: str | None = None
    login_recovery_key: str | None = field(default=None, repr=False)
    course_transport: str = "local"
    course_content_url: str | None = field(default=None, repr=False)

    @classmethod
    def from_environment(
        cls,
        profile: str | None = None,
        environ: Mapping[str, str] | None = None,
        *,
        legacy_root: Path,
    ) -> "Settings":
        env = os.environ if environ is None else environ
        selected = profile if profile is not None else env.get("PYMENTOR_PROFILE")
        if selected not in {"legacy_sqlite", "postgres_redis"}:
            raise ValueError("Missing or invalid PYMENTOR_PROFILE")

        raw_database = env.get("DATABASE_URL", "")
        if (
            env.get("PYMENTOR_REQUIRE_DATABASE_URL", "").strip().lower()
            in {"1", "true", "yes", "on"}
            and not raw_database.strip()
        ):
            raise ValueError("Required environment variable DATABASE_URL is not set")
        if selected == "legacy_sqlite":
            if not raw_database or raw_database == "sqlite:///./test.db":
                url = URL.create(
                    "sqlite", database=str((legacy_root / "test.db").resolve())
                )
            else:
                url = _database_url(raw_database)
                if (
                    url.drivername != "sqlite"
                    or url.username
                    or url.password
                    or url.host
                    or url.query
                    or (
                        url.database not in (None, ":memory:")
                        and not Path(url.database).is_absolute()
                    )
                ):
                    raise ValueError("Invalid DATABASE_URL for legacy_sqlite")
            sync_url = async_url = url
        else:
            if not raw_database:
                raise ValueError("DATABASE_URL is required for postgres_redis")
            url = _database_url(raw_database)
            if (
                url.drivername not in {"postgresql+psycopg", "postgresql+asyncpg"}
                or url.query
                or not url.host
                or not url.username
                or not url.database
                or not url.host.strip()
                or not url.username.strip()
                or not url.database.strip()
            ):
                raise ValueError("Invalid DATABASE_URL for postgres_redis")
            sync_url = url.set(drivername="postgresql+psycopg")
            async_url = url.set(drivername="postgresql+asyncpg")

        redis_url = redis_prefix = recovery_key = None
        if selected == "postgres_redis":
            redis_url = env.get("REDIS_URL", "")
            _network_url(redis_url, {"redis", "rediss"}, "REDIS_URL")
            redis_prefix = _compatible_setting(
                env, "KNOWI_REDIS_PREFIX", "PYMENTOR_REDIS_PREFIX"
            )
            if not redis_prefix.strip() or redis_prefix.lower().startswith(
                "pymentor-c216-test"
            ):
                raise ValueError("Invalid PYMENTOR_REDIS_PREFIX")
            recovery_key = _compatible_setting(
                env, "KNOWI_LOGIN_RECOVERY_KEY", "PYMENTOR_LOGIN_RECOVERY_KEY"
            )
            if not re.fullmatch(r"[0-9a-fA-F]{64}", recovery_key):
                raise ValueError("Invalid PYMENTOR_LOGIN_RECOVERY_KEY")

        transport = env.get("PYMENTOR_COURSE_TRANSPORT", "local")
        if transport not in {"local", "http"}:
            raise ValueError("Invalid PYMENTOR_COURSE_TRANSPORT")
        course_url = env.get("COURSE_CONTENT_URL")
        if transport == "http":
            _network_url(course_url or "", {"http", "https"}, "COURSE_CONTENT_URL")

        return cls(
            profile=selected,
            database_url=url.render_as_string(hide_password=False),
            synchronous_database_url=sync_url.render_as_string(hide_password=False),
            async_database_url=async_url.render_as_string(hide_password=False),
            redis_url=redis_url,
            redis_prefix=redis_prefix,
            login_recovery_key=recovery_key,
            course_transport=transport,
            course_content_url=course_url,
        )
