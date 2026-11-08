"""Compatibility-preserving bcrypt password operations for identity models."""

import bcrypt


def hash_password(plain: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(plain.encode(), salt).decode()


def is_bcrypt_hash(value: str) -> bool:
    return isinstance(value, str) and value.startswith("$2")


def verify_password(plain_password: str, stored_hash: str) -> bool:
    return bcrypt.checkpw(plain_password.encode(), stored_hash.encode())
