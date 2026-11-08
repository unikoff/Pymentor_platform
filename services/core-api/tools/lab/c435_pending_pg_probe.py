"""One-session TEMP-only experiment for a fresh C232 lab; not platform code."""

from __future__ import annotations

import argparse
import asyncio
import sys

import tools.migration.c232_target_guard as target
import tools.migration.c232_recovery_guard as recovery


class ProbeError(Exception):
    pass


INITIAL = ((1, "active"), (2, "active"), (3, "active"))
READY = INITIAL + ((4, "pending"),)
EVICTED = ((2, "active"), (3, "active"), (4, "pending"))
DONE = ((2, "active"), (3, "active"), (4, "active"))


async def snapshot(conn):
    rows = await conn.fetch("SELECT id, state FROM pg_temp.c435_sessions ORDER BY id")
    return tuple((row["id"], row["state"]) for row in rows)


async def expect(conn, expected):
    if await snapshot(conn) != expected:
        raise ProbeError("context_mismatch")


async def activate(conn):
    # Each statement is gated by its exact synthetic input state. The retry
    # has a separate fixed context and performs no mutation.
    state = await snapshot(conn)
    if state == DONE:
        return
    if state != READY:
        raise ProbeError("context_mismatch")
    await conn.execute(
        "DELETE FROM pg_temp.c435_sessions WHERE id = $1 AND state = $2", 1, "active"
    )
    await expect(conn, EVICTED)
    await conn.execute(
        "UPDATE pg_temp.c435_sessions SET state = $1 WHERE id = $2 AND state = $3",
        "active",
        4,
        "pending",
    )
    await expect(conn, DONE)


async def experiment(conn):
    # No IF NOT EXISTS: a pre-existing temp object fails closed.
    async with conn.transaction():
        await conn.execute(
            "CREATE TEMP TABLE c435_sessions (id integer PRIMARY KEY, state text NOT NULL) ON COMMIT PRESERVE ROWS"
        )
        await expect(conn, ())
        await conn.execute(
            "INSERT INTO pg_temp.c435_sessions (id, state) VALUES ($1, $2), ($3, $4), ($5, $6)",
            1,
            "active",
            2,
            "active",
            3,
            "active",
        )
        await expect(conn, INITIAL)
    async with conn.transaction():
        await expect(conn, INITIAL)
        await conn.execute(
            "INSERT INTO pg_temp.c435_sessions (id, state) VALUES ($1, $2)",
            4,
            "pending",
        )
        await expect(conn, READY)
    await expect(conn, READY)
    tx = conn.transaction()
    await tx.start()
    try:
        await activate(conn)
    finally:
        await tx.rollback()
    await expect(conn, READY)
    async with conn.transaction():
        await activate(conn)
    await expect(conn, DONE)
    # A repeated activation is a no-op after confirming the exact committed state.
    async with conn.transaction():
        await activate(conn)
    await expect(conn, DONE)


async def probe(run_id, *, connect=None):
    conn = None
    try:
        if not isinstance(run_id, str) or not target.RUN_ID.fullmatch(run_id):
            raise ProbeError("run_id_invalid")
        directory = target.lab._root() / run_id
        if not recovery._check_private_acl(directory):
            raise ProbeError("journal_acl_unverified")
        checked, _ = target._check_lab(run_id)
        if checked != directory:
            raise ProbeError("lab_identity_invalid")
        password = target.lab._read_secret(directory, "migrator_password")
        if connect is None:
            import asyncpg

            connect = asyncpg.connect
        conn = await connect(
            host="127.0.0.1",
            port=target.lab.PORT,
            database=target.lab.DATABASE,
            user=target.lab.MIGRATOR,
            password=password,
            timeout=5,
            command_timeout=5,
        )
        await target._inspect_connection(conn)
        await conn.close()
        conn = None
        # This lab intentionally denies TEMP to the migrator role. Use the
        # lab bootstrap role only for the session-private TEMP experiment;
        # every write below is constrained to pg_temp and fixed fake rows.
        admin_password = target.lab._read_secret(directory, "bootstrap_password")
        conn = await connect(
            host="127.0.0.1",
            port=target.lab.PORT,
            database=target.lab.DATABASE,
            user=target.lab.ADMIN_ROLE,
            password=admin_password,
            timeout=5,
            command_timeout=5,
        )
        identity = await conn.fetchrow(
            "SELECT current_database(), current_user, inet_server_port()"
        )
        if tuple(identity) != (target.lab.DATABASE, target.lab.ADMIN_ROLE, 5432):
            raise ProbeError("admin_identity_invalid")
        try:
            await experiment(conn)
        except ProbeError:
            raise
        except Exception as exc:
            # Only a fixed diagnostic category, never SQL, path or credentials.
            if type(exc).__name__ == "InsufficientPrivilegeError":
                raise ProbeError("temporary_table_permission_unavailable") from None
            raise ProbeError("temporary_experiment_failed") from None
    except ProbeError:
        raise
    except target.TargetGuardError as exc:
        raise ProbeError(exc.category) from None
    except Exception:
        raise ProbeError("probe_failed") from None
    finally:
        if conn is not None:
            try:
                await conn.close()
            except Exception:
                raise ProbeError("connection_close_failed") from None


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("run_id")
    args = parser.parse_args(argv)
    try:
        asyncio.run(probe(args.run_id))
    except ProbeError as exc:
        print(f"BLOCKED: {exc}", file=sys.stderr)
        return 2
    print(
        "PASS: TEMP-only pending commit, activation rollback, activation and retry observed in one session."
    )
    print("LIMITATION: concurrency locking, Redis, cookies and release are not proven.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
