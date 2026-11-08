"""Second deterministic synthetic dataset; disposable PG only, no sessions or workers."""
import asyncio
from copy import deepcopy
from hashlib import sha256
import sys

import c232_commit_probe as commit
import c232_recovery_guard as recovery
import c232_source_reader as source_reader
from c232_process_mutex import synthetic_lab_mutex


def synthetic_variant():
    source = source_reader.load_pinned_source()
    # Derived entirely from the pinned fake snapshot; never read another path.
    if [row['id'] for row in source['users']] != [1, 2]:
        raise ValueError('fixture_invalid')
    extra_user = dict(source['users'][0], id=37, username='synthetic_variant',
                      email='variant@example.test')
    extra_lesson = dict(source['user_lesson_progress'][0], id=44, user_id=37)
    extra_task = dict(source['user_task_progress'][0], id=45, user_id=37)
    source['users'].append(extra_user)
    source['user_lesson_progress'].append(extra_lesson)
    source['user_task_progress'].append(extra_task)
    source['sessions'] = []
    if sum(commit.preflight(source).values()) != 22:
        raise ValueError('fixture_invalid')
    return source


async def probe(run_id):
    with synthetic_lab_mutex(run_id):
        source = synthetic_variant()
        bad = deepcopy(source)
        bad['user_lesson_progress'][-1]['user_id'] = 999
        try:
            commit.preflight(bad)
        except ValueError as exc:
            if str(exc) != 'Foreign key violation':
                raise
        else:
            raise ValueError('invalid_fixture_accepted')
        if not commit.guard.RUN_ID.fullmatch(run_id):
            raise ValueError('invalid_run')
        directory = commit.guard.lab._root() / run_id
        if not recovery._check_private_acl(directory):
            raise ValueError('journal_acl_unverified')
        await commit.guard.inspect(run_id)
        directory, state = commit.guard._check_lab(run_id)
        commit.guard.lab._state_update(directory, state, 'c232-variant-quarantined')
        if not recovery._check_private_acl(directory):
            raise ValueError('journal_acl_unverified')
        # The marker identifies this exact hard-coded synthetic transformation;
        # it is not a general digest of arbitrary source data.
        marker_digest = sha256((commit.source_guard.PINNED_SYNTHETIC_SHA256 +
                                ':synthetic-variant-v1').encode('ascii')).hexdigest()
        identity = {'marker_digest': marker_digest, 'marker_version': 'synthetic_variant_without_sessions_v1'}
        await commit.bootstrap(directory)
        if await commit.insert_and_commit(directory, source, **identity) != 'committed':
            raise ValueError('initial_import_invalid')
        await commit.reconcile(directory, source, **identity)
        if await commit.insert_and_commit(directory, source, **identity) != 'already_complete':
            raise ValueError('replay_invalid')
        await commit.reconcile(directory, source, **identity)
        wrong = dict(identity, marker_digest=sha256(b'different-synthetic-snapshot').hexdigest())
        try:
            await commit.insert_and_commit(directory, source, **wrong)
        except RuntimeError as exc:
            if str(exc) != 'marker_mismatch':
                raise
        else:
            raise ValueError('foreign_marker_accepted')
        altered = deepcopy(source)
        altered['users'][-1]['username'] = 'synthetic_variant_altered'
        try:
            await commit.insert_and_commit(directory, altered, **identity)
        except ValueError:
            pass
        else:
            raise ValueError('altered_rows_accepted')
        await commit.reconcile(directory, source, **identity)
    print('PASS: second synthetic dataset imported and reconciled twice; wrong marker and altered rows rejected; 15 tables, 22 rows; sessions excluded')
    print('LIMITATION: no worker, Redis or general source; external delivery is not verified')


if __name__ == '__main__':
    try:
        asyncio.run(probe(sys.argv[1]))
    except Exception:
        print('BLOCKED: synthetic variant failed; preserve lab quarantine')
        raise SystemExit(2)
