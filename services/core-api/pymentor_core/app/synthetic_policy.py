"""Strict disposable test URL policy; no connections or lab dependencies."""

from sqlalchemy.engine import make_url


def _validated_url(raw: str):
    url = make_url(raw)
    if (
        url.drivername != "postgresql+asyncpg"
        or url.host != "127.0.0.1"
        or url.port != 57152
        or url.database != "pymentor_test"
        or url.username not in {"pymentor_test", "pymentor_app"}
        or bool(url.query)
    ):
        raise ValueError(
            "Only the disposable local PostgreSQL test instance is permitted"
        )
    return url.set(drivername="postgresql+psycopg")
