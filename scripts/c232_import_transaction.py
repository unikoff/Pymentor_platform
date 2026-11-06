"""Transactional data portion of the offline C2.3.2 lab importer.

The caller must first validate the disposable lab and disable writers and
notification consumers. Redis projection and activation are separate steps;
this SQL operation alone does not make imported sessions usable.
"""
import c232_commit_probe as existing
from c232_dry_run import audit_source
from infrastructure.c232_compare import compare_rows
from infrastructure.c232_mapping import TABLE_MAPPINGS, TABLE_ORDER, convert_row
from infrastructure.c232_preflight import preflight


async def import_transaction(connection, source, snapshot_digest):
    """Commit all mapped rows and identity markers, or verify an earlier commit.

    Exceptions must not be logged with SQL parameters: callers report categories
    only. The transaction context rolls back on failure. Marker identity is only
    meaningful if computed from the exact source snapshot by the trusted caller.
    """
    digest, version = existing.marker_identity(snapshot_digest, 'offline_all_tables_v1')
    preflight(source)
    async with connection.transaction():
        await existing.lock_and_check(connection)
        if (await connection.fetchval('SELECT EXISTS (SELECT 1 FROM public.login_operations)')
                or await connection.fetchval('SELECT EXISTS (SELECT 1 FROM public.account_lifecycles)')
                or await connection.fetchval('SELECT EXISTS (SELECT 1 FROM public.booking_notification_subjects)')
                or await connection.fetchval('SELECT EXISTS (SELECT 1 FROM public.account_deletion_events)')
                or await connection.fetchval('SELECT EXISTS (SELECT 1 FROM public.account_deletion_redis_keys)')):
            raise ValueError('target_login_operations_not_empty')
        marker = await connection.fetch(
            f'SELECT singleton, snapshot_digest, transform_version FROM {existing.MARKER_TABLE}'
        )
        user_ids = sorted(row['id'] for row in source['users'])
        review_rows = sorted((queue, row['id']) for queue in (
            'booking_notification_outbox', 'landing_notification_outbox')
            for row in source[queue] if row['status'] != 'sent')
        if marker:
            if len(marker) != 1 or tuple(marker[0]) != (True, digest, version):
                raise ValueError('marker_mismatch')
            actual_users = await connection.fetch('SELECT user_id FROM public.session_import_markers ORDER BY user_id')
            if [row['user_id'] for row in actual_users] != user_ids:
                raise ValueError('session_markers_mismatch')
            reviews = await connection.fetch('SELECT queue, row_id, reviewed, decision '
                                             'FROM c232_lab_control.outbox_review ORDER BY queue, row_id')
            if [(row['queue'], row['row_id']) for row in reviews] != review_rows:
                raise ValueError('outbox_review_mismatch')
            target = await existing.fetch_target(connection)
            indexes = {queue: ({row['id']: row for row in source[queue]},
                               {row['id']: row for row in target[queue]})
                       for queue in ('booking_notification_outbox', 'landing_notification_outbox')}
            for review in reviews:
                if not review['reviewed']:
                    continue
                queue, row_id, decision = review['queue'], review['row_id'], review['decision']
                source_row = indexes[queue][0].get(row_id)
                target_row = indexes[queue][1].get(row_id)
                if source_row is None or target_row is None or decision not in ('delivered', 'suppress'):
                    raise ValueError('outbox_review_mismatch')
                expected_status = 'sent' if decision == 'delivered' else 'failed'
                if (target_row['status'] != expected_status or target_row['locked_until'] is not None
                        or target_row['lock_token'] is not None):
                    raise ValueError('outbox_review_mismatch')
                original = convert_row(queue, source_row)
                for field in ('status', 'locked_until', 'lock_token'):
                    target_row[field] = original[field]
            compare_rows(source, target)
            await existing.sequence_states(connection, source, restart=False)
            return 'already_complete'

        for table in existing.DATA_TABLES:
            if await connection.fetchval(f'SELECT EXISTS (SELECT 1 FROM public."{table}")'):
                raise ValueError('target_not_empty')
        now = await connection.fetchval('SELECT clock_timestamp()')
        audit_source(source, now)
        await connection.execute('''CREATE TABLE c232_lab_control.outbox_review (
            queue text NOT NULL, row_id integer NOT NULL,
            reviewed boolean NOT NULL DEFAULT false, decision text, reviewed_at timestamptz,
            CHECK ((NOT reviewed AND decision IS NULL AND reviewed_at IS NULL) OR
                   (reviewed AND decision IN ('delivered', 'suppress') AND reviewed_at IS NOT NULL)),
            PRIMARY KEY (queue, row_id))''')
        await connection.execute('REVOKE ALL ON c232_lab_control.outbox_review FROM PUBLIC, pymentor_app')
        await connection.execute('GRANT SELECT ON c232_lab_control.outbox_review TO pymentor_app')
        if review_rows:
            await connection.executemany(
                'INSERT INTO c232_lab_control.outbox_review (queue, row_id) VALUES ($1, $2)', review_rows)
        for table in TABLE_ORDER:
            cols = [column.name for column in TABLE_MAPPINGS[table].columns]
            names = ', '.join(f'"{col}"' for col in cols)
            params = ', '.join(f'${i}' for i in range(1, len(cols) + 1))
            rows = [convert_row(table, row) for row in source[table]]
            if rows:
                await connection.executemany(
                    f'INSERT INTO public."{table}" ({names}) VALUES ({params})',
                    [tuple(row[col] for col in cols) for row in rows],
                )
        if user_ids:
            await connection.executemany(
                'INSERT INTO public.session_import_markers (user_id) VALUES ($1)',
                [(user_id,) for user_id in user_ids],
            )
        compare_rows(source, await existing.fetch_target(connection))
        await existing.sequence_states(connection, source, restart=True)
        await connection.execute(
            f'INSERT INTO {existing.MARKER_TABLE} VALUES (true, $1, $2)', digest, version
        )
    return 'committed'
