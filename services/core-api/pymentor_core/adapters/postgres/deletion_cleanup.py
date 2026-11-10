"""Retry exact Redis session removals for deleted accounts in the local profile."""

import asyncio
import logging

from redis.exceptions import RedisError
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from pymentor_core.adapters.redis.sessions import SessionDigest

logger = logging.getLogger(__name__)


async def cleanup_one(database, store):
    """Attempt one due key; locks make simultaneous workers safe.

    Successful attempts are retried until expiry because an already-running
    login can project its key after an earlier removal. SQL remains the
    authority for authentication throughout. Expired jobs are discarded.
    """
    async with database.unit_of_work() as uow:
        row = (
            (
                await uow.session.execute(
                    text("""
            SELECT k.lifecycle_id, k.token_digest, e.user_id,
                   k.expires_at <= clock_timestamp() AS expired
            FROM account_deletion_redis_keys k
            JOIN account_deletion_events e ON e.lifecycle_id = k.lifecycle_id
            WHERE k.next_attempt_at <= clock_timestamp() OR k.expires_at <= clock_timestamp()
            ORDER BY k.next_attempt_at, k.lifecycle_id, k.token_digest
            FOR UPDATE OF k SKIP LOCKED LIMIT 1
        """)
                )
            )
            .mappings()
            .first()
        )
        if row is None:
            return False
        params = {"ref": row["lifecycle_id"], "digest": row["token_digest"]}
        if row["expired"]:
            await uow.session.execute(
                text("""
                DELETE FROM account_deletion_redis_keys WHERE lifecycle_id=:ref AND token_digest=:digest
            """),
                params,
            )
        else:
            try:
                await store.revoke_user_token(
                    row["user_id"], SessionDigest(row["token_digest"])
                )
            except (RedisError, TimeoutError):
                logger.warning("Deferred Redis cleanup for a deleted account")
            await uow.session.execute(
                text("""
                UPDATE account_deletion_redis_keys SET attempts=attempts+1,
                    next_attempt_at=clock_timestamp() + interval '60 seconds'
                WHERE lifecycle_id=:ref AND token_digest=:digest
            """),
                params,
            )
        await uow.commit()
        return True


async def cleanup_loop(database, store):
    while True:
        try:
            # Bound each pass so normal requests keep pool capacity.
            for _ in range(100):
                if not await cleanup_one(database, store):
                    break
        except (SQLAlchemyError, TimeoutError):
            logger.warning("Deferred account cleanup: local database unavailable")
        await asyncio.sleep(10)
