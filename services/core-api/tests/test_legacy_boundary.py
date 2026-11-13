"""Prevent the temporary SQLite implementation becoming a business dependency."""
import ast
from pathlib import Path

ROOT=Path(__file__).resolve().parents[3]

def test_sqlite_runtime_adapter_is_physically_retired():
    assert not (ROOT / 'services/core-api/pymentor_core/adapters/legacy_sqlite').exists()

def test_business_and_new_storage_do_not_import_sqlite_implementation():
    areas=[ROOT/'backend'/name for name in ('identity','routers','learning','practice')]
    areas += [ROOT/'services/core-api/pymentor_core'/name for name in ('modules','adapters/postgres','adapters/redis')]
    violations=[]
    for area in areas:
        for p in area.rglob('*.py'):
            tree=ast.parse(p.read_text(encoding='utf-8-sig'))
            for node in ast.walk(tree):
                names=([node.module or ''] if isinstance(node,ast.ImportFrom)
                       else [a.name for a in node.names] if isinstance(node,ast.Import) else [])
                if any('legacy_sqlite' in name or name in {'pymentor_core.adapters.legacy_sqlite.bootstrap','pymentor_core.adapters.legacy_sqlite.account_lifecycles','pymentor_core.adapters.legacy_sqlite.progress_integrity'} for name in names):
                    violations.append((str(p.relative_to(ROOT)),node.lineno))
    assert not violations,violations

def test_identity_cookie_and_device_policy_has_no_relational_model_imports():
    tree=ast.parse((ROOT/'services/core-api/pymentor_core/modules/identity/api/sessions.py').read_text(encoding='utf-8'))
    assert not any(isinstance(n,ast.ImportFrom) and n.module in {'db','pymentor_core.adapters.sql.models','pymentor_core.app.database'} for n in ast.walk(tree))


def test_serving_and_worker_assembly_never_imports_sqlite_or_hosting_bootstrap():
    package = ROOT / 'services/core-api/pymentor_core'
    for name in ('settings', 'factory', 'database', 'wiring', 'worker'):
        path = package / 'app' / f'{name}.py'
        tree = ast.parse(path.read_text(encoding='utf-8'))
        for node in ast.walk(tree):
            names = ([node.module or ''] if isinstance(node, ast.ImportFrom)
                     else [alias.name for alias in node.names] if isinstance(node, ast.Import) else [])
            assert not any('legacy_sqlite' in name or name in {'sqlite3', 'dotenv', 'main'} for name in names), (path, node.lineno)
