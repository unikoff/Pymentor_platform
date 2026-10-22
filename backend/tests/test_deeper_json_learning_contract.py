"""Run the JSON lesson's project examples against the preceding CLI contract."""

import copy
import io
import json
import sys
import types
import unittest
from contextlib import redirect_stdout
from unittest.mock import patch

from learning.course_content.chapter_02.block_06.manual import MANUAL_PRACTICE


class JsonLessonContractTests(unittest.TestCase):
    def setUp(self):
        self.tasks = MANUAL_PRACTICE["29.1"][0]["tasks"]
        self.cli = types.ModuleType("app.cli")
        self.storage = types.ModuleType("app.storage")
        self.app = types.ModuleType("app")
        self.records = [
            {"id": 7, "title": 'Прочитать "JSON" \\ заметки', "priority": 1, "is_done": True},
            {"id": 12, "title": "План\nна завтра", "priority": 5, "is_done": False},
        ]
        exec(self.tasks[1]["answer"]["code"], self.storage.__dict__)
        self.app.cli = self.cli
        self.app.storage = self.storage
        self.modules = patch.dict(sys.modules, {
            "app": self.app, "app.cli": self.cli, "app.storage": self.storage,
        })
        self.modules.start()
        self.addCleanup(self.modules.stop)

    def run_example(self, index, namespace):
        output = io.StringIO()
        with redirect_stdout(output):
            exec(self.tasks[index]["answer"]["code"], namespace)
        return output.getvalue().splitlines()

    def test_cli_input_and_reentry_do_not_require_returned_state(self):
        def populate(tasks):
            tasks.extend(copy.deepcopy(self.records))
            # Lesson 28.2's CLI can return None: the supplied list owns the data.

        self.cli.run = populate
        namespace = {}
        self.run_example(0, namespace)
        self.assertEqual(namespace["tasks"], self.records)
        lines = self.run_example(2, namespace)
        self.assertEqual(lines, ["True", "False", "False"])
        self.cli.run = lambda tasks: None  # list / exit do not mutate the list.
        self.assertEqual(self.run_example(4, namespace), ["True"])
        self.assertEqual(namespace["restored"], self.records)

    def test_full_round_trip_preserves_values_and_creates_new_containers(self):
        original = copy.deepcopy(self.records)
        text = self.storage.encode_tasks(original)
        restored = self.storage.decode_tasks(text)
        self.assertIsInstance(text, str)
        self.assertIn("Прочитать", text)
        self.assertEqual(restored, self.records)
        self.assertEqual(original, self.records)
        self.assertIsNot(restored, original)
        for source, result in zip(original, restored):
            self.assertIsNot(source, result)
            self.assertIsInstance(result["is_done"], bool)

    def test_invalid_syntax_is_distinct_from_empty_or_unvalidated_data(self):
        self.assertEqual(self.run_example(3, {}), ["[]", "{'id': 1, 'title': 8}", "JSONDecodeError"])
        with self.assertRaises(json.JSONDecodeError):
            self.storage.decode_tasks("[")

    def test_independent_snapshot_example_restores_the_original_task(self):
        records = copy.deepcopy(self.records)
        namespace = dict(self.storage.__dict__, tasks=records)
        self.assertEqual(self.run_example(5, namespace), ["True", "False", "True"])
        self.assertEqual(records, self.records)


if __name__ == "__main__":
    unittest.main()
