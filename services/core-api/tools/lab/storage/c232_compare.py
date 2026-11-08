"""Compare prevalidated synthetic source rows with in-memory target rows.

The caller owns source/preflight validation and obtains target rows separately.
This module performs no database access and never returns row data.
"""

from collections.abc import Mapping
from datetime import date
from datetime import datetime

from tools.lab.storage.c232_mapping import TABLE_MAPPINGS
from tools.lab.storage.c232_mapping import TABLE_ORDER
from tools.lab.storage.c232_mapping import convert_row


def compare_rows(source: Mapping, target: Mapping) -> None:
    """Raise a category-only ValueError on any difference; return None on match.

    Both inputs contain all mapped tables as lists or tuples of row mappings.
    Target values must have PostgreSQL's corresponding native Python types;
    aware timestamps are compared as instants. Source rows use convert_row.
    """
    if (
        not isinstance(source, Mapping)
        or not isinstance(target, Mapping)
        or set(source) != set(TABLE_ORDER)
        or set(target) != set(TABLE_ORDER)
    ):
        raise ValueError("Invalid table set")

    for table in TABLE_ORDER:
        if not isinstance(source[table], (list, tuple)) or not isinstance(
            target[table], (list, tuple)
        ):
            raise ValueError("Invalid table rows")
        columns = TABLE_MAPPINGS[table].columns
        names = {column.name for column in columns}
        key_name = (
            "destination_config_id"
            if table == "landing_notification_delivery_state"
            else "id"
        )
        indexes = []
        for rows, is_source in ((source[table], True), (target[table], False)):
            index = {}
            for row in rows:
                if not isinstance(row, Mapping) or set(row) != names:
                    raise ValueError("Invalid row schema")
                if is_source:
                    try:
                        values = convert_row(table, row)
                    except ValueError:
                        raise ValueError("Invalid source row") from None
                else:
                    values = dict(row)
                    for column in columns:
                        value = values[column.name]
                        expected = {
                            "integer": int,
                            "boolean": bool,
                            "string": str,
                            "text": str,
                            "date": date,
                            "timestamp": datetime,
                        }[column.kind]
                        if value is None:
                            if not column.nullable:
                                raise ValueError("Invalid target row")
                        elif type(value) is not expected:
                            raise ValueError("Invalid target row")
                        elif column.kind == "timestamp" and value.utcoffset() is None:
                            raise ValueError("Invalid target row")
                key = values[key_name]
                if key in index:
                    raise ValueError("Duplicate key")
                index[key] = values
            indexes.append(index)
        expected_rows, actual_rows = indexes
        if expected_rows.keys() != actual_rows.keys():
            raise ValueError("Row mismatch")
        for key, expected_row in expected_rows.items():
            if any(
                expected_row[column.name] != actual_rows[key][column.name]
                for column in columns
            ):
                raise ValueError("Value mismatch")
