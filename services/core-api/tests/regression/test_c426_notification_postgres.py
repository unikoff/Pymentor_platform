"""Direct deletion and outbox locking on task-owned runtime PostgreSQL."""

import asyncio
from datetime import date
from uuid import uuid4

import pytest
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from runtime_scenarios import run_scenario


def test_postgres_direct_delete_blocks_active_delivery_and_removes_linked_notification():
    async def scenario(db, _store, user_id, email, _password):
        event_id = None
        reference = str(uuid4())
        try:
            async with db.unit_of_work() as uow:
                await uow.session.execute(text(
                    "INSERT INTO account_lifecycles(user_id, lifecycle_id) VALUES (:uid, :ref)"
                ), {"uid": user_id, "ref": reference})
                event_id = await uow.session.scalar(text("""
                    INSERT INTO booking_notification_outbox
                        (event_id, event_type, slot_id, username, email, slot_date, start_time,
                         status, attempts, next_attempt_at)
                    VALUES (:event_id, 'booking_created', 42, 'synthetic', :email, :day, '10:00',
                            'processing', 1, clock_timestamp()) RETURNING id
                """), {"event_id": str(uuid4()), "email": email, "day": date(2099, 1, 1)})
                await uow.session.execute(text("""
                    INSERT INTO booking_notification_subjects(outbox_id, lifecycle_id) VALUES (:id, :ref)
                """), {"id": event_id, "ref": reference})
                await uow.commit()
            with pytest.raises(SQLAlchemyError):
                async with db.unit_of_work() as uow:
                    await uow.session.execute(text("DELETE FROM users WHERE id=:uid"), {"uid": user_id})
                    await uow.commit()
            async with db.unit_of_work() as uow:
                assert await uow.session.scalar(text("SELECT count(*) FROM users WHERE id=:uid"), {"uid": user_id}) == 1
                await uow.session.execute(text("UPDATE booking_notification_outbox SET status='pending' WHERE id=:id"),
                                          {"id": event_id})
                await uow.session.execute(text("DELETE FROM users WHERE id=:uid"), {"uid": user_id})
                await uow.commit()
            async with db.unit_of_work() as uow:
                assert await uow.session.scalar(text("SELECT count(*) FROM booking_notification_outbox WHERE id=:id"), {"id": event_id}) == 0
                assert await uow.session.scalar(text("SELECT count(*) FROM booking_notification_subjects WHERE outbox_id=:id"), {"id": event_id}) == 0
        finally:
            if event_id is not None:
                async with db.unit_of_work() as uow:
                    await uow.session.execute(text("UPDATE booking_notification_outbox SET status='failed' WHERE id=:id"),
                                              {"id": event_id})
                    await uow.commit()

    run_scenario(scenario)


def test_postgres_delete_waits_for_claim_and_refuses_an_active_delivery():
    async def scenario(db, _store, user_id, email, _password):
        event_id = None
        deletion = None
        reference = str(uuid4())
        try:
            async with db.unit_of_work() as uow:
                await uow.session.execute(text(
                    "INSERT INTO account_lifecycles(user_id, lifecycle_id) VALUES (:uid, :ref)"
                ), {"uid": user_id, "ref": reference})
                event_id = await uow.session.scalar(text("""
                    INSERT INTO booking_notification_outbox
                        (event_id, event_type, slot_id, username, email, slot_date, start_time,
                         status, attempts, next_attempt_at)
                    VALUES (:event_id, 'booking_created', 42, 'synthetic', :email, :day, '10:00',
                            'pending', 0, clock_timestamp()) RETURNING id
                """), {"event_id": str(uuid4()), "email": email, "day": date(2099, 1, 1)})
                await uow.session.execute(text(
                    "INSERT INTO booking_notification_subjects(outbox_id, lifecycle_id) VALUES (:id, :ref)"
                ), {"id": event_id, "ref": reference})
                await uow.commit()

            async def delete_user():
                async with db.unit_of_work() as uow:
                    await uow.session.execute(text("DELETE FROM users WHERE id=:uid"), {"uid": user_id})
                    await uow.commit()

            async with db.unit_of_work() as worker:
                await worker.session.execute(text(
                    "UPDATE booking_notification_outbox SET status='processing' WHERE id=:id"
                ), {"id": event_id})
                deletion = asyncio.create_task(delete_user())
                await asyncio.sleep(0.1)
                assert not deletion.done()
                await worker.commit()
            with pytest.raises(SQLAlchemyError):
                await deletion
            async with db.unit_of_work() as uow:
                assert await uow.session.scalar(text("SELECT count(*) FROM users WHERE id=:uid"), {"uid": user_id}) == 1
        finally:
            if deletion is not None:
                if not deletion.done():
                    deletion.cancel()
                await asyncio.gather(deletion, return_exceptions=True)
            if event_id is not None:
                async with db.unit_of_work() as uow:
                    await uow.session.execute(text("UPDATE booking_notification_outbox SET status='failed' WHERE id=:id"),
                                              {"id": event_id})
                    await uow.commit()

    run_scenario(scenario)
