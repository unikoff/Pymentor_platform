import asyncio
from datetime import datetime
from datetime import timedelta
from datetime import timezone
import importlib.util
from pathlib import Path
import sys
from types import SimpleNamespace
from uuid import uuid4

import pytest


SCRIPT = (Path(__file__).resolve().parents[4] / 'services/core-api/tools/migration/c232_dry_run.py')
spec = importlib.util.spec_from_file_location('c232_dry_run_test', SCRIPT)
dry = importlib.util.module_from_spec(spec)
spec.loader.exec_module(dry)
NOW = datetime(2026, 1, 2, tzinfo=timezone.utc)
RUN_ID = 'c232-123456789abc'


def rows():
    return {'booking_notification_outbox': [{'status': 'sent'}, {'status': 'pending'}],
            'landing_notification_outbox': [{'status': 'failed'}],
            'sessions': [{'user_id': 1, 'session_token': str(uuid4()),
                          'created_at': (NOW - timedelta(days=1)).isoformat()}]}


def test_classifies_outbox_and_sessions_without_mutation():
    source = rows()
    before = repr(source)
    assert dry.audit_source(source, NOW) == ({'sent_records': 1, 'requires_review': 2}, 1)
    assert repr(source) == before


@pytest.mark.parametrize('created', [None, '2026-01-01T00:00:00',
                                     '2025-01-01T00:00:00+00:00',
                                     '2026-01-03T00:00:00+00:00'])
def test_session_time_fails_closed(created):
    source = rows()
    source['sessions'][0]['created_at'] = created
    with pytest.raises(dry.DryRunError, match='^sessions_incompatible$'):
        dry.audit_source(source, NOW)


def test_session_ttl_boundary_and_invalid_reference():
    source = rows()
    source['sessions'][0]['created_at'] = (NOW - timedelta(days=30)).isoformat()
    with pytest.raises(dry.DryRunError, match='^sessions_incompatible$'):
        dry.audit_source(source, NOW)
    source['sessions'][0]['created_at'] = (NOW - timedelta(days=30) + timedelta(microseconds=1)).isoformat()
    assert dry.audit_source(source, NOW)[1] == 1
    with pytest.raises(dry.DryRunError, match='^sessions_incompatible$'):
        dry.audit_source(source, NOW.replace(tzinfo=None))


def test_session_limit_is_per_user_and_duplicate_tokens_rejected():
    source = rows()
    template = source['sessions'][0]
    source['sessions'] = [dict(template, session_token=str(uuid4())) for _ in range(4)]
    with pytest.raises(dry.DryRunError, match='^sessions_incompatible$'):
        dry.audit_source(source, NOW)
    source['sessions'][-1]['user_id'] = 2
    assert dry.audit_source(source, NOW)[1] == 4
    source['sessions'][-1]['session_token'] = source['sessions'][0]['session_token']
    with pytest.raises(dry.DryRunError, match='^sessions_incompatible$'):
        dry.audit_source(source, NOW)


def test_unknown_outbox_status_redacted():
    source = rows()
    source['booking_notification_outbox'][0]['status'] = 'sensitive-value'
    with pytest.raises(dry.DryRunError, match='^outbox_invalid$') as exc:
        dry.audit_source(source, NOW)
    assert exc.value.__suppress_context__


def test_acl_before_journal_read(monkeypatch):
    calls = []
    monkeypatch.setattr(dry.target_guard.lab, '_root', lambda: Path('private'))
    monkeypatch.setattr(dry.recovery_guard, '_check_private_acl', lambda path: calls.append('acl') or False)
    monkeypatch.setattr(dry.target_guard, '_check_lab', lambda run: calls.append('journal'))
    with pytest.raises(dry.DryRunError, match='^journal_acl_unverified$'):
        asyncio.run(dry.inspect_target(RUN_ID))
    assert calls == ['acl']


def test_target_uses_readonly_transactions_and_sql_clock(monkeypatch):
    calls = []
    class Transaction:
        async def __aenter__(self): return self
        async def __aexit__(self, *args): pass
    class Connection:
        def transaction(self, **kwargs):
            calls.append(('transaction', kwargs))
            return Transaction()
        async def fetchval(self, sql):
            calls.append(('sql', sql))
            return NOW
        async def close(self): calls.append(('close',))
    async def connect(**kwargs):
        calls.append(('connect', kwargs['server_settings'], kwargs['command_timeout']))
        return Connection()
    async def guard(connection):
        calls.append(('guard',))
        return SimpleNamespace(table_count=15)
    directory = Path('private') / RUN_ID
    monkeypatch.setattr(dry.target_guard.lab, '_root', lambda: Path('private'))
    monkeypatch.setattr(dry.recovery_guard, '_check_private_acl', lambda p: calls.append(('acl',)) or True)
    monkeypatch.setattr(dry.target_guard, '_check_lab', lambda r: (directory, {}))
    monkeypatch.setattr(dry.target_guard.lab, '_read_secret', lambda *args: 'secret')
    monkeypatch.setattr(dry.target_guard, '_inspect_connection', guard)
    monkeypatch.setitem(sys.modules, 'asyncpg', SimpleNamespace(connect=connect))
    report, now = asyncio.run(dry.inspect_target(RUN_ID))
    assert report.table_count == 15 and now == NOW
    assert calls == [('acl',), ('connect', {'default_transaction_read_only': 'on',
                      'lock_timeout': '3s', 'statement_timeout': '5s'}, 5), ('guard',),
                     ('transaction', {'isolation': 'repeatable_read', 'readonly': True}),
                     ('sql', 'SELECT clock_timestamp()'), ('close',)]


def test_report_is_aggregate_and_errors_redacted(monkeypatch, capsys):
    async def target(run): return SimpleNamespace(table_count=15), NOW
    monkeypatch.setattr(dry, 'inspect_target', target)
    monkeypatch.setattr(dry.source_reader, 'load_pinned_source', rows)
    assert dry.main(['--synthetic-only', RUN_ID]) == 0
    result = capsys.readouterr().out
    assert 'writers_not_proven_stopped' in result
    assert 'not_authorization_for_migration_or_production' in result
    assert 'session_token' not in result and 'pending' not in result
    def fail(): raise ValueError('secret-token')
    monkeypatch.setattr(dry.source_reader, 'load_pinned_source', fail)
    assert dry.main(['--synthetic-only', RUN_ID]) == 2
    assert 'secret-token' not in capsys.readouterr().out


def test_dry_run_reports_safe_source_error_category(monkeypatch, capsys):
    async def target(run): return SimpleNamespace(table_count=15), NOW
    monkeypatch.setattr(dry, 'inspect_target', target)
    def fail():
        raise dry.source_reader.SourceReadError('source_foreign_key_invalid')
    monkeypatch.setattr(dry.source_reader, 'load_pinned_source', fail)
    assert dry.main(['--synthetic-only', RUN_ID]) == 2
    assert 'source_foreign_key_invalid' in capsys.readouterr().out
