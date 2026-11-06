"""Demonstrate marker ACL risk on a verified disposable PostgreSQL lab only.

This intentionally commits a synthetic marker to the disposable lab and
simulates its existing broad grant routine. It is not an import marker design,
production migration, or release procedure. The lab must be quarantined after.
"""
import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'scripts'))

import asyncpg
import c232_target_guard as guard


async def probe(run_id):
    await guard.inspect(run_id)
    directory, _ = guard._check_lab(run_id)
    common = dict(host='127.0.0.1', port=guard.lab.PORT, database=guard.lab.DATABASE, timeout=5)
    owner = await asyncpg.connect(**common, user=guard.lab.MIGRATOR,
                                  password=guard.lab._read_secret(directory, 'migrator_password'))
    app = await asyncpg.connect(**common, user=guard.lab.APP_ROLE,
                                password=guard.lab._read_secret(directory, 'app_password'))
    try:
        await owner.execute('''CREATE TABLE public.c232_lab_import_marker (
            singleton boolean PRIMARY KEY CHECK (singleton), snapshot_digest text NOT NULL
        )''')
        async def app_can_update():
            return await owner.fetchval("SELECT has_table_privilege($1, $2, 'UPDATE')",
                                        guard.lab.APP_ROLE, 'public.c232_lab_import_marker')
        if not await app_can_update():
            raise RuntimeError('expected_default_grant_missing')
        await owner.execute('REVOKE ALL ON public.c232_lab_import_marker FROM PUBLIC, pymentor_app')
        if await app_can_update():
            raise RuntimeError('revocation_ineffective')
        try:
            await app.execute("INSERT INTO public.c232_lab_import_marker VALUES (true, 'synthetic')")
        except asyncpg.exceptions.InsufficientPrivilegeError:
            pass
        else:
            raise RuntimeError('unexpected_marker_write')
        await owner.execute('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO pymentor_app')
        if not await app_can_update():
            raise RuntimeError('broad_grant_did_not_restore_access')
        await owner.execute('REVOKE ALL ON public.c232_lab_import_marker FROM PUBLIC, pymentor_app')
        if await app_can_update():
            raise RuntimeError('final_revocation_ineffective')
        print('PASS: default and broad grants permit marker writes; explicit revocation removes access')
    finally:
        await app.close()
        await owner.close()


if __name__ == '__main__':
    try:
        asyncio.run(probe(sys.argv[1]))
    except Exception:
        print('BLOCKED: marker ACL experiment failed; disposable lab requires inspection')
        raise SystemExit(2)
