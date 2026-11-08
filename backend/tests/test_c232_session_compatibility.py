from datetime import datetime, timedelta, timezone
from uuid import uuid4

import pytest

from identity.c232_session_compatibility import require_compatible_legacy_sessions
from identity.legacy_session_import import LegacySession


NOW = datetime(2026, 1, 2, tzinfo=timezone.utc)


def test_accepts_all_existing_sessions_without_truncation_or_mutation():
    sessions = [LegacySession(str(uuid4()), NOW - timedelta(days=age)) for age in (1, 2, 3)]
    original = sessions.copy()
    assert require_compatible_legacy_sessions(sessions, as_of=NOW) == tuple(original)
    assert sessions == original


def test_expired_server_valid_legacy_session_is_rejected_not_dropped():
    candidate = LegacySession(str(uuid4()), NOW - timedelta(days=30))
    with pytest.raises(ValueError, match='^legacy_expiry_incompatible$'):
        require_compatible_legacy_sessions([candidate], as_of=NOW)


def test_more_than_three_is_rejected_not_truncated():
    sessions = [LegacySession(str(uuid4()), NOW - timedelta(days=1)) for _ in range(4)]
    with pytest.raises(ValueError, match='^legacy_session_limit_incompatible$'):
        require_compatible_legacy_sessions(sessions, as_of=NOW)


def test_naive_future_duplicate_and_invalid_tokens_are_rejected_without_disclosure():
    token = str(uuid4())
    cases = [
        [LegacySession(token, datetime(2026, 1, 1))],
        [LegacySession(token, NOW + timedelta(seconds=1))],
        [LegacySession(token, NOW), LegacySession(token, NOW)],
        [LegacySession(token + 'invalid', NOW)],
    ]
    for sessions in cases:
        with pytest.raises(ValueError) as error:
            require_compatible_legacy_sessions(sessions, as_of=NOW)
        assert token not in str(error.value)


def test_non_utc_reference_is_rejected():
    with pytest.raises(ValueError, match='^legacy_reference_invalid$'):
        require_compatible_legacy_sessions([], as_of=NOW.replace(tzinfo=None))
