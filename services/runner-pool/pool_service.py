"""Private preview broker for one-shot, prewarmed Kubernetes sandboxes."""
import json
import os
import signal
import subprocess
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import pool_manager
import pool_manager_parallel
from pool_manager_parallel import Pool

MAX_BODY = 40000
MAX_RESPONSE_FIELD = 12000
PATH = '/api/learning/interpreter/run'


def healthy_locked(pool):
    return (pool.started and not pool.closed and pool.worker is not None
            and pool.worker.is_alive() and not pool.unknown
            and pool.create_failures < pool.retry_limit
            and all(count < pool.retry_limit for count in pool.delete_attempts.values()))


def readiness_locked(pool, warmed_once):
    warmed = any(time.monotonic() - row[3] < pool.max_age for row in pool.ready)
    warmed_once = warmed_once or warmed
    return healthy_locked(pool) and warmed_once, warmed_once


def wait_for_exclusive_coordinator(pod_uid, timeout=90):
    """Do not touch orphan Jobs while a previous coordinator Pod still exists."""
    if not pod_uid:
        raise RuntimeError('coordinator Pod UID required')
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        result = subprocess.run(['/usr/local/bin/kubectl', '-n', 'pymentor', 'get', 'pods',
                                 '-l', 'app=preview-pool-broker', '-o', 'json'],
                                stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=10, check=True)
        pods = json.loads(result.stdout)['items']
        identities = [p['metadata']['uid'] for p in pods]
        if identities == [pod_uid]:
            return
        if pod_uid not in identities:
            raise RuntimeError('own coordinator Pod not found')
        time.sleep(1)
    raise TimeoutError('another coordinator Pod still exists')


class Server(ThreadingHTTPServer):
    daemon_threads = True
    request_queue_size = 16

    def __init__(self, address, pool):
        super().__init__(address, Handler)
        self.pool = pool
        self.workers = threading.BoundedSemaphore(18)
        self.warmed_once = False

    def process_request(self, request, client_address):
        if not self.workers.acquire(blocking=False):
            self.shutdown_request(request)
            return
        try:
            super().process_request(request, client_address)
        except BaseException:
            self.workers.release()
            raise

    def process_request_thread(self, request, client_address):
        try:
            super().process_request_thread(request, client_address)
        finally:
            self.workers.release()


class Handler(BaseHTTPRequestHandler):
    server_version = 'PreviewPool'

    def setup(self):
        super().setup()
        self.connection.settimeout(5)

    def log_message(self, *args):
        pass  # Never log user submissions or replies.

    def reply(self, status, value):
        raw = json.dumps(value, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(raw)))
        if status == 503:
            self.send_header('Retry-After', '2')
        self.end_headers()
        self.wfile.write(raw)

    def do_GET(self):
        if self.path == '/health/live':
            pool = self.server.pool
            with pool.condition:
                healthy = healthy_locked(pool)
            return self.reply(200 if healthy else 503, {'ok': healthy})
        if self.path == '/health/ready':
            pool = self.server.pool
            with pool.condition:
                ready, self.server.warmed_once = readiness_locked(pool, self.server.warmed_once)
            return self.reply(200 if ready else 503, {'ok': ready})
        self.reply(404, {'detail': 'Not Found'})

    def do_POST(self):
        if self.path != PATH:
            return self.reply(404, {'detail': 'Not Found'})
        try:
            length = int(self.headers.get('Content-Length', ''))
            if length <= 0 or length > MAX_BODY or self.headers.get('Transfer-Encoding'):
                raise ValueError()
            payload = json.loads(self.rfile.read(length))
            code = payload['code']
            if not isinstance(code, str) or not 1 <= len(code) <= 8000 or len(code.encode('utf-8')) > 32000:
                raise ValueError()
        except (ValueError, TypeError, KeyError, UnicodeError, TimeoutError):
            self.close_connection = True
            return self.reply(422, {'detail': 'Invalid request'})
        try:
            result = self.server.pool.execute(code, timeout=10, queue_timeout=20)['result']
            if (type(result) is not dict or type(result.get('ok')) is not bool or
                not isinstance(result.get('stdout'), str) or
                any(result.get(k) is not None and not isinstance(result.get(k), str)
                    for k in ('stderr', 'error', 'traceback')) or
                any(len(result.get(k) or '') > MAX_RESPONSE_FIELD
                    for k in ('stdout', 'stderr', 'error', 'traceback'))):
                raise ValueError('invalid sandbox response')
            return self.reply(200, {key: result.get(key) for key in
                                    ('ok', 'stdout', 'stderr', 'error', 'traceback')})
        except Exception as exc:
            # Only the error class, never the submission or process output.
            print('pool_request_failed type=' + type(exc).__name__, flush=True)
            return self.reply(503, {'detail': 'Интерпретатор временно недоступен. Повторите попытку позже.'})


def main():
    if os.environ.get('POOL_NAMESPACE') != 'runner-pool-lab-20261109':
        raise RuntimeError('unexpected pool namespace')
    pool_manager.KUBECTL = ['/usr/local/bin/kubectl', '-n', pool_manager.NAMESPACE]
    wait_for_exclusive_coordinator(os.environ.get('POD_UID'))
    original_manifest = pool_manager_parallel.manifest
    def restricted_manifest(name, supervisor):
        job = original_manifest(name, supervisor)
        job['spec']['template']['spec']['serviceAccountName'] = 'pool-sandbox'
        return job
    pool_manager_parallel.manifest = restricted_manifest
    supervisor = Path('/opt/preview-pool/pool_supervisor.py').read_text(encoding='utf-8')
    pool = Pool(supervisor, size=3, max_age=120, max_pending=15)
    pool.recover_orphans()  # Namespace is reserved to this one coordinator.
    pool.start()
    server = Server(('0.0.0.0', 8088), pool)
    def terminate(*_):
        threading.Thread(target=server.shutdown, daemon=True).start()
    signal.signal(signal.SIGTERM, terminate)
    signal.signal(signal.SIGINT, terminate)
    try:
        server.serve_forever(poll_interval=.2)
    finally:
        server.server_close()
        pool.shutdown()


if __name__ == '__main__':
    main()
