"""Offline fail-closed checks; these tests never contact Docker or services."""
import importlib.util
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock

import pytest


path = Path(__file__).resolve().parents[2] / "scripts" / "c224_api_probe.py"
spec = importlib.util.spec_from_file_location("c224_api_probe", path)
probe = importlib.util.module_from_spec(spec)
spec.loader.exec_module(probe)

PG = "postgresql+asyncpg://pymentor_app:secret@127.0.0.1:57152/pymentor_test"
REDIS = "redis://127.0.0.1:57146/0"


@pytest.mark.parametrize("role", ["pymentor_app", "pymentor_test"])
def test_allowed_urls(role):
    probe.validate_urls(PG.replace("pymentor_app", role), REDIS)


@pytest.mark.parametrize("pg,redis", [
    ("", REDIS),
    (PG.replace("127.0.0.1", "localhost"), REDIS),
    (PG.replace("57152", "5432"), REDIS),
    (PG.replace("pymentor_app", "postgres"), REDIS),
    (PG.replace("pymentor_test", "production"), REDIS),
    (PG + "?host=example.com", REDIS),
    (PG, "redis://localhost:57146/0"),
    (PG, "redis://127.0.0.1:6379/0"),
    (PG, "redis://127.0.0.1:57146/1"),
    (PG, "redis://user:secret@127.0.0.1:57146/0"),
    (PG, REDIS + "?socket_connect_timeout=3"),
    (PG, REDIS + "#fragment"),
])
def test_rejects_unsafe_urls_without_echoing_them(pg, redis):
    with pytest.raises(ValueError) as error:
        probe.validate_urls(pg, redis)
    assert "secret" not in str(error.value)


@pytest.mark.parametrize("run_id,opt_in,owner", [
    ("other-run", True, True), (probe.RUN_ID, False, True), (probe.RUN_ID, True, False),
])
def test_requires_run_and_both_explicit_confirmations(run_id, opt_in, owner):
    with pytest.raises(ValueError):
        probe.validate_invocation(run_id, opt_in, owner)


def test_verifies_both_volumes_and_container_states():
    names = {"source_volume": "sv", "restore_volume": "rv",
             "source_container": "sc", "restore_container": "rc"}
    lab = SimpleNamespace(_load=Mock(return_value=("directory", {"phase": "restore-created", "names": names})),
                          _assert_volume=Mock(), _assert_container=Mock())
    probe.verify_lab(lab, probe.RUN_ID)
    assert lab._assert_volume.call_args_list == [(("sv",),), (("rv",),)]
    assert lab._assert_container.call_args_list[0].kwargs == {"require_running": False}
    assert lab._assert_container.call_args_list[1].kwargs == {"require_running": True}


def test_wrong_phase_stops_before_resource_inspection():
    lab = SimpleNamespace(_load=Mock(return_value=("dir", {"phase": "migrated"})),
                          _assert_volume=Mock(), _assert_container=Mock())
    with pytest.raises(ValueError):
        probe.verify_lab(lab, probe.RUN_ID)
    lab._assert_volume.assert_not_called()
    lab._assert_container.assert_not_called()


def test_failed_source_check_never_checks_restore():
    names = {"source_volume": "sv", "restore_volume": "rv", "source_container": "sc", "restore_container": "rc"}
    lab = SimpleNamespace(_load=Mock(return_value=("dir", {"phase": "restore-created", "names": names})),
                          _assert_volume=Mock(), _assert_container=Mock(side_effect=RuntimeError()))
    with pytest.raises(RuntimeError):
        probe.verify_lab(lab, probe.RUN_ID)
    assert lab._assert_volume.call_count == 1
    assert lab._assert_container.call_count == 1


def test_environment_cannot_redirect_libpq_or_enable_notifications():
    env = {"PGHOSTADDR": "remote", "PGSERVICE": "remote", "PGOPTIONS": "unsafe",
           "PYMENTOR_PLATFORM_TELEGRAM_BOT_TOKEN": "secret", "REDIS_URL": "redis://remote",
           "PYMENTOR_COOKIE_SECURE": "1"}
    probe.configure_environment(env)
    assert not any(key.startswith("PG") for key in env)
    assert "PYMENTOR_PLATFORM_TELEGRAM_BOT_TOKEN" not in env
    assert "REDIS_URL" not in env
    assert env["PYMENTOR_LOCAL_NOTIFICATIONS"] == "0"
    assert env["PYMENTOR_COOKIE_SECURE"] == "0"
    first = env["PYMENTOR_TEST_REDIS_PREFIX"]
    probe.configure_environment(env)
    assert env["PYMENTOR_TEST_REDIS_PREFIX"] != first


def test_missing_opt_in_does_not_attempt_lab_or_measurement(monkeypatch):
    measure = Mock()
    monkeypatch.setattr(probe, "measure", measure)
    assert probe.main(["--run-id", probe.RUN_ID, "--owner-verified"]) == 1
    measure.assert_not_called()
