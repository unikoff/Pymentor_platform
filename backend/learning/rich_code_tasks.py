"""Автопроверяемые задания для rich Python-курсов."""

from __future__ import annotations

import re
from typing import Any

from learning.course_content import planner_api as _planner_api
from learning.course_content import foundations as _foundations
from learning.course_content import deeper as _deeper
from learning.course_content import database_api as _database_api
from learning.course_content import personal_api as _personal_api
from learning.course_content import postgresql as _postgresql
from learning.course_content import async_api as _async_api
from learning.course_content import deployment as _deployment
from learning.course_content import lms as _lms
from learning.practice_helpers import _contract, _dynamic_script, _script, _solve


FOUNDATIONS_TRACK = "Основы Python и мышление программиста"
DEEPER_TRACK = "Python глубже, файлы и структура небольшого проекта"
PLANNER_API_TRACK = _planner_api.TRACK_ID
DATABASE_API_TRACK = "FastAPI, SQLite и SQLAlchemy - StudyHub Database API"
PERSONAL_API_TRACK = "Аутентификация, сессии, токены и завершение FastAPI - Personal StudyHub API"
POSTGRESQL_TRACK = "SQL, PostgreSQL и модели хранения - PostgreSQL StudyHub"
POSTGRESQL_TRACK_ALIASES = (
    POSTGRESQL_TRACK,
    "SQL, PostgreSQL и выбор хранилища - PostgreSQL StudyHub",
)
ASYNC_TRACK = "Асинхронность и производительность backend - Async StudyHub"
ASYNC_TRACK_ALIASES = (
    ASYNC_TRACK,
    "Асинхронность, FastAPI и Async SQLAlchemy - Async StudyHub",
    "Асинхронность и Async SQLAlchemy - Async StudyHub",
)
DEPLOY_TRACK = "Docker, CI/CD и первый стабильный деплой - Deployable StudyHub"
DEPLOY_TRACK_ALIASES = (
    DEPLOY_TRACK,
    DEPLOY_TRACK.replace("CI/CD", "CI-CD"),
    "Docker, CI/CD и деплой - Deployable StudyHub",
    "Docker и CI/CD - Deployable StudyHub",
)
LMS_TRACK = "StudyHub LMS, Redis, портфолио и собеседования - StudyHub LMS Release"
LMS_TRACK_ALIASES = (
    LMS_TRACK,
    "LMS Core, Redis и финальный релиз - StudyHub LMS Release",
    "LMS, Redis и портфолио - StudyHub LMS Release",
)


FOUNDATIONS_CODE_TASKS = _foundations.CODE_TASKS

DEEPER_CODE_TASKS = _deeper.CODE_TASKS

PLANNER_API_CODE_TASKS = _planner_api.CODE_TASKS

DATABASE_API_CODE_TASKS = _database_api.CODE_TASKS

PERSONAL_API_CODE_TASKS = _personal_api.CODE_TASKS

POSTGRESQL_CODE_TASKS = _postgresql.CODE_TASKS

ASYNC_CODE_TASKS = _async_api.CODE_TASKS

DEPLOY_CODE_TASKS = _deployment.CODE_TASKS

LMS_CODE_TASKS = _lms.CODE_TASKS

def get_code_tasks(track_id: str, filename: str) -> list[dict[str, Any]]:
    """Возвращает задачи редактора только для тем, проверяемых без доступа к ОС."""
    match = re.match(r"^(\d+)\s+-\s+", filename)
    if match is None:
        return []

    lesson_number = int(match.group(1))
    tasks_by_track = {
        FOUNDATIONS_TRACK: FOUNDATIONS_CODE_TASKS,
        DEEPER_TRACK: DEEPER_CODE_TASKS,
        PLANNER_API_TRACK: PLANNER_API_CODE_TASKS,
        DATABASE_API_TRACK: DATABASE_API_CODE_TASKS,
        PERSONAL_API_TRACK: PERSONAL_API_CODE_TASKS,
    }
    for track_name in POSTGRESQL_TRACK_ALIASES:
        tasks_by_track[track_name] = POSTGRESQL_CODE_TASKS
    for track_name in ASYNC_TRACK_ALIASES:
        tasks_by_track[track_name] = ASYNC_CODE_TASKS
    for track_name in DEPLOY_TRACK_ALIASES:
        tasks_by_track[track_name] = DEPLOY_CODE_TASKS
    for track_name in LMS_TRACK_ALIASES:
        tasks_by_track[track_name] = LMS_CODE_TASKS

    return tasks_by_track.get(track_id, {}).get(lesson_number, [])
