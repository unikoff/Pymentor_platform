from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, constr


class UserCreate(BaseModel):
    username: constr(min_length=3, max_length=40)
    email: constr(min_length=5, max_length=100)
    password: constr(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: constr(min_length=5, max_length=100)
    password: constr(min_length=1, max_length=100)


class UserPublic(BaseModel):
    id: int
    username: str
    email: str
    subscription_until: datetime | None = None
    has_active_subscription: bool = False

    model_config = {"from_attributes": True}


UserBase = UserCreate


class ActivityVisit(BaseModel):
    activity_date: date | None = None


class SlotCreate(BaseModel):
    slot_date: date
    start_time: constr(pattern=r"^([01]\d|2[0-3]):[0-5]\d$")  # "HH:MM"
    duration_minutes: Literal[60, 90, 120] = 60
