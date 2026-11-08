"""Assign source IDs to synthetic ORM records in an isolated migration probe.

The caller must independently establish source authenticity, target isolation,
and transactional sequence handling. This helper does not access a database.
"""

from uuid import UUID


def assign_fixture_ids(records, source, *, user_id):
    """Validate all identities before assigning any IDs; return maximum ID."""
    if (
        type(user_id) is not int
        or not 1 <= user_id < 2**31
        or type(records) not in (list, tuple)
        or type(source) not in (list, tuple)
        or not source
        or len(source) != len(records)
        or len(source) > 3
    ):
        raise ValueError("synthetic_session_ids_invalid")
    by_token = {}
    ids = set()
    for row in source:
        if (
            type(row) is not dict
            or set(row) != {"id", "user_id", "session_token"}
            or type(row["id"]) is not int
            or not 1 <= row["id"] < 2**31
            or type(row["user_id"]) is not int
            or row["user_id"] != user_id
            or type(row["session_token"]) is not str
        ):
            raise ValueError("synthetic_session_ids_invalid")
        token = row["session_token"]
        try:
            if str(UUID(token)) != token:
                raise ValueError
        except (ValueError, AttributeError):
            raise ValueError("synthetic_session_ids_invalid") from None
        if row["id"] in ids or token in by_token:
            raise ValueError("synthetic_session_ids_invalid")
        ids.add(row["id"])
        by_token[token] = row["id"]
    assignments = []
    seen = set()
    for record in records:
        token = getattr(record, "session_token", None)
        if (
            type(token) is not str
            or token not in by_token
            or token in seen
            or type(getattr(record, "user_id", None)) is not int
            or record.user_id != user_id
            or getattr(record, "id", None) is not None
        ):
            raise ValueError("synthetic_session_ids_invalid")
        seen.add(token)
        assignments.append((record, by_token[token]))
    if seen != set(by_token):
        raise ValueError("synthetic_session_ids_invalid")
    for record, identifier in assignments:
        record.id = identifier
    return max(ids)
