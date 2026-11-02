"""Course access, material delivery and solution submission workflows."""

import logging
import os
from copy import deepcopy
from time import perf_counter
from typing import Any

from fastapi import HTTPException, Request, status
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from content.practice.runner.python import run_python_code, run_python_preview, run_python_task
from content.practice.runner.executor import RunnerBusy, RunnerUnavailable, get_runner_executor
from db import models
from db.engine import SessionLocal
from content.catalog import (
    default_track_id,
    find_lesson,
    find_lesson_by_task,
    find_task,
    get_content_revision,
    find_track,
    get_public_lessons,
    get_tracks_summary,
)
from routers.accounts import service as accounts
from . import progress
from .access import get_optional_user, get_lesson_access
from .schemas import CodeSubmitRequest, InterpreterRunRequest


logger = logging.getLogger("pymentor.runner")
RUNNER_ENABLED_ENV = "PYMENTOR_PUBLIC_RUNNER_ENABLED"


def _require_runner_enabled() -> None:
    """Fail closed unless public code execution is explicitly enabled by deployment config."""
    if os.getenv(RUNNER_ENABLED_ENV, "").strip().lower() not in {"1", "true", "yes", "on"}:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Runner execution is temporarily disabled",
            headers={"Retry-After": "60"},
        )


def _uses_persisted_task_progress(lesson: dict) -> bool:
    source_file = str(lesson.get("source_file", ""))
    return source_file.startswith(("foundations/block_03/", "chapter_01/"))


def _chapter_one_needs_self_check_progress(lesson: dict) -> bool:
    return _is_chapter_one_lesson(lesson) and bool(lesson.get("self_check")) and (
        bool(lesson.get("manual_practice")) or not lesson.get("tasks")
    )


def _lesson_progress_task_ids(lesson: dict) -> list[str]:
    if not _uses_persisted_task_progress(lesson):
        return []
    task_ids = [task["id"] for task in lesson.get("tasks", [])]
    if lesson["id"] == "lesson-fa661256326bd13784d1c88d":
        # Read historical completion even though the old code task no longer exists.
        task_ids.append("lesson-fa661256326bd13784d1c88d-task-01")
    if _chapter_one_needs_self_check_progress(lesson):
        task_ids.append(progress.chapter_one_completion_task_id(lesson["id"]))
    return task_ids


def _lesson_tasks_are_complete(lesson: dict, user_id: int, db: Session) -> bool:
    tasks = progress.required_lesson_tasks(lesson)
    if not tasks:
        return True

    completed_revisions = progress.get_completed_task_revisions(
        user_id=user_id,
        task_ids=[task["id"] for task in tasks],
        db=db,
    )
    return all(completed_revisions.get(task["id"]) == task.get("revision") for task in tasks)


def _lesson_completion_status(lesson: dict, completed_ids: set[str], task_revisions: dict[str, str]) -> bool:
    if lesson["id"] not in completed_ids:
        stored_lesson_completion = False
    else:
        stored_lesson_completion = True

    if _is_chapter_one_lesson(lesson):
        # Historical lesson-only rows predate per-card revision tracking. Keep
        # them visible; all completions created by this version use current
        # task revisions (and a private self-check key for mixed practice).
        if stored_lesson_completion:
            return True
        # Preserve completions earned under the previously required 20.1 task.
        # New completions require the project self-check.
        if (lesson["id"] == "lesson-fa661256326bd13784d1c88d"
                and task_revisions.get("lesson-fa661256326bd13784d1c88d-task-01")
                == "fc0a533cfbb824248e6d6f6031e019045c4a77c07030a920a0e226a6953c5675"):
            return True
        tasks = lesson.get("tasks", [])
        required_tasks = progress.required_lesson_tasks(lesson)
        all_tasks_complete = all(
            task_revisions.get(task["id"]) == task.get("revision")
            for task in required_tasks
        )
        if required_tasks and not all_tasks_complete:
            return False
        if lesson.get("manual_practice") or not tasks:
            if not _chapter_one_needs_self_check_progress(lesson):
                return False
            marker_id = progress.chapter_one_completion_task_id(lesson["id"])
            return task_revisions.get(marker_id) == progress.chapter_one_completion_revision(lesson)
        return bool(required_tasks) and all_tasks_complete

    if not _uses_persisted_task_progress(lesson) or not lesson.get("tasks"):
        return stored_lesson_completion

    all_tasks_complete = all(
        task_revisions.get(task["id"]) == task.get("revision")
        for task in lesson["tasks"]
    )
    if lesson.get("manual_practice"):
        return stored_lesson_completion and all_tasks_complete
    return all_tasks_complete


def build_lessons_payload(track_id: str, user: models.User | None, db: Session, lesson_id: str | None = None) -> list[dict]:
    lessons = get_public_lessons(track_id)
    if lesson_id is not None:
        lessons = [lesson for lesson in lessons if lesson["id"] == lesson_id]
    completed_ids = progress.get_completed_lesson_ids(user.id, db) if user else set()
    tracked_progress_ids = [
        task_id for lesson in lessons for task_id in _lesson_progress_task_ids(lesson)
    ]
    completed_task_revisions = (
        progress.get_completed_task_revisions(
            user_id=user.id,
            task_ids=tracked_progress_ids,
            db=db,
        )
        if user
        else {}
    )
    for lesson in lessons:
        is_available, locked_reason = get_lesson_access(lesson, user)
        lesson["is_available"] = is_available
        lesson["locked_reason"] = locked_reason
        lesson["completed"] = _lesson_completion_status(lesson, completed_ids, completed_task_revisions)
        if _uses_persisted_task_progress(lesson):
            for task in lesson.get("tasks", []):
                task["completed"] = (
                    completed_task_revisions.get(task["id"]) == task.get("revision")
                )
        if not is_available:
            # В списке оставляем только навигационные данные и признак блокировки.
            # Полная теория и практические задания выдаются только после проверки доступа.
            lesson["theory"] = []
            lesson["tasks"] = []
            lesson["manual_practice"] = []
    return lessons


def list_tracks(request: Request, db: Session):
    """Треки с прогрессом пользователя — для переключателя курса."""
    user = get_optional_user(request=request, db=db)
    completed_ids = progress.get_completed_lesson_ids(user.id, db) if user else set()

    tracks = []
    for track in get_tracks_summary():
        countable_ids = track.pop("countable_lesson_ids")
        source_track = find_track(track["id"])
        source_lessons = source_track["lessons"] if source_track else []
        tracked_progress_ids = [
            task_id for lesson in source_lessons for task_id in _lesson_progress_task_ids(lesson)
        ]
        task_revisions = (
            progress.get_completed_task_revisions(
                user_id=user.id,
                task_ids=tracked_progress_ids,
                db=db,
            )
            if user
            else {}
        )
        track["lessons_completed"] = sum(
            1
            for lesson in source_lessons
            if lesson["id"] in countable_ids
            and _lesson_completion_status(lesson, completed_ids, task_revisions)
        )
        tracks.append(track)

    return {
        "tracks": tracks,
        "default_track": default_track_id(),
        "content_revision": get_content_revision(),
    }


def list_lessons(request: Request, track: str | None, db: Session):
    track_id = track or default_track_id()
    if track_id is None or find_track(track_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Track not found")

    user = get_optional_user(request=request, db=db)
    return {
        "track": track_id,
        "lessons": build_lessons_payload(track_id, user, db),
        "access": {
            "is_authenticated": user is not None,
            "has_active_subscription": bool(user and accounts.has_active_subscription(user)),
        },
    }


def learning_catalog(request: Request, db: Session):
    """Complete navigation in one request, without lesson bodies or task text."""
    user = get_optional_user(request=request, db=db)
    completed_ids = progress.get_completed_lesson_ids(user.id, db) if user else set()
    summaries = get_tracks_summary()
    source_tracks = {track["id"]: find_track(track["id"]) for track in summaries}
    task_ids = [
        task_id
        for track in source_tracks.values() if track
        for lesson in track["lessons"]
        for task_id in _lesson_progress_task_ids(lesson)
    ]
    revisions = progress.get_completed_task_revisions(user.id, task_ids, db) if user and task_ids else {}
    courses = {}
    for track in summaries:
        countable_ids = set(track.pop("countable_lesson_ids"))
        lessons = []
        blocks_by_title: dict[str, dict[str, Any]] = {}
        source_track = source_tracks[track["id"]]
        for lesson in source_track["lessons"] if source_track else []:
            item = {key: lesson[key] for key in (
                "id", "module", "title", "duration", "status", "access", "source_file"
            ) if key in lesson}
            available, reason = get_lesson_access(lesson, user)
            completed = _lesson_completion_status(lesson, completed_ids, revisions)
            item.update(is_available=available, locked_reason=reason, completed=completed)
            lessons.append(item)
            block_title = str(lesson.get("module") or "Другие уроки")
            block = blocks_by_title.setdefault(
                block_title,
                {"id": f"{track['id']}:{block_title}", "title": block_title, "completed": 0, "total": 0, "lesson_ids": []},
            )
            block["lesson_ids"].append(lesson["id"])
            if lesson["id"] in countable_ids:
                block["total"] += 1
                if completed:
                    block["completed"] += 1
        track["lessons_completed"] = sum(item["completed"] for item in lessons if item["id"] in countable_ids)
        track["blocks"] = list(blocks_by_title.values())
        courses[track["id"]] = lessons
    return {"tracks": summaries, "courses": courses, "default_track": default_track_id(),
            "content_revision": get_content_revision()}


def lesson_material(lesson_id: str, request: Request, db: Session):
    lesson = find_lesson(lesson_id)
    if lesson is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
    user = get_optional_user(request=request, db=db)
    available, reason = get_lesson_access(lesson, user)
    if not available:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=reason)
    # Reuse the public projection: hidden tests stay on the server.
    for track in get_tracks_summary():
        source_track = find_track(track["id"])
        if source_track and any(item["id"] == lesson["id"] for item in source_track["lessons"]):
            material = build_lessons_payload(track["id"], user, db, lesson["id"])[0]
            return {"lesson": material}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")


def manual_practice_answer(
    lesson_id: str,
    exercise_index: int,
    task_index: int,
    request: Request,
    db: Session,
):
    """Возвращает закрытый разбор только после явного запроса и проверки доступа."""
    lesson = find_lesson(lesson_id)
    if lesson is None or not (
        lesson.get("source_file", "").startswith("chapter_02/block_05/")
        or lesson["id"] == "lesson-fa661256326bd13784d1c88d"
    ):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Разбор не найден")

    user = get_optional_user(request=request, db=db)
    available, reason = get_lesson_access(lesson, user)
    if not available:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=reason)

    practice = lesson.get("manual_practice", [])
    if not 0 <= exercise_index < len(practice):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Разбор не найден")
    tasks = practice[exercise_index].get("tasks", [])
    if not 0 <= task_index < len(tasks) or not isinstance(tasks[task_index].get("answer"), dict):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Разбор не найден")
    return {"answer": deepcopy(tasks[task_index]["answer"])}


def complete_lesson(lesson_id: str, request: Request, db: Session):
    """Ручная отметка «Выполнено» — только для уроков с self_check."""
    user = accounts.get_current_user(request=request, db=db)

    lesson = find_lesson(lesson_id)
    if lesson is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    is_available, locked_reason = get_lesson_access(lesson, user)
    if not is_available:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=locked_reason)

    if not lesson.get("self_check"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Этот урок засчитывается автоматически после решения практики.",
        )

    if _uses_persisted_task_progress(lesson) and not _lesson_tasks_are_complete(lesson, user.id, db):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Сначала завершите все редакторские задания.",
        )

    # Старые вкладки с позиционным ID по-прежнему принимаются find_lesson(),
    # но прогресс всегда сохраняется под постоянным идентификатором урока.
    if _chapter_one_needs_self_check_progress(lesson):
        progress.mark_task_completed(
            user_id=user.id,
            task_id=progress.chapter_one_completion_task_id(lesson["id"]),
            task_revision=progress.chapter_one_completion_revision(lesson),
            db=db,
        )
    elif not _is_chapter_one_lesson(lesson):
        progress.mark_lesson_completed(user_id=user.id, lesson_id=lesson["id"], db=db)
    return {"lesson_id": lesson["id"], "completed": True}


def lesson_theory(lesson_id: str, request: Request, db: Session):
    user = get_optional_user(request=request, db=db)

    lesson = find_lesson(lesson_id)
    if lesson is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    is_available, locked_reason = get_lesson_access(lesson, user)
    if not is_available:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=locked_reason)

    return {
        "lesson_id": lesson["id"],
        "title": lesson["title"],
        "theory_markdown": lesson.get("theory_markdown", ""),
    }


def _get_available_task(task_id: str, user: models.User | None) -> dict:
    task = find_task(task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    lesson = find_lesson_by_task(task_id)
    if lesson is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    is_available, locked_reason = get_lesson_access(lesson, user)
    if not is_available:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=locked_reason)

    return task


def _require_current_task_revision(task: dict, submitted_revision: str | None) -> None:
    """Reject stale task metadata before running or grading student code."""
    current_revision = task.get("revision")
    if not isinstance(current_revision, str) or submitted_revision != current_revision:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Условие или набор проверок задания обновились. "
                "Обновите страницу и отправьте решение ещё раз."
            ),
        )


def _prepare_task(task_id: str, revision: str | None, request: Request) -> dict:
    with SessionLocal() as db:
        user = get_optional_user(request=request, db=db)
        task = _get_available_task(task_id, user)
        _require_current_task_revision(task, revision)
        lesson = find_lesson_by_task(task_id)
        return {
            "user_id": user.id if user is not None else None,
            "task": deepcopy(task),
            "lesson": deepcopy(lesson),
        }


def _save_task_progress(context: dict) -> None:
    user_id = context["user_id"]
    task = context["task"]
    lesson = context["lesson"]
    if user_id is None or lesson is None:
        return
    start = perf_counter()
    # Обычное редакторское задание засчитывает урок после успешной проверки.
    # Для практики блока 3 сохраняем результат каждой карточки отдельно.
    try:
        with SessionLocal() as db:
            has_mixed_practice = bool(lesson.get("tasks") and lesson.get("manual_practice"))
            if _uses_persisted_task_progress(lesson):
                progress.mark_task_completed(
                    user_id=user_id, task_id=task["id"], task_revision=task["revision"], db=db,
                )
                if not has_mixed_practice and _lesson_tasks_are_complete(lesson, user_id, db) \
                        and not _is_chapter_one_lesson(lesson):
                    progress.mark_lesson_completed(user_id=user_id, lesson_id=lesson["id"], db=db)
            elif not has_mixed_practice:
                progress.mark_lesson_completed(user_id=user_id, lesson_id=lesson["id"], db=db)
    finally:
        logger.info("runner_progress_save_finished duration_ms=%.1f", (perf_counter() - start) * 1000)


async def _execute_task(function, code: str, task: dict) -> dict:
    try:
        return await get_runner_executor().run(function, code=code, task=task)
    except RunnerBusy:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Проверка занята. Повторите отправку через несколько секунд",
            headers={"Retry-After": "2"},
        ) from None
    except RunnerUnavailable:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Проверка временно недоступна. Повторите попытку позже.",
            headers={"Retry-After": "2"},
        ) from None


_SAFE_SUBMIT_CHECK_ERROR = "Не удалось проверить решение. Проверьте код и попробуйте ещё раз."
_CHAPTER_ONE_TEST_FAILURE = "Одна из проверок не пройдена. Сверьте решение с условием задачи."


def _has_valid_lesson_source_file(lesson: dict | None) -> bool:
    source_file = lesson.get("source_file") if isinstance(lesson, dict) else None
    return isinstance(source_file, str) and bool(source_file.strip())


def _is_chapter_one_lesson(lesson: dict | None) -> bool:
    """Identify chapter 01 using the resolved lesson metadata, not a client ID."""
    source_file = lesson.get("source_file") if isinstance(lesson, dict) else None
    return isinstance(source_file, str) and source_file.startswith("chapter_01/")


def _project_chapter_one_submit_result(result: Any) -> dict[str, Any]:
    """Keep the submit response shape while omitting runner-controlled details."""
    result = result if isinstance(result, dict) else {}
    ok = result.get("ok") is True
    raw_score = result.get("score")
    score = raw_score if type(raw_score) is int and 0 <= raw_score <= 100 else 0

    tests = []
    raw_tests = result.get("tests")
    if isinstance(raw_tests, list):
        for index, test in enumerate(raw_tests, start=1):
            passed = isinstance(test, dict) and test.get("passed") is True
            public_test = {"name": f"Проверка {index}", "passed": passed}
            if not passed:
                public_test["error"] = _CHAPTER_ONE_TEST_FAILURE
            tests.append(public_test)

    has_failed_test = any(not test["passed"] for test in tests)
    has_runner_error = bool(result.get("error"))
    show_general_error = has_runner_error or (not ok and (not tests or not has_failed_test))

    return {
        "ok": ok,
        "score": score,
        "tests": tests,
        "stdout": "",
        "stderr": None,
        "error": _SAFE_SUBMIT_CHECK_ERROR if show_general_error else None,
        "traceback": None,
    }


def _invalid_source_file_submit_result() -> dict[str, Any]:
    """Fail closed when resolved lesson metadata cannot scope a public submit."""
    return {
        "ok": False,
        "score": 0,
        "tests": [],
        "stdout": "",
        "stderr": None,
        "error": _SAFE_SUBMIT_CHECK_ERROR,
        "traceback": None,
    }


async def submit_task(task_id: str, payload: CodeSubmitRequest, request: Request):
    _require_runner_enabled()
    context = await run_in_threadpool(_prepare_task, task_id, payload.task_revision, request)
    if not _has_valid_lesson_source_file(context.get("lesson")):
        return _invalid_source_file_submit_result()

    result = await _execute_task(run_python_task, payload.code, context["task"])
    if result.get("ok"):
        await run_in_threadpool(_save_task_progress, context)

    if _is_chapter_one_lesson(context.get("lesson")):
        return _project_chapter_one_submit_result(result)
    return result


async def run_task_code(task_id: str, payload: CodeSubmitRequest, request: Request):
    """Запускает одну демонстрационную проверку без зачёта урока."""
    _require_runner_enabled()
    context = await run_in_threadpool(_prepare_task, task_id, payload.task_revision, request)
    return await _execute_task(run_python_preview, payload.code, context["task"])


async def run_interpreter_code(payload: InterpreterRunRequest):
    """Запускает самостоятельный фрагмент Python без проверки и зачёта урока."""
    _require_runner_enabled()
    try:
        return await get_runner_executor().run(run_python_code, code=payload.code)
    except RunnerBusy:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Интерпретатор занят. Повторите запуск через несколько секунд",
            headers={"Retry-After": "2"},
        ) from None
    except RunnerUnavailable:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Интерпретатор временно недоступен. Повторите попытку позже.",
            headers={"Retry-After": "2"},
        ) from None
