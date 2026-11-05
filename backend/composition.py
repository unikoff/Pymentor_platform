"""Application composition root for concrete backend adapters."""

from core.composition import CompositionRoot
from infrastructure.defaults import (
    DenyAllPermissions,
    SystemClock,
    UnconfiguredExternalAPI,
    UnconfiguredQueue,
)
from infrastructure.sqlalchemy_adapter import SqlAlchemyUnitOfWork


def build_default_composition() -> CompositionRoot:
    return CompositionRoot(
        uow_factory=SqlAlchemyUnitOfWork,
        clock=SystemClock(),
        permissions=DenyAllPermissions(),
        queue=UnconfiguredQueue(),
        external_api=UnconfiguredExternalAPI(),
    )
