"""Strict HTTP schemas for admin-managed landing integrations."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class LandingCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    slug: str = Field(min_length=2, max_length=80, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    title: str = Field(min_length=1, max_length=120)
    description: str = Field(default="", max_length=500)
    is_active: bool = True

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Title must not be blank")
        return value

    @field_validator("description")
    @classmethod
    def trim_description(cls, value: str) -> str:
        return value.strip()


class LandingPatch(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=500)
    is_active: bool | None = None

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("Title must not be blank")
        return value

    @field_validator("description")
    @classmethod
    def trim_description(cls, value: str | None) -> str | None:
        return value.strip() if value is not None else None


class TelegramConfigInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    secret_ref: str = Field(min_length=1, max_length=64, pattern=r"^[A-Za-z][A-Za-z0-9_.:-]{0,63}$")
    chat_id: str = Field(min_length=1, max_length=20, pattern=r"^-?\d+$")


class LandingTestEvent(BaseModel):
    model_config = ConfigDict(extra="forbid")

    event_type: Literal["telegram_connection_test.v1"]
    payload: dict = Field(default_factory=dict)
