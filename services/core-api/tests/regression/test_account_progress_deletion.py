"""Synthetic SQLite checks for progress retention and account deletion."""
from types import SimpleNamespace
from threading import Event
from threading import Thread
from datetime import date

import pytest
from sqlalchemy import create_engine
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker

from pymentor_core.adapters.legacy_sqlite import bootstrap
from pymentor_core.adapters.sql import models
from pymentor_core.app.database import Base
from pymentor_core.modules.administration.api import service


@pytest.fixture
def database(monkeypatch):
    engine = create_engine('sqlite:///:memory:')
    Base.metadata.create_all(engine)
    monkeypatch.setattr(bootstrap, 'engine', engine)
    monkeypatch.setattr(bootstrap, 'ensure_default_landing', lambda: None)
    monkeypatch.setattr(bootstrap, 'get_legacy_lesson_id_map', lambda: {})
    bootstrap.ensure_schema()
    factory = sessionmaker(bind=engine)
    try:
        yield engine, factory
    finally:
        engine.dispose()


def add_user(db, username):
    user = models.User(username=username, email=f'{username}@example.test', _password_hash='synthetic-hash')
    db.add(user)
    db.flush()
    db.add_all([
        models.UserActivityDay(user_id=user.id, activity_date=date(2026, 1, 1)),
        models.UserLessonProgress(user_id=user.id, lesson_id='lesson-synthetic'),
        models.UserTaskProgress(user_id=user.id, task_id='task-synthetic', task_revision='revision'),
    ])
    db.commit()
    return user.id


def counts(db, user_id):
    return tuple(db.query(model).filter_by(user_id=user_id).count()
                 for model in (models.UserActivityDay, models.UserLessonProgress, models.UserTaskProgress))


def test_admin_deletion_removes_only_target_progress(database, monkeypatch):
    _, factory = database
    with factory() as db:
        target, other = add_user(db, 'synthetic-target'), add_user(db, 'synthetic-other')
        monkeypatch.setattr(service, 'require_admin', lambda *_: SimpleNamespace(id=99999))
        assert service.delete_user(target, None, db) == {'deleted': target}
        assert counts(db, target) == (0, 0, 0)
        assert counts(db, other) == (1, 1, 1)


def test_direct_deletion_cannot_leave_progress(database):
    engine, factory = database
    with factory() as db:
        target, other = add_user(db, 'synthetic-target'), add_user(db, 'synthetic-other')
    with engine.begin() as connection:
        assert connection.scalar(text('PRAGMA foreign_keys')) == 0
        connection.execute(text('DELETE FROM users WHERE id=:id'), {'id': target})
    with factory() as db:
        assert counts(db, target) == (0, 0, 0)
        assert counts(db, other) == (1, 1, 1)


@pytest.mark.parametrize('table,columns,values', [
    ('user_activity_days', 'user_id,activity_date', ':id,\'2026-01-02\''),
    ('user_lesson_progress', 'user_id,lesson_id', ':id,\'lesson-late\''),
    ('user_task_progress', 'user_id,task_id,task_revision', ':id,\'task-late\',\'revision\''),
])
def test_late_progress_write_is_rejected_after_account_removal(database, table, columns, values):
    engine, factory = database
    with factory() as db:
        target = add_user(db, 'synthetic-target')
    with engine.begin() as connection:
        connection.execute(text('DELETE FROM users WHERE id=:id'), {'id': target})
    with pytest.raises(IntegrityError):
        with engine.begin() as connection:
            connection.execute(text(f'INSERT INTO {table} ({columns}) VALUES ({values})'), {'id': target})


@pytest.mark.parametrize('table', ['user_activity_days', 'user_lesson_progress', 'user_task_progress'])
def test_progress_cannot_be_reassigned_to_missing_account(database, table):
    engine, factory = database
    with factory() as db:
        user_id = add_user(db, 'synthetic-owner')
    with pytest.raises(IntegrityError):
        with engine.begin() as connection:
            connection.execute(text(f'UPDATE {table} SET user_id=999999 WHERE user_id=:id'), {'id': user_id})
    with factory() as db:
        assert counts(db, user_id) == (1, 1, 1)


def test_delete_rollback_restores_account_and_progress(database):
    engine, factory = database
    with factory() as db:
        user_id = add_user(db, 'synthetic-owner')
    with engine.connect() as connection:
        transaction = connection.begin()
        connection.execute(text('DELETE FROM users WHERE id=:id'), {'id': user_id})
        assert connection.scalar(text('SELECT COUNT(*) FROM user_lesson_progress WHERE user_id=:id'), {'id': user_id}) == 0
        transaction.rollback()
    with factory() as db:
        assert db.get(models.User, user_id) is not None
        assert counts(db, user_id) == (1, 1, 1)


def test_installation_preserves_preexisting_orphan():
    from pymentor_core.adapters.legacy_sqlite.progress_integrity import ensure_sqlite_progress_integrity

    engine = create_engine('sqlite:///:memory:')
    try:
        Base.metadata.create_all(engine)
        with engine.begin() as connection:
            connection.execute(text("INSERT INTO user_lesson_progress (user_id, lesson_id) VALUES (999999, 'legacy-orphan')"))
        ensure_sqlite_progress_integrity(engine)
        ensure_sqlite_progress_integrity(engine)
        with engine.connect() as connection:
            assert connection.scalar(text('SELECT COUNT(*) FROM user_lesson_progress WHERE user_id=999999')) == 1
    finally:
        engine.dispose()


def test_concurrent_late_completion_cannot_recreate_progress(tmp_path):
    from pymentor_core.adapters.legacy_sqlite.progress_integrity import ensure_sqlite_progress_integrity

    engine = create_engine(f'sqlite:///{(tmp_path / "synthetic.sqlite").as_posix()}',
                           connect_args={'check_same_thread': False, 'timeout': 5})
    ready, finished = Event(), Event()
    errors = []
    try:
        Base.metadata.create_all(engine)
        ensure_sqlite_progress_integrity(engine)
        factory = sessionmaker(bind=engine)
        with factory() as db:
            user_id = add_user(db, 'synthetic-owner')

        def complete_late():
            try:
                with engine.begin() as connection:
                    ready.set()
                    connection.execute(text("INSERT INTO user_lesson_progress (user_id,lesson_id) VALUES (:id,'late')"),
                                       {'id': user_id})
            except Exception as error:
                errors.append(error)
            finally:
                finished.set()

        with engine.connect() as connection:
            transaction = connection.begin()
            connection.execute(text('DELETE FROM users WHERE id=:id'), {'id': user_id})
            thread = Thread(target=complete_late, daemon=True)
            thread.start()
            try:
                assert ready.wait(2)
                assert not finished.wait(0.1)
            finally:
                transaction.commit()
            assert finished.wait(5)
            thread.join(timeout=1)
        assert len(errors) == 1 and isinstance(errors[0], IntegrityError)
        with factory() as db:
            assert counts(db, user_id) == (0, 0, 0)
    finally:
        engine.dispose()
