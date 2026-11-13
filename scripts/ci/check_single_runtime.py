"""Fail the release gate if SQLite re-enters serving sources, config or image."""
import argparse
import ast
import json
import re
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[2]
CONFIGS = (
    ".github/workflows/release.yml", "services/core-api/Dockerfile",
    "scripts/ci/preview_checks.py", "scripts/local-k3s/build-images.sh", "scripts/local-k3s/cluster.sh",
    "deploy/helm/pymentor/templates/deployment-core.yaml", "deploy/local-postgres-redis/compose.yaml",
)


def scan_package(package):
    package = Path(package)
    violations = []
    if (package / "adapters/legacy_sqlite").exists():
        violations.append("adapters/legacy_sqlite:retired-runtime-adapter-present")
    files = list(package.rglob("*.py"))
    if not files:
        return ["missing-or-empty-runtime-package"]
    for path in files:
        relative = path.relative_to(package).as_posix()
        if path.is_symlink():
            violations.append(f"{relative}:symlinked-runtime-source")
            continue
        try:
            tree = ast.parse(path.read_text(encoding="utf-8-sig"))
        except (SyntaxError, UnicodeError):
            violations.append(f"{relative}:invalid-runtime-source")
            continue
        for node in ast.walk(tree):
            names = []
            if isinstance(node, ast.Import): names = [alias.name for alias in node.names]
            elif isinstance(node, ast.ImportFrom): names = [node.module or "", *[alias.name for alias in node.names]]
            if any("legacy_sqlite" in name or name in {"sqlite3", "SqlSessionRepository"} for name in names):
                violations.append(f"{relative}:{node.lineno}:sqlite-runtime-import")
            if isinstance(node, ast.Constant) and isinstance(node.value, str):
                if re.search(r"sqlite(?:\+[a-z0-9_]+)?://", node.value.lower()):
                    violations.append(f"{relative}:{node.lineno}:sqlite-runtime-dsn")
                if node.value == "sqlite3" or "pymentor_core.adapters.legacy_sqlite" in node.value:
                    violations.append(f"{relative}:{node.lineno}:dynamic-sqlite-runtime-import")
            if isinstance(node, ast.ClassDef) and node.name == "SqlSessionRepository":
                violations.append(f"{relative}:{node.lineno}:sql-auth-runtime-repository")
    return violations


def scan_config(root):
    violations = []
    for name in CONFIGS:
        path = Path(root) / name
        if not path.is_file():
            violations.append(f"{name}:missing-active-config")
            continue
        source = path.read_text(encoding="utf-8").lower()
        for marker in ("sqlite://", "arg profile", "--build-arg profile", "backend/dockerfile", "continue-on-error: true"):
            if marker in source:
                violations.append(f"{name}:retired-or-optional-runtime-config")
    return violations


def check_image(image):
    code = """
import importlib.util, os, sys
from pathlib import Path
assert os.getuid() == 10001
assert not Path('/app/services/core-api/pymentor_core/adapters/legacy_sqlite').exists()
assert not Path('/app/services/core-api/pymentor_core/app/passenger.py').exists()
assert not Path('/app/backend/main.py').exists()
assert not list(Path('/app').rglob('*.sqlite*'))
assert importlib.util.find_spec('alembic') is None
from pymentor_core.app.factory import create_app
app = create_app()
assert app.state.startup_complete is False
assert not any('legacy_sqlite' in name for name in sys.modules)
print('PASS canonical image assembly without SQLite adapter or DDL tooling')
"""
    subprocess.run([
        "docker", "run", "--rm", "--network", "none", "--read-only", "--cap-drop", "ALL",
        "--security-opt", "no-new-privileges", "--env", "DATABASE_URL=postgresql+psycopg://synthetic:synthetic@127.0.0.1:9/synthetic",
        "--env", "REDIS_URL=redis://127.0.0.1:9/0", "--env", "KNOWI_REDIS_PREFIX=ci-image:",
        "--env", "KNOWI_LOGIN_RECOVERY_KEY=" + "ab" * 32, image, "python", "-c", code,
    ], check=True, timeout=60)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--image")
    args = parser.parse_args()
    violations = scan_package(ROOT / "services/core-api/pymentor_core") + scan_config(ROOT)
    if violations:
        print(json.dumps({"violations": violations}))
        raise SystemExit(1)
    if args.image: check_image(args.image)
    print("PASS single PostgreSQL/Redis source/config gate")


if __name__ == "__main__": main()
