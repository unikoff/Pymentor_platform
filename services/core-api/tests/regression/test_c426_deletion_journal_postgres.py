"""The deletion marker must commit or roll back with a synthetic account."""

from sqlalchemy import text

from test_account_progress_deletion import add_user
from test_account_progress_deletion import database
from test_c2_1_4_auth_legacy import runtime_db


def test_direct_delete_commits_only_a_generation_marker(database):
    engine, factory = database
    with factory() as db:
        user_id = add_user(db, "synthetic-owner", seed_progress=False)
        ref = db.scalar(text("SELECT lifecycle_id FROM account_lifecycles WHERE user_id=:id"), {"id": user_id})
    with engine.begin() as connection:
        connection.execute(text("DELETE FROM users WHERE id=:id"), {"id": user_id})
        marker = connection.execute(text("SELECT lifecycle_id, user_id FROM account_deletion_events WHERE lifecycle_id=:ref"),
                                    {"ref": ref}).one()
        assert tuple(marker) == (ref, user_id)


def test_rollback_does_not_leave_a_deletion_marker(database):
    engine, factory = database
    with factory() as db:
        user_id = add_user(db, "synthetic-owner", seed_progress=False)
        ref = db.scalar(text("SELECT lifecycle_id FROM account_lifecycles WHERE user_id=:id"), {"id": user_id})
    with engine.connect() as connection:
        transaction = connection.begin()
        connection.execute(text("DELETE FROM users WHERE id=:id"), {"id": user_id})
        assert connection.scalar(text("SELECT count(*) FROM account_deletion_events WHERE lifecycle_id=:ref"), {"ref": ref}) == 1
        transaction.rollback()
    with engine.connect() as connection:
        assert connection.scalar(text("SELECT count(*) FROM users WHERE id=:id"), {"id": user_id}) == 1
        assert connection.scalar(text("SELECT count(*) FROM account_deletion_events WHERE lifecycle_id=:ref"), {"ref": ref}) == 0
