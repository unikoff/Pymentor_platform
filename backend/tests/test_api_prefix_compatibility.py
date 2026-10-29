import ast
import asyncio
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from core.dependencies import get_db
from db import models
from db.engine import Base
from routers.accounts.router import user_router
from routers.bookings.router import booking_router
from routers.courses.router import learning_router
from core.web import configure_web


BACKEND_ROOT = Path(__file__).resolve().parents[1]
PASSWORD = "api-compatibility-test-password"
EMAIL = "api-compatibility@example.test"


async def _request(app, method, path, *, payload=None, cookie=None, request_headers=None):
    body = json.dumps(payload).encode("utf-8") if payload is not None else b""
    headers = [(b"content-length", str(len(body)))]
    if payload is not None:
        headers.append((b"content-type", b"application/json"))
    if cookie:
        headers.append((b"cookie", cookie.encode("latin-1")))
    if request_headers:
        headers.extend((key.lower().encode("latin-1"), value.encode("latin-1"))
                       for key, value in request_headers.items())
    messages = []
    delivered = False

    async def receive():
        nonlocal delivered
        if delivered:
            return {"type": "http.disconnect"}
        delivered = True
        return {"type": "http.request", "body": body, "more_body": False}

    async def send(message):
        messages.append(message)

    await app(
        {"type": "http", "asgi": {"version": "3.0", "spec_version": "2.4"},
         "http_version": "1.1", "method": method, "scheme": "http", "path": path,
         "raw_path": path.encode(), "root_path": "", "query_string": b"", "headers": headers,
         "server": ("testserver", 80), "client": ("127.0.0.1", 12345)},
        receive, send,
    )
    start = next(item for item in messages if item["type"] == "http.response.start")
    response_body = b"".join(
        item.get("body", b"") for item in messages if item["type"] == "http.response.body"
    )
    response_headers = {
        key.decode().lower(): value.decode("latin-1") for key, value in start["headers"]
    }
    return start["status"], response_headers, json.loads(response_body) if response_body else None


def _registered_prefixes():
    tree = ast.parse((BACKEND_ROOT / "main.py").read_text(encoding="utf-8"))
    prefixes = {}
    for node in ast.walk(tree):
        if not isinstance(node, ast.Call) or not isinstance(node.func, ast.Attribute):
            continue
        if not isinstance(node.func.value, ast.Name) or node.func.value.id != "app":
            continue
        if node.func.attr != "include_router" or not node.args:
            continue
        router = node.args[0]
        prefix = next(
            (keyword.value.value for keyword in node.keywords
             if keyword.arg == "prefix" and isinstance(keyword.value, ast.Constant)),
            "",
        )
        if isinstance(router, ast.Name):
            prefixes.setdefault(router.id, set()).add(prefix)
    return prefixes


def _make_test_app():
    app = FastAPI()
    configure_web(app)
    for router, base in (
        (user_router, "/user"), (user_router, "/api/user"),
        (booking_router, "/user"), (booking_router, "/api/user"),
        (learning_router, "/learning"), (learning_router, "/api/learning"),
    ):
        app.include_router(router, prefix=base)

    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    sessions = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    with sessions() as db:
        db.add(models.User(
            username="API Compatibility Student", email=EMAIL, password=PASSWORD,
            subscription_until=datetime.now(timezone.utc) + timedelta(days=30),
            subscription_plan="pro",
        ))
        db.commit()

    def override_get_db():
        with sessions() as db:
            yield db

    app.dependency_overrides[get_db] = override_get_db
    return app, engine


def test_main_registers_api_aliases_and_keeps_legacy_prefixes():
    prefixes = _registered_prefixes()

    assert prefixes["admin_router"] == {"/admin", "/api/admin"}
    assert prefixes["user_router"] == {"/user", "/api/user"}
    assert prefixes["booking_router"] == {"/user", "/api/user"}
    assert prefixes["learning_router"] == {"/learning", "/api/learning"}


async def _exercise_api_aliases():
    app, engine = _make_test_app()
    try:
        catalog_results = []
        authenticated_catalog_results = []
        login_results = []
        logout_results = []
        for prefix in ("/user", "/api/user"):
            learning_prefix = "/learning" if prefix == "/user" else "/api/learning"
            status, headers, catalog = await _request(app, "GET", f"{learning_prefix}/catalog")
            assert status == 200
            assert headers["content-type"].startswith("application/json")
            assert headers["cache-control"] == "no-store"
            catalog_results.append(catalog)

            status, login_headers, login = await _request(
                app, "POST", f"{prefix}/login",
                payload={"email": EMAIL, "password": PASSWORD},
            )
            assert status == 200
            assert login["message"] == "Login successful"
            assert login["user"]["email"] == EMAIL
            set_cookie = login_headers["set-cookie"].lower()
            assert "httponly" in set_cookie and "samesite=lax" in set_cookie
            assert "max-age=2592000" in set_cookie
            cookie = login_headers["set-cookie"].split(";", 1)[0]
            login_results.append(login)

            status, _, authenticated_catalog = await _request(
                app, "GET", f"{learning_prefix}/catalog", cookie=cookie
            )
            assert status == 200
            authenticated_catalog_results.append(authenticated_catalog)

            status, logout_headers, logout = await _request(
                app, "POST", f"{prefix}/logout", cookie=cookie
            )
            assert status == 200
            assert logout == {"message": "Logout successful"}
            assert 'session=""' in logout_headers["set-cookie"].lower()
            logout_results.append(logout)

            status, _, unauthorized = await _request(app, "GET", f"{prefix}/me", cookie=cookie)
            assert status == 401
            assert unauthorized == {"detail": "Invalid session"}

        assert catalog_results[0] == catalog_results[1]
        assert authenticated_catalog_results[0] == authenticated_catalog_results[1]
        assert login_results[0] == login_results[1]
        assert logout_results[0] == logout_results[1]

        for path in ("/user/refresh", "/api/user/refresh"):
            status, _, body = await _request(app, "POST", path)
            assert status == 404
            assert body == {"detail": "Not Found"}
    finally:
        engine.dispose()


def test_api_aliases_preserve_catalog_auth_cookies_and_missing_refresh():
    asyncio.run(_exercise_api_aliases())


def _make_origin_test_app():
    app = FastAPI()
    configure_web(app)
    app.state.endpoint_calls = 0

    @app.post("/probe")
    async def probe():
        app.state.endpoint_calls += 1
        return {"ok": True}

    return app


async def _exercise_origin_check():
    app = _make_origin_test_app()

    status, _, body = await _request(
        app, "POST", "/probe", cookie="session=existing-session",
        request_headers={"origin": "https://evil.example"},
    )
    assert status == 403
    assert body == {"detail": "Cross-origin request rejected"}
    assert app.state.endpoint_calls == 0

    status, _, body = await _request(
        app, "POST", "/probe",
        request_headers={
            "origin": "https://app.example",
            "x-forwarded-proto": "https",
            "x-forwarded-host": "app.example",
        },
    )
    assert status == 200
    assert body == {"ok": True}
    assert app.state.endpoint_calls == 1

    for origin in ("http://localhost:5173", "http://127.0.0.1:5173"):
        status, response_headers, body = await _request(
            app, "POST", "/probe", request_headers={"origin": origin}
        )
        assert status == 200
        assert body == {"ok": True}
        assert response_headers["access-control-allow-origin"] == origin

    status, response_headers, body = await _request(
        app, "POST", "/probe",
        request_headers={"origin": "http://localhost:5174"},
    )
    assert status == 403
    assert body == {"detail": "Cross-origin request rejected"}
    assert "access-control-allow-origin" not in response_headers

    status, _, body = await _request(app, "POST", "/probe")
    assert status == 200
    assert body == {"ok": True}


def test_unsafe_origin_check_blocks_cross_origin_and_preserves_allowed_requests():
    asyncio.run(_exercise_origin_check())
