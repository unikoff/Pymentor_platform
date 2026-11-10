"""Inventory a static SQLite snapshot without exporting any user row values."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sqlite3
from collections import Counter
from pathlib import Path


def quoted(value: str) -> str:
    return '"' + value.replace('"', '""') + '"'


def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def inspect(snapshot: Path) -> dict:
    before = digest(snapshot)
    con = sqlite3.connect(
        snapshot.resolve().as_uri() + "?mode=ro&immutable=1", uri=True
    )
    try:
        con.execute("PRAGMA query_only = ON")
        rows = con.execute(
            "SELECT name, sql FROM sqlite_master WHERE type='table' "
            "AND name NOT LIKE 'sqlite_%' ORDER BY name"
        ).fetchall()
        tables = {}
        for name, ddl in rows:
            table = quoted(name)
            info = con.execute(f"PRAGMA table_info({table})").fetchall()
            cols = []
            for _, col, kind, nonnull, default, pk in info:
                nulls = con.execute(
                    f"SELECT COUNT(*) FROM {table} WHERE {quoted(col)} IS NULL"
                ).fetchone()[0]
                cols.append(
                    {
                        "name": col,
                        "type": kind,
                        "not_null": bool(nonnull),
                        "has_default": default is not None,
                        "primary_key_position": pk,
                        "null_count": nulls,
                    }
                )
            indexes = []
            for _, index, unique, origin, partial in con.execute(
                f"PRAGMA index_list({table})"
            ):
                fields = [
                    r[2] for r in con.execute(f"PRAGMA index_info({quoted(index)})")
                ]
                item = {
                    "name": index,
                    "unique": bool(unique),
                    "origin": origin,
                    "partial": bool(partial),
                    "columns": fields,
                }
                if (
                    unique
                    and not partial
                    and fields
                    and all(field is not None for field in fields)
                ):
                    selected = ", ".join(quoted(field) for field in fields)
                    where = " AND ".join(
                        f"{quoted(field)} IS NOT NULL" for field in fields
                    )
                    item["duplicate_groups"] = con.execute(
                        f"SELECT COUNT(*) FROM (SELECT 1 FROM {table} WHERE {where} "
                        f"GROUP BY {selected} HAVING COUNT(*) > 1)"
                    ).fetchone()[0]
                indexes.append(item)
            foreign_keys = [
                {
                    "id": r[0],
                    "sequence": r[1],
                    "target_table": r[2],
                    "from": r[3],
                    "to": r[4],
                    "on_update": r[5],
                    "on_delete": r[6],
                }
                for r in con.execute(f"PRAGMA foreign_key_list({table})")
            ]
            temporal = {}
            text_lengths = {}
            length_limit_violations = {}
            boolean_invalid = {}
            invalid_json = {}
            for col in cols:
                field = col["name"]
                field_sql = quoted(field)
                if field.endswith(("_at", "_date", "_until")):
                    kinds = {
                        str(kind): count
                        for kind, count in con.execute(
                            f"SELECT typeof({field_sql}), COUNT(*) FROM {table} GROUP BY typeof({field_sql})"
                        )
                    }
                    patterns = dict(
                        con.execute(
                            f"SELECT CASE WHEN {field_sql} IS NULL THEN 'null' "
                            f"WHEN typeof({field_sql}) != 'text' THEN 'non_text' "
                            f"WHEN length({field_sql}) = 10 THEN 'date_only' "
                            f"WHEN substr({field_sql},-1) IN ('Z','z') "
                            f"OR instr(substr({field_sql},12),'+') > 0 "
                            f"OR instr(substr({field_sql},12),'-') > 0 THEN 'offset_or_z' "
                            f"ELSE 'no_offset' END AS pattern, COUNT(*) FROM {table} GROUP BY pattern"
                        )
                    )
                    temporal[field] = {
                        "sqlite_storage_types": kinds,
                        "offset_shape_counts": patterns,
                    }
                if any(
                    kind in col["type"].upper() for kind in ("CHAR", "TEXT", "CLOB")
                ):
                    text_lengths[field] = con.execute(
                        f"SELECT MAX(length({field_sql})) FROM {table}"
                    ).fetchone()[0]
                    length_match = re.search(
                        r"(?:VAR)?CHAR\s*\(\s*(\d+)\s*\)", col["type"], re.IGNORECASE
                    )
                    if length_match:
                        limit = int(length_match.group(1))
                        count = con.execute(
                            f"SELECT COUNT(*) FROM {table} WHERE length({field_sql}) > ?",
                            (limit,),
                        ).fetchone()[0]
                        length_limit_violations[field] = {
                            "limit": limit,
                            "count": count,
                        }
                if "BOOL" in col["type"].upper():
                    boolean_invalid[field] = con.execute(
                        f"SELECT COUNT(*) FROM {table} WHERE {field_sql} IS NOT NULL AND {field_sql} NOT IN (0,1)"
                    ).fetchone()[0]
                if field.endswith("_json"):
                    invalid_json[field] = con.execute(
                        f"SELECT COUNT(*) FROM {table} WHERE {field_sql} IS NOT NULL AND NOT json_valid({field_sql})"
                    ).fetchone()[0]
            tables[name] = {
                "ddl": ddl,
                "row_count": con.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0],
                "columns": cols,
                "indexes": indexes,
                "foreign_keys": foreign_keys,
                "temporal_shapes": temporal,
                "maximum_text_lengths": text_lengths,
                "length_limit_violations": length_limit_violations,
                "invalid_boolean_counts": boolean_invalid,
                "invalid_json_counts": invalid_json,
            }
        normalized_collisions = {}
        for table_name, field in (
            ("users", "email"),
            ("admins", "email"),
            ("landings", "slug"),
        ):
            if table_name in tables and field in {
                c["name"] for c in tables[table_name]["columns"]
            }:
                table_sql, field_sql = quoted(table_name), quoted(field)
                normalized_collisions[f"{table_name}.{field}"] = con.execute(
                    f"SELECT COUNT(*) FROM (SELECT 1 FROM {table_sql} WHERE {field_sql} IS NOT NULL "
                    f"GROUP BY lower(trim({field_sql})) HAVING COUNT(*) > 1)"
                ).fetchone()[0]
        fk = Counter(
            (r[0], r[2], r[3]) for r in con.execute("PRAGMA foreign_key_check")
        )
        integrity = [row[0] for row in con.execute("PRAGMA integrity_check")]
    finally:
        con.close()
    after = digest(snapshot)
    if before != after:
        raise RuntimeError("Snapshot changed during inspection; discard this report")
    return {
        "source_kind": "read-only static local snapshot",
        "snapshot_sha256": before,
        "integrity_check": integrity,
        "foreign_key_violation_counts": [
            {
                "table": key[0],
                "parent_table": key[1],
                "foreign_key_id": key[2],
                "count": value,
            }
            for key, value in sorted(fk.items())
        ],
        "normalized_ascii_lower_trim_collision_groups": normalized_collisions,
        "tables": tables,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("snapshot", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    result = inspect(args.snapshot)
    args.output.write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(
        f"Tables: {len(result['tables'])}; integrity: {result['integrity_check']}; "
        f"foreign-key violations: {sum(item['count'] for item in result['foreign_key_violation_counts'])}"
    )


if __name__ == "__main__":
    main()
