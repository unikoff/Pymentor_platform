"""Pure synthetic-data preflight; this is not an import readiness decision.

Sessions need a separate session/marker and Redis protocol. Outbox workers
must remain disabled during any future import; this module does not control them.
The uniqueness definitions reflect the c222_initial_pg DDL snapshot.
"""
from collections.abc import Mapping

from infrastructure.c232_mapping import TABLE_MAPPINGS, TABLE_ORDER, convert_row

MAX_ROWS_PER_TABLE = 10_000

_PRIMARY_KEYS = {name: ('id',) for name in TABLE_ORDER}
_PRIMARY_KEYS['landing_notification_delivery_state'] = ('destination_config_id',)
_UNIQUE_KEYS = {
    'users': (('email',),),
    'admins': (('email',),),
    'landings': (('slug',),),
    'sessions': (('session_token',),),
    'user_activity_days': (('user_id', 'activity_date'),),
    'user_lesson_progress': (('user_id', 'lesson_id'),),
    'user_task_progress': (('user_id', 'task_id'),),
    'booking_slots': (('slot_date', 'start_time'),),
    'booking_quotas': (('user_id', 'year', 'month'),),
    'booking_reminders': (('slot_id',),),
    'booking_notification_outbox': (('event_id',),),
    'landing_telegram_configs': (('landing_id', 'version'),),
    'landing_notification_outbox': (('landing_id', 'event_id'),),
}


def preflight(tables: Mapping[str, object]) -> dict[str, int]:
    """Validate all 15 in-memory row sequences and return only table counts.

    Naive timestamps are rejected. Inputs must be lists or tuples of complete
    row mappings. Failures expose no row data, including in chained tracebacks.
    """
    if not isinstance(tables, Mapping) or set(tables) != set(TABLE_ORDER):
        raise ValueError('Invalid table set')

    converted = {}
    for table in TABLE_ORDER:
        rows = tables[table]
        if not isinstance(rows, (list, tuple)):
            raise ValueError('Invalid table rows')
        if len(rows) > MAX_ROWS_PER_TABLE:
            raise ValueError('Table row limit exceeded')
        converted[table] = []
        keys = (_PRIMARY_KEYS[table],) + _UNIQUE_KEYS.get(table, ())
        seen = [set() for _ in keys]
        for row in rows:
            try:
                values = convert_row(table, row)
            except ValueError:
                raise ValueError('Invalid row') from None
            for columns, index in zip(keys, seen):
                key = tuple(values[column] for column in columns)
                # PostgreSQL unique constraints treat NULLs as distinct.
                if any(value is None for value in key):
                    continue
                if key in index:
                    raise ValueError('Duplicate key')
                index.add(key)
            converted[table].append(values)

    for table in TABLE_ORDER:
        for column in TABLE_MAPPINGS[table].columns:
            if column.references is None:
                continue
            target_table, target_column = column.references.split('.')
            targets = {row[target_column] for row in converted[target_table]}
            for row in converted[table]:
                value = row[column.name]
                if value is not None and value not in targets:
                    raise ValueError('Foreign key violation')
    return {table: len(converted[table]) for table in TABLE_ORDER}
