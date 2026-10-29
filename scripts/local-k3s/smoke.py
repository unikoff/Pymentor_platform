#!/usr/bin/env python3
"""Run the M1 synthetic-user journey through the local K3s ingress."""

from __future__ import annotations

import argparse
import json
import socket
import sys
import uuid
from http.cookiejar import CookieJar
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import HTTPCookieProcessor, ProxyHandler, Request, build_opener


TARGET_LESSON_ID = "lesson-80d491c1d310702dcd745f04"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", required=True, help="Ingress origin, e.g. http://pymentor.localhost:28080")
    parser.add_argument("--email", help="Synthetic local account email; generated when omitted.")
    parser.add_argument("--password", help="Synthetic local account password; required with --email.")
    parser.add_argument("--existing-account", action="store_true", help="Skip registration and log in to the supplied synthetic account.")
    parser.add_argument(
        "--submit-safe-code",
        action="store_true",
        help="Submit the known inert C1.1.2 baseline solution; requires an explicitly enabled local Runner.",
    )
    args = parser.parse_args()
    origin = args.base_url.rstrip("/")
    if args.email and not args.password:
        parser.error("--password is required with --email")
    if args.existing_account and not args.email:
        parser.error("--existing-account requires --email and --password")
    if urlsplit(origin).hostname not in {"pymentor.localhost", "localhost", "127.0.0.1"}:
        parser.error("This smoke only sends synthetic data to a loopback/local-host origin")
    # WSL's resolver may not map RFC 6761 .localhost names; preserve the URL,
    # Host and cookie origin while connecting this local ingress to loopback.
    getaddrinfo = socket.getaddrinfo

    def resolve_localhost(host: str, *args, **kwargs):
        if host == "pymentor.localhost":
            host = "127.0.0.1"
        return getaddrinfo(host, *args, **kwargs)

    socket.getaddrinfo = resolve_localhost
    opener = build_opener(ProxyHandler({}), HTTPCookieProcessor(CookieJar()))

    def request(method: str, path: str, payload: dict | None = None) -> tuple[int, dict, object]:
        body = json.dumps(payload).encode("utf-8") if payload is not None else None
        headers = {"Origin": origin} if method in {"POST", "PUT", "PATCH", "DELETE"} else {}
        if body is not None:
            headers["Content-Type"] = "application/json"
        req = Request(origin + path, data=body, headers=headers, method=method)
        try:
            with opener.open(req, timeout=20) as response:
                raw = response.read()
                status = response.status
                response_headers = dict(response.headers.items())
        except HTTPError as error:
            raw = error.read()
            status = error.code
            response_headers = dict(error.headers.items())
        try:
            decoded: object = json.loads(raw) if raw else None
        except (UnicodeDecodeError, json.JSONDecodeError):
            decoded = raw
        return status, response_headers, decoded

    session_active = False
    try:
        nonce = uuid.uuid4().hex
        email = args.email or f"m1-{nonce}@example.test"
        password = args.password or f"M1-local-only-{nonce}!"
        if not args.existing_account:
            status, _, _ = request(
                "POST", "/api/user/register",
                {"username": f"m1-{nonce[:12]}", "email": email, "password": password},
            )
            assert status == 200, f"registration returned HTTP {status}"

        status, headers, login = request("POST", "/api/user/login", {"email": email, "password": password})
        assert status == 200 and "httponly" in headers.get("Set-Cookie", "").lower(), "login/cookie failed"
        session_active = True
        status, _, current_user = request("GET", "/api/user/me")
        assert status == 200 and current_user["user"]["email"] == email, "authenticated /me failed"

        refresh_status, _, _ = request("GET", "/api/user/refresh")
        assert refresh_status == 404, f"refresh route changed from baseline: HTTP {refresh_status}"

        status, _, catalog = request("GET", "/api/learning/catalog")
        assert status == 200 and catalog.get("courses"), "course catalog failed"
        lessons = [lesson for course in catalog["courses"].values() for lesson in course]
        target = next((lesson for lesson in lessons if lesson.get("id") == TARGET_LESSON_ID), None)
        assert target is not None, "C1.1.2 baseline lesson is missing from the course catalog"
        assert target.get("is_available") is True, "synthetic user cannot access the baseline lesson"

        status, _, material_response = request("GET", f"/api/learning/lessons/{TARGET_LESSON_ID}")
        assert status == 200, f"lesson content returned HTTP {status}"
        material = material_response["lesson"]
        status, _, answer = request(
            "GET", f"/api/learning/lessons/{TARGET_LESSON_ID}/manual-practice/0/tasks/0/answer",
        )
        assert status == 200 and "explanation" in answer["answer"], "manual-practice answer failed"

        submission_status = None
        if args.submit_safe_code:
            tasks = material.get("tasks") or []
            assert tasks, "baseline lesson has no code task"
            task = tasks[0]
            code = (
                "def solve(first_message, second_message):\n"
                "    def make_labeler(prefix):\n"
                "        def label(message):\n"
                "            return f'{prefix}: {message}'\n"
                "        return label\n"
                "    notice = make_labeler('Важно')\n"
                "    question = make_labeler('Вопрос')\n"
                "    return [notice(first_message), question(second_message), notice(second_message)]\n"
            )
            status, _, submission = request(
                "POST", f"/api/learning/tasks/{task['id']}/submit",
                {"code": code, "task_revision": task["revision"]},
            )
            assert status == 200 and submission.get("ok") is True, f"safe code submit returned HTTP {status}: {submission}"
            assert submission.get("score") == 100, "safe code submit did not score 100"
            submission_status = status

        status, _, completion = request("POST", f"/api/learning/lessons/{TARGET_LESSON_ID}/complete", {})
        assert status == 200 and completion.get("completed") is True, "lesson completion failed"
        status, _, after = request("GET", "/api/learning/catalog")
        assert status == 200
        completed = next(
            item for course in after["courses"].values() for item in course
            if item.get("id") == TARGET_LESSON_ID
        )
        assert completed.get("completed") is True, "lesson completion was not persisted"

        status, headers, logout = request("POST", "/api/user/logout", {})
        assert status == 200 and "max-age=0" in headers.get("Set-Cookie", "").lower(), "logout failed"
        session_active = False
        status, _, _ = request("GET", "/api/user/me")
        assert status == 401, "logout left the session active"

        print(json.dumps({
            "registration": 200,
            "login_and_cookie": 200,
            "authenticated_me": 200,
            "refresh_route_baseline": refresh_status,
            "catalog": 200,
            "lesson": TARGET_LESSON_ID,
            "manual_practice_answer": 200,
            "safe_code_submit": submission_status,
            "lesson_progress_persisted": True,
            "logout": 200,
            "post_logout_me": 401,
            "synthetic_data_only": True,
        }, ensure_ascii=False, indent=2))
        return 0
    except (AssertionError, KeyError, StopIteration, TypeError, URLError) as error:
        if session_active:
            try:
                request("POST", "/api/user/logout", {})
            except (HTTPError, URLError):
                pass
        print(f"M1 smoke failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
