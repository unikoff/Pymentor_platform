from datetime import date

from fastapi import APIRouter, Depends, Query, Request, Response
from sqlalchemy.orm import Session

from . import crud
from .schemas import ActivityVisit, SlotCreate, UserCreate, UserLogin

user_router = APIRouter()


def get_db():
    db = crud.get_db()
    try:
        yield db
    finally:
        db.close()


@user_router.post("/register")
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    user_db = await crud.register_user(user=user, db=db)
    return {"message": "Registration successful", "user": crud._serialize_user(user_db)}


@user_router.post("/login")
async def login_user(user: UserLogin, response: Response, db: Session = Depends(get_db)):
    user_db = await crud.login_user(response=response, user=user, db=db)
    return {"message": "Login successful", "user": crud._serialize_user(user_db)}


@user_router.get("/me")
async def me(request: Request, db: Session = Depends(get_db)):
    user_db = await crud.get_current_user(request=request, db=db)
    return {"user": crud._serialize_user(user_db)}


@user_router.post("/activity/visit")
async def record_activity_visit(payload: ActivityVisit, request: Request, db: Session = Depends(get_db)):
    user_db = await crud.get_current_user(request=request, db=db)
    activity_date = payload.activity_date or date.today()
    activity_day = crud.record_activity_day(user_id=user_db.id, activity_date=activity_date, db=db)
    return {"activity_date": activity_day.activity_date.isoformat()}


@user_router.get("/activity")
async def get_activity_calendar(
    request: Request,
    year: int = Query(..., ge=2000, le=2100),
    month: int = Query(..., ge=1, le=12),
    db: Session = Depends(get_db),
):
    user_db = await crud.get_current_user(request=request, db=db)
    days = crud.get_activity_days(user_id=user_db.id, year=year, month=month, db=db)
    return {"days": [day.isoformat() for day in days]}


@user_router.get("/slots")
async def get_bookable_slots(
    request: Request,
    year: int = Query(..., ge=2000, le=2100),
    month: int = Query(..., ge=1, le=12),
    db: Session = Depends(get_db),
):
    user_db = await crud.get_current_user(request=request, db=db)
    slots = crud.list_bookable_slots(year=year, month=month, user_id=user_db.id, db=db)
    quota = crud.get_quota_status(user_id=user_db.id, year=year, month=month, db=db)
    return {"slots": slots, "quota": quota}


@user_router.post("/slots/{slot_id}/book")
async def book_slot(slot_id: int, request: Request, db: Session = Depends(get_db)):
    user_db = await crud.get_current_user(request=request, db=db)
    slot = crud.book_slot(slot_id=slot_id, user_id=user_db.id, db=db)
    return {"slot": crud.serialize_slot_student(slot, user_db.id)}


@user_router.post("/slots/{slot_id}/cancel")
async def cancel_slot(slot_id: int, request: Request, db: Session = Depends(get_db)):
    user_db = await crud.get_current_user(request=request, db=db)
    slot = crud.cancel_booking(slot_id=slot_id, user_id=user_db.id, db=db)
    return {"slot": crud.serialize_slot_student(slot, user_db.id)}


@user_router.post("/logout")
async def logout_user(request: Request, response: Response, db: Session = Depends(get_db)):
    await crud.logout_user(request=request, response=response, db=db)
    return {"message": "Logout successful"}
