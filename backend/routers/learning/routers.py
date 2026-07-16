from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from learning.code_runner import run_python_preview, run_python_task
from DataBase import model as models
from learning.content import (
    default_track_id,
    find_lesson,
    find_lesson_by_task,
    find_task,
    find_track,
    get_public_lessons,
    get_tracks_summary,
)
from routers.user import crud as user_crud
from .schemas import CodeRunResponse, CodeSubmitRequest, CodeSubmitResponse, LessonTheoryResponse


learning_router = APIRouter()


def get_db():
    db = user_crud.get_db()
    try:
        yield db
    finally:
        db.close()


async def get_optional_user(request: Request, db: Session) -> models.User | None:
    try:
        return await user_crud.get_current_user(request=request, db=db)
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


def build_lessons_payload(track_id: str, user: models.User | None, db: Session) -> list[dict]:
    lessons = get_public_lessons(track_id)
    completed_ids = user_crud.get_completed_lesson_ids(user.id, db) if user else set()
    for lesson in lessons:
        is_available, locked_reason = get_lesson_access(lesson, user)
        lesson["is_available"] = is_available
        lesson["locked_reason"] = locked_reason
        lesson["completed"] = lesson["id"] in completed_ids
    return lessons


@learning_router.get("/tracks")
async def list_tracks(request: Request, db: Session = Depends(get_db)):
    """Треки с прогрессом пользователя — для переключателя курса."""
    user = await get_optional_user(request=request, db=db)
    completed_ids = user_crud.get_completed_lesson_ids(user.id, db) if user else set()

    tracks = []
    for track in get_tracks_summary():
        countable_ids = track.pop("countable_lesson_ids")
        track["lessons_completed"] = sum(1 for lesson_id in countable_ids if lesson_id in completed_ids)
        tracks.append(track)

    return {"tracks": tracks, "default_track": default_track_id()}


@learning_router.get("/lessons")
async def list_lessons(
    request: Request,
    track: str | None = Query(default=None, max_length=60),
    db: Session = Depends(get_db),
):
    track_id = track or default_track_id()
    if track_id is None or find_track(track_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Track not found")

    user = await get_optional_user(request=request, db=db)
    return {
        "track": track_id,
        "lessons": build_lessons_payload(track_id, user, db),
        "access": {
            "is_authenticated": user is not None,
            "has_active_subscription": bool(user and user_crud.has_active_subscription(user)),
        },
    }


@learning_router.post("/lessons/{lesson_id}/complete")
async def complete_lesson(lesson_id: str, request: Request, db: Session = Depends(get_db)):
    """Ручная отметка «Выполнено» — только для уроков с self_check."""
    user = await user_crud.get_current_user(request=request, db=db)

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

    user_crud.mark_lesson_completed(user_id=user.id, lesson_id=lesson_id, db=db)
    return {"lesson_id": lesson_id, "completed": True}


@learning_router.get("/lessons/{lesson_id}/theory", response_model=LessonTheoryResponse)
async def lesson_theory(lesson_id: str, request: Request, db: Session = Depends(get_db)):
    user = await get_optional_user(request=request, db=db)

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


@learning_router.post("/tasks/{task_id}/submit", response_model=CodeSubmitResponse)
async def submit_task(task_id: str, payload: CodeSubmitRequest, request: Request, db: Session = Depends(get_db)):
    user = await get_optional_user(request=request, db=db)
    task = _get_available_task(task_id, user)
    result = run_python_task(code=payload.code, task=task)

    # Успешная проверка засчитывает урок залогиненному студенту.
    if user is not None and result.get("ok"):
        lesson = find_lesson_by_task(task_id)
        if lesson is not None:
            user_crud.mark_lesson_completed(user_id=user.id, lesson_id=lesson["id"], db=db)

    return result


@learning_router.post("/tasks/{task_id}/run", response_model=CodeRunResponse)
async def run_task_code(task_id: str, payload: CodeSubmitRequest, request: Request, db: Session = Depends(get_db)):
    """Запускает одну демонстрационную проверку без зачёта урока."""
    user = await get_optional_user(request=request, db=db)
    task = _get_available_task(task_id, user)
    return run_python_preview(code=payload.code, task=task)
