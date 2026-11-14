# CORP-525: SQLite source retirement

Verified locally on 14 November 2026 against merged Release
`fa35703af60f922a353a32037412ec1feb1699ae`.

Removed 119 obsolete files: 70 operator/lab files, 48 implementation-only test
files and the unused PostgreSQL legacy-session importer. This includes the entire
SQLite snapshot/inventory/import/rollback chain, transitional ASGI applications,
experimental session models and the SQLite-only slot maintenance command.
Administrative slot operations remain available through the current API.

Business fixtures were retained on managed disposable PostgreSQL: chapter
completion, ports/UoW rollback, Runner API, route aliases and email migrations.
Pure in-memory test adapters moved into test support. The required CI matrix now
includes these scenarios and the source-retirement guard. Historical operational
instructions were updated; task-owned before/after source archives were removed.

Validation:

| Check | Result |
| --- | --- |
| Required unit/contract suites | 196 passed, plus 11 subtests |
| Real PostgreSQL/Redis runtime suites | 48 passed |
| HTTP suites in 24 isolated processes | 213 passed |
| Runner/security contracts | 4 passed |
| Release-check contracts | 4 passed |
| Full test collection | 767 collected, no import errors |
| Required-suite failures/errors/skips | 0 / 0 / 0 |
| OpenAPI before/after | Identical: 102 operations, 75 schemas |
| Source/config and built runtime-image guard | Passed |
| Git whitespace/error check | Passed |

The OpenAPI comparison used identical content/frontend packaging in both source
trees. Its temporary baseline was removed. The runtime image was checked as UID
10001 with a read-only filesystem and no network: no retired adapter, importer,
operator tools, database files or Alembic tooling were present.

The first GitHub CI exposed Windows separators in the newly required architecture
fixture's path map. Those literals now use portable repository paths. The exact
import-cycle/path scenario passed on Windows/Python 3.14 and Linux/Python 3.12.

The serving package has no behavior changes: the only remaining-file edit is an
account-reader docstring; the removed importer had no serving callers. PostgreSQL
Alembic history, frontend and course content are unchanged. Remaining SQLite text
is used by rejection/retirement checks, course material and schema-history notes.
Current runtime configuration accepts PostgreSQL/Redis only.

One existing standalone architecture-check finding remains:
`modules.learning.api.service:19 -> adapters.legacy_runner.python`.
Both the caller and checker are identical to the baseline. Retiring that current
Runner boundary is outside this SQLite cleanup.

No AlphaVPS changes, data migration/import/restore, production database operations,
secret changes or deployment were performed for CORP-525.
