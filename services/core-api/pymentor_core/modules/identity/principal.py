"""A credential-free snapshot of a server-authenticated user."""

from dataclasses import dataclass
from datetime import datetime

from fastapi import HTTPException
from fastapi import status


@dataclass(frozen=True, slots=True)
class Principal:
    user_id: int
    roles: frozenset[str]
    permissions: frozenset[str]
    username: str
    email: str
    subscription_until: datetime | None

    @property
    def id(self) -> int:
        """Compatibility with existing course and booking code."""
        return self.user_id

    @property
    def is_admin(self) -> bool:
        return "admin.access" in self.permissions

    @classmethod
    def from_user(cls, user: object) -> "Principal":
        # Roles are derived solely from the server-side account, never from cookies.
        is_admin = bool(getattr(user, "is_admin", False))
        return cls(
            user_id=user.id,
            roles=frozenset({"student", "admin"} if is_admin else {"student"}),
            permissions=frozenset({"admin.access"} if is_admin else ()),
            username=getattr(user, "username", ""),
            email=getattr(user, "email", ""),
            subscription_until=getattr(user, "subscription_until", None),
        )


def require_admin(principal: Principal) -> Principal:
    if "admin.access" not in principal.permissions:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Требуются права администратора",
        )
    return principal
