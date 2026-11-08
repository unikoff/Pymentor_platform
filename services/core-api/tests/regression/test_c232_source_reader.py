import importlib.util
import sqlite3
import sys
from pathlib import Path

import pytest

SCRIPT = (Path(__file__).resolve().parents[4] / 'services/core-api/tools/migration/c232_source_reader.py')
spec = importlib.util.spec_from_file_location('c232_source_reader_test', SCRIPT)
reader = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = reader
spec.loader.exec_module(reader)


def test_reads_every_fixed_table_and_validates_before_return(monkeypatch):
    connection = sqlite3.connect(':memory:')
    for table in reader.TABLE_ORDER:
        connection.execute(f'CREATE TABLE "{table}" (id INTEGER)')
    connection.execute('INSERT INTO users VALUES (1)')
    validated = []

    def fake_preflight(tables):
        validated.append(tables)
        return {table: len(rows) for table, rows in tables.items()}

    monkeypatch.setattr(reader, 'preflight', fake_preflight)
    rows = reader.read_snapshot(connection)
    assert validated == [rows] and rows['users'] == [{'id': 1}]
    assert set(rows) == set(reader.TABLE_ORDER)
    connection.close()


def test_preflight_failure_is_redacted(monkeypatch):
    connection = sqlite3.connect(':memory:')
    for table in reader.TABLE_ORDER:
        connection.execute(f'CREATE TABLE "{table}" (id INTEGER)')

    def fail(_tables):
        raise ValueError('sensitive synthetic value')

    monkeypatch.setattr(reader, 'preflight', fail)
    with pytest.raises(reader.SourceReadError, match='^synthetic_source_invalid$') as error:
        reader.read_snapshot(connection)
    assert error.value.__suppress_context__
    connection.close()


@pytest.mark.parametrize('error,category', [
    ('Invalid row', 'source_value_invalid'),
    ('Duplicate key', 'source_duplicate_key'),
    ('Foreign key violation', 'source_foreign_key_invalid'),
])
def test_known_validation_errors_have_safe_categories(monkeypatch, error, category):
    connection = sqlite3.connect(':memory:')
    for table in reader.TABLE_ORDER:
        connection.execute(f'CREATE TABLE "{table}" (id INTEGER)')
    def fail(_tables):
        raise ValueError(error)
    monkeypatch.setattr(reader, 'preflight', fail)
    with pytest.raises(reader.SourceReadError, match=f'^{category}$') as result:
        reader.read_snapshot(connection)
    assert result.value.__suppress_context__
    connection.close()


def test_row_limit_is_fail_closed(monkeypatch):
    connection = sqlite3.connect(':memory:')
    for table in reader.TABLE_ORDER:
        connection.execute(f'CREATE TABLE "{table}" (id INTEGER)')
    connection.executemany('INSERT INTO users VALUES (?)', [(1,), (2,)])
    monkeypatch.setattr(reader, 'MAX_ROWS_PER_TABLE', 1)
    with pytest.raises(reader.SourceReadError, match='^synthetic_source_invalid$'):
        reader.read_snapshot(connection)
    connection.close()
