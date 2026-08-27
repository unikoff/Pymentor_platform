import copy
import unittest

from fastapi import HTTPException

from learning.code_runner import run_python_task
from learning.content import build_task_revision
from routers.learning.routers import _require_current_task_revision


class CodeRunnerRegressionTests(unittest.TestCase):
    @staticmethod
    def _run_stdout(code: str, expected: str) -> dict:
        return run_python_task(
            code,
            {
                "mode": "script",
                "tests": [
                    {
                        "name": "stdout",
                        "expected": expected,
                        "assert": "stdout",
                    }
                ],
            },
        )

    def test_stdout_allows_one_terminal_newline_and_keeps_raw_output(self) -> None:
        result = self._run_stdout('print("value")', "value")

        self.assertTrue(result["ok"])
        self.assertEqual("value\n", result["tests"][0]["actual"])

    def test_stdout_normalizes_crlf_only(self) -> None:
        result = self._run_stdout('print("value", end="\\r\\n")', "value")

        self.assertTrue(result["ok"])
        self.assertEqual("value\r\n", result["tests"][0]["actual"])

    def test_stdout_does_not_ignore_leading_or_trailing_spaces(self) -> None:
        leading = self._run_stdout('print(" value")', "value")
        trailing = self._run_stdout('print("value ")', "value")

        self.assertFalse(leading["ok"])
        self.assertFalse(trailing["ok"])

    def test_stdout_keeps_extra_blank_line_significant(self) -> None:
        result = self._run_stdout('print("value")\nprint()', "value")

        self.assertFalse(result["ok"])
        self.assertEqual("value\n\n", result["tests"][0]["actual"])

    def test_nested_dict_is_compared_semantically(self) -> None:
        task = {
            "tests": [
                {
                    "name": "nested value",
                    "expected": {"a": [1, {"b": 2}], "c": False},
                }
            ]
        }
        code = "def solve():\n    return {'c': False, 'a': [1, {'b': 2}]}\n"

        result = run_python_task(code, task)

        self.assertTrue(result["ok"])

    def test_bool_is_not_equal_to_int(self) -> None:
        result = run_python_task(
            "def solve():\n    return True\n",
            {"tests": [{"name": "strict type", "expected": 1}]},
        )

        self.assertFalse(result["ok"])
        self.assertFalse(result["tests"][0]["passed"])

    def test_float_tolerance_is_opt_in_per_test(self) -> None:
        result = run_python_task(
            "def solve():\n    return 0.3005\n",
            {"tests": [{"name": "tolerance", "expected": 0.3, "float_tolerance": 0.001}]},
        )

        self.assertTrue(result["ok"])

    def test_task_revision_changes_when_hidden_tests_change(self) -> None:
        task = {
            "id": "lesson-example-task-01",
            "title": "Example",
            "starter_code": "def solve():\n    pass\n",
            "tests": [{"args": [1], "expected": {"value": 1}}],
        }
        changed_task = copy.deepcopy(task)
        changed_task["tests"][0]["expected"] = {"value": 2}

        self.assertNotEqual(build_task_revision(task), build_task_revision(changed_task))

    def test_stale_task_revision_is_configuration_error(self) -> None:
        with self.assertRaises(HTTPException) as error:
            _require_current_task_revision({"revision": "a" * 64}, "b" * 64)

        self.assertEqual(409, error.exception.status_code)
        self.assertIn("обновите страницу", error.exception.detail.lower())


if __name__ == "__main__":
    unittest.main()
