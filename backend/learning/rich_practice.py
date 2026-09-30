"""Ручная практика rich Python-курсов."""

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
from learning.practice_helpers import _exercise


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


FOUNDATIONS_OVERVIEW_PRACTICE = _foundations.OVERVIEW_PRACTICE

DEEPER_OVERVIEW_PRACTICE = _deeper.OVERVIEW_PRACTICE

PLANNER_API_OVERVIEW_PRACTICE = _planner_api.OVERVIEW_PRACTICE

DATABASE_API_OVERVIEW_PRACTICE = _database_api.OVERVIEW_PRACTICE

PERSONAL_API_OVERVIEW_PRACTICE = _personal_api.OVERVIEW_PRACTICE

POSTGRESQL_OVERVIEW_PRACTICE = _postgresql.OVERVIEW_PRACTICE

ASYNC_OVERVIEW_PRACTICE = _async_api.OVERVIEW_PRACTICE

DEPLOY_OVERVIEW_PRACTICE = _deployment.OVERVIEW_PRACTICE

LMS_OVERVIEW_PRACTICE = _lms.OVERVIEW_PRACTICE

FOUNDATIONS_PRACTICE = _foundations.MANUAL_PRACTICE

DEEPER_PRACTICE = _deeper.MANUAL_PRACTICE

PLANNER_API_PRACTICE = _planner_api.MANUAL_PRACTICE

DATABASE_API_PRACTICE = _database_api.MANUAL_PRACTICE

PERSONAL_API_PRACTICE = _personal_api.MANUAL_PRACTICE

POSTGRESQL_PRACTICE = _postgresql.MANUAL_PRACTICE

ASYNC_PRACTICE = _async_api.MANUAL_PRACTICE

DEPLOY_PRACTICE = _deployment.MANUAL_PRACTICE

LMS_PRACTICE = _lms.MANUAL_PRACTICE

def get_manual_practice(track_id: str, filename: str) -> list[dict[str, Any]]:
    """Возвращает ручную практику обзорной страницы или нумерованного урока."""
    overview_by_track = {
        FOUNDATIONS_TRACK: FOUNDATIONS_OVERVIEW_PRACTICE,
        DEEPER_TRACK: DEEPER_OVERVIEW_PRACTICE,
        PLANNER_API_TRACK: PLANNER_API_OVERVIEW_PRACTICE,
        DATABASE_API_TRACK: DATABASE_API_OVERVIEW_PRACTICE,
        PERSONAL_API_TRACK: PERSONAL_API_OVERVIEW_PRACTICE,
    }
    practice_by_track = {
        FOUNDATIONS_TRACK: FOUNDATIONS_PRACTICE,
        DEEPER_TRACK: DEEPER_PRACTICE,
        PLANNER_API_TRACK: PLANNER_API_PRACTICE,
        DATABASE_API_TRACK: DATABASE_API_PRACTICE,
        PERSONAL_API_TRACK: PERSONAL_API_PRACTICE,
    }
    for track_name in POSTGRESQL_TRACK_ALIASES:
        overview_by_track[track_name] = POSTGRESQL_OVERVIEW_PRACTICE
        practice_by_track[track_name] = POSTGRESQL_PRACTICE
    for track_name in ASYNC_TRACK_ALIASES:
        overview_by_track[track_name] = ASYNC_OVERVIEW_PRACTICE
        practice_by_track[track_name] = ASYNC_PRACTICE
    for track_name in DEPLOY_TRACK_ALIASES:
        overview_by_track[track_name] = DEPLOY_OVERVIEW_PRACTICE
        practice_by_track[track_name] = DEPLOY_PRACTICE
    for track_name in LMS_TRACK_ALIASES:
        overview_by_track[track_name] = LMS_OVERVIEW_PRACTICE
        practice_by_track[track_name] = LMS_PRACTICE

    overview = overview_by_track.get(track_id, {}).get(filename)
    if overview is not None:
        return overview

    match = re.match(r"^(\d+)\s+-\s+", filename)
    if match is None:
        return []

    lesson_number = int(match.group(1))
    return practice_by_track.get(track_id, {}).get(lesson_number, [])
