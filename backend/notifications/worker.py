"""Existing cron entrypoint; the canonical CLI lives in Core's app package."""
from _core_entrypoint import activate_core_package
activate_core_package()

def main():
    from pymentor_core.app.worker import main as run
    return run(profile="legacy_sqlite")

if __name__ == "__main__":
    raise SystemExit(main())
