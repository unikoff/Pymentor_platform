"""One admitted runner per application, independent of ASGI lifespan."""

from __future__ import annotations

import asyncio
import errno
import os
import threading
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from time import perf_counter
from typing import Callable, Any

from content.practice.runner.runtime import logger


from core.config import BACKEND_ROOT

LOCK_PATH = BACKEND_ROOT / ".runner.lock"


class RunnerBusy(Exception):
    pass


class RunnerUnavailable(Exception):
    pass


def _lock_file(handle) -> None:
    try:
        if os.name == "nt":
            import msvcrt

            handle.seek(0)
            msvcrt.locking(handle.fileno(), msvcrt.LK_NBLCK, 1)
        else:
            import fcntl

            fcntl.flock(handle.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
    except OSError as exc:
        if exc.errno in (errno.EACCES, errno.EAGAIN, errno.EDEADLK):
            raise RunnerBusy from exc
        raise


def _unlock_file(handle) -> None:
    if os.name == "nt":
        import msvcrt

        handle.seek(0)
        msvcrt.locking(handle.fileno(), msvcrt.LK_UNLCK, 1)
    else:
        import fcntl

        fcntl.flock(handle.fileno(), fcntl.LOCK_UN)


class RunnerExecutor:
    def __init__(self, lock_path: Path = LOCK_PATH):
        self.lock_path = lock_path
        self._slot = threading.BoundedSemaphore(1)
        self._pool = ThreadPoolExecutor(max_workers=1, thread_name_prefix="pymentor-runner")

    def _execute(self, function: Callable[..., Any], kwargs: dict) -> Any:
        start = perf_counter()
        try:
            # Keep this file: unlinking a locked inode could admit another process.
            try:
                handle = self.lock_path.open("a+b")
            except OSError as exc:
                logger.error("runner_lock_unavailable errno=%s", exc.errno)
                raise RunnerUnavailable from exc
            with handle:
                try:
                    if handle.tell() == 0:
                        handle.write(b"\0")
                        handle.flush()
                    _lock_file(handle)
                except RunnerBusy:
                    raise
                except OSError as exc:
                    logger.error("runner_lock_unavailable errno=%s", exc.errno)
                    raise RunnerUnavailable from exc
                try:
                    return function(**kwargs)
                finally:
                    _unlock_file(handle)
        finally:
            self._slot.release()
            logger.info("runner_finished duration_ms=%.1f", (perf_counter() - start) * 1000)

    async def run(self, function: Callable[..., Any], **kwargs) -> Any:
        if not self._slot.acquire(blocking=False):
            raise RunnerBusy
        try:
            future = self._pool.submit(self._execute, function, kwargs)
        except BaseException:
            self._slot.release()
            raise
        wrapped = asyncio.wrap_future(future)
        # A disconnected caller must neither cancel cleanup nor release its slot.
        # Observe errors even when nobody remains to await this future.
        wrapped.add_done_callback(lambda done: done.exception() if not done.cancelled() else None)
        return await asyncio.shield(wrapped)

    def close(self) -> None:
        self._pool.shutdown(wait=True)


_executor: RunnerExecutor | None = None
_executor_pid: int | None = None


def get_runner_executor() -> RunnerExecutor:
    global _executor, _executor_pid
    # Passenger can fork a preloaded application. Never reuse a parent's pool.
    if _executor is None or _executor_pid != os.getpid():
        _executor = RunnerExecutor()
        _executor_pid = os.getpid()
    return _executor
