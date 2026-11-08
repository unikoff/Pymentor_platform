"""Explicit, pure column mapping for the future SQLite import.

This module does not read or write databases. The sessions mapping describes the
schema only: importing sessions requires a separate session/marker protocol.
"""
from dataclasses import dataclass
from datetime import tzinfo
from types import MappingProxyType
from typing import Mapping

from infrastructure.c232_import_types import (
    to_boolean, to_date, to_integer, to_text, to_timestamp, validate_json_text,
)


@dataclass(frozen=True)
class ColumnMapping:
    name: str
    kind: str  # integer, boolean, string, text, date, timestamp
    nullable: bool = False
    length: int | None = None
    references: str | None = None  # target table.column
    json_text: bool = False


@dataclass(frozen=True)
class TableMapping:
    source: str
    target: str
    columns: tuple[ColumnMapping, ...]
    requires_session_marker_protocol: bool = False


def C(name, kind, nullable=False, length=None, references=None, json_text=False):
    return ColumnMapping(name, kind, nullable, length, references, json_text)


def T(name, *columns, session=False):
    return TableMapping(name, name, columns, session)


# Order is a topological order of all actual DDL foreign keys.
_TABLES = (
    T('users', C('id','integer'), C('username','string',length=50), C('email','string',length=100), C('password_hash','string',length=255), C('subscription_until','timestamp',True), C('subscription_plan','string',True,32), C('is_admin','boolean')),
    T('admins', C('id','integer'), C('username','string',length=50), C('email','string',length=100), C('password_hash','string',length=255)),
    T('landings', C('id','string',length=36), C('slug','string',length=80), C('title','string',length=120), C('description','text'), C('is_active','boolean'), C('telegram_enabled','boolean'), C('version','integer'), C('config_version','integer'), C('created_at','timestamp'), C('updated_at','timestamp')),
    T('sessions', C('id','integer'), C('user_id','integer',references='users.id'), C('session_token','string',length=64), C('created_at','timestamp'), session=True),
    T('user_activity_days', C('id','integer'), C('user_id','integer',references='users.id'), C('activity_date','date'), C('visited_at','timestamp',True)),
    T('user_lesson_progress', C('id','integer'), C('user_id','integer',references='users.id'), C('lesson_id','string',length=40), C('completed_at','timestamp')),
    T('user_task_progress', C('id','integer'), C('user_id','integer',references='users.id'), C('task_id','string',length=160), C('task_revision','string',length=64), C('completed_at','timestamp')),
    T('booking_slots', C('id','integer'), C('slot_date','date'), C('start_time','string',length=5), C('duration_minutes','integer'), C('student_id','integer',True,references='users.id'), C('created_at','timestamp')),
    T('booking_quotas', C('id','integer'), C('user_id','integer',references='users.id'), C('year','integer'), C('month','integer'), C('granted_slots','integer')),
    T('booking_reminders', C('id','integer'), C('slot_id','integer',references='booking_slots.id'), C('chat_id','string',length=64), C('remind_at','timestamp'), C('sent_at','timestamp',True), C('created_at','timestamp')),
    T('booking_notification_outbox', C('id','integer'), C('event_id','string',length=36), C('event_type','string',length=32), C('slot_id','integer'), C('username','string',length=50), C('email','string',length=100), C('slot_date','date'), C('start_time','string',length=5), C('status','string',length=16), C('attempts','integer'), C('next_attempt_at','timestamp'), C('locked_until','timestamp',True), C('lock_token','string',True,36), C('last_error','text',True), C('created_at','timestamp'), C('sent_at','timestamp',True)),
    T('booking_notification_delivery_state', C('id','integer'), C('blocked_until','timestamp')),
    T('landing_telegram_configs', C('id','string',length=36), C('landing_id','string',length=36,references='landings.id'), C('version','integer'), C('secret_ref','string',length=128), C('chat_id','string',length=128), C('bot_username','string',length=64), C('status','string',length=16), C('verified_at','timestamp'), C('created_at','timestamp')),
    T('landing_notification_outbox', C('id','integer'), C('landing_id','string',length=36,references='landings.id'), C('destination_config_id','string',length=36,references='landing_telegram_configs.id'), C('event_id','string',length=128), C('event_type','string',length=64), C('schema_version','integer'), C('payload_json','text',json_text=True), C('payload_sha256','string',length=64), C('status','string',length=16), C('attempts','integer'), C('manual_retry_count','integer'), C('next_attempt_at','timestamp'), C('locked_until','timestamp',True), C('lock_token','string',True,36), C('last_error','string',True,500), C('created_at','timestamp'), C('sent_at','timestamp',True)),
    T('landing_notification_delivery_state', C('destination_config_id','string',length=36,references='landing_telegram_configs.id'), C('blocked_until','timestamp')),
)
TABLE_ORDER = tuple(table.source for table in _TABLES)
TABLE_MAPPINGS = MappingProxyType({table.source: table for table in _TABLES})


def convert_row(table: str, row: Mapping[str, object], *, assumed_timezone: tzinfo | None = None) -> dict[str, object]:
    """Validate a complete source row and return target values; never include input in errors."""
    if type(table) is not str or table not in TABLE_MAPPINGS:
        raise ValueError('Unknown table')
    spec = TABLE_MAPPINGS[table]
    if not isinstance(row, Mapping) or set(row) != {column.name for column in spec.columns}:
        raise ValueError('Invalid row schema')
    result = {}
    for column in spec.columns:
        value = row[column.name]
        try:
            if value is None and not column.nullable:
                raise ValueError
            if column.kind == 'integer':
                value = to_integer(value)
                if value is not None and not -(2**31) <= value < 2**31:
                    raise ValueError
            elif column.kind == 'boolean':
                value = to_boolean(value)
            elif column.kind == 'date':
                value = to_date(value)
            elif column.kind == 'timestamp':
                value = to_timestamp(value, assumed_timezone=assumed_timezone)
            elif column.kind in ('string', 'text'):
                value = validate_json_text(value) if column.json_text else to_text(value)
                if value is not None:
                    if '\x00' in value or (column.length is not None and len(value) > column.length):
                        raise ValueError
                    value.encode('utf-8')
            else:
                raise ValueError
        except (ValueError, TypeError, OverflowError, UnicodeError):
            raise ValueError('Invalid column value') from None
        result[column.name] = value
    return result
