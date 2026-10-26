from datetime import date, datetime


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
    subscription_plan: str | None = None
    has_active_subscription: bool = False

    model_config = {"from_attributes": True}


UserBase = UserCreate


class ActivityVisit(BaseModel):
    activity_date: date | None = None
