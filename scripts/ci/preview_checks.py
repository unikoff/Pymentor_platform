"""Run isolated, fail-closed preview profile smoke checks in fresh processes."""
import os
from pathlib import Path
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[2]
PG = 'postgresql+asyncpg://pymentor_test:pymentor_test@127.0.0.1:57152/pymentor_test'
REDIS = 'redis://127.0.0.1:57146/0'


def run(command, env):
    subprocess.run(command, cwd=ROOT, env=env, check=True, timeout=180)



def updater_tests():
    """Exercise release updates and rejection paths using disposable JSON fixtures."""
    import importlib.util
    import json

    spec = importlib.util.spec_from_file_location('preview_updater', ROOT / 'scripts/ci/update_preview_release.py')
    updater = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(updater)
    sha = 'a' * 40
    digests = tuple('sha256:' + char * 64 for char in '123')
    with tempfile.TemporaryDirectory(prefix='preview-updater-test-') as temp:
        directory = Path(temp)
        def write(name, value):
            (directory / name).write_text(json.dumps(value), encoding='utf-8')
        def read(name):
            return json.loads((directory / name).read_text(encoding='utf-8'))
        def workload(kind):
            return {'kind': kind, 'spec': {'template': {'spec': {'containers': [
                {'name': 'app', 'env': [{'name': 'PYMENTOR_RELEASE_REVISION', 'value': 'old'}]}
            ]}}}}
        base = {'kind': 'Kustomization', 'resources': ['applications.json', 'runner.json', 'notifications.json'], 'images': []}
        write('kustomization.yaml', base)
        write('applications.json', {'kind': 'List', 'items': [workload('Rollout')]})
        write('runner.json', workload('Deployment'))
        def rejected(*args):
            try:
                updater.update(directory, *args)
            except ValueError:
                return
            raise AssertionError('invalid release accepted')
        rejected(sha, 'sha256:bad', digests[1], digests[2])
        rejected('../bad', *digests)
        assert read('kustomization.yaml') == base and not (directory / 'release.json').exists()
        invalid = dict(base, resources=['applications.json', '../other.json'])
        write('kustomization.yaml', invalid)
        rejected(sha, *digests)
        assert read('kustomization.yaml') == invalid and not (directory / 'release.json').exists()
        write('kustomization.yaml', dict(base, images=[{'name': 'unapproved/image'}]))
        rejected(sha, *digests)
        write('kustomization.yaml', base)
        updater.update(directory, sha, *digests)
        mappings = read('kustomization.yaml')['images']
        assert [(entry['name'], entry['newName'], entry['digest']) for entry in mappings] == [
            (name, target, digest) for (name, target), digest in zip(updater.IMAGES.items(), digests)]
        for filename in ('applications.json', 'runner.json'):
            document = read(filename)
            workload_item = document['items'][0] if document['kind'] == 'List' else document
            template = workload_item['spec']['template']
            assert template['metadata']['annotations']['pymentor.io/source-revision'] == sha
            assert template['spec']['containers'][0]['env'][0]['value'] == sha
        assert read('release.json') == dict(source_sha=sha, core_digest=digests[0], frontend_digest=digests[1], runner_digest=digests[2])
        updater.update(directory, sha, *digests)
        assert len(read('runner.json')['spec']['template']['spec']['containers'][0]['env']) == 1
    print('Preview updater fixture tests passed', flush=True)

def main():
    updater_tests()
    run([sys.executable, "-B", "-m", "unittest", "scripts.ci.test_preview_checks_contract", "-v"], os.environ.copy())
    env = os.environ.copy()
    env.update(PYTHONPATH=os.pathsep.join((str(ROOT / 'services/core-api'), str(ROOT / 'backend'))),
               PYTHON_DOTENV_DISABLED='1', PYTHONDONTWRITEBYTECODE='1',
               PYMENTOR_LOCAL_NOTIFICATIONS='0', PYMENTOR_REQUIRE_DATABASE_URL='1')
    for key in ('PYMENTOR_DUAL_LOCAL_TEST', 'PYMENTOR_TEST_PG_URL', 'PYMENTOR_TEST_REDIS_URL'):
        env.pop(key, None)
    # Only the migration tool's hard-coded disposable endpoint can be used.
    env['PYMENTOR_MIGRATION_URL'] = PG
    run([sys.executable, '-m', 'alembic', '-c', 'services/core-api/alembic.ini', 'upgrade', 'head'], env)
    with tempfile.TemporaryDirectory(prefix='pymentor-preview-ci-') as temp:
        legacy = dict(env, PYMENTOR_PROFILE='legacy_sqlite',
                      DATABASE_URL='sqlite:///' + (Path(temp) / 'smoke.sqlite3').as_posix())
        postgres = dict(env, PYMENTOR_PROFILE='postgres_redis', DATABASE_URL=PG,
                        REDIS_URL=REDIS, PYMENTOR_REDIS_PREFIX='preview-ci:',
                        PYMENTOR_LOGIN_RECOVERY_KEY='42' * 32)
        code = '''from fastapi.testclient import TestClient
from pymentor_core.app.factory import create_app
with TestClient(create_app()) as client:
    for path in ("/health/live", "/health/ready", "/api/learning/tracks"):
        response = client.get(path)
        assert response.status_code == 200, (path, response.status_code, response.text[:500])
'''
        for profile in (legacy, postgres):
            print('Checking', profile['PYMENTOR_PROFILE'], flush=True)
            run([sys.executable, '-c', code], profile)
    test_env = dict(env, PYMENTOR_PROFILE='legacy_sqlite', DATABASE_URL='sqlite:///:memory:')
    run([sys.executable, '-m', 'pytest', '-q', '-p', 'no:cacheprovider',
         'services/core-api/tests/test_settings.py',
         'services/core-api/tests/test_runtime_policy.py',
         'services/core-api/tests/test_release.py'], test_env)
    email_env = dict(env, PYMENTOR_TEST_PG_URL=PG, PYMENTOR_TEST_REDIS_URL=REDIS)
    run([sys.executable, '-m', 'pytest', '-q', '-p', 'no:cacheprovider',
         'services/core-api/tests/integration/test_email_postgres_redis.py'], email_env)
    run([sys.executable, '-B', '-m', 'unittest', 'discover', '-s', 'services/runner-pool/tests', '-v'], test_env)


if __name__ == '__main__':
    if sys.argv[1:] == ['--updater-tests-only']:
        updater_tests()
    else:
        main()
