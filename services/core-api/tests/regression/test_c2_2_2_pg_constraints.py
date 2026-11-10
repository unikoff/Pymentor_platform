"""Real PostgreSQL constraints, rolled back on a disposable localhost database."""

import asyncio
import os
from uuid import uuid4

import pytest
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.exc import DBAPIError
from sqlalchemy.ext.asyncio import create_async_engine
from c222_pg_guard import validate_test_url


def test_local_pg_constraints_and_query_plan():
    url_text = os.getenv("PYMENTOR_TEST_PG_URL")
    if not url_text:
        pytest.skip("requires explicitly configured disposable local PostgreSQL")
    validate_test_url(url_text)

    async def run():
        engine = create_async_engine(url_text)
        try:
            async with engine.connect() as conn:
                identity = (await conn.execute(text("SELECT current_database(), current_user"))).one()
                assert tuple(identity) == ("pymentor_test", "pymentor_test")
                await conn.commit()
                tx = await conn.begin()
                try:
                    email = f"{uuid4()}@example.test"
                    user_id = await conn.scalar(text(
                        "INSERT INTO users(username,email,password_hash) VALUES (:n,:e,:p) RETURNING id"
                    ), {"n": "synthetic", "e": email, "p": "synthetic-hash"})

                    async def rejected(statement, params, exception):
                        nested = await conn.begin_nested()
                        try:
                            with pytest.raises(exception):
                                await conn.execute(text(statement), params)
                        finally:
                            await nested.rollback()

                    await rejected("INSERT INTO users(username,email,password_hash) VALUES ('x',:e,'x')",
                                   {"e": email}, IntegrityError)
                    await rejected("INSERT INTO user_task_progress(user_id,task_id,task_revision) "
                                   "VALUES (-999999,'task','r')", {}, IntegrityError)
                    await conn.execute(text("INSERT INTO user_task_progress(user_id,task_id,task_revision) "
                                            "VALUES (:u,'task','r')"), {"u": user_id})
                    await rejected("INSERT INTO user_task_progress(user_id,task_id,task_revision) "
                                   "VALUES (:u,'task','r')", {"u": user_id}, IntegrityError)
                    await rejected("INSERT INTO users(username,email,password_hash) VALUES (:n,:e,'x')",
                                   {"n": "x" * 51, "e": f"{uuid4()}@example.test"}, DBAPIError)
                    await conn.execute(text("SET LOCAL enable_seqscan = off"))
                    rows = await conn.execute(text("EXPLAIN SELECT * FROM user_task_progress "
                                                   "WHERE user_id=:u AND task_id='task'"), {"u": user_id})
                    plan = "\n".join(row[0] for row in rows)
                    assert "Index" in plan or "Bitmap" in plan
                finally:
                    await tx.rollback()
        finally:
            await engine.dispose()

    asyncio.run(run())
