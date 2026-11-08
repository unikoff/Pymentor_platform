"""Pure lesson access rules."""

from __future__ import annotations

from typing import TYPE_CHECKING

from pymentor_core.modules.identity.access import has_active_subscription
from pymentor_core.modules.identity.access import normalize_datetime

if TYPE_CHECKING:
    from pymentor_core.modules.identity.principal import Principal


def get_lesson_access(lesson: dict, user: Principal | None) -> tuple[bool, str | None]:
    access = lesson.get("access", "registered")
    if access == "free":
        return True, None

    if user is None:
        return False, "Зарегистрируйтесь, чтобы открыть это занятие."

    if access == "registered":
        return True, None

    if access == "subscription":
        if has_active_subscription(user):
            return True, None

        if user.subscription_until:
            subscription_until = normalize_datetime(user.subscription_until)
            expires_at = (
                subscription_until.strftime("%d.%m.%Y") if subscription_until else ""
            )
            return (
                False,
                f"Подписка закончилась {expires_at}. Продлите подписку, чтобы открыть это занятие.",
            )

        return (
            False,
            "Нужна активная подписка. Продлите доступ, чтобы открыть это занятие.",
        )

    return False, "Этот тип доступа пока не поддерживается."
