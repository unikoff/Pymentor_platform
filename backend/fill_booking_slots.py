"""Fill a month with hourly booking slots in Moscow time.

Preview: python fill_booking_slots.py 2026 10
Apply:   python fill_booking_slots.py 2026 10 --apply
Existing matching slots and bookings are preserved. Conflicts abort the batch.
"""

import argparse
import json
from calendar import monthrange
from datetime import date, datetime, time, timedelta, timezone

from sqlalchemy import text

from DataBase.engine import engine


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("year", type=int)
    parser.add_argument("month", type=int)
    parser.add_argument("--start-hour", type=int, default=12)
    parser.add_argument("--end-hour", type=int, default=22)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    if not 1 <= args.year <= 9999 or not 1 <= args.month <= 12:
        parser.error("Specify a valid year and month")
    if not 0 <= args.start_hour < args.end_hour <= 24:
        parser.error("Hours must satisfy 0 <= start < end <= 24")
    if engine.dialect.name != "sqlite":
        parser.error("This script requires the platform's SQLite database")

    first_day = date(args.year, args.month, 1)
    last_day = date(args.year, args.month, monthrange(args.year, args.month)[1])
    targets = [
        (date(args.year, args.month, day).isoformat(), f"{hour:02d}:00")
        for day in range(1, last_day.day + 1)
        for hour in range(args.start_hour, args.end_hour)
    ]
    target_keys = set(targets)
    moscow = timezone(timedelta(hours=3))
    now = datetime.now(moscow)

    with engine.connect() as connection:
        # Serialize the read/check/insert batch with normal booking writes.
        connection.exec_driver_sql("BEGIN IMMEDIATE")
        try:
            rows = connection.execute(
                text(
                    "SELECT slot_date, start_time, duration_minutes "
                    "FROM booking_slots WHERE slot_date BETWEEN :first AND :last"
                ),
                {"first": first_day.isoformat(), "last": last_day.isoformat()},
            ).mappings().all()
            by_day: dict[str, list] = {}
            for row in rows:
                by_day.setdefault(row["slot_date"], []).append(row)

            missing = []
            existing_count = 0
            for day, start in targets:
                start_minutes = int(start[:2]) * 60
                overlaps = [
                    row for row in by_day.get(day, [])
                    if start_minutes < (
                        int(row["start_time"][:2]) * 60
                        + int(row["start_time"][3:]) + row["duration_minutes"]
                    )
                    and int(row["start_time"][:2]) * 60
                    + int(row["start_time"][3:]) < start_minutes + 60
                ]
                if (
                    len(overlaps) == 1
                    and overlaps[0]["start_time"] == start
                    and overlaps[0]["duration_minutes"] == 60
                ):
                    existing_count += 1
                    continue
                if overlaps:
                    raise ValueError(f"Conflicting existing slot: {day} {start}")
                starts_at = datetime.combine(
                    date.fromisoformat(day), time(int(start[:2]), 0), tzinfo=moscow
                )
                if starts_at <= now:
                    raise ValueError(f"Cannot create a past slot: {day} {start}")
                missing.append({"day": day, "start": start})

            if args.apply and missing:
                connection.execute(
                    text(
                        "INSERT INTO booking_slots "
                        "(slot_date, start_time, duration_minutes, student_id) "
                        "VALUES (:day, :start, 60, NULL)"
                    ),
                    missing,
                )
            if args.apply:
                actual = connection.execute(
                    text(
                        "SELECT slot_date, start_time, duration_minutes "
                        "FROM booking_slots WHERE slot_date BETWEEN :first AND :last"
                    ),
                    {"first": first_day.isoformat(), "last": last_day.isoformat()},
                ).fetchall()
                matching = [
                    (day, start) for day, start, duration in actual
                    if duration == 60 and (day, start) in target_keys
                ]
                if len(matching) != len(targets) or set(matching) != target_keys:
                    raise RuntimeError("Verification failed; batch rolled back")
                connection.commit()
            else:
                connection.rollback()
        except Exception:
            connection.rollback()
            raise

    print(json.dumps({
        "mode": "applied" if args.apply else "preview",
        "month": first_day.strftime("%Y-%m"),
        "timezone": "Europe/Moscow",
        "days": last_day.day,
        "slots_per_day": args.end_hour - args.start_hour,
        "target_slots": len(targets),
        "existing_matching": existing_count,
        "created": len(missing) if args.apply else 0,
        "would_create": 0 if args.apply else len(missing),
    }, sort_keys=True))


if __name__ == "__main__":
    main()
