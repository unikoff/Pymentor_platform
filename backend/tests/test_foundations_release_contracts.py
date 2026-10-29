"""Release acceptance must detect the statistics API drift found in StudyHub."""

import contextlib
import io
import unittest

from content.practice.runner.python import run_python_task
from content.materials.chapter_01 import CODE_TASKS, MANUAL_PRACTICE


class FoundationsReleaseContractsTests(unittest.TestCase):
    def setUp(self):
        self.task = CODE_TASKS["19.1"][0]

    def grade(self, code):
        return run_python_task(code, self.task)

    def replace_required(self, code, original, replacement):
        self.assertIn(original, code)
        return code.replace(original, replacement)

    def test_reference_passes_every_statistics_case(self):
        result = self.grade(self.task["reference_code"])
        self.assertTrue(result["ok"], result)

    def test_tuple_result_is_rejected(self):
        code = self.replace_required(self.task["reference_code"],
            'return {"total": total, "completed": completed, "left": left}',
            "return total, completed, total - completed",
        )
        self.assertFalse(self.grade(code)["ok"])

    def test_two_argument_percentage_is_rejected(self):
        code = self.replace_required(self.task["reference_code"],
            "def completion_percent(statistics):",
            "def completion_percent(completed, total):",
        )
        self.assertFalse(self.grade(code)["ok"])

    def test_zero_division_rounding_and_source_mutation_are_detected(self):
        code = self.task["reference_code"]
        for broken in (
            self.replace_required(code, 'if total == 0:', 'if False:'),
            self.replace_required(
                code,
                'return round(statistics["completed"] / total * 100, 1)',
                'return statistics["completed"] / total * 100',
            ),
            self.replace_required(
                code,
                'statistics = build_statistics(tasks)',
                'statistics = build_statistics(tasks)\ntasks.clear()',
            ),
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
        self.assertEqual(namespace["first"]["id"], 21)
        self.assertEqual(namespace["first"]["title"], "Проверить задания")
        self.assertTrue(namespace["first"]["is_done"])
        self.assertEqual(namespace["second"]["id"], 22)
        self.assertFalse(namespace["second"]["is_done"])
        self.assertIn("[21] Проверить задания | приоритет: 4 | выполнена", output.getvalue())
        self.assertIn("[22] Сделать паузу | приоритет: 1 | не завершена", output.getvalue())


if __name__ == "__main__":
    unittest.main()
