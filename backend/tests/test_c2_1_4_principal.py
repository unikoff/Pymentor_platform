from dataclasses import FrozenInstanceError
from types import SimpleNamespace

import pytest

from identity.principal import Principal, require_admin
from fastapi import HTTPException


def test_principal_contains_only_server_derived_access_and_no_credentials():
    user = SimpleNamespace(id=12, username="test", email="test@example.test", is_admin=False,
                           subscription_until=None, password="not-exposed", session_token="not-exposed")
    principal = Principal.from_user(user)
    assert principal.user_id == 12
    assert principal.roles == frozenset({"student"})
    assert "admin.access" not in principal.permissions
    assert not hasattr(principal, "password")
    assert not hasattr(principal, "session_token")
    with pytest.raises(FrozenInstanceError):
        principal.user_id = 99
    with pytest.raises(HTTPException) as denied:
        require_admin(principal)
    assert denied.value.status_code == 403
    assert denied.value.detail == "Требуются права администратора"


def test_admin_permission_comes_from_the_verified_user_record():
    user = SimpleNamespace(id=13, username="admin", email="admin@example.test", is_admin=True,
                           subscription_until=None)
    principal = Principal.from_user(user)
    assert principal.roles == frozenset({"student", "admin"})
    assert "admin.access" in principal.permissions
    assert require_admin(principal) is principal
