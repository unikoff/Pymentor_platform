"""Release acceptance must detect the statistics API drift found in StudyHub."""

import contextlib
import io
import unittest

from learning.code_runner import run_python_task
from learning.course_content.chapter_01 import CODE_TASKS, MANUAL_PRACTICE


class FoundationsReleaseContractsTests(unittest.TestCase):
    def setUp(self):
        self.task = CODE_TASKS["19.1"][0]

    def grade(self, code):
        return run_python_task(code, self.task)

    def test_reference_passes_every_statistics_case(self):
        result = self.grade(self.task["reference_code"])
        self.assertTrue(result["ok"], result)

    def test_tuple_result_is_rejected(self):
        code = self.task["reference_code"].replace(
            'return {"total": total, "completed": completed, "left": total - completed}',
            "return total, completed, total - completed",
        )
        self.assertFalse(self.grade(code)["ok"])

    def test_two_argument_percentage_is_rejected(self):
        code = self.task["reference_code"].replace(
            "def completion_percent(statistics):",
            "def completion_percent(completed, total):",
        )
        self.assertFalse(self.grade(code)["ok"])

    def test_zero_division_rounding_and_source_mutation_are_detected(self):
        code = self.task["reference_code"]
        for broken in (
            code.replace('if statistics["total"] == 0:', 'if False:'),
            code.replace('return round(statistics["completed"] / statistics["total"] * 100, 1)',
                         'return statistics["completed"] / statistics["total"] * 100'),
            code.replace('statistics = build_statistics(tasks)',
                         'statistics = build_statistics(tasks)\ntasks.clear()'),
        ):
            with self.subTest(code=broken):
                self.assertFalse(self.grade(broken)["ok"])

    def test_local_manual_solutions_keep_the_same_public_api(self):
        tasks = MANUAL_PRACTICE["19.1"][0]["tasks"]
        namespace = {}
        for title in ("Реализовать build_statistics", "Реализовать completion_percent"):
            task = next(t for t in tasks if t["title"] == title)
            exec(task["answer"]["code"], namespace)
        build = namespace["build_statistics"]
        percent = namespace["completion_percent"]
        self.assertEqual(build([]), {"total": 0, "completed": 0, "left": 0})
        self.assertEqual(percent(build([])), 0.0)
        records = [{"is_done": True}, {"is_done": False}]
        self.assertEqual(build(records), {"total": 2, "completed": 1, "left": 1})
        self.assertEqual(percent(build(records)), 50.0)
        self.assertEqual(percent({"total": 3, "completed": 1, "left": 2}), 33.3)
        self.assertEqual(records, [{"is_done": True}, {"is_done": False}])

    def test_factory_and_formatter_steps_work_in_sequence(self):
        tasks = MANUAL_PRACTICE[14][0]["tasks"]
        namespace = {}
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            for task in tasks[:2]:
                exec(task["answer"]["code"], namespace)
        self.assertEqual(namespace["first_task"]["title"], "Прочитать главу")
        self.assertIn("[21] Прочитать главу | приоритет: 3 | не завершена", output.getvalue())
        self.assertIn("[22] Проверить расписание | приоритет: 5 | выполнена", output.getvalue())


if __name__ == "__main__":
    unittest.main()
