import json
import sys
import time
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import pool_manager
import pool_manager_parallel
import pool_service
import pool_supervisor


class ContractTests(unittest.TestCase):
    def test_request_validation_boundaries(self):
        parse = pool_supervisor.parse_request_line
        for code in ('x', 'x' * 8000, '😀' * 8000):
            self.assertEqual(parse(json.dumps({'code': code}).encode()), code)
        for raw in (b'{}', b'{', b'{"code": 4}', b'{"code": ""}',
                    json.dumps({'code': 'x' * 8001}).encode(), b'\xff'):
            with self.subTest(raw=raw[:20]), self.assertRaises(pool_supervisor.InvalidRequest):
                parse(raw)

    def test_manifest_is_one_shot_and_restricted(self):
        job = pool_manager.manifest('warm-test', 'supervisor')
        pod = job['spec']['template']['spec']
        container = pod['containers'][0]
        self.assertEqual(job['spec']['backoffLimit'], 0)
        self.assertEqual(pod['runtimeClassName'], 'gvisor')
        self.assertFalse(pod['automountServiceAccountToken'])
        self.assertEqual(pod['restartPolicy'], 'Never')
        self.assertTrue(container['securityContext']['readOnlyRootFilesystem'])
        self.assertFalse(container['securityContext']['allowPrivilegeEscalation'])
        self.assertEqual(container['securityContext']['capabilities']['drop'], ['ALL'])

    def test_recovery_rejects_unexpected_names_before_deletion(self):
        pool = pool_manager_parallel.Pool('supervisor')
        jobs = {'items': [{'metadata': {'name': 'warm-' + 'a' * 32}},
                          {'metadata': {'name': 'unrelated'}}]}
        with patch.object(pool_manager_parallel, 'kubectl', return_value=json.dumps(jobs)) as call:
            with self.assertRaises(RuntimeError):
                pool.recover_orphans()
            self.assertEqual(call.call_count, 1)

    def test_readiness_requires_warm_and_healthy_pool(self):
        pool = pool_manager_parallel.Pool('supervisor')
        class Worker:
            def is_alive(self):
                return True
        pool.started = True
        pool.worker = Worker()
        self.assertEqual(pool_service.readiness_locked(pool, False), (False, False))
        pool.ready.append(('job', 'pod', 'uid', time.monotonic()))
        self.assertEqual(pool_service.readiness_locked(pool, False), (True, True))
        pool.unknown.add('job')
        self.assertEqual(pool_service.readiness_locked(pool, True), (False, True))


if __name__ == '__main__':
    unittest.main()