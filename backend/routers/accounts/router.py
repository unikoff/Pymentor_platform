from fastapi import APIRouter, Depends, Query, Request, Response
from sqlalchemy.orm import Session
from core.dependencies import get_db
from datetime import datetime, timezone
from . import service, activity
from .schemas import ActivityVisit, UserCreate, UserLogin

user_router = APIRouter()


@user_router.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    user_db = service.register_user(user=user, db=db)
    return {"message": "Registration successful", "user": service._serialize_user(user_db)}


@user_router.post("/login")
def login_user(user: UserLogin, response: Response, db: Session = Depends(get_db)):
    user_db = service.login_user(response=response, user=user, db=db)
    return {"message": "Login successful", "user": service._serialize_user(user_db)}


@user_router.get("/me")
def me(request: Request, db: Session = Depends(get_db)):
    user_db = service.get_current_user(request=request, db=db)
    return {"user": service._serialize_user(user_db)}


@user_router.post("/activity/visit")
def record_activity_visit(payload: ActivityVisit, request: Request, db: Session = Depends(get_db)):
    user_db = service.get_current_user(request=request, db=db)
    visited_at = datetime.now(timezone.utc)
    activity_date = payload.activity_date or visited_at.astimezone(activity.MOSCOW_TZ).date()
    activity_day = activity.record_activity_day(user_id=user_db.id, activity_date=activity_date, db=db, visited_at=visited_at)
    return {
        "activity_date": activity_day.activity_date.isoformat(),
        "visited_at": activity.serialize_activity_timestamp(activity_day.visited_at),
    }


@user_router.get("/activity")
def get_activity_calendar(
    request: Request,
    year: int = Query(..., ge=2000, le=2100),
    month: int = Query(..., ge=1, le=12),
    db: Session = Depends(get_db),
):
    user_db = service.get_current_user(request=request, db=db)
    records = activity.get_activity_records(user_id=user_db.id, year=year, month=month, db=db)
    return {
        "days": [record.activity_date.isoformat() for record in records],
        "visits": [
            {
                "activity_date": record.activity_date.isoformat(),
                "visited_at": activity.serialize_activity_timestamp(record.visited_at),
            }
            for record in records
        ],
    }


@user_router.get("/activity/summary")
def get_activity_summary(request: Request, db: Session = Depends(get_db)):
    user_db = service.get_current_user(request=request, db=db)
    return activity.get_activity_summary(user_id=user_db.id, db=db)


@user_router.post("/logout")
def logout_user(request: Request, response: Response, db: Session = Depends(get_db)):
    service.logout_user(request=request, response=response, db=db)
    return {"message": "Logout successful"}
