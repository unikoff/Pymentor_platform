"""Legacy migration helper; ordinary Stage 5 uses one sequential checkout."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import tempfile
from pathlib import Path


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def git(repo: Path, *args: str) -> str:
    result = subprocess.run(
        ["git", "-C", str(repo), *args], capture_output=True, text=True,
        encoding="utf-8", errors="replace", check=False,
    )
    if result.returncode:
        raise ValueError(result.stderr.strip() or "Git command failed")
    return result.stdout.strip()


def atomic_write(path: Path, data: bytes) -> None:
    fd, temp = tempfile.mkstemp(prefix=".stage5-sync-", dir=path.parent)
    try:
        with os.fdopen(fd, "wb") as stream:
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temp, path)
    finally:
        if os.path.exists(temp):
            os.unlink(temp)


def sync(source_root: Path, central_root: Path, chapter: int, allow_dirty: bool = False) -> dict:
    relative = Path("chapters") / f"chapter-{chapter:02d}" / "knowledge.md"
    source_root = source_root.resolve(strict=True)
    central_root = central_root.resolve(strict=True)
    source = source_root / relative
    target = central_root / relative
    if source.resolve() == target.resolve():
        raise ValueError("Source and destination must be different files")
    if not source.is_file() or not target.parent.is_dir():
        raise ValueError("Source file or destination chapter directory does not exist")
    # Reject redirected source/target paths outside the roots.
    if not source.resolve().is_relative_to(source_root) or not target.resolve().is_relative_to(central_root):
        raise ValueError("Resolved paths must remain inside their respective roots")
    repo = Path(git(source_root, "rev-parse", "--show-toplevel"))
    relative_to_repo = source.resolve().relative_to(repo.resolve()).as_posix()
    head = git(repo, "rev-parse", "HEAD")
    dirty = bool(git(repo, "status", "--porcelain=v1", "--", relative_to_repo))
    if dirty and not allow_dirty:
        raise ValueError("Source knowledge has uncommitted changes; sync after the lesson commit")
    metadata = target.with_name("knowledge.sync.json")
    lock = target.with_name(".knowledge.sync.lock")
    try:
        fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    except FileExistsError as exc:
        raise ValueError("Another sync or a stale lock exists; inspect before retrying") from exc
    os.close(fd)
    try:
        data = source.read_bytes()
        new_hash = digest(data)
        old = target.read_bytes() if target.exists() else None
        previous = json.loads(metadata.read_text(encoding="utf-8")) if metadata.exists() else None
        if previous:
            if previous.get("source") != str(source):
                raise ValueError("Source differs from recorded source; reconcile before switching")
            previous_head = previous.get("source_head")
            if not isinstance(previous_head, str) or subprocess.run(
                ["git", "-C", str(repo), "merge-base", "--is-ancestor", previous_head, head],
                capture_output=True, check=False,
            ).returncode:
                raise ValueError("Source history moved backwards or diverged; reconcile before syncing")
            if old is None or digest(old) != previous.get("sha256"):
                raise ValueError("Central knowledge changed since previous sync; preserve and reconcile")
        elif old is not None and digest(old) != new_hash:
            raise ValueError("Existing central knowledge differs and has no sync record; reconcile")
        if digest(source.read_bytes()) != new_hash:
            raise ValueError("Source changed during sync; retry after it is stable")
        if old != data:
            atomic_write(target, data)
        record = {
            "chapter": chapter, "source": str(source), "source_head": head,
            "source_uncommitted": dirty, "sha256": new_hash,
        }
        atomic_write(metadata, (json.dumps(record, ensure_ascii=False, indent=2) + "\n").encode("utf-8"))
        return {"target": str(target), "metadata": str(metadata), **record}
    finally:
        lock.unlink(missing_ok=True)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--central-root", type=Path, required=True)
    parser.add_argument("--chapter", type=int, required=True, choices=range(1, 100))
    parser.add_argument("--allow-dirty-snapshot", action="store_true", help="Explicitly record an uncommitted initial snapshot")
    parser.add_argument("--legacy-migration", action="store_true", help="Explicitly request historical migration; not part of the sequential Stage 5 workflow")
    args = parser.parse_args()
    if not args.legacy_migration:
        parser.error("Stage 5 uses one sequential checkout; mirroring is a legacy migration only")
    try:
        result = sync(args.source_root, args.central_root, args.chapter, args.allow_dirty_snapshot)
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(f"Knowledge sync stopped: {error}", file=sys.stderr)
        return 1
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
