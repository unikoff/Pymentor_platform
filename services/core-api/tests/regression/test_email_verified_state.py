"""Verification status is persisted and exposed without altering account access."""

import os
import importlib.util
import threading
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from types import SimpleNamespace

os.environ["PYTHON_DOTENV_DISABLED"] = "1"

from sqlalchemy import select
from sqlalchemy import text
from sqlalchemy.orm import Session

from pymentor_core.adapters.sql.models import User
from test_c2_1_4_auth_legacy import runtime_db
from pymentor_core.app.database import engine
from pymentor_core.modules.identity.access import serialize_user
from pymentor_core.modules.identity.api.schemas import UserPublic


def test_verified_defaults_false_and_serializes_after_confirmation(runtime_db):
    assert "verified" in User.__table__.columns
    with Session(engine) as db:
        user = User(username="student", email="student@example.test", password="test-password")
        db.add(user)
        db.commit()
        assert user.verified is False
        assert UserPublic.model_validate(serialize_user(user)).verified is False
        user.verified = True
        db.commit()
    with Session(engine) as db:
        user = db.scalar(select(User))
        assert UserPublic.model_validate(serialize_user(user)).verified is True






def test_parallel_password_links_cannot_both_be_applied(runtime_db, monkeypatch):
    from pymentor_core.adapters.sql import email_auth
    from pymentor_core.modules.identity.email_tokens import EmailTokens

    secret = "synthetic-only-secret-at-least-32-bytes"
    monkeypatch.setenv("PYMENTOR_EMAIL_TOKEN_SECRET", secret)
    with Session(engine) as db:
        user = User(username="student", email="student@example.test", password="test-password", verified=True)
        db.add(user)
        db.commit()
        token = EmailTokens(secret).issue("reset_password", user.id, user.email, user.password)

    barrier = threading.Barrier(2, timeout=10)
    original_hash = email_auth.hash_password
    def synchronized_hash(password):
        result = original_hash(password)
        barrier.wait()
        return result
    monkeypatch.setattr(email_auth, "hash_password", synchronized_hash)

    def reset(password):
        with Session(engine) as db:
            return email_auth.confirm_password(db, token, password)

    with ThreadPoolExecutor(max_workers=2) as executor:
        outcomes = list(executor.map(reset, ["replacement-one", "replacement-two"]))
    assert sorted(outcomes) == [False, True]


def test_parallel_email_change_confirmations_complete_once(runtime_db, monkeypatch):
    from pymentor_core.adapters.sql import email_auth
    from pymentor_core.adapters.sql.models import EmailChangeRequest

    secret = "synthetic-only-secret-at-least-32-bytes"
    monkeypatch.setenv("PYMENTOR_EMAIL_TOKEN_SECRET", secret)
    sent = []
    monkeypatch.setattr(email_auth, "send_account_email", lambda config, recipient, purpose, token, **kwargs: sent.append(token))
    with Session(engine) as db:
        user = User(username="student", email="old@example.test", password="test-password", verified=True)
        db.add(user)
        db.commit()
        email_auth.send_email_change(db, user, "new@example.test")
    barrier = threading.Barrier(2, timeout=10)
    def change(token):
        with Session(engine) as db:
            barrier.wait()
            return email_auth.confirm_email_change(db, token)
    with ThreadPoolExecutor(max_workers=2) as executor:
        results = list(executor.map(change, sent))
    assert sorted(results) == ["completed", "pending"]
    with Session(engine) as db:
        user = db.scalar(select(User))
        assert user.email == "new@example.test" and user.verified is True


def test_managed_migration_only_adds_false_default_and_refuses_data_loss(monkeypatch):
    import pytest
    from sqlalchemy import Boolean
    from pymentor_core.app.schema_policy import SCHEMA_REVISION

    path = Path(__file__).resolve().parents[2] / "migrations" / "versions" / "c501_verified.py"
    spec = importlib.util.spec_from_file_location("email_verified_migration", path)
    migration = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(migration)
    captured = []
    monkeypatch.setattr(migration, "op", SimpleNamespace(add_column=lambda table, column: captured.append((table, column))))
    migration.upgrade()
    assert migration.down_revision == "c426_deletion_outbox"
    assert migration.revision == "c501_verified"
    assert SCHEMA_REVISION == "c503_dual_email_change"
    assert len(captured) == 1
    table, column = captured[0]
    assert table == "users" and column.name == "verified"
    assert isinstance(column.type, Boolean) and column.nullable is False
    assert str(column.server_default.arg) == "false"
    with pytest.raises(RuntimeError):
        migration.downgrade()
