"""Test synthetic sequence restart rollback in a verified disposable lab."""
import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'backend'))
sys.path.insert(0, str(ROOT / 'scripts'))

import asyncpg
import c232_source_guard as source_guard
import c232_target_guard as target_guard
from infrastructure.c232_mapping import TABLE_MAPPINGS, TABLE_ORDER
from infrastructure.c232_sequence_plan import next_restart_value


async def probe(run_id):
    with source_guard.open_synthetic_snapshot() as snapshot:
        maxima = {table: snapshot.connection.execute(f'SELECT max(id) FROM "{table}"').fetchone()[0]
                  for table in TABLE_ORDER if any(column.name == 'id' and column.kind == 'integer'
                                                 for column in TABLE_MAPPINGS[table].columns)}
    await target_guard.inspect(run_id)
    directory, _ = target_guard._check_lab(run_id)
    connection = await asyncpg.connect(
        host='127.0.0.1', port=target_guard.lab.PORT, database=target_guard.lab.DATABASE,
        user=target_guard.lab.MIGRATOR,
        password=target_guard.lab._read_secret(directory, 'migrator_password'), timeout=5,
    )
    initial = {}
    transaction = connection.transaction()
    try:
        await transaction.start()
        await connection.execute('SELECT pg_advisory_xact_lock($1)', 0x43323332)
        names = ', '.join(f'public."{name}"' for name in sorted((*TABLE_ORDER, 'session_import_markers')))
        await connection.execute(f'LOCK TABLE {names} IN SHARE ROW EXCLUSIVE MODE')
        for table in (*TABLE_ORDER, 'session_import_markers'):
            if await connection.fetchval(f'SELECT EXISTS (SELECT 1 FROM public."{table}")'):
                raise RuntimeError('target_not_empty')
        for table, max_id in maxima.items():
            sequence = f'{table}_id_seq'
            if await connection.fetchval('SELECT pg_get_serial_sequence($1, $2)', 'public.' + table, 'id') != 'public.' + sequence:
                raise RuntimeError('sequence_identity_mismatch')
            meta = await connection.fetchrow('''SELECT sequenceowner, min_value, max_value,
                increment_by, cycle, cache_size FROM pg_catalog.pg_sequences
                WHERE schemaname='public' AND sequencename=$1''', sequence)
            if meta is None or meta['sequenceowner'] != target_guard.lab.MIGRATOR:
                raise RuntimeError('sequence_owner_mismatch')
            state = await connection.fetchrow(f'SELECT last_value, is_called FROM public."{sequence}"')
            initial[sequence] = tuple(state)
            value = next_restart_value(last_value=state['last_value'], is_called=state['is_called'],
                                       max_id=max_id, increment=meta['increment_by'],
                                       minimum=meta['min_value'], maximum=meta['max_value'],
                                       cache=meta['cache_size'], cycle=meta['cycle'])
            # Identifier and positive integer come from fixed mappings and the validated plan.
            await connection.execute(f'ALTER SEQUENCE public."{sequence}" RESTART WITH {value}')
            after = await connection.fetchrow(f'SELECT last_value, is_called FROM public."{sequence}"')
            if tuple(after) != (value, False):
                raise RuntimeError('sequence_restart_mismatch')
    except BaseException:
        try:
            await transaction.rollback()
        finally:
            await connection.close()
        raise
    else:
        try:
            await transaction.rollback()
        except BaseException:
            await connection.close()
            raise
    try:
        for sequence, before in initial.items():
            after = await connection.fetchrow(f'SELECT last_value, is_called FROM public."{sequence}"')
            if tuple(after) != before:
                raise RuntimeError('sequence_rollback_mismatch')
    finally:
        await connection.close()
    await target_guard.inspect(run_id)
    print(f'PASS: {len(initial)} synthetic sequence restarts rolled back without nextval')


if __name__ == '__main__':
    try:
        asyncio.run(probe(sys.argv[1]))
    except Exception:
        print('BLOCKED: sequence rollback experiment failed; disposable lab requires inspection')
        raise SystemExit(2)
