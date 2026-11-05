"""Synthetic dependency-boundary tests, independent of the application runtime."""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


SCRIPT = Path(__file__).resolve().parents[2] / "scripts" / "check_core_dependencies.py"
SPEC = importlib.util.spec_from_file_location("check_core_dependencies", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
checker = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = checker
SPEC.loader.exec_module(checker)


class CoreDependencyCheckTests(unittest.TestCase):
    def setUp(self) -> None:
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.backend = Path(self.directory.name)

    def write(self, module: str, source: str) -> None:
        file = self.backend.joinpath(*module.split(".")).with_suffix(".py")
        file.parent.mkdir(parents=True, exist_ok=True)
        file.write_text(source, encoding="utf-8")

    def test_relative_import_and_allowed_feature_service_dependencies(self) -> None:
        self.write("routers.accounts.__init__", "")
        self.write("routers.accounts.service", "from db import models\n")
        self.write("routers.accounts.router", "from . import service\n")
        self.write("routers.courses.service", "from routers.accounts import service\n")
        self.write("db.models", "")
        edges, violations, errors = checker.analyze(self.backend)
        self.assertEqual([], errors)
        self.assertEqual([], violations)
        self.assertIn(checker.ImportEdge("routers.accounts.router", "routers.accounts.service", 1), edges)
        self.assertIn(checker.ImportEdge("routers.accounts.service", "db.models", 1), edges)
        self.assertIn(checker.ImportEdge("routers.courses.service", "routers.accounts.service", 1), edges)

    def test_forbidden_direction_from_db_to_router(self) -> None:
        self.write("db.models", "from routers.accounts.router import app\n")
        self.write("routers.accounts.router", "app = object()\n")
        _, violations, errors = checker.analyze(self.backend)
        self.assertEqual([], errors)
        self.assertEqual([checker.Violation("db.models", "routers.accounts.router", 1,
                                            "db_must_not_depend_on_application")], violations)

    def test_relative_parent_import_from_service_to_endpoint(self) -> None:
        self.write("routers.accounts.__init__", "")
        self.write("routers.accounts.service", "from . import router\n")
        self.write("routers.accounts.router", "")
        _, violations, errors = checker.analyze(self.backend)
        self.assertEqual([], errors)
        self.assertEqual("feature_services_must_not_depend_on_endpoints", violations[0].rule)

    def test_syntax_error_fails_closed(self) -> None:
        self.write("services.bad", "def broken(:\n")
        _, violations, errors = checker.analyze(self.backend)
        self.assertFalse(violations)
        self.assertEqual(1, len(errors))

    def test_all_declared_forbidden_directions(self) -> None:
        cases = (
            ("core.config", "routers.accounts.router", "core_must_not_depend_on_application"),
            ("services.worker", "routers.accounts.service", "shared_services_must_not_depend_on_routers"),
            ("routers.accounts.schemas", "routers.accounts.service",
             "schemas_must_not_depend_on_services_or_endpoints"),
        )
        for source, target, rule in cases:
            with self.subTest(source=source):
                self.write(source, f"import {target}\n")
                self.write(target, "")
                _, violations, errors = checker.analyze(self.backend)
                self.assertEqual([], errors)
                self.assertIn(checker.Violation(source, target, 1, rule), violations)

    def test_new_packages_indexed_and_allowed_legacy_identity_dependency(self) -> None:
        self.write("identity.sessions", "from db import models\n")
        self.write("learning.application.course", "from identity import principal\n")
        self.write("infrastructure.adapter", "from identity import sessions\n")
        self.write("identity.principal", "")
        self.write("db.models", "")
        edges, violations, errors = checker.analyze(self.backend)
        self.assertEqual([], errors)
        self.assertEqual([], violations)
        self.assertIn(checker.ImportEdge("identity.sessions", "db.models", 1), edges)
        self.assertIn(checker.ImportEdge("learning.application.course", "identity.principal", 1), edges)
        self.assertIn(checker.ImportEdge("infrastructure.adapter", "identity.sessions", 1), edges)

    def test_new_forbidden_directions_detected_with_ast(self) -> None:
        cases = (
            ("learning.application.__init__", "db.models",
             "learning_application_must_not_depend_on_routers_db_or_infrastructure"),
            ("learning.application.course", "routers.accounts.router",
             "learning_application_must_not_depend_on_routers_db_or_infrastructure"),
            ("learning.application.course", "db.models",
             "learning_application_must_not_depend_on_routers_db_or_infrastructure"),
            ("learning.application.course", "infrastructure.adapter",
             "learning_application_must_not_depend_on_routers_db_or_infrastructure"),
            ("identity.sessions", "routers.accounts.router",
             "identity_must_not_depend_on_routers"),
            ("practice.application.save_progress", "db.models",
             "practice_application_must_not_depend_on_routers_db_or_infrastructure"),
        )
        for source, target, rule in cases:
            with self.subTest(source=source, target=target):
                self.write(source, f"import {target}\n")
                self.write(target, "")
                _, violations, errors = checker.analyze(self.backend)
                self.assertEqual([], errors)
                normalized_source = source.removesuffix(".__init__")
                self.assertIn(checker.Violation(normalized_source, target, 1, rule), violations)

    def test_json_cli_and_exit_code(self) -> None:
        self.write("db.models", "from routers.accounts.router import app\n")
        self.write("routers.accounts.router", "app = None\n")
        result = subprocess.run(
            [sys.executable, str(SCRIPT), "--backend", str(self.backend), "--json"],
            capture_output=True, text=True, check=False,
        )
        self.assertEqual(1, result.returncode)
        payload = json.loads(result.stdout)
        self.assertEqual(1, len(payload["violations"]))
        self.assertEqual([], payload["errors"])


if __name__ == "__main__":
    unittest.main()
