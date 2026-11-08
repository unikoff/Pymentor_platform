"""Existing user access rules for lessons and tasks."""

from fastapi import HTTPException
from fastapi import Request
from fastapi import status
from sqlalchemy.orm import Session
from pymentor_core.modules.identity.principal import Principal
from pymentor_core.modules.identity import public as accounts
from pymentor_core.modules.learning.access import get_lesson_access


def get_optional_user(request: Request, db: Session) -> Principal | None:
    try:
        return accounts.get_current_principal(request=request, db=db)
    except HTTPException as exc:
        if exc.status_code == status.HTTP_401_UNAUTHORIZED:
            return None
        raise
