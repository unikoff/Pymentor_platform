"""Account generation stability, ID reuse and rollback on managed PostgreSQL."""
from uuid import UUID, uuid4

from sqlalchemy import text

from pymentor_core.adapters.sql import administration as storage, models
from test_account_progress_deletion import add_user, database
from test_c2_1_4_auth_legacy import runtime_db


def test_generation_is_stable_and_numeric_id_reuse_gets_new_generation(database):
    _, factory = database
    with factory() as db:
        uid = add_user(db, "old", seed_progress=False)
        _, old = storage._guarded_profile_user(db, uid)
        assert str(UUID(old)) == old and UUID(old).version == 4
        assert storage._guarded_profile_user(db, uid)[1] == old
        db.execute(text("DELETE FROM users WHERE id=:id"), {"id": uid})
        assert db.scalar(text("SELECT count(*) FROM account_lifecycles WHERE user_id=:id"), {"id": uid}) == 0
        db.expunge_all()
        db.add(models.User(id=uid, username="new", email="new@example.test", _password_hash="synthetic"))
        db.commit()
        user, new = storage._guarded_profile_user(db, uid)
        assert str(UUID(new)) == new and UUID(new).version == 4 and new != old
        assert user.email == "new@example.test"
        assert storage._guarded_profile_user(db, uid)[1] == new


def test_rollback_restores_original_generation(database):
    engine, factory = database
    with factory() as db:
        uid = add_user(db, "old", seed_progress=False)
        _, old = storage._guarded_profile_user(db, uid)
    with engine.connect() as connection:
        transaction = connection.begin()
        connection.execute(text("DELETE FROM users WHERE id=:id"), {"id": uid})
        connection.execute(text("INSERT INTO users(id,username,email,password_hash,is_admin) VALUES (:id,'new','new@example.test','synthetic',false)"), {"id": uid})
        connection.execute(text("INSERT INTO account_lifecycles(user_id,lifecycle_id) VALUES (:id,:ref)"), {"id": uid, "ref": str(uuid4())})
        assert connection.scalar(text("SELECT lifecycle_id FROM account_lifecycles WHERE user_id=:id"), {"id": uid}) != old
        transaction.rollback()
    with factory() as db:
        assert db.scalar(text("SELECT lifecycle_id FROM account_lifecycles WHERE user_id=:id"), {"id": uid}) == old
        assert db.get(models.User, uid).email == "old@example.test"
