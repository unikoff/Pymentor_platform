"""Windows named mutex for cooperating C232 synthetic lab processes.

The caller must verify private journal ACL, source and lab and reconcile state
after any interruption. This mutex does not protect against non-cooperating
clients. Acquire and release on the same OS thread. No filesystem is changed.
Abandoned status does not guarantee detection of failures; external state
reconciliation is always required.
"""
import contextlib
import ctypes
import os
import re
import sys
import threading
from types import SimpleNamespace


class ProcessMutexError(RuntimeError):
    """A mutex could not be safely acquired or released."""


_RUN_ID = re.compile(r'c232-[0-9a-f]{12}\Z', re.ASCII)
_registry = sys.modules.setdefault('_pymentor_c232_mutex_registry',
                                   SimpleNamespace(lock=threading.Lock(), held=set()))


@contextlib.contextmanager
def synthetic_lab_mutex(run_id):
    if os.name != 'nt' or type(run_id) is not str or not _RUN_ID.fullmatch(run_id):
        raise ProcessMutexError('synthetic mutex unavailable')
    name = 'Global\\pymentor-c232-' + run_id
    with _registry.lock:
        if name in _registry.held:
            raise ProcessMutexError('synthetic mutex busy')
        _registry.held.add(name)
    handle = None
    acquired = False
    kernel = None
    try:
        from ctypes import wintypes
        kernel = ctypes.WinDLL('kernel32', use_last_error=True)
        kernel.CreateMutexW.argtypes = [wintypes.LPVOID, wintypes.BOOL, wintypes.LPCWSTR]
        kernel.CreateMutexW.restype = wintypes.HANDLE
        kernel.WaitForSingleObject.argtypes = [wintypes.HANDLE, wintypes.DWORD]
        kernel.WaitForSingleObject.restype = wintypes.DWORD
        kernel.ReleaseMutex.argtypes = [wintypes.HANDLE]
        kernel.ReleaseMutex.restype = wintypes.BOOL
        kernel.CloseHandle.argtypes = [wintypes.HANDLE]
        kernel.CloseHandle.restype = wintypes.BOOL
        handle = kernel.CreateMutexW(None, False, name)
        if not handle:
            raise ProcessMutexError('synthetic mutex unavailable')
        result = kernel.WaitForSingleObject(handle, 0)
        if result not in (0, 0x80):  # WAIT_OBJECT_0 / WAIT_ABANDONED
            raise ProcessMutexError('synthetic mutex busy or unavailable')
        acquired = True
        yield SimpleNamespace(abandoned=(result == 0x80))
    finally:
        active_error = sys.exc_info()[1]
        cleanup_failed = False
        if handle and kernel is not None:
            if acquired and not kernel.ReleaseMutex(handle):
                cleanup_failed = True
            if not kernel.CloseHandle(handle):
                cleanup_failed = True
        if not cleanup_failed:
            with _registry.lock:
                _registry.held.discard(name)
        if cleanup_failed:
            if active_error is not None:
                active_error.add_note('synthetic mutex cleanup failed; state requires inspection')
            else:
                raise ProcessMutexError('synthetic mutex cleanup failed')
