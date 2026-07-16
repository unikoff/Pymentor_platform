import ast
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any


MAX_CODE_LENGTH = 8_000
RUN_TIMEOUT_SECONDS = 3
BLOCKED_TOKENS = ("import ", "__import__", "__builtins__", "__globals__", "__subclasses__", "__mro__", "__class__", "__bases__", "__base__", "__getattribute__", "__dict__", "__code__", "__closure__", "__func__", "__self__", "open(", "eval(", "exec(", "compile(", "globals(", "locals(", "input(")
MISSING_SOLVE_ERROR_CODE = "PYMENTOR_MISSING_SOLVE"
MISSING_SOLVE_ERROR_MESSAGE = "Нужно объявить функцию solve."

_SAFE_BUILTINS_SOURCE = """{
    "abs": abs,
    "all": all,
    "any": any,
    "__build_class__": __build_class__,
    "bool": bool,
    "dict": dict,
    "enumerate": enumerate,
    "Exception": Exception,
    "float": float,
    "int": int,
    "len": len,
    "list": list,
    "max": max,
    "min": min,
    "print": print,
    "property": property,
    "range": range,
    "round": round,
    "set": set,
    "sorted": sorted,
    "str": str,
    "sum": sum,
    "tuple": tuple,
    "type": type,
    "ValueError": ValueError,
    "ZeroDivisionError": ZeroDivisionError,
    "zip": zip,
}"""


def _jsonable(value: Any) -> Any:
    try:
        json.dumps(value, ensure_ascii=False)
        return value
    except TypeError:
        return repr(value)


def _blocked_reason(code: str) -> str | None:
    lowered = code.lower()
    for token in BLOCKED_TOKENS:
        if token in lowered:
            return f"Запрещённая конструкция в коде: {token.strip()}"
    return None



def _requirements_error(code: str, requirements: Any) -> str | None:
    if not isinstance(requirements, dict):
        return None

    try:
        tree = ast.parse(code)
    except SyntaxError:
        return None

    node_labels = {
        "For": "цикл for",
        "While": "цикл while",
        "If": "ветвление if",
        "Try": "обработчик try / except",
        "ClassDef": "класс",
        "FunctionDef": "функция",
        "JoinedStr": "f-строка",
        "BoolOp": "логическое выражение",
    }
    node_types = {type(node).__name__ for node in ast.walk(tree)}
    loaded_names = {
        node.id
        for node in ast.walk(tree)
        if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Load)
    }
    called_names = {
        node.func.id
        for node in ast.walk(tree)
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name)
    }
    used_attributes = {
        node.attr
        for node in ast.walk(tree)
        if isinstance(node, ast.Attribute)
    }

    missing: list[str] = []
    for node_name in requirements.get("nodes", []):
        if node_name not in node_types:
            missing.append(node_labels.get(node_name, node_name))
    for name in requirements.get("names", []):
        if name not in loaded_names:
            missing.append(f"переменная {name}")
    for name in requirements.get("calls", []):
        if name not in called_names:
            missing.append(f"вызов {name}()")
    for name in requirements.get("attributes", []):
        if name not in used_attributes:
            missing.append(f"метод или свойство {name}")

    if not missing:
        return None

    return "В решении не хватает обязательного элемента: " + ", ".join(missing) + "."

def _normalize_compiler_message(message: Any) -> Any:
    if not isinstance(message, str):
        return message

    if MISSING_SOLVE_ERROR_CODE in message:
        return MISSING_SOLVE_ERROR_MESSAGE

    # Backward-compatible guard for already cached/encoded broken responses.
    if "solve" in message and ("\ufffd" in message or "РќСѓ" in message):
        return MISSING_SOLVE_ERROR_MESSAGE

    return message


def _normalize_runner_result(result: dict[str, Any]) -> dict[str, Any]:
    if "error" in result:
        result["error"] = _normalize_compiler_message(result.get("error"))

    if isinstance(result.get("traceback"), str):
        result["traceback"] = result["traceback"].replace(
            MISSING_SOLVE_ERROR_CODE,
            MISSING_SOLVE_ERROR_MESSAGE,
        )

    tests = result.get("tests")
    if isinstance(tests, list):
        for test in tests:
            if isinstance(test, dict) and "error" in test:
                test["error"] = _normalize_compiler_message(test.get("error"))

    return result


def _run_runner_source(source: str) -> dict[str, Any] | subprocess.CompletedProcess[bytes]:
    """Запускает runner-скрипт в изолированном процессе. Возвращает dict с ошибкой или процесс."""
    with tempfile.TemporaryDirectory(prefix="pymentor-run-") as temp_dir:
        runner_path = Path(temp_dir) / "runner.py"
        runner_path.write_text(source, encoding="utf-8")

        try:
            runner_env = os.environ.copy()
            runner_env["PYTHONIOENCODING"] = "utf-8"
            runner_env.pop("PYTHONPATH", None)

            # -X utf8 обязателен: -I игнорирует PYTHONIOENCODING, и на Windows
            # stdout ребёнка уходил в cp1251 → кракозябры в русских именах тестов.
            return subprocess.run(
                [sys.executable, "-I", "-X", "utf8", str(runner_path)],
                cwd=temp_dir,
                env=runner_env,
                capture_output=True,
                text=False,
                timeout=RUN_TIMEOUT_SECONDS,
                check=False,
            )
        except subprocess.TimeoutExpired:
            return {
                "ok": False,
                "score": 0,
                "error": (
                    f"Код выполнялся дольше {RUN_TIMEOUT_SECONDS} секунд. "
                    "Проверьте, нет ли бесконечного цикла."
                ),
                "tests": [],
                "stdout": "",
            }


def run_python_task(code: str, task: dict[str, Any]) -> dict[str, Any]:
    if len(code) > MAX_CODE_LENGTH:
        return {
            "ok": False,
            "score": 0,
            "error": f"Код слишком длинный. Лимит: {MAX_CODE_LENGTH} символов.",
            "tests": [],
            "stdout": "",
        }

    blocked_reason = _blocked_reason(code)
    if blocked_reason:
        return {"ok": False, "score": 0, "error": blocked_reason, "tests": [], "stdout": ""}

    requirements_error = _requirements_error(code, task.get("requirements"))
    if requirements_error:
        return {"ok": False, "score": 0, "error": requirements_error, "tests": [], "stdout": ""}

    process = _run_runner_source(_build_runner_source(code, task.get("tests", []), task.get("mode", "solve")))
    if isinstance(process, dict):
        return process

    if process.returncode != 0:
        stderr = _decode_output(process.stderr)
        return {
            "ok": False,
            "score": 0,
            "error": _describe_crash(stderr),
            "tests": [],
            "stdout": _decode_output(process.stdout),
            "stderr": stderr[-1200:],
        }

    stdout = _decode_output(process.stdout)
    stderr = _decode_output(process.stderr)

    try:
        result = json.loads(stdout)
    except json.JSONDecodeError:
        return {
            "ok": False,
            "score": 0,
            "error": "Runner вернул некорректный результат.",
            "tests": [],
            "stdout": stdout[-1200:],
            "stderr": stderr[-1200:],
        }

    return _normalize_runner_result(result)


def run_python_code(code: str, initial_namespace: dict[str, Any] | None = None) -> dict[str, Any]:
    """Просто выполняет код студента и возвращает stdout — без проверки тестами."""
    if len(code) > MAX_CODE_LENGTH:
        return {"ok": False, "error": f"Код слишком длинный. Лимит: {MAX_CODE_LENGTH} символов.", "stdout": ""}

    blocked_reason = _blocked_reason(code)
    if blocked_reason:
        return {"ok": False, "error": blocked_reason, "stdout": ""}

    process = _run_runner_source(_build_exec_source(code, initial_namespace))
    if isinstance(process, dict):
        return {"ok": False, "error": process["error"], "stdout": ""}

    stdout = _decode_output(process.stdout)
    stderr = _decode_output(process.stderr)

    if process.returncode != 0:
        return {"ok": False, "error": _describe_crash(stderr), "stdout": stdout[-1200:], "stderr": stderr[-1200:]}

    try:
        return json.loads(stdout)
    except json.JSONDecodeError:
        return {"ok": False, "error": "Runner вернул некорректный результат.", "stdout": stdout[-1200:]}


def run_python_preview(code: str, task: dict[str, Any]) -> dict[str, Any]:
    """Запуск одной демонстрационной проверки без сохранения результата урока."""
    if task.get("mode") == "script":
        tests = task.get("tests") or []
        namespace = tests[0].get("namespace") if tests else None
        return run_python_code(code, initial_namespace=namespace)

    tests = task.get("tests") or []
    if not tests:
        return run_python_code(code)

    preview_task = {**task, "tests": [tests[0]]}
    result = run_python_task(code, preview_task)
    if result.get("error"):
        return {"ok": False, "error": result["error"], "stdout": result.get("stdout", "")}

    test_result = (result.get("tests") or [{}])[0]
    if test_result.get("error"):
        return {"ok": False, "error": test_result["error"], "stdout": result.get("stdout", "")}

    stdout = result.get("stdout", "")
    if not stdout:
        actual = test_result.get("actual")
        if isinstance(actual, (dict, list, tuple)):
            stdout = json.dumps(actual, ensure_ascii=False)
        else:
            stdout = str(actual)
    return {"ok": True, "stdout": stdout}


def _describe_crash(stderr: str) -> str:
    """Достаёт из stderr последнюю строку с типом ошибки, чтобы студенту было понятно."""
    if MISSING_SOLVE_ERROR_CODE in stderr:
        return MISSING_SOLVE_ERROR_MESSAGE

    for line in reversed(stderr.strip().splitlines()):
        line = line.strip()
        if line and not line.startswith(("File ", "Traceback", "^")):
            return f"Ошибка запуска: {_normalize_compiler_message(line)}"
    return "Код завершился с ошибкой запуска."


def _build_exec_source(code: str, initial_namespace: dict[str, Any] | None = None) -> str:
    return f"""
import contextlib
import io
import json
import traceback

USER_CODE = {code!r}
INITIAL_NAMESPACE = {(initial_namespace or {})!r}

SAFE_BUILTINS = {_SAFE_BUILTINS_SOURCE}

stdout = io.StringIO()
namespace = {{"__builtins__": SAFE_BUILTINS, "__name__": "__student__"}}
namespace.update(INITIAL_NAMESPACE)

try:
    with contextlib.redirect_stdout(stdout):
        exec(USER_CODE, namespace)
    print(json.dumps({{
        "ok": True,
        "stdout": stdout.getvalue()[-2400:],
    }}, ensure_ascii=False))
except Exception as exc:
    print(json.dumps({{
        "ok": False,
        "error": f"{{type(exc).__name__}}: {{exc}}",
        "traceback": traceback.format_exc(limit=3),
        "stdout": stdout.getvalue()[-2400:],
    }}, ensure_ascii=False))
"""


def _build_runner_source(code: str, tests: list[dict[str, Any]], mode: str = "solve") -> str:
    return f"""
import contextlib
import io
import json
import traceback

USER_CODE = {code!r}
TESTS = {tests!r}
MODE = {mode!r}

SAFE_BUILTINS = {_SAFE_BUILTINS_SOURCE}


def jsonable(value):
    try:
        json.dumps(value, ensure_ascii=False)
        return value
    except TypeError:
        return repr(value)


def test_result(name, expected, actual, error=None):
    result = {{
        "name": name,
        "passed": actual == expected and error is None,
        "expected": jsonable(expected),
        "actual": jsonable(actual),
    }}
    if error is not None:
        result["error"] = error
    return result


stdout = io.StringIO()

try:
    if MODE == "script":
        results = []
        output_chunks = []
        for index, test in enumerate(TESTS, start=1):
            test_stdout = io.StringIO()
            namespace = {{"__builtins__": SAFE_BUILTINS, "__name__": "__student__"}}
            namespace.update(test.get("namespace", {{}}))
            try:
                with contextlib.redirect_stdout(test_stdout):
                    exec(USER_CODE, namespace)
                actual = test_stdout.getvalue().strip()
                output_chunks.append(test_stdout.getvalue())
                results.append(
                    test_result(
                        test.get("name") or f"test {{index}}",
                        test.get("expected", ""),
                        actual,
                    )
                )
            except Exception as exc:
                output_chunks.append(test_stdout.getvalue())
                results.append(
                    test_result(
                        test.get("name") or f"test {{index}}",
                        test.get("expected"),
                        None,
                        f"{{type(exc).__name__}}: {{exc}}",
                    )
                )

        passed_count = sum(1 for item in results if item["passed"])
        score = 100 if not results else round((passed_count / len(results)) * 100)
        print(json.dumps({{
            "ok": passed_count == len(results),
            "score": score,
            "tests": results,
            "stdout": "".join(output_chunks)[-1200:],
        }}, ensure_ascii=False))
    else:
        namespace = {{"__builtins__": SAFE_BUILTINS, "__name__": "__student__"}}
        with contextlib.redirect_stdout(stdout):
            exec(USER_CODE, namespace)

        solve = namespace.get("solve")
        if not callable(solve):
            raise AssertionError("PYMENTOR_MISSING_SOLVE")

        if not TESTS:
            with contextlib.redirect_stdout(stdout):
                solve()
            print(json.dumps({{
                "ok": True,
                "score": 100,
                "tests": [],
                "stdout": stdout.getvalue()[-1200:],
            }}, ensure_ascii=False))
        else:
            results = []
            for index, test in enumerate(TESTS, start=1):
                try:
                    with contextlib.redirect_stdout(stdout):
                        stdout.seek(0)
                        stdout.truncate(0)
                        actual = solve(*test.get("args", []), **test.get("kwargs", {{}}))
                        printed = stdout.getvalue()
                    expected = test["expected"]
                    actual_value = printed.strip() if test.get("assert") == "stdout" else actual
                    results.append(test_result(test.get("name") or f"test {{index}}", expected, actual_value))
                except Exception as exc:
                    results.append(
                        test_result(
                            test.get("name") or f"test {{index}}",
                            test.get("expected"),
                            None,
                            str(exc),
                        )
                    )

            passed_count = sum(1 for item in results if item["passed"])
            score = round((passed_count / len(results)) * 100)
            print(json.dumps({{
                "ok": passed_count == len(results),
                "score": score,
                "tests": results,
                "stdout": stdout.getvalue()[-1200:],
            }}, ensure_ascii=False))
except Exception as exc:
    print(json.dumps({{
        "ok": False,
        "score": 0,
        "error": str(exc),
        "traceback": traceback.format_exc(limit=3),
        "tests": [],
        "stdout": stdout.getvalue()[-1200:],
    }}, ensure_ascii=False))
"""


def _decode_output(value: bytes | None) -> str:
    if not value:
        return ""
    return value.decode("utf-8", errors="replace")
