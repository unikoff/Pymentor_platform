from pymentor_core.adapters.legacy_runner.python import run_python_code
from pymentor_core.adapters.legacy_runner.python import run_python_preview
from pymentor_core.adapters.legacy_runner.python import run_python_task
from pymentor_core.adapters.legacy_runner.executor import get_runner_executor


class LegacyRunner:
    run_python_code = staticmethod(run_python_code)
    run_python_preview = staticmethod(run_python_preview)
    run_python_task = staticmethod(run_python_task)
    get_runner_executor = staticmethod(get_runner_executor)
