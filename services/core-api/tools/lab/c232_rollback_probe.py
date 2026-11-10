"""Exercise rollback-only importer on pinned synthetic data without sessions.

This is a disposable database experiment, not a dry-run or migration. The two
synthetic sessions are removed only from the in-memory input to exercise the
still session-incompatible transaction code; the source is never changed.
"""

import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
import asyncpg
import tools.migration.c232_source_guard as source_guard
import tools.migration.c232_target_guard as target_guard
from tools.lab.storage.c232_import_transaction import experiment_import_rollback_only
from tools.lab.storage.c232_mapping import TABLE_ORDER
from tools.lab.storage.c232_preflight import MAX_ROWS_PER_TABLE
from tools.lab.storage.c232_preflight import preflight


class PauseAfterInsert:
    def __init__(self, connection):
        self.connection = connection
        self.ready = asyncio.Event()
        self.wait = asyncio.Event()

    def transaction(self):
        return self.connection.transaction()

    def is_in_transaction(self):
        return self.connection.is_in_transaction()

    async def execute(self, *args):
        return await self.connection.execute(*args)

    async def fetchval(self, *args):
        return await self.connection.fetchval(*args)

    async def executemany(self, *args):
        result = await self.connection.executemany(*args)
        self.ready.set()
        await self.wait.wait()
        return result


async def probe(run_id):
    with source_guard.open_synthetic_snapshot() as snapshot:
        source = {}
        for table in TABLE_ORDER:
            cursor = snapshot.connection.execute(
                f'SELECT * FROM "{table}" LIMIT ?', (MAX_ROWS_PER_TABLE + 1,)
            )
            columns = [column[0] for column in cursor.description]
            source[table] = [dict(zip(columns, row)) for row in cursor.fetchall()]
        full_counts = preflight(source)
        if full_counts["sessions"] != 2:
            raise RuntimeError("unexpected_synthetic_session_count")
        source["sessions"] = []
    await target_guard.inspect(run_id)
    directory, _ = target_guard._check_lab(run_id)
    connection = await asyncpg.connect(
        host="127.0.0.1",
        port=target_guard.lab.PORT,
        database=target_guard.lab.DATABASE,
        user=target_guard.lab.MIGRATOR,
        password=target_guard.lab._read_secret(directory, "migrator_password"),
        timeout=5,
    )
    try:
        for _ in range(2):
            counts = await experiment_import_rollback_only(connection, source)
            if sum(counts.values()) != 19:
                raise RuntimeError("unexpected_row_count")
            for table in (*TABLE_ORDER, "session_import_markers"):
                if await connection.fetchval(
                    f'SELECT EXISTS (SELECT 1 FROM public."{table}")'
                ):
                    raise RuntimeError("rollback_not_empty")
        paused = PauseAfterInsert(connection)
        task = asyncio.create_task(experiment_import_rollback_only(paused, source))
        try:
            await asyncio.wait_for(paused.ready.wait(), 10)
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass
            else:
                raise RuntimeError("cancellation_not_observed")
        finally:
            if not task.done():
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass
        if connection.is_in_transaction():
            raise RuntimeError("cancel_left_transaction_open")
        for table in (*TABLE_ORDER, "session_import_markers"):
            if await connection.fetchval(
                f'SELECT EXISTS (SELECT 1 FROM public."{table}")'
            ):
                raise RuntimeError("cancel_rollback_not_empty")
    finally:
        await connection.close()
    await target_guard.inspect(run_id)
    print(
        "PASS: two rollback-only experiments and cancellation after insert; sessions excluded"
    )


if __name__ == "__main__":
    try:
        asyncio.run(probe(sys.argv[1]))
    except Exception:
        print("BLOCKED: rollback experiment failed; disposable lab requires inspection")
        raise SystemExit(2)
