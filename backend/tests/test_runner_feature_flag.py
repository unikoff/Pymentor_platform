from __future__ import annotations

import unittest
from unittest.mock import patch

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from starlette.requests import Request

from db.engine import Base
from routers.courses import service
from routers.courses.schemas import CodeSubmitRequest, InterpreterRunRequest


class RunnerFeatureFlagTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(self.engine)

    def tearDown(self):
        self.engine.dispose()

    def test_only_explicit_truthy_configuration_enables_legacy_runner(self):
        for value in ("1", "true", "yes", "on"):
            with self.subTest(value=value), patch.dict("os.environ", {service.RUNNER_ENABLED_ENV: value}):
                service._require_runner_enabled()

        for value in ("", "false", "0", "unexpected"):
            with self.subTest(value=value), patch.dict("os.environ", {service.RUNNER_ENABLED_ENV: value}):
                with self.assertRaises(HTTPException) as raised:
                    service._require_runner_enabled()
                self.assertEqual(503, raised.exception.status_code)

    async def test_runner_is_disabled_by_default_before_all_execution_paths(self):
        request = Request({"type": "http", "headers": []})
        with patch.dict("os.environ", {}, clear=True), \
                patch.object(service, "_prepare_task") as prepare, \
                patch.object(service, "get_runner_executor") as executor, \
                patch.object(service, "run_python_task") as submit_runner, \
                patch.object(service, "run_python_preview") as preview_runner, \
                patch.object(service, "run_python_code") as interpreter_runner:
            actions = (
                ("submit", lambda: service.submit_task(
                    "task-id",
                    CodeSubmitRequest(code="def solve(): return 1", task_revision="a" * 64),
                    request,
                )),
                ("preview", lambda: service.run_task_code(
                    "task-id",
                    CodeSubmitRequest(code="def solve(): return 1", task_revision="a" * 64),
                    request,
                )),
                ("interpreter", lambda: service.run_interpreter_code(InterpreterRunRequest(code="print('ok')"))),
            )
            for name, action in actions:
                with self.subTest(action=name):
                    with self.assertRaises(HTTPException) as raised:
                        await action()
                    self.assertEqual(503, raised.exception.status_code)
                    self.assertEqual("Runner execution is temporarily disabled", raised.exception.detail)
            prepare.assert_not_called()
            executor.assert_not_called()
            submit_runner.assert_not_called()
            preview_runner.assert_not_called()
            interpreter_runner.assert_not_called()


if __name__ == "__main__":
    unittest.main()
