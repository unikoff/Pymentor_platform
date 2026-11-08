"""Local runtime adapters that never start external services implicitly."""

from __future__ import annotations

from collections.abc import Mapping
from datetime import datetime
from datetime import timezone


class SystemClock:
    def now(self) -> datetime:
        return datetime.now(timezone.utc)


class DenyAllPermissions:
    def allows(
        self, principal: object, action: str, resource: str | None = None
    ) -> bool:
        return False


class UnconfiguredQueue:
    def enqueue(self, topic: str, payload: Mapping[str, object]) -> None:
        raise RuntimeError("queue adapter is not configured")


class UnconfiguredExternalAPI:
    def request(
        self,
        method: str,
        url: str,
        *,
        payload: Mapping[str, object] | None = None,
        timeout: float = 10.0,
    ) -> Mapping[str, object]:
        raise RuntimeError("external API adapter is not configured")
