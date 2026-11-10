"""Audit recorded synthetic outbox statuses without starting a worker."""

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[4]
import tools.migration.c232_source_guard as source_guard
from tools.lab.storage.c232_outbox_audit import audit_outboxes
from tools.lab.storage.c232_outbox_audit import require_no_unsent_statuses


def main():
    with source_guard.open_synthetic_snapshot() as snapshot:
        tables = ("booking_notification_outbox", "landing_notification_outbox")
        queues = {
            table: [
                {"status": row[0]}
                for row in snapshot.connection.execute(f'SELECT status FROM "{table}"')
            ]
            for table in tables
        }
        result = audit_outboxes(queues)
        try:
            require_no_unsent_statuses(queues)
        except ValueError as exc:
            if str(exc) != "outbox_reconciliation_required":
                raise
        else:
            raise RuntimeError("expected_quarantine_not_applied")
        print(
            f"PASS: synthetic outboxes audited; sent={result['sent_records']}; "
            f"review_required={result['requires_review']}; no worker started"
        )


if __name__ == "__main__":
    try:
        main()
    except Exception:
        print("BLOCKED: synthetic outbox audit failed")
        raise SystemExit(2)
