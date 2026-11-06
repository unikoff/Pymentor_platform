"""Ensure one pinned-fixture user's sessions in a frozen synthetic lab only.

The caller must verify the lab, source, process lock and absence of writers;
the boolean argument is an assertion by that caller, not a security boundary.
No production paths should import this module.
"""
from pathlib import Path
from datetime import timedelta
import sys

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'backend'))
sys.path.insert(0, str(ROOT / 'scripts'))

from sqlalchemy import text
from identity.c232_session_compatibility import require_compatible_legacy_sessions
from identity.async_sessions import SESSION_TTL_SECONDS
from identity.legacy_session_import import LegacySession, import_legacy_sessions
from infrastructure.c232_import_types import to_timestamp
from c232_session_runner import operation_id, read_session_state
from c232_sessions_e2e_probe import FixtureIdUnitOfWork, commit_with_synthetic_marker


class SyntheticSessionImportError(Exception):
    """Category-only synthetic session import failure."""


async def verify_redis_expiries(redis, candidates):
    """Require every synthetic token gate to retain its SQL absolute expiry."""
    for candidate in candidates:
        seconds, micros = await redis._client.time()
        redis_now_ms = seconds * 1000 + micros // 1000
        ttl = await redis._client.pttl(f'{redis._prefix}token:{redis._digest(candidate.token)}')
        expected = int((candidate.created_at + timedelta(seconds=SESSION_TTL_SECONDS)).timestamp() * 1000)
        if type(ttl) is not int or ttl <= 0 or abs(redis_now_ms + ttl - expected) > 2000:
            raise ValueError('session_expiry_unverified')


async def ensure_user_sessions(database, service, user_id, source_rows, *, frozen_lab_verified):
    try:
        if frozen_lab_verified is not True or type(source_rows) not in (list, tuple) or not source_rows:
            raise ValueError('frozen fixture required')
        operation = operation_id(user_id)
        expected = []
        candidates = []
        for row in source_rows:
            if (type(row) is not dict or set(row) != {'id', 'user_id', 'session_token', 'created_at'}
                    or row['user_id'] != user_id):
                raise ValueError('fixture rows invalid')
            created = to_timestamp(row['created_at'])
            expected.append(dict(row, created_at=created))
            candidates.append(LegacySession(row['session_token'], created))
        async with database.unit_of_work() as uow:
            now = await uow.session.scalar(text('SELECT clock_timestamp()'))
        require_compatible_legacy_sessions(candidates, as_of=now)
        state = await read_session_state(database, user_id, expected)
        if state == 'new':
            source_ids = [{key: row[key] for key in ('id', 'user_id', 'session_token')} for row in expected]
            original_uow = database.unit_of_work

            def marked_uow():
                uow = original_uow()
                commit = uow.commit

                async def commit_with_marker():
                    await commit_with_synthetic_marker(uow.session, commit, user_id, operation,
                        {'injected': False}, None, source_max_id=max(row['id'] for row in source_ids))

                uow.commit = commit_with_marker
                return FixtureIdUnitOfWork(uow, source_ids, user_id)

            database.unit_of_work = marked_uow
            try:
                if await import_legacy_sessions(service, user_id, candidates, require_all=True) != len(candidates):
                    raise ValueError('session count mismatch')
            finally:
                database.unit_of_work = original_uow
        elif state == 'complete':
            # Safe only in the externally verified frozen test lab. This is
            # not authorization to restore Redis-only revoked sessions online.
            await service.reconcile_user(user_id)
        else:
            raise ValueError('session state invalid')
        if await read_session_state(database, user_id, expected) != 'complete':
            raise ValueError('session state mismatch')
        for candidate in candidates:
            if (await service.authenticate(candidate.token)).user_id != user_id:
                raise ValueError('synthetic authentication mismatch')
        await verify_redis_expiries(service.redis, candidates)
        return 'complete'
    except Exception:
        raise SyntheticSessionImportError('session_import_unavailable') from None
