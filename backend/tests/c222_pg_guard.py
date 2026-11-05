"""Fail-closed allowlist for disposable local PostgreSQL integration tests."""

from sqlalchemy.engine import make_url


def validate_test_url(raw: str):
    url = make_url(raw)
    if (url.drivername != "postgresql+asyncpg" or url.host not in {"127.0.0.1", "localhost", "::1"}
            or url.port != 57152 or url.database != "pymentor_test" or url.username != "pymentor_test"
            or bool(url.query)):
        raise ValueError("PostgreSQL test URL is outside the disposable local allowlist")
    return url
