"""Local candidate: one coordinator, one-shot pods; never adopt existing Jobs.

Age is measured from before Job creation, conservatively below both the
supervisor's 180s idle timeout and the Job's 240s active deadline. This is
not a distributed lock or a production deployment mechanism.
"""
import collections
import re
import subprocess
import json
import threading
import time
import uuid

from pool_manager import kubectl, manifest


class Pool:
    def __init__(self, supervisor, size=3, max_age=120, max_pending=None,
                 maintenance_interval=1):
        if not 1 <= size <= 3 or not 0 < max_age <= 120 or maintenance_interval <= 0:
            raise ValueError('invalid pool configuration')
        if max_pending is None:
            max_pending = size * 2
        if max_pending < 1:
            raise ValueError('max_pending must be positive')
        self.supervisor, self.size, self.max_age = supervisor, size, max_age
        self.interval = maintenance_interval
        self.condition = threading.Condition()
        self.ready = collections.deque()
        self.retiring = collections.deque()
        self.jobs, self.offered, self.used = set(), set(), set()
        self.failures, self.refills = collections.deque(maxlen=100), []
        self.uids_by_job = {}
        self.closed = False
        self.started = False
        self.active = 0
        self.admission = threading.BoundedSemaphore(max_pending)
        self.worker = None
        self.shutdown_lock = threading.Lock()
        self.inflight = set()
        self.unknown = set()
        self.delete_attempts = collections.Counter()
        self.create_failures = 0
        self.retry_limit = 3
        self.next_create = 0
        self.next_delete = {}

    def _record(self, exc):
        with self.condition:
            self.failures.append(type(exc).__name__ + ': ' + str(exc)[:200])

    def create(self, name, born):
        try:
            try:
                kubectl(['create', '-f', '-'], json.dumps(manifest(name, self.supervisor)).encode(), timeout=50)
            except Exception:
                # Even a failed client call may have been accepted by the API.
                with self.condition:
                    self.unknown.add(name)
                raise
            deadline = min(born + self.max_age, time.monotonic() + 60)
            pod = None
            while time.monotonic() < deadline:
                items = json.loads(kubectl(['get', 'pods', '-l', 'job-name='+name, '-o', 'json'], timeout=10))['items']
                if len(items) > 1:
                    raise RuntimeError('multiple pods for job')
                if items:
                    pod = items[0]
                    break
                time.sleep(.2)
            if pod is None:
                raise TimeoutError('pod was not created')
            meta = pod['metadata']
            podname, uid = meta['name'], meta['uid']
            if not any(r.get('kind') == 'Job' and r.get('name') == name and r.get('controller') for r in meta.get('ownerReferences', [])):
                raise RuntimeError('unexpected pod owner')
            kubectl(['wait', '--for=condition=Ready', 'pod/'+podname, '--timeout=45s'], timeout=50)
            guard_deadline = min(born + self.max_age, time.monotonic() + 10)
            while time.monotonic() < guard_deadline:
                if 'POOL_SUPERVISOR_READY' in kubectl(['logs', 'pod/'+podname], timeout=10):
                    break
                time.sleep(.1)
            else:
                raise RuntimeError('supervisor guard not ready')
            with self.condition:
                if self.closed or time.monotonic() - born >= self.max_age:
                    raise RuntimeError('pool closed or sandbox expired')
                if uid in self.offered:
                    raise RuntimeError('duplicate pod UID')
                self.offered.add(uid)
                self.uids_by_job[name] = uid
                self.ready.append((name, podname, uid, born))
                self.condition.notify_all()
        except Exception:
            with self.condition:
                self.retiring.append(name)
                self.condition.notify_all()
            raise

    def delete(self, name):
        kubectl(['delete', 'job', name, '--ignore-not-found=true', '--cascade=foreground', '--wait=true', '--timeout=45s'], timeout=50)
        with self.condition:
            # A timed-out create may still appear after a successful 404 delete.
            if name not in self.unknown:
                self.jobs.discard(name)
                uid = self.uids_by_job.pop(name, None)
                if uid is not None:
                    self.offered.discard(uid)
                    self.used.discard(uid)
                self.delete_attempts.pop(name, None)
                self.next_delete.pop(name, None)
            self.condition.notify_all()

    def _run_operation(self, action, name, born=None):
        try:
            if action == 'create':
                self.create(name, born)
                with self.condition:
                    self.create_failures = 0
            else:
                self.delete(name)
        except Exception as exc:
            self._record(exc)
            with self.condition:
                if action == 'create':
                    self.create_failures += 1
                    self.next_create = time.monotonic() + self.interval
                else:
                    self.delete_attempts[name] += 1
                    if self.delete_attempts[name] < self.retry_limit:
                        self.retiring.append(name)
                        self.next_delete[name] = time.monotonic() + self.interval
        finally:
            with self.condition:
                self.inflight.discard(name)
                self.condition.notify_all()

    def _maintain(self):
        while True:
            with self.condition:
                now = time.monotonic()
                # Completion order can differ from birth order.
                for item in list(self.ready):
                    if now - item[3] >= self.max_age:
                        self.ready.remove(item)
                        self.retiring.append(item[0])
                if self.closed:
                    while self.inflight:
                        self.condition.wait()
                    return
                actions = []
                for name in list(self.retiring):
                    if name not in self.inflight and now >= self.next_delete.get(name, 0):
                        self.retiring.remove(name)
                        self.inflight.add(name)
                        actions.append(('delete', name, None))
                while len(self.jobs) < self.size and self.create_failures < self.retry_limit and now >= self.next_create:
                    name = 'warm-' + uuid.uuid4().hex
                    self.jobs.add(name)  # reserve before dispatch
                    self.inflight.add(name)
                    actions.append(('create', name, time.monotonic()))
                if not actions:
                    self.condition.wait(self.interval)
                    continue
                for action, name, born in actions:
                    threading.Thread(target=self._run_operation, args=(action, name, born),
                                     name='pool-' + action).start()

    def start(self):
        with self.condition:
            if self.started or self.closed:
                raise RuntimeError('pool already started or closed')
            self.started = True
            self.worker = threading.Thread(target=self._maintain, name='pool-maintenance')
            self.worker.start()

    def recover_orphans(self):
        # Call only before start, in an exclusively owned lab namespace.
        import re
        with self.condition:
            if self.started or self.closed:
                raise RuntimeError('recovery requires a stopped pool')
        items = json.loads(kubectl(['get', 'jobs', '-l', 'app=pool-lab', '-o', 'json'], timeout=15))['items']
        names = [item['metadata']['name'] for item in items]
        if any(not re.fullmatch(r'warm-[a-f0-9]{32}', name) for name in names):
            raise RuntimeError('unexpected job in lab namespace')
        for name in names:
            kubectl(['delete', 'job', name, '--ignore-not-found=true', '--cascade=foreground', '--wait=true', '--timeout=45s'], timeout=50)
        return len(names)

    def execute(self, code, timeout=20, queue_timeout=60):
        if not self.admission.acquire(blocking=False):
            raise RuntimeError('pool request queue full')
        begin = time.monotonic()
        name = None
        registered = False
        try:
            with self.condition:
                if self.closed or not self.started:
                    raise RuntimeError('pool not running')
                self.active += 1
                registered = True
                deadline = begin + queue_timeout
                while True:
                    if self.closed:
                        raise RuntimeError('pool closed')
                    while self.ready:
                        item = self.ready.popleft()
                        name, pod, uid, born = item
                        if time.monotonic() - born >= self.max_age or uid in self.used:
                            self.retiring.append(name)
                            name = None
                            self.condition.notify_all()
                            continue
                        self.used.add(uid)  # claimed before any I/O; never reuse
                        break
                    if name is not None:
                        claimed = time.monotonic()
                        break
                    remaining = deadline - time.monotonic()
                    if remaining <= 0:
                        raise TimeoutError('no ready disposable sandbox')
                    self.condition.wait(remaining)
            payload = (json.dumps({'code': code}, ensure_ascii=True) + '\n').encode()
            # attach carries only the request; the result travels in exec's
            # separate stream after every untrusted child has been reaped.
            from pool_manager import KUBECTL
            attach = subprocess.Popen(KUBECTL + ['attach', '-i', 'pod/'+pod, '-c', 'run'],
                                      stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            try:
                attach.stdin.write(payload)
                attach.stdin.close()
                attach.stdin = None
                deadline = time.monotonic() + timeout
                endpoint = None
                while time.monotonic() < deadline:
                    logs = kubectl(['logs', 'pod/'+pod], timeout=5)
                    match = re.search(r'^POOL_RESULT_READY (pymentor-result-[0-9a-f]{48})$', logs, re.MULTILINE)
                    if match:
                        endpoint = match.group(1)
                        break
                    if attach.poll() is not None:
                        raise RuntimeError('sandbox attach ended before result channel')
                    time.sleep(.1)
                if endpoint is None:
                    raise TimeoutError('sandbox result channel not ready')
                live = json.loads(kubectl(['get', 'pod/'+pod, '-o', 'json'], timeout=5))
                if live['metadata']['uid'] != uid:
                    raise RuntimeError('sandbox identity changed')
                reader = ("import socket,sys; s=socket.socket(socket.AF_UNIX,socket.SOCK_STREAM); "
                          "s.settimeout(5); s.connect('\\0'+sys.argv[1]); "
                          "f=s.makefile('rb'); sys.stdout.buffer.write(f.read(250001))")
                out = kubectl(['exec', 'pod/'+pod, '-c', 'run', '--',
                               'python', '-I', '-c', reader, endpoint], timeout=8)
                attach_out, attach_err = attach.communicate(timeout=5)
                if attach.returncode != 0 or len(out.encode('utf-8')) > 250000:
                    raise RuntimeError('sandbox result transport failed')
                result = json.loads(out)
            finally:
                if attach.poll() is None:
                    attach.kill()
                attach.communicate(timeout=5)
            if type(result) is not dict or type(result.get('ok')) is not bool:
                raise ValueError('bad result')
            return {'result': result, 'uid': uid, 'latency': time.monotonic()-begin, 'queue': claimed-begin}
        finally:
            with self.condition:
                if name is not None:
                    self.retiring.append(name)
                if registered:
                    self.active -= 1
                self.condition.notify_all()
            self.admission.release()

    def shutdown(self):
        with self.shutdown_lock:
            self._shutdown()

    def _shutdown(self):
        with self.condition:
            self.closed = True
            self.condition.notify_all()
            while self.active:
                self.condition.wait()
        if self.worker is not None:
            self.worker.join()
        with self.condition:
            names = sorted(self.jobs)
            self.ready.clear()
            self.retiring.clear()
        failures = []
        for name in names:
            try:
                self.delete(name)
            except Exception as exc:
                self._record(exc)
                failures.append(name)
        with self.condition:
            unknown = sorted(self.unknown)
        if failures or unknown:
            raise RuntimeError('failed to delete owned jobs or unresolved create outcomes: ' +
                               ', '.join(sorted(set(failures + unknown))))
