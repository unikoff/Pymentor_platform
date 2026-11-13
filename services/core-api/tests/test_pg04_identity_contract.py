from types import SimpleNamespace

import pytest
from fastapi import HTTPException
from sqlalchemy.engine import make_url


@pytest.mark.parametrize("profile", [None, "legacy", "postgres_redis"])
def test_missing_identity_service_fails_closed_for_every_profile(profile, monkeypatch):
    from pymentor_core.modules.identity.api.sessions import require_identity
    monkeypatch.delenv("PYMENTOR_DUAL_LOCAL_TEST", raising=False)
    request = SimpleNamespace(app=SimpleNamespace(state=SimpleNamespace(profile=profile)))
    with pytest.raises(HTTPException) as exc:
        require_identity(request)
    assert exc.value.status_code == 503


def test_identity_service_does_not_depend_on_profile_or_lab_switch(monkeypatch):
    from pymentor_core.modules.identity.api.sessions import require_identity
    monkeypatch.setenv("PYMENTOR_DUAL_LOCAL_TEST", "0")
    identity = object()
    request = SimpleNamespace(app=SimpleNamespace(state=SimpleNamespace(identity_sessions=identity)))
    assert require_identity(request) is identity


def test_runtime_refuses_sql_session_mode_before_connecting():
    from pymentor_core.adapters.runtime import RuntimeIdentitySessions
    database = SimpleNamespace(engine=SimpleNamespace(url=make_url(
        "postgresql+asyncpg://app:unused@127.0.0.1:9/app")))
    with pytest.raises(ValueError, match="Redis"):
        RuntimeIdentitySessions(database, object(), mode="sql")


def test_email_rate_limit_has_no_process_fallback():
    from pymentor_core.modules.identity.api.email_actions import _request_allowed
    request = SimpleNamespace(app=SimpleNamespace(state=SimpleNamespace()))
    with pytest.raises(HTTPException) as exc:
        _request_allowed(request, "reset-email", "synthetic@example.invalid")
    assert exc.value.status_code == 503
