import asyncio
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[4]
import asyncpg
import tools.migration.c232_target_guard as guard
from tools.lab.storage.c232_import_transaction import check_empty_target
from tools.lab.storage.c232_mapping import TABLE_ORDER


class PausedConnection:
    def __init__(self, connection):
        self.connection = connection
        self.ready = asyncio.Event()
        self.release = asyncio.Event()
        self.first = True

    def transaction(self):
        return self.connection.transaction()

    async def execute(self, *args):
        return await self.connection.execute(*args)

    async def fetchval(self, *args):
        if self.first:
            self.first = False
            self.ready.set()
            await self.release.wait()
        return await self.connection.fetchval(*args)


async def main(run_id):
    await guard.inspect(run_id)
    directory, _ = guard._check_lab(run_id)
    password = guard.lab._read_secret(directory, "migrator_password")
    kwargs = dict(
        host="127.0.0.1",
        port=guard.lab.PORT,
        database=guard.lab.DATABASE,
        user=guard.lab.MIGRATOR,
        password=password,
        timeout=5,
    )
    one = await asyncpg.connect(**kwargs)
    two = await asyncpg.connect(**kwargs)
    proxy = PausedConnection(one)
    task = None
    try:
        task = asyncio.create_task(
            check_empty_target(proxy, {name: [] for name in TABLE_ORDER})
        )
        await asyncio.wait_for(proxy.ready.wait(), 10)
        try:
            async with two.transaction():
                assert (
                    await two.fetchval(
                        "SELECT pg_try_advisory_xact_lock($1)", 0x43323332
                    )
                    is False
                )
                await two.execute("SET LOCAL lock_timeout = '200ms'")
                await two.execute("LOCK TABLE public.users IN ROW EXCLUSIVE MODE")
        except asyncpg.exceptions.LockNotAvailableError:
            pass
        else:
            raise RuntimeError("competing writer lock unexpectedly succeeded")
        proxy.release.set()
        await asyncio.wait_for(task, 10)
        async with two.transaction():
            assert (
                await two.fetchval("SELECT pg_try_advisory_xact_lock($1)", 0x43323332)
                is True
            )
            await two.execute("SET LOCAL lock_timeout = '200ms'")
            await two.execute("LOCK TABLE public.users IN ROW EXCLUSIVE MODE")
        print(
            "PASS: synthetic gate held both advisory and table locks; both released after completion"
        )
    finally:
        proxy.release.set()
        if task is not None and not task.done():
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass
        await one.close()
        await two.close()


try:
    asyncio.run(main(sys.argv[1]))
except Exception as exc:
    print("BLOCKED: gate integration failed (" + type(exc).__name__ + ")")
    raise SystemExit(2)
