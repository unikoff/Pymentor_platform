from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from core.composition import RequestContext
from core.dependencies import get_db, get_request_context
from core.api_contracts import api_contract_responses, legacy_error_responses
from . import service
from .schemas import (
    CodeRunResponse,
    CodeSubmitRequest,
    CodeSubmitResponse,
    InterpreterRunRequest,
    LearningCatalogResponse,
    LessonCompletionResponse,
    LessonMaterialResponse,
    LessonTheoryResponse,
    LessonsListResponse,
    ManualPracticeAnswerResponse,
    TracksResponse,
)

learning_router = APIRouter()


@learning_router.get("/tracks", responses=api_contract_responses(TracksResponse))
def list_tracks(request: Request, db: Session = Depends(get_db)):
    'Треки с прогрессом пользователя — для переключателя курса.'
    return service.list_tracks(request=request, db=db)


@learning_router.get("/lessons", responses=api_contract_responses(LessonsListResponse, 404))
def list_lessons(
    request: Request,
    track: str | None = Query(default=None, max_length=160),
    db: Session = Depends(get_db),
):
    return service.list_lessons(request=request, track=track, db=db)


@learning_router.get("/catalog", responses=api_contract_responses(LearningCatalogResponse))
def learning_catalog(request: Request, db: Session = Depends(get_db)):
    'Complete navigation in one request, without lesson bodies or task text.'
    return service.learning_catalog(request=request, db=db)


@learning_router.get(
    "/lessons/{lesson_id}",
    responses=api_contract_responses(LessonMaterialResponse, 403, 404),
)
def lesson_material(lesson_id: str, request: Request, db: Session = Depends(get_db)):
    return service.lesson_material(lesson_id=lesson_id, request=request, db=db)


@learning_router.get(
    "/lessons/{lesson_id}/manual-practice/{exercise_index}/tasks/{task_index}/answer",
    response_model=ManualPracticeAnswerResponse,
    responses=legacy_error_responses(403, 404),
)
def manual_practice_answer(
    lesson_id: str,
    exercise_index: int,
    task_index: int,
    request: Request,
    db: Session = Depends(get_db),
):
    return service.manual_practice_answer(
        lesson_id=lesson_id,
        exercise_index=exercise_index,
        task_index=task_index,
        request=request,
        db=db,
    )


@learning_router.post(
    "/lessons/{lesson_id}/complete",
    responses=api_contract_responses(LessonCompletionResponse, 400, 401, 403, 404),
)
def complete_lesson(
    lesson_id: str,
    request: Request,
    db: Session = Depends(get_db),
    context: RequestContext = Depends(get_request_context),
):
    'Ручная отметка «Выполнено» — только для уроков с self_check.'
    return service.complete_lesson(lesson_id=lesson_id, request=request, db=db, uow=context.uow)


@learning_router.get(
    "/lessons/{lesson_id}/theory",
    response_model=LessonTheoryResponse,
    responses=legacy_error_responses(403, 404),
)
def lesson_theory(lesson_id: str, request: Request, db: Session = Depends(get_db)):
    return service.lesson_theory(lesson_id=lesson_id, request=request, db=db)


@learning_router.post(
    "/tasks/{task_id}/submit",
    response_model=CodeSubmitResponse,
    responses=legacy_error_responses(403, 404, 409, 503),
)
async def submit_task(task_id: str, payload: CodeSubmitRequest, request: Request):
    return await service.submit_task(task_id=task_id, payload=payload, request=request)


@learning_router.post(
    "/tasks/{task_id}/run",
    response_model=CodeRunResponse,
    responses=legacy_error_responses(403, 404, 409, 503),
)
async def run_task_code(task_id: str, payload: CodeSubmitRequest, request: Request):
    'Запускает одну демонстрационную проверку без зачёта урока.'
    return await service.run_task_code(task_id=task_id, payload=payload, request=request)


@learning_router.post(
    "/interpreter/run",
    response_model=CodeRunResponse,
    responses=legacy_error_responses(503),
)
async def run_interpreter_code(payload: InterpreterRunRequest):
    'Запускает самостоятельный фрагмент Python без проверки и зачёта урока.'
    return await service.run_interpreter_code(payload=payload)
