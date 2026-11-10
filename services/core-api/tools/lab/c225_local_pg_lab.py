"""Disposable, loopback-only PostgreSQL 16.15 lab for PYM-189.

This tool deliberately has no delete/reset command. Failed or partial runs are
left in place for inspection; resource identity must match the private journal
before any later operation can touch them.

The loopback connection is intentionally not TLS-protected and is suitable only
for disposable local data. Any future staging use requires TLS and credentials
from an approved secret store.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import secrets
import socket
import subprocess
import sys
import time
from pathlib import Path
from pathlib import PureWindowsPath
from typing import Any
from typing import Mapping
from typing import Sequence


IMAGE = "postgres:16.15@sha256:0cefaabd882e42bcb2a2f3dc56d3ce4770560ba62fd7f197f1a2e008fd5731ab"
PORT = 57152
DATABASE = "pymentor_test"
MIGRATOR = "pymentor_test"
APP_ROLE = "pymentor_app"
ADMIN_ROLE = "pymentor_test_admin"
TASK_LABEL = "com.pymentor.task"
PURPOSE_LABEL = "com.pymentor.purpose"
OWNER_LABEL = "com.pymentor.owner"
TASK_VALUE = "pym-189-c225-local-pg-lab"
PURPOSE_VALUE = "disposable-pg16"
OWNER_VALUE = "pymentor-local-harness"
LABELS = {
    TASK_LABEL: TASK_VALUE,
    PURPOSE_LABEL: PURPOSE_VALUE,
    OWNER_LABEL: OWNER_VALUE,
}
RUN_LABEL = "com.pymentor.run-id"
_RUN_ID = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9-]{7,47}$")


class LabError(RuntimeError):
    """A safe, user-displayable failure without subprocess output or secrets."""


def _run(
    args: Sequence[str], *, input_text: str | None = None, stdout=None
) -> subprocess.CompletedProcess:
    """Run a command without a shell; callers must never place credentials in args."""
    try:
        result = subprocess.run(
            list(args),
            input=input_text,
            text=True,
            stdout=stdout or subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            check=False,
        )
    except OSError as exc:
        raise LabError(f"Could not execute {Path(args[0]).name}.") from exc
    if result.returncode:
        raise LabError(
            f"Command failed: {Path(args[0]).name} (exit {result.returncode})."
        )
    return result


def _docker(*args: str, input_text: str | None = None, stdout=None) -> str:
    result = _run(["docker", *args], input_text=input_text, stdout=stdout)
    return result.stdout or ""


def _secure_directory(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)
    if os.name == "nt":
        account = os.environ.get("USERNAME")
        domain = os.environ.get("USERDOMAIN")
        if not account:
            raise LabError(
                "Cannot determine the current Windows account for the private secret ACL."
            )
        principal = f"{domain}\\{account}" if domain else account
        _run(
            [
                "icacls",
                str(path),
                "/inheritance:r",
                "/grant:r",
                f"{principal}:(OI)(CI)F",
            ]
        )
    else:
        path.chmod(0o700)


def _write_private(path: Path, data: str) -> None:
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL
    fd = os.open(path, flags, 0o600)
    with os.fdopen(fd, "w", encoding="ascii", newline="\n") as stream:
        stream.write(data)


def _atomic_json(path: Path, obj: Mapping[str, Any]) -> None:
    temp = path.with_suffix(".pending")
    if temp.exists():
        raise LabError(
            "A pending state journal exists; inspect the partial run before proceeding."
        )
    with temp.open("x", encoding="utf-8", newline="\n") as stream:
        json.dump(obj, stream, sort_keys=True, indent=2)
        stream.write("\n")
    if os.name != "nt":
        temp.chmod(0o600)
    temp.replace(path)


def _root() -> Path:
    base = os.environ.get("LOCALAPPDATA") or os.environ.get("XDG_STATE_HOME")
    if not base:
        raise LabError(
            "Set LOCALAPPDATA (Windows) or XDG_STATE_HOME for private run state."
        )
    return Path(base) / "Pymentor" / "c225"


def _names(run_id: str) -> dict[str, str]:
    if not _RUN_ID.fullmatch(run_id):
        raise LabError("Run ID must be 8-48 ASCII letters, digits, or hyphens.")
    return {
        "source_container": f"pym189-{run_id}-source",
        "restore_container": f"pym189-{run_id}-restore",
        "source_volume": f"pym189_{run_id}_source_data",
        "restore_volume": f"pym189_{run_id}_restore_data",
    }


def _labels(resource_name: str) -> dict[str, str]:
    if resource_name.startswith("pym189-") and resource_name.endswith(
        ("-source", "-restore")
    ):
        run_id = resource_name[len("pym189-") :].rsplit("-", 1)[0]
    elif resource_name.startswith("pym189_") and resource_name.endswith(
        ("_source_data", "_restore_data")
    ):
        run_id = resource_name[len("pym189_") :].rsplit("_", 2)[0]
    else:
        raise LabError("Resource name does not carry a valid PYM-189 run identity.")
    if not _RUN_ID.fullmatch(run_id):
        raise LabError("Resource name carries an invalid PYM-189 run identity.")
    return {**LABELS, RUN_LABEL: run_id}


def _load(run_id: str) -> tuple[Path, dict[str, Any]]:
    names = _names(run_id)
    directory = _root() / run_id
    journal = directory / "state.json"
    if not journal.is_file():
        raise LabError("No private journal exists for this run ID.")
    try:
        state = json.loads(journal.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise LabError(
            "State journal is unreadable; do not retry or modify resources."
        ) from exc
    if (
        state.get("run_id") != run_id
        or state.get("names") != names
        or state.get("image") != IMAGE
    ):
        raise LabError(
            "State journal identity mismatch; refusing to touch Docker resources."
        )
    return directory, state


def _inspect_container(name: str) -> dict[str, Any]:
    raw = _docker("inspect", name)
    try:
        parsed = json.loads(raw)
        if len(parsed) != 1:
            raise ValueError
        return parsed[0]
    except (ValueError, TypeError, json.JSONDecodeError) as exc:
        raise LabError(
            "Docker returned an unexpected container identity response."
        ) from exc


def _inspect_volume(name: str) -> dict[str, Any]:
    raw = _docker("volume", "inspect", name)
    try:
        parsed = json.loads(raw)
        if len(parsed) != 1:
            raise ValueError
        return parsed[0]
    except (ValueError, TypeError, json.JSONDecodeError) as exc:
        raise LabError(
            "Docker returned an unexpected volume identity response."
        ) from exc


def _assert_volume(name: str) -> None:
    volume = _inspect_volume(name)
    if volume.get("Name") != name or any(
        volume.get("Labels", {}).get(k) != v for k, v in _labels(name).items()
    ):
        raise LabError("Volume name or task labels do not match this disposable run.")


def _normalized_bind_source(source: str) -> str:
    # Docker Desktop's Linux daemon reports Windows drive mounts under this prefix.
    prefix = "/run/desktop/mnt/host/"
    if os.name == "nt" and source.lower().startswith(prefix):
        parts = source[len(prefix) :].split("/")
        if len(parts) > 1 and len(parts[0]) == 1 and parts[0].isalpha():
            source = str(PureWindowsPath(parts[0] + ":/", *parts[1:]))
    return os.path.normcase(os.path.normpath(source.replace("/", os.sep)))


def _assert_container(
    name: str, volume: str, secret_dir: Path, *, require_running: bool | None = None
) -> dict[str, Any]:
    item = _inspect_container(name)
    config = item.get("Config", {})
    if item.get("Name") != f"/{name}" or config.get("Image") != IMAGE:
        raise LabError(
            "Container name or pinned image reference does not match this run."
        )
    image = json.loads(_docker("image", "inspect", IMAGE))
    pinned_digest = IMAGE.split("@", 1)[1]
    if (
        len(image) != 1
        or item.get("Image") != image[0].get("Id")
        or not any(
            ref.endswith("@" + pinned_digest)
            for ref in (image[0].get("RepoDigests") or [])
        )
    ):
        raise LabError(
            "Container image ID or registry digest does not match the pinned PostgreSQL digest."
        )
    labels = config.get("Labels", {}) or {}
    if any(labels.get(k) != v for k, v in _labels(name).items()):
        raise LabError("Container task labels do not match this disposable run.")
    if (
        require_running is not None
        and bool(item.get("State", {}).get("Running")) != require_running
    ):
        raise LabError(
            "Container running state is not the expected state for this operation."
        )
    mounts = item.get("Mounts", [])
    actual = {
        (
            m.get("Type"),
            m.get("Name") or m.get("Source"),
            m.get("Destination"),
            bool(m.get("RW")),
        )
        for m in mounts
    }
    expected = {
        ("volume", volume, "/var/lib/postgresql/data", True),
        ("bind", str(secret_dir.resolve()), "/run/secrets", False),
    }
    bind_actual = next((entry for entry in actual if entry[0] == "bind"), None)
    bind_expected = next((entry for entry in expected if entry[0] == "bind"), None)
    if bind_actual and bind_expected:
        actual.remove(bind_actual)
        expected.remove(bind_expected)
        actual.add(
            (
                bind_actual[0],
                _normalized_bind_source(str(bind_actual[1])),
                *bind_actual[2:],
            )
        )
        expected.add(
            (
                bind_expected[0],
                _normalized_bind_source(str(bind_expected[1])),
                *bind_expected[2:],
            )
        )
    if actual != expected:
        raise LabError(
            "Container mounts differ from the exact expected data volume and private secret directory."
        )
    if item.get("State", {}).get("Running"):
        bindings = (
            item.get("NetworkSettings", {}).get("Ports", {}).get("5432/tcp", []) or []
        )
    else:
        bindings = (
            item.get("HostConfig", {}).get("PortBindings", {}).get("5432/tcp", []) or []
        )
    if (
        len(bindings) != 1
        or bindings[0].get("HostIp") != "127.0.0.1"
        or bindings[0].get("HostPort") != str(PORT)
    ):
        raise LabError("Container is not bound exclusively to 127.0.0.1:57152.")
    return item


def _free_port() -> None:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        try:
            sock.bind(("127.0.0.1", PORT))
        except OSError as exc:
            raise LabError(
                "127.0.0.1:57152 is occupied; no Docker resource was changed."
            ) from exc


def _create_volume(name: str) -> None:
    labels = _labels(name)
    _docker(
        "volume",
        "create",
        *(
            arg
            for pair in labels.items()
            for arg in ("--label", f"{pair[0]}={pair[1]}")
        ),
        name,
    )
    _assert_volume(name)


def _resource_names(kind: str) -> set[str]:
    if kind == "container":
        raw = _docker("ps", "--all", "--format", "{{.Names}}")
    else:
        raw = _docker("volume", "ls", "--format", "{{.Name}}")
    return {line.strip().lstrip("/") for line in raw.splitlines() if line.strip()}


def _run_container(name: str, volume: str, directory: Path) -> None:
    labels = _labels(name)
    _docker(
        "run",
        "--detach",
        "--name",
        name,
        *(
            arg
            for pair in labels.items()
            for arg in ("--label", f"{pair[0]}={pair[1]}")
        ),
        "--publish",
        f"127.0.0.1:{PORT}:5432",
        "--mount",
        f"type=volume,src={volume},dst=/var/lib/postgresql/data,volume-nocopy",
        "--mount",
        f"type=bind,src={directory.resolve()},dst=/run/secrets,readonly",
        "--env",
        "POSTGRES_DB=pymentor_test",
        "--env",
        f"POSTGRES_USER={ADMIN_ROLE}",
        "--env",
        "POSTGRES_PASSWORD_FILE=/run/secrets/bootstrap_password",
        "--restart",
        "no",
        IMAGE,
    )
    _assert_container(name, volume, directory, require_running=True)


def _read_secret(directory: Path, filename: str) -> str:
    try:
        value = (directory / filename).read_text(encoding="ascii").strip()
    except OSError as exc:
        raise LabError(f"Required private secret {filename} is missing.") from exc
    if not re.fullmatch(r"[0-9a-f]{64}", value):
        raise LabError(f"Private secret {filename} has an unexpected format.")
    return value


def _psql(directory: Path, container: str, sql: str) -> None:
    _docker(
        "exec",
        "-i",
        container,
        "psql",
        "-v",
        "ON_ERROR_STOP=1",
        "-U",
        ADMIN_ROLE,
        "-d",
        DATABASE,
        input_text=sql,
    )


def _role_sql(directory: Path) -> str:
    mig = _read_secret(directory, "migrator_password")
    app = _read_secret(directory, "app_password")
    return f"""
CREATE ROLE {MIGRATOR} LOGIN PASSWORD '{mig}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;
CREATE ROLE {APP_ROLE} LOGIN PASSWORD '{app}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;
REVOKE CONNECT, TEMPORARY ON DATABASE {DATABASE} FROM PUBLIC;
GRANT CONNECT ON DATABASE {DATABASE} TO {MIGRATOR}, {APP_ROLE};
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE, CREATE ON SCHEMA public TO {MIGRATOR};
GRANT USAGE ON SCHEMA public TO {APP_ROLE};
"""


def _app_grant_sql() -> str:
    return f"""
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO {APP_ROLE};
REVOKE INSERT, UPDATE, DELETE ON TABLE public.alembic_version FROM {APP_ROLE};
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO {APP_ROLE};
ALTER DEFAULT PRIVILEGES FOR ROLE {MIGRATOR} IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO {APP_ROLE};
ALTER DEFAULT PRIVILEGES FOR ROLE {MIGRATOR} IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO {APP_ROLE};
"""


def _write_pgpass(directory: Path, run_id: str) -> None:
    # Generated passwords are hex, so the standard pgpass escaping rules do not apply.
    # Database tools run inside the container and connect to its own loopback:5432.
    content = (
        f"127.0.0.1:5432:{DATABASE}:{MIGRATOR}:{_read_secret(directory, 'migrator_password')}\n"
        f"127.0.0.1:5432:{DATABASE}:{APP_ROLE}:{_read_secret(directory, 'app_password')}\n"
    )
    _write_private(directory / "pgpass", content)


def _validate_archive(data: bytes) -> None:
    if len(data) <= 5 or data[:5] != b"PGDMP":
        raise LabError("Archive is empty or not a PostgreSQL custom-format archive.")


def _restore_stream(directory: Path, container: str, archive: Path) -> None:
    args = [
        "docker",
        "exec",
        "-i",
        "--env",
        "PGPASSFILE=/run/secrets/pgpass",
        container,
        "pg_restore",
        "--exit-on-error",
        "--no-owner",
        "--no-privileges",
        "--host",
        "127.0.0.1",
        "--port",
        "5432",
        "--username",
        MIGRATOR,
        "--dbname",
        DATABASE,
    ]
    try:
        process = subprocess.Popen(
            args,
            stdin=subprocess.PIPE,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        assert process.stdin is not None
        with archive.open("rb") as stream:
            while chunk := stream.read(1024 * 1024):
                process.stdin.write(chunk)
        process.stdin.close()
        code = process.wait()
    except OSError as exc:
        raise LabError("Could not stream the archive to pg_restore.") from exc
    if code:
        raise LabError(
            "pg_restore failed; target is partial and must not be retried or overwritten."
        )


def _verify_identity_query(directory: Path, container: str) -> None:
    # psql connects through the container's local Unix socket; inet_* is NULL there.
    sql = "SELECT current_database(), current_user;\n"
    result = _docker(
        "exec",
        "-i",
        container,
        "psql",
        "-A",
        "-t",
        "-F",
        "|",
        "-U",
        ADMIN_ROLE,
        "-d",
        DATABASE,
        input_text=sql,
    ).strip()
    if result != f"{DATABASE}|{ADMIN_ROLE}":
        raise LabError(
            "PostgreSQL server identity did not match the expected disposable database/admin."
        )


def _await_ready(container: str, volume: str, directory: Path) -> None:
    # Bounded read-only readiness polling; mutating commands are never retried.
    deadline = time.monotonic() + 60
    while time.monotonic() < deadline:
        _assert_container(container, volume, directory, require_running=True)
        try:
            _docker("exec", container, "pg_isready", "-U", ADMIN_ROLE, "-d", DATABASE)
            # The image starts a temporary server during initialization, then restarts it.
            # Require two successful identity queries before issuing any mutating SQL.
            _verify_identity_query(directory, container)
            time.sleep(1)
            _verify_identity_query(directory, container)
            return
        except LabError:
            time.sleep(1)
    raise LabError(
        "PostgreSQL did not become ready within 60 seconds; inspect the partial run."
    )


def _state_update(
    directory: Path, state: dict[str, Any], phase: str, **extra: Any
) -> None:
    state.update(extra)
    state["phase"] = phase
    _atomic_json(directory / "state.json", state)


def create(run_id: str) -> None:
    names = _names(run_id)
    directory = _root() / run_id
    if directory.exists():
        raise LabError(
            "Run directory already exists. Inspect its state; do not overwrite or retry blindly."
        )
    _free_port()
    # Names are checked read-only before journal or Docker mutation.
    if names["source_container"] in _resource_names("container"):
        raise LabError(
            f"A resource named {names['source_container']} already exists; choose another run ID."
        )
    if names["source_volume"] in _resource_names("volume"):
        raise LabError(
            f"A resource named {names['source_volume']} already exists; choose another run ID."
        )
    _secure_directory(directory)
    state: dict[str, Any] = {
        "version": 1,
        "run_id": run_id,
        "names": names,
        "image": IMAGE,
        "database": DATABASE,
        "migrator": MIGRATOR,
        "app_role": APP_ROLE,
        "port": PORT,
        "phase": "planned",
    }
    _atomic_json(directory / "state.json", state)
    try:
        for filename in ("bootstrap_password", "migrator_password", "app_password"):
            _write_private(directory / filename, secrets.token_hex(32))
        _write_pgpass(directory, run_id)
        _create_volume(names["source_volume"])
        _state_update(directory, state, "source-volume-created")
        _run_container(names["source_container"], names["source_volume"], directory)
        _state_update(directory, state, "source-running")
        _await_ready(names["source_container"], names["source_volume"], directory)
        _verify_identity_query(directory, names["source_container"])
        _psql(directory, names["source_container"], _role_sql(directory))
        _state_update(directory, state, "roles-created")
    except LabError:
        _state_update(directory, state, "partial-failure")
        raise
    print(
        f"Created disposable source: {names['source_container']} on 127.0.0.1:{PORT}. Secrets and state: {directory}"
    )


def _migration_url(directory: Path) -> str:
    return f"postgresql+asyncpg://{MIGRATOR}:{_read_secret(directory, 'migrator_password')}@127.0.0.1:{PORT}/{DATABASE}"


def migrate(run_id: str) -> None:
    directory, state = _load(run_id)
    if state.get("phase") != "roles-created":
        raise LabError(
            "Migration is allowed only once after verified role creation; inspect partial runs manually."
        )
    _assert_volume(state["names"]["source_volume"])
    _assert_container(
        state["names"]["source_container"],
        state["names"]["source_volume"],
        directory,
        require_running=True,
    )
    _verify_identity_query(directory, state["names"]["source_container"])
    env = os.environ.copy()
    env["PYMENTOR_MIGRATION_URL"] = _migration_url(directory)
    backend = Path(__file__).resolve().parents[4] / "services" / "core-api"
    result = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        cwd=backend,
        env=env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False,
    )
    if result.returncode:
        _state_update(directory, state, "migration-failed")
        raise LabError(
            "Alembic failed; no automatic retry is allowed. Inspect migration state before recovery."
        )
    _assert_container(
        state["names"]["source_container"],
        state["names"]["source_volume"],
        directory,
        require_running=True,
    )
    _verify_identity_query(directory, state["names"]["source_container"])
    _psql(directory, state["names"]["source_container"], _app_grant_sql())
    _state_update(directory, state, "migrated")
    print(
        "Migrations completed and app DML grants applied to the verified disposable database."
    )


def backup(run_id: str) -> None:
    directory, state = _load(run_id)
    if state.get("phase") != "migrated":
        raise LabError(
            "Backup requires a completed migration phase; no implicit retry is allowed."
        )
    name = state["names"]["source_container"]
    _assert_volume(state["names"]["source_volume"])
    _assert_container(
        name, state["names"]["source_volume"], directory, require_running=True
    )
    _verify_identity_query(directory, name)
    archive = directory / "source.dump"
    if archive.exists():
        raise LabError("Archive already exists; refusing to overwrite it.")
    env_args = ("--env", "PGPASSFILE=/run/secrets/pgpass")
    try:
        with archive.open("xb") as stream:
            _docker(
                "exec",
                *env_args,
                name,
                "pg_dump",
                "--host",
                "127.0.0.1",
                "--port",
                "5432",
                "--format=custom",
                "--username",
                APP_ROLE,
                "--dbname",
                DATABASE,
                stdout=stream,
            )
        data = archive.read_bytes()
        _validate_archive(data)
    except Exception:
        # Keep partial output for forensic inspection. Never overwrite or retry it.
        _state_update(directory, state, "backup-failed")
        raise
    digest = hashlib.sha256(data).hexdigest()
    _state_update(
        directory,
        state,
        "backup-ready",
        archive="source.dump",
        archive_sha256=digest,
        archive_bytes=len(data),
    )
    print(
        f"Custom archive recorded outside the repository: {archive} ({len(data)} bytes, sha256 {digest})."
    )


def restore(run_id: str) -> None:
    directory, state = _load(run_id)
    if state.get("phase") not in {"backup-ready", "restore-stopping-source"}:
        raise LabError(
            "Restore requires exactly one recorded backup; partial or prior restores need manual review."
        )
    archive = directory / "source.dump"
    if not archive.is_file() or archive.stat().st_size <= 5:
        raise LabError("Recorded archive is missing or empty.")
    data = archive.read_bytes()
    try:
        _validate_archive(data)
    except LabError as exc:
        raise LabError("Recorded archive is invalid; refusing restore.") from exc
    if hashlib.sha256(data).hexdigest() != state.get("archive_sha256"):
        raise LabError(
            "Archive header or recorded checksum mismatch; refusing restore."
        )
    names = state["names"]
    _assert_volume(names["source_volume"])
    resuming_stopped = state["phase"] == "restore-stopping-source"
    _assert_container(
        names["source_container"],
        names["source_volume"],
        directory,
        require_running=not resuming_stopped,
    )
    if names["restore_container"] in _resource_names("container"):
        raise LabError(
            f"Restore target {names['restore_container']} already exists; never overwrite an existing target."
        )
    if names["restore_volume"] in _resource_names("volume"):
        raise LabError(
            f"Restore target {names['restore_volume']} already exists; never overwrite an existing target."
        )
    if not resuming_stopped:
        _state_update(directory, state, "restore-stopping-source")
        _assert_container(
            names["source_container"],
            names["source_volume"],
            directory,
            require_running=True,
        )
        _docker("stop", names["source_container"])
    _assert_container(
        names["source_container"],
        names["source_volume"],
        directory,
        require_running=False,
    )
    _state_update(directory, state, "source-stopped")
    _free_port()
    try:
        _create_volume(names["restore_volume"])
        _state_update(directory, state, "restore-volume-created")
        _run_container(names["restore_container"], names["restore_volume"], directory)
        _await_ready(names["restore_container"], names["restore_volume"], directory)
        _verify_identity_query(directory, names["restore_container"])
        _psql(directory, names["restore_container"], _role_sql(directory))
        _restore_stream(directory, names["restore_container"], archive)
        _psql(directory, names["restore_container"], _app_grant_sql())
    except LabError:
        _state_update(directory, state, "restore-failed")
        raise
    _state_update(directory, state, "restore-created")
    print(
        "Restore container created; inspect it and verify application data manually before using it."
    )


def status(run_id: str) -> None:
    directory, state = _load(run_id)
    for side in ("source", "restore"):
        container, volume = (
            state["names"][f"{side}_container"],
            state["names"][f"{side}_volume"],
        )
        try:
            _assert_volume(volume)
            _assert_container(container, volume, directory)
            print(f"{side}: identity verified")
        except LabError:
            print(f"{side}: absent or identity check failed; no resources were changed")
    print(f"journal phase: {state.get('phase')}")


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "action", choices=("create", "migrate", "backup", "restore", "status")
    )
    parser.add_argument("run_id")
    args = parser.parse_args(argv)
    try:
        {
            "create": create,
            "migrate": migrate,
            "backup": backup,
            "restore": restore,
            "status": status,
        }[args.action](args.run_id)
    except LabError as exc:
        print(f"BLOCKED: {exc}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
