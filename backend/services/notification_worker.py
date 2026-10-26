"""Compatibility entry point; implementation lives in notifications.worker."""
from notifications.worker import main


if __name__ == "__main__":
    raise SystemExit(main())
