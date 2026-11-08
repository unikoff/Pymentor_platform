"""One-time guarded local reconciliation; never touches SQLite or Git metadata."""
from __future__ import annotations

import hashlib
import os
from pathlib import Path
import shutil
import subprocess
import sys

SOURCE = Path(__file__).resolve().parents[1]
TARGET = Path(r"C:\Project Python\Pymentor_platform")
BACKUP = Path(r"C:\Users\Unik\.codex\visualizations\2026\10\26\01a17a52-128b-7811-8664-847b3764bf62\c426-merge-backup")
ROOTS = ("backend/", "frontend/src/", "scripts/", "docs/stage-02-core/")


def git(root, *args):
    return subprocess.check_output(["git", "-C", str(root), *args], stderr=subprocess.DEVNULL)


def names(root, *args):
    return [v.decode("utf-8") for v in git(root, args[0], "-z", *args[1:]).split(b"\0") if v]


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    if len(sys.argv) != 2 or sys.argv[1] not in {"plan", "apply"}:
        raise SystemExit("expected plan or apply")
    if git(SOURCE, "rev-parse", "HEAD") != git(TARGET, "rev-parse", "HEAD"):
        raise SystemExit("checkout_heads_differ")
    changed = set(names(SOURCE, "diff", "HEAD", "--name-only", "--diff-filter=ACMRT"))
    target_changed = set(names(TARGET, "diff", "HEAD", "--name-only"))
    if changed & target_changed:
        raise SystemExit("tracked_changes_overlap")
    untracked = set(names(SOURCE, "ls-files", "--others", "--exclude-standard", "--", *ROOTS))
    # This helper itself is deliberately not part of the application merge.
    untracked.discard("scripts/local_merge_core_workspace.py")
    items = sorted(changed | untracked)
    if not items or any(not p.startswith(ROOTS) for p in items):
        raise SystemExit("unexpected_source_scope")
    records = []
    for rel in items:
        lower = rel.lower()
        if any(x in lower for x in (".git/", ".env", ".db", ".sqlite", "secret", "credential")):
            raise SystemExit("sensitive_or_database_path")
        source = SOURCE.joinpath(*rel.split("/"))
        target = TARGET.joinpath(*rel.split("/"))
        if not source.is_file() or source.is_symlink() or (target.exists() and target.is_symlink()):
            raise SystemExit(f"invalid_path: {rel}")
        if not source.resolve().is_relative_to(SOURCE.resolve()) or not target.resolve().is_relative_to(TARGET.resolve()):
            raise SystemExit("path_escape")
        source_hash = digest(source)
        target_hash = digest(target) if target.is_file() else None
        if rel in untracked and target_hash is not None and target_hash != source_hash:
            raise SystemExit("untracked_target_conflict")
        records.append((rel, source_hash, target_hash))
    print(f"guarded candidates={len(records)} replacements={sum(old is not None and old != new for _, new, old in records)}")
    if sys.argv[1] == "plan":
        return
    BACKUP.mkdir(parents=True, exist_ok=False)
    for rel, source_hash, target_hash in records:
        source, target = SOURCE / rel, TARGET / rel
        if digest(source) != source_hash or (digest(target) if target.is_file() else None) != target_hash:
            raise SystemExit("source_or_target_changed")
        if target_hash == source_hash:
            continue
        if target_hash is not None:
            saved = BACKUP / rel
            saved.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(target, saved)
        target.parent.mkdir(parents=True, exist_ok=True)
        temp = target.with_name(target.name + ".core-merge.tmp")
        if temp.exists():
            raise SystemExit("temporary_target_exists")
        shutil.copy2(source, temp)
        if digest(temp) != source_hash:
            raise SystemExit("copy_verification_failed")
        os.replace(temp, target)
    print("merge complete; SQLite and Git metadata were not touched")


if __name__ == "__main__":
    main()
