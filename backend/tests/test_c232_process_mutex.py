import importlib.util
from concurrent.futures import ThreadPoolExecutor
import os
from pathlib import Path
import subprocess
import sys
import threading
import types
from uuid import uuid4

import pytest

MODULE = Path(__file__).resolve().parents[2] / 'scripts' / 'c232_process_mutex.py'
spec = importlib.util.spec_from_file_location('c232_process_mutex_test', MODULE)
mutex = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = mutex
spec.loader.exec_module(mutex)


def run_id():
    return 'c232-' + uuid4().hex[:12]


@pytest.mark.parametrize('value', ['c232-ABCDEF123456', '../c232-012345abcdef', '', None])
def test_invalid_name_is_rejected(value):
    with pytest.raises(mutex.ProcessMutexError):
        with mutex.synthetic_lab_mutex(value):
            pytest.fail('mutex acquired')


def test_non_windows_fails_closed(monkeypatch):
    monkeypatch.setattr(mutex, 'os', types.SimpleNamespace(name='posix'))
    with pytest.raises(mutex.ProcessMutexError):
        with mutex.synthetic_lab_mutex(run_id()):
            pytest.fail('mutex acquired')


@pytest.mark.skipif(os.name != 'nt', reason='Windows mutex')
def test_body_exception_releases_mutex():
    name = run_id()
    with pytest.raises(ValueError, match='body error'):
        with mutex.synthetic_lab_mutex(name):
            raise ValueError('body error')
    with mutex.synthetic_lab_mutex(name):
        pass


@pytest.mark.skipif(os.name != 'nt', reason='Windows mutex')
@pytest.mark.parametrize('body_fails', [False, True])
def test_release_failure_blocks_same_and_other_threads(monkeypatch, body_fails):
    import ctypes

    real_windll = ctypes.WinDLL

    class FailedRelease:
        def __call__(self, handle):
            return False

    def broken_kernel(*args, **kwargs):
        kernel = real_windll(*args, **kwargs)
        kernel.ReleaseMutex = FailedRelease()
        return kernel

    monkeypatch.setattr(ctypes, 'WinDLL', broken_kernel)
    name = run_id()
    errors = []

    def attempt():
        try:
            with mutex.synthetic_lab_mutex(name):
                errors.append('unexpected acquisition')
        except mutex.ProcessMutexError as exc:
            errors.append(str(exc))

    def owner():
        if body_fails:
            with pytest.raises(ValueError, match='body error') as caught:
                with mutex.synthetic_lab_mutex(name):
                    raise ValueError('body error')
            assert any('cleanup failed' in note for note in caught.value.__notes__)
        else:
            with pytest.raises(mutex.ProcessMutexError, match='cleanup failed'):
                with mutex.synthetic_lab_mutex(name):
                    pass
        attempt()
        other = threading.Thread(target=attempt)
        other.start()
        other.join(timeout=10)
        assert not other.is_alive()

    with ThreadPoolExecutor(max_workers=1) as executor:
        executor.submit(owner).result(timeout=10)
    assert errors == ['synthetic mutex busy', 'synthetic mutex busy']


@pytest.mark.skipif(os.name != 'nt', reason='Windows mutex')
def test_owner_exit_without_retained_handle_does_not_report_abandoned():
    name = run_id()
    code = ("import sys, os, importlib.util\n"
            "s=importlib.util.spec_from_file_location('c232_mutex_child',sys.argv[2]); "
            "m=importlib.util.module_from_spec(s); sys.modules[s.name]=m; s.loader.exec_module(m)\n"
            "with m.synthetic_lab_mutex(sys.argv[1]): os._exit(0)\n")
    result = subprocess.run([sys.executable, '-c', code, name, str(MODULE)], capture_output=True,
                            check=False, timeout=10, creationflags=subprocess.CREATE_NO_WINDOW)
    assert result.returncode == 0
    with mutex.synthetic_lab_mutex(name) as state:
        assert state.abandoned is False


@pytest.mark.skipif(os.name != 'nt', reason='Windows mutex')
def test_same_process_and_second_process_are_excluded_then_can_acquire():
    name, other = run_id(), run_id()
    code = ("import sys, importlib.util\n"
            "s=importlib.util.spec_from_file_location('c232_mutex_child',sys.argv[2]); "
            "m=importlib.util.module_from_spec(s); sys.modules[s.name]=m; s.loader.exec_module(m)\n"
            "try:\n with m.synthetic_lab_mutex(sys.argv[1]): pass\n"
            "except m.ProcessMutexError: sys.exit(3)\n")

    def child(value):
        return subprocess.run([sys.executable, '-c', code, value, str(MODULE)], capture_output=True,
                              check=False, timeout=10, creationflags=subprocess.CREATE_NO_WINDOW).returncode

    with mutex.synthetic_lab_mutex(name):
        with pytest.raises(mutex.ProcessMutexError):
            with mutex.synthetic_lab_mutex(name):
                pytest.fail('nested mutex acquired')
        assert child(name) == 3
        assert child(other) == 0
    assert child(name) == 0


@pytest.mark.skipif(os.name != 'nt', reason='Windows mutex')
def test_abandoned_mutex_is_reported_after_owner_process_exits():
    import ctypes
    from ctypes import wintypes

    name = run_id()
    kernel = ctypes.WinDLL('kernel32', use_last_error=True)
    kernel.CreateMutexW.argtypes = [wintypes.LPVOID, wintypes.BOOL, wintypes.LPCWSTR]
    kernel.CreateMutexW.restype = wintypes.HANDLE
    kernel.CloseHandle.argtypes = [wintypes.HANDLE]
    kernel.CloseHandle.restype = wintypes.BOOL
    hold = kernel.CreateMutexW(None, False, 'Global\\pymentor-c232-' + name)
    assert hold
    code = ("import sys, os, importlib.util\n"
            "s=importlib.util.spec_from_file_location('c232_mutex_child',sys.argv[2]); "
            "m=importlib.util.module_from_spec(s); sys.modules[s.name]=m; s.loader.exec_module(m)\n"
            "with m.synthetic_lab_mutex(sys.argv[1]): os._exit(0)\n")
    try:
        result = subprocess.run([sys.executable, '-c', code, name, str(MODULE)], capture_output=True,
                                check=False, timeout=10, creationflags=subprocess.CREATE_NO_WINDOW)
        assert result.returncode == 0
        with mutex.synthetic_lab_mutex(name) as state:
            assert state.abandoned is True
    finally:
        assert kernel.CloseHandle(hold)
