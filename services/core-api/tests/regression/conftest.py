"""Explicit test composition; service fixtures require disposable PostgreSQL/Redis."""
import os
from pathlib import Path
import sys
os.environ.setdefault("PYTHON_DOTENV_DISABLED","1")

root=Path(__file__).resolve().parents[4]
paths=[str(root/"services/core-api"),str(root/"backend")]
for path in paths:
    if path not in sys.path:sys.path.insert(0,path)
os.environ["PYTHONPATH"]=os.pathsep.join(paths+[os.environ.get("PYTHONPATH","")])
from pymentor_core.app.wiring import configure_bindings
configure_bindings()
