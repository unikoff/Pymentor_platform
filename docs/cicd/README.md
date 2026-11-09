# Preview GitOps, PYM-492

Scope: only test VPS knowi01 / 13.140.29.11. Legacy server, user SQLite and DNS are outside this release. Notifications remain suspended. This is test-environment acceptance, not production readiness.

## Baseline 2026-11-09

- Source base: codex/vps-migration-20261108 commit 9c9bb20cad2b930bbcb254aec93556faa573de2a. Work branch codex/cicd-argo-preview.
- K3s v1.37.2+k3s1 / Go1.26.10; host kernel6.8.0-149; Traefik3.7.15. One node, ~6Gi RAM, ~4.3Gi available, 41Gi free disk at inventory.
- Live Core image pymentor/core-api:vps-20261108-secure2. Source extracted from existing local image, compared against base: service.py differs and solve_bridge.py is additional. Both copied into service source. Release response-header middleware is a separate new observability change.
- Live frontend pymentor/frontend:vps-9c9bb20; source is base revision.
- Live coordinator pymentor/preview-pool:20261109-10. Four exact source files copied to services/runner-pool with pinned Dockerfile. It has one owner per runner namespace and uses exec over a one-shot abstract Unix socket after user processes are killed/reaped. Logs contain no user result on that route. Broker remains a trusted component.
- PostgreSQL/Redis and preview-runtime/preview-tls are existing test dependencies, excluded from GitOps deletion and manifest export. No secret contents are in this record.
- Snapshot/recovery artifacts for current control plane are root-only on test host. This is not proof of a full restore drill.

## Ownership and rollout

Argo CD owns declared desired application resources. Argo Rollouts owns rollout ReplicaSets and the stable/canary Service selectors and TraefikService weights. GitOps must ignore those controller-managed fields during sync. Rollout failure aborts traffic but does not automatically repair desired Git revision: the failed release must be recorded and Git explicitly reverted to a proven stable digest.

Tests in CI exercise disposable SQLite and PostgreSQL+Redis. Runtime candidate tests do not use legacy data. Promotion requires successful candidate tests and synthetic traffic checks at each step; no-data must not mean success. Datastore schema changes need a separate compatibility procedure and cannot be undone merely by restoring an image.

Runner source is included in CI, but changing its coordinator requires a controlled singleton handover or separate pool; it must not be converted blindly to a multi-owner rolling update. Old fallback broker may log user results and must not be silently promoted as a confidentiality-preserving rollback.

## Jira sequence

PYM-493 baseline → PYM-494 manifests → PYM-495 CI/GHCR → PYM-496 Argo CD → PYM-497 Rollouts/Traefik → PYM-498 application → PYM-499 good release → PYM-500 bad release and recovery.

Implementation and live checks are tracked in the issue comments and a final evidence record. Uncompleted checks remain open.
