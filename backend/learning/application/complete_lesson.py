"""Manual lesson completion workflow.

The caller supplies the authenticated principal, canonical lesson metadata,
access policy, progress reader and persistence operations. No storage adapter
or HTTP framework dependency is required here.
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from identity.principal import Principal


Lesson = dict[str, Any]


class CompletionError(Exception):
    """A rejected completion, translated into the existing HTTP contract by the façade."""

    def __init__(self, status_code: int, detail: str | None) -> None:
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)


@dataclass(frozen=True, slots=True)
class CompletionPolicy:
    access: Callable[[Lesson, Principal], tuple[bool, str | None]]
    uses_persisted_tasks: Callable[[Lesson], bool]
    tasks_complete: Callable[[Lesson, int], bool]
    needs_chapter_one_marker: Callable[[Lesson], bool]
    is_chapter_one: Callable[[Lesson], bool]


@dataclass(frozen=True, slots=True)
class CompletionWrites:
    mark_chapter_one_self_check: Callable[[int, Lesson], None]
    mark_lesson: Callable[[int, str], None]


def complete_lesson(
    *,
    principal: Principal,
    lesson: Lesson | None,
    policy: CompletionPolicy,
    writes: CompletionWrites,
) -> dict[str, str | bool]:
    """Apply the existing manual-completion rules to the canonical lesson ID."""
    if lesson is None:
        raise CompletionError(404, "Lesson not found")

    available, locked_reason = policy.access(lesson, principal)
    if not available:
        raise CompletionError(403, locked_reason)

    if not lesson.get("self_check"):
        raise CompletionError(400, "Этот урок засчитывается автоматически после решения практики.")

    if policy.uses_persisted_tasks(lesson) and not policy.tasks_complete(lesson, principal.id):
        raise CompletionError(400, "Сначала завершите все редакторские задания.")

    # Aliases may resolve the lesson, but only the stable catalog ID is persisted.
    if policy.needs_chapter_one_marker(lesson):
        writes.mark_chapter_one_self_check(principal.id, lesson)
    elif not policy.is_chapter_one(lesson):
        writes.mark_lesson(principal.id, lesson["id"])

    return {"lesson_id": lesson["id"], "completed": True}
