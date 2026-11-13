"""Signed account links must be scoped, temporary, and password-bound."""

import importlib.util

import pytest


def manager():
    assert importlib.util.find_spec("pymentor_core.modules.identity.email_tokens") is not None
    from pymentor_core.modules.identity.email_tokens import EmailTokens

    return EmailTokens("synthetic-only-secret-at-least-32-bytes")


def test_password_link_rejects_other_user_email_purpose_and_changed_hash():
    tokens = manager()
    token = tokens.issue("reset_password", 17, "a@example.test", "old-hash")
    assert tokens.validate(token, "reset_password", 17, "a@example.test", "old-hash")
    assert not tokens.validate(token, "change_password", 17, "a@example.test", "old-hash")
    assert not tokens.validate(token, "reset_password", 18, "a@example.test", "old-hash")
    assert not tokens.validate(token, "reset_password", 17, "b@example.test", "old-hash")
    assert not tokens.validate(token, "reset_password", 17, "a@example.test", "new-hash")
    assert not tokens.validate(token + "x", "reset_password", 17, "a@example.test", "old-hash")


def test_verification_link_cannot_be_used_as_password_link():
    tokens = manager()
    token = tokens.issue("verify_email", 17, "a@example.test", "old-hash")
    assert tokens.validate(token, "verify_email", 17, "a@example.test", "old-hash")
    assert not tokens.validate(token, "reset_password", 17, "a@example.test", "old-hash")
    assert not tokens.validate(token, "verify_email", 17, "a@example.test", "new-hash")


def test_expired_link_is_rejected():
    tokens = manager()
    token = tokens.issue("reset_password", 17, "a@example.test", "old-hash")
    assert tokens.read(token, "reset_password", max_age=-1) is None


def test_reject_weak_signing_key():
    tokens = manager()
    with pytest.raises(ValueError):
        type(tokens)("weak")


def test_transition_reads_neutral_tokens_but_issues_legacy_compatible_links():
    import hashlib
    import hmac

    from itsdangerous import BadSignature, URLSafeTimedSerializer

    secret = "synthetic-only-secret-at-least-32-bytes"
    tokens = manager()
    fingerprint = hmac.new(secret.encode(), b"password-state\0old-hash", hashlib.sha256).hexdigest()
    payload = {"user_id": 17, "email": "a@example.test", "password_state": fingerprint}
    neutral = URLSafeTimedSerializer(secret.encode(), salt="knowi.email.reset_password.v1").dumps(payload)

    assert tokens.validate(neutral, "reset_password", 17, "a@example.test", "old-hash")
    assert not tokens.validate(neutral, "change_password", 17, "a@example.test", "old-hash")
    assert tokens.read(neutral, "reset_password", max_age=-1) is None
    assert tokens.read(neutral + "x", "reset_password") is None

    issued = tokens.issue("reset_password", 17, "a@example.test", "old-hash")
    previous_reader = URLSafeTimedSerializer(secret.encode(), salt="pymentor.email.reset_password.v1")
    assert previous_reader.loads(issued, max_age=1800)["user_id"] == 17
    with pytest.raises(BadSignature):
        previous_reader.loads(neutral, max_age=1800)
