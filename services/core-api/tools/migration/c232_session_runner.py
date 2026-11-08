"""Read and classify a synthetic user's session migration state under SQL lock.

The caller must independently verify the lab, pinned source, writer freeze,
Redis ownership, sequence state and timing. This function does no SQL writes,
Redis I/O, retry or commit and must not be used as a standalone readiness gate.
"""

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[4]
from sqlalchemy import text
import tools.migration.c232_source_guard as source_guard
from tools.lab.session_models.c232_session_replay import classify_session_replay

SNAPSHOT_ID = source_guard.PINNED_SYNTHETIC_SHA256


class SessionStateError(Exception):
    """Category-only state-read failure."""


def operation_id(user_id):
    if type(user_id) is not int or not 1 <= user_id < 2**31:
        raise SessionStateError("session_state_unavailable")
    return f"synthetic-session-v1-user-{user_id}"


async def read_session_state(database, user_id, expected_sessions):
    try:
        operation = operation_id(user_id)
        async with database.unit_of_work() as uow:
            found = await uow.session.scalar(
                text("SELECT id FROM users WHERE id=:id FOR UPDATE"), {"id": user_id}
            )
            if found != user_id:
                raise ValueError("missing user")
            result = await uow.session.execute(
                text("""SELECT id, user_id, session_token, created_at
                FROM sessions WHERE user_id=:id"""),
                {"id": user_id},
            )
            rows = [dict(row) for row in result.mappings().all()]
            result = await uow.session.execute(
                text("""SELECT snapshot_id, operation_id, user_id
                FROM c232_lab_control.session_operations WHERE user_id=:id"""),
                {"id": user_id},
            )
            marker = result.mappings().one_or_none()
            consumed = await uow.session.scalar(
                text("""SELECT EXISTS
                (SELECT 1 FROM session_import_markers WHERE user_id=:id)"""),
                {"id": user_id},
            )
            return classify_session_replay(
                snapshot_id=SNAPSHOT_ID,
                operation_id=operation,
                user_id=user_id,
                expected_sessions=expected_sessions,
                sql_rows=rows,
                marker=dict(marker) if marker else None,
                session_import_markers=consumed,
            )
    except Exception:
        raise SessionStateError("session_state_unavailable") from None
