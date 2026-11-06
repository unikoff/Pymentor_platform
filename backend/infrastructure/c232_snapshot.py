"""Read and validate an explicitly supplied local SQLite snapshot.

The reader owns no source data and never opens a database for writing. It reads
inside one SQLite transaction (including normal WAL visibility). Its returned
rows may contain secrets and must not be logged. SQLite may update transient
WAL shared-memory reader slots; use a prepared copy, never the live database.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import timezone
import hashlib
import json
from pathlib import Path
import sqlite3
from typing import Any

from infrastructure.c232_mapping import TABLE_MAPPINGS, TABLE_ORDER
from infrastructure.c232_import_types import to_timestamp
from infrastructure.c232_preflight import MAX_ROWS_PER_TABLE, preflight


class SnapshotReadError(Exception):
    """A redacted category for local snapshot read or validation failures."""

    def __init__(self, category: str):
        self.category = category
        super().__init__(category)


@dataclass(frozen=True)
class LocalSnapshot:
    identity: str
    row_counts: dict[str, int]
    tables: dict[str, list[dict[str, Any]]] = field(repr=False)


_PREFLIGHT_CATEGORIES = {
    'Invalid table set': 'table_set_invalid',
    'Invalid table rows': 'table_rows_invalid',
    'Table row limit exceeded': 'row_limit_exceeded',
    'Invalid row': 'row_invalid',
    'Duplicate key': 'duplicate_key',
    'Foreign key violation': 'foreign_key_invalid',
}
_IDENTITY_KEYS = {
    table: (('destination_config_id',) if table == 'landing_notification_delivery_state' else ('id',))
    for table in TABLE_ORDER
}


def _sqlite_affinity(declared_type: str) -> str:
    upper = declared_type.upper()
    if 'INT' in upper:
        return 'INTEGER'
    if any(part in upper for part in ('CHAR', 'CLOB', 'TEXT')):
        return 'TEXT'
    if not upper or any(part in upper for part in ('REAL', 'FLOA', 'DOUB')):
        return 'REAL' if upper else 'BLOB'
    return 'NUMERIC'


def _expected_affinities(kind: str) -> frozenset[str]:
    if kind == 'integer':
        return frozenset({'INTEGER'})
    if kind == 'boolean':
        return frozenset({'INTEGER', 'NUMERIC'})
    if kind in ('date', 'timestamp'):
        # SQLite adapters commonly declare these as DATE/DATETIME (NUMERIC)
        # or TEXT; both preserve the mapped textual representation.
        return frozenset({'NUMERIC', 'TEXT'})
    return frozenset({'TEXT'})


def _canonical_value(value: Any) -> Any:
    if isinstance(value, bytes):
        return {'$bytes': value.hex()}
    if value is None or type(value) in (str, int, float):
        return value
    raise ValueError('unsupported sqlite value')


def read_local_snapshot(path: str | Path, *, assume_naive_utc: bool = False) -> LocalSnapshot:
    """Read one explicit prepared SQLite copy; return rows, counts and identity.

    The preflight currently caps each table at ``MAX_ROWS_PER_TABLE`` (10,000);
    this reader reports ``row_limit_exceeded`` if any table exceeds that cap.
    """
    try:
        if type(assume_naive_utc) is not bool:
            raise SnapshotReadError('snapshot_invalid')
        source = Path(path)
        if not source.is_file():
            raise SnapshotReadError('source_missing')
        uri = source.resolve().as_uri() + '?mode=ro'
        connection = sqlite3.connect(uri, uri=True, isolation_level=None)
        connection.execute('PRAGMA query_only = ON')
        connection.execute('BEGIN')

        table_rows: dict[str, list[dict[str, Any]]] = {}
        identity_tables = []
        existing = {
            row[0] for row in connection.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
            )
        }
        if existing != set(TABLE_ORDER):
            raise SnapshotReadError('schema_invalid')

        for table in TABLE_ORDER:
            spec = TABLE_MAPPINGS[table]
            info = connection.execute(f'PRAGMA table_info("{table}")').fetchall()
            expected_names = tuple(column.name for column in spec.columns)
            actual_names = tuple(item[1] for item in info)
            if len(actual_names) != len(set(actual_names)) or set(actual_names) != set(expected_names):
                raise SnapshotReadError('schema_invalid')
            declared = {item[1]: item[2] for item in info}
            if any(_sqlite_affinity(declared[col.name]) not in _expected_affinities(col.kind)
                   for col in spec.columns):
                raise SnapshotReadError('schema_type_invalid')
            if any(bool(next(item[3] for item in info if item[1] == col.name)) == col.nullable
                   for col in spec.columns):
                raise SnapshotReadError('schema_nullability_invalid')

            declared_fks = {
                (item[3], item[2], item[4])
                for item in connection.execute(f'PRAGMA foreign_key_list("{table}")')
            }
            expected_fks = set()
            for col in spec.columns:
                if col.references:
                    target_table, target_column = col.references.split('.')
                    expected_fks.add((col.name, target_table, target_column))
            if declared_fks != expected_fks:
                raise SnapshotReadError('foreign_key_schema_invalid')

            order_by = ', '.join(f'"{name}"' for name in _IDENTITY_KEYS[table])
            cursor = connection.execute(
                f'SELECT * FROM "{table}" ORDER BY {order_by} LIMIT ?',
                (MAX_ROWS_PER_TABLE + 1,),
            )
            names = tuple(item[0] for item in cursor.description)
            records = cursor.fetchall()
            if len(records) > MAX_ROWS_PER_TABLE:
                raise SnapshotReadError('row_limit_exceeded')
            rows = [dict(zip(names, record)) for record in records]
            identity_tables.append([
                table,
                [[name, declared[name]] for name in expected_names],
                [[_canonical_value(record[name]) for name in expected_names] for record in rows],
            ])
            if assume_naive_utc:
                for record in rows:
                    for column in spec.columns:
                        if column.kind == 'timestamp' and record[column.name] is not None:
                            try:
                                record[column.name] = to_timestamp(record[column.name], assumed_timezone=timezone.utc)
                            except ValueError:
                                raise SnapshotReadError('row_invalid') from None
            table_rows[table] = rows

        if connection.execute('PRAGMA foreign_key_check').fetchone() is not None:
            raise SnapshotReadError('foreign_key_invalid')
        try:
            counts = preflight(table_rows)
        except ValueError as exc:
            raise SnapshotReadError(_PREFLIGHT_CATEGORIES.get(str(exc), 'snapshot_invalid')) from None

        payload = json.dumps(identity_tables, ensure_ascii=False, separators=(',', ':'), allow_nan=False)
        identity = hashlib.sha256(payload.encode('utf-8')).hexdigest()
        connection.rollback()
        connection.close()
        return LocalSnapshot(identity=identity, row_counts=counts, tables=table_rows)
    except SnapshotReadError:
        try:
            connection.close()
        except (NameError, sqlite3.Error):
            pass
        raise
    except Exception:
        try:
            connection.close()
        except (NameError, sqlite3.Error):
            pass
        raise SnapshotReadError('snapshot_unreadable') from None
