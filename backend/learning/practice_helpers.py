"""Общие конструкторы и проверки каталогов практики без учебных данных."""

from __future__ import annotations

from typing import Any


def _exercise(
    title: str,
    task: str,
    steps: list[str],
    result: str,
) -> dict[str, Any]:
    return {"title": title, "task": task, "steps": steps, "result": result}


def _contract(given: str, todo: str, check: str) -> dict[str, str]:
    return {"given": given, "todo": todo, "check": check}


def _script(
    title: str,
    prompt: str,
    starter_code: str,
    expected: str,
    reference_code: str,
) -> dict[str, Any]:
    return {
        "title": title,
        "level": "easy",
        "mode": "script",
        "prompt": prompt,
        "contract": _contract(
            "Интерпретатор подготовит переменные из условия. В проверке их значения могут меняться.",
            prompt,
            "Программа запускается на нескольких скрытых наборах данных. Сравнивается весь вывод.",
        ),
        "requirements": {},
        "starter_code": starter_code,
        "tests": [{"name": "ожидаемый вывод", "expected": expected, "assert": "stdout"}],
        "reference_code": reference_code,
    }


def _solve(
    title: str,
    prompt: str,
    starter_code: str,
    tests: list[dict[str, Any]],
    reference_code: str,
    *,
    level: str = "easy",
) -> dict[str, Any]:
    return {
        "title": title,
        "level": level,
        "mode": "solve",
        "prompt": prompt,
        "contract": _contract(
            "Автопроверка несколько раз вызовет функцию solve с разными скрытыми данными.",
            prompt,
            "Верните результат через return. Проверяются несколько скрытых сценариев, а не один пример.",
        ),
        "requirements": {},
        "starter_code": starter_code,
        "tests": tests,
        "reference_code": reference_code,
    }


def _dynamic_script(
    task: dict[str, Any],
    *,
    given: str,
    todo: str,
    starter_code: str,
    tests: list[dict[str, Any]],
    reference_code: str,
    requirements: dict[str, Any],
) -> None:
    task.update(
        prompt=todo,
        contract=_contract(
            given,
            todo,
            "Интерпретатор запустит программу на нескольких скрытых наборах данных и сверит весь вывод.",
        ),
        starter_code=starter_code,
        tests=tests,
        reference_code=reference_code,
        requirements=requirements,
    )


def merge_lesson_maps(
    *catalogs: dict[int, list[dict[str, Any]]],
) -> dict[int, list[dict[str, Any]]]:
    """Объединяет блоки без потери ключей и без копирования карточек."""
    merged: dict[int, list[dict[str, Any]]] = {}
    for catalog in catalogs:
        for number, tasks in catalog.items():
            if number in merged:
                raise ValueError(f"Повторный номер занятия в каталоге практики: {number}")
            merged[number] = tasks
    return merged


def validate_block(
    first_lesson: int,
    last_lesson: int,
    *catalogs: dict[int, list[dict[str, Any]]],
) -> None:
    """Проверяет диапазон каждого вида практики независимо от другого."""
    for catalog in catalogs:
        for number in catalog:
            if type(number) is not int or not first_lesson <= number <= last_lesson:
                raise ValueError(
                    f"Номер занятия {number!r} вне диапазона блока {first_lesson}–{last_lesson}"
                )
