"""Repeat a read-only synthetic rehearsal against one fresh disposable lab."""
import asyncio
from hashlib import sha256
import sys

import c232_dry_run as dry


def digest_file(path):
    with path.open('rb') as file:
        return sha256(file.read()).digest()


async def probe(run_id):
    # The ACL must be checked before reading even the synthetic journal.
    directory = dry.target_guard.lab._root() / run_id
    if not dry.target_guard.RUN_ID.fullmatch(run_id) or not dry.recovery_guard._check_private_acl(directory):
        raise RuntimeError('guard_failed')
    journal = directory / 'state.json'
    before = digest_file(journal)
    first = await dry.inspect(run_id)
    second = await dry.inspect(run_id)
    if first != second or digest_file(journal) != before:
        raise RuntimeError('rehearsal_changed_state')
    if (first['source_table_count'], first['source_row_count'], first['session_count']) != (15, 21, 2):
        raise RuntimeError('fixture_mismatch')
    if first['outbox'] != {'sent_records': 2, 'requires_review': 4}:
        raise RuntimeError('outbox_mismatch')
    print('PASS: two read-only synthetic rehearsals; target empty; journal unchanged; 15 tables, 21 rows, 2 sessions')
    print('LIMITATION: four outbox records require review; writer freeze and delivery are not proven')


if __name__ == '__main__':
    try:
        asyncio.run(probe(sys.argv[1]))
    except Exception:
        print('BLOCKED: synthetic dry-run probe failed; target requires inspection')
        raise SystemExit(2)
