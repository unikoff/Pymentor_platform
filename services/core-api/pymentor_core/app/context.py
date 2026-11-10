"""Per-request ports assembled by the application composition root."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

from pymentor_core.shared.ports import Clock
from pymentor_core.shared.ports import ExternalAPI
from pymentor_core.shared.ports import Permissions
from pymentor_core.shared.ports import Queue
from pymentor_core.shared.ports import UnitOfWork


@dataclass(frozen=True)
class RequestContext:
    uow: UnitOfWork
    clock: Clock
    permissions: Permissions
    queue: Queue
    external_api: ExternalAPI


class CompositionRoot:
    def __init__(
        self,
        *,
        uow_factory: Callable[[object], UnitOfWork],
        clock: Clock,
        permissions: Permissions,
        queue: Queue,
        external_api: ExternalAPI,
    ) -> None:
        self._uow_factory = uow_factory
        self._clock = clock
        self._permissions = permissions
        self._queue = queue
        self._external_api = external_api

    def for_request(self, session: object) -> RequestContext:
        return RequestContext(
            uow=self._uow_factory(session),
            clock=self._clock,
            permissions=self._permissions,
            queue=self._queue,
            external_api=self._external_api,
        )
