"""Fail-closed transaction gate for a separately verified synthetic lab.

This is not an importer. The caller must independently verify the synthetic
source and disposable target, and stop ordinary writers and consumers. The
injected connection must be dedicated and trusted; this module never connects.
"""

from copy import deepcopy

from tools.lab.storage.c232_compare import compare_rows
from tools.lab.storage.c232_mapping import TABLE_MAPPINGS
from tools.lab.storage.c232_mapping import TABLE_ORDER
from tools.lab.storage.c232_mapping import convert_row
from tools.lab.storage.c232_preflight import preflight


class TransactionGateError(Exception):
    """A category-only error that does not disclose database or row values."""


_LOCK_KEY = 0x43323332
_TABLES = tuple(sorted((*TABLE_ORDER, "session_import_markers")))


async def check_empty_target(connection, tables):
    """Check synthetic input and an empty target under transaction locks.

    The locks end when this function returns; the result cannot authorize a
    subsequent import. No marker is created, and no row or sequence is changed.
    """
    try:
        counts = preflight(tables)
        if counts["sessions"]:
            raise TransactionGateError("sessions_unsupported")
        async with connection.transaction():
            await connection.execute("SELECT pg_advisory_xact_lock($1)", _LOCK_KEY)
            # Fixed identifiers only. Locking all tables prevents ordinary SQL
            # writers racing the checks while this transaction is active.
            names = ", ".join(f'public."{name}"' for name in _TABLES)
            await connection.execute(f"LOCK TABLE {names} IN SHARE ROW EXCLUSIVE MODE")
            for name in _TABLES:
                if await connection.fetchval(
                    f'SELECT EXISTS (SELECT 1 FROM public."{name}" LIMIT 1)'
                ):
                    raise TransactionGateError("target_not_empty")
    except TransactionGateError:
        raise
    except Exception:
        raise TransactionGateError("transaction_gate_failed") from None
    return counts


async def experiment_import_rollback_only(connection, tables):
    """Insert and compare synthetic rows, then always roll back.

    The caller must independently verify the source and disposable target and
    stop writers and consumers. The connection must be dedicated and trusted.
    This experiment never commits, configures sequences, or creates a marker.
    """
    try:
        source = deepcopy(tables)
        counts = preflight(source)
        if counts["sessions"]:
            raise TransactionGateError("sessions_unsupported")
        if connection.is_in_transaction():
            raise TransactionGateError("external_transaction_unsupported")

        transaction = connection.transaction()
        await transaction.start()
        try:
            await connection.execute("SELECT pg_advisory_xact_lock($1)", _LOCK_KEY)
            names = ", ".join(f'public."{name}"' for name in _TABLES)
            await connection.execute(f"LOCK TABLE {names} IN SHARE ROW EXCLUSIVE MODE")
            for name in _TABLES:
                if await connection.fetchval(
                    f'SELECT EXISTS (SELECT 1 FROM public."{name}" LIMIT 1)'
                ):
                    raise TransactionGateError("target_not_empty")

            for table in TABLE_ORDER:
                columns = [column.name for column in TABLE_MAPPINGS[table].columns]
                names = ", ".join(f'"{column}"' for column in columns)
                params = ", ".join(f"${index}" for index in range(1, len(columns) + 1))
                rows = [convert_row(table, row) for row in source[table]]
                if rows:
                    await connection.executemany(
                        f'INSERT INTO public."{table}" ({names}) VALUES ({params})',
                        [tuple(row[column] for column in columns) for row in rows],
                    )

            target = {}
            for table in TABLE_ORDER:
                names = ", ".join(
                    f'"{column.name}"' for column in TABLE_MAPPINGS[table].columns
                )
                target[table] = [
                    dict(row)
                    for row in await connection.fetch(
                        f'SELECT {names} FROM public."{table}"'
                    )
                ]
            try:
                compare_rows(source, target)
            except ValueError:
                raise TransactionGateError("comparison_failed") from None
        finally:
            await transaction.rollback()
    except TransactionGateError:
        raise
    except Exception:
        raise TransactionGateError("transaction_experiment_failed") from None
    return counts
