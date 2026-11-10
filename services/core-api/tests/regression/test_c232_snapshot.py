import os
import sqlite3
import pytest
from tools.lab.storage.c232_mapping import TABLE_MAPPINGS
from tools.lab.storage.c232_mapping import TABLE_ORDER
from tools.lab.storage.c232_snapshot import SnapshotReadError
from tools.lab.storage.c232_snapshot import read_local_snapshot

def _sql_type(kind):
    return {'integer': 'INTEGER', 'boolean': 'INTEGER', 'string': 'VARCHAR', 'text': 'TEXT', 'date': 'DATE', 'timestamp': 'DATETIME'}[kind]

def _create_snapshot(path):
    connection = sqlite3.connect(path)
    for table in TABLE_ORDER:
        columns = []
        for col in TABLE_MAPPINGS[table].columns:
            sql = f'"{col.name}" {_sql_type(col.kind)}'
            if col.name == 'id' or (table == 'landing_notification_delivery_state' and col.name == 'destination_config_id'):
                sql += ' PRIMARY KEY'
            if not col.nullable:
                sql += ' NOT NULL'
            if col.references:
                target, target_column = col.references.split('.')
                sql += f' REFERENCES "{target}"("{target_column}")'
            columns.append(sql)
        connection.execute(f'''CREATE TABLE "{table}" ({', '.join(columns)})''')
    connection.commit()
    for table in TABLE_ORDER:
        spec = TABLE_MAPPINGS[table]
        values = []
        for col in spec.columns:
            if col.nullable:
                value = None
            elif col.kind == 'integer':
                value = 1
            elif col.kind == 'boolean':
                value = 0
            elif col.kind in ('date', 'timestamp'):
                value = '2026-01-01' if col.kind == 'date' else '2026-01-01T00:00:00+00:00'
            elif col.json_text:
                value = '{}'
            elif col.name.endswith('_id') and col.references:
                parent = col.references.split('.')[0]
                value = 'x' if TABLE_MAPPINGS[parent].columns[0].kind == 'string' else 1
            else:
                value = 'x'
            values.append(value)
        names = ','.join((f'"{col.name}"' for col in spec.columns))
        placeholders = ','.join(('?' for _ in values))
        connection.execute(f'INSERT INTO "{table}" ({names}) VALUES ({placeholders})', values)
    connection.commit()
    connection.close()

def _files(path):
    return {item.name: item.read_bytes() for item in path.parent.glob(path.name + '*') if item.is_file()}

def test_import_source_is_restricted_to_synthetic_input_area(tmp_path, monkeypatch):
    import tools.migration.c232_import as c232_import
    monkeypatch.setattr(c232_import.old.source_guard, 'CLI_SANDBOX', tmp_path)
    outside = tmp_path / 'outside.sqlite'
    _create_snapshot(outside)
    with pytest.raises(ValueError, match='source_outside_synthetic_area'):
        c232_import.load_source(str(outside))
    inputs = tmp_path / 'inputs'
    inputs.mkdir()
    source = inputs / 'synthetic.sqlite'
    _create_snapshot(source)
    with pytest.raises(ValueError, match='source_identity_not_synthetic'):
        c232_import.load_source(str(source))
    with sqlite3.connect(source) as connection:
        for table in ('users', 'admins'):
            connection.execute(f"UPDATE {table} SET username='synthetic_test', email='test@example.test'")
    rows, digest = c232_import.load_source(str(source))
    assert len(rows) == 15
    assert len(digest) == 64
    assert 'synthetic_test' not in repr(read_local_snapshot(source))

def test_local_copy_requires_private_directory_and_standalone_file(tmp_path, monkeypatch):
    import tools.migration.c232_import as c232_import
    monkeypatch.setattr(c232_import.old, 'ROOT', tmp_path)
    inputs = tmp_path / 'output' / 'c232-local-copy-sandbox' / 'inputs'
    inputs.mkdir(parents=True)
    source = inputs / 'prepared.sqlite'
    _create_snapshot(source)
    monkeypatch.setattr(c232_import, 'private_copy_acl', lambda *_: False)
    with pytest.raises(ValueError, match='local_copy_directory_unverified'):
        c232_import.load_source(str(source), allow_local_copy=True)
    monkeypatch.setattr(c232_import, 'private_copy_acl', lambda *_: True)
    rows, _ = c232_import.load_source(str(source), allow_local_copy=True)
    assert len(rows) == 15
    sidecar = inputs / 'prepared.sqlite-wal'
    sidecar.write_bytes(b'test')
    with pytest.raises(ValueError, match='local_copy_not_standalone'):
        c232_import.load_source(str(source), allow_local_copy=True)
    sidecar.unlink()
    link = inputs / 'hardlink.sqlite'
    try:
        os.link(source, link)
    except OSError:
        pytest.skip('hard links unavailable on this test filesystem')
    with pytest.raises(ValueError, match='local_copy_not_standalone'):
        c232_import.load_source(str(link), allow_local_copy=True)

def test_naive_utc_is_opt_in_and_part_of_import_identity(tmp_path, monkeypatch):
    from datetime import timezone
    import tools.migration.c232_import as c232_import
    monkeypatch.setattr(c232_import.old, 'ROOT', tmp_path)
    monkeypatch.setattr(c232_import, 'private_copy_acl', lambda *_: True)
    inputs = tmp_path / 'output' / 'c232-local-copy-sandbox' / 'inputs'
    inputs.mkdir(parents=True)
    source = inputs / 'prepared.sqlite'
    _create_snapshot(source)
    with sqlite3.connect(source) as connection:
        connection.execute("UPDATE sessions SET created_at='2026-01-01 12:00:00'")
    before = source.read_bytes()
    with pytest.raises(SnapshotReadError):
        c232_import.load_source(str(source), allow_local_copy=True)
    rows, utc_identity = c232_import.load_source(str(source), allow_local_copy=True, assume_naive_utc=True)
    assert rows['sessions'][0]['created_at'].tzinfo is timezone.utc
    assert source.read_bytes() == before
    with sqlite3.connect(source) as connection:
        connection.execute("UPDATE sessions SET created_at='2026-01-01T12:00:00+00:00'")
    _, explicit_identity = c232_import.load_source(str(source), allow_local_copy=True)
    assert utc_identity != explicit_identity

def test_reads_all_mapped_tables_without_changing_source(tmp_path):
    source = tmp_path / 'prepared.sqlite'
    _create_snapshot(source)
    before = _files(source)
    snapshot = read_local_snapshot(source)
    assert snapshot.row_counts == {table: 1 for table in TABLE_ORDER}
    assert len(snapshot.identity) == 64
    assert _files(source) == before

def test_identity_is_repeatable_and_changes_with_read_data(tmp_path):
    source = tmp_path / 'prepared.sqlite'
    _create_snapshot(source)
    first = read_local_snapshot(source).identity
    assert read_local_snapshot(source).identity == first
    connection = sqlite3.connect(source)
    connection.execute("UPDATE users SET username='changed'")
    connection.commit()
    connection.close()
    assert read_local_snapshot(source).identity != first

def test_reads_committed_wal_state_without_modifying_files(tmp_path):
    source = tmp_path / 'prepared.sqlite'
    _create_snapshot(source)
    connection = sqlite3.connect(source)
    connection.execute('PRAGMA journal_mode=WAL')
    connection.execute("UPDATE users SET username='wal-value'")
    connection.commit()
    assert (tmp_path / 'prepared.sqlite-wal').exists()
    before = _files(source)
    try:
        identity = read_local_snapshot(source).identity
        assert identity == read_local_snapshot(source).identity
        after = _files(source)
        assert after[source.name] == before[source.name]
        assert after[source.name + '-wal'] == before[source.name + '-wal']
    finally:
        connection.close()

def test_missing_file_is_not_created(tmp_path):
    missing = tmp_path / 'absent.sqlite'
    with pytest.raises(SnapshotReadError) as exc:
        read_local_snapshot(missing)
    assert exc.value.category == 'source_missing'
    assert not missing.exists()
    assert str(missing) not in str(exc.value)

def test_invalid_row_is_reported_without_source_values(tmp_path):
    source = tmp_path / 'prepared.sqlite'
    _create_snapshot(source)
    connection = sqlite3.connect(source)
    connection.execute("UPDATE users SET email='private-sensitive-value'")
    connection.execute('INSERT INTO users SELECT 2, username, email, password_hash, subscription_until, subscription_plan, is_admin FROM users WHERE id=1')
    connection.commit()
    connection.close()
    with pytest.raises(SnapshotReadError) as exc:
        read_local_snapshot(source)
    assert exc.value.category == 'duplicate_key'
    assert 'private-sensitive-value' not in str(exc.value)
    assert str(source) not in str(exc.value)

def test_schema_drift_is_rejected_without_details(tmp_path):
    source = tmp_path / 'prepared.sqlite'
    _create_snapshot(source)
    connection = sqlite3.connect(source)
    connection.execute('ALTER TABLE users ADD COLUMN private_column TEXT')
    connection.commit()
    connection.close()
    with pytest.raises(SnapshotReadError) as exc:
        read_local_snapshot(source)
    assert exc.value.category == 'schema_invalid'
    assert 'private_column' not in str(exc.value)
