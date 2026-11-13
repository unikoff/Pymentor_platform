"""Deletion with an account-generation precondition on managed PostgreSQL."""

from types import SimpleNamespace
from threading import Event
from threading import Thread

import pytest
from fastapi import HTTPException
from sqlalchemy import text

from pymentor_core.adapters.sql import models
from pymentor_core.adapters.sql import administration as storage
from pymentor_core.modules.administration.api import service
from test_account_progress_deletion import add_user
from test_account_progress_deletion import database
from test_c2_1_4_auth_legacy import runtime_db


def test_profile_user_and_reference_are_read_together(database):
    _, factory = database
    with factory() as db:
        user_id = add_user(db, "synthetic-profile")
        user, reference = storage._guarded_profile_user(db, user_id)
        assert user.id == user_id
        assert reference == db.scalar(text(
            "SELECT lifecycle_id FROM account_lifecycles WHERE user_id=:uid"
        ), {"uid": user_id})


def test_retry_of_old_delete_cannot_remove_recreated_account(database, monkeypatch):
    _, factory = database
    monkeypatch.setattr(service, "require_admin", lambda *_: SimpleNamespace(id=99999))
    with factory() as db:
        user_id = add_user(db, "synthetic-old")
        generation = db.scalar(text(
            "SELECT lifecycle_id FROM account_lifecycles WHERE user_id=:uid"
        ), {"uid": user_id})
        assert generation
        assert service.delete_user(user_id, None, db, expected_account_ref=generation) == {"deleted": user_id}
    with factory() as db:
        db.add(models.User(id=user_id, username="synthetic-new", email="new@example.test",
                           _password_hash="synthetic-hash"))
        db.add(models.UserLessonProgress(user_id=user_id, lesson_id="new-account-progress"))
        db.commit()
        storage._guarded_profile_user(db, user_id)
        replacement = db.scalar(text(
            "SELECT lifecycle_id FROM account_lifecycles WHERE user_id=:uid"
        ), {"uid": user_id})
        assert replacement and replacement != generation
        with pytest.raises(HTTPException) as error:
            service.delete_user(user_id, None, db, expected_account_ref=generation)
        assert error.value.status_code == 409
        assert db.get(models.User, user_id).email == "new@example.test"
        assert db.query(models.UserLessonProgress).filter_by(user_id=user_id).count() == 1



def test_stale_delete_waiting_for_concurrent_recreation_rejects_new_generation(database, monkeypatch):
    engine, factory = database
    ready, finished = Event(), Event()
    errors = []
    with factory() as db:
        user_id = add_user(db, "old", seed_progress=False)
        old_ref = db.scalar(text("SELECT lifecycle_id FROM account_lifecycles WHERE user_id=:uid"), {"uid": user_id})
    monkeypatch.setattr(service, "require_admin", lambda *_: SimpleNamespace(id=99999))

    def attempt_stale_delete():
        try:
            with factory() as db:
                db.execute(text("SET LOCAL lock_timeout = '3s'"))
                ready.set()
                service.delete_user(user_id, None, db, expected_account_ref=old_ref)
        except Exception as error:
            errors.append(error)
        finally:
            finished.set()

    with engine.begin() as connection:
        connection.execute(text("DELETE FROM users WHERE id=:uid"), {"uid": user_id})
        connection.execute(text("INSERT INTO users(id,username,email,password_hash,is_admin) VALUES (:uid,'new','new@example.test','hash',false)"), {"uid": user_id})
        thread = Thread(target=attempt_stale_delete, daemon=True)
        thread.start()
        assert ready.wait(2) and not finished.wait(0.1)
    assert finished.wait(5)
    thread.join(timeout=1)
    assert len(errors) == 1 and isinstance(errors[0], HTTPException) and errors[0].status_code == 409
    with factory() as db:
        assert db.get(models.User, user_id).email == "new@example.test"
