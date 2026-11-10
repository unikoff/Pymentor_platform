from datetime import date
from datetime import datetime
from datetime import timedelta
from datetime import timezone
from zoneinfo import ZoneInfo

import pytest

from tools.lab.storage import c232_import_types as types


@pytest.mark.parametrize('value, expected', [(0, False), (1, True), (False, False), (True, True)])
def test_boolean_accepts_only_sqlite_boolean_values(value, expected):
    assert types.to_boolean(value) is expected


@pytest.mark.parametrize('value', [2, -1, 0.0, 1.0, '1', 'true', '', b'1'])
def test_boolean_rejects_coercion(value):
    with pytest.raises(ValueError):
        types.to_boolean(value)


@pytest.mark.parametrize('value', [True, False, 1.0, '1', '', b'1'])
def test_integer_rejects_non_integer_and_boolean(value):
    with pytest.raises(ValueError):
        types.to_integer(value)


def test_integer_keeps_signed_values():
    assert types.to_integer(-123) == -123
    assert types.to_integer(0) == 0


def test_date_accepts_iso_date_and_date_object():
    assert types.to_date('2024-02-29') == date(2024, 2, 29)
    assert types.to_date(date(2020, 1, 2)) == date(2020, 1, 2)


@pytest.mark.parametrize('value', ['', '2023-02-29', '20240101', '2024-01-01T00:00:00', datetime(2024, 1, 1), 1])
def test_date_rejects_invalid_or_lossy_values(value):
    with pytest.raises(ValueError):
        types.to_date(value)


def test_timestamp_normalizes_offset_to_utc():
    assert types.to_timestamp('2024-01-02T03:04:05+03:00') == datetime(2024, 1, 2, 0, 4, 5, tzinfo=timezone.utc)
    assert types.to_timestamp(datetime(2024, 1, 2, tzinfo=timezone(timedelta(hours=-5)))) == datetime(2024, 1, 2, 5, tzinfo=timezone.utc)
    assert types.to_timestamp('2024-01-02T03:04:05Z').tzinfo is timezone.utc


@pytest.mark.parametrize('value', [
    '2024-01-02T03:04:05.1234569Z',
    '2024-01-02T03:04:05+03:00:00.1234569',
    '2024-01-02T03:04.5Z',
])
def test_timestamp_rejects_lossy_or_ambiguous_fraction(value):
    with pytest.raises(ValueError, match='Invalid timestamp'):
        types.to_timestamp(value)


def test_timestamp_accepts_exact_microsecond_precision():
    assert types.to_timestamp('2024-01-02T03:04:05.123456Z').microsecond == 123456


@pytest.mark.parametrize('value', ['2024-01-02T03:04:05', datetime(2024, 1, 2), '', '2024-01-02', 0])
def test_timestamp_rejects_naive_and_invalid_values_by_default(value):
    with pytest.raises(ValueError):
        types.to_timestamp(value)


def test_timestamp_assumes_timezone_only_when_explicit():
    result = types.to_timestamp('2024-01-02T03:04:05', assumed_timezone=timezone(timedelta(hours=3)))
    assert result == datetime(2024, 1, 2, 0, 4, 5, tzinfo=timezone.utc)


@pytest.mark.parametrize('value', ['2024-03-10T02:30:00', '2024-11-03T01:30:00'])
def test_timestamp_rejects_nonexistent_or_ambiguous_assumed_local_time(value):
    with pytest.raises(ValueError):
        types.to_timestamp(value, assumed_timezone=ZoneInfo('America/New_York'))


def test_null_is_preserved_and_empty_text_is_not_null():
    for convert in (types.to_boolean, types.to_integer, types.to_date, types.to_timestamp, types.to_text,
                    types.validate_json_text):
        assert convert(None) is None
    assert types.to_text('') == ''
    assert types.to_text('  ') == '  '
    with pytest.raises(ValueError):
        types.to_text(1)


def test_json_validation_preserves_original_text():
    original = ' {"name": "synthetic", "items": [1, null]} '
    assert types.validate_json_text(original) == original


@pytest.mark.parametrize('value', ['', '{', '{"n": NaN}', '{"n": Infinity}', 1, b'{}'])
def test_json_validation_rejects_invalid_values_without_disclosing_them(value):
    import traceback
    with pytest.raises(ValueError) as exc:
        types.validate_json_text(value)
    assert repr(value) not in ''.join(traceback.format_exception_only(exc.type, exc.value))


@pytest.mark.parametrize('convert', [types.to_boolean, types.to_integer, types.to_date, types.to_timestamp])
def test_errors_and_tracebacks_do_not_include_input(convert):
    import traceback

    secret = 'sensitive-payload-123'
    with pytest.raises(ValueError) as exc:
        convert(secret)
    assert secret not in ''.join(traceback.format_exception(exc.type, exc.value, exc.tb))
