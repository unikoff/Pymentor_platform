"""Real PostgreSQL checks for the managed data layer, explicitly opted in."""
import os
from uuid import uuid4

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.engine import make_url
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session


def test_failed_flush_rolls_back_user_and_session_remains_usable():
    if os.getenv("KNOWI_PG02_INTEGRATION") != "1":
        pytest.skip("requires the dedicated sprint PostgreSQL container")
    url = make_url(os.environ["KNOWI_TEST_PG_URL"])
    assert (url.host, url.port, url.database, url.username) == (
        "127.0.0.1", 57382, "pymentor_test", "pymentor_test"
    )
    engine = create_engine(url.set(database="pg03_runtime_test"))
    from pymentor_core.adapters.sql.models import User

    email = f"pg03-{uuid4().hex}@example.invalid"
    try:
        with Session(engine) as db:
            first = User(username="PG03 rollback", email=email, _password_hash="synthetic")
            db.add(first)
            db.flush()
            assert db.scalar(select(User.id).where(User.email == email)) == first.id
            db.add(User(username="duplicate", email=email, _password_hash="synthetic"))
            with pytest.raises(IntegrityError):
                db.flush()
            db.rollback()
            assert db.scalar(select(User.id).where(User.email == email)) is None
            replacement = User(username="PG03 retry", email=email, _password_hash="synthetic")
            db.add(replacement)
            db.flush()
            assert replacement.id is not None
            db.rollback()
        with Session(engine) as db:
            assert db.scalar(select(User.id).where(User.email == email)) is None
    finally:
        engine.dispose()
