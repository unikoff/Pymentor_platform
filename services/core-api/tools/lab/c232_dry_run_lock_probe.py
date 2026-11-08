"""Test the dry-run lock timeout on a fresh synthetic PostgreSQL lab."""

import asyncio
import sys

import asyncpg
import tools.migration.c232_dry_run as dry


async def probe(run_id):
    lab = dry.target_guard.lab
    directory = lab._root() / run_id
    if not dry.target_guard.RUN_ID.fullmatch(
        run_id
    ) or not dry.recovery_guard._check_private_acl(directory):
        raise RuntimeError("guard_failed")
    dry.target_guard._check_lab(run_id)
    connection = await asyncpg.connect(
        host="127.0.0.1",
        port=lab.PORT,
        database=lab.DATABASE,
        user=lab.MIGRATOR,
        password=lab._read_secret(directory, "migrator_password"),
        timeout=5,
        command_timeout=5,
    )
    try:
        async with connection.transaction():
            await connection.execute(
                "LOCK TABLE public.sessions IN ACCESS EXCLUSIVE MODE"
            )
            try:
                await asyncio.wait_for(dry.inspect(run_id), timeout=15)
            except dry.DryRunError as exc:
                if str(exc) != "target_check_failed":
                    raise
            else:
                raise RuntimeError("lock_was_not_detected")
    finally:
        await connection.close()
    result = await asyncio.wait_for(dry.inspect(run_id), timeout=15)
    if result["target_table_count"] != 15:
        raise RuntimeError("post_lock_check_failed")
    print(
        "PASS: dry-run rejected the synthetic locked table and succeeded after lock release"
    )


if __name__ == "__main__":
    try:
        asyncio.run(probe(sys.argv[1]))
    except Exception:
        print("BLOCKED: synthetic lock-timeout probe failed")
        raise SystemExit(2)
