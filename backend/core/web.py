import asyncio
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from core.config import DIST_DIR
from notifications.local import LocalNotificationDispatcher


@asynccontextmanager
async def lifespan(app: FastAPI):
    dispatcher = None
    if os.getenv("PYMENTOR_LOCAL_NOTIFICATIONS", "1").lower() not in {"0", "false", "off"}:
        dispatcher = LocalNotificationDispatcher()
        dispatcher.start()
    try:
        yield
    finally:
        if dispatcher is not None:
            await asyncio.to_thread(dispatcher.stop)


async def prevent_api_caching(request, call_next):
    response = await call_next(request)
    path = request.url.path
    root_path = request.scope.get("root_path", "").rstrip("/")
    if root_path and path.startswith(f"{root_path}/"):
        path = path[len(root_path) :]
    if path.strip("/").split("/", 1)[0] in {"learning", "user", "admin"}:
        response.headers["Cache-Control"] = "no-store"
    return response


def configure_web(app):
    app.middleware("http")(prevent_api_caching)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


def mount_frontend(app):
    _DIST_DIR = DIST_DIR
    if (_DIST_DIR / "index.html").exists():
        app.mount("/assets", StaticFiles(directory=_DIST_DIR / "assets"), name="assets")
    
        @app.get("/{full_path:path}")
        async def spa(full_path: str):
            if full_path.split("/", 1)[0] in {"learning", "user", "admin"}:
                raise HTTPException(status_code=404, detail="API endpoint not found. Update the backend and retry.")
            # Любой путь, не пойманный роутерами и /assets, отдаёт index.html (SPA-роутинг).
            return FileResponse(_DIST_DIR / "index.html", headers={"Cache-Control": "no-cache"})
    else:
        @app.get("/")
        async def root():
            return "Pymentor API working"
