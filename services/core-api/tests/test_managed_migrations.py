"""Exercise migration target validation through the real Alembic CLI."""
import os
from pathlib import Path
import subprocess
import sys

import pytest

ROOT = Path(__file__).resolve().parents[3]


def migration_env():
    env = os.environ.copy()
    for key in tuple(env):
        if key.startswith("KNOWI_MIGRATION_") or key == "PYMENTOR_MIGRATION_URL":
            env.pop(key)
    env.update(
        PYTHONDONTWRITEBYTECODE="1",
        KNOWI_MIGRATION_URL="postgresql+asyncpg://migration:do-not-log-this@postgres.internal/core",
        KNOWI_MIGRATION_HOST="postgres.internal",
        KNOWI_MIGRATION_DATABASE="core",
        KNOWI_MIGRATION_USER="migration",
    )
    return env


def cli(env, config="services/core-api/alembic-runtime.ini"):
    return subprocess.run([sys.executable, "-m", "alembic", "-c", config,
                           "upgrade", "head", "--sql"], cwd=ROOT, env=env,
                          capture_output=True, text=True, timeout=25)


def test_runtime_migrations_render_all_history_without_application_config():
    env = migration_env()
    env["DATABASE_URL"] = "sqlite:///must-not-be-read.db"
    result = cli(env)
    assert result.returncode == 0, result.stderr
    assert "CREATE TABLE users" in result.stdout
    assert "CREATE TABLE email_change_requests" in result.stdout
    assert "do-not-log-this" not in result.stdout + result.stderr


@pytest.mark.parametrize("field,value", [
    ("KNOWI_MIGRATION_URL", ""),
    ("KNOWI_MIGRATION_URL", "sqlite:///:memory:"),
    ("KNOWI_MIGRATION_URL", "postgresql+asyncpg://migration:p@other/core"),
    ("KNOWI_MIGRATION_DATABASE", "different"),
    ("KNOWI_MIGRATION_USER", ""),
    ("KNOWI_MIGRATION_HOST", ""),
])
def test_runtime_migration_identity_mismatch_fails_before_emitting_ddl(field, value):
    env = migration_env()
    env[field] = value
    result = cli(env)
    assert result.returncode != 0
    assert "CREATE TABLE" not in result.stdout
    assert "do-not-log-this" not in result.stderr


def test_legacy_lab_configuration_does_not_accept_runtime_credentials():
    result = cli(migration_env(), "services/core-api/alembic.ini")
    assert result.returncode != 0
    assert "PYMENTOR_MIGRATION_URL is required" in result.stderr
    assert "CREATE TABLE" not in result.stdout
