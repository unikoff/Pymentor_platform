"""Retired importers and executable SQLite fixtures must not return."""
from pathlib import Path

from scripts.ci.check_single_runtime import scan_retired_sources


def test_repository_has_no_retired_sqlite_source():
    assert scan_retired_sources(Path(__file__).resolve().parents[3]) == []


def test_guard_finds_sqlite_fixture_outside_runtime(tmp_path):
    target = tmp_path / "services/core-api/tests/regression/test_old.py"
    target.parent.mkdir(parents=True)
    target.write_text("from sqlalchemy import create_engine\nengine = create_engine('sqlite://')\n")
    assert scan_retired_sources(tmp_path)


def test_guard_finds_dynamic_sqlite_import_and_orphaned_importer(tmp_path):
    target = tmp_path / "services/core-api/tools/migration/forgotten.py"
    target.parent.mkdir(parents=True)
    target.write_text("import importlib\nimportlib.import_module('sqlite3')\n")
    assert scan_retired_sources(tmp_path)


def test_course_content_and_negative_dsn_checks_are_allowed(tmp_path):
    course = tmp_path / "backend/content/lesson.py"
    course.parent.mkdir(parents=True)
    course.write_text("import sqlite3\n")
    checks = tmp_path / "services/core-api/tests/test_settings.py"
    checks.parent.mkdir(parents=True)
    checks.write_text("INVALID_URL = 'sqlite:///:memory:'\n")
    assert scan_retired_sources(tmp_path) == []
