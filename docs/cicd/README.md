# Preview CI/CD — PYM-492

Implemented and exercised on 2026-11-09. Scope: only test VPS **knowi01 / 13.140.29.11**, namespace `pymentor`. Public preview: https://13-140-29-11.sslip.io/ . Old hosting, legacy SQLite and DNS were not changed. Notification worker remains suspended. This is preview acceptance, not production readiness.

## Release path

```text
push codex/cicd-argo-preview
  → GitHub Actions: disposable SQLite + PostgreSQL/Redis checks
  → build Core / frontend / runner-pool, SBOM + provenance, critical scan
  → GHCR: immutable SHA256 digests
  → bot commit of release.json / Kustomize image mappings
  → Argo CD pulls the same branch into test K3s
  → candidate functional checks at 0% public traffic
  → Traefik 10% → 25% → 50% → 100%, checks at every stage
  → stable revision; old ReplicaSet scales down
```

The active release branch is **codex/cicd-argo-preview**. `main`/`production` were not switched or merged by this work. Normal commits to the preview branch run CI automatically. PR CI is read-only; only trusted branch pushes may publish. GitHub Actions has no SSH key or kubeconfig. Argo CD uses its restricted in-cluster identity; no public admin UI is exposed.

`deploy/gitops/preview/release.json` records source SHA and three image digests; the image SHA differs from the later bot/configuration commit. Core emits `X-Pymentor-Revision` for the image source SHA. The publisher refuses stale branch heads instead of overwriting intervening edits. If it refuses, inspect current HEAD and rerun checks on the current branch; never force-push a stale release.

Config-only fault/recovery commits in the acceptance drill used `[skip ci]` and kept already-scanned image digests. Do not use this to bypass image checks for application source changes. Normal releases should follow the complete pipeline.

## Ownership and isolation

- Argo CD owns declared app configuration; Rollouts owns ReplicaSets, stable/canary Service selectors and Traefik weights. GitOps ignores only those selectors/weights (explicit JSON pointers for the two traffic weights).
- Core and frontend each have a Rollout: one stable replica, one temporary candidate, maxUnavailable0/maxSurge1. A small node still needs room for both during rollout. This is not node HA or autoscaling.
- Candidate checks cover readiness, catalog, anonymous auth rejection and synthetic login followed by an actual free lesson task run through Core→runner. Login uses a canonical UUID Idempotency-Key. Secure cookies are forwarded only to the internal candidate target and never logged.
- Live checks make 20 bounded public HTTPS requests per stage. These are functional synthetic gates, not statistically sufficient error-budget/SLO measurements or a 15-user benchmark. The preview creates isolated synthetic accounts; production needs an agreed test-account lifecycle.
- Runner coordinator is singleton **Recreate**, not a second concurrent owner of the same namespace. SIGTERM stops admission and waits for active work; new coordinator waits for the old Pod to disappear before orphan recovery. Updating it can temporarily reject interpreter requests; zero downtime is not promised. Each user execution gets a one-use gVisor sandbox. Strict network/admission/runtime settings remain outside the app source of truth and are not relaxed by this release.
- Results use the private one-shot Unix-socket/exec path after user processes are killed and reaped. Direct interpreter security checks and solve forgery probes were repeated. This is evidence for tested boundaries, not proof that no sandbox/kernel exploit exists.
- Argo has no direct app Secret reads or PVC deletion. It can create workloads, so Git write permissions and controller identities remain trusted and must be protected. The absence of direct Secret RBAC alone is not a complete security boundary.
- Existing test PostgreSQL/Redis, PVCs and TLS/runtime secrets are excluded from GitOps prune; prune=false. Schema migrations are not automatic. Data rollback is a separate procedure, never an implicit image rollback.

## Actual acceptance

1. [Actions run42636226406](https://github.com/unikoff/Pymentor_platform/actions/runs/42636226406), source `52a52a8812598a43c255eb30dfedd25fc6ac683d`: all checks/builds/scans/publish passed; all three GHCR images pulled by K3s. A real critical zlib scan failure was fixed with the Alpine package update before success.
2. Both Core/frontend traversed observed weights 10/25/50/100 and became Healthy. GitOps applied bot commit `aefbaef5` automatically. Bootstrap Deployments were retained at replicas0 after Services moved to the Rollouts.
3. Real synthetic registration/login, script preview, wrong answer rejection, correct answer acceptance and persisted task progress after logout/login passed on public HTTPS. Solve probes covered correct/wrong results, forbidden stdout, input mutation, known frame-forgery attempt, classes and augmented assignment.
4. Public sandbox probes denied platform files, tokens, host Docker socket, outbound network, filesystem writes and supervisor-FD access. Infinite loop and output limits rejected correctly. Existing isolation was preserved.
5. Enhanced candidate Job really passed in K3s, including the task run. Broker NetworkPolicy was updated narrowly for `core-api-progressive`; sandbox network was not widened.
6. A graceful coordinator replacement was exercised with an active synthetic execution: its response completed, the replacement singleton became Ready, and another public execution passed. This is a targeted handover check, not node-loss/HA evidence.
7. Controlled fault commit `515815d8`: same proven Core image, HTTP503 only for the public preview Host. Internal candidate preflight passed; live analysis failed at **10%**; Rollouts aborted and restored stable100/canary0. Ten subsequent public health requests returned200 with the proven source revision.
8. Git revert `7a56d317` restored desired state. The old failed sync operation was explicitly terminated; Argo automatically reconciled the new Git revision to Synced/Healthy. A 600-second controller sync timeout was added to bound future waits.

Machine-readable observations are in the operator artifact directory `cicd-20261109` (good-release-observations.json, bad-release-observations.json, practice-acceptance.json and final-state.json). They contain no credentials. Jira subtasks PYM-493…500 carry the individual acceptance records. Final repository HEAD may be a documentation/configuration commit later than the source SHA shown above.

## Inspect and recover

These commands run in the **test VPS terminal**, not an arbitrary local kube context. `--context default` explicitly selects the verified K3s context; `-n` limits each query to its namespace.

```sh
# Desired Git revision and synchronization result:
k3s kubectl --context default -n argocd-preview get application pymentor-preview
# Actual rollout state, candidate analysis and traffic weights:
k3s kubectl --context default -n pymentor get rollouts,analysisruns,traefikservices
# Current running application Pods (no secret data):
k3s kubectl --context default -n pymentor get pods
# Check that automatic notification sending remains suspended:
k3s kubectl --context default -n pymentor get cronjobs
```

If a release fails, keep the candidate aborted and inspect AnalysisRun/Job logs (the checks log no passwords/cookies). Record failed source and manifests. Revert the **bad GitOps manifest commit** to proven digests, inspect/render the diff, and push the revert to the preview branch. Do not blindly revert only the source and assume images change immediately. Do not change the database as part of image recovery.

If Argo CD still has a Running sync for the failed revision, verify its revision before terminating it. This stops only that operation, not the serving stable application:

```sh
k3s kubectl --context default -n argocd-preview get application pymentor-preview -o jsonpath='{.status.operationState.syncResult.revision}'
# Only after confirming this is exactly the failed operation:
k3s kubectl --context default -n argocd-preview patch application pymentor-preview --type merge -p '{"status":{"operationState":{"phase":"Terminating"}}}'
k3s kubectl --context default -n argocd-preview annotate application pymentor-preview argocd.argoproj.io/refresh=hard --overwrite
```

Then wait for **Synced AND Healthy at the intended Git SHA**, both Rollouts Healthy, stable100/canary0 and actual public requests. A green sync alone does not prove application health. If Git/controller access fails, use the recorded operator baseline and stop auto-sync before emergency traffic changes, otherwise self-heal can overwrite them. Retained bootstrap Deployments are a recovery aid, not a substitute for this tested Git revert; some older fallback runners logged user output and must not be promoted silently.

Remaining scope outside this task: main/production adoption, real-user data migration, DNS cutover, notification enablement, multi-node HA/full host restore, production SLO telemetry and sustained load acceptance. The old platform continues independently.
