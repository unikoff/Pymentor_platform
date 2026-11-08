"""Local-only ASGI vertical slice on real, disposable PostgreSQL."""

import asyncio
import os
from uuid import uuid4

import httpx
import pytest
from sqlalchemy import text

from c222_pg_guard import validate_test_url
from pymentor_core.adapters.postgres.async_database import AsyncDatabase
from tools.lab.async_preview import create_preview_app


@pytest.mark.parametrize("url", [
    "postgresql+asyncpg://pymentor_test:p@127.0.0.1:5432/pymentor_test",
    "postgresql+asyncpg://other:p@127.0.0.1:57152/pymentor_test",
    "postgresql+asyncpg://pymentor_test:p@127.0.0.1:57152/other",
])
def test_preview_rejects_non_test_local_database(url):
    async def run():
        database = AsyncDatabase(url)
        try:
            with pytest.raises(ValueError):
                create_preview_app(database)
        finally:
            await database.dispose()
    asyncio.run(run())


def test_async_activity_requests_use_real_postgres_and_isolate_users():
    url = os.getenv("PYMENTOR_TEST_PG_URL")
    if not url:
        pytest.skip("requires explicitly configured disposable local PostgreSQL")
    validate_test_url(url)

    async def run():
        db = AsyncDatabase(url, pool_size=3, max_overflow=0, pool_timeout=3,
                           connect_timeout=3, command_timeout=3)
        app = create_preview_app(db)
        emails = [f"{uuid4()}@example.test", f"{uuid4()}@example.test"]
        tokens = [str(uuid4()), str(uuid4())]
        ids = []
        verified = False
        try:
            async with app.router.lifespan_context(app):
                try:
                    async with db.unit_of_work() as uow:
                        identity = (await uow.session.execute(text("SELECT current_database(), current_user"))).one()
                        assert tuple(identity) == ("pymentor_test", "pymentor_test")
                        verified = True
                        for email, token in zip(emails, tokens):
                            user_id = await uow.session.scalar(text(
                                "INSERT INTO users(username,email,password_hash) "
                                "VALUES ('synthetic',:email,'synthetic') RETURNING id"
                            ), {"email": email})
                            await uow.session.execute(text(
                                "INSERT INTO sessions(user_id,session_token) VALUES (:u,:token)"
                            ), {"u": user_id, "token": token})
                            ids.append(user_id)
                        await uow.commit()

                    transport = httpx.ASGITransport(app=app)
                    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
                        missing = await client.post("/api/user/activity/visit", json={"activity_date": "2026-01-03"})
                        assert missing.status_code == 401 and missing.json() == {"detail": "No session token found"}
                        invalid = await client.get("/api/user/activity?year=2026&month=1",
                                                   headers={"cookie": "session=invalid-synthetic-token"})
                        assert invalid.status_code == 401 and invalid.json() == {"detail": "Invalid session"}
                        headers = {"cookie": f"session={tokens[0]}"}
                        bad_month = await client.get("/api/user/activity?year=2026&month=13", headers=headers)
                        assert bad_month.status_code == 422
                        first, second = await asyncio.gather(*(
                            client.post("/api/user/activity/visit", json={"activity_date": "2026-01-03"}, headers=headers)
                            for _ in range(2)
                        ))
                        assert first.status_code == second.status_code == 200
                        assert first.json() == second.json()
                        assert first.json()["activity_date"] == "2026-01-03"
                        assert first.json()["visited_at"] is not None
                        calendar = await client.get("/api/user/activity?year=2026&month=1", headers=headers)
                        assert calendar.status_code == 200
                        assert calendar.headers["cache-control"] == "no-store"
                        assert calendar.json() == {"days": ["2026-01-03"], "visits": [first.json()]}
                        other = await client.get("/api/user/activity?year=2026&month=1",
                                                 headers={"cookie": f"session={tokens[1]}"})
                        assert other.status_code == 200 and other.json() == {"days": [], "visits": []}
                    async with db.unit_of_work() as uow:
                        count = await uow.session.scalar(text(
                            "SELECT count(*) FROM user_activity_days WHERE user_id=:u AND activity_date='2026-01-03'"
                        ), {"u": ids[0]})
                        assert count == 1
                finally:
                    if verified and ids:
                        async with db.unit_of_work() as uow:
                            for user_id in ids:
                                await uow.session.execute(text("DELETE FROM user_activity_days WHERE user_id=:u"), {"u": user_id})
                                await uow.session.execute(text("DELETE FROM sessions WHERE user_id=:u"), {"u": user_id})
                                await uow.session.execute(text("DELETE FROM users WHERE id=:u AND email IN (:e1,:e2)"),
                                                          {"u": user_id, "e1": emails[0], "e2": emails[1]})
                            await uow.commit()
                    assert db.engine.pool.checkedout() == 0
        finally:
            await db.dispose()

    asyncio.run(run())
