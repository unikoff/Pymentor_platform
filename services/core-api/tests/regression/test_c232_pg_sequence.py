"""Synthetic PostgreSQL check for atomic sequence setup during local import."""

import asyncio
import os
from uuid import uuid4

import pytest
from sqlalchemy import text

from c222_pg_guard import validate_test_url
from pymentor_core.adapters.postgres.async_database import AsyncDatabase


def test_sequence_restart_is_rolled_back_with_import_savepoint():
    url = os.environ.get("PYMENTOR_TEST_PG_URL")
    if not url:
        pytest.skip("requires the explicitly configured disposable PostgreSQL lab")
    validate_test_url(url)

    async def scenario():
        database = AsyncDatabase(url, pool_size=1, max_overflow=0, pool_timeout=3,
                                 connect_timeout=3, command_timeout=3)
        sequence = "c232_test_" + uuid4().hex
        try:
            async with database.engine.connect() as connection:
                transaction = await connection.begin()
                try:
                    identity = (await connection.execute(text("SELECT current_database(), current_user"))).one()
                    assert tuple(identity) == ("pymentor_test", "pymentor_test")
                    await connection.execute(text(f'CREATE SEQUENCE public."{sequence}" START WITH 1'))
                    await connection.execute(text("SAVEPOINT before_restart"))
                    await connection.execute(text(f'ALTER SEQUENCE public."{sequence}" RESTART WITH 42'))
                    await connection.execute(text("ROLLBACK TO SAVEPOINT before_restart"))
                    value = await connection.scalar(text("SELECT nextval(CAST(:name AS regclass))"),
                                                    {"name": "public." + sequence})
                    assert value == 1
                finally:
                    await transaction.rollback()
                assert await connection.scalar(text("SELECT to_regclass(:name)"),
                                               {"name": "public." + sequence}) is None
        finally:
            await database.dispose()

    asyncio.run(scenario())


def test_transaction_advisory_lock_excludes_competing_import_until_rollback():
    url = os.environ.get("PYMENTOR_TEST_PG_URL")
    if not url:
        pytest.skip("requires the explicitly configured disposable PostgreSQL lab")
    validate_test_url(url)

    async def scenario():
        database = AsyncDatabase(url, pool_size=2, max_overflow=0, pool_timeout=3,
                                 connect_timeout=3, command_timeout=3)
        key_a = uuid4().int & 0x7fffffff
        key_b = uuid4().int & 0x7fffffff
        try:
            async with database.engine.connect() as first, database.engine.connect() as second:
                tx_first = await first.begin()
                tx_second = await second.begin()
                try:
                    for conn in (first, second):
                        identity = (await conn.execute(text("SELECT current_database(), current_user"))).one()
                        assert tuple(identity) == ("pymentor_test", "pymentor_test")
                    statement = text("SELECT pg_try_advisory_xact_lock(:key_a, :key_b)")
                    params = {"key_a": key_a, "key_b": key_b}
                    assert await first.scalar(statement, params) is True
                    assert await second.scalar(statement, params) is False
                    await tx_first.rollback()
                    assert await second.scalar(statement, params) is True
                finally:
                    if tx_first.is_active:
                        await tx_first.rollback()
                    if tx_second.is_active:
                        await tx_second.rollback()
        finally:
            await database.dispose()

    asyncio.run(scenario())
