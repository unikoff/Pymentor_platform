import os
from pathlib import Path
import subprocess
import sys

ROOT=Path(__file__).resolve().parents[3]

def test_legacy_passenger_initializes_on_request_without_asgi_lifespan(tmp_path):
    env=os.environ.copy()
    env.update(PYTHONPATH=os.pathsep.join((str(ROOT),str(ROOT/'backend'),str(ROOT/'services/core-api'))),
               DATABASE_URL='sqlite:///'+(tmp_path/'legacy-copy.sqlite3').as_posix(),
               PYTHON_DOTENV_DISABLED='1',PYTHONDONTWRITEBYTECODE='1',PYMENTOR_LOCAL_NOTIFICATIONS='0')
    env.pop('PYMENTOR_DUAL_LOCAL_TEST',None)
    code='''from pathlib import Path
import httpx
from unittest.mock import patch
import passenger_wsgi
assert not Path("legacy-copy.sqlite3").exists()
from pymentor_core.app import wiring
with patch.object(wiring,"initialize_legacy_schema",wraps=wiring.initialize_legacy_schema) as startup:
    client=httpx.Client(transport=httpx.WSGITransport(app=passenger_wsgi.application),base_url="http://test")
    response=client.post("/api/user/register",json={"username":"Synthetic Passenger","email":"passenger@example.test","password":"Synthetic-Password-42"})
    assert response.status_code==200,response.text
    assert client.get("/health/ready").status_code==200
    assert startup.call_count==1
    client.close()
assert Path("legacy-copy.sqlite3").is_file()
'''
    result=subprocess.run([sys.executable,'-c',code],env=env,cwd=tmp_path,capture_output=True,text=True,timeout=30)
    assert result.returncode==0,result.stderr
