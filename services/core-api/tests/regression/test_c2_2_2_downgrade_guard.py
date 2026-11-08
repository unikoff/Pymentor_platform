"""Never let the disposable migration destroy non-empty application tables."""

import asyncio
import os
from pathlib import Path
import subprocess
import sys
from uuid import uuid4

import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from c222_pg_guard import validate_test_url


def test_nonempty_local_database_cannot_be_downgraded():
    url = os.getenv("PYMENTOR_TEST_PG_URL")
    if not url:
        pytest.skip("requires explicitly configured disposable local PostgreSQL")
    validate_test_url(url)
    project = Path(__file__).resolve().parents[4]

    async def run():
        engine = create_async_engine(url)
        tag = f"{uuid4()}@example.test"
        user_id = None
        try:
            async with engine.connect() as conn:
                identity = (await conn.execute(text("SELECT current_database(), current_user"))).one()
                assert tuple(identity) == ("pymentor_test", "pymentor_test")
                initial_revision = await conn.scalar(text("SELECT version_num FROM alembic_version"))
                user_id = await conn.scalar(text(
                    "INSERT INTO users(username,email,password_hash) VALUES (:n,:e,:p) RETURNING id"
                ), {"n": "synthetic-downgrade-guard", "e": tag, "p": "synthetic"})
                await conn.commit()
            env = os.environ.copy()
            env["PYMENTOR_MIGRATION_URL"] = url
            env["PYTHON_DOTENV_DISABLED"] = "1"
            result = await asyncio.to_thread(subprocess.run,
                [sys.executable, "-m", "alembic", "-c", "services/core-api/alembic.ini", "downgrade", "base"],
                cwd=project, env=env, capture_output=True, text=True, timeout=30)
            assert result.returncode != 0
            assert "Refusing to downgrade non-empty table: users" in result.stderr
            async with engine.connect() as conn:
                assert await conn.scalar(text("SELECT count(*) FROM users WHERE id=:id AND email=:email"),
                                         {"id": user_id, "email": tag}) == 1
                assert await conn.scalar(text("SELECT version_num FROM alembic_version")) == initial_revision
        finally:
            if user_id is not None:
                async with engine.begin() as conn:
                    await conn.execute(text("DELETE FROM users WHERE id=:id AND email=:email"),
                                       {"id": user_id, "email": tag})
            await engine.dispose()

    asyncio.run(run())
