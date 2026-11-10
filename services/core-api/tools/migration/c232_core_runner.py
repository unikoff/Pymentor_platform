"""Classify core data in a verified synthetic target under transaction locks.

Session rows, Redis, source provenance, filesystem ACL and continuous writer
exclusion must be checked independently. This function never writes rows.
"""

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[4]
import tools.lab.c232_commit_probe as commit_probe
from tools.lab.storage.c232_core_replay import classify_core_replay


class CoreStateError(Exception):
    """Category-only synthetic core state error."""


async def read_core_state(connection, source):
    try:
        async with connection.transaction():
            await commit_probe.lock_and_check(connection)
            rows = await commit_probe.fetch_target(connection)
            marker_rows = await connection.fetch("""SELECT singleton, snapshot_digest, transform_version
                FROM c232_lab_control.import_marker""")
            if len(marker_rows) > 1:
                raise ValueError("invalid marker")
            marker = dict(marker_rows[0]) if marker_rows else None
            consumed = await connection.fetchval(
                "SELECT EXISTS (SELECT 1 FROM public.session_import_markers)"
            )
            operations = await connection.fetchval(
                "SELECT EXISTS (SELECT 1 FROM c232_lab_control.session_operations)"
            )
            state = classify_core_replay(
                source=source,
                target=rows,
                marker=marker,
                snapshot_digest=commit_probe.MARKER_DIGEST,
                transform_version=commit_probe.MARKER_VERSION,
                session_import_markers=consumed,
            )
            if state == "new" and operations:
                raise ValueError("unmatched session operation")
            if state == "core_complete":
                # Sessions are checked separately; this validates only the
                # non-session sequences and conservative session sequence form.
                await commit_probe.sequence_states(
                    connection, dict(source, sessions=[]), restart=False
                )
            return state
    except Exception:
        raise CoreStateError("core_state_unavailable") from None
