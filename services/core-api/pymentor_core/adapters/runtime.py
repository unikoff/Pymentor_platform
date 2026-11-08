"""Explicit runtime policies for the existing bounded async adapters."""

from urllib.parse import urlsplit

from sqlalchemy.engine import make_url
from sqlalchemy.exc import ArgumentError

from pymentor_core.adapters.postgres.identity_sessions import AsyncIdentitySessions
from pymentor_core.adapters.postgres.async_database import AsyncDatabase
from pymentor_core.adapters.redis.sessions import RedisSessionStore


def _runtime_database_url(url):
    try:
        parsed = make_url(url)
        valid = (
            parsed.drivername == "postgresql+asyncpg"
            and all(
                isinstance(value, str) and value.strip()
                for value in (parsed.host, parsed.username, parsed.database)
            )
            and not parsed.query
        )
        if not valid:
            raise ValueError
    except (ArgumentError, ValueError, TypeError):
        raise ValueError("Invalid runtime PostgreSQL asyncpg URL") from None
    return parsed


class RuntimeAsyncDatabase(AsyncDatabase):
    def _validate_url(self, url: str) -> None:
        _runtime_database_url(url)


class RuntimeRedisSessionStore(RedisSessionStore):
    def _validate_connection(self, url: str, prefix: str) -> None:
        try:
            parsed = urlsplit(url)
            valid = (
                parsed.scheme in {"redis", "rediss"}
                and bool(parsed.hostname)
                and not any(char.isspace() for char in url)
                and not parsed.query
                and not parsed.fragment
                and (
                    not parsed.path
                    or parsed.path == "/"
                    or (parsed.path.startswith("/") and parsed.path[1:].isdigit())
                )
            )
            parsed.port
        except (ValueError, TypeError):
            valid = False
        if not valid:
            raise ValueError("Invalid runtime Redis URL") from None
        if (
            not isinstance(prefix, str)
            or not prefix.strip()
            or prefix.lower().startswith("pymentor-c216-test")
        ):
            raise ValueError("An environment-specific Redis prefix is required")


class RuntimeIdentitySessions(AsyncIdentitySessions):
    def _validate_database(self, database) -> None:
        _runtime_database_url(database.engine.url)
