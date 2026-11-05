"""In-memory adapters for local verification without external services."""

from __future__ import annotations

from collections.abc import Mapping
from copy import deepcopy
from datetime import datetime
from typing import TypeVar


Entity = TypeVar("Entity")


class FakeClock:
    def __init__(self, current_time: datetime) -> None:
        self._current_time = current_time

    def now(self) -> datetime:
        return self._current_time


class FakePermissions:
    def __init__(self, allowed: set[tuple[object, str]] | None = None) -> None:
        self._allowed = set(allowed or ())

    def allows(self, principal: object, action: str, resource: str | None = None) -> bool:
        return (principal, action) in self._allowed


class FakeQueue:
    def __init__(self) -> None:
        self.messages: list[tuple[str, dict[str, object]]] = []

    def enqueue(self, topic: str, payload: Mapping[str, object]) -> None:
        self.messages.append((topic, dict(payload)))


class FakeExternalAPI:
    def __init__(
        self,
        responses: Mapping[tuple[str, str], Mapping[str, object]] | None = None,
    ) -> None:
        self._responses = dict(responses or {})
        self.requests: list[dict[str, object]] = []

    def request(
        self,
        method: str,
        url: str,
        *,
        payload: Mapping[str, object] | None = None,
        timeout: float = 10.0,
    ) -> Mapping[str, object]:
        self.requests.append(
            {
                "method": method,
                "url": url,
                "payload": dict(payload) if payload is not None else None,
                "timeout": timeout,
            }
        )
        response = self._responses.get((method, url))
        if response is None:
            raise LookupError(f"no fake response configured for {method} {url}")
        return dict(response)


class InMemoryDatabase:
    """Simple committed store shared by fake UoWs; intended for local tests."""

    def __init__(self) -> None:
        self._items: dict[type[object], list[object]] = {}

    def items(self, entity_type: type[Entity]) -> list[Entity]:
        return deepcopy(list(self._items.get(entity_type, ())))


def _restore_entity(entity: object, snapshot: object) -> None:
    """Restore mutable fields without replacing an entity held by the caller."""
    fields = deepcopy(
        {key: value for key, value in vars(snapshot).items() if key != "_sa_instance_state"}
    )
    for key in list(vars(entity)):
        if key != "_sa_instance_state" and key not in fields:
            delattr(entity, key)
    for key, value in fields.items():
        setattr(entity, key, value)


class _InMemoryRepository:
    def __init__(self, uow: InMemoryUnitOfWork, entity_type: type[Entity]) -> None:
        self._uow = uow
        self._entity_type = entity_type

    def find_one(self, **criteria: object) -> Entity | None:
        for entity in self._uow._items.get(self._entity_type, ()):
            if all(getattr(entity, key, None) == value for key, value in criteria.items()):
                return entity
        return None

    def add(self, entity: Entity) -> None:
        items = self._uow._items.setdefault(self._entity_type, [])
        if entity not in items:
            items.append(entity)


class InMemoryUnitOfWork:
    """Single-writer fake for mutable entities; it does not model concurrency."""

    def __init__(self, database: InMemoryDatabase) -> None:
        self._database = database
        self._items = deepcopy(database._items)

    def repository(self, entity_type: type[Entity]) -> _InMemoryRepository:
        return _InMemoryRepository(self, entity_type)

    def commit(self) -> None:
        self._database._items = deepcopy(self._items)

    def rollback(self) -> None:
        restored = {}
        for entity_type, snapshots in self._database._items.items():
            current = self._items.get(entity_type, [])
            entities = []
            for index, snapshot in enumerate(snapshots):
                if index < len(current):
                    entity = current[index]
                    _restore_entity(entity, snapshot)
                else:
                    entity = deepcopy(snapshot)
                entities.append(entity)
            restored[entity_type] = entities
        self._items = restored

    def refresh(self, entity: object) -> None:
        return None
