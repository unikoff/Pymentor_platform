from pydantic import BaseModel, Field


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
