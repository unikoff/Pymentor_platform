from typing import Any

from pydantic import BaseModel
from pydantic import ConfigDict
from pydantic import constr


class CodeSubmitRequest(BaseModel):
    code: constr(min_length=1, max_length=8000)
    task_revision: constr(pattern=r"^[0-9a-f]{64}$") | None = None


class InterpreterRunRequest(BaseModel):
    code: constr(min_length=1, max_length=8000)


class TestResult(BaseModel):
    name: str
    passed: bool
    expected: Any | None = None
    actual: Any | None = None
    error: str | None = None


class CodeSubmitResponse(BaseModel):
    ok: bool
    score: int
    tests: list[TestResult]
    stdout: str = ""
    stderr: str | None = None
    error: str | None = None
    traceback: str | None = None


class CodeRunResponse(BaseModel):
    ok: bool
    stdout: str = ""
    stderr: str | None = None
    error: str | None = None
    traceback: str | None = None


class LessonTheoryResponse(BaseModel):
    lesson_id: str
    title: str
    theory_markdown: str


class LessonCompletionResponse(BaseModel):
    lesson_id: str
    completed: bool


class TrackBlockProgressResponse(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    title: str
    completed: int
    total: int
    lesson_ids: list[str] | None = None


class TrackSummaryResponse(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    title: str
    tagline: str | None = None
    lessons_total: int
    lessons_countable: int
    lessons_completed: int
    blocks: list[TrackBlockProgressResponse] | None = None


class LessonTaskSummaryResponse(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    revision: str
    title: str
    level: str
    mode: str | None = None
    prompt: str | None = None
    contract: dict[str, Any] | None = None
    requirements: dict[str, Any] | None = None
    hints: list[str] | None = None
    starter_code: str | None = None
    completed: bool | None = None


class LessonSummaryResponse(BaseModel):
    """Known frontend lesson fields plus pass-through for newer content fields."""

    model_config = ConfigDict(extra="allow")

    id: str
    module: str | None = None
    title: str
    duration: str | None = None
    status: str
    access: str | None = None
    is_available: bool | None = None
    locked_reason: str | None = None
    theory: list[str] | None = None
    video: dict[str, Any] | None = None
    tasks: list[LessonTaskSummaryResponse] | None = None
    source_file: str | None = None
    self_check: bool | None = None
    manual_practice: list[dict[str, Any]] | None = None
    completed: bool | None = None


class TracksResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    tracks: list[TrackSummaryResponse]
    default_track: str | None
    content_revision: str


class LearningCatalogResponse(TracksResponse):
    courses: dict[str, list[LessonSummaryResponse]]


class LessonsListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    track: str
    lessons: list[LessonSummaryResponse]
    access: dict[str, Any] | None = None


class LessonMaterialResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    lesson: LessonSummaryResponse


class ManualPracticeTaskAnswerResponse(BaseModel):
    explanation: str
    steps: list[str]
    code: str | None = None
    checks: list[str] | None = None


class ManualPracticeAnswerResponse(BaseModel):
    answer: ManualPracticeTaskAnswerResponse
