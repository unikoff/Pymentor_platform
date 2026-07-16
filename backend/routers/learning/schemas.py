from typing import Any

from pydantic import BaseModel, constr


class CodeSubmitRequest(BaseModel):
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
