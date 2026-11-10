"""Pure classification of already collected, trusted synthetic session data.

Rows are plain dictionaries with exactly id, user_id, session_token and
created_at. A control marker is None or a dictionary with exactly snapshot_id,
operation_id and user_id. Collection, trust and transactional guarantees belong
to callers.
"""

from datetime import datetime
from datetime import timezone
from uuid import UUID


def _positive_id(value):
    return type(value) is int and 0 < value < 2**63


def _rows(rows, user_id, *, expected):
    if type(rows) not in (list, tuple) or (expected and not rows):
        raise ValueError("sessions_invalid")
    result = {}
    tokens = set()
    for row in rows:
        if type(row) is not dict or row.keys() != {
            "id",
            "user_id",
            "session_token",
            "created_at",
        }:
            raise ValueError("sessions_invalid")
        ident, owner, token, created = (
            row["id"],
            row["user_id"],
            row["session_token"],
            row["created_at"],
        )
        if (
            not _positive_id(ident)
            or not _positive_id(owner)
            or owner != user_id
            or type(token) is not str
            or type(created) is not datetime
            or created.tzinfo is not timezone.utc
        ):
            raise ValueError("sessions_invalid")
        try:
            valid_token = str(UUID(token)) == token
        except (ValueError, AttributeError):
            valid_token = False
        if not valid_token or ident in result or token in tokens:
            raise ValueError("sessions_invalid")
        result[ident] = (owner, token, created)
        tokens.add(token)
    return result


def classify_session_replay(
    *,
    snapshot_id,
    operation_id,
    user_id,
    expected_sessions,
    sql_rows,
    marker,
    session_import_markers,
):
    """Return 'new' or 'complete', otherwise raise a category-only ValueError.

    The consumed marker flag must be a bool. Snapshot identifiers are opaque,
    nonempty strings; no source authenticity or database guarantees are implied.
    """
    if (
        type(snapshot_id) is not str
        or not snapshot_id
        or type(operation_id) is not str
        or not operation_id
        or not _positive_id(user_id)
    ):
        raise ValueError("identity_invalid")
    if type(session_import_markers) is not bool:
        raise ValueError("consumed_flag_invalid")
    expected = _rows(expected_sessions, user_id, expected=True)
    actual = _rows(sql_rows, user_id, expected=False)
    if marker is not None:
        if (
            type(marker) is not dict
            or marker.keys() != {"snapshot_id", "operation_id", "user_id"}
            or type(marker["snapshot_id"]) is not str
            or not marker["snapshot_id"]
            or type(marker["operation_id"]) is not str
            or not marker["operation_id"]
            or not _positive_id(marker["user_id"])
        ):
            raise ValueError("marker_invalid")
        if (
            marker["snapshot_id"] != snapshot_id
            or marker["operation_id"] != operation_id
            or marker["user_id"] != user_id
        ):
            raise ValueError("marker_mismatch")
    if marker is None and not actual and session_import_markers is False:
        return "new"
    if marker is not None and actual == expected and session_import_markers is True:
        return "complete"
    raise ValueError("state_mismatch")
