"""Locate the canonical Core package from an old hosting entrypoint."""
import sys
from pathlib import Path

def activate_core_package():
    source = Path(__file__).resolve().parents[1] / "services" / "core-api"
    if not (source / "pymentor_core").is_dir():
        raise RuntimeError("Core service package is missing")
    if str(source) not in sys.path:
        sys.path.insert(0, str(source))


def activate_tools():
    from pathlib import Path
    import sys
    path=str(Path(__file__).resolve().parents[1]/"services"/"core-api")
    if path not in sys.path:sys.path.insert(0,path)
