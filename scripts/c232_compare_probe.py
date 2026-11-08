"""Compare pinned synthetic data against disposable PostgreSQL, then roll back.

This tests values inside one aborted transaction. It is not an importer, does
not prepare Redis sessions, and may only run against a verified C232 lab.
"""
import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'backend'))
sys.path.insert(0, str(ROOT / 'scripts'))

import asyncpg
import c232_source_guard as source_guard
import c232_target_guard as target_guard
from infrastructure.c232_compare import compare_rows
from infrastructure.c232_mapping import TABLE_MAPPINGS, TABLE_ORDER, convert_row
from infrastructure.c232_preflight import MAX_ROWS_PER_TABLE, preflight


async def probe(run_id):
    with source_guard.open_synthetic_snapshot() as snapshot:
        source = {}
        for table in TABLE_ORDER:
            cursor = snapshot.connection.execute(f'SELECT * FROM "{table}" LIMIT ?', (MAX_ROWS_PER_TABLE + 1,))
            columns = [column[0] for column in cursor.description]
            source[table] = [dict(zip(columns, row)) for row in cursor.fetchall()]
        preflight(source)
    await target_guard.inspect(run_id)
    directory, _ = target_guard._check_lab(run_id)
    connection = await asyncpg.connect(
        host='127.0.0.1', port=target_guard.lab.PORT, database=target_guard.lab.DATABASE,
        user=target_guard.lab.MIGRATOR,
        password=target_guard.lab._read_secret(directory, 'migrator_password'), timeout=5,
    )
    transaction = connection.transaction()
    try:
        await transaction.start()
        names = ', '.join(f'public."{name}"' for name in sorted((*TABLE_ORDER, 'session_import_markers')))
        await connection.execute(f'LOCK TABLE {names} IN ACCESS EXCLUSIVE MODE')
        for name in (*TABLE_ORDER, 'session_import_markers'):
            if await connection.fetchval(f'SELECT EXISTS (SELECT 1 FROM public."{name}")'):
                raise RuntimeError('target_not_empty')
        for table in TABLE_ORDER:
            cols = [column.name for column in TABLE_MAPPINGS[table].columns]
            names = ', '.join(f'"{col}"' for col in cols)
            parameters = ', '.join(f'${index}' for index in range(1, len(cols) + 1))
            rows = [convert_row(table, row) for row in source[table]]
            if rows:
                await connection.executemany(f'INSERT INTO public."{table}" ({names}) VALUES ({parameters})',
                                             [tuple(row[col] for col in cols) for row in rows])
        target = {}
        for table in TABLE_ORDER:
            cols = [column.name for column in TABLE_MAPPINGS[table].columns]
            names = ', '.join(f'"{col}"' for col in cols)
            target[table] = [dict(row) for row in await connection.fetch(f'SELECT {names} FROM public."{table}"')]
        compare_rows(source, target)
        # A changed field must be detected, without exposing the row.
        await connection.execute("UPDATE public.users SET username='synthetic_changed' WHERE id=1")
        target['users'] = [dict(row) for row in await connection.fetch('SELECT * FROM public.users')]
        try:
            compare_rows(source, target)
        except ValueError:
            pass
        else:
            raise RuntimeError('mismatch_not_detected')
    finally:
        await transaction.rollback()
        await connection.close()
    # The same strict guard proves that the rolled-back lab is empty again.
    await target_guard.inspect(run_id)
    print('PASS: 15 synthetic tables compared, deliberate mismatch detected, transaction rolled back')


if __name__ == '__main__':
    try:
        asyncio.run(probe(sys.argv[1]))
    except Exception:
        print('BLOCKED: comparison probe failed; disposable lab requires inspection')
        raise SystemExit(2)
