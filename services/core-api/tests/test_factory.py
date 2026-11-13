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
               DATABASE_URL='postgresql+psycopg://app:synthetic@127.0.0.1:9/pg02',
               REDIS_URL='redis://127.0.0.1:9/0',
               KNOWI_REDIS_PREFIX='pg02:factory:',KNOWI_LOGIN_RECOVERY_KEY='ab'*32,
               PYMENTOR_LOCAL_NOTIFICATIONS='0')
    for key in ('PYMENTOR_PROFILE','PYMENTOR_REDIS_PREFIX','PYMENTOR_LOGIN_RECOVERY_KEY',
                'PYMENTOR_DUAL_LOCAL_TEST','PYMENTOR_TEST_PG_URL','PYMENTOR_TEST_REDIS_URL'):
        env.pop(key,None)
    result=subprocess.run([sys.executable,'-c',code],env=env,cwd=tmp_path,capture_output=True,text=True,timeout=30)
    assert result.returncode==0,result.stderr

def test_import_and_openapi_do_not_create_database(tmp_path):
    child('from pathlib import Path; from pymentor_core.app.factory import create_app; app=create_app(); app.openapi(); assert not Path("synthetic.sqlite3").exists()',tmp_path)

def test_liveness_does_not_claim_startup_or_readiness_before_lifespan(tmp_path):
    child('''from pymentor_core.app.factory import create_app
from fastapi.testclient import TestClient
app=create_app()
client=TestClient(app)
assert client.get("/health/live").status_code == 200
assert client.get("/health/startup").status_code == 503
assert client.get("/health/ready").status_code == 503
''',tmp_path)

def test_invalid_profile_does_not_import_database(tmp_path):
    child('''import sys
from pymentor_core.app.factory import create_app
try:
    create_app("misspelled")
except ValueError:
    assert "pymentor_core.app.database" not in sys.modules
else:
    raise AssertionError("unknown profile accepted")
''',tmp_path)


def test_retired_profile_is_rejected_before_dotenv_or_database_import(tmp_path):
    child('''import sys
from types import ModuleType
dotenv=ModuleType("dotenv")
sys.modules["dotenv"]=dotenv
from pymentor_core.app.factory import create_app
def unexpected_dotenv(*args, **kwargs):
    raise AssertionError("retired hosting dotenv must not be read")
dotenv.load_dotenv=unexpected_dotenv
try:
    create_app("legacy_sqlite")
except ValueError:
    assert "pymentor_core.app.database" not in sys.modules
else:
    raise AssertionError("retired profile accepted")
''',tmp_path)
