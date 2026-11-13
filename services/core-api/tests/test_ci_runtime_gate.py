from pathlib import Path
import os
import subprocess
import sys

import pytest

from scripts.ci.check_single_runtime import scan_package
from scripts.ci.preview_checks import require_test_results, run


def test_canonical_package_passes_runtime_retirement_scan():
    root = Path(__file__).resolve().parents[1] / "pymentor_core"
    assert scan_package(root) == []


@pytest.mark.parametrize("source", [
    "import sqlite3\n", "from pymentor_core.adapters.legacy_sqlite.sessions import SqlSessionRepository\n",
    "DATABASE_URL = 'sqlite:///:memory:'\n",
    "import importlib\nimportlib.import_module('sqlite3')\n",
    "DATABASE_URL = 'sqlite+pysqlite:///runtime.db'\n",
])
def test_gate_rejects_reintroduced_sqlite_runtime(tmp_path, source):
    package = tmp_path / "pymentor_core"
    (package / "app").mkdir(parents=True)
    (package / "app" / "bad.py").write_text(source, encoding="utf-8")
    assert scan_package(package)


@pytest.mark.parametrize("attributes", [
    'tests="0" failures="0" errors="0" skipped="0"',
    'tests="1" failures="0" errors="0" skipped="1"',
    'tests="1" failures="1" errors="0" skipped="0"',
])
def test_gate_refuses_empty_skipped_or_failed_critical_result(tmp_path, attributes):
    report = tmp_path / "result.xml"
    report.write_text(f"<testsuites><testsuite {attributes}/></testsuites>", encoding="utf-8")
    with pytest.raises(RuntimeError):
        require_test_results(report)


def test_gate_accepts_executed_green_result(tmp_path):
    report = tmp_path / "result.xml"
    report.write_text('<testsuites><testsuite tests="3" failures="0" errors="0" skipped="0"/></testsuites>', encoding="utf-8")
    require_test_results(report)


def test_failed_critical_child_propagates_nonzero_exit():
    with pytest.raises(subprocess.CalledProcessError) as error:
        run([sys.executable, "-c", "raise SystemExit(23)"], os.environ.copy())
    assert error.value.returncode == 23
