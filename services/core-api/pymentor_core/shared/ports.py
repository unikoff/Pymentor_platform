"""Small application-facing ports for replaceable infrastructure."""

from __future__ import annotations

from collections.abc import Mapping
from datetime import datetime
from typing import Protocol
from typing import TypeVar


Entity = TypeVar("Entity")


class Clock(Protocol):
    def now(self) -> datetime: ...


class Repository(Protocol[Entity]):
    def find_one(self, **criteria: object) -> Entity | None: ...

    def add(self, entity: Entity) -> None: ...


class UnitOfWork(Protocol):
    def repository(self, entity_type: type[Entity]) -> Repository[Entity]: ...

    def commit(self) -> None: ...

    def rollback(self) -> None: ...

    def refresh(self, entity: object) -> None: ...


class Permissions(Protocol):
    def allows(
        self, principal: object, action: str, resource: str | None = None
    ) -> bool: ...


class Queue(Protocol):
    def enqueue(self, topic: str, payload: Mapping[str, object]) -> None: ...


class ExternalAPI(Protocol):
    def request(
        self,
        method: str,
        url: str,
        *,
        payload: Mapping[str, object] | None = None,
        timeout: float = 10.0,
    ) -> Mapping[str, object]: ...
