"""Shared request-scoped session and application-port dependencies."""
from fastapi import Depends, Request
from sqlalchemy.orm import Session

from composition import build_default_composition
from core.composition import RequestContext
from db.engine import SessionLocal


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
