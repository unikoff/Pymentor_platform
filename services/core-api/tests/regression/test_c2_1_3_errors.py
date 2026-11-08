"""Negative C2.1.3 HTTP contracts against the existing in-memory ASGI fixture."""

from datetime import date
from datetime import timedelta

import pytest

from test_c2_1_3_api_contracts import clients


def _error(response, status, detail):
    assert response.status_code == status
    assert response.json() == {"detail": detail}


def _student(client, suffix):
    email = f"contract-{suffix[:24]}@example.test"
    password = "Synthetic-password-42"
    response = client.post(
        "/api/user/register",
        json={"username": f"Contract {suffix[:12]}", "email": email, "password": password},
    )
    assert response.status_code == 200
    user_id = response.json()["user"]["id"]
    response = client.post("/api/user/login", json={"email": email, "password": password})
    assert response.status_code == 200
    return user_id, {"session": response.cookies["session"]}


@pytest.mark.parametrize("method,path,payload", [
    ("get", "/api/user/me", None),
    ("get", "/api/user/slots", None),
    ("post", "/api/user/slots/999999/book", None),
    ("post", "/api/user/slots/999999/cancel", None),
    ("get", "/api/admin/overview", None),
    ("post", "/api/admin/slots", {"slot_date": "2030-01-01", "start_time": "10:00"}),
])
def test_missing_session_401_exact_payload(clients, method, path, payload):
    client, _, _ = clients
    kwargs = {"json": payload} if payload is not None else {}
    if path == "/api/user/slots":
        kwargs["params"] = {"year": 2030, "month": 1}
    _error(getattr(client, method)(path, **kwargs), 401, "No session token found")


def test_invalid_session_and_non_admin_access(clients):
    client, _, _ = clients
    _error(client.get("/api/user/me", cookies={"session": "invalid-session"}), 401, "Invalid session")
    _, cookies = _student(client, "nonadmin")
    _error(client.get("/api/admin/overview", cookies=cookies), 403, "Требуются права администратора")
    _error(client.post("/api/admin/slots", cookies=cookies, json={
        "slot_date": "2030-01-01", "start_time": "10:00", "duration_minutes": 60,
    }), 403, "Требуются права администратора")


def test_missing_resources_404_exact_payload(clients):
    client, admin, _ = clients
    _, cookies = _student(client, "missing")
    for path in ("/api/user/slots/999999/book", "/api/user/slots/999999/cancel"):
        _error(client.post(path, cookies=cookies), 404, "Слот не найден")
    _error(admin.get("/api/admin/users/999999/profile", params={"year": 2030, "month": 1}), 404, "User not found")
    _error(admin.patch("/api/admin/users/999999/subscription", json={"days": 30}), 404, "User not found")
    _error(admin.post("/api/admin/users/999999/quota", json={"year": 2030, "month": 1, "add": 1}), 404, "User not found")
    _error(admin.delete("/api/admin/slots/999999"), 404, "Слот не найден")


@pytest.mark.parametrize("path,payload,location,error_type", [
    ("subscription", {"days": 0}, ["body", "days"], "greater_than_equal"),
    ("quota", {"year": 2030, "month": 13, "add": 1}, ["body", "month"], "less_than_equal"),
    ("quota", {"year": 2030, "month": 1, "add": 101}, ["body", "add"], "less_than_equal"),
])
def test_admin_input_422_validation_payload(clients, path, payload, location, error_type):
    client, admin, _ = clients
    user_id, _ = _student(client, f"validation-{path}-{error_type}-{location[-1]}")
    endpoint = f"/api/admin/users/{user_id}/{path}"
    response = admin.patch(endpoint, json=payload) if path == "subscription" else admin.post(endpoint, json=payload)
    assert response.status_code == 422
    body = response.json()
    bound = 1 if error_type == "greater_than_equal" else (12 if location[-1] == "month" else 100)
    operator = "greater than or equal to" if error_type == "greater_than_equal" else "less than or equal to"
    constraint = "ge" if error_type == "greater_than_equal" else "le"
    assert body == {"detail": [{
        "type": error_type,
        "loc": location,
        "msg": f"Input should be {operator} {bound}",
        "input": payload[location[-1]],
        "ctx": {constraint: bound},
    }]}


def test_booking_quota_conflict_and_foreign_cancellation(clients):
    client, admin, _ = clients
    owner_id, owner = _student(client, "owner")
    other_id, other = _student(client, "other")
    day = date.today() + timedelta(days=5)
    created = admin.post("/api/admin/slots", json={
        "slot_date": day.isoformat(), "start_time": "10:00", "duration_minutes": 60,
    })
    assert created.status_code == 200
    slot_id = created.json()["slot"]["id"]
    book_path = f"/api/user/slots/{slot_id}/book"
    cancel_path = f"/api/user/slots/{slot_id}/cancel"

    _error(client.post(book_path, cookies=owner), 403,
           "На этот месяц вам ещё не выданы занятия. Обратитесь к преподавателю.")
    for user_id in (owner_id, other_id):
        response = admin.post(f"/api/admin/users/{user_id}/quota", json={
            "year": day.year, "month": day.month, "add": 1,
        })
        assert response.status_code == 200
    assert client.post(book_path, cookies=owner).status_code == 200
    _error(client.post(book_path, cookies=owner), 403,
           "Исчерпан лимит занятий на этот месяц. Обратитесь к преподавателю.")
    _error(client.post(book_path, cookies=other), 409, "Это окно уже занято")
    _error(client.post(cancel_path, cookies=other), 403, "Это не ваша запись")
