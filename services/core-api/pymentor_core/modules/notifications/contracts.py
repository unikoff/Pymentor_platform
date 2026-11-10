"""Immutable claimed notification records."""

from dataclasses import dataclass
from datetime import date


@dataclass(frozen=True)
class ClaimedNotification:
    id: int
    event_id: str
    event_type: str
    username: str
    email: str
    slot_date: date
    start_time: str
    attempts: int
    lock_token: str


@dataclass(frozen=True)
class ClaimedLandingNotification:
    id: int
    event_id: str
    event_type: str
    landing_id: str
    landing_slug: str
    destination_config_id: str
    secret_ref: str
    chat_id: str
    payload: dict
    attempts: int
    lock_token: str


class TelegramDeliveryError(RuntimeError):
    """A Telegram rejection with retry information safe to persist in logs."""

    def __init__(
        self,
        message: str,
        *,
        retryable: bool,
        retry_after_seconds: int | None = None,
    ) -> None:
        super().__init__(message[:500])
        self.retryable = retryable
        self.retry_after_seconds = retry_after_seconds
