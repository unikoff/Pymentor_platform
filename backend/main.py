import os

from fastapi import FastAPI, HTTPException, Request
from sqlalchemy import inspect, text
from sqlalchemy.exc import SQLAlchemyError

from composition import build_default_composition
from core.web import lifespan, configure_web, mount_frontend
from core.schema_policy import DUAL_LOCAL_SCHEMA_REVISION, should_run_legacy_bootstrap
from db.bootstrap import ensure_schema
from db.engine import engine
from routers.admin.router import admin_router
from routers.accounts.router import user_router
from routers.bookings.router import booking_router
from routers.courses.router import learning_router
from routers.landings.public import router as public_landing_router

app = FastAPI(lifespan=lifespan)
DUAL_LOCAL_REQUIRED_TABLES = (
    "users", "admins", "sessions", "user_activity_days", "user_lesson_progress", "user_task_progress",
    "booking_slots", "booking_quotas", "booking_reminders", "booking_notification_outbox",
    "booking_notification_delivery_state", "landings", "landing_telegram_configs",
    "landing_notification_outbox", "landing_notification_delivery_state", "session_import_markers",
)
app.state.composition_root = build_default_composition()
if should_run_legacy_bootstrap(engine.dialect.name, os.getenv("PYMENTOR_SCHEMA_MODE")):
    ensure_schema()
configure_web(app)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/health/live")
def liveness_health():
    # Keep liveness independent of the database and other dependencies so a
    # transient outage does not create a restart loop.
    return {"status": "ok"}


@app.get("/health/startup")
def startup_health():
    # FastAPI serves routes only after the ASGI lifespan has started.
    return {"status": "started"}


@app.get("/health/ready")
def readiness_health(request: Request):
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            if os.getenv("PYMENTOR_DUAL_LOCAL_TEST") == "1":
                identity = tuple(connection.execute(text("SELECT current_database(), current_user")).one())
                revision = connection.execute(text("SELECT version_num FROM alembic_version")).scalar_one()
                available = set(inspect(connection).get_table_names())
                if (identity != ("pymentor_test", "pymentor_test") or revision != DUAL_LOCAL_SCHEMA_REVISION
                        or not set(DUAL_LOCAL_REQUIRED_TABLES).issubset(available)):
                    raise HTTPException(status_code=503, detail="test database schema unavailable")
                from anyio import from_thread
                from identity.async_sessions import IdentityUnavailable
                from redis.exceptions import RedisError
                session_service = getattr(request.app.state, "local_async_identity", None)
                if session_service is None:
                    raise HTTPException(status_code=503, detail="Session storage unavailable")
                try:
                    from_thread.run(session_service.check_async_database)
                    if not from_thread.run(session_service.redis.ping):
                        raise HTTPException(status_code=503, detail="Session storage unavailable")
                except (IdentityUnavailable, RedisError, TimeoutError) as exc:
                    raise HTTPException(status_code=503, detail="Session storage unavailable") from exc
    except SQLAlchemyError:
        raise HTTPException(status_code=503, detail="database unavailable") from None
    return {"status": "ready"}


app.include_router(admin_router, prefix="/admin")
app.include_router(user_router, prefix="/user")
app.include_router(booking_router, prefix="/user")
app.include_router(learning_router, prefix="/learning")
app.include_router(public_landing_router, prefix="/api/landings", tags=["landing-public"])
app.include_router(admin_router, prefix="/api/admin")
app.include_router(user_router, prefix="/api/user")
app.include_router(booking_router, prefix="/api/user")
app.include_router(learning_router, prefix="/api/learning")
mount_frontend(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001)
