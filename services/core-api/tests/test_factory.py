"""Exercise application import/startup separation in clean subprocesses."""
import os
from pathlib import Path
import subprocess
import sys

ROOT=Path(__file__).resolve().parents[3]

def child(code, tmp_path):
    env=os.environ.copy()
    env.update(PYTHONPATH=os.pathsep.join((str(ROOT/'backend'),str(ROOT/'services/core-api'))),
               PYTHON_DOTENV_DISABLED='1',PYTHONDONTWRITEBYTECODE='1',
               DATABASE_URL='sqlite:///'+(tmp_path/'synthetic.sqlite3').as_posix(),
               PYMENTOR_LOCAL_NOTIFICATIONS='0')
    for key in ('PYMENTOR_DUAL_LOCAL_TEST','PYMENTOR_TEST_PG_URL','PYMENTOR_TEST_REDIS_URL'):
        env.pop(key,None)
    result=subprocess.run([sys.executable,'-c',code],env=env,cwd=tmp_path,capture_output=True,text=True,timeout=30)
    assert result.returncode==0,result.stderr

def test_import_and_openapi_do_not_create_database(tmp_path):
    child('from pathlib import Path; from main import app; assert not Path("synthetic.sqlite3").exists(); app.openapi(); assert not Path("synthetic.sqlite3").exists()',tmp_path)

def test_lifespan_initializes_only_selected_legacy_database(tmp_path):
    child('''from pathlib import Path
from fastapi.testclient import TestClient
from main import app
assert not Path("synthetic.sqlite3").exists()
with TestClient(app) as client:
    assert client.get("/health/ready").status_code == 200
    assert client.get("/api/learning/tracks").status_code == 200
assert Path("synthetic.sqlite3").exists()
''',tmp_path)

def test_invalid_profile_does_not_import_database(tmp_path):
    child('''import sys
from pymentor_core.app.factory import create_app
try:
    create_app("misspelled")
except ValueError:
    assert "db.engine" not in sys.modules
else:
    raise AssertionError("unknown profile accepted")
''',tmp_path)
