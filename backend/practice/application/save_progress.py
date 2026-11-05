"""Rules for saving accepted practice results using caller-provided operations."""

from collections.abc import Callable
from typing import Any


def save_progress(
    *,
    user_id: int,
    lesson: dict[str, Any],
    task: dict[str, Any],
    uses_persisted_tasks: Callable[[dict[str, Any]], bool],
    tasks_complete: Callable[[dict[str, Any], int], bool],
    is_chapter_one: Callable[[dict[str, Any]], bool],
    mark_task: Callable[[int, str, str], None],
    mark_lesson: Callable[[int, str], None],
) -> None:
    mixed = bool(lesson.get("tasks") and lesson.get("manual_practice"))
    if uses_persisted_tasks(lesson):
        mark_task(user_id, task["id"], task["revision"])
        if not mixed and tasks_complete(lesson, user_id) and not is_chapter_one(lesson):
            mark_lesson(user_id, lesson["id"])
    elif not mixed:
        mark_lesson(user_id, lesson["id"])
