"""Immutable process bindings. Modules depend on these ports, never app wiring."""

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class Bindings:
    registration: Any
    activity: Any
    progress: Any
    content: Any
    runner: Any = None
    notifications: Any = None
    telegram: Any = None
    bookings: Any = None
    administration: Any = None
    landings: Any = None
    landing_requests: Any = None


_bindings: Bindings | None = None


def install_bindings(bindings: Bindings) -> None:
    global _bindings
    _bindings = bindings


def get_bindings() -> Bindings:
    if _bindings is None:
        raise RuntimeError("Core application dependencies have not been configured")
    return _bindings
