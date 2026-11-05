"""Read-only inventory of StudyHub history; commit labels are not checkpoints."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path


LESSON = re.compile(r"(?:заняти[еяю]|lesson)\s+(\d+(?:\.\d+)*)", re.IGNORECASE)


def git(repo: Path, *args: str) -> str:
    result = subprocess.run(
        ["git", "-C", str(repo), *args], capture_output=True, text=True,
        encoding="utf-8", errors="replace", check=False,
    )
    if result.returncode:
        raise ValueError(result.stderr.strip() or "Git command failed")
    return result.stdout


def inventory(repo: Path, requested: str | None = None) -> dict:
    root = Path(git(repo, "rev-parse", "--show-toplevel").strip())
    head = git(repo, "rev-parse", "HEAD").strip()
    status = subprocess.run(
        ["git", "-C", str(repo), "status", "--porcelain=v1", "--untracked-files=normal"],
        capture_output=True, text=True, encoding="utf-8", errors="replace", check=False,
    )
    if status.returncode:
        raise ValueError(status.stderr.strip() or "Cannot inspect working tree")
    log = git(repo, "log", "--all", "--reverse", "-z", "--format=%H%x1f%P%x1f%s")
    items = []
    for record in log.split("\0"):
        if not record.strip():
            continue
        sha, parents, subject = record.strip("\n").split("\x1f", 2)
        match = LESSON.search(subject)
        if not match or (requested is not None and match.group(1) != requested):
            continue
        items.append({"lesson_label": match.group(1), "commit": sha,
                      "parents": parents.split(), "subject": subject,
                      "status": "CANDIDATE_NOT_VERIFIED"})
    return {"repository": str(root), "head": head,
            "worktree_dirty": True if status.stdout else (None if status.stderr.strip() else False),
            "worktree_complete": not bool(status.stderr.strip()),
            "worktree_warning": status.stderr.strip() or None,
            "scope": "all local refs; subject labels are not lesson identities or verified checkpoints",
            "requested_label": requested, "candidates": items}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("repository", type=Path)
    parser.add_argument("--lesson", help="Exact historical string label, e.g. 3.1")
    args = parser.parse_args()
    if args.lesson and not re.fullmatch(r"\d+(?:\.\d+)*", args.lesson):
        parser.error("--lesson must be a numeric string such as 3.1")
    try:
        result = inventory(args.repository, args.lesson)
    except (OSError, ValueError) as error:
        print(f"Cannot inspect history: {error}", file=sys.stderr)
        return 1
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
