"""One-shot synthetic recovery-guard and ACL check; no data rows imported."""
import asyncio
import sys
from uuid import uuid4

import c232_commit_probe as commit_probe
import c232_recovery_guard as recovery_guard
import c232_source_reader as source_reader


async def probe(run_id):
    source = source_reader.load_pinned_source()
    if len(source) != 15 or sum(map(len, source.values())) != 21:
        raise RuntimeError('fixture_invalid')
    if not commit_probe.guard.RUN_ID.fullmatch(run_id):
        raise RuntimeError('run_id_invalid')
    private_directory = commit_probe.guard.lab._root() / run_id
    if not recovery_guard._check_private_acl(private_directory):
        raise RuntimeError('journal_acl_unverified')
    await commit_probe.guard.inspect(run_id)
    directory, state = commit_probe.guard._check_lab(run_id)
    prefix = f'pymentor-c216-test:{uuid4()}:'
    commit_probe.guard.lab._state_update(directory, state, 'c232-resumable-quarantined', redis_prefix=prefix)
    if not recovery_guard._check_private_acl(directory):
        raise RuntimeError('journal_acl_unverified')
    await commit_probe.bootstrap(directory)
    connection = await commit_probe.connect(directory, commit_probe.guard.lab.MIGRATOR, 'migrator_password')
    try:
        await connection.execute('''CREATE TABLE c232_lab_control.session_operations (
            user_id integer PRIMARY KEY, snapshot_id text NOT NULL, operation_id text NOT NULL
        )''')
    finally:
        await connection.close()
    report = await recovery_guard.inspect(run_id)
    if any((report.writers_proven, report.source_proven, report.data_proven,
            report.ttl_proven, report.sequence_proven)) or not report.journal_acl_proven:
        raise RuntimeError('report_overclaims')
    connection = await commit_probe.connect(directory, commit_probe.guard.lab.MIGRATOR, 'migrator_password')
    try:
        for privilege in ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'TRIGGER', 'REFERENCES',
                          'INSERT (operation_id)', 'UPDATE (operation_id)', 'REFERENCES (operation_id)'):
            transaction = connection.transaction(isolation='repeatable_read')
            await transaction.start()
            try:
                # GRANT is intentionally uncommitted; on error or process exit
                # PostgreSQL rolls it back. The internal guard runs in a nested
                # savepoint on this same connection and observes that grant.
                await connection.execute(f'GRANT {privilege} ON c232_lab_control.session_operations TO pymentor_app')
                try:
                    await recovery_guard._inspect_connection(connection)
                except recovery_guard.RecoveryGuardError as exc:
                    if exc.category != 'marker_acl_invalid':
                        raise
                else:
                    raise RuntimeError('unsafe_acl_accepted')
            finally:
                await transaction.rollback()
    finally:
        await connection.close()
    await recovery_guard.inspect(run_id)
    print('PASS: synthetic recovery metadata verified; nine table/column grants detected and rolled back')


if __name__ == '__main__':
    try:
        asyncio.run(probe(sys.argv[1]))
    except Exception:
        print('BLOCKED: recovery-guard experiment failed or ambiguous; quarantine lab')
        raise SystemExit(2)
