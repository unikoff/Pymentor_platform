"""Initialize and repeat a pinned synthetic import; leave the lab quarantined."""

import asyncio
import sys
from uuid import uuid4

import tools.lab.c232_commit_probe as commit
import tools.migration.c232_recovery_guard as guard
import tools.lab.c232_resumable_lab as resumable
import tools.migration.c232_source_reader as source_reader
from tools.migration.c232_process_mutex import synthetic_lab_mutex
from pymentor_core.adapters.redis.sessions import RedisSessionStore


class InjectedInterruption(Exception):
    """A test-only interruption after a session import has committed."""


async def probe(run_id):
    source = source_reader.load_pinned_source()
    directory = commit.guard.lab._root() / run_id
    # One mutex covers setup, both reconciliations, and successful cleanup.
    # On any error the lab and Redis keys stay quarantined for inspection;
    # interrupted setup is not automatically resumed.
    with synthetic_lab_mutex(run_id):
        if not guard._check_private_acl(directory):
            raise RuntimeError("journal_acl_unverified")
        await commit.guard.inspect(run_id)
        directory, state = commit.guard._check_lab(run_id)
        prefix = f"pymentor-c216-test:{uuid4()}:"
        commit.guard.lab._state_update(
            directory, state, "c232-resumable-quarantined", redis_prefix=prefix
        )
        if not guard._check_private_acl(directory):
            raise RuntimeError("journal_acl_unverified")
        await commit.bootstrap(directory)
        connection = await commit.connect(
            directory, commit.guard.lab.MIGRATOR, "migrator_password"
        )
        try:
            await connection.execute("""CREATE TABLE c232_lab_control.session_operations (
                user_id integer PRIMARY KEY, snapshot_id text NOT NULL, operation_id text NOT NULL
            )""")
        finally:
            await connection.close()
        real_ensure = resumable.ensure_user_sessions
        interrupted = False

        async def interrupt_after_session(*args, **kwargs):
            nonlocal interrupted
            result = await real_ensure(*args, **kwargs)
            interrupted = True
            raise InjectedInterruption()

        resumable.ensure_user_sessions = interrupt_after_session
        try:
            try:
                await resumable._resume(run_id)
            except InjectedInterruption:
                pass
            else:
                raise RuntimeError("interruption_not_observed")
        finally:
            resumable.ensure_user_sessions = real_ensure
        if not interrupted:
            raise RuntimeError("interruption_not_observed")
        first = await resumable._resume(run_id)
        second = await resumable._resume(run_id)
        if first != second or first != {"tables": 15, "rows": 21, "sessions": 2}:
            raise RuntimeError("repeated_import_mismatch")
        # Delete only known fixture keys in this run's own randomly assigned
        # namespace. Never scan Redis or delete anything by wildcard.
        await guard.inspect(run_id)
        _, state = guard._check_lab(run_id)
        if state["redis_prefix"] != prefix:
            raise RuntimeError("prefix_changed")
        resumable.e2e.verify_redis()
        store = RedisSessionStore(
            "redis://127.0.0.1:57146/0", prefix=prefix, socket_timeout=2
        )
        try:
            keys = []
            for row in source["sessions"]:
                digest = store._digest(row["session_token"])
                keys.extend(
                    (
                        f"{prefix}user:{row['user_id']}",
                        f"{prefix}token:{digest}",
                        f"{prefix}token:prepared:{digest}",
                    )
                )
            await store._client.delete(*keys)
            if await store._client.exists(*keys):
                raise RuntimeError("own_keys_cleanup_unverified")
        finally:
            await store.close()
    print(
        "PASS: synthetic interruption after session commit, resume and repeat; 15 tables, 21 rows, 2 sessions; own keys removed"
    )


if __name__ == "__main__":
    try:
        asyncio.run(probe(sys.argv[1]))
    except Exception:
        print("BLOCKED: synthetic probe failed or ambiguous; leave lab quarantined")
        raise SystemExit(2)
