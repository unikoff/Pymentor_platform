# Deployment

The active path is `Release` -> [release.yml](workflows/release.yml) -> GitOps on
AlphaVPS. Runtime uses PostgreSQL and Redis. See the [Core runbook](../services/core-api/README.md).

Shared-hosting, Passenger, SQLite backup/import and file-based cron deployment
instructions have been retired. Their history is available in Git. Existing
private backups are not deployment inputs for this cleanup.
