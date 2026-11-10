"""Activity compatibility facade and calendar policy exports."""

from pymentor_core.modules.identity.activity_policy import MOSCOW_TZ
from pymentor_core.modules.identity.activity_policy import serialize_activity_timestamp
from pymentor_core.shared.bindings import get_bindings


def record_activity_day(
    user_id, activity_date, db, visited_at=None, *, uow=None, clock=None
):
    return get_bindings().activity.record_activity_day(
        user_id, activity_date, db, visited_at=visited_at, uow=uow, clock=clock
    )


def get_activity_records(user_id, year, month, db):
    return get_bindings().activity.get_activity_records(user_id, year, month, db)


def get_activity_summary(user_id, db, *, clock=None):
    return get_bindings().activity.get_activity_summary(user_id, db, clock=clock)
