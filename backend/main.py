from pathlib import Path

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text

from DataBase.engine import Base, engine
from DataBase import model
from routers.admin.routers import admin_router
from routers.learning.routers import learning_router
from routers.user.routers import user_router


app = FastAPI()


def ensure_schema() -> None:
    Base.metadata.create_all(bind=engine)

    inspector = inspect(engine)
    user_columns = {column["name"] for column in inspector.get_columns("users")}
    if "subscription_until" not in user_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE users ADD COLUMN subscription_until DATETIME"))

    # created_at в user_activity_days был избыточен: сам activity_date уже
    # фиксирует день, а точное время визита нигде не используется.
    activity_columns = {column["name"] for column in inspector.get_columns("user_activity_days")}
    if "created_at" in activity_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE user_activity_days DROP COLUMN created_at"))

    if "is_admin" not in user_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0"))

    # С появлением треков id уроков получили префикс трека:
    # lesson-04 -> python-basics-lesson-04. Переносим старые записи прогресса.
    with engine.begin() as connection:
        connection.execute(
            text(
                "UPDATE user_lesson_progress SET lesson_id = 'python-basics-' || lesson_id "
                "WHERE lesson_id LIKE 'lesson-%'"
            )
        )


ensure_schema()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_router, prefix="/admin")
app.include_router(user_router, prefix="/user")
app.include_router(learning_router, prefix="/learning")

# --- Раздача собранного фронтенда (production) ---
# В деплое FastAPI сам отдаёт собранный React из frontend/dist: и ассеты, и SPA.
# Тогда фронт и API живут на одном origin — cookie сессии работает без CORS.
# В dev папки dist нет (фронт крутит Vite отдельно) → остаётся чистый API.
_DIST_DIR = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if (_DIST_DIR / "index.html").exists():
    app.mount("/assets", StaticFiles(directory=_DIST_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def spa(full_path: str):
        # Любой путь, не пойманный роутерами и /assets, отдаёт index.html (SPA-роутинг).
        return FileResponse(_DIST_DIR / "index.html")
else:
    @app.get("/")
    async def root():
        return "Pymentor API working"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001)
