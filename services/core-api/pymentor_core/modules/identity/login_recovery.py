"""Deterministic cookie-token derivation for an authenticated login retry."""

import hashlib
import hmac
from uuid import RFC_4122
from uuid import UUID


_DOMAIN = b"pymentor:identity:login-cookie-token:v1\x00"


def derive_login_token(secret: bytes, user_id: int, operation_id: str) -> str:
    """Derive a stable UUID4-shaped token for one user and login operation.

    This derivation does not authenticate a login. Callers must verify the
    password on every retry; an operation ID alone grants no authority.
    """
    if type(secret) is not bytes:
        raise TypeError("secret must be bytes")
    if len(secret) < 32:
        raise ValueError("secret must contain at least 32 bytes")

    if type(user_id) is not int:
        raise TypeError("user_id must be an integer")
    if user_id <= 0:
        raise ValueError("user_id must be positive")

    if type(operation_id) is not str:
        raise TypeError("operation_id must be a string")
    try:
        parsed_operation_id = UUID(operation_id)
    except ValueError:
        raise ValueError("operation_id must be a canonical UUID4 string") from None
    if (
        str(parsed_operation_id) != operation_id
        or parsed_operation_id.version != 4
        or parsed_operation_id.variant != RFC_4122
    ):
        raise ValueError("operation_id must be a canonical UUID4 string")

    user_bytes = user_id.to_bytes((user_id.bit_length() + 7) // 8, "big")
    message = (
        _DOMAIN
        + len(user_bytes).to_bytes(8, "big")
        + user_bytes
        + parsed_operation_id.bytes
    )
    digest = bytearray(hmac.new(secret, message, hashlib.sha256).digest()[:16])
    digest[6] = (digest[6] & 0x0F) | 0x40
    digest[8] = (digest[8] & 0x3F) | 0x80
    return str(UUID(bytes=bytes(digest)))
