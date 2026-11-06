"""Learner-visible dictionary contracts must not depend on private local names."""

import runpy
from pathlib import Path

from content.practice.runner.python import run_python_task


def dictionary_removal_task():
    source = Path(__file__).parents[1] / "content/materials/chapter_01/block_02/code_tasks.py"
    tasks = runpy.run_path(str(source))["CODE_TASKS"]
    return tasks[8][4]


PROGRAM = '''present_before = "annotation" in material
old_value = material.pop("annotation", 0)
del material["service"]
print(present_before)
print(old_value)
print("annotation" in material)
print("service" in material)
print(material["title"])
'''


def test_dictionary_removal_accepts_unspecified_local_names():
    result = run_python_task(PROGRAM, dictionary_removal_task())
    assert result["ok"] is True, result
    assert result["score"] == 100


def test_dictionary_removal_still_requires_removing_service():
    result = run_python_task(PROGRAM.replace('del material["service"]\n', ""), dictionary_removal_task())
    assert result["ok"] is False


def test_requirements_failure_is_classified_before_executing_tests():
    result = run_python_task('print("ok")', {"requirements": {"nodes": ["For"]}, "tests": []})
    assert result["ok"] is False
    assert result["error_kind"] == "requirements"
    assert result["tests"] == []
