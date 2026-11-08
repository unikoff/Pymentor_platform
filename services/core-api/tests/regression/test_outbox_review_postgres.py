"""Actual PostgreSQL check: unresolved imported sends cannot escape manual review."""
import os
from uuid import uuid4
import pytest
from sqlalchemy import create_engine,text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session
from c222_pg_guard import validate_test_url
from pymentor_core.adapters.postgres.outbox_review import require_review_complete

def test_import_review_is_fail_closed_and_failed_delivery_cannot_auto_retry():
    raw=os.environ.get("PYMENTOR_TEST_PG_URL")
    if not raw:pytest.skip("requires explicitly configured disposable PostgreSQL")
    url=validate_test_url(raw).set(drivername="postgresql+psycopg")
    admin_raw=os.environ.get("PYMENTOR_TEST_PG_ADMIN_URL")
    if not admin_raw:pytest.skip("requires verified disposable lab administrator for rollback-only fixture DDL")
    admin_url=make_url(admin_raw)
    assert (admin_url.drivername,admin_url.host,admin_url.port,admin_url.database,admin_url.username)==("postgresql+psycopg","127.0.0.1",57152,"pymentor_test","pymentor_test_admin") and not admin_url.query
    engine=create_engine(admin_url,hide_parameters=True,connect_args={"connect_timeout":3})
    try:
        with Session(engine) as db:
            assert tuple(db.execute(text("SELECT current_database(),current_user")).one())==("pymentor_test","pymentor_test_admin")
            assert db.scalar(text("SELECT to_regnamespace('c232_lab_control')")) is None
            def guard(**kwargs):
                db.execute(text("SET LOCAL ROLE pymentor_test"))
                try:
                    assert db.scalar(text("SELECT current_user"))=="pymentor_test"
                    return require_review_complete(db,**kwargs)
                finally:db.execute(text("RESET ROLE"))
            try:
                db.execute(text("CREATE SCHEMA c232_lab_control"))
                db.execute(text("GRANT USAGE ON SCHEMA c232_lab_control TO pymentor_test"))
                db.execute(text("CREATE TABLE c232_lab_control.import_marker(id integer)"))
                with pytest.raises(RuntimeError,match="imported_outbox_review_unavailable"):
                    guard()
                db.execute(text("CREATE TABLE c232_lab_control.outbox_review(queue text,row_id integer,reviewed boolean,decision text)"))
                db.execute(text("GRANT SELECT ON c232_lab_control.outbox_review TO pymentor_test"))
                row=db.scalar(text("""INSERT INTO booking_notification_outbox
                    (event_id,event_type,slot_id,username,email,slot_date,start_time,status,attempts,next_attempt_at)
                    VALUES (:event,'booking_created',42,'synthetic','review@example.test','2099-01-01','12:00','processing',1,clock_timestamp()) RETURNING id"""),{"event":str(uuid4())})
                db.execute(text("INSERT INTO c232_lab_control.outbox_review VALUES ('booking_notification_outbox',:id,false,NULL)"),{"id":row})
                with pytest.raises(RuntimeError,match="imported_outbox_review_required"):
                    guard()
                db.execute(text("UPDATE c232_lab_control.outbox_review SET reviewed=true,decision='suppress'"))
                with pytest.raises(RuntimeError,match="imported_outbox_review_required"):
                    guard()
                db.execute(text("UPDATE booking_notification_outbox SET status='failed' WHERE id=:id"),{"id":row})
                guard()
                with pytest.raises(RuntimeError,match="imported_outbox_retry_requires_review"):
                    guard(for_retry=True)
                db.execute(text("UPDATE c232_lab_control.outbox_review SET decision='delivered'"))
                db.execute(text("UPDATE booking_notification_outbox SET status='sent' WHERE id=:id"),{"id":row})
                guard(for_retry=True)
            finally:
                db.rollback() # DDL and synthetic events disappear together; no external send.
    finally:engine.dispose()
