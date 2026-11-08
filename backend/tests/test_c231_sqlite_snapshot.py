"""Local synthetic checks for a consistent SQLite backup in WAL mode."""

import sqlite3
from contextlib import closing


def test_online_backup_excludes_uncommitted_wal_transaction(tmp_path):
    source_path = tmp_path / "source.sqlite"
    before_path = tmp_path / "before.sqlite"
    after_path = tmp_path / "after.sqlite"
    writer = sqlite3.connect(source_path)
    reader = sqlite3.connect(source_path)
    try:
        assert writer.execute("PRAGMA journal_mode=WAL").fetchone()[0].lower() == "wal"
        writer.execute("CREATE TABLE synthetic_progress (id INTEGER PRIMARY KEY, value TEXT NOT NULL)")
        writer.execute("INSERT INTO synthetic_progress VALUES (1, 'committed')")
        writer.commit()
        writer.execute("BEGIN IMMEDIATE")
        writer.executemany("INSERT INTO synthetic_progress VALUES (?, ?)", [(2, "pending-a"), (3, "pending-b")])

        with closing(sqlite3.connect(before_path)) as target:
            reader.backup(target)
            assert target.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
            assert target.execute("SELECT id FROM synthetic_progress ORDER BY id").fetchall() == [(1,)]

        writer.commit()
        with closing(sqlite3.connect(after_path)) as target:
            reader.backup(target)
            assert target.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
            assert target.execute("SELECT id FROM synthetic_progress ORDER BY id").fetchall() == [(1,), (2,), (3,)]
    finally:
        writer.close()
        reader.close()
