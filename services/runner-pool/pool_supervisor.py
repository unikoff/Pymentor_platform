"""One-shot PID 1 supervisor for an already-started gVisor container."""
import ctypes
import errno
import json
import os
import selectors
import secrets
import socket
import signal
import subprocess
import sys
import time

OUTPUT_LIMIT = 12000  # bytes per stream
PROCESS_LIMIT = 16    # includes this supervisor
TIMEOUT = 3
INPUT_TIMEOUT = 5
MAX_REQUEST_BYTES = 40000  # JSON line, including its newline
MAX_CODE_CHARS = 8000
MAX_CODE_BYTES = 32000
READY_MARKER = 'POOL_SUPERVISOR_READY'
REJECTED_MARKER = 'POOL_SUPERVISOR_INPUT_REJECTED'

PROC_FD_PROBE = r'''import errno, os, sys
for path in ('/proc/1/fd/1', '/proc/1/fd/2',
             '/proc/1/task/1/fd/1', '/proc/1/task/1/fd/2'):
    for mode in (os.O_RDONLY, os.O_WRONLY):
        try:
            fd = os.open(path, mode | os.O_NONBLOCK)
        except OSError as exc:
            if exc.errno not in (errno.EACCES, errno.EPERM): sys.exit(2)
        else:
            os.close(fd)
            sys.exit(1)
sys.exit(0)
'''


class InvalidRequest(ValueError):
    """Request failure with a payload-independent public message."""


def require_proc_fd_guard():
    """Deny execution unless an exec'd child cannot open supervisor stdio via procfs."""
    if os.getuid() == 0 or os.getpid() != 1:
        raise RuntimeError('requires non-root PID 1 in a private PID namespace')
    try:
        prctl = ctypes.CDLL(None, use_errno=True).prctl
        prctl.argtypes = [ctypes.c_int, ctypes.c_ulong, ctypes.c_ulong,
                          ctypes.c_ulong, ctypes.c_ulong]
        prctl.restype = ctypes.c_int
        # PR_SET_DUMPABLE=4, PR_GET_DUMPABLE=3. Both calls must be supported.
        if prctl(4, 0, 0, 0, 0) != 0 or prctl(3, 0, 0, 0, 0) != 0:
            raise RuntimeError('cannot disable supervisor dumpability')
        # This child has no request data and never executes user code.
        result = subprocess.run([sys.executable, '-I', '-c', PROC_FD_PROBE],
                                stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL,
                                stderr=subprocess.DEVNULL, close_fds=True,
                                start_new_session=True, timeout=3,
                                env={'PYTHONIOENCODING':'utf-8','PATH':'/usr/local/bin:/usr/bin:/bin'})
        if result.returncode != 0:
            raise RuntimeError('supervisor proc fd protection not verified')
    except (AttributeError, OSError, subprocess.TimeoutExpired) as exc:
        raise RuntimeError('supervisor proc fd protection unavailable') from exc


def require_process_limit():
    # The supervisor keeps the real limit of 16. The child uses a lower limit
    # only to verify that gVisor enforces RLIMIT_NPROC before user code starts.
    if os.getuid() == 0 or os.getpid() != 1:
        raise RuntimeError('requires non-root PID 1 in a private PID namespace')
    import resource

    resource.setrlimit(resource.RLIMIT_NPROC, (PROCESS_LIMIT, PROCESS_LIMIT))
    if resource.getrlimit(resource.RLIMIT_NPROC) != (PROCESS_LIMIT, PROCESS_LIMIT):
        raise RuntimeError('process limit not installed')
    pid = os.fork()
    if pid == 0:
        try:
            resource.setrlimit(resource.RLIMIT_NPROC, (2, 2))
            try:
                grandchild = os.fork()
            except OSError as exc:
                os._exit(0 if exc.errno == errno.EAGAIN else 1)
            if grandchild == 0:
                os._exit(0)
            os.waitpid(grandchild, 0)
        except BaseException:
            pass
        os._exit(1)
    deadline = time.monotonic() + 3
    while True:
        waited, status = os.waitpid(pid, os.WNOHANG)
        if waited == pid:
            if not os.WIFEXITED(status) or os.WEXITSTATUS(status) != 0:
                raise RuntimeError('process limit not demonstrably enforced')
            break
        if time.monotonic() >= deadline:
            os.kill(pid, signal.SIGKILL)
            os.waitpid(pid, 0)
            raise RuntimeError('process limit probe timed out')
        time.sleep(.01)
    if resource.getrlimit(resource.RLIMIT_NPROC) != (PROCESS_LIMIT, PROCESS_LIMIT):
        raise RuntimeError('supervisor process limit changed')


def parse_request_line(line):
    """Validate a single UTF-8 JSON object using the broker's code limits."""
    try:
        request = json.loads(line.decode('utf-8'))
        code = request['code']
        if not isinstance(code, str) or not 1 <= len(code) <= MAX_CODE_CHARS:
            raise InvalidRequest()
        if len(code.encode('utf-8')) > MAX_CODE_BYTES:
            raise InvalidRequest()
        return code
    except (UnicodeError, ValueError, TypeError, KeyError, RecursionError):
        raise InvalidRequest() from None


def read_code_line(fd=0, timeout=INPUT_TIMEOUT, max_bytes=MAX_REQUEST_BYTES):
    """Read one bounded newline-terminated JSON record without buffering ahead."""
    selector = selectors.DefaultSelector()
    received = bytearray()
    deadline = time.monotonic() + 180
    first_byte = True
    try:
        selector.register(fd, selectors.EVENT_READ)
        while True:
            remaining = deadline - time.monotonic()
            if remaining <= 0 or not selector.select(remaining):
                raise InvalidRequest()
            capacity = max_bytes + 1 - len(received)
            chunk = os.read(fd, min(4096, max(1, capacity)))
            if not chunk:
                raise InvalidRequest()
            if first_byte:
                first_byte = False
                deadline = time.monotonic() + timeout
            received.extend(chunk)
            newline = received.find(b'\n')
            if newline >= 0:
                if newline + 1 != len(received) or newline + 1 > max_bytes:
                    raise InvalidRequest()
                return parse_request_line(bytes(received[:newline]))
            if len(received) >= max_bytes:
                raise InvalidRequest()
    finally:
        selector.close()


def capture(process, timeout=TIMEOUT, limit=OUTPUT_LIMIT):
    """Read both pipes incrementally; stop immediately once either exceeds limit."""
    streams = {process.stdout: bytearray(), process.stderr: bytearray()}
    selector = selectors.DefaultSelector()
    deadline = time.monotonic() + timeout
    reason = None
    try:
        for stream in streams:
            selector.register(stream, selectors.EVENT_READ)
        while selector.get_map():
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                reason = 'Превышено время выполнения'
                break
            for key, _ in selector.select(remaining):
                chunk = os.read(key.fd, 4096)
                if not chunk:
                    selector.unregister(key.fileobj)
                    continue
                target = streams[key.fileobj]
                remaining_capacity = max(0, limit - len(target))
                target.extend(chunk[:remaining_capacity])
                if len(chunk) > remaining_capacity:
                    reason = 'Превышен лимит вывода'
                    break
            if reason: break
        if reason is None:
            try: process.wait(timeout=max(0, deadline-time.monotonic()))
            except subprocess.TimeoutExpired: reason = 'Превышено время выполнения'
    finally:
        selector.close()
    return bytes(streams[process.stdout]), bytes(streams[process.stderr]), reason


def kill_descendants(process):
    """Kill every process in this private PID namespace and reap adopted children."""
    try:
        os.kill(-1, signal.SIGKILL)
    except ProcessLookupError:
        pass
    try:
        process.wait(timeout=1)
    except subprocess.TimeoutExpired:
        process.kill()
        process.wait()

    # PID 1 adopts orphaned descendants. Repeatedly signal while waiting for
    # any still-running child, then reap every child before producing a result.
    while True:
        try:
            child_pid, _ = os.waitpid(-1, getattr(os, 'WNOHANG', 1))
        except ChildProcessError:
            return
        if child_pid == 0:
            try:
                os.kill(-1, signal.SIGKILL)
            except ProcessLookupError:
                pass
            time.sleep(.01)


def result_object(stdout=b'', stderr=b'', reason=None, returncode=1):
    stdout_text = stdout.decode('utf-8', 'replace')
    stderr_text = stderr.decode('utf-8', 'replace') or None
    ok = reason is None and returncode == 0
    return {'ok':ok, 'stdout':stdout_text, 'stderr':stderr_text,
            'error':reason or (None if ok else 'Ошибка выполнения'),
            'traceback':stderr_text}


def run_user_code(code):
    """Run validated code with the existing bounded process and capture contract."""
    process = None
    stdout = stderr = b''
    reason = None
    try:
        process = subprocess.Popen([sys.executable, '-I', '-c', code],
                                   stdin=subprocess.DEVNULL, stdout=subprocess.PIPE,
                                   stderr=subprocess.PIPE, start_new_session=True,
                                   env={'PYTHONIOENCODING':'utf-8',
                                        'PATH':'/usr/local/bin:/usr/bin:/bin'})
        stdout, stderr, reason = capture(process)
    except (OSError, subprocess.SubprocessError):
        reason = 'Ошибка выполнения'
    finally:
        if process is not None:
            try:
                kill_descendants(process)
            finally:
                for stream in (process.stdout, process.stderr):
                    if stream is not None:
                        stream.close()
    return result_object(stdout, stderr, reason,
                         process.returncode if process is not None else 1)


def main():
    # These protections must succeed before READY or request bytes are exposed.
    require_proc_fd_guard()
    require_process_limit()
    sys.stderr.write(READY_MARKER + '\n')
    sys.stderr.flush()

    try:
        code = read_code_line()
    except InvalidRequest:
        sys.stderr.write(REJECTED_MARKER + '\n')
        sys.stderr.flush()
        return 2

    result = run_user_code(code)
    # All untrusted descendants were killed and reaped by run_user_code.
    # Publish only an unguessable endpoint name, never the result, to CRI logs.
    address = 'pymentor-result-' + secrets.token_hex(24)
    with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as listener:
        listener.settimeout(15)
        listener.bind('\0' + address)
        listener.listen(1)
        sys.stderr.write('POOL_RESULT_READY ' + address + '\n')
        sys.stderr.flush()
        conn, _ = listener.accept()
        with conn:
            conn.settimeout(5)
            conn.sendall(json.dumps(result, ensure_ascii=False, separators=(',', ':')).encode('utf-8'))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())