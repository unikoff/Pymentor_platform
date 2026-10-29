from datetime import date, datetime, timezone
from uuid import uuid4

import bcrypt
from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Index, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from .engine import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)

def _hash_password(plain: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(plain.encode(), salt).decode()

def _is_bcrypt_hash(value: str) -> bool:
    return isinstance(value, str) and value.startswith("$2")



class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    _password_hash: Mapped[str] = mapped_column("password_hash", String(255), nullable=False)
    subscription_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, default=None, index=True)
    subscription_plan: Mapped[str | None] = mapped_column(String(32), nullable=True, default=None)
    is_admin: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="0")


    @property
    def password(self):
        return self._password_hash

    @password.setter
    def password(self, plain_password: str):
        if not plain_password:
            raise ValueError("Password cannot be empty")
        if _is_bcrypt_hash(plain_password):
            self._password_hash = plain_password
        else:
            self._password_hash = _hash_password(plain_password)

    def verify_password(self, plain_password: str) -> bool:
        return bcrypt.checkpw(plain_password.encode(), self._password_hash.encode())


class Admin(Base):
    __tablename__ = "admins"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    _password_hash: Mapped[str] = mapped_column("password_hash", String(255), nullable=False)

    
    @property
    def password(self):
        return self._password_hash

    @password.setter
    def password(self, plain_password: str):
        if not plain_password:
            raise ValueError("Password cannot be empty")
        if _is_bcrypt_hash(plain_password):
            self._password_hash = plain_password
        else:
            self._password_hash = _hash_password(plain_password)

    def verify_password(self, plain_password: str) -> bool:
        return bcrypt.checkpw(plain_password.encode(), self._password_hash.encode())
    

class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    session_token: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class UserActivityDay(Base):
    __tablename__ = "user_activity_days"
    __table_args__ = (UniqueConstraint("user_id", "activity_date", name="uq_user_activity_day"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    activity_date: Mapped[date] = mapped_column(Date, index=True, nullable=False)
    visited_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class UserLessonProgress(Base):
    __tablename__ = "user_lesson_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "lesson_id", name="uq_user_lesson_progress"),
        Index("ix_user_lesson_progress_completed_at", "completed_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    lesson_id: Mapped[str] = mapped_column(String(40), index=True, nullable=False)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class UserTaskProgress(Base):
    __tablename__ = "user_task_progress"
    __table_args__ = (UniqueConstraint("user_id", "task_id", name="uq_user_task_progress"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    task_id: Mapped[str] = mapped_column(String(160), index=True, nullable=False)
    task_revision: Mapped[str] = mapped_column(String(64), nullable=False)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class BookingSlot(Base):
    """Свободное окно для занятия. Создаёт админ, бронирует студент (1 слот = 1 студент)."""

    __tablename__ = "booking_slots"
    __table_args__ = (UniqueConstraint("slot_date", "start_time", name="uq_booking_slot_datetime"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    slot_date: Mapped[date] = mapped_column(Date, index=True, nullable=False)
    start_time: Mapped[str] = mapped_column(String(5), nullable=False)  # "HH:MM"
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=60)
    student_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), index=True, nullable=True, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class BookingQuota(Base):
    """Сколько занятий студент может забронировать в конкретном месяце (выдаёт админ)."""

    __tablename__ = "booking_quotas"
    __table_args__ = (UniqueConstraint("user_id", "year", "month", name="uq_booking_quota_month"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    month: Mapped[int] = mapped_column(Integer, nullable=False)
    granted_slots: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class BookingNotificationOutbox(Base):
    """Durable Telegram notifications created in the booking transaction."""

    __tablename__ = "booking_notification_outbox"
    __table_args__ = (
        Index("ix_booking_notification_ready", "status", "next_attempt_at"),
        Index("ix_booking_notification_slot_order", "slot_id", "id"),
        Index("ix_booking_notification_retention", "status", "sent_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    event_id: Mapped[str] = mapped_column(String(36), unique=True, nullable=False, default=lambda: str(uuid4()))
    event_type: Mapped[str] = mapped_column(String(32), nullable=False)
    slot_id: Mapped[int] = mapped_column(Integer, nullable=False)
    username: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(100), nullable=False)
    slot_date: Mapped[date] = mapped_column(Date, nullable=False)
    start_time: Mapped[str] = mapped_column(String(5), nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="pending")
    attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    next_attempt_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_utcnow)
    locked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    lock_token: Mapped[str | None] = mapped_column(String(36), nullable=True)
    last_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class BookingNotificationDeliveryState(Base):
    """Shared Telegram cooldown, including notifications created during a rate limit."""

    __tablename__ = "booking_notification_delivery_state"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    blocked_until: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class Landing(Base):
    """Stable backend identity and delivery switches for a public landing page."""

    __tablename__ = "landings"
    __table_args__ = (UniqueConstraint("slug", name="uq_landings_slug"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    slug: Mapped[str] = mapped_column(String(80), nullable=False)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="1")
    telegram_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="0")
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1, server_default="1")
    config_version: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)


class LandingTelegramConfig(Base):
    """Immutable destination version; credentials stay in the external secret store."""

    __tablename__ = "landing_telegram_configs"
    __table_args__ = (
        UniqueConstraint("landing_id", "version", name="uq_landing_telegram_config_version"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    landing_id: Mapped[str] = mapped_column(String(36), ForeignKey("landings.id", ondelete="CASCADE"), nullable=False)
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    secret_ref: Mapped[str] = mapped_column(String(128), nullable=False)
    chat_id: Mapped[str] = mapped_column(String(128), nullable=False)
    bot_username: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="verified")
    verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


class LandingNotificationOutbox(Base):
    """Allowlisted landing event routed to one immutable Telegram config version."""

    __tablename__ = "landing_notification_outbox"
    __table_args__ = (
        UniqueConstraint("landing_id", "event_id", name="uq_landing_notification_event"),
        Index("ix_landing_notification_ready", "status", "next_attempt_at"),
        Index("ix_landing_notification_retention", "status", "sent_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    landing_id: Mapped[str] = mapped_column(String(36), ForeignKey("landings.id", ondelete="RESTRICT"), nullable=False)
    destination_config_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("landing_telegram_configs.id", ondelete="RESTRICT"), nullable=False
    )
    event_id: Mapped[str] = mapped_column(String(128), nullable=False)
    event_type: Mapped[str] = mapped_column(String(64), nullable=False)
    schema_version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    payload_json: Mapped[str] = mapped_column(Text, nullable=False, default="{}")
    payload_sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="pending")
    attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    manual_retry_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    next_attempt_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_utcnow)
    locked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    lock_token: Mapped[str | None] = mapped_column(String(36), nullable=True)
    last_error: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class LandingNotificationDeliveryState(Base):
    """Per-bot Telegram rate-limit cooldown for landing notifications."""

    __tablename__ = "landing_notification_delivery_state"

    destination_config_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("landing_telegram_configs.id", ondelete="CASCADE"), primary_key=True
    )
    blocked_until: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
