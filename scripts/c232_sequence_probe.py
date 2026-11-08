"""Read sequence metadata in a verified synthetic lab; perform no ALTER."""
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
        maxima = {}
        for table in TABLE_ORDER:
            ids = [column for column in TABLE_MAPPINGS[table].columns
                   if column.name == 'id' and column.kind == 'integer']
            if ids:
                maxima[table] = snapshot.connection.execute(f'SELECT max(id) FROM "{table}"').fetchone()[0]
    await target_guard.inspect(run_id)
    directory, _ = target_guard._check_lab(run_id)
    connection = await asyncpg.connect(
        host='127.0.0.1', port=target_guard.lab.PORT, database=target_guard.lab.DATABASE,
        user=target_guard.lab.MIGRATOR,
        password=target_guard.lab._read_secret(directory, 'migrator_password'), timeout=5,
        server_settings={'default_transaction_read_only': 'on'},
    )
    try:
        async with connection.transaction(readonly=True):
            for table, max_id in maxima.items():
                sequence = f'{table}_id_seq'
                actual = await connection.fetchval('SELECT pg_get_serial_sequence($1, $2)',
                                                   'public.' + table, 'id')
                if actual != 'public.' + sequence:
                    raise RuntimeError('sequence_identity_mismatch')
                metadata = await connection.fetchrow('''SELECT sequenceowner, min_value, max_value,
                    increment_by, cycle, cache_size FROM pg_catalog.pg_sequences
                    WHERE schemaname='public' AND sequencename=$1''', sequence)
                if metadata is None or metadata['sequenceowner'] != target_guard.lab.MIGRATOR:
                    raise RuntimeError('sequence_owner_mismatch')
                state = await connection.fetchrow(f'SELECT last_value, is_called FROM public."{sequence}"')
                next_restart_value(last_value=state['last_value'], is_called=state['is_called'],
                                   max_id=max_id, increment=metadata['increment_by'],
                                   minimum=metadata['min_value'], maximum=metadata['max_value'],
                                   cache=metadata['cache_size'], cycle=metadata['cycle'])
    finally:
        await connection.close()
    print(f'PASS: {len(maxima)} synthetic sequence plans checked read-only; no sequence changed')


if __name__ == '__main__':
    try:
        asyncio.run(probe(sys.argv[1]))
    except Exception:
        print('BLOCKED: sequence planning probe failed; disposable lab requires inspection')
        raise SystemExit(2)
