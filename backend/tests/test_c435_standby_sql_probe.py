"""Offline guards for the standby probe; no database or container runtime."""
import asyncio
import importlib.util
from pathlib import Path
import sys
from types import SimpleNamespace
import unittest
from unittest.mock import AsyncMock, patch

SCRIPTS = Path(__file__).resolve().parents[2] / 'scripts'
sys.path.insert(0, str(SCRIPTS))
spec = importlib.util.spec_from_file_location('standby_probe_under_test', SCRIPTS / 'c435_standby_sql_probe.py')
probe = importlib.util.module_from_spec(spec)
spec.loader.exec_module(probe)


class GuardTests(unittest.TestCase):
    def test_acl_failure_stops_before_journal_and_resources(self):
        with patch.object(probe.target.lab, '_root', return_value=Path('synthetic-root')), \
             patch.object(probe.recovery, '_check_private_acl', return_value=False), \
             patch.object(probe.target.lab, '_load') as load, \
             patch.object(probe.target.lab, '_assert_container') as container:
            with self.assertRaises(probe.ProbeError):
                probe.check_lab('c232-123456789abc', probe.PHASE)
            load.assert_not_called()
            container.assert_not_called()

    def test_identity_or_other_clients_fail_closed(self):
        async def run():
            conn = SimpleNamespace(fetchrow=AsyncMock(return_value=('wrong', 'wrong', 5432)), fetchval=AsyncMock())
            with self.assertRaises(probe.ProbeError):
                await probe.identity_and_clients(conn)
            conn.fetchval.assert_not_awaited()
            conn.fetchrow.return_value = (probe.target.lab.DATABASE, probe.target.lab.ADMIN_ROLE, 5432)
            conn.fetchval.return_value = True
            with self.assertRaises(probe.ProbeError):
                await probe.identity_and_clients(conn)
        asyncio.run(run())

    def test_mutex_wraps_pending_pipeline_and_redacts_error(self):
        events = []
        class Mutex:
            def __enter__(self):
                events.append('enter')
            def __exit__(self, *args):
                events.append('exit')
        async def fail(run_id, connect):
            events.append('pipeline')
            raise RuntimeError('private SQL detail')
        fake_asyncpg = SimpleNamespace(connect=object())
        with patch.dict(sys.modules, {'asyncpg': fake_asyncpg}), \
             patch.object(probe, 'synthetic_lab_mutex', return_value=Mutex()), \
             patch.object(probe, '_probe', side_effect=fail):
            with self.assertRaises(probe.ProbeError) as error:
                asyncio.run(probe.probe('run'))
        self.assertEqual(events, ['enter', 'pipeline', 'exit'])
        self.assertEqual(str(error.exception), 'probe_failed')
        self.assertIsNone(error.exception.__cause__)

    def test_pending_failure_prevents_all_later_guards_and_connections(self):
        fake_modules = {
            'sqlalchemy': SimpleNamespace(),
            'sqlalchemy.engine': SimpleNamespace(URL=object()),
            'sqlalchemy.ext': SimpleNamespace(),
            'sqlalchemy.ext.asyncio': SimpleNamespace(create_async_engine=object()),
            'sqlalchemy.pool': SimpleNamespace(NullPool=object()),
        }
        connect = AsyncMock()
        with patch.dict(sys.modules, fake_modules), \
             patch.object(probe.pending, '_probe', new=AsyncMock(side_effect=RuntimeError('stop'))) as first, \
             patch.object(probe, 'check_lab') as guard:
            with self.assertRaises(RuntimeError):
                asyncio.run(probe._probe('run', connect))
            first.assert_awaited_once_with('run', connect)
            guard.assert_not_called()
            connect.assert_not_awaited()


if __name__ == '__main__':
    unittest.main()
