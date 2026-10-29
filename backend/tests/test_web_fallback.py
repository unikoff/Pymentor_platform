import asyncio
import json

from fastapi import FastAPI

from core.web import configure_web, mount_frontend


async def _request(app, method, path):
    messages = []
    delivered = False

    async def receive():
        nonlocal delivered
        if delivered:
            return {"type": "http.disconnect"}
        delivered = True
        return {"type": "http.request", "body": b"", "more_body": False}

    async def send(message):
        messages.append(message)

    await app(
        {
            "type": "http",
            "asgi": {"version": "3.0", "spec_version": "2.4"},
            "http_version": "1.1",
            "method": method,
            "scheme": "http",
            "path": path,
            "raw_path": path.encode(),
            "root_path": "",
            "query_string": b"",
            "headers": [(b"host", b"testserver")],
            "server": ("testserver", 80),
            "client": ("127.0.0.1", 12345),
        },
        receive,
        send,
    )
    start = next(item for item in messages if item["type"] == "http.response.start")
    body = b"".join(
        item.get("body", b"") for item in messages if item["type"] == "http.response.body"
    )
    headers = {
        key.decode().lower(): value.decode("latin-1") for key, value in start["headers"]
    }
    return start["status"], headers, body


def test_landing_spa_fallback_keeps_api_routes_and_unknown_api_json(
    monkeypatch, tmp_path
):
    (tmp_path / "assets").mkdir()
    (tmp_path / "index.html").write_text(
        "<!doctype html><title>Pymentor landing</title>", encoding="utf-8"
    )
    monkeypatch.setattr("core.web.DIST_DIR", tmp_path)

    app = FastAPI()
    configure_web(app)

    @app.get("/api/admin/landings")
    async def list_landings():
        return {"route": "admin"}

    @app.post("/api/admin/landings/{landing_id}/events")
    async def create_landing_event(landing_id: str):
        return {"route": "event", "landing_id": landing_id}

    @app.get("/learning/catalog")
    async def learning_catalog():
        return {"route": "learning"}

    @app.get("/user/refresh")
    async def refresh_session():
        return {"route": "user"}

    mount_frontend(app)

    async def exercise_routes():
        for path in ("/backend", "/platform/backend"):
            status, headers, body = await _request(app, "GET", path)
            assert status == 200
            assert body.decode() == "<!doctype html><title>Pymentor landing</title>"
            assert headers["content-type"].startswith("text/html")

        status, headers, body = await _request(app, "GET", "/api/admin/landings")
        assert status == 200
        assert headers["content-type"].startswith("application/json")
        assert json.loads(body) == {"route": "admin"}

        status, _, body = await _request(app, "POST", "/api/admin/landings/demo/events")
        assert status == 200
        assert json.loads(body) == {
            "route": "event",
            "landing_id": "demo",
        }
        status, _, body = await _request(app, "GET", "/learning/catalog")
        assert status == 200
        assert json.loads(body) == {"route": "learning"}
        status, _, body = await _request(app, "GET", "/user/refresh")
        assert status == 200
        assert json.loads(body) == {"route": "user"}

        status, headers, _ = await _request(app, "GET", "/api/not-registered")
        assert status == 404
        assert headers["content-type"].startswith("application/json")

        for path in ("/learning/not-registered", "/user/not-registered", "/admin/not-registered"):
            status, headers, _ = await _request(app, "GET", path)
            assert status == 404
            assert headers["content-type"].startswith("application/json")

    asyncio.run(exercise_routes())
