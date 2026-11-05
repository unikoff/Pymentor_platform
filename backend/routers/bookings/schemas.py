from datetime import date
from typing import Literal
from pydantic import BaseModel, constr


class SlotCreate(BaseModel):
    slot_date: date
    start_time: constr(pattern=r"^([01]\d|2[0-3]):[0-5]\d$")  # "HH:MM"
    duration_minutes: Literal[60, 90, 120] = 60


class QuotaStatusResponse(BaseModel):
    model_config = {"extra": "forbid"}

    granted: int
    used: int
    remaining: int


class StudentSlotResponse(BaseModel):
    model_config = {"extra": "forbid"}

    id: int
    date: str
    start_time: str
    duration_minutes: int
    status: Literal["free", "mine"]
    can_cancel: bool
    is_completed: bool | None = None


class StudentSlotsResponse(BaseModel):
    model_config = {"extra": "forbid"}

    slots: list[StudentSlotResponse]
    quota: QuotaStatusResponse


class StudentSlotEnvelope(BaseModel):
    model_config = {"extra": "forbid"}

    slot: StudentSlotResponse


class AdminSlotStudentResponse(BaseModel):
    model_config = {"extra": "forbid"}

    id: int
    username: str
    email: str


class AdminSlotResponse(BaseModel):
    model_config = {"extra": "forbid"}

    id: int
    date: str
    start_time: str
    duration_minutes: int
    is_past: bool
    student: AdminSlotStudentResponse | None


class AdminSlotsResponse(BaseModel):
    model_config = {"extra": "forbid"}

    slots: list[AdminSlotResponse]


class AdminSlotEnvelope(BaseModel):
    model_config = {"extra": "forbid"}

    slot: AdminSlotResponse
