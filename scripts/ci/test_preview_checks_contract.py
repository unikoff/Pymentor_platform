import importlib.util
import io
import json
from email.message import Message
from pathlib import Path
import unittest
from unittest.mock import patch
from urllib.error import HTTPError

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = json.loads((ROOT / 'deploy/gitops/preview/checks.json').read_text(encoding='utf-8'))['data']['check.py']


class Response:
    def __init__(self, payload=None, headers=None, status=200):
        self.status = status
        self.headers = headers or Message()
        self.payload = json.dumps(payload or {}).encode()

    def read(self, limit):
        return self.payload[:limit]

    def __enter__(self):
        return self

    def __exit__(self, *args):
        pass


class ChecksContract(unittest.TestCase):
    def setUp(self):
        self.module = {'__name__': 'preview_check'}
        exec(compile(SCRIPT, 'check.py', 'exec'), self.module)
        self.calls = []
        self.fail_path = None
        self.bad_result = False

        def open_request(req, timeout):
            path = req.full_url.removeprefix('http://preview')
            data = json.loads(req.data) if req.data else None
            self.calls.append((path, data, req.get_header('Cookie'), timeout))
            if path == self.fail_path:
                raise HTTPError(req.full_url, 503, 'unavailable', Message(), io.BytesIO())
            if path == '/api/user/login':
                import uuid
                operation_id = req.get_header('Idempotency-key')
                self.assertEqual(str(uuid.UUID(operation_id)), operation_id)
                self.assertEqual(uuid.UUID(operation_id).version, 4)
                headers = Message()
                headers.add_header('Set-Cookie', 'session=secret-cookie; Secure; HttpOnly; Path=/')
                return Response(headers=headers)
            if path == '/api/learning/lessons':
                return Response({'lessons': [{'is_available': True, 'tasks': [{'id': 'lesson-fa2f4f9cd78e77a18fb1778e-task-01', 'revision': 'a' * 64}]}]})
            if path.endswith('/run'):
                marker = data['code'][7:-2]
                return Response({'ok': not self.bad_result, 'stdout': marker + '\n'})
            return Response()

        self.opener = patch.object(self.module['op'], 'open', side_effect=open_request)
        self.opener.start()
        self.addCleanup(self.opener.stop)

    def test_candidate_runs_with_secure_cookie_and_revision(self):
        self.module['candidate']('http://preview')
        self.assertEqual([c[0] for c in self.calls], ['/api/user/register', '/api/user/login', '/api/learning/lessons', '/api/learning/tasks/lesson-fa2f4f9cd78e77a18fb1778e-task-01/run'])
        self.assertEqual(self.calls[2][2], 'session=secret-cookie')
        self.assertEqual(self.calls[3][2], 'session=secret-cookie')
        self.assertEqual(self.calls[3][1]['task_revision'], 'a' * 64)
        self.assertEqual(self.calls[3][3], 20)

    def test_status_failures_are_safe_and_stop(self):
        for path in ('/api/user/register', '/api/user/login', '/api/learning/lessons', '/api/learning/tasks/lesson-fa2f4f9cd78e77a18fb1778e-task-01/run'):
            with self.subTest(path=path):
                self.calls.clear()
                self.fail_path = path
                with self.assertRaises(SystemExit) as error:
                    self.module['candidate']('http://preview')
                self.assertEqual(str(error.exception), 'Release check HTTP status mismatch')
                self.assertEqual(self.calls[-1][0], path)

    def test_bad_runner_result_fails(self):
        self.bad_result = True
        with self.assertRaisesRegex(SystemExit, 'runner result invalid'):
            self.module['candidate']('http://preview')

    def test_live_keeps_twenty_requests(self):
        with patch.dict('os.environ', {'CHECK_KIND': 'core-api', 'CHECK_TARGET': 'http://preview', 'CHECK_MODE': 'live'}), patch.object(self.module['time'], 'sleep'):
            self.module['main']()
        self.assertEqual(len(self.calls), 20)
        self.assertTrue(all(c[0] == '/health/ready' for c in self.calls))


if __name__ == '__main__':
    unittest.main()
