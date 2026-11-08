"""Check static import boundaries without importing application code.

Run: python services/core-api/tools/check_architecture.py [--json] [--root PATH]
The root is the pymentor_core package directory. Dynamic imports are not analyzed.
"""
from __future__ import annotations

import argparse
import ast
import json
from dataclasses import asdict, dataclass
from pathlib import Path

DEFAULT_ROOT = Path(__file__).resolve().parents[1] / "pymentor_core"
PROBES = {"tools", "tests", "probes", "dual_local", "async_preview", "async_auth_preview", "async_combined_preview"}


@dataclass(frozen=True, order=True)
class ImportEdge:
    source: str
    target: str
    line: int


@dataclass(frozen=True, order=True)
class Violation:
    source: str
    target: str
    line: int
    rule: str


def _under(name: str, root: str) -> bool:
    return name == root or name.startswith(root + ".")


def _module_name(path: Path, root: Path) -> str:
    parts = path.relative_to(root).with_suffix("").parts
    return ".".join(("pymentor_core", * (parts[:-1] if parts[-1] == "__init__" else parts)))


def _resolve_imports(node: ast.Import | ast.ImportFrom, source: str, is_package: bool) -> list[str]:
    if isinstance(node, ast.Import):
        return [alias.name for alias in node.names]
    if node.level:
        package = source if is_package else source.rpartition(".")[0]
        parts = package.split(".")
        if node.level > len(parts):
            return []
        base = ".".join(parts[:len(parts) - node.level + 1])
        module = ".".join(filter(None, (base, node.module)))
    else:
        module = node.module or ""
    # Retain the imported member even if no matching module exists: package
    # imports such as `from pymentor_core import adapters` must be checked.
    return [f"{module}.{alias.name}" if alias.name != "*" else module for alias in node.names]


def _policy_file(source: str) -> bool:
    parts = source.split(".")
    return (parts[-1] in {"complete_lesson", "save_progress"} or "application" in parts or any(part == "policy" or part.endswith("_policy") for part in parts))


def forbidden_rules(source: str, target: str, in_policy_function: bool = False) -> list[str]:
    rules = []
    parts = target.split(".")
    # Also catch runtime-local packages named tools/tests/probes.
    if parts[0] in PROBES or (parts[0] == "pymentor_core" and len(parts) > 1 and parts[1] in PROBES):
        rules.append("runtime_must_not_import_tools_tests_or_probes")
    if _under(source, "pymentor_core.modules") and (_under(target, "pymentor_core.adapters") or _under(target, "redis")):
        rules.append("modules_must_not_import_adapters_or_redis")
    if _under(source, "pymentor_core.shared") and any(_under(target, "pymentor_core." + part) for part in ("app", "adapters", "modules")):
        rules.append("shared_must_not_import_app_adapters_or_modules")
    if _under(source, "pymentor_core.modules") and (_policy_file(source) or in_policy_function) and (_under(target, "sqlalchemy") or _under(target, "fastapi")):
        rules.append("policy_application_must_not_import_orm_or_fastapi")
    return rules


def analyze(root: Path) -> tuple[int, list[ImportEdge], list[Violation], list[str]]:
    root = root.resolve()
    if not root.is_dir():
        return 0, [], [], [f"package directory does not exist: {root}"]
    try:
        paths = sorted(root.rglob("*.py"))
    except OSError as exc:
        return 0, [], [], [f"cannot scan {root}: {exc}"]
    if not paths:
        return 0, [], [], [f"package contains no Python files: {root}"]
    edges: set[ImportEdge] = set()
    violations: set[Violation] = set()
    errors: list[str] = []
    for path in paths:
        source = _module_name(path, root)
        try:
            tree = ast.parse(path.read_text(encoding="utf-8-sig"), filename=str(path))
        except (SyntaxError, UnicodeError, OSError) as exc:
            errors.append(f"{path.relative_to(root).as_posix()}: {exc}")
            continue
        class Visitor(ast.NodeVisitor):
            def __init__(self) -> None:
                self.policy_depth = 0

            def visit_FunctionDef(self, node: ast.FunctionDef | ast.AsyncFunctionDef) -> None:
                is_policy = node.name == "policy" or node.name.endswith("_policy") or node.name == "application" or node.name.endswith("_application")
                self.policy_depth += int(is_policy)
                self.generic_visit(node)
                self.policy_depth -= int(is_policy)

            visit_AsyncFunctionDef = visit_FunctionDef

            def visit_Import(self, node: ast.Import | ast.ImportFrom) -> None:
                targets = _resolve_imports(node, source, path.name == "__init__.py")
                if isinstance(node, ast.ImportFrom) and node.level and not targets:
                    errors.append(f"{path.relative_to(root).as_posix()}:{node.lineno}: relative import escapes package")
                for target in targets:
                    edge = ImportEdge(source, target, node.lineno)
                    edges.add(edge)
                    for rule in forbidden_rules(source, target, bool(self.policy_depth)):
                        violations.add(Violation(source, target, node.lineno, rule))

            visit_ImportFrom = visit_Import

        Visitor().visit(tree)
    return len(paths), sorted(edges), sorted(violations), errors


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=DEFAULT_ROOT, help="pymentor_core package directory")
    parser.add_argument("--json", action="store_true", help="machine-readable report")
    args = parser.parse_args(argv)
    files, edges, violations, errors = analyze(args.root)
    if args.json:
        print(json.dumps({"root": str(args.root.resolve()), "file_count": files, "edge_count": len(edges), "edges": [asdict(edge) for edge in edges], "violations": [asdict(item) for item in violations], "errors": errors}, ensure_ascii=False, indent=2))
    else:
        print(f"Files: {files}; import edges: {len(edges)}; violations: {len(violations)}; errors: {len(errors)}")
        for item in violations:
            print(f"FORBIDDEN {item.source}:{item.line} -> {item.target} [{item.rule}]")
        for error in errors:
            print(f"ERROR {error}")
    return int(bool(violations or errors))


if __name__ == "__main__":
    raise SystemExit(main())
