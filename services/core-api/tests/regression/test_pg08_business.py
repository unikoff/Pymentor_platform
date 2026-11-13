"""Real HTTP/PG/Redis business boundaries replacing SQLite-only golden cases."""
from datetime import date
from types import SimpleNamespace
from unittest.mock import patch

import pytest
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

import test_c2_1_4_auth_legacy as http
from test_c2_1_4_auth_legacy import runtime_db
from pymentor_core.adapters.sql import models, progress
from pymentor_core.adapters.sql import administration


def account(email):
    created = http.register(email=email)
    assert created.status == 200
    token = http.login(email=email).cookie().value
    return created.data["user"]["id"], token


def seed_progress(db, uid):
    db.add_all([models.UserActivityDay(user_id=uid, activity_date=date(2026, 1, 1)),
                models.UserLessonProgress(user_id=uid, lesson_id="pg08-stable"),
                models.UserTaskProgress(user_id=uid, task_id="pg08-task", task_revision="revision")])
    db.commit()


def counts(db, uid):
    return tuple(db.query(model).filter_by(user_id=uid).count() for model in
                 (models.UserActivityDay, models.UserLessonProgress, models.UserTaskProgress))


def test_actual_admin_delete_revokes_only_target_and_cascades_progress(runtime_db):
    admin, admin_token = account("admin@example.test")
    target, target_token = account("target@example.test")
    other, other_token = account("other@example.test")
    with runtime_db() as db:
        db.get(models.User, admin).is_admin = True
        seed_progress(db, target)
        seed_progress(db, other)
        ref = db.scalar(text("SELECT lifecycle_id FROM account_lifecycles WHERE user_id=:uid"), {"uid": target})
    result = http.call("DELETE", f"/api/admin/users/{target}", cookie=admin_token, headers={"X-Account-Ref": ref})
    assert result.status == 200 and result.data == {"deleted": target}
    assert http.call("GET", "/api/user/me", cookie=target_token).status == 401
    assert http.call("GET", "/api/user/me", cookie=other_token).status == 200
    with runtime_db() as db:
        assert counts(db, target) == (0, 0, 0) and counts(db, other) == (1, 1, 1)
        assert db.scalar(text("SELECT count(*) FROM account_deletion_events WHERE lifecycle_id=:ref"), {"ref": ref}) == 1


def test_stale_admin_delete_cannot_remove_recreated_numeric_account(runtime_db):
    admin, admin_token = account("admin@example.test")
    target, _ = account("target@example.test")
    with runtime_db() as db:
        db.get(models.User, admin).is_admin = True
        db.commit()
        ref = db.scalar(text("SELECT lifecycle_id FROM account_lifecycles WHERE user_id=:uid"), {"uid": target})
    deleted = http.call("DELETE", f"/api/admin/users/{target}", cookie=admin_token, headers={"X-Account-Ref": ref})
    assert deleted.status == 200
    with runtime_db() as db:
        db.add(models.User(id=target, username="Replacement", email="replacement@example.test", _password_hash="synthetic"))
        db.flush()
        seed_progress(db, target)
    response = http.call("DELETE", f"/api/admin/users/{target}", cookie=admin_token, headers={"X-Account-Ref": ref})
    assert response.status == 409
    with runtime_db() as db:
        assert db.get(models.User, target).email == "replacement@example.test"
        assert counts(db, target) == (1, 1, 1)


def test_delete_rollback_restores_account_progress_and_deletion_journal(runtime_db):
    uid, token = account("rollback@example.test")
    with runtime_db() as db:
        seed_progress(db, uid)
        with patch.object(db, "commit", side_effect=RuntimeError("synthetic delete commit failure")):
            with pytest.raises(RuntimeError, match="delete commit failure"):
                administration.delete_user(uid, SimpleNamespace(id=99999), db)
        db.rollback()
        assert db.get(models.User, uid) is not None
        assert counts(db, uid) == (1, 1, 1)
        assert db.scalar(text("SELECT count(*) FROM account_deletion_events WHERE user_id=:uid"), {"uid": uid}) == 0
    assert http.call("GET", "/api/user/me", cookie=token).status == 200


@pytest.mark.parametrize("model,values", [
    (models.UserActivityDay, {"activity_date": date(2026, 1, 1)}),
    (models.UserLessonProgress, {"lesson_id": "late"}),
    (models.UserTaskProgress, {"task_id": "late", "task_revision": "revision"}),
])
def test_foreign_keys_reject_late_progress_after_delete(runtime_db, model, values):
    uid = http.register(email="late@example.test").data["user"]["id"]
    with runtime_db() as db:
        db.execute(text("DELETE FROM users WHERE id=:uid"), {"uid": uid})
        db.commit()
        db.add(model(user_id=uid, **values))
        with pytest.raises(IntegrityError):
            db.commit()
        db.rollback()


def test_activity_is_idempotent_and_isolated_between_accounts(runtime_db):
    first, token = account("activity@example.test")
    other, other_token = account("other@example.test")
    for _ in range(2):
        assert http.call("POST", "/api/user/activity/visit", body={}, cookie=token).status == 200
    with runtime_db() as db:
        assert db.query(models.UserActivityDay).filter_by(user_id=first).count() == 1
        assert db.query(models.UserActivityDay).filter_by(user_id=other).count() == 0
    assert http.call("POST", "/api/user/activity/visit", body={}, cookie=other_token).status == 200


def test_task_revision_updates_existing_row_and_keeps_other_user(runtime_db):
    first, _ = account("progress@example.test")
    other, _ = account("other@example.test")
    with runtime_db() as db:
        progress.mark_task_completed(first, "stable-task", "old", db)
        progress.mark_task_completed(other, "stable-task", "other", db)
        progress.mark_task_completed(first, "stable-task", "new", db)
        progress.mark_task_completed(first, "stable-task", "new", db)
        assert db.query(models.UserTaskProgress).count() == 2
        assert progress.get_completed_task_revisions(first, ["stable-task"], db) == {"stable-task": "new"}
        assert progress.get_completed_task_revisions(other, ["stable-task"], db) == {"stable-task": "other"}
