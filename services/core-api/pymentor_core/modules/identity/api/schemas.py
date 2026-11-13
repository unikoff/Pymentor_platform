from datetime import date
from datetime import datetime


from pydantic import BaseModel
from pydantic import constr
from pydantic import field_validator
from pymentor_core.modules.identity.passwords import validate_bcrypt_length


class UserCreate(BaseModel):
    username: constr(min_length=3, max_length=40)
    email: constr(min_length=5, max_length=100)
    password: constr(min_length=8, max_length=128)

    _validate_password_length = field_validator("password")(validate_bcrypt_length)


class UserLogin(BaseModel):
    email: constr(min_length=5, max_length=100)
    password: constr(min_length=1, max_length=100)

    _validate_password_length = field_validator("password")(validate_bcrypt_length)


class UserPublic(BaseModel):
    id: int
    username: str
    email: str
    subscription_until: datetime | None = None
    subscription_plan: str | None = None
    has_active_subscription: bool = False
    is_admin: bool = False
    verified: bool = False

    model_config = {"from_attributes": True, "extra": "forbid"}


class AuthResponse(BaseModel):
    model_config = {"extra": "forbid"}

    message: str
    user: UserPublic


class CurrentUserResponse(BaseModel):
    model_config = {"extra": "forbid"}

    user: UserPublic


class LogoutResponse(BaseModel):
    model_config = {"extra": "forbid"}

    message: str


UserBase = UserCreate


class ActivityVisit(BaseModel):
    activity_date: date | None = None


class ActivityVisitResponse(BaseModel):
    model_config = {"extra": "forbid"}

    activity_date: str
    visited_at: str | None


class ActivityCalendarVisitResponse(BaseModel):
    model_config = {"extra": "forbid"}

    activity_date: str
    visited_at: str | None


class ActivityCalendarResponse(BaseModel):
    model_config = {"extra": "forbid"}

    days: list[str]
    visits: list[ActivityCalendarVisitResponse]


class ActivitySummaryDayResponse(BaseModel):
    model_config = {"extra": "forbid"}

    activity_date: str
    active: bool


class ActivityLessonsDayResponse(BaseModel):
    model_config = {"extra": "forbid"}

    activity_date: str
    lessons_completed: int


class ActivitySummaryResponse(BaseModel):
    model_config = {"extra": "forbid"}

    current_streak: int
    visited_today: bool
    total_active_days: int
    weekly_activity: list[ActivitySummaryDayResponse]
    weekly_lessons_completed: list[ActivityLessonsDayResponse]
