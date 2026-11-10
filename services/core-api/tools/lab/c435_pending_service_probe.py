"""Future one-shot synthetic coordinator probe. Never use for authentication.

Requires a fresh migrated disposable C232 lab and the pinned synthetic Redis.
Leaves the database and volume quarantined, including after failures. Client
checks are snapshots, not continuous isolation. This does not prove safety.
"""

import argparse
import asyncio
from datetime import timedelta
import json
from pathlib import Path
import sys
from uuid import uuid4

ROOT = Path(__file__).resolve().parents[4]
import tools.migration.c232_recovery_guard as recovery
import tools.migration.c232_target_guard as target
from tools.migration.c232_process_mutex import synthetic_lab_mutex
import tools.lab.c435_pending_sql_probe as sql_probe

USER_ID = 435
OLD = tuple(c * 64 for c in "def")
TOKENS = (
    "12345678-1234-4234-8234-123456789abc",
    "23456789-2345-4234-8234-23456789abcd",
    "3456789a-3456-4234-8234-3456789abcde",
)
PHASE = sql_probe.PHASE
REDIS_VOLUME = "ab85d7c22af9dc825e0215a884d7258c928fbdb40c7e1361c10ee3bf5f1b2a03"


class ProbeError(Exception):
    pass


def require(condition, category):
    if not condition:
        raise ProbeError(category)


def verify_redis_lab():
    import tools.lab.c232_sessions_e2e_probe as redis_probe

    redis_probe.verify_redis()
    items = json.loads(target.lab._docker("inspect", redis_probe.REDIS_NAME))
    require(
        len(items) == 1
        and len(items[0].get("Mounts", [])) == 1
        and items[0]["Mounts"][0].get("Name") == REDIS_VOLUME,
        "redis_volume_invalid",
    )
    volumes = json.loads(target.lab._docker("volume", "inspect", REDIS_VOLUME))
    require(
        len(volumes) == 1
        and volumes[0].get("Name") == REDIS_VOLUME
        and (volumes[0].get("Labels") or {}).get("com.docker.volume.anonymous") == "",
        "redis_volume_invalid",
    )


def check_lab(run_id, prefix=None):
    require(type(run_id) is str and target.RUN_ID.fullmatch(run_id), "run_id_invalid")
    directory = target.lab._root() / run_id
    require(recovery._check_private_acl(directory), "journal_acl_unverified")
    checked, state = target.lab._load(run_id)
    names = target.lab._names(run_id)
    require(
        checked == directory
        and state.get("phase") == PHASE
        and state.get("run_id") == run_id
        and state.get("names") == names
        and state.get("database") == target.lab.DATABASE
        and state.get("migrator") == target.lab.MIGRATOR
        and state.get("app_role") == target.lab.APP_ROLE
        and state.get("port") == target.lab.PORT
        and state.get("image") == target.lab.IMAGE,
        "journal_identity_invalid",
    )
    if prefix is not None:
        require(
            recovery.PREFIX.fullmatch(prefix) and state.get("redis_prefix") == prefix,
            "prefix_invalid",
        )
    else:
        require("redis_prefix" not in state, "prefix_already_recorded")
    target.lab._assert_volume(names["source_volume"])
    target.lab._assert_container(
        names["source_container"],
        names["source_volume"],
        directory,
        require_running=True,
    )
    require(
        names["restore_container"] not in target.lab._resource_names("container")
        and names["restore_volume"] not in target.lab._resource_names("volume"),
        "unexpected_restore",
    )
    verify_redis_lab()
    return directory, state


async def inspect_admin(directory, connect):
    admin = await connect(
        host="127.0.0.1",
        port=target.lab.PORT,
        database=target.lab.DATABASE,
        user=target.lab.ADMIN_ROLE,
        password=target.lab._read_secret(directory, "bootstrap_password"),
        timeout=5,
        command_timeout=8,
        server_settings={"default_transaction_read_only": "on"},
    )
    try:
        identity = await admin.fetchrow(
            "SELECT current_database(), current_user, inet_server_port()"
        )
        require(
            tuple(identity) == (target.lab.DATABASE, target.lab.ADMIN_ROLE, 5432),
            "admin_identity_invalid",
        )
        roles = await admin.fetchrow("""SELECT
          (SELECT rolcanlogin AND NOT (rolsuper OR rolcreatedb OR rolcreaterole OR rolreplication OR rolbypassrls) AND rolconnlimit=1 FROM pg_catalog.pg_roles WHERE rolname='pymentor_app'),
          (SELECT NOT rolcanlogin FROM pg_catalog.pg_roles WHERE rolname='pymentor_test'),
          pg_has_role('pymentor_app','pymentor_test','MEMBER'),
          has_schema_privilege('pymentor_app','public','CREATE'),
          has_schema_privilege('pymentor_app','c435_lab','CREATE'),
          has_schema_privilege('pymentor_app','public','USAGE'),
          has_schema_privilege('pymentor_app','c435_lab','USAGE')""")
        require(
            tuple(roles) == (True, True, False, False, False, True, True),
            "role_isolation_invalid",
        )
        await sql_probe.verify_privileges(admin)
        require(
            not await admin.fetchval(
                "SELECT EXISTS(SELECT 1 FROM pg_catalog.pg_stat_activity WHERE datname=current_database() AND backend_type='client backend' AND pid<>pg_backend_pid())"
            ),
            "other_clients_present",
        )
    finally:
        try:
            await admin.close(timeout=5)
        except BaseException:
            admin.terminate()
            raise ProbeError("admin_close_failed") from None


class RedisFault:
    def __init__(self, store, mode):
        self.store, self.mode = store, mode
        self.unavailable = False

    async def prepare_session(self, *args):
        if self.mode == "before":
            raise RuntimeError("injected")
        await self.store.prepare_session(*args)
        if self.mode == "lost":
            raise RuntimeError("injected")

    async def get_user(self, token):
        if self.mode == "outage" or self.unavailable:
            raise RuntimeError("injected")
        if self.mode == "mismatch":
            return USER_ID + 1
        owner = await self.store.get_user(token)
        if self.mode == "after_gate":
            self.unavailable = True
        return owner


async def cleanup(store, prefix, keys, run_id):
    # A single atomic identity check prevents deleting a foreign value.
    check_lab(run_id, prefix)
    script = """for i, key in ipairs(KEYS) do
      local value = redis.call('GET', key)
      if value and value ~= ARGV[1] then return 0 end
    end
    for i, key in ipairs(KEYS) do redis.call('DEL', key) end
    return 1"""
    require(
        await store._client.eval(script, len(keys), *keys, str(USER_ID)) == 1,
        "cleanup_identity_invalid",
    )
    require(
        all(value is None for value in await store._client.mget(*keys)),
        "cleanup_unverified",
    )


async def experiment(run_id, connect):
    from sqlalchemy import text
    from sqlalchemy.engine import URL
    from sqlalchemy.ext.asyncio import async_sessionmaker
    from sqlalchemy.ext.asyncio import create_async_engine
    from sqlalchemy.pool import NullPool
    from tools.lab.session_models.c435_pending_service import PendingServiceError
    from tools.lab.session_models.c435_pending_service import (
        SyntheticPendingCoordinator,
    )
    from tools.lab.session_models.c435_pending_service import _inputs
    from pymentor_core.adapters.redis.sessions import RedisSessionStore

    # Check the dedicated Redis before modifying even the disposable PG lab.
    # These checks remain snapshots, not a continuous network/ACL guarantee.
    verify_redis_lab()
    preflight = RedisSessionStore(
        "redis://127.0.0.1:57146/0",
        prefix=f"pymentor-c216-test:{uuid4()}:",
        max_connections=1,
        socket_timeout=2,
    )
    try:
        require(
            len(await preflight._client.client_list()) == 1,
            "other_redis_clients_present",
        )
    finally:
        await preflight.close()
    verify_redis_lab()
    await sql_probe._probe(run_id, connect)
    directory, state = check_lab(run_id)
    await inspect_admin(directory, connect)  # closed before any app connection
    prefix = f"pymentor-c216-test:{uuid4()}:"
    target.lab._state_update(directory, state, PHASE, redis_prefix=prefix)
    check_lab(run_id, prefix)  # ACL and journal again, before first Redis write
    keys = tuple(
        prefix + kind + str(_inputs(USER_ID, token))
        for token in TOKENS
        for kind in ("token:", "token:prepared:")
    )
    store = RedisSessionStore(
        "redis://127.0.0.1:57146/0", prefix=prefix, max_connections=1, socket_timeout=2
    )
    engine = None
    keys_owned = False
    try:
        require(
            len(await store._client.client_list()) == 1, "other_redis_clients_present"
        )
        require(
            all(value is None for value in await store._client.mget(*keys)),
            "redis_keys_not_empty",
        )
        keys_owned = True
        url = URL.create(
            "postgresql+asyncpg",
            username=target.lab.APP_ROLE,
            password=target.lab._read_secret(directory, "app_password"),
            host="127.0.0.1",
            port=target.lab.PORT,
            database=target.lab.DATABASE,
        )
        engine = create_async_engine(
            url,
            poolclass=NullPool,
            hide_parameters=True,
            connect_args={"timeout": 5, "command_timeout": 8},
        )
        factory = async_sessionmaker(engine, expire_on_commit=False)
        async with factory() as db:
            identity = tuple(
                (
                    await db.execute(
                        text(
                            "SELECT current_database(), current_user, inet_server_port()"
                        )
                    )
                ).one()
            )
            require(
                identity == (target.lab.DATABASE, target.lab.APP_ROLE, 5432),
                "app_identity_invalid",
            )
            require(
                not (
                    await db.execute(
                        text(
                            "SELECT EXISTS(SELECT 1 FROM pg_catalog.pg_stat_activity WHERE datname=current_database() AND backend_type='client backend' AND pid<>pg_backend_pid())"
                        )
                    )
                ).scalar_one(),
                "other_clients_present",
            )
            before = await sql_probe.snapshot(db)
            require(
                not before[0]
                and before[3] == ((USER_ID, 2),)
                and len(before[2]) == 1
                and before[2][0][0] == USER_ID
                and all(row[1] == USER_ID and row[4] == "revoked" for row in before[1]),
                "initial_state_invalid",
            )
            now = (await db.execute(text("SELECT clock_timestamp()"))).scalar_one()
            expiry = now + timedelta(hours=1)
            for i, digest in enumerate(OLD):
                await db.execute(
                    text(
                        "INSERT INTO public.sessions (user_id, session_token, created_at) VALUES (:uid, :digest, :created)"
                    ),
                    {
                        "uid": USER_ID,
                        "digest": digest,
                        "created": now - timedelta(minutes=3 - i),
                    },
                )
                await db.execute(
                    text(
                        "INSERT INTO c435_lab.pending VALUES (:digest, :uid, 2, :expiry, 'active')"
                    ),
                    {"digest": digest, "uid": USER_ID, "expiry": expiry},
                )
            await db.commit()

        async def snapshot():
            async with factory() as db:
                return await sql_probe.snapshot(db)

        initial = await snapshot()
        require(
            tuple(row[2] for row in initial[0]) == OLD
            and all(row[1] == USER_ID for row in initial[0])
            and initial[2:] == before[2:]
            and set(initial[1])
            == set(before[1])
            | {(digest, USER_ID, 2, expiry, "active") for digest in OLD},
            "fixture_invalid",
        )

        async def fails(coro):
            try:
                await coro
            except PendingServiceError:
                return
            raise ProbeError("expected_failure_missing")

        await fails(
            SyntheticPendingCoordinator(factory, RedisFault(store, "before")).prepare(
                USER_ID, 2, TOKENS[0], expiry, 3600
            )
        )
        require(await snapshot() == initial, "outage_changed_sql")
        await fails(
            SyntheticPendingCoordinator(factory, RedisFault(store, "lost")).prepare(
                USER_ID, 2, TOKENS[0], expiry, 3600
            )
        )
        require(
            await snapshot() == initial
            and await store._client.get(keys[1]) == str(USER_ID),
            "lost_response_invalid",
        )
        service = SyntheticPendingCoordinator(factory, store)
        await service.prepare(USER_ID, 2, TOKENS[1], expiry, 3600)
        ready = await snapshot()
        digest = str(_inputs(USER_ID, TOKENS[1]))
        require(
            ready[0] == initial[0]
            and ready[2:] == initial[2:]
            and set(ready[1])
            == set(initial[1]) | {(digest, USER_ID, 2, expiry, "pending")},
            "prepare_invalid",
        )
        await fails(
            SyntheticPendingCoordinator(factory, RedisFault(store, "outage")).activate(
                USER_ID, TOKENS[1]
            )
        )
        require(await snapshot() == ready, "outage_activate_changed_sql")
        require(
            await SyntheticPendingCoordinator(
                factory, RedisFault(store, "mismatch")
            ).activate(USER_ID, TOKENS[1])
            is False
            and await snapshot() == ready,
            "mismatch_changed_sql",
        )
        require(await service.activate(USER_ID, TOKENS[1]) is True, "activate_failed")
        done = await snapshot()
        require(
            len(done[0]) == 3
            and tuple(row[2] for row in done[0])
            == tuple(sorted((OLD[1], OLD[2], digest)))
            and all(row in done[0] for row in initial[0][1:])
            and done[2:] == ready[2:]
            and set(done[1])
            == (set(ready[1]) - {(digest, USER_ID, 2, expiry, "pending")})
            | {(digest, USER_ID, 2, expiry, "active")},
            "activation_state_invalid",
        )
        require(
            await service.activate(USER_ID, TOKENS[1]) is False
            and await snapshot() == done,
            "retry_changed_sql",
        )
        # Model loss at the proxy immediately after the real owner read. The
        # server itself stays untouched; this is not an actual network outage.
        await service.prepare(USER_ID, 2, TOKENS[2], expiry, 3600)
        gap_before = await snapshot()
        proxy = RedisFault(store, "after_gate")
        require(
            await SyntheticPendingCoordinator(factory, proxy).activate(
                USER_ID, TOKENS[2]
            )
            is True
            and proxy.unavailable,
            "gap_not_observed",
        )
        gap_after = await snapshot()
        gap_digest = str(_inputs(USER_ID, TOKENS[2]))
        require(
            len(gap_after[0]) == 3
            and sum(row in gap_after[0] for row in gap_before[0]) == 2
            and any(row[1:3] == (USER_ID, gap_digest) for row in gap_after[0]),
            "gap_state_invalid",
        )
        await fails(
            SyntheticPendingCoordinator(factory, proxy).activate(USER_ID, TOKENS[2])
        )
        require(
            await snapshot() == gap_after
            and await store._client.get(keys[1]) == str(USER_ID),
            "gap_or_lost_key_invalid",
        )
    finally:
        try:
            if keys_owned:
                await cleanup(store, prefix, keys, run_id)
        finally:
            try:
                await store.close()
            finally:
                if engine is not None:
                    await engine.dispose()


async def probe(run_id):
    import asyncpg

    try:
        with synthetic_lab_mutex(run_id):
            await experiment(run_id, asyncpg.connect)
    except Exception:
        raise ProbeError("probe_failed_or_cleanup_unknown") from None


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("run_id")
    args = parser.parse_args(argv)
    try:
        asyncio.run(probe(args.run_id))
    except (Exception, KeyboardInterrupt):
        print(
            "BLOCKED: probe or cleanup unverified; preserve quarantine and volume",
            file=sys.stderr,
        )
        return 2
    print(
        "PASS: selected synthetic scenarios and cleanup completed; connections closed; lab quarantined."
    )
    print(
        "EXPECTED GAP: simulated proxy outage after Redis gate still allowed SQL eviction and commit; TTLs are independent. This protocol is unsafe for session preservation."
    )
    print(
        "LIMITATION: client absence is a snapshot; auth, cookies, production and all races are not proven."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
