"""Static runtime boundaries and absence of legacy business trees."""
import importlib.util
from pathlib import Path
import sys

SERVICE = Path(__file__).resolve().parents[2]
ROOT = SERVICE.parents[1]
SCRIPT = SERVICE / "tools/check_architecture.py"
SPEC = importlib.util.spec_from_file_location("core_architecture_checker", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
checker = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = checker
SPEC.loader.exec_module(checker)


def test_runtime_import_boundaries():
    files, _, violations, errors = checker.analyze(SERVICE / "pymentor_core")
    assert files > 0, errors
    assert not errors, errors
    assert not violations, violations


def test_only_one_migration_tree_and_no_legacy_business_tree():
    assert (SERVICE / "migrations/versions").is_dir()
    for old in ("migrations", "db", "identity", "infrastructure", "learning", "practice", "routers", "tests"):
        assert not (ROOT / "backend" / old).exists(), old
