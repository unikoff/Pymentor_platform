"""Synthetic architecture checks, independent of application imports."""
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[2] / "tools/check_architecture.py"
SPEC = importlib.util.spec_from_file_location("check_architecture", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
checker = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = checker
SPEC.loader.exec_module(checker)


class ArchitectureCheckTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name) / "pymentor_core"

    def write(self, name, text):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")

    def test_relative_and_package_imports_are_resolved(self):
        self.write("modules/feature/policy.py", "from ... import adapters\nfrom . import sibling\nfrom pymentor_core import adapters\n")
        self.write("modules/feature/sibling.py", "")
        files, edges, violations, errors = checker.analyze(self.root)
        self.assertEqual((2, []), (files, errors))
        self.assertIn(checker.ImportEdge("pymentor_core.modules.feature.policy", "pymentor_core.modules.feature.sibling", 2), edges)
        self.assertEqual([1, 3], [v.line for v in violations])
        self.assertTrue(all(v.rule == "modules_must_not_import_adapters_or_redis" for v in violations))

    def test_all_boundaries_and_allowed_api_import(self):
        self.write("modules/feature/api.py", "from fastapi import Request\nfrom redis import Redis\nimport tools.lab\n")
        self.write("shared/common.py", "from .. import app, adapters, modules\n")
        self.write("modules/feature/application/task.py", "from sqlalchemy.orm import Session\n")
        self.write("modules/feature/other.py", "def run_policy():\n    import fastapi\n")
        self.write("modules/feature/activity_policy.py", "import sqlalchemy.orm\n")
        self.write("modules/feature/complete_lesson.py", "from sqlalchemy import select\n")
        self.write("modules/feature/save_progress.py", "import fastapi\n")
        self.write("app/synthetic_policy.py", "from sqlalchemy.engine import make_url\n")
        _, _, violations, errors = checker.analyze(self.root)
        self.assertEqual([], errors)
        self.assertEqual(10, len(violations))
        self.assertFalse(any(v.source.endswith("api") and v.line == 1 for v in violations))
        self.assertEqual({"runtime_must_not_import_tools_tests_or_probes", "modules_must_not_import_adapters_or_redis", "shared_must_not_import_app_adapters_or_modules", "policy_application_must_not_import_orm_or_fastapi"}, {v.rule for v in violations})

    def test_missing_empty_and_syntax_errors_fail_closed(self):
        for create_root in (False, True):
            if create_root:
                self.root.mkdir()
            self.assertTrue(checker.analyze(self.root)[3])
            proc = subprocess.run([sys.executable, str(SCRIPT), "--root", str(self.root), "--json"], text=True, capture_output=True)
            self.assertNotEqual(0, proc.returncode)
            self.assertTrue(json.loads(proc.stdout)["errors"])
        self.write("bad.py", "def broken(:\n")
        self.assertTrue(checker.analyze(self.root)[3])
        proc = subprocess.run([sys.executable, str(SCRIPT), "--root", str(self.root), "--json"], text=True, capture_output=True)
        self.assertNotEqual(0, proc.returncode)
        self.assertEqual(1, json.loads(proc.stdout)["file_count"])
        self.assertTrue(json.loads(proc.stdout)["errors"])

    def test_json_success_and_package_init_relative_import(self):
        self.write("modules/feature/__init__.py", "from . import child\n")
        self.write("modules/feature/child.py", "")
        proc = subprocess.run([sys.executable, str(SCRIPT), "--root", str(self.root), "--json"], text=True, capture_output=True)
        self.assertEqual(0, proc.returncode, proc.stderr)
        report = json.loads(proc.stdout)
        self.assertEqual((2, 1, []), (report["file_count"], report["edge_count"], report["violations"]))
        self.assertEqual("pymentor_core.modules.feature.child", report["edges"][0]["target"])


if __name__ == "__main__":
    unittest.main()
