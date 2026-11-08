"""Synthetic demonstration of stale SQLite cookie invalidation, never a migration tool."""

import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy import delete
from sqlalchemy.orm import Session
from starlette.requests import Request

from pymentor_core.adapters.sql import models
from pymentor_core.modules.identity.api.sessions import get_current_user


def test_old_cookie_requires_explicit_invalidation_before_sqlite_rollback():
    engine = create_engine("sqlite:///:memory:")
    models.Base.metadata.create_all(engine)
    cookie = "synthetic-legacy-cookie"
    request = Request({"type": "http", "method": "GET", "path": "/", "headers": [
        (b"cookie", f"session={cookie}".encode()),
    ]})
    try:
        with Session(engine) as db:
            user = models.User(username="synthetic", email="synthetic@example.test", password="synthetic-password")
            db.add(user)
            db.flush()
            db.add(models.Session(user_id=user.id, session_token=cookie))
            db.commit()
            # This isolated old database has no record of a later external revoke.
            assert get_current_user(request, db).id == user.id
            # A real rollback must first execute an approved invalidation procedure;
            # this test deletes only synthetic rows in this in-memory database.
            db.execute(delete(models.Session))
            db.commit()
            with pytest.raises(HTTPException) as exc:
                get_current_user(request, db)
            assert exc.value.status_code == 401
    finally:
        engine.dispose()
