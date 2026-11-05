"""Password compatibility on synthetic, in-memory SQLite only."""

import bcrypt
import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from db import models
from db.engine import Base
from identity.passwords import hash_password, is_bcrypt_hash, verify_password


@pytest.fixture(params=(models.User, models.Admin), ids=("user", "admin"))
def model_cls(request):
    return request.param


@pytest.fixture
def session():
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine, tables=[models.User.__table__, models.Admin.__table__])
    with Session(engine) as db:
        yield db
    engine.dispose()


def test_plaintext_password_constructor_and_sqlite_round_trip(model_cls, session):
    plaintext = "correct horse battery staple"
    account = model_cls(username="Person", email="person@example.test", password=plaintext)
    assert account.password != plaintext
    assert account.password.startswith("$2")
    assert account.verify_password(plaintext) is True
    assert account.verify_password("incorrect") is False

    session.add(account)
    session.commit()
    session.expire_all()
    stored = session.scalar(select(model_cls).where(model_cls.email == "person@example.test"))
    assert stored.password == account.password
    assert stored.verify_password(plaintext) is True


@pytest.mark.parametrize("prefix", ("$2a$", "$2b$", "$2y$"))
@pytest.mark.parametrize("constructor_field", ("password", "_password_hash"))
def test_legacy_bcrypt_hash_is_accepted_without_rehash(model_cls, constructor_field, prefix, session):
    legacy_hash = prefix + bcrypt.hashpw(b"legacy-password", bcrypt.gensalt(rounds=4)).decode()[4:]
    kwargs = {constructor_field: legacy_hash}
    account = model_cls(username="Legacy", email="legacy@example.test", **kwargs)
    assert account.password == legacy_hash
    session.add(account)
    session.commit()
    session.expire_all()

    stored = session.scalar(select(model_cls).where(model_cls.email == "legacy@example.test"))
    assert stored.password == legacy_hash
    assert stored.verify_password("legacy-password") is True
    assert stored.verify_password("incorrect") is False


def test_empty_password_and_hash_prefix_semantics_are_unchanged(model_cls):
    with pytest.raises(ValueError, match="^Password cannot be empty$"):
        model_cls(username="Empty", email="empty@example.test", password="")

    account = model_cls(username="Test", email="test@example.test", password="$2b$unvalidated")
    assert account.password == "$2b$unvalidated"
    with pytest.raises(ValueError, match="^Password cannot be empty$"):
        account.password = ""
    assert account.password == "$2b$unvalidated"


@pytest.mark.parametrize("stored_hash", ("$2b$invalid", "not-a-bcrypt-hash"))
def test_invalid_bcrypt_hash_propagates_original_error(model_cls, stored_hash):
    account = model_cls(username="Broken", email="broken@example.test", _password_hash=stored_hash)
    with pytest.raises(ValueError) as original_error:
        bcrypt.checkpw(b"password", stored_hash.encode())
    with pytest.raises(type(original_error.value)) as actual_error:
        account.verify_password("password")
    assert str(actual_error.value) == str(original_error.value)


def test_model_helpers_are_reexported_and_schema_unchanged(model_cls):
    assert models._hash_password is hash_password
    assert models._is_bcrypt_hash is is_bcrypt_hash
    assert verify_password("test", bcrypt.hashpw(b"test", bcrypt.gensalt(rounds=4)).decode())
    column = model_cls.__table__.c.password_hash
    assert column.type.length == 255
    assert column.nullable is False
    assert "password" not in model_cls.__table__.columns
