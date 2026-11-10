"""Administrative HTTP facade: authorize, call published operations, translate failures."""

from __future__ import annotations
from fastapi import HTTPException
from fastapi import Request
from sqlalchemy.orm import Session
from typing import Literal
from pymentor_core.shared.ports import UnitOfWork
from pymentor_core.shared.bindings import get_bindings
from pymentor_core.shared.errors import ApplicationError
from pymentor_core.modules.bookings.contracts import BookingError
from pymentor_core.modules.bookings.api.schemas import SlotCreate
from pymentor_core.modules.administration.api.schemas import QuotaChange
from pymentor_core.modules.administration.api.schemas import SubscriptionChange
from pymentor_core.modules.administration.public import require_admin


def _call(name, *args, **kwargs):
    try:
        return getattr(get_bindings().administration, name)(*args, **kwargs)
    except (ApplicationError, BookingError) as exc:
        raise HTTPException(
            status_code=exc.status_code, detail=exc.detail, headers=exc.headers
        ) from exc


def admin_overview(request: Request, db: Session):
    actor = require_admin(request, db)
    return _call("admin_overview", actor=actor, db=db)


def list_users(
    request: Request,
    search: str,
    subscription: Literal["all", "active", "inactive"],
    lessons: Literal["all", "none", "low", "many"],
    year: int | None,
    month: int | None,
    db: Session,
):
    actor = require_admin(request, db)
    return _call(
        "list_users",
        actor=actor,
        search=search,
        subscription=subscription,
        lessons=lessons,
        year=year,
        month=month,
        db=db,
    )


def delete_user(
    user_id: int,
    request: Request,
    db: Session,
    *,
    expected_account_ref: str | None = None,
):
    actor = require_admin(request, db)
    return _call(
        "delete_user",
        user_id=user_id,
        actor=actor,
        db=db,
        expected_account_ref=expected_account_ref,
    )


def change_subscription(
    user_id: int,
    payload: SubscriptionChange,
    request: Request,
    db: Session | None,
    *,
    uow: UnitOfWork | None = None,
):
    actor = (
        require_admin(request, db)
        if uow is None
        else require_admin(request, db, uow=uow)
    )
    return _call(
        "change_subscription",
        user_id=user_id,
        payload=payload,
        actor=actor,
        db=db,
        uow=uow,
    )


def admin_list_slots(
    request: Request, year: int, month: int, include_past: bool, db: Session
):
    actor = require_admin(request, db)
    return _call(
        "admin_list_slots",
        actor=actor,
        year=year,
        month=month,
        include_past=include_past,
        db=db,
    )


def admin_create_slot(payload: SlotCreate, request: Request, db: Session):
    actor = require_admin(request, db)
    return _call("admin_create_slot", payload=payload, actor=actor, db=db)


def admin_delete_slot(slot_id: int, request: Request, db: Session):
    actor = require_admin(request, db)
    return _call("admin_delete_slot", slot_id=slot_id, actor=actor, db=db)


def student_profile(user_id: int, request: Request, year: int, month: int, db: Session):
    actor = require_admin(request, db)
    return _call(
        "student_profile", user_id=user_id, actor=actor, year=year, month=month, db=db
    )


def change_quota(user_id: int, payload: QuotaChange, request: Request, db: Session):
    actor = require_admin(request, db)
    return _call("change_quota", user_id=user_id, payload=payload, actor=actor, db=db)


