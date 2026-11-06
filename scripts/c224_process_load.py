"""Bounded synthetic load on an owner-verified c225 restore.

Set PYMENTOR_TEST_PG_URL and PYMENTOR_TEST_REDIS_URL in the environment.
Run with --run-id ID --opt-in --owner-verified. The owner must verify that the
restore contains synthetic data only. Accounts and sessions are retained.
Uses inherited POSIX sockets or Windows socket sharing; no resources are deleted.
Results describe local processes, not pods. Lab checks use read-only Docker inspect.
"""
from __future__ import annotations

import argparse
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import http.cookiejar
import json
import math
import os
import secrets
from pathlib import Path
import socket
import subprocess
import sys
import sysconfig
import time
from urllib.error import HTTPError, URLError
from urllib.request import HTTPCookieProcessor, ProxyHandler, Request, build_opener
from uuid import uuid4

import c224_api_probe as probe
import c225_local_pg_lab as lab

ROOT = Path(__file__).resolve().parent.parent
REPEATS, REQUESTS, CONCURRENCY = 3, 96, 8


def validate(run_id, opt_in, owner_verified, pg, redis):
    if not opt_in or not owner_verified:
        raise ValueError("Synthetic opt-in and owner verification are required")
    lab._names(run_id)
    probe.validate_urls(pg, redis)
    if os.name not in {"posix", "nt"}:
        raise ValueError("Socket sharing is unsupported on this operating system")


def child_environment(source, prefix):
    # A small allowlist prevents libpq redirects, dotenv, proxy, notification and
    # application settings from silently changing the intended target/behavior.
    env = {k: source[k] for k in ("PATH", "SYSTEMROOT", "WINDIR", "TEMP", "TMP") if k in source}
    pythonpath = str(ROOT / "backend")
    if os.name == "nt":
        # Bypass the Windows venv launcher so the owned PID is the actual server;
        # import the same isolated venv packages explicitly in that interpreter.
        pythonpath += os.pathsep + sysconfig.get_path("purelib")
    env.update(PYTHONPATH=pythonpath, PYTHONDONTWRITEBYTECODE="1",
               PYTHON_DOTENV_DISABLED="1", PYMENTOR_DUAL_LOCAL_TEST="1",
               PYMENTOR_LOCAL_NOTIFICATIONS="0", PYMENTOR_COOKIE_SECURE="0",
               PYMENTOR_TEST_PG_URL=source["PYMENTOR_TEST_PG_URL"],
               PYMENTOR_TEST_REDIS_URL=source["PYMENTOR_TEST_REDIS_URL"],
               PYMENTOR_TEST_LOGIN_RECOVERY_KEY=secrets.token_hex(32),
               PYMENTOR_TEST_REDIS_PREFIX=prefix)
    return env


def start_processes(count, env, processes):
    roots = []
    for _ in range(count):
        # Keep the port reserved across Popen, so another service cannot claim it.
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            if os.name == "nt":
                sock.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
            sock.bind(("127.0.0.1", 0))
            sock.listen(128)
            port, fd = sock.getsockname()[1], sock.fileno()
            if os.name == "nt":
                code = '''
import socket, sys, uvicorn, threading, time
from contextlib import asynccontextmanager
from dual_local import create_app
s = socket.fromshare(sys.stdin.buffer.read())
app = create_app()
from identity.async_sessions import AsyncIdentitySessions, IdentityUnavailable
original = AsyncIdentitySessions.authenticate
async def instrument(self, token):
    try:
        return await original(self, token)
    except IdentityUnavailable as error:
        cause = error.__cause__
        kind = type(cause).__name__
        if kind == 'ConnectionError' and 'Too many connections' in str(cause):
            kind = 'RedisPoolExhausted'
        print('C224_CAUSE:' + kind, file=sys.stderr, flush=True)
        raise
AsyncIdentitySessions.authenticate = instrument
metrics = {'sync': [], 'async': []}
metrics_lock = threading.Lock()
def watch_pool(pool, name):
    original_get = pool._do_get
    def measured_get():
        exhausted = pool.checkedout() >= pool.size() + pool._max_overflow
        started = time.perf_counter()
        failed = True
        try:
            value = original_get()
            failed = False
            return value
        finally:
            item = {'ms': (time.perf_counter()-started)*1000, 'exhausted': exhausted, 'failed': failed}
            with metrics_lock:
                metrics[name].append(item)
    pool._do_get = measured_get
original_lifespan = app.router.lifespan_context
@asynccontextmanager
async def measured_lifespan(application):
    async with original_lifespan(application):
        from db.engine import engine
        watch_pool(engine.pool, 'sync')
        watch_pool(application.state.local_async_identity.database.engine.sync_engine.pool, 'async')
        yield
app.router.lifespan_context = measured_lifespan
async def pool_metrics():
    with metrics_lock:
        result = {name: list(items) for name, items in metrics.items()}
        for items in metrics.values(): items.clear()
    return result
app.add_api_route('/__c224_pool_metrics', pool_metrics, methods=['GET'])
app.router.routes.insert(0, app.router.routes.pop())  # before the SPA catch-all
cfg = uvicorn.Config(app, log_level='critical', access_log=False)
uvicorn.Server(cfg).run(sockets=[s])
'''
                python = str(Path(sys.base_prefix) / "python.exe")
                child = subprocess.Popen([python, "-c", code], cwd=str(ROOT / "backend"),
                    env=env, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE,
                    creationflags=subprocess.CREATE_NO_WINDOW)
                processes.append(child)
                child.stdin.write(sock.share(child.pid))
                child.stdin.close()
            else:
                child = subprocess.Popen(
                    [sys.executable, "-m", "uvicorn", "dual_local:create_app", "--factory",
                     "--fd", str(fd), "--log-level", "critical", "--no-access-log"],
                    cwd=str(ROOT / "backend"), env=env, pass_fds=(fd,),
                    stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                processes.append(child)
            roots.append(f"http://127.0.0.1:{port}")
    return roots


def cleanup(processes):
    failed = False
    for child in processes:
        try:
            if child.poll() is None:
                child.terminate()
        except OSError:
            failed = True
    for child in processes:
        try:
            child.wait(timeout=5)
        except subprocess.TimeoutExpired:
            try:
                child.kill()
                child.wait(timeout=5)
            except (OSError, subprocess.TimeoutExpired):
                failed = True
        except OSError:
            failed = True
    if failed:
        raise RuntimeError("Could not confirm cleanup of every owned child")


def opener():
    return build_opener(ProxyHandler({}), HTTPCookieProcessor(http.cookiejar.CookieJar()))


def request(client, url, body=None, cookie=None):
    headers = {"Content-Type": "application/json"} if body is not None else {}
    if body is not None and url.endswith("/api/user/login"):
        headers["Idempotency-Key"] = str(uuid4())
    if cookie:
        headers["Cookie"] = cookie
    data = json.dumps(body).encode() if body is not None else None
    with client.open(Request(url, data=data, headers=headers), timeout=5) as response:
        return response.status


def wait_ready(children, roots):
    client = opener()
    for child, root in zip(children, roots):
        deadline = time.monotonic() + 20
        while True:
            if child.poll() is not None:
                raise RuntimeError("Child exited during startup")
            try:
                if request(client, root + "/health/ready") == 200:
                    break
            except (OSError, URLError, HTTPError):
                pass
            if time.monotonic() >= deadline:
                raise RuntimeError("Child readiness timed out")
            time.sleep(0.1)


def grant_synthetic_admin(pg_url, email):
    import psycopg
    from sqlalchemy.engine import make_url
    if not email.startswith('c224-') or not email.endswith('@example.test'):
        raise ValueError('Expected this run\'s synthetic account')
    url = make_url(pg_url)
    with psycopg.connect(host=url.host, hostaddr='127.0.0.1', port=url.port,
                         dbname=url.database, user=url.username, password=url.password,
                         connect_timeout=3) as connection:
        with connection.cursor() as cursor:
            cursor.execute('SELECT current_database(),current_user')
            if cursor.fetchone() != ('pymentor_test', url.username):
                raise RuntimeError('Unexpected disposable database identity')
            cursor.execute('UPDATE users SET is_admin=true WHERE email=%s AND username=%s',
                           (email, 'C224 synthetic'))
            if cursor.rowcount != 1:
                raise RuntimeError('Synthetic admin account not found uniquely')
        connection.commit()


def authenticate(root, email, password, register, admin_pg_url=None):
    jar = http.cookiejar.CookieJar()
    client = build_opener(ProxyHandler({}), HTTPCookieProcessor(jar))
    if register and request(client, root + "/api/user/register",
                            {"username": "C224 synthetic", "email": email, "password": password}) != 200:
        raise RuntimeError("Registration failed")
    if register and admin_pg_url:
        grant_synthetic_admin(admin_pg_url, email)
    if request(client, root + "/api/user/login", {"email": email, "password": password}) != 200:
        raise RuntimeError("Login failed")
    cookies = [c for c in jar if c.name == "session"]
    if len(cookies) != 1:
        raise RuntimeError("Login did not issue a session")
    return "session=" + cookies[0].value


def percentile(values, fraction):
    return sorted(values)[max(0, math.ceil(len(values) * fraction) - 1)] if values else None


def read_pool_metrics(roots):
    if os.name != 'nt':
        return None
    combined = {'sync': [], 'async': []}
    for root in roots:
        with opener().open(root + '/__c224_pool_metrics', timeout=5) as response:
            current = json.load(response)
        for name in combined:
            combined[name].extend(current[name])
    return combined


def summarize_pool_metrics(metrics):
    if metrics is None:
        return None
    result = {}
    for name, items in metrics.items():
        durations = [item['ms'] for item in items]
        exhausted = [item['ms'] for item in items if item['exhausted']]
        result[name] = {'acquisitions':len(items), 'failed':sum(item['failed'] for item in items),
                        'exhausted_at_start':len(exhausted), 'p50_ms':percentile(durations,.50),
                        'p95_ms':percentile(durations,.95), 'p99_ms':percentile(durations,.99),
                        'max_ms':max(durations,default=None), 'exhausted_max_ms':max(exhausted,default=None)}
    return result


def measure(roots, cookie, children=(), profile="identity"):
    routes = ([('/api/user/me', 'identity')] if profile == 'identity' else [
        ('/api/admin/users', 'admin_users'), ('/api/admin/overview', 'admin_overview'),
    ] if profile == 'admin' else [
        ('/api/user/me', 'identity'), ('/api/learning/catalog', 'catalog'),
        ('/api/user/activity?year=2026&month=11', 'calendar'),
        ('/api/user/slots?year=2026&month=11', 'booking_slots'),
    ])
    try:
        import psutil
        processes = [psutil.Process(child.pid) for child in children]
        cpu_before = sum(sum(proc.cpu_times()[:2]) for proc in processes)
        rss_before = sum(proc.memory_info().rss for proc in processes)
    except (ImportError, OSError):
        processes = []
    def one(index):
        path, label = routes[index % len(routes)]
        root_index = index % len(roots) if len(routes) == 1 else (index // len(routes)) % len(roots)
        started = time.perf_counter()
        try:
            status = request(opener(), roots[root_index] + path, cookie=cookie)
            outcome = "ok" if status == 200 else f"http_{status}"
        except HTTPError as exc:
            outcome = f"http_{exc.code}"
        except URLError as exc:
            outcome = f"network_{type(exc.reason).__name__}"
        except OSError as exc:
            outcome = f"network_{type(exc).__name__}"
        return label, (time.perf_counter() - started) * 1000, outcome

    read_pool_metrics(roots)
    started_at = datetime.now(timezone.utc).isoformat()
    started = time.perf_counter()
    with ThreadPoolExecutor(max_workers=CONCURRENCY) as pool:
        samples = list(pool.map(one, range(REQUESTS)))
    elapsed = time.perf_counter() - started
    pool_metrics = summarize_pool_metrics(read_pool_metrics(roots))
    latencies = [latency for _, latency, outcome in samples if outcome == "ok"]
    errors = Counter(outcome for _, _, outcome in samples if outcome != "ok")
    by_route = {}
    for _, label in routes:
        subset = [(latency, outcome) for name, latency, outcome in samples if name == label]
        successful = [latency for latency, outcome in subset if outcome == "ok"]
        by_route[label] = {"requests": len(subset), "errors": len(subset) - len(successful),
                           "p50_ms": percentile(successful, .50), "p95_ms": percentile(successful, .95),
                           "p99_ms": percentile(successful, .99)}
    result = {"requests": len(samples), "errors": len(samples) - len(latencies),
            "error_types": dict(errors),
            "p50_ms": percentile(latencies, .50), "p95_ms": percentile(latencies, .95),
            "p99_ms": percentile(latencies, .99), "throughput_rps": len(samples) / elapsed,
            "successful_rps": len(latencies) / elapsed, "elapsed_s": elapsed,
            "started_utc": started_at, "finished_utc": datetime.now(timezone.utc).isoformat(),
            "routes": by_route, "pool_acquisition": pool_metrics}
    if processes:
        try:
            cpu_after = sum(sum(proc.cpu_times()[:2]) for proc in processes)
            result["worker_cpu_core_pct"] = 100 * (cpu_after - cpu_before) / elapsed
            result["worker_rss_start_mib"] = rss_before / (1024 * 1024)
            result["worker_rss_end_mib"] = sum(proc.memory_info().rss for proc in processes) / (1024 * 1024)
        except OSError:
            result["worker_resources_unavailable"] = True
    return result


def run(env, profile="identity"):
    email = f"c224-{uuid4().hex}@example.test"
    password = uuid4().hex + uuid4().hex
    results = []
    for count in (1, 2):
        children = []
        try:
            roots = start_processes(count, env, children)
            wait_ready(children, roots)
            if profile == 'admin':
                cookie = authenticate(roots[0], email, password, register=count == 1,
                                      admin_pg_url=env['PYMENTOR_TEST_PG_URL'])
            else:
                cookie = authenticate(roots[0], email, password, register=count == 1)
            runs = [measure(roots, cookie, children, profile) for _ in range(REPEATS)]
            if any(child.poll() is not None for child in children):
                raise RuntimeError("Child exited during measurement")
            record = {"processes": count, "repetitions": runs}
            results.append(record)
        finally:
            cleanup(children)
        causes = Counter()
        for child in children:
            if child.stderr is not None:
                for line in child.stderr.read().decode("utf8", errors="replace").splitlines():
                    if line.startswith("C224_CAUSE:"):
                        causes[line.removeprefix("C224_CAUSE:")] += 1
                child.stderr.close()
        record["observed_auth_failure_causes"] = dict(causes)
    return {"unit": "local processes, not pods", "profile": {"method": "GET", "name": profile,
            "concurrency": CONCURRENCY, "requests_per_repeat": REQUESTS}, "results": results}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-id", required=True)
    parser.add_argument("--opt-in", action="store_true")
    parser.add_argument("--owner-verified", action="store_true")
    parser.add_argument("--profile", choices=("identity", "mixed", "admin"), default="identity")
    args = parser.parse_args(argv)
    try:
        validate(args.run_id, args.opt_in, args.owner_verified,
                 os.environ.get("PYMENTOR_TEST_PG_URL", ""), os.environ.get("PYMENTOR_TEST_REDIS_URL", ""))
        probe.verify_lab(lab, args.run_id)
        env = child_environment(os.environ, f"pymentor-c216-test:{uuid4().hex}:")
        print(json.dumps(run(env, args.profile)))
        return 0
    except Exception:
        print("Load stopped; check platform, lab identity, credentials and synthetic-only restore.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
