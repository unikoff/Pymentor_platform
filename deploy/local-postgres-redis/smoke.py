"""HTTP auth/data smoke for this disposable Compose network, standard library only."""
import http.cookiejar
import json
from urllib.error import HTTPError
from urllib.request import HTTPCookieProcessor, Request, build_opener
from uuid import uuid4

client = build_opener(HTTPCookieProcessor(http.cookiejar.CookieJar()))
def call(path, data=None, *, method=None, headers=None):
    request = Request("http://core:8001" + path, data=None if data is None else json.dumps(data).encode(),
                      headers={"Content-Type": "application/json", **(headers or {})}, method=method)
    with client.open(request, timeout=10) as response:
        return json.load(response)

for path in ("/health/live", "/health/startup", "/health/ready"):
    call(path)
email = f"pg06-{uuid4().hex}@example.invalid"
credentials = {"email": email, "password": "Synthetic-local-password-123"}
user = call("/api/user/register", {"username": "Synthetic", **credentials})["user"]
grant = call("/api/user/login", credentials, headers={"Idempotency-Key": str(uuid4())})
assert grant["user"]["id"] == user["id"]
assert call("/api/user/me")["user"]["email"] == email
call("/api/user/profile", {"username": "Smoke updated"}, method="PATCH")
assert call("/api/user/me")["user"]["username"] == "Smoke updated"
call("/api/user/logout", {}, method="POST")
try:
    call("/api/user/me")
except HTTPError as exc:
    assert exc.code == 401
else:
    raise AssertionError("logged-out client was authorized")
print("PASS health, Redis login/cookie, PostgreSQL write/read, logout")
