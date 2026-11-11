"""Pure lesson progress policy and stable completion markers."""

import hashlib
import json
import re


# Stable IDs of optional practice tasks; all other tasks are required by default.
OPTIONAL_TASK_IDS = frozenset({"lesson-b504d05e6763add4db882bfe-task-05"})


def is_overview_lesson(lesson: dict) -> bool:
    """Chapter overview pages are complete from the start, without a saved marker."""
    parts = str(lesson.get("source_file", "")).replace("\\", "/").split("/")
    return (
        len(parts) == 3
        and bool(re.fullmatch(r"chapter_\d+", parts[0]))
        and parts[1] == "block_00"
    )


def is_countable_lesson(lesson: dict) -> bool:
    return is_overview_lesson(lesson) or bool(
        lesson.get("tasks") or lesson.get("self_check")
    )


def is_task_required(task: dict) -> bool:
    """Tasks are required by default; only explicit metadata or this stable mapping can opt out."""
    return task.get("required") is not False and task.get("id") not in OPTIONAL_TASK_IDS


def required_lesson_tasks(lesson: dict) -> list[dict]:
    return [task for task in lesson.get("tasks", []) if is_task_required(task)]


def chapter_one_completion_task_id(lesson_id: str) -> str:
    """Stable internal progress key for a chapter 01 manual self-check."""
    return f"__pymentor_lesson_completion__:{lesson_id}"


def chapter_one_completion_revision(lesson: dict) -> str:
    """Tie a saved self-check to its current authored content without a schema change."""
    authored_check = {
        "self_check": lesson.get("self_check"),
        "manual_practice": lesson.get("manual_practice", []),
    }
    serialized = json.dumps(
        authored_check,
        sort_keys=True,
        ensure_ascii=False,
        separators=(",", ":"),
        default=str,
    )
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()
