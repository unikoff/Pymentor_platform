from __future__ import annotations

import asyncio
import json
import os
import subprocess
import sys
import tempfile
import threading
import unittest
from pathlib import Path
from time import perf_counter
from unittest.mock import patch

from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from DataBase import model as models
from DataBase.engine import Base
from learning.code_runner import _run_runner_source, run_python_task
from learning.runner_executor import RunnerExecutor
from learning.runner_runtime import RunnerLimits, bootstrap_source, run_bounded_process
from routers.learning import routers


TASK = {"id": "runner-test-task", "revision": "1" * 64,
        "mode": "solve", "tests": [{"args": [], "expected": 1}]}
LESSON = {"id": "runner-test-lesson", "access": "free", "source_file": "test/lesson.md",
          "tasks": [TASK], "manual_practice": []}


async def request(app, path, *, method="GET", cookie=False, code="def solve(): return 1", revision=None):
    messages = []
    body = json.dumps({"code": code, "task_revision": revision or TASK["revision"]}).encode()
    async def receive():
        return {"type": "http.request", "body": body, "more_body": False}
    async def send(message):
        messages.append(message)
    headers = [(b"content-type", b"application/json")]
    if cookie:
        headers.append((b"cookie", b"session=runner-test-session"))
    await app({"type": "http", "asgi": {"version": "3.0", "spec_version": "2.4"},
               "http_version": "1.1", "method": method, "scheme": "http", "path": path,
               "raw_path": path.encode(), "root_path": "", "query_string": b"", "headers": headers,
               "server": ("testserver", 80), "client": ("127.0.0.1", 12345)}, receive, send)
    start = next(message for message in messages if message["type"] == "http.response.start")
    data = b"".join(message.get("body", b"") for message in messages if message["type"] == "http.response.body")
    return start["status"], json.loads(data), dict(start["headers"])


class RunnerResourceTests(unittest.TestCase):
    def assert_recovered(self):
        result = run_python_task("def solve(): return 1", TASK)
        self.assertTrue(result["ok"], result)

    def test_timeout_and_recovery(self):
        with patch.dict(os.environ, {"PYMENTOR_RUNNER_TIMEOUT_SECONDS": "0.25"}):
            result = run_python_task("def solve():\n    while True: pass", TASK)
        self.assertFalse(result["ok"])
        self.assertIn("дольше", result["error"])
        self.assert_recovered()

    def test_output_budget_is_cumulative_and_cannot_be_swallowed(self):
        task = {"mode": "script", "tests": [{"expected": ""}, {"expected": ""}]}
        result = run_python_task("print('x' * 40000)", task)
        self.assertIn("лимит вывода", result["error"])
        caught = "def solve():\n    try:\n        print('x' * 70000)\n    except:\n        pass\n    return 1"
        result = run_python_task(caught, TASK)
        self.assertFalse(result["ok"])
        self.assertIn("лимит вывода", result["error"])
        self.assert_recovered()

    def test_result_limit_and_recovery(self):
        result = run_python_task("def solve(): return ['x' * 4096 for i in range(1024)]", TASK)
        self.assertFalse(result["ok"])
        self.assertIn("размера результата", result["error"])
        self.assert_recovered()

    def test_parent_limits_stdout_and_stderr(self):
        for stream, size in (("stdout", 2 * 1024 * 1024), ("stderr", 128 * 1024)):
            with self.subTest(stream=stream):
                result = _run_runner_source(f"import sys\nsys.{stream}.buffer.write(b'x' * {size})")
                self.assertIsInstance(result, dict)
                self.assertFalse(result["ok"])
                self.assertIn("лимит", result["error"])
                self.assert_recovered()

    def test_invalid_config_fails_without_starting_process(self):
        for value in ("0", "nan", "-1", "invalid"):
            with self.subTest(value=value), patch.dict(os.environ, {"PYMENTOR_RUNNER_TIMEOUT_SECONDS": value}), \
                    patch("learning.runner_runtime.subprocess.Popen") as popen:
                result = run_python_task("def solve(): return 1", TASK)
                self.assertFalse(result["ok"])
                popen.assert_not_called()

    @unittest.skipUnless(sys.platform.startswith("linux"), "Linux resource limits")
    def test_linux_memory_limit_and_recovery(self):
        result = run_python_task("def solve(): return 'x' * (300 * 1024 * 1024)", TASK)
        self.assertFalse(result["ok"])
        self.assertIn("памяти", result["error"])
        self.assert_recovered()

    @unittest.skipUnless(sys.platform.startswith("linux"), "Linux resource limits")
    def test_linux_cpu_limit_and_recovery(self):
        with patch.dict(os.environ, {"PYMENTOR_RUNNER_CPU_SECONDS": "1", "PYMENTOR_RUNNER_TIMEOUT_SECONDS": "5"}):
            result = run_python_task("def solve():\n    while True: pass", TASK)
        self.assertFalse(result["ok"])
        self.assertIn("ресурсов", result["error"])
        self.assert_recovered()

    @unittest.skipUnless(os.name == "posix", "Unix process groups")
    def test_child_descendants_cannot_hold_pipes_or_outlive_runner(self):
        source = "import subprocess, sys\nsubprocess.Popen([sys.executable, '-c', 'import time; time.sleep(10)'])"
        start = perf_counter()
        result = _run_runner_source(source)
        self.assertIsInstance(result, subprocess.CompletedProcess)
        self.assertEqual(0, result.returncode)
        self.assertLess(perf_counter() - start, 2)
        self.assert_recovered()

    @unittest.skipUnless(sys.platform.startswith("linux"), "Linux resource limits")
    def test_linux_limit_setup_failure_never_executes_student_code(self):
        limits = RunnerLimits()
        prefix = "import resource\ndef denied(*args): raise PermissionError()\nresource.setrlimit = denied\n"
        source = prefix + bootstrap_source("raise AssertionError('must not execute')", limits)
        process = run_bounded_process([sys.executable, "-I", "-c", source], cwd=os.getcwd(),
                                      env=os.environ.copy(), limits=limits)
        self.assertEqual(0, process.returncode)
        self.assertIn("ограничения ресурсов", json.loads(process.stdout)["error"])


class RunnerAPITests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="pymentor-execution-test-")
        self.executor = RunnerExecutor(Path(self.temp.name) / "runner.lock")
        self.engine = create_engine(f"sqlite:///{Path(self.temp.name).as_posix()}/test.db",
                                    connect_args={"check_same_thread": False})
        Base.metadata.create_all(self.engine)
        self.sessions = sessionmaker(bind=self.engine)
        with self.sessions() as db:
            user = models.User(username="test", email="runner@example.test", password="$2b$test")
            db.add(user)
            db.flush()
            self.user_id = user.id
            db.add(models.Session(user_id=user.id, session_token="runner-test-session"))
            db.commit()
        self.app = FastAPI()
        self.app.include_router(routers.learning_router, prefix="/learning")
        @self.app.get("/ping")
        def ping():
            return {"ok": True}
        self.patches = [patch.object(routers.user_crud, "get_db", self.sessions),
                        patch.object(routers, "find_task", return_value=TASK),
                        patch.object(routers, "find_lesson_by_task", return_value=LESSON),
                        patch.object(routers, "get_runner_executor", return_value=self.executor)]
        for item in self.patches:
            item.start()

    def tearDown(self):
        self.executor.close()
        for item in reversed(self.patches):
            item.stop()
        self.engine.dispose()
        self.temp.cleanup()

    async def submit(self, **kwargs):
        return await request(self.app, f"/learning/tasks/{TASK['id']}/submit", method="POST", **kwargs)

    def progress_count(self):
        with self.sessions() as db:
            return db.query(models.UserLessonProgress).count()

    async def test_successful_submit_saves_progress_but_preview_does_not(self):
        status, result, _ = await request(self.app, f"/learning/tasks/{TASK['id']}/run", method="POST", cookie=True)
        self.assertEqual(200, status)
        self.assertTrue(result["ok"], result)
        self.assertEqual(0, self.progress_count())
        status, result, _ = await self.submit(cookie=True)
        self.assertEqual(200, status)
        self.assertTrue(result["ok"], result)
        self.assertEqual(1, self.progress_count())

    async def test_failures_and_stale_revision_never_save_progress(self):
        status, result, _ = await self.submit(cookie=True, code="def solve(): return 2")
        self.assertEqual(200, status)
        self.assertFalse(result["ok"])
        with patch.object(routers, "run_python_task") as runner:
            self.assertEqual(409, (await self.submit(cookie=True, revision="2" * 64))[0])
            runner.assert_not_called()
        self.assertEqual(0, self.progress_count())

    async def test_locked_lesson_is_rejected_before_execution(self):
        with patch.object(routers, "find_lesson_by_task", return_value={**LESSON, "access": "subscription"}), \
                patch.object(routers, "run_python_task") as runner:
            self.assertEqual(403, (await self.submit())[0])
            runner.assert_not_called()

    async def test_unavailable_lock_fails_closed_without_starting_runner(self):
        self.executor.lock_path = Path(self.temp.name)
        with patch.object(routers, "run_python_task") as runner:
            self.assertEqual(503, (await self.submit())[0])
            runner.assert_not_called()

    async def test_database_sessions_close_before_runner_and_reopen_for_progress(self):
        active = []
        sessions = self.sessions
        class SessionScope:
            def __enter__(self):
                self.session = sessions()
                active.append(threading.get_ident())
                return self.session
            def __exit__(self, *args):
                self.session.close()
                active.pop()
        def check(**kwargs):
            self.assertEqual([], active)
            return {"ok": True, "score": 100, "tests": [], "stdout": ""}
        loop_thread = threading.get_ident()
        context_threads = []
        def session_scope():
            context_threads.append(threading.get_ident())
            return SessionScope()
        with patch.object(routers.user_crud, "get_db", side_effect=session_scope), \
                patch.object(routers, "run_python_task", side_effect=check):
            self.assertTrue((await self.submit(cookie=True))[1]["ok"])
        self.assertEqual(2, len(context_threads))
        self.assertTrue(all(thread != loop_thread for thread in context_threads))
        self.assertEqual([], active)
        self.assertEqual(1, self.progress_count())

    async def test_parallel_api_remains_responsive_and_overload_returns_503(self):
        started, release = threading.Event(), threading.Event()
        def blocked(**kwargs):
            started.set()
            if not release.wait(3):
                raise AssertionError("test worker was not released")
            return {"ok": True, "score": 100, "tests": [], "stdout": ""}
        with patch.object(routers, "run_python_task", side_effect=blocked):
            first = asyncio.create_task(self.submit())
            try:
                self.assertTrue(await asyncio.to_thread(started.wait, 1))
                start = perf_counter()
                self.assertEqual(200, (await asyncio.wait_for(request(self.app, "/ping"), 0.5))[0])
                self.assertLess(perf_counter() - start, 0.5)
                status, data, headers = await self.submit()
                self.assertEqual(503, status)
                self.assertEqual(b"2", headers[b"retry-after"])
                self.assertIn("Проверка занята", data["detail"])
            finally:
                release.set()
                await first

    async def test_real_runner_keeps_api_responsive_and_recovers_after_timeout(self):
        started = threading.Event()
        def marked(**kwargs):
            started.set()
            return run_python_task(**kwargs)
        with patch.dict(os.environ, {"PYMENTOR_RUNNER_TIMEOUT_SECONDS": "1"}), \
                patch.object(routers, "run_python_task", side_effect=marked):
            first = asyncio.create_task(self.submit(code="def solve():\n    while True: pass"))
            self.assertTrue(await asyncio.to_thread(started.wait, 1))
            self.assertEqual(200, (await asyncio.wait_for(request(self.app, "/ping"), 0.5))[0])
            self.assertFalse(first.done())
            self.assertEqual(503, (await self.submit())[0])
            status, result, _ = await first
            self.assertEqual(200, status)
            self.assertFalse(result["ok"])
        self.assertTrue((await self.submit())[1]["ok"])

    async def test_mixed_practice_does_not_automatically_complete_lesson(self):
        with patch.object(routers, "find_lesson_by_task", return_value={**LESSON, "manual_practice": [{"title": "manual"}]}):
            self.assertTrue((await self.submit(cookie=True))[1]["ok"])
        self.assertEqual(0, self.progress_count())

    async def test_persisted_tasks_complete_lesson_only_after_all_current_revisions(self):
        second = {**TASK, "id": "runner-test-task-2", "revision": "2" * 64}
        lesson = {**LESSON, "source_file": "foundations/block_03/lesson.md", "tasks": [TASK, second]}
        with patch.object(routers, "find_lesson_by_task", return_value=lesson):
            self.assertTrue((await self.submit(cookie=True))[1]["ok"])
        self.assertEqual(0, self.progress_count())
        await asyncio.to_thread(routers._save_task_progress, {"user_id": self.user_id, "task": second, "lesson": lesson})
        self.assertEqual(1, self.progress_count())
        with self.sessions() as db:
            self.assertEqual(2, db.query(models.UserTaskProgress).count())

    async def test_cancelled_request_keeps_slot_until_real_child_exits(self):
        started = threading.Event()
        original = run_python_task
        def marked(**kwargs):
            started.set()
            return original(**kwargs)
        with patch.dict(os.environ, {"PYMENTOR_RUNNER_TIMEOUT_SECONDS": "0.4"}), \
                patch.object(routers, "run_python_task", side_effect=marked):
            first = asyncio.create_task(self.submit(cookie=True, code="def solve():\n    while True: pass"))
            self.assertTrue(await asyncio.to_thread(started.wait, 1))
            first.cancel()
            with self.assertRaises(asyncio.CancelledError):
                await first
            self.assertEqual(503, (await self.submit())[0])
            await asyncio.to_thread(self.executor.close)
        self.assertEqual(0, self.progress_count())
        self.executor = RunnerExecutor(self.executor.lock_path)
        self.patches[-1].stop()
        self.patches[-1] = patch.object(routers, "get_runner_executor", return_value=self.executor)
        self.patches[-1].start()
        self.assertTrue((await self.submit())[1]["ok"])

    async def test_another_process_holds_global_slot_and_api_returns_503(self):
        source = (
            "from pathlib import Path\nfrom learning.runner_executor import _lock_file, _unlock_file\n"
            f"with Path({str(self.executor.lock_path)!r}).open('a+b') as handle:\n"
            "    handle.write(b'0'); handle.flush(); _lock_file(handle)\n"
            "    print('READY', flush=True); input(); _unlock_file(handle)\n"
        )
        with subprocess.Popen([sys.executable, "-c", source], stdin=subprocess.PIPE,
                              stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True) as holder:
            try:
                ready = await asyncio.wait_for(asyncio.to_thread(holder.stdout.readline), 5)
                self.assertEqual("READY", ready.strip())
                self.assertEqual(503, (await self.submit())[0])
            finally:
                holder.communicate("release\n", timeout=5)
        self.assertTrue((await self.submit())[1]["ok"])


if __name__ == "__main__":
    unittest.main()
