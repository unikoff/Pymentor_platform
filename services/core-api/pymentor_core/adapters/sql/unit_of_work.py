"""SQLAlchemy repository and request-scoped unit-of-work adapter."""

from __future__ import annotations

from typing import TypeVar

from sqlalchemy.orm import Session

from pymentor_core.shared.ports import Repository


Entity = TypeVar("Entity")


class SqlAlchemyRepository:
    def __init__(self, session: Session, entity_type: type[Entity]) -> None:
        self._session = session
        self._entity_type = entity_type

    def find_one(self, **criteria: object) -> Entity | None:
        return self._session.query(self._entity_type).filter_by(**criteria).first()

    def add(self, entity: Entity) -> None:
        self._session.add(entity)


class SqlAlchemyUnitOfWork:
    """Wrap an existing request Session; services retain commit/rollback control."""

    def __init__(self, session: Session) -> None:
        self.session = session

    def repository(self, entity_type: type[Entity]) -> Repository[Entity]:
        return SqlAlchemyRepository(self.session, entity_type)

    def commit(self) -> None:
        self.session.commit()

    def rollback(self) -> None:
        self.session.rollback()

    def refresh(self, entity: object) -> None:
        self.session.refresh(entity)
