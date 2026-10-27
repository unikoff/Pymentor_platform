# Local K3s profiles for Core (C1.3)

This runbook provisions disposable local `k3d` clusters from WSL Ubuntu 24.04. It is for development and acceptance checks, not a production deployment. The production Helm profiles are render/lint scaffolds only.

## Prerequisites

- Windows with WSL2 and an Ubuntu 24.04 distro.
- Docker Engine and Buildx running inside that distro.
- The pinned `k3d`, `kubectl`, and Helm CLIs listed in `scripts/local-k3s/tool-versions.env`.
- `curl`, `tar`, and `sha256sum`; `aria2c` is used when available to speed up the verified Traefik release download.
- At least 4 GiB of memory available to WSL for `local-multinode`; this profile assigns 2 GiB to the server and 768 MiB to each agent, in addition to WSL and container overhead.
- Run commands from the repository's WSL path. Quote the path because it contains spaces.

Example:

```bash
cd "/mnt/c/Project Python/Pymentor_platform"
bash scripts/local-k3s/build-images.sh
bash scripts/local-k3s/cluster.sh create local-single
```

`build-images.sh` builds the Core and frontend images from clean contexts. The chart pins both images by digest; if you rebuild them after changing source, update `images.core.digest` and `images.frontend.digest` in `deploy/helm/pymentor/values.yaml` to the newly reported repository digests before creating a cluster. The create script rejects mismatched digests. It also packages the official Traefik v3.7.13 Linux binary into a minimal non-root local image after verifying the upstream release SHA256 recorded in `tool-versions.env`.

The K3s local-path provisioner is pinned to its upstream version tag and imported under that same name. Do not replace it with a digest generated while re-tagging a local image: that digest may not exist in the upstream registry, so kubelet will try a network pull and PVC creation will fail.

## Profiles

| Profile | k3d topology | Local URL | Kubernetes context | Notes |
| --- | --- | --- | --- | --- |
| `local-single` | 1 server, no agents | `http://pymentor.localhost:28080` | `k3d-pymentor-local-single` | Basic ingress, persistence, and rollout smoke. |
| `local-multinode` | 1 server + 2 agents | `http://pymentor.localhost:28081` | `k3d-pymentor-local-multinode` | Frontend and Traefik use two replicas; Core remains one SQLite writer. |

The scripts bind the host ports to loopback. They use API ports `26550` and `26551` respectively. Only one profile should be kept running at a time on a memory-constrained WSL host.

The local profiles disable the optional K3s metrics-server; `kubectl top` is therefore unavailable. Container CPU and memory requests and limits still apply. The frontend's runtime DNS resolver assumes the default K3s DNS service IP `10.43.0.10`.

## Lifecycle

```bash
bash scripts/local-k3s/cluster.sh create local-single
bash scripts/local-k3s/cluster.sh status local-single
bash scripts/local-k3s/cluster.sh stop local-single
bash scripts/local-k3s/cluster.sh start local-single
bash scripts/local-k3s/cluster.sh delete local-single

bash scripts/local-k3s/cluster.sh create local-multinode
bash scripts/local-k3s/cluster.sh status local-multinode
bash scripts/local-k3s/cluster.sh stop local-multinode
bash scripts/local-k3s/cluster.sh start local-multinode
bash scripts/local-k3s/cluster.sh delete local-multinode
```

`stop` shuts down the node containers and preserves the cluster and PVC data. `start` resumes that cluster and waits for its nodes. `create` also resumes an existing stopped cluster before reconciling it. `delete` removes the selected disposable cluster and its local PVC data. Take and verify a backup before deleting data that matters.

## Runtime secret and TLS scaffold

The local Core Deployment reads its SQLite URL from the `pymentor-runtime` Secret. The bootstrap script creates this Secret; if you deploy the chart manually, recreate it without putting values in a Helm file:

```bash
kubectl --context k3d-pymentor-local-single -n pymentor create secret generic pymentor-runtime \
  --from-literal=DATABASE_URL=sqlite:////data/pymentor.sqlite3 \
  --dry-run=client -o yaml | kubectl --context k3d-pymentor-local-single apply -f -
```

Production values only reference a pre-created TLS Secret. To prepare one in an explicitly approved deployment namespace, use `kubectl create secret tls <secret-name> --cert=<certificate-file> --key=<private-key-file>` and keep the key outside the repository and Helm values. Stage 1 only lints and renders these profiles; it does not create production secrets, certificates, DNS records, or deployments.

## SQLite and backup

Both local profiles run exactly one Core pod and mount a `ReadWriteOnce` PVC backed by K3s `local-path`. The volume is local to one cluster node; it is neither replicated storage nor a backup. A Core pod restart preserves data, but loss of its node or cluster can make the volume unavailable. SQLite remains a single-writer database, including in the three-node profile. Core uses `RollingUpdate` with `maxSurge: 0` and `maxUnavailable: 1`: updates never overlap two writers, and the API can be briefly unavailable while the replacement passes startup and readiness probes.

Create a consistent online SQLite backup inside the Core pod, then copy it out before cluster deletion:

```bash
kubectl --context k3d-pymentor-local-single -n pymentor exec deployment/pymentor-core -- \
  python -m notifications.worker --backup-db /tmp/pymentor.sqlite
kubectl --context k3d-pymentor-local-single -n pymentor exec deployment/pymentor-core -- \
  cat /tmp/pymentor.sqlite > ./pymentor.sqlite
```

Use the `local-multinode` context for that profile. Treat these files as application data; do not commit them.

## Routes and security boundaries

- One host serves the SPA at `/` and Core at `/api` and `/api/`.
- Local profiles use HTTP and `PYMENTOR_COOKIE_SECURE=false`; production render profiles set it to `true` and reference a TLS Secret.
- Core, SQLite, Redis, and Runner have no externally published Service. Core is ClusterIP-only; no database, broker, or Runner Service is rendered.
- NetworkPolicy defaults to deny and permits Frontend-to-Core, ingress-controller-to-workload, and DNS traffic. The active local CNI must enforce NetworkPolicy; verify it using the commands below.
- The chart disables service-account token mounting, runs containers as non-root with a read-only root filesystem and dropped Linux capabilities, and defines startup, readiness, and liveness probes plus CPU/memory requests and limits.

The legacy Python Runner is disabled by default. For a controlled local test only, opt in explicitly with `--set runner.enabled=true`; the chart prepares its lock file on a 1 MiB memory-backed volume while keeping the Core root filesystem read-only. This does not sandbox learner code. Keep the profile loopback-only, use synthetic data, and never enable the flag in a public or production deployment. The production profile schema rejects this opt-in.

## Smoke checks

Run these checks for `local-single`:

```bash
bash scripts/local-k3s/cluster.sh status local-single
kubectl --context k3d-pymentor-local-single get nodes -o wide
kubectl --context k3d-pymentor-local-single -n pymentor get deployments,pods,services,endpoints,pvc,networkpolicy -o wide
kubectl --context k3d-pymentor-local-single -n pymentor rollout status deployment/pymentor-core
kubectl --context k3d-pymentor-local-single -n pymentor rollout status deployment/pymentor-frontend
curl -i -H 'Host: pymentor.localhost' http://127.0.0.1:28080/
curl -i -H 'Host: pymentor.localhost' http://127.0.0.1:28080/api/user/me
```

Expected: one Ready node; Core and Frontend each `1/1`; Traefik `1/1`; service endpoints are populated; SQLite PVC is `Bound`; `/` returns 200 and unauthenticated `/api/user/me` returns 401.

For `local-multinode`, use its own context and port:

```bash
bash scripts/local-k3s/cluster.sh status local-multinode
kubectl --context k3d-pymentor-local-multinode get nodes -o wide
kubectl --context k3d-pymentor-local-multinode -n pymentor get deployments,pods,services,endpoints,pvc,networkpolicy -o wide
kubectl --context k3d-pymentor-local-multinode -n pymentor rollout status deployment/pymentor-core
kubectl --context k3d-pymentor-local-multinode -n pymentor rollout status deployment/pymentor-frontend
kubectl --context k3d-pymentor-local-multinode -n kube-system rollout status deployment/traefik
curl -i -H 'Host: pymentor.localhost' http://127.0.0.1:28081/
curl -i -H 'Host: pymentor.localhost' http://127.0.0.1:28081/api/user/me
```

Expected: three Ready nodes; Core `1/1`; Frontend `2/2`; Traefik `2/2`; service endpoints are populated; SQLite PVC is `Bound`; `/` returns 200 and unauthenticated `/api/user/me` returns 401. Delete one Traefik pod and repeat both route requests to verify the remaining replica still serves traffic.

The full baseline smoke is `python3 scripts/local-k3s/smoke.py --base-url http://pymentor.localhost:28080 --email "$SMOKE_EMAIL" --password "$SMOKE_PASSWORD" --existing-account`. Its C1.1.2 lesson is subscription-gated, so the account must be a synthetic local test account with an active subscription; a newly registered account does not receive that access automatically. Add `--submit-safe-code` only for a controlled test after explicitly enabling `runner.enabled=true` in this local profile. The smoke submits a fixed inert solution and checks score/progress; disable the Runner again after the test by upgrading without the opt-in.

The IngressRoute applies a rate limit of 60 average requests with a burst of 120 and rejects request bodies above 20 MiB. To confirm actual NetworkPolicy enforcement, check that a Frontend pod can reach `http://core-api:8001/health/live`, that it cannot reach an external IP, and that an unrelated pod in `pymentor` cannot reach Core. Rendered manifests alone do not prove CNI enforcement.

## Helm upgrade and rollback

Use the profile-specific values and pinned image digests. Review a rendered change against the running cluster before applying it:

```bash
profile=local-single
context=k3d-pymentor-local-single
values="deploy/helm/pymentor/values-${profile}.yaml"
helm template pymentor deploy/helm/pymentor --namespace pymentor --values "$values" > /tmp/pymentor-rendered.yaml
kubectl --context "$context" diff -f /tmp/pymentor-rendered.yaml
```

`kubectl diff` returns exit code 1 when it finds differences; review the output as the proposed change. Apply and wait for the rollout:

```bash
helm upgrade --install pymentor deploy/helm/pymentor \
  --kube-context "$context" --namespace pymentor \
  --values "$values" --wait --timeout 8m --rollback-on-failure
kubectl --context "$context" -n pymentor rollout status deployment/pymentor-core --timeout=8m
kubectl --context "$context" -n pymentor rollout status deployment/pymentor-frontend --timeout=8m
helm --kube-context "$context" -n pymentor history pymentor
```

If a release needs a manual rollback, choose the last known-good revision from `helm history`:

```bash
helm --kube-context "$context" -n pymentor rollback pymentor <known-good-revision> --wait --timeout 8m
kubectl --context "$context" -n pymentor get deployments,pods,pvc
```

An app rollback must not delete `pymentor-sqlite`. Never use `helm uninstall` as a rollback procedure. In the local failure rehearsal, an invalid Core digest made the pod fail to pull its image; Helm recorded the failed revision. Rolling back to the previous revision restored Core while the same PVC remained Bound with its original volume ID and SQLite rows. This tests Helm/volume behavior in k3d, not a production restore or storage failover.

## Troubleshooting

```bash
kubectl --context "$context" -n pymentor get pods,events --sort-by=.metadata.creationTimestamp
kubectl --context "$context" -n pymentor describe pod <pod-name>
kubectl --context "$context" -n pymentor logs deployment/pymentor-core --tail=100
kubectl --context "$context" -n kube-system logs deployment/traefik --tail=100
ss -H -ltn
df -h / /var/lib/docker
docker system df
```

If a local port is occupied, stop the corresponding profile or resolve the process before retrying; do not change the loopback-only binding to `0.0.0.0`. Check node and pod events before retrying image imports or Helm upgrades. Do not run Docker prune commands as routine cleanup: they can remove images needed by stopped clusters.

## Stage 1 limits

- SQLite has exactly one Core writer. `local-path` is node-local storage, not replicated storage; a failed agent does not make the SQLite volume portable.
- The legacy code runner is not a sandbox. Public execution of untrusted Python remains disabled until the M3 per-run isolation gate passes.
- The three-node k3d profile exercises scheduling and ingress replica recovery on one WSL2 host. It does not establish infrastructure HA, production capacity, or native multi-host behavior.
- Production values are rendered and linted only in Stage 1. No production deployment, DNS/TLS activation, or data cutover is part of this runbook.

## M1 verification record (2026-10-28)

| Environment | Observed topology/version | Checks and result | Limits |
| --- | --- | --- | --- |
| `local-single` | k3d, 1 server, K3s `v1.37.1+k3s1` | Helm bootstrap; Core/frontend ready; `/` 200 and anonymous `/api/user/me` 401; PVC Bound; Core and frontend restart; SQLite user/progress counts survived restart; online backup passed an independent SQLite integrity check. | One WSL2 host; local-path is tied to the server node. |
| `local-multinode` | k3d, 1 server + 2 agents, K3s `v1.37.1+k3s1` | Core 1/1, frontend 2/2, Traefik 2/2; frontend replicas initially on separate agents. With agent-0 stopped, its node became `NotReady`; after removing the pod stranded on the confirmed-stopped node, its replacement became Ready on the server, the other frontend stayed Ready on agent-1, and the ingress still returned `/` 200 and anonymous `/api/user/me` 401 on port 28081. Agent-0 was restarted and all three nodes returned to Ready. PVC stayed Bound as `pvc-3eff877b-dfa2-4a42-b5c8-3154a2535767`. | The replacement used the available server after explicit cleanup of the dead-node pod; this does not measure Kubernetes' default unreachable-node eviction delay. Local-path SQLite remains on the server and is not failed over. |
| Native K3s | Ubuntu 24.04 under WSL2, standalone K3s `v1.37.1+k3s1`, one server; ServiceLB disabled | Same Helm chart deployed; Core/frontend 1/1; PVC Bound (`RWO`); `/` 200 and anonymous `/api/user/me` 401 through a loopback Traefik port-forward; both Deployments restarted successfully; PVC volume ID stayed `pvc-f06fa078-3ece-4a5c-bf20-25214fd40563`; SQLite `PRAGMA integrity_check` returned `ok` before and after restart. | WSL2 is a VM on the same developer host, not an independent failure domain. The test used a loopback port-forward because native ServiceLB was disabled. |

Early resource baseline from the three-node k3d scheduler view: each node reported 4 vCPU; server allocatable memory was 2,097,483 KiB and each agent 805,306 KiB. Core requests/limits were 200m/1 CPU and 384/768 MiB; frontend requests/limits were 50m/300m CPU and 64/192 MiB. After the frontend replacement landed on the server, that server had combined application requests of 250m CPU/448 MiB and limits of 1,300m CPU/960 MiB. These are scheduler capacity and configured budgets, not observed runtime consumption. `metrics-server` is disabled in the local profiles, so `kubectl top` and utilization trends were not available.

The temporary native cluster used `/tmp/pymentor-native-k3s/storage` for local-path data and was stopped after the checks. Synthetic checks did not use production accounts or secrets.

A separate disposable namespace and SQLite PVC also verified the known inert C1.1.2 code submission through the local Ingress with the explicit Runner opt-in: login/cookie, catalog, lesson content, manual-practice answer, submission HTTP 200 with score 100, progress persistence, and logout all passed. The Core root filesystem stayed read-only; only the lock file used a 1 MiB memory-backed volume, and NetworkPolicy allowed DNS but no external egress. The namespace/PVC were deleted after the check. This proves the controlled local path works; it does not establish a sandbox or permit public execution. The retained `local-single` release still has `PYMENTOR_PUBLIC_RUNNER_ENABLED=0`.

The external listener check from the WSL host found only loopback `28080` (Ingress) and `26550` (K3s API). TCP probes to `5432`, `6379`, `8001`, `8002`, `8080`, and `9090` were refused; the namespace exposed only Core and Frontend `ClusterIP` Services. Through Ingress, `/api/docs` and `/api/openapi.json` returned 404, unauthenticated `/api/admin/users` and `/api/admin/overview` returned 401, while `/docs` and `/admin` returned the SPA fallback. A scan of the latest 200 Core log lines found no database URL or credential markers. These checks cover the local profile and do not establish a production perimeter.

## CI and release evidence (C1.4.3)

`.github/workflows/container-images.yml` runs backend compile/tests, builds both images with the commit SHA, runs the Docker smoke, lints/renders all four Helm profiles, verifies the local Runner opt-in and production rejection, then deploys the local-single chart into a disposable one-node k3d cluster. It checks Core/Frontend rollouts, `/` (200), unauthenticated `/api/user/me` (401), and the Bound SQLite PVC before deleting only that temporary cluster. The CI-only Helm override uses the commit tag; production profiles continue to require digest references.

The workflow uploads the packaged chart, rendered manifests, ephemeral Helm revision/manifest/values and image identities as a short-lived artifact. A successful push to the repository's default branch publishes SHA-tagged GHCR images and records their registry digests. This is artifact publication only: the workflow has no production deployment, DNS/TLS activation or data migration step. A deployment owner uses the explicit Helm upgrade/history/rollback commands above; the local failure rehearsal recorded a failed image revision followed by rollback without changing the PVC or SQLite rows. The workflow definition and local k3d path were checked on 2026-10-28; a GitHub-hosted Actions run is still required to produce CI logs and its uploaded artifact.

## Production profiles

`production-single-vps` and `future-production-ha` are lint/template-only in C1.3. They require deployment-specific hostnames, TLS Secrets, storage, and a separately approved production release. The future HA profile intentionally keeps Core at one replica while it uses SQLite; do not increase Core replicas until the database architecture supports multiple writers.
