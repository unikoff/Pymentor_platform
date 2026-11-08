"""Deterministic login-cookie tokens for retrying one authenticated operation."""

from uuid import RFC_4122
from uuid import UUID
from uuid import uuid4

import pytest

from pymentor_core.modules.identity.login_recovery import derive_login_token


SECRET = bytes(range(32))
OPERATION_ID = "00112233-4455-4677-8899-aabbccddeeff"


def test_known_vector_uses_domain_separated_framed_inputs():
    assert derive_login_token(SECRET, 42, OPERATION_ID) == "80e5a4aa-f766-41e8-80d5-5dd81423ea18"


def test_repeated_inputs_produce_a_canonical_uuid4_session_token():
    token = derive_login_token(SECRET, 42, OPERATION_ID)

    assert derive_login_token(SECRET, 42, OPERATION_ID) == token
    parsed = UUID(token)
    assert str(parsed) == token
    assert parsed.version == 4
    assert parsed.variant == RFC_4122
    # AsyncIdentitySessions._token_identifiers accepts a canonical UUID string.
    assert len(token) == 36


def test_user_operation_and_secret_each_isolate_the_derived_token():
    other_operation = str(uuid4())
    while other_operation == OPERATION_ID:
        other_operation = str(uuid4())

    tokens = {
        derive_login_token(SECRET, 42, OPERATION_ID),
        derive_login_token(SECRET, 43, OPERATION_ID),
        derive_login_token(SECRET, 42, other_operation),
        derive_login_token(b"k" * 32, 42, OPERATION_ID),
    }

    assert len(tokens) == 4


@pytest.mark.parametrize(
    ("secret", "error"),
    [
        (b"short-secret-marker", ValueError),
        ("sensitive-secret-marker-that-must-not-appear", TypeError),
        (bytearray(b"s" * 32), TypeError),
        (None, TypeError),
    ],
)
def test_secret_is_strictly_validated_without_echoing_its_value(secret, error):
    with pytest.raises(error) as raised:
        derive_login_token(secret, 42, OPERATION_ID)

    assert "sensitive-secret-marker" not in str(raised.value)
    assert "short-secret-marker" not in str(raised.value)


@pytest.mark.parametrize("user_id", [True, False, 1.0, "42", None])
def test_non_integer_user_id_is_rejected(user_id):
    with pytest.raises(TypeError):
        derive_login_token(SECRET, user_id, OPERATION_ID)


@pytest.mark.parametrize("user_id", [0, -1])
def test_non_positive_user_id_is_rejected(user_id):
    with pytest.raises(ValueError):
        derive_login_token(SECRET, user_id, OPERATION_ID)


@pytest.mark.parametrize(
    "operation_id",
    [
        None,
        UUID(OPERATION_ID),
        "00000000-0000-1000-8000-000000000000",
        "00000000-0000-4000-0000-000000000000",
        "00112233-4455-4677-8899-AABBCCDDEEFF",
        "{00112233-4455-4677-8899-aabbccddeeff}",
        "not-a-uuid",
    ],
)
def test_noncanonical_or_non_uuid4_operation_id_is_rejected(operation_id):
    error = TypeError if not isinstance(operation_id, str) else ValueError
    with pytest.raises(error) as raised:
        derive_login_token(SECRET, 42, operation_id)

    assert "aabbccddeeff" not in str(raised.value)
