"""Execution port; the adapter owns the unsafe legacy subprocess transport."""

from pymentor_core.shared.bindings import get_bindings
from pymentor_core.modules.practice.contracts import RunnerBusy
from pymentor_core.modules.practice.contracts import RunnerUnavailable


def run_python_code(*args, **kwargs):
    return get_bindings().runner.run_python_code(*args, **kwargs)


def run_python_preview(*args, **kwargs):
    return get_bindings().runner.run_python_preview(*args, **kwargs)


def run_python_task(*args, **kwargs):
    return get_bindings().runner.run_python_task(*args, **kwargs)


def get_runner_executor(*args, **kwargs):
    return get_bindings().runner.get_runner_executor(*args, **kwargs)
