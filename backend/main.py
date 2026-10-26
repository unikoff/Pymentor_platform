from fastapi import FastAPI

from core.web import lifespan, configure_web, mount_frontend
from db.bootstrap import ensure_schema
from routers.admin.router import admin_router
from routers.accounts.router import user_router
from routers.bookings.router import booking_router
from routers.courses.router import learning_router

app = FastAPI(lifespan=lifespan)
ensure_schema()
configure_web(app)

app.include_router(admin_router, prefix="/admin")
app.include_router(user_router, prefix="/user")
app.include_router(booking_router, prefix="/user")
app.include_router(learning_router, prefix="/learning")
mount_frontend(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001)
