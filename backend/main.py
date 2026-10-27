from fastapi import FastAPI, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from core.web import lifespan, configure_web, mount_frontend
from db.bootstrap import ensure_schema
from db.engine import engine
from routers.admin.router import admin_router
from routers.accounts.router import user_router
from routers.bookings.router import booking_router
from routers.courses.router import learning_router

app = FastAPI(lifespan=lifespan)
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
def readiness_health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except SQLAlchemyError:
        raise HTTPException(status_code=503, detail="database unavailable") from None
    return {"status": "ready"}


app.include_router(admin_router, prefix="/admin")
app.include_router(user_router, prefix="/user")
app.include_router(booking_router, prefix="/user")
app.include_router(learning_router, prefix="/learning")
app.include_router(admin_router, prefix="/api/admin")
app.include_router(user_router, prefix="/api/user")
app.include_router(booking_router, prefix="/api/user")
app.include_router(learning_router, prefix="/api/learning")
mount_frontend(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001)
