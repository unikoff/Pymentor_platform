"""Compatibility entrypoint for existing Passenger/uvicorn launchers."""
import os
from _core_entrypoint import activate_core_package

activate_core_package()
from pymentor_core.app.factory import create_app, DUAL_LOCAL_SCHEMA_REVISION, DUAL_LOCAL_REQUIRED_TABLES

app = create_app("legacy_sqlite", laboratory=os.getenv("PYMENTOR_DUAL_LOCAL_TEST") == "1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001)
