"""Existing user access rules for lessons and tasks."""

from fastapi import HTTPException, Request, status
from sqlalchemy.orm import Session
from db import models
from routers.accounts import service as accounts


def get_optional_user(request: Request, db: Session) -> models.User | None:
    try:
        return accounts.get_current_user(request=request, db=db)
    except HTTPException as exc:
        if exc.status_code == status.HTTP_401_UNAUTHORIZED:
            return None
        raise


def get_lesson_access(lesson: dict, user: models.User | None) -> tuple[bool, str | None]:
    access = lesson.get("access", "registered")
    if access == "free":
        return True, None

    if user is None:
        return False, "Зарегистрируйтесь, чтобы открыть это занятие."

    if access == "registered":
        return True, None

    if access == "subscription":
        if accounts.has_active_subscription(user):
            return True, None

        if user.subscription_until:
            subscription_until = accounts._normalize_datetime(user.subscription_until)
            expires_at = subscription_until.strftime("%d.%m.%Y") if subscription_until else ""
            return False, f"Подписка закончилась {expires_at}. Продлите подписку, чтобы открыть это занятие."

        return False, "Нужна активная подписка. Продлите доступ, чтобы открыть это занятие."

    return False, "Этот тип доступа пока не поддерживается."
