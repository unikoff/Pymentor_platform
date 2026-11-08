"""Offline checks: no Docker, databases, network or child processes."""
import importlib.util
from pathlib import Path
import subprocess
import sys
from types import SimpleNamespace
from unittest.mock import Mock

import pytest


scripts = Path(__file__).resolve().parents[4] / "services/core-api/tools/lab"
sys.path.insert(0, str(scripts))
spec = importlib.util.spec_from_file_location("c224_process_load", scripts / "c224_process_load.py")
load = importlib.util.module_from_spec(spec)
spec.loader.exec_module(load)


@pytest.fixture(autouse=True)
def no_network_metrics(monkeypatch):
    monkeypatch.setattr(load, "read_pool_metrics", lambda roots: None)


def test_explicit_flags_stop_before_lab(monkeypatch):
    check = Mock()
    monkeypatch.setattr(load.probe, "verify_lab", check)
    assert load.main(["--run-id", "valid-run-123"]) == 1
    check.assert_not_called()


def test_validates_identity_and_urls_before_execution(monkeypatch):
    validate_urls = Mock(side_effect=ValueError("invalid"))
    monkeypatch.setattr(load.probe, "validate_urls", validate_urls)
    with pytest.raises(load.lab.LabError):
        load.validate("invalid", True, True, "pg", "redis")
    validate_urls.assert_not_called()
    with pytest.raises(ValueError):
        load.validate("valid-run-123", True, True, "pg", "redis")
    validate_urls.assert_called_once_with("pg", "redis")


def test_unsupported_os_fails_closed_before_lab(monkeypatch):
    monkeypatch.setattr(load.probe, "validate_urls", Mock())
    monkeypatch.setattr(load.os, "name", "unsupported")
    with pytest.raises(ValueError, match="unsupported"):
        load.validate("valid-run-123", True, True, "pg", "redis")


def test_env_is_allowlisted_and_prefix_shared():
    env = load.child_environment({"PATH": "path", "PGHOSTADDR": "remote", "DATABASE_URL": "remote",
                                  "PYMENTOR_PLATFORM_TELEGRAM_BOT_TOKEN": "secret",
                                  "PYMENTOR_TEST_PG_URL": "pg", "PYMENTOR_TEST_REDIS_URL": "redis"}, "unique:")
    assert env["PYMENTOR_TEST_REDIS_PREFIX"] == "unique:"
    assert env["PYMENTOR_LOCAL_NOTIFICATIONS"] == "0"
    assert not {"PGHOSTADDR", "DATABASE_URL", "PYMENTOR_PLATFORM_TELEGRAM_BOT_TOKEN"} & env.keys()


def test_lab_checks_both_sides_and_stops_on_failure():
    names = {"source_volume": "sv", "restore_volume": "rv", "source_container": "sc", "restore_container": "rc"}
    lab = SimpleNamespace(_load=Mock(return_value=("directory", {"phase": "restore-created", "names": names})),
                          _assert_volume=Mock(), _assert_container=Mock())
    load.probe.verify_lab(lab, "valid-run-123")
    assert [call.kwargs["require_running"] for call in lab._assert_container.call_args_list] == [False, True]
    lab._assert_container.reset_mock(side_effect=True)
    lab._assert_container.side_effect = RuntimeError()
    with pytest.raises(RuntimeError):
        load.probe.verify_lab(lab, "valid-run-123")
    assert lab._assert_container.call_count == 1


def test_repetitions_process_counts_shared_env_and_cleanup_on_failure(monkeypatch):
    env = {"PYMENTOR_TEST_REDIS_PREFIX": "unique:"}
    seen, cleaned = [], []
    def start(count, supplied, children):
        assert supplied is env
        seen.append(count)
        children.extend([Mock(poll=Mock(return_value=None), stderr=None) for _ in range(count)])
        return ["root"] * count
    monkeypatch.setattr(load, "start_processes", start)
    monkeypatch.setattr(load, "wait_ready", lambda *args: None)
    auth = Mock(return_value="cookie")
    monkeypatch.setattr(load, "authenticate", auth)
    measure = Mock(side_effect=[{"errors": 0}] * 3 + [RuntimeError()])
    monkeypatch.setattr(load, "measure", measure)
    monkeypatch.setattr(load, "cleanup", lambda children: cleaned.append(len(children)))
    with pytest.raises(RuntimeError):
        load.run(env)
    assert seen == [1, 2] and cleaned == [1, 2]
    assert auth.call_args_list[0].kwargs == {"register": True}
    assert auth.call_args_list[1].kwargs == {"register": False}
    assert auth.call_args_list[0].args[1:3] == auth.call_args_list[1].args[1:3]


def test_cleanup_only_owned_processes_and_escalates_timeout():
    child = Mock()
    child.poll.return_value = None
    child.wait.side_effect = [subprocess.TimeoutExpired("child", 5), 0]
    load.cleanup([child])
    child.terminate.assert_called_once()
    child.kill.assert_called_once()
    assert child.wait.call_count == 2


def test_measure_distributes_requests_and_counts_errors(monkeypatch):
    def request(client, url, body=None, cookie=None):
        assert cookie == "session=synthetic"
        return 200 if url.startswith("first") else 503
    monkeypatch.setattr(load, "request", request)
    result = load.measure(["first", "second"], "session=synthetic")
    assert result["requests"] == 96 and result["errors"] == 48
    assert 0 <= result["p50_ms"] <= result["p95_ms"] <= result["p99_ms"]
    assert result["throughput_rps"] > 0


def test_mixed_profile_sends_every_route_to_both_processes(monkeypatch):
    observed = []
    def request(client, url, body=None, cookie=None):
        observed.append(url)
        return 200
    monkeypatch.setattr(load, "request", request)
    result = load.measure(["first", "second"], "session=synthetic", profile="mixed")
    assert result["errors"] == 0
    assert all(route["requests"] == 24 for route in result["routes"].values())
    for root in ("first", "second"):
        assert sum(url.startswith(root) for url in observed) == 48
        assert sum(url.startswith(root) and "/api/learning/catalog" in url for url in observed) == 12


def test_admin_profile_is_balanced_between_processes(monkeypatch):
    observed = []
    monkeypatch.setattr(load, "request", lambda client, url, body=None, cookie=None: (observed.append(url), 200)[1])
    result = load.measure(["first", "second"], "session=synthetic", profile="admin")
    assert result["errors"] == 0
    assert all(route["requests"] == 48 for route in result["routes"].values())
    for root in ("first", "second"):
        assert sum(url.startswith(root) and "/api/admin/users" in url for url in observed) == 24


def test_pool_summary_distinguishes_exhaustion_from_new_connections():
    result = load.summarize_pool_metrics({
        "sync": [{"ms": 3.0, "exhausted": False, "failed": False},
                 {"ms": 10.0, "exhausted": True, "failed": False}],
        "async": [{"ms": 3000.0, "exhausted": True, "failed": True}],
    })
    assert result["sync"]["acquisitions"] == 2 and result["sync"]["exhausted_at_start"] == 1
    assert result["sync"]["exhausted_max_ms"] == 10.0
    assert result["async"]["failed"] == 1
