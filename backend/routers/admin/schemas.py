from pydantic import BaseModel, Field

from routers.accounts.schemas import ActivitySummaryResponse, UserPublic
from routers.bookings.schemas import (
    AdminSlotResponse,
    AdminSlotStudentResponse,
    QuotaStatusResponse,
)


class SubscriptionChange(BaseModel):
    """days=N — продлить на N дней (от текущего конца подписки или от сегодня).

    days=null — сбросить подписку.
    """

    days: int | None = Field(default=None, ge=1, le=3650)


class QuotaChange(BaseModel):
    """Прибавить (или убавить при отрицательном) занятий в месячной квоте студента."""

    year: int = Field(ge=2000, le=2100)
    month: int = Field(ge=1, le=12)
    add: int = Field(ge=-100, le=100)


class AdminAccountResponse(UserPublic):
    model_config = {"extra": "forbid"}

    completed_lessons: int
    completed_lessons_7d: int | None = None
    quota: QuotaStatusResponse | None = None


class AdminAccountsResponse(BaseModel):
    model_config = {"extra": "forbid"}

    completed_since: str
    users: list[AdminAccountResponse]


class ExpiringSubscriptionResponse(BaseModel):
    model_config = {"extra": "forbid"}

    id: int
    username: str
    subscription_plan: str | None
    subscription_until: str | None


class AdminSlotSummaryResponse(BaseModel):
    model_config = {"extra": "forbid"}

    booked: int
    total: int
    free: int
    occupancy_percent: int | None = None


class AdminSlotWeekSummaryResponse(BaseModel):
    model_config = {"extra": "forbid"}

    booked: int
    total: int
    free: int


class UpcomingBookingResponse(BaseModel):
    model_config = {"extra": "forbid"}

    id: int
    date: str
    start_time: str
    duration_minutes: int
    student: AdminSlotStudentResponse


class ActiveStudentResponse(BaseModel):
    model_config = {"extra": "forbid"}

    id: int
    username: str
    lessons_completed: int


class DailyActiveStudentsResponse(BaseModel):
    model_config = {"extra": "forbid"}

    date: str
    active_students: int


class DailyLessonsCompletedResponse(BaseModel):
    model_config = {"extra": "forbid"}

    date: str
    lessons_completed: int


class AdminProgressTaskResponse(BaseModel):
    model_config = {"extra": "forbid"}

    id: str
    title: str
    level: str | None
    completed: bool


class AdminProgressLessonResponse(BaseModel):
    model_config = {"extra": "forbid"}

    id: str
    title: str
    completed: bool
    countable: bool
    tasks: list[AdminProgressTaskResponse]


class AdminProgressModuleResponse(BaseModel):
    model_config = {"extra": "forbid"}

    id: str
    title: str
    completed: int
    total: int
    lessons_total: int
    lessons: list[AdminProgressLessonResponse]


class AdminProgressTrackResponse(BaseModel):
    model_config = {"extra": "forbid"}

    id: str
    title: str
    completed: int
    total: int
    lessons_total: int
    modules: list[AdminProgressModuleResponse]


class ProfileBookingResponse(BaseModel):
    model_config = {"extra": "forbid"}

    id: int
    date: str
    start_time: str
    duration_minutes: int


class AdminOverviewResponse(BaseModel):
    model_config = {"extra": "forbid"}

    total_students: int
    active_students_7d: int
    inactive_students_7d: int
    active_subscriptions_count: int
    lessons_completed_7d: int
    expiring_subscriptions_count: int
    expiring_subscriptions: list[ExpiringSubscriptionResponse]
    slots_30d: AdminSlotSummaryResponse
    slots_7d: AdminSlotWeekSummaryResponse
    upcoming_bookings: list[UpcomingBookingResponse]
    most_active_students: list[ActiveStudentResponse]
    daily_active_students: list[DailyActiveStudentsResponse]
    daily_lessons_completed: list[DailyLessonsCompletedResponse]


class AdminUserEnvelope(BaseModel):
    model_config = {"extra": "forbid"}

    user: AdminAccountResponse


class StudentProfilePayload(AdminAccountResponse):
    model_config = {"extra": "forbid"}

    account_ref: str | None = None
    quota: QuotaStatusResponse
    activity_days_count: int
    activity_days: list[str]
    total_activity_days: int | None = None
    last_activity_date: str | None = None
    total_bookings: int | None = None
    completed_lessons_7d: int
    activity_summary: ActivitySummaryResponse
    learning_progress: list[AdminProgressTrackResponse]
    bookings: list[ProfileBookingResponse]


class StudentProfileEnvelope(BaseModel):
    model_config = {"extra": "forbid"}

    profile: StudentProfilePayload


class AdminSlotsResponse(BaseModel):
    model_config = {"extra": "forbid"}

    slots: list[AdminSlotResponse]


class AdminSlotEnvelope(BaseModel):
    model_config = {"extra": "forbid"}

    slot: AdminSlotResponse


class DeletedIdResponse(BaseModel):
    model_config = {"extra": "forbid"}

    deleted: int
