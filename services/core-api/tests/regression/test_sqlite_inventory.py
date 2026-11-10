"""Inventory reports aggregate risks without copying any row contents."""

import importlib.util
import json
import sqlite3
from pathlib import Path


def test_inventory_reports_real_length_and_normalization_collisions(tmp_path):
    script = (Path(__file__).resolve().parents[4] / 'services/core-api/tools/lab/inventory_sqlite_snapshot.py')
    spec = importlib.util.spec_from_file_location("inventory_snapshot", script)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    path = tmp_path / "synthetic.sqlite"
    con = sqlite3.connect(path)
    con.executescript("""
        CREATE TABLE users(id INTEGER PRIMARY KEY, email VARCHAR(10) UNIQUE, joined_at TEXT);
        CREATE TABLE child(id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id));
        INSERT INTO users VALUES (1,'Secret@T','2026-01-01T00:00:00Z');
        INSERT INTO users VALUES (2,'secret@t','2026-01-01T00:00:00');
        INSERT INTO users VALUES (3,'too-long-for-column','2026-01-01T00:00:00Z');
        INSERT INTO child VALUES (1,999);
    """)
    con.close()

    report = module.inspect(path)
    assert report["tables"]["users"]["row_count"] == 3
    assert report["tables"]["users"]["length_limit_violations"]["email"] == {"limit": 10, "count": 1}
    assert report["normalized_ascii_lower_trim_collision_groups"]["users.email"] == 1
    assert report["tables"]["users"]["temporal_shapes"]["joined_at"]["offset_shape_counts"] == {
        "no_offset": 1, "offset_or_z": 2,
    }
    assert report["foreign_key_violation_counts"][0]["count"] == 1
    assert "Secret@T" not in json.dumps(report)
