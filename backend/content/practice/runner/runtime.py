"""Bounded child process I/O and resource limits for the grading harness."""

from __future__ import annotations

import logging
import math
import os
import signal
import subprocess
import sys
import threading
from dataclasses import dataclass


logger = logging.getLogger("pymentor.runner")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    logger.propagate = False
_warned_without_memory_limit = False


def failure(message: str) -> dict:
    return {"ok": False, "score": 0, "error": message, "tests": [], "stdout": ""}


@dataclass(frozen=True)
class RunnerLimits:
    timeout: float = 3
    cpu_seconds: int = 3
    memory_mb: int = 128
    output_bytes: int = 64 * 1024
    result_bytes: int = 1024 * 1024
    stderr_bytes: int = 64 * 1024

    @classmethod
    def configured(cls, timeout_default: float = 3) -> RunnerLimits:
        values = {
            "timeout": float(os.getenv("PYMENTOR_RUNNER_TIMEOUT_SECONDS", str(timeout_default))),
            "cpu_seconds": int(os.getenv("PYMENTOR_RUNNER_CPU_SECONDS", "3")),
            "memory_mb": int(os.getenv("PYMENTOR_RUNNER_MEMORY_MB", "128")),
            "output_bytes": int(os.getenv("PYMENTOR_RUNNER_OUTPUT_BYTES", str(64 * 1024))),
            "result_bytes": int(os.getenv("PYMENTOR_RUNNER_RESULT_BYTES", str(1024 * 1024))),
            "stderr_bytes": int(os.getenv("PYMENTOR_RUNNER_STDERR_BYTES", str(64 * 1024))),
        }
        if any(not math.isfinite(value) or value <= 0 for value in values.values()):
            raise ValueError("Runner limits must be finite and positive")
        return cls(**values)


def bootstrap_source(source: str, limits: RunnerLimits) -> str:
    """Apply limits in the child itself, never via preexec_fn in a threaded app."""
    return f'''
import io
import json
import sys
import contextlib
import copy
import math
import traceback

# Load trusted harness extensions before RLIMIT_AS can prevent dlopen().
# Student code is still executed only after all resource limits are installed.
runner_code = compile({source!r}, "<pymentor-runner>", "exec")

def write_failure(message):
    sys.stdout.write(json.dumps({{"ok": False, "score": 0, "tests": [], "stdout": "", "error": message}}, ensure_ascii=False))

if sys.platform.startswith("linux"):
    try:
        import resource
        for kind, requested in ((resource.RLIMIT_AS, {limits.memory_mb} * 1024 * 1024), (resource.RLIMIT_CPU, {limits.cpu_seconds})):
            soft, hard = resource.getrlimit(kind)
            ceiling = requested if hard == resource.RLIM_INFINITY else min(requested, hard)
            resource.setrlimit(kind, (ceiling, ceiling))
    except Exception:
        write_failure("Не удалось установить ограничения ресурсов проверки.")
        raise SystemExit(0)

class RunnerLimitError(BaseException):
    pass

class OutputBudget:
    used = 0
    exceeded = False

budget = OutputBudget()

class LimitedStringIO(io.StringIO):
    def write(self, value):
        size = 0
        for start in range(0, len(value), 4096):
            size += len(value[start:start + 4096].encode("utf-8"))
            if budget.exceeded or budget.used + size > {limits.output_bytes}:
                budget.exceeded = True
                raise RunnerLimitError("Превышен лимит вывода программы.")
        if budget.exceeded:
            raise RunnerLimitError("Превышен лимит вывода программы.")
        budget.used += size
        return super().write(value)

def emit_result(result):
    if budget.exceeded:
        raise RunnerLimitError("Превышен лимит вывода программы.")
    chunks = []
    size = 0
    for chunk in json.JSONEncoder(ensure_ascii=False).iterencode(result):
        encoded = chunk.encode("utf-8")
        size += len(encoded)
        if size > {limits.result_bytes}:
            raise RunnerLimitError("Превышен лимит размера результата проверки.")
        chunks.append(encoded)
    sys.stdout.buffer.write(b"".join(chunks))

try:
    exec(runner_code, globals())
except RunnerLimitError as exc:
    write_failure(str(exc))
except MemoryError:
    write_failure("Превышен лимит памяти программы.")
except Exception as exc:
    sys.stderr.write(f"Runner startup failed: {{type(exc).__name__}}: {{exc}}\\n")
    write_failure("Не удалось выполнить проверку на сервере. Повторите попытку позже.")
'''


def run_bounded_process(args: list[str], *, cwd: str, env: dict, limits: RunnerLimits):
    global _warned_without_memory_limit
    if not sys.platform.startswith("linux") and not _warned_without_memory_limit:
        logger.warning("runner_os_memory_cpu_limits_unavailable platform=%s", sys.platform)
        _warned_without_memory_limit = True

    buffers = {"stdout": bytearray(), "stderr": bytearray()}
    exceeded = threading.Event()
    read_failed = threading.Event()
    timed_out = False
    process_group = os.name == "posix"
    with subprocess.Popen(args, cwd=cwd, env=env, stdin=subprocess.DEVNULL,
                          stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                          start_new_session=process_group) as process:
        def kill():
            try:
                if process_group:
                    os.killpg(process.pid, signal.SIGKILL)
                else:
                    process.kill()
            except ProcessLookupError:
                pass

        def read_pipe(name, stream, maximum):
            try:
                while chunk := stream.read1(8192):
                    if len(buffers[name]) + len(chunk) > maximum:
                        exceeded.set()
                        kill()
                        return
                    buffers[name].extend(chunk)
            except OSError:
                read_failed.set()
                kill()
            finally:
                stream.close()

        readers = [
            threading.Thread(target=read_pipe, args=("stdout", process.stdout, limits.result_bytes)),
            threading.Thread(target=read_pipe, args=("stderr", process.stderr, limits.stderr_bytes)),
        ]
        started = []
        try:
            for reader in readers:
                reader.start()
                started.append(reader)
            try:
                process.wait(timeout=limits.timeout)
            except subprocess.TimeoutExpired:
                timed_out = True
                kill()
        finally:
            # A descendant could retain a pipe after the root exits. Kill the
            # entire Unix job before joining readers, including on normal exit.
            if process_group or process.poll() is None:
                kill()
            process.wait()
            for reader in started:
                reader.join()

    if timed_out:
        return failure(f"Код выполнялся дольше {limits.timeout:g} секунд. Проверьте, нет ли бесконечного цикла.")
    if exceeded.is_set():
        return failure("Превышен лимит размера результата или stderr проверки.")
    if read_failed.is_set():
        return failure("Не удалось прочитать результат проверки.")
    if process.returncode < 0:
        return failure("Программа завершена из-за ограничения ресурсов или сигнала операционной системы.")
    return subprocess.CompletedProcess(args, process.returncode, bytes(buffers["stdout"]), bytes(buffers["stderr"]))
