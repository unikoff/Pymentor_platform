"""Exercise contracts must grade understanding and permit alternative plans."""

import unittest

from content.practice.runner.python import run_python_task
from content.materials.chapter_01 import CODE_TASKS


def exercise(number, title):
    return next(task for task in CODE_TASKS[number] if task["title"] == title)


class FoundationsLearningProgressionTests(unittest.TestCase):
    def assert_accepted(self, task, code):
        result = run_python_task(code, task)
        self.assertTrue(result["ok"], result)

    def assert_rejected(self, task, code):
        result = run_python_task(code, task)
        self.assertFalse(result["ok"], result)

    def test_accumulation_catches_empty_negative_and_inclusive_boundary(self):
        task = exercise("9.1", "Самостоятельно построим накопление")
        code = task["reference_code"]
        self.assert_accepted(task, code)
        self.assert_rejected(task, code.replace("best = None", "best = 0"))
        self.assert_rejected(task, code.replace("value >= threshold", "value > threshold"))
        self.assert_rejected(task, code.replace("total += value", "total = value"))

    def test_while_catches_off_by_one_and_skipped_increment(self):
        task = exercise("10.1", "Сами построим конечный счётчик")
        code = task["reference_code"]
        self.assert_accepted(task, code)
        self.assert_rejected(task, code.replace("count < limit", "count <= limit"))
        self.assert_rejected(task, code.replace("count = count + 1", "count = count + 2"))

    def test_integrated_work_checks_filter_and_preserves_source(self):
        task = exercise("10.2", "Итоговая работа: подберём помещения")
        code = task["reference_code"]
        self.assert_accepted(task, code)
        self.assert_rejected(task, code.replace('room["is_open"] and ', ""))
        self.assert_rejected(task, code.replace('room["seats"] >= needed_seats', 'room["seats"] > needed_seats'))
        self.assert_rejected(task, code.replace("print(rooms)", "rooms.clear()\nprint(rooms)"))

    def test_integrated_work_accepts_one_pass_instead_of_a_separate_selection(self):
        task = exercise("10.2", "Итоговая работа: подберём помещения")
        self.assert_accepted(task, '''amount = 0
capacity = 0
largest = None
for entry in rooms:
    if entry["is_open"] and entry["seats"] >= needed_seats:
        print(entry["name"])
        amount += 1
        capacity += entry["seats"]
        if largest is None:
            largest = entry["seats"]
        elif entry["seats"] > largest:
            largest = entry["seats"]
print(amount)
print(capacity)
print(largest)
print(rooms)
''')

    def test_new_diagnosis_detects_wrong_input_without_breaking_general_sum(self):
        task = exercise("11.2", "Самостоятельная диагностика отчёта")
        self.assert_rejected(task, task["starter_code"])
        self.assert_accepted(task, task["reference_code"])
        # Filtering inside the general sum disguises the symptom but breaks the last line.
        self.assert_rejected(task, task["starter_code"].replace(
            'total += book["pages"]',
            'if book["available"]:\n            total += book["pages"]',
        ))

    def test_final_report_excludes_completed_tasks_and_preserves_input(self):
        task = exercise("20.1", "Самостоятельная миниработа: отчёт по открытым задачам")
        code = task["reference_code"]
        self.assert_accepted(task, code)
        self.assert_rejected(task, code.replace('if not task["is_done"]:', "if True:"))
        self.assert_rejected(task, code.replace("largest_priority = None", "largest_priority = 0"))
        self.assert_rejected(task, code.replace("print(tasks)", "tasks.clear()\nprint(tasks)"))

    def test_final_report_accepts_student_defined_helpers(self):
        task = exercise("20.1", "Самостоятельная миниработа: отчёт по открытым задачам")
        self.assert_accepted(task, '''def choose_open(records):
    chosen = []
    for record in records:
        if not record["is_done"]:
            chosen.append(record)
    return chosen

def biggest_priority(records):
    candidate = None
    for record in records:
        if candidate is None:
            candidate = record["priority"]
        elif record["priority"] > candidate:
            candidate = record["priority"]
    return candidate

chosen = choose_open(tasks)
print(len(chosen))
print(biggest_priority(chosen))
print(tasks)
''')

    def test_file_builtin_stays_blocked_with_and_without_spaces(self):
        task = exercise("20.1", "Самостоятельная миниработа: отчёт по открытым задачам")
        for code in ['open("file.txt")', 'open ("file.txt")']:
            with self.subTest(code=code):
                result = run_python_task(code, task)
                self.assertFalse(result["ok"])
                self.assertIn("Запрещённая конструкция", result["error"])


if __name__ == "__main__":
    unittest.main()
