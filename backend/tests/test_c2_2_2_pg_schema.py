"""Compare local migrated PostgreSQL schema with current ORM and legacy metadata."""

import asyncio
import os

import pytest
from sqlalchemy import inspect, text
from sqlalchemy.ext.asyncio import create_async_engine
from c222_pg_guard import validate_test_url

from db.engine import Base
from db import models  # noqa: F401 -- register metadata without importing app/bootstrap


def test_local_postgres_schema_matches_core_models_and_preserves_legacy_table():
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
                def check(sync_conn):
                    inspector = inspect(sync_conn)
                    actual_tables = set(inspector.get_table_names())
                    assert set(Base.metadata.tables) | {"booking_reminders", "alembic_version"} <= actual_tables
                    for table in Base.metadata.sorted_tables:
                        columns = {column["name"]: column for column in inspector.get_columns(table.name)}
                        assert set(columns) == set(table.columns.keys()), table.name
                        for expected in table.columns:
                            actual = columns[expected.name]
                            assert actual["nullable"] == expected.nullable, (table.name, expected.name)
                            expected_type = expected.type.compile(dialect=sync_conn.dialect).upper()
                            actual_type = actual["type"].compile(dialect=sync_conn.dialect).upper()
                            assert actual_type == expected_type, (table.name, expected.name, expected_type, actual_type)
                            if expected.server_default is not None:
                                assert actual["default"] is not None, (table.name, expected.name)
                        expected_pk = [c.name for c in table.primary_key.columns]
                        assert inspector.get_pk_constraint(table.name)["constrained_columns"] == expected_pk
                        fks = {
                            (tuple(fk["constrained_columns"]), fk["referred_table"],
                             tuple(fk["referred_columns"]), fk.get("options", {}).get("ondelete", "NO ACTION"))
                            for fk in inspector.get_foreign_keys(table.name)
                        }
                        expected_fks = {
                            (tuple(element.parent.name for element in fk.elements),
                             fk.referred_table.name, tuple(element.column.name for element in fk.elements),
                             fk.ondelete or "NO ACTION")
                            for fk in table.foreign_key_constraints
                        }
                        assert fks == expected_fks, table.name
                        indexes = {(item["name"], tuple(item["column_names"]), item["unique"])
                                   for item in inspector.get_indexes(table.name)}
                        for expected in table.indexes:
                            assert (expected.name, tuple(col.name for col in expected.columns),
                                    bool(expected.unique)) in indexes, (table.name, expected.name)
                        unique_columns = {tuple(item["column_names"]) for item in inspector.get_unique_constraints(table.name)}
                        unique_columns |= {cols for _, cols, unique in indexes if unique}
                        for constraint in table.constraints:
                            if constraint.__class__.__name__ == "UniqueConstraint":
                                assert tuple(col.name for col in constraint.columns) in unique_columns, table.name
                    legacy = {column["name"] for column in inspector.get_columns("booking_reminders")}
                    assert legacy == {"id", "slot_id", "chat_id", "remind_at", "sent_at", "created_at"}
                    assert inspector.get_pk_constraint("booking_reminders")["constrained_columns"] == ["id"]
                    assert any(fk["referred_table"] == "booking_slots" and fk["constrained_columns"] == ["slot_id"]
                               for fk in inspector.get_foreign_keys("booking_reminders"))
                    assert any(i["unique"] and i["column_names"] == ["slot_id"]
                               for i in inspector.get_indexes("booking_reminders"))
                await conn.run_sync(check)
        finally:
            await engine.dispose()

    asyncio.run(run())
