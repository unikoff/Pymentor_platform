"""Resolve manual and automatic practice from course materials."""

from __future__ import annotations

import re
from typing import Any

from content.identity import (
    PLANNER_API_BLOCK_FOLDERS,
    PLANNER_API_DISPLAY_NUMBERS,
    PLANNER_API_LEGACY_SOURCES,
    PLANNER_API_MODULE_LABELS,
)
from content.materials import chapter_03 as _planner_api
from content.materials import chapter_01_archive as _foundations
from content.materials import chapter_01 as _foundations_12
from content.materials import chapter_02 as _deeper
from content.materials import chapter_04 as _database_api
from content.materials import chapter_05 as _personal_api
from content.materials import chapter_06 as _postgresql
from content.materials import chapter_07 as _async_api
from content.materials import chapter_08 as _deployment
from content.materials import chapter_09 as _lms
from content.practice.helpers import lesson_catalog_key


FOUNDATIONS_TRACK = "Основы Python и мышление программиста"
DEEPER_TRACK = "Python глубже, файлы и структура небольшого проекта"
PLANNER_API_TRACK = _planner_api.TRACK_ID
_PLANNER_API_BLOCKS = {
    "block_09": _planner_api.block_09,
    "block_10": _planner_api.block_10,
    "block_11": _planner_api.block_11,
    "block_12": _planner_api.block_12,
}


def _planner_api_practice_key(filename: str, source_file: str | None = None):
    relative = (source_file or "").replace("\\", "/")
    number = PLANNER_API_DISPLAY_NUMBERS.get(relative)
    if number is None:
        match = re.match(r"^(\d+(?:\.\d+)*)\s+-\s+", filename)
        if match is None:
            return None
        number = match.group(1)
    return lesson_catalog_key(number)


def _planner_api_source_block(source_file: str):
    parts = source_file.replace("\\", "/").split("/")
    if len(parts) != 3 or parts[0] != "chapter_03":
        return None
    return _PLANNER_API_BLOCKS.get(parts[1])


def _planner_api_practice_sources() -> frozenset[str]:
    sources = set(PLANNER_API_LEGACY_SOURCES)
    for filename, module_label in PLANNER_API_MODULE_LABELS.items():
        folder = PLANNER_API_BLOCK_FOLDERS.get(module_label)
        block = _PLANNER_API_BLOCKS.get(folder)
        if block is None:
            continue
        source_file = f"chapter_03/{folder}/{filename}"
        key = _planner_api_practice_key(filename, source_file)
        if key is not None and (
            block.MANUAL_PRACTICE.get(key) or block.CODE_TASKS.get(key)
        ):
            sources.add(source_file)
    return frozenset(sources)


PLANNER_API_PRACTICE_SOURCES = _planner_api_practice_sources()
PLANNER_API_MANUAL_ONLY_SOURCES = frozenset(
    {
        "chapter_03/block_10/50 - Модель входящего JSON.md",
        "chapter_03/block_12/56 - Первый HTTP-тест.md",
        "chapter_03/block_12/58 - Границы body и path.md",
        "chapter_03/block_12/60 - Чистая установка проекта.md",
    }
)
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
FOUNDATIONS_12_CODE_TASKS = _foundations_12.CODE_TASKS

DEEPER_CODE_TASKS = _deeper.CODE_TASKS

PLANNER_API_CODE_TASKS = _planner_api.CODE_TASKS

DATABASE_API_CODE_TASKS = _database_api.CODE_TASKS

PERSONAL_API_CODE_TASKS = _personal_api.CODE_TASKS

POSTGRESQL_CODE_TASKS = _postgresql.CODE_TASKS

ASYNC_CODE_TASKS = _async_api.CODE_TASKS

DEPLOY_CODE_TASKS = _deployment.CODE_TASKS

LMS_CODE_TASKS = _lms.CODE_TASKS

def get_code_tasks(
    track_id: str,
    filename: str,
    source_file: str | None = None,
) -> list[dict[str, Any]]:
    """Возвращает задачи редактора только для тем, проверяемых без доступа к ОС."""
    if track_id == PLANNER_API_TRACK and source_file in PLANNER_API_MANUAL_ONLY_SOURCES:
        return []

    if (
        track_id == PLANNER_API_TRACK
        and source_file is not None
        and source_file not in PLANNER_API_PRACTICE_SOURCES
    ):
        return []

    match = re.match(r"^(\d+(?:\.\d+)*)\s+-\s+", filename)
    if match is None:
        return []

    number = match.group(1)
    if track_id == PLANNER_API_TRACK and source_file is not None:
        number = PLANNER_API_DISPLAY_NUMBERS.get(source_file, number)
    lesson_number = lesson_catalog_key(number)
    if track_id == PLANNER_API_TRACK and source_file is not None:
        source_block = _planner_api_source_block(source_file)
        if source_block is not None:
            return source_block.CODE_TASKS.get(lesson_number, [])
    tasks_by_track = {
        FOUNDATIONS_TRACK: FOUNDATIONS_CODE_TASKS,
        _foundations_12.TRACK_ID: FOUNDATIONS_12_CODE_TASKS,
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


FOUNDATIONS_12_TRACK = _foundations_12.TRACK_ID


FOUNDATIONS_OVERVIEW_PRACTICE = _foundations.OVERVIEW_PRACTICE


FOUNDATIONS_12_OVERVIEW_PRACTICE = _foundations_12.OVERVIEW_PRACTICE


DEEPER_OVERVIEW_PRACTICE = _deeper.OVERVIEW_PRACTICE


PLANNER_API_OVERVIEW_PRACTICE = _planner_api.OVERVIEW_PRACTICE


DATABASE_API_OVERVIEW_PRACTICE = _database_api.OVERVIEW_PRACTICE


PERSONAL_API_OVERVIEW_PRACTICE = _personal_api.OVERVIEW_PRACTICE


POSTGRESQL_OVERVIEW_PRACTICE = _postgresql.OVERVIEW_PRACTICE


ASYNC_OVERVIEW_PRACTICE = _async_api.OVERVIEW_PRACTICE


DEPLOY_OVERVIEW_PRACTICE = _deployment.OVERVIEW_PRACTICE


LMS_OVERVIEW_PRACTICE = _lms.OVERVIEW_PRACTICE


FOUNDATIONS_PRACTICE = _foundations.MANUAL_PRACTICE


FOUNDATIONS_12_PRACTICE = _foundations_12.MANUAL_PRACTICE


DEEPER_PRACTICE = _deeper.MANUAL_PRACTICE


PLANNER_API_PRACTICE = _planner_api.MANUAL_PRACTICE


DATABASE_API_PRACTICE = _database_api.MANUAL_PRACTICE


PERSONAL_API_PRACTICE = _personal_api.MANUAL_PRACTICE


POSTGRESQL_PRACTICE = _postgresql.MANUAL_PRACTICE


ASYNC_PRACTICE = _async_api.MANUAL_PRACTICE


DEPLOY_PRACTICE = _deployment.MANUAL_PRACTICE


LMS_PRACTICE = _lms.MANUAL_PRACTICE


def get_manual_practice(
    track_id: str,
    filename: str,
    source_file: str | None = None,
) -> list[dict[str, Any]]:
    """Возвращает ручную практику обзорной страницы или нумерованного урока."""
    if (
        track_id == PLANNER_API_TRACK
        and source_file is not None
        and source_file not in PLANNER_API_PRACTICE_SOURCES
    ):
        return []

    if track_id == PLANNER_API_TRACK and source_file is not None:
        source_block = _planner_api_source_block(source_file)
        if source_block is not None:
            key = _planner_api_practice_key(filename, source_file)
            return source_block.MANUAL_PRACTICE.get(key, []) if key is not None else []

    overview_by_track = {
        FOUNDATIONS_TRACK: FOUNDATIONS_OVERVIEW_PRACTICE,
        FOUNDATIONS_12_TRACK: FOUNDATIONS_12_OVERVIEW_PRACTICE,
        DEEPER_TRACK: DEEPER_OVERVIEW_PRACTICE,
        PLANNER_API_TRACK: PLANNER_API_OVERVIEW_PRACTICE,
        DATABASE_API_TRACK: DATABASE_API_OVERVIEW_PRACTICE,
        PERSONAL_API_TRACK: PERSONAL_API_OVERVIEW_PRACTICE,
    }
    practice_by_track = {
        FOUNDATIONS_TRACK: FOUNDATIONS_PRACTICE,
        FOUNDATIONS_12_TRACK: FOUNDATIONS_12_PRACTICE,
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

    match = re.match(r"^(\d+(?:\.\d+)*)\s+-\s+", filename)
    if match is None:
        return []

    number = match.group(1)
    if track_id == PLANNER_API_TRACK and source_file is not None:
        number = PLANNER_API_DISPLAY_NUMBERS.get(source_file, number)
    lesson_number = lesson_catalog_key(number)
    return practice_by_track.get(track_id, {}).get(lesson_number, [])

from content.theory.markdown import (
    _extract_python_starter_from_block,
    _extract_starter_from_block,
    _extract_task_blocks,
    _extract_task_prompt,
    _extract_tests_from_block,
    _starter_code,
)

SELF_CHECK_LESSONS = {
    "python-basics/Блок 1 - Введение в Python (4 занятия)/Базовые типы данных 2.md",
    "sql-basics/01 Основы баз данных/01 Знакомство с SQL.md",
    "sql-basics/01 Основы баз данных/02 SELECT и фильтрация.md",
    "Основы Python и мышление программиста/План обучения.md",
    "Python глубже, файлы и структура небольшого проекта/План обучения.md",
    "HTTP, API и FastAPI - Planner API/План обучения.md",
}


TASK_OVERRIDES: dict[str, list[dict[str, Any]]] = {
    "python-basics/Блок 1 - Введение в Python (4 занятия)/Базовые типы данных 1.md": [
        {
            "title": "Форматирование ФИО",
            "level": "easy",
            "prompt": (
                "Напишите функцию solve(name, surname, patronymic, age), которая возвращает строку в формате "
                "'Фамилия И.О. возраст'. Возраст нужно уменьшить на 5. Например: "
                "solve('Андрей', 'Смородин', 'Николаевич', '45') -> 'Смородин А.Н. 40'."
            ),
            "starter_code": (
                "def solve(name, surname, patronymic, age):\n"
                "    # Верните строку вида: Фамилия И.О. возраст-5\n"
                "    pass\n"
            ),
            "tests": [
                {
                    "name": "пример из урока",
                    "args": ["Андрей", "Смородин", "Николаевич", "45"],
                    "expected": "Смородин А.Н. 40",
                },
                {
                    "name": "женское имя",
                    "args": ["Мария", "Иванова", "Петровна", "30"],
                    "expected": "Иванова М.П. 25",
                },
                {
                    "name": "короткий возраст",
                    "args": ["Олег", "Сидоров", "Сергеевич", "18"],
                    "expected": "Сидоров О.С. 13",
                },
            ],
        }
    ],
}


def _task_from_override(
    lesson_id: str,
    legacy_lesson_id: str,
    task_index: int,
    task: dict[str, Any],
) -> dict[str, Any]:
    return {
        "id": f"{lesson_id}-task-{task_index:02d}",
        "legacy_ids": (
            [f"{legacy_lesson_id}-task-{task_index:02d}"]
            if legacy_lesson_id != lesson_id
            else []
        ),
        "title": task["title"],
        "level": task.get("level", "easy"),
        "mode": task.get("mode", "solve"),
        "prompt": task["prompt"],
        "contract": task.get("contract"),
        "requirements": task.get("requirements", {}),
        "hints": task.get("hints", []),
        "starter_code": task.get("starter_code", _starter_code()),
        "tests": task.get("tests", []),
    }


def _tasks_for_lesson(
    relative: str,
    text: str,
    lesson_id: str,
    legacy_lesson_id: str,
    track_id: str,
    filename: str,
    source_file: str | None = None,
) -> list[dict[str, Any]]:
    if relative.endswith("План обучения.md"):
        return []

    if relative in TASK_OVERRIDES:
        source_tasks = TASK_OVERRIDES[relative]
    else:
        source_tasks = get_code_tasks(
            track_id,
            filename,
            source_file=source_file or relative,
        )

    if source_tasks:
        return [
            _task_from_override(lesson_id, legacy_lesson_id, task_index, task)
            for task_index, task in enumerate(source_tasks, start=1)
        ]

    if relative in SELF_CHECK_LESSONS:
        return []

    tasks: list[dict[str, Any]] = []
    for task_index, (title, block) in enumerate(_extract_task_blocks(text), start=1):
        tests, block = _extract_tests_from_block(block)
        starter, block = _extract_starter_from_block(block)
        starter = starter or _extract_python_starter_from_block(block)
        tasks.append(
            {
                "id": f"{lesson_id}-task-{task_index:02d}",
                "legacy_ids": (
                    [f"{legacy_lesson_id}-task-{task_index:02d}"]
                    if legacy_lesson_id != lesson_id
                    else []
                ),
                "title": title or f"Задание {task_index}",
                "level": "easy" if task_index == 1 else "medium",
                "mode": "solve",
                "prompt": _extract_task_prompt(block),
                "starter_code": starter or _starter_code(),
                "tests": tests,
            }
        )
    return tasks
