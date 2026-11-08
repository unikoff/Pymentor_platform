"""Shared request-scoped session and application-port dependencies."""

from fastapi import Depends
from fastapi import Request
from sqlalchemy.orm import Session

from pymentor_core.app.wiring import build_default_composition
from pymentor_core.app.wiring import identity_repository as get_identity_repository
from pymentor_core.app.context import RequestContext
from pymentor_core.app.database import SessionLocal


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_request_context(
    request: Request,
    db: Session = Depends(get_db),
) -> RequestContext:
    root = getattr(request.app.state, "composition_root", None)
    if root is None:
        root = build_default_composition()
    return root.for_request(db)


