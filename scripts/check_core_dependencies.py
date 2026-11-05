"""Report backend imports and reject new, explicitly forbidden dependency directions.

This is an AST-only check: no application modules are imported or executed.
The current layout is intentionally NOT described as a layered architecture:
feature-local services and cross-feature service imports remain supported.

Run: python scripts/check_core_dependencies.py [--map | --json] [--backend PATH]
"""

from __future__ import annotations

import argparse
import ast
import json
from dataclasses import asdict, dataclass
from pathlib import Path


DEFAULT_BACKEND = Path(__file__).resolve().parents[1] / "backend"
ROOTS = ("routers", "services", "db", "core", "identity", "learning", "practice", "infrastructure")


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


def _module_name(path: Path, backend: Path) -> str:
    parts = path.relative_to(backend).with_suffix("").parts
    return ".".join(parts[:-1] if parts[-1] == "__init__" else parts)


def _resolve_imports(node: ast.Import | ast.ImportFrom, source: str,
                     modules: set[str]) -> list[str]:
    if isinstance(node, ast.Import):
        return [alias.name for alias in node.names]

    if node.level:
        # __init__.py is itself a package; regular modules belong to a package.
        package = source if source.endswith(".__init__") else source.rpartition(".")[0]
        # source is normalized without the __init__ suffix; caller passes a package flag
        # by appending __init__ for this resolution only.
        if source.endswith(".__init__"):
            package = source.removesuffix(".__init__")
        parts = package.split(".") if package else []
        if node.level > len(parts):
            return []
        base = ".".join(parts[: len(parts) - node.level + 1])
        module = ".".join(filter(None, (base, node.module or "")))
    else:
        module = node.module or ""

    # "from pkg import submodule" and "from module import attribute" resolve
    # differently. Avoid reporting a spurious edge to the package for the former.
    return [candidate if candidate in modules else module
            for alias in node.names
            if (candidate := f"{module}.{alias.name}")]


def collect_edges(backend: Path) -> tuple[list[ImportEdge], list[str]]:
    """Return all resolved internal module edges, and parse errors if any."""
    backend = backend.resolve()
    paths = sorted(path for root in ROOTS for path in (backend / root).rglob("*.py"))
    index = {_module_name(path, backend): path for path in paths}
    edges: set[ImportEdge] = set()
    errors: list[str] = []

    for source, path in sorted(index.items()):
        try:
            tree = ast.parse(path.read_text(encoding="utf-8-sig"), filename=str(path))
        except (SyntaxError, UnicodeError, OSError) as exc:
            errors.append(f"{path.relative_to(backend).as_posix()}: {exc}")
            continue
        is_package = path.name == "__init__.py"
        resolver_source = source + ".__init__" if is_package else source
        for node in ast.walk(tree):
            if not isinstance(node, (ast.Import, ast.ImportFrom)):
                continue
            for candidate in _resolve_imports(node, resolver_source, set(index)):
                if candidate in index and candidate != source:
                    edges.add(ImportEdge(source, candidate, node.lineno))
                elif candidate not in index:
                    # An import may point to an attribute of a known module.
                    # Count its owning module, but never guess third-party imports.
                    parent = candidate
                    while "." in parent and parent not in index:
                        parent = parent.rpartition(".")[0]
                    if parent in index and parent != source:
                        edges.add(ImportEdge(source, parent, node.lineno))
    return sorted(edges), errors


def _is_endpoint(module: str) -> bool:
    return module.startswith("routers.") and module.rsplit(".", 1)[-1] in {
        "router", "public", "admin"
    }


def forbidden_rule(source: str, target: str) -> str | None:
    """Narrow forward-looking invariants, not an assertion of full isolation."""
    if (source == "practice.application" or source.startswith("practice.application.")) and any(
        target == root or target.startswith(root + ".")
        for root in ("routers", "db", "infrastructure")
    ):
        return "practice_application_must_not_depend_on_routers_db_or_infrastructure"
    if (source == "learning.application" or source.startswith("learning.application.")) and any(
        target == root or target.startswith(root + ".")
        for root in ("routers", "db", "infrastructure")
    ):
        return "learning_application_must_not_depend_on_routers_db_or_infrastructure"
    if (source == "identity" or source.startswith("identity.")) and (
        target == "routers" or target.startswith("routers.")
    ):
        return "identity_must_not_depend_on_routers"
    if source.startswith("db.") and target.startswith(("routers.", "services.")):
        return "db_must_not_depend_on_application"
    if source.startswith("core.") and target.startswith(("routers.", "services.")):
        return "core_must_not_depend_on_application"
    if source.startswith("services.") and target.startswith("routers."):
        return "shared_services_must_not_depend_on_routers"
    if source.startswith("routers.") and source.endswith(".schemas") and (
        target.startswith("services.") or _is_endpoint(target)
        or target.startswith("routers.") and target.endswith(".service")
    ):
        return "schemas_must_not_depend_on_services_or_endpoints"
    if source.startswith("routers.") and source.endswith(".service") and _is_endpoint(target):
        return "feature_services_must_not_depend_on_endpoints"
    return None


def analyze(backend: Path) -> tuple[list[ImportEdge], list[Violation], list[str]]:
    edges, errors = collect_edges(backend)
    violations = [Violation(edge.source, edge.target, edge.line, rule)
                  for edge in edges if (rule := forbidden_rule(edge.source, edge.target))]
    return edges, violations, errors


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--backend", type=Path, default=DEFAULT_BACKEND)
    format_group = parser.add_mutually_exclusive_group()
    format_group.add_argument("--map", action="store_true", help="print every resolved internal import")
    format_group.add_argument("--json", action="store_true", help="machine-readable import map")
    args = parser.parse_args(argv)

    if not args.backend.is_dir():
        parser.error(f"backend directory does not exist: {args.backend}")
    edges, violations, errors = analyze(args.backend)
    if args.json:
        print(json.dumps({"backend": str(args.backend.resolve()),
                          "edges": [asdict(edge) for edge in edges],
                          "violations": [asdict(item) for item in violations],
                          "errors": errors}, ensure_ascii=False, indent=2))
    else:
        print(f"Backend internal imports: {len(edges)} resolved edges")
        if args.map:
            for edge in edges:
                print(f"  {edge.source}:{edge.line} -> {edge.target}")
        for item in violations:
            print(f"FORBIDDEN {item.source}:{item.line} -> {item.target} [{item.rule}]")
        for error in errors:
            print(f"PARSE ERROR {error}")
        print(f"Forbidden directions: {len(violations)}; parse errors: {len(errors)}")
    return 1 if violations or errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
