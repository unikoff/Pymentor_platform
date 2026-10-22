import logging
from copy import deepcopy
from time import perf_counter

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from learning.code_runner import run_python_code, run_python_preview, run_python_task
from learning.runner_executor import RunnerBusy, RunnerUnavailable, get_runner_executor
from DataBase import model as models
from learning.content import (
    default_track_id,
    find_lesson,
    find_lesson_by_task,
    find_task,
    get_content_revision,
    find_track,
    get_public_lessons,
    get_tracks_summary,
)
from routers.user import crud as user_crud
from .schemas import CodeRunResponse, CodeSubmitRequest, CodeSubmitResponse, InterpreterRunRequest, LessonTheoryResponse


learning_router = APIRouter()
logger = logging.getLogger("pymentor.runner")


def _uses_persisted_task_progress(lesson: dict) -> bool:
    return str(lesson.get("source_file", "")).startswith("foundations/block_03/")


def _lesson_tasks_are_complete(lesson: dict, user_id: int, db: Session) -> bool:
    tasks = lesson.get("tasks", [])
    if not tasks:
        return True

    completed_revisions = user_crud.get_completed_task_revisions(
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

    if not _uses_persisted_task_progress(lesson) or not lesson.get("tasks"):
        return stored_lesson_completion

    all_tasks_complete = all(
        task_revisions.get(task["id"]) == task.get("revision")
        for task in lesson["tasks"]
    )
    if lesson.get("manual_practice"):
        return stored_lesson_completion and all_tasks_complete
    return all_tasks_complete


def get_db():
    db = user_crud.get_db()
    try:
        yield db
    finally:
        db.close()


def get_optional_user(request: Request, db: Session) -> models.User | None:
    try:
        return user_crud.get_current_user(request=request, db=db)
    except HTTPException as exc:
        if exc.status_code == status.HTTP_401_UNAUTHORIZED:
            return None
        raise


def get_lesson_access(lesson: dict, user: models.User | None) -> tuple[bool, str | None]:
    access = lesson.get("access", "registered")
    if access == "free":
        return True, None

    if user is None:
        return False, "Зарегистрируйтесь, чтобы открыть это занятие."

    if access == "registered":
        return True, None

    if access == "subscription":
        if user_crud.has_active_subscription(user):
            return True, None

        if user.subscription_until:
            subscription_until = user_crud._normalize_datetime(user.subscription_until)
            expires_at = subscription_until.strftime("%d.%m.%Y") if subscription_until else ""
            return False, f"Подписка закончилась {expires_at}. Продлите подписку, чтобы открыть это занятие."

        return False, "Нужна активная подписка. Продлите доступ, чтобы открыть это занятие."

    return False, "Этот тип доступа пока не поддерживается."


def build_lessons_payload(track_id: str, user: models.User | None, db: Session, lesson_id: str | None = None) -> list[dict]:
    lessons = get_public_lessons(track_id)
    if lesson_id is not None:
        lessons = [lesson for lesson in lessons if lesson["id"] == lesson_id]
    completed_ids = user_crud.get_completed_lesson_ids(user.id, db) if user else set()
    block_three_tasks = [
        task
        for lesson in lessons
        if _uses_persisted_task_progress(lesson)
        for task in lesson.get("tasks", [])
    ]
    completed_task_revisions = (
        user_crud.get_completed_task_revisions(
            user_id=user.id,
            task_ids=[task["id"] for task in block_three_tasks],
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


@learning_router.get("/tracks")
def list_tracks(request: Request, db: Session = Depends(get_db)):
    """Треки с прогрессом пользователя — для переключателя курса."""
    user = get_optional_user(request=request, db=db)
    completed_ids = user_crud.get_completed_lesson_ids(user.id, db) if user else set()

    tracks = []
    for track in get_tracks_summary():
        countable_ids = track.pop("countable_lesson_ids")
        source_track = find_track(track["id"])
        source_lessons = source_track["lessons"] if source_track else []
        block_three_tasks = [
            task
            for lesson in source_lessons
            if _uses_persisted_task_progress(lesson)
            for task in lesson.get("tasks", [])
        ]
        task_revisions = (
            user_crud.get_completed_task_revisions(
                user_id=user.id,
                task_ids=[task["id"] for task in block_three_tasks],
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


@learning_router.get("/lessons")
def list_lessons(
    request: Request,
    track: str | None = Query(default=None, max_length=160),
    db: Session = Depends(get_db),
):
    track_id = track or default_track_id()
    if track_id is None or find_track(track_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Track not found")

    user = get_optional_user(request=request, db=db)
    return {
        "track": track_id,
        "lessons": build_lessons_payload(track_id, user, db),
        "access": {
            "is_authenticated": user is not None,
            "has_active_subscription": bool(user and user_crud.has_active_subscription(user)),
        },
    }


@learning_router.get("/catalog")
def learning_catalog(request: Request, db: Session = Depends(get_db)):
    """Complete navigation in one request, without lesson bodies or task text."""
    user = get_optional_user(request=request, db=db)
    completed_ids = user_crud.get_completed_lesson_ids(user.id, db) if user else set()
    summaries = get_tracks_summary()
    source_tracks = {track["id"]: find_track(track["id"]) for track in summaries}
    task_ids = [
        task["id"]
        for track in source_tracks.values() if track
        for lesson in track["lessons"] if _uses_persisted_task_progress(lesson)
        for task in lesson.get("tasks", [])
    ]
    revisions = user_crud.get_completed_task_revisions(user.id, task_ids, db) if user and task_ids else {}
    courses = {}
    for track in summaries:
        countable_ids = set(track.pop("countable_lesson_ids"))
        lessons = []
        source_track = source_tracks[track["id"]]
        for lesson in source_track["lessons"] if source_track else []:
            item = {key: lesson[key] for key in (
                "id", "module", "title", "duration", "status", "access", "source_file"
            ) if key in lesson}
            available, reason = get_lesson_access(lesson, user)
            item.update(is_available=available, locked_reason=reason,
                        completed=_lesson_completion_status(lesson, completed_ids, revisions))
            lessons.append(item)
        track["lessons_completed"] = sum(item["completed"] for item in lessons if item["id"] in countable_ids)
        courses[track["id"]] = lessons
    return {"tracks": summaries, "courses": courses, "default_track": default_track_id(),
            "content_revision": get_content_revision()}


@learning_router.get("/lessons/{lesson_id}")
def lesson_material(lesson_id: str, request: Request, db: Session = Depends(get_db)):
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


@learning_router.post("/lessons/{lesson_id}/complete")
def complete_lesson(lesson_id: str, request: Request, db: Session = Depends(get_db)):
    """Ручная отметка «Выполнено» — только для уроков с self_check."""
    user = user_crud.get_current_user(request=request, db=db)

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
    user_crud.mark_lesson_completed(user_id=user.id, lesson_id=lesson["id"], db=db)
    return {"lesson_id": lesson["id"], "completed": True}


@learning_router.get("/lessons/{lesson_id}/theory", response_model=LessonTheoryResponse)
def lesson_theory(lesson_id: str, request: Request, db: Session = Depends(get_db)):
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
    with user_crud.get_db() as db:
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
        with user_crud.get_db() as db:
            has_mixed_practice = bool(lesson.get("tasks") and lesson.get("manual_practice"))
            if _uses_persisted_task_progress(lesson):
                user_crud.mark_task_completed(
                    user_id=user_id, task_id=task["id"], task_revision=task["revision"], db=db,
                )
                if not has_mixed_practice and _lesson_tasks_are_complete(lesson, user_id, db):
                    user_crud.mark_lesson_completed(user_id=user_id, lesson_id=lesson["id"], db=db)
            elif not has_mixed_practice:
                user_crud.mark_lesson_completed(user_id=user_id, lesson_id=lesson["id"], db=db)
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


@learning_router.post("/tasks/{task_id}/submit", response_model=CodeSubmitResponse)
async def submit_task(task_id: str, payload: CodeSubmitRequest, request: Request):
    context = await run_in_threadpool(_prepare_task, task_id, payload.task_revision, request)
    result = await _execute_task(run_python_task, payload.code, context["task"])
    if result.get("ok"):
        await run_in_threadpool(_save_task_progress, context)

    return result


@learning_router.post("/tasks/{task_id}/run", response_model=CodeRunResponse)
async def run_task_code(task_id: str, payload: CodeSubmitRequest, request: Request):
    """Запускает одну демонстрационную проверку без зачёта урока."""
    context = await run_in_threadpool(_prepare_task, task_id, payload.task_revision, request)
    return await _execute_task(run_python_preview, payload.code, context["task"])


@learning_router.post("/interpreter/run", response_model=CodeRunResponse)
async def run_interpreter_code(payload: InterpreterRunRequest):
    """Запускает самостоятельный фрагмент Python без проверки и зачёта урока."""
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
