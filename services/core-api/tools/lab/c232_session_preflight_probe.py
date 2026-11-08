"""Exercise session compatibility on the pinned synthetic SQLite snapshot.

The reference time is fixture-relative for deterministic testing. This does
not verify real current validity, Redis, or a complete source snapshot.
"""

from datetime import timedelta
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[4]
import tools.migration.c232_source_guard as source_guard
from tools.lab.session_models.c232_session_compatibility import (
    require_compatible_legacy_sessions,
)
from pymentor_core.adapters.postgres.legacy_sessions import LegacySession
from tools.lab.storage.c232_import_types import to_timestamp


def main():
    with source_guard.open_synthetic_snapshot() as snapshot:
        rows = snapshot.connection.execute(
            "SELECT session_token, created_at FROM sessions"
        ).fetchall()
        sessions = [
            LegacySession(token, to_timestamp(created)) for token, created in rows
        ]
        if len(sessions) != 2:
            raise ValueError("unexpected_fixture")
        reference = max(session.created_at for session in sessions) + timedelta(
            seconds=1
        )
        checked = require_compatible_legacy_sessions(sessions, as_of=reference)
        print(
            f"PASS: {len(checked)} pinned synthetic sessions checked against fixture-relative time"
        )


if __name__ == "__main__":
    try:
        main()
    except Exception:
        print("BLOCKED: synthetic session preflight failed")
        raise SystemExit(2)
