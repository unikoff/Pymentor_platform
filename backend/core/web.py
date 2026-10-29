import asyncio
import os
from contextlib import asynccontextmanager
from urllib.parse import urlsplit

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from core.config import DIST_DIR
from notifications.local import LocalNotificationDispatcher


_DEV_ORIGINS = {
    ("http", "localhost", 5173),
    ("http", "127.0.0.1", 5173),
}


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
    if path.startswith("/api/"):
        path = path[len("/api") :]
    if path.strip("/").split("/", 1)[0] in {"learning", "user", "admin"}:
        response.headers["Cache-Control"] = "no-store"
    return response


class LandingEventBodyLimitMiddleware:
    """Buffer at most 2 KiB for admin landing event requests, including chunked bodies."""

    def __init__(self, app, max_bytes: int = 2048):
        self.app = app
        self.max_bytes = max_bytes

    async def __call__(self, scope, receive, send):
        if scope.get("type") != "http" or scope.get("method", "").upper() != "POST":
            await self.app(scope, receive, send)
            return
        path = scope.get("path", "")
        root_path = scope.get("root_path", "").rstrip("/")
        if root_path and path.startswith(f"{root_path}/"):
            path = path[len(root_path) :]
        if path.startswith("/api/"):
            path = path[len("/api") :]
        if not (path.startswith("/admin/landings/") and path.endswith("/events")):
            await self.app(scope, receive, send)
            return

        headers = {key.lower(): value for key, value in scope.get("headers", [])}
        raw_length = headers.get(b"content-length")
        if raw_length:
            try:
                if int(raw_length) > self.max_bytes:
                    await JSONResponse(status_code=413, content={"detail": "Landing event body is too large"})(
                        scope, receive, send
                    )
                    return
            except ValueError:
                await JSONResponse(status_code=400, content={"detail": "Invalid Content-Length"})(
                    scope, receive, send
                )
                return

        buffered = []
        size = 0
        while True:
            message = await receive()
            buffered.append(message)
            if message.get("type") == "http.request":
                size += len(message.get("body", b""))
                if size > self.max_bytes:
                    await JSONResponse(status_code=413, content={"detail": "Landing event body is too large"})(
                        scope, receive, send
                    )
                    return
                if not message.get("more_body", False):
                    break
            else:
                break

        async def replay_receive():
            if buffered:
                return buffered.pop(0)
            return await receive()

        await self.app(scope, replay_receive, send)


def _origin_parts(value):
    try:
        parsed = urlsplit(value)
        if (parsed.scheme.lower() not in {"http", "https"} or not parsed.hostname
                or parsed.username is not None or parsed.password is not None
                or parsed.path not in {"", "/"} or parsed.query or parsed.fragment):
            return None
        port = parsed.port
    except ValueError:
        return None
    if port is None:
        port = 443 if parsed.scheme.lower() == "https" else 80
    return parsed.scheme.lower(), parsed.hostname.lower(), port


async def prevent_cross_origin_unsafe_requests(request, call_next):
    if request.method.upper() not in {"GET", "HEAD", "OPTIONS", "TRACE"}:
        origin = request.headers.get("origin")
        if origin:
            forwarded_scheme = request.headers.get("x-forwarded-proto", "").split(",", 1)[0].strip()
            forwarded_host = request.headers.get("x-forwarded-host", "").split(",", 1)[0].strip()
            scheme = forwarded_scheme or request.url.scheme
            host = forwarded_host or request.headers.get("host") or request.url.netloc
            request_origin = _origin_parts(f"{scheme}://{host}")
            origin_parts = _origin_parts(origin)
            if (origin_parts is None or request_origin is None
                    or (origin_parts != request_origin and origin_parts not in _DEV_ORIGINS)):
                return JSONResponse(
                    status_code=403,
                    content={"detail": "Cross-origin request rejected"},
                )
    return await call_next(request)


def configure_web(app):
    app.add_middleware(LandingEventBodyLimitMiddleware)
    app.middleware("http")(prevent_cross_origin_unsafe_requests)
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
            if full_path.split("/", 1)[0] in {"api", "learning", "user", "admin"}:
                raise HTTPException(status_code=404, detail="API endpoint not found. Update the backend and retry.")
            # Любой путь, не пойманный роутерами и /assets, отдаёт index.html (SPA-роутинг).
            return FileResponse(_DIST_DIR / "index.html", headers={"Cache-Control": "no-cache"})
    else:
        @app.get("/")
        async def root():
            return "Pymentor API working"
