"""Paths and environment loading shared by all backend entry points."""
import os
from pathlib import Path

from dotenv import load_dotenv

BACKEND_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = BACKEND_ROOT.parent
DIST_DIR = PROJECT_ROOT / "frontend" / "dist"
MATERIALS_ROOT = BACKEND_ROOT / "content" / "materials"
load_dotenv(BACKEND_ROOT / ".env")

# Redis-backed session helpers are opt-in. The active API stores sessions in
# SQLite/PostgreSQL and does not import db.session; do not require an idle Redis
# service for a Core-only deployment.

if (
    os.environ.get("PYMENTOR_REQUIRE_DATABASE_URL", "").strip().lower()
    in {"1", "true", "yes", "on"}
    and not os.environ.get("DATABASE_URL", "").strip()
):
    raise RuntimeError("Required environment variable DATABASE_URL is not set")
