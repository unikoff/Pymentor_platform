"""Safety boundary tests for the PYM-189 disposable PostgreSQL harness."""

from __future__ import annotations

import json
import importlib.util
import socket
from pathlib import Path

import pytest

spec = importlib.util.spec_from_file_location(
    "c225_local_pg_lab", Path(__file__).resolve().parents[2] / "scripts" / "c225_local_pg_lab.py"
)
lab = importlib.util.module_from_spec(spec)
spec.loader.exec_module(lab)


def _container(*, secret_dir, labels=None, mounts=None, bindings=None):
    return {
        "Name": "/pym189-run-12345-source",
        "Image": "sha256:image-id",
        "Config": {"Image": lab.IMAGE, "Labels": labels or lab._labels("pym189-run-12345-source")},
        "State": {"Running": True},
        "Mounts": mounts if mounts is not None else [
            {"Type": "volume", "Name": "pym189_run-12345_source_data",
             "Destination": "/var/lib/postgresql/data", "RW": True},
            {"Type": "bind", "Source": str(secret_dir.resolve()), "Destination": "/run/secrets", "RW": False},
        ],
        "NetworkSettings": {"Ports": bindings if bindings is not None else {
            "5432/tcp": [{"HostIp": "127.0.0.1", "HostPort": str(lab.PORT)}]}},
    }


def _mock_image(monkeypatch):
    monkeypatch.setattr(lab, "_docker", lambda *args, **kwargs: json.dumps([{
        "Id": "sha256:image-id", "RepoDigests": ["postgres@" + lab.IMAGE.split("@", 1)[1]]
    }]))


def test_refuses_container_with_foreign_task_label(monkeypatch):
    secret_dir = Path(r"C:\private\run")
    item = _container(secret_dir=secret_dir)
    item["Config"]["Labels"][lab.TASK_LABEL] = "someone-elses-run"
    monkeypatch.setattr(lab, "_inspect_container", lambda name: item)
    _mock_image(monkeypatch)

    with pytest.raises(lab.LabError, match="labels"):
        lab._assert_container("pym189-run-12345-source", "pym189_run-12345_source_data", secret_dir)


def test_refuses_unexpected_data_mount(monkeypatch):
    secret_dir = Path(r"C:\private\run")
    item = _container(secret_dir=secret_dir)
    item["Mounts"][0]["Name"] = "existing-user-volume"
    monkeypatch.setattr(lab, "_inspect_container", lambda name: item)
    _mock_image(monkeypatch)

    with pytest.raises(lab.LabError, match="mounts"):
        lab._assert_container("pym189-run-12345-source", "pym189_run-12345_source_data", secret_dir)


def test_refuses_non_loopback_or_wrong_port_binding(monkeypatch):
    secret_dir = Path(r"C:\private\run")
    item = _container(secret_dir=secret_dir, bindings={"5432/tcp": [{"HostIp": "0.0.0.0", "HostPort": str(lab.PORT)}]})
    monkeypatch.setattr(lab, "_inspect_container", lambda name: item)
    _mock_image(monkeypatch)

    with pytest.raises(lab.LabError, match="127.0.0.1:57152"):
        lab._assert_container("pym189-run-12345-source", "pym189_run-12345_source_data", secret_dir)


def test_stopped_container_uses_configured_loopback_binding(monkeypatch):
    secret_dir = Path(r"C:\private\run")
    item = _container(secret_dir=secret_dir)
    item["State"]["Running"] = False
    item["HostConfig"] = {"PortBindings": item["NetworkSettings"]["Ports"]}
    item["NetworkSettings"]["Ports"] = {}
    monkeypatch.setattr(lab, "_inspect_container", lambda name: item)
    _mock_image(monkeypatch)
    lab._assert_container("pym189-run-12345-source", "pym189_run-12345_source_data", secret_dir, require_running=False)
    item["HostConfig"]["PortBindings"]["5432/tcp"][0]["HostIp"] = "0.0.0.0"
    with pytest.raises(lab.LabError, match="127.0.0.1:57152"):
        lab._assert_container("pym189-run-12345-source", "pym189_run-12345_source_data", secret_dir, require_running=False)


def test_fails_when_fixed_loopback_port_is_occupied(monkeypatch):
    class OccupiedSocket:
        def __enter__(self):
            return self

        def __exit__(self, *_):
            return False

        def bind(self, address):
            raise OSError("in use")

    monkeypatch.setattr(lab.socket, "socket", lambda *args, **kwargs: OccupiedSocket())
    with pytest.raises(lab.LabError, match="occupied"):
        lab._free_port()


@pytest.mark.parametrize("data", [b"", b"abcde", b"NOTPGDMP"])
def test_rejects_empty_or_invalid_custom_archive(data):
    with pytest.raises(lab.LabError, match="custom-format"):
        lab._validate_archive(data)


def test_role_sql_keeps_migrator_and_app_separate_and_restricted(monkeypatch):
    monkeypatch.setattr(lab, "_read_secret", lambda _directory, filename: "a" * 64 if filename.startswith("migrator") else "b" * 64)

    sql = lab._role_sql(Path("unused-private-dir"))

    assert "CREATE ROLE pymentor_test LOGIN" in sql
    assert "CREATE ROLE pymentor_app LOGIN" in sql
    assert "NOSUPERUSER NOCREATEDB NOCREATEROLE" in sql
    assert "GRANT USAGE, CREATE ON SCHEMA public TO pymentor_test" in sql
    assert "GRANT USAGE ON SCHEMA public TO pymentor_app" in sql
    assert "GRANT CONNECT ON DATABASE pymentor_test TO pymentor_test, pymentor_app" in sql
    assert "GRANT CREATE ON SCHEMA public TO pymentor_app" not in sql
    assert "SUPERUSER" not in sql.replace("NOSUPERUSER", "")


def test_app_grants_are_dml_only_and_default_to_migrator_owned_objects():
    sql = lab._app_grant_sql()

    assert "GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO pymentor_app" in sql
    assert "REVOKE INSERT, UPDATE, DELETE ON TABLE public.alembic_version FROM pymentor_app" in sql
    assert "GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO pymentor_app" in sql
    assert "ALTER DEFAULT PRIVILEGES FOR ROLE pymentor_test IN SCHEMA public" in sql
    assert "GRANT CREATE" not in sql
    assert "ALTER" in sql  # only default grant policy; app receives no DDL capability
