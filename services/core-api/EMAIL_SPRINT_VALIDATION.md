# Email validation

The current acceptance matrix is [tests/runtime_suites.json](tests/runtime_suites.json).
Run `python scripts/ci/preview_checks.py` from the repository root against the
dedicated disposable PostgreSQL/Redis described in [README.md](README.md).

Email HTTP, verification state, password changes/recovery, replay protection and
SMTP transport have their required suites in that matrix. Each HTTP suite runs in
a fresh process. No SQLite fixture or import step is used.

Historical 11 November measurements remain in Git; they are not acceptance evidence
for the current release. Automated SMTP checks use synthetic messages and never
prove delivery through a real provider. Provider credentials stay outside Git.
