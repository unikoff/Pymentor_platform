"""Code, course resources and writable state locations; no database or dotenv I/O."""

import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[4]
LEGACY_ROOT = PROJECT_ROOT / "backend"
BACKEND_ROOT = LEGACY_ROOT
DIST_DIR = PROJECT_ROOT / "frontend" / "dist"
MATERIALS_ROOT = LEGACY_ROOT / "content" / "materials"


def state_directory():
    configured = os.environ.get("PYMENTOR_STATE_DIR", "").strip()
    path = (
        Path(configured)
        if configured
        else (
            LEGACY_ROOT
            if os.environ.get("PYMENTOR_PROFILE", "legacy_sqlite") == "legacy_sqlite"
            else PROJECT_ROOT / "data" / "core-api"
        )
    )
    if not path.is_absolute():
        raise ValueError("PYMENTOR_STATE_DIR must be absolute")
    return path
