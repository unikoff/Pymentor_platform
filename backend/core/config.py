"""Paths and environment loading shared by all backend entry points."""
from pathlib import Path
from dotenv import load_dotenv

BACKEND_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = BACKEND_ROOT.parent
DIST_DIR = PROJECT_ROOT / "frontend" / "dist"
MATERIALS_ROOT = BACKEND_ROOT / "content" / "materials"
load_dotenv(BACKEND_ROOT / ".env")
