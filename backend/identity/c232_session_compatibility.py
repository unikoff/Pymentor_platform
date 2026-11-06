"""Conservative, side-effect-free audit for a future synthetic session import.

Legacy SQL accepts a stored token without checking its age. The experimental
Redis/PG path limits both age and count. This audit refuses incompatible input
instead of silently discarding tokens. It is not wired to production or a full
importer and does not decide account revocation or missing Redis recovery.
The caller must obtain trusted current time and repeat checks under the proper
locks; passing an old reference cannot guarantee sessions remain valid later.
"""
from datetime import datetime, timedelta, timezone
from uuid import UUID

from identity.async_sessions import MAX_SESSIONS, SESSION_TTL_SECONDS
from identity.legacy_session_import import LegacySession


def require_compatible_legacy_sessions(sessions, *, as_of):
    """Return all inputs unchanged or raise a category-only ValueError."""
    if type(as_of) is not datetime or as_of.tzinfo is not timezone.utc:
        raise ValueError('legacy_reference_invalid')
    if not isinstance(sessions, (list, tuple)):
        raise ValueError('legacy_sessions_invalid')
    if len(sessions) > MAX_SESSIONS:
        raise ValueError('legacy_session_limit_incompatible')
    try:
        cutoff = as_of - timedelta(seconds=SESSION_TTL_SECONDS)
    except OverflowError:
        raise ValueError('legacy_reference_invalid') from None
    seen = set()
    for session in sessions:
        if (not isinstance(session, LegacySession) or type(session.created_at) is not datetime
                or session.created_at.tzinfo is not timezone.utc
                or type(session.token) is not str):
            raise ValueError('legacy_sessions_invalid')
        try:
            if str(UUID(session.token)) != session.token:
                raise ValueError
        except (ValueError, AttributeError):
            raise ValueError('legacy_sessions_invalid') from None
        if session.token in seen or session.created_at > as_of:
            raise ValueError('legacy_sessions_invalid')
        seen.add(session.token)
        if session.created_at <= cutoff:
            raise ValueError('legacy_expiry_incompatible')
    return tuple(sessions)
