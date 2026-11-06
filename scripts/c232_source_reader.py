"""Read a previously validated synthetic in-memory SQLite snapshot.

The public loader is tied to the pinned source guard. This module returns
sensitive-in-principle rows to trusted callers but never prints them.
"""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'backend'))
sys.path.insert(0, str(ROOT / 'scripts'))

import c232_source_guard as source_guard
from infrastructure.c232_mapping import TABLE_ORDER
from infrastructure.c232_preflight import MAX_ROWS_PER_TABLE, preflight


class SourceReadError(Exception):
    """Redacted synthetic snapshot read failure."""


_PREFLIGHT_CATEGORIES = {
    'Invalid table set': 'source_table_set_invalid',
    'Invalid table rows': 'source_table_rows_invalid',
    'Table row limit exceeded': 'source_row_limit_exceeded',
    'Invalid row': 'source_value_invalid',
    'Duplicate key': 'source_duplicate_key',
    'Foreign key violation': 'source_foreign_key_invalid',
}


def read_snapshot(connection):
    try:
        tables = {}
        for table in TABLE_ORDER:
            cursor = connection.execute(f'SELECT * FROM "{table}" LIMIT ?', (MAX_ROWS_PER_TABLE + 1,))
            columns = [column[0] for column in cursor.description]
            records = cursor.fetchall()
            if len(records) > MAX_ROWS_PER_TABLE or len(columns) != len(set(columns)):
                raise ValueError('invalid fixture')
            tables[table] = [dict(zip(columns, record)) for record in records]
        try:
            preflight(tables)
        except ValueError as exc:
            raise SourceReadError(_PREFLIGHT_CATEGORIES.get(str(exc), 'synthetic_source_invalid')) from None
        return tables
    except SourceReadError:
        raise
    except Exception:
        raise SourceReadError('synthetic_source_invalid') from None


def load_pinned_source():
    with source_guard.open_synthetic_snapshot() as snapshot:
        return read_snapshot(snapshot.connection)
