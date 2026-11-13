"""Short-lived, purpose-specific signed account links.

Signed payloads are readable: never include passwords or password hashes.
"""

import hashlib
import hmac

from itsdangerous import BadSignature, URLSafeTimedSerializer


PURPOSE_TTL = {"verify_email": 86400, "change_password": 1800, "reset_password": 1800, "change_email": 1800, "change_email_dual": 1800}


class EmailTokens:
    def __init__(self, secret: str):
        if not isinstance(secret, str) or len(secret.encode("utf-8")) < 32:
            raise ValueError("Email token secret must contain at least 32 bytes")
        self._secret = secret.encode("utf-8")

    def _serializer(self, purpose: str, *, namespace: str = "pymentor") -> URLSafeTimedSerializer:
        if purpose not in PURPOSE_TTL:
            raise ValueError("Unknown account-link purpose")
        if namespace not in {"pymentor", "knowi"}:
            raise ValueError("Unknown account-link namespace")
        return URLSafeTimedSerializer(self._secret, salt=f"{namespace}.email.{purpose}.v1")

    def _fingerprint(self, password_hash: str) -> str:
        return hmac.new(self._secret, b"password-state\0" + password_hash.encode(), hashlib.sha256).hexdigest()

    def issue(self, purpose: str, user_id: int, email: str, password_hash: str, *, new_email: str | None = None, request_id: str | None = None, side: str | None = None) -> str:
        payload = {"user_id": user_id, "email": email,
                   "password_state": self._fingerprint(password_hash)}
        if purpose in {"change_email", "change_email_dual"}:
            import secrets
            if not new_email:
                raise ValueError("Missing new address")
            payload.update(new_email=new_email, nonce=secrets.token_urlsafe(24))
            if request_id is not None and side in {"old", "new"}:
                payload.update(request_id=request_id, side=side)
        return self._serializer(purpose).dumps(payload)

    def read(self, token: str, purpose: str, *, max_age: int | None = None) -> dict | None:
        for namespace in ("pymentor", "knowi"):
            try:
                payload = self._serializer(purpose, namespace=namespace).loads(
                    token, max_age=PURPOSE_TTL[purpose] if max_age is None else max_age
                )
            except (BadSignature, TypeError, ValueError):
                continue
            break
        else:
            return None
        if (not isinstance(payload, dict) or type(payload.get("user_id")) is not int
                or payload["user_id"] < 1 or not isinstance(payload.get("email"), str)):
            return None
        return payload

    def validate(self, token: str, purpose: str, user_id: int, email: str, password_hash: str) -> bool:
        payload = self.read(token, purpose)
        if payload is None or payload["user_id"] != user_id or payload["email"] != email:
            return False
        state = payload.get("password_state")
        return isinstance(state, str) and hmac.compare_digest(state, self._fingerprint(password_hash))
