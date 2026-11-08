"""Pure SQLite-to-PostgreSQL value conversions for a future importer.

Each ``to_*`` function preserves None and raises ValueError without input data
on invalid values. Booleans accept only bool and integer 0/1; integers accept
only int (excluding bool). Text is passed unchanged. Dates accept date objects
or YYYY-MM-DD strings, timestamps accept datetime objects or ISO datetime
strings. Timestamps are returned aware in UTC. Naive timestamps require an
explicit tzinfo through ``assumed_timezone``; ambiguous and nonexistent local
times are rejected. No database connections or schema decisions are made here.
"""

from datetime import date
from datetime import datetime
from datetime import timezone
from datetime import tzinfo
import json
import re

_TIMESTAMP_PATTERN = re.compile(
    r"\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}"
    r"(?::\d{2}(?:[.,]\d{1,6})?)?"
    r"(?:Z|[+-]\d{2}(?::?\d{2}(?::?\d{2}(?:[.,]\d{1,6})?)?)?)?"
)


def to_boolean(value: object) -> bool | None:
    if value is None:
        return None
    if type(value) is bool:
        return value
    if type(value) is int and value in (0, 1):
        return bool(value)
    raise ValueError("Invalid boolean")


def to_integer(value: object) -> int | None:
    if value is None:
        return None
    if type(value) is int:
        return value
    raise ValueError("Invalid integer")


def to_text(value: object) -> str | None:
    if value is None or type(value) is str:
        return value
    raise ValueError("Invalid text")


def validate_json_text(value: object) -> str | None:
    """Validate JSON syntax while preserving the original text exactly."""
    if value is None:
        return None
    if type(value) is not str:
        raise ValueError("Invalid JSON")

    def reject_constant(_value):
        raise ValueError("Invalid JSON")

    try:
        json.loads(value, parse_constant=reject_constant)
    except (ValueError, TypeError, RecursionError):
        raise ValueError("Invalid JSON") from None
    return value


def to_date(value: object) -> date | None:
    if value is None:
        return None
    if type(value) is date:
        return value
    if type(value) is str and re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
        try:
            return date.fromisoformat(value)
        except ValueError:
            pass
    raise ValueError("Invalid date")


def to_timestamp(
    value: object, *, assumed_timezone: tzinfo | None = None
) -> datetime | None:
    if value is None:
        return None
    try:
        if type(value) is str:
            # datetime.fromisoformat silently truncates fractions beyond six
            # digits and interprets a fraction of minutes as seconds. Restrict
            # the accepted grammar before parsing to avoid changing values.
            if not _TIMESTAMP_PATTERN.fullmatch(value):
                raise ValueError
            parsed = datetime.fromisoformat(value)
        elif type(value) is datetime:
            parsed = value
        else:
            raise ValueError

        if parsed.utcoffset() is None:
            if not isinstance(assumed_timezone, tzinfo):
                raise ValueError
            # Round-trip both folds to reject DST gaps and overlaps instead of
            # silently selecting an arbitrary offset.
            candidates = set()
            for fold in (0, 1):
                local = parsed.replace(tzinfo=assumed_timezone, fold=fold)
                if local.utcoffset() is None:
                    raise ValueError
                utc = local.astimezone(timezone.utc)
                if utc.astimezone(assumed_timezone).replace(
                    tzinfo=None
                ) == parsed.replace(tzinfo=None):
                    candidates.add(utc)
            if len(candidates) != 1:
                raise ValueError
            return candidates.pop()
        return parsed.astimezone(timezone.utc)
    except (ValueError, TypeError, OverflowError):
        raise ValueError("Invalid timestamp") from None
