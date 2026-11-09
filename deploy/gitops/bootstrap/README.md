# PYM-496/497 preview bootstrap — PREPARED

Only preparation. No cluster connection, install, sync or VPS writes were performed. This is a single-node preview, not HA. The stated K3s 1.37.2, Traefik 3.7.15, memory and existing namespace are inputs, not live observations. Confirm actual compatibility of those Kubernetes, Argo CD and Rollouts versions with release documentation before installation.

## Inputs and safety

* Official Argo CD v3.6.1 namespace install: `argocd/upstream.yaml`, SHA-256 `310ff8e2cbef2c4b84dd8d353bddc4c9afcec551e62af30560b0aa80ff140382`.
* Official Rollouts v1.10.2 namespace install: `rollouts/upstream.yaml`, SHA-256 `e7836e21612034c1ae9ec175616c919b8295f29731f0767d5d608f2a0d727ef9`. It uses `latest`; the overlay pins `v1.10.2`. The three aggregated ClusterRoles are deleted by the overlay.
* CRDs are cluster-wide and installed separately by an admin from version-tagged Kustomize sources. Review rendered content and existing CRDs/owners first; do not overwrite shared CRDs blindly. Tags are not content hashes. Both controllers may affect existing CRs and workloads; check for existing controllers, conflicts and overlapping ownership first.
* Application-controller has explicitly limited pymentor Role. Its Argo CD control namespace upstream permissions are separate. The Rollouts pymentor Role is a copy of the official Role, which includes secret read and deployment update, pod eviction, and other permissions. Audit and trim against the actual preview before use; these are NOT Argo CD application-controller rights. Existing Role or RoleBinding name collisions must be resolved before apply.
* No local credentials included. `argocd-server` upstream is ClusterIP; no Ingress is created. The upstream may create an initial admin credential in-cluster: secure or disable admin through a separately reviewed access plan; ClusterIP is not authorization. Private repositories require separately provisioned credentials, never committed here.
* Application uses manual sync. The branch and path must be accessible to the repo-server; check the final rendered preview manifests and their ownership before any sync. AppProject permits only listed namespaced kinds and no cluster-scoped resources. Existing secrets/PVCs/deployments must not be in the application. ConfigMaps/Services/Jobs and Traefik objects can still affect real traffic and data indirectly.
* Rollouts is in `argo-rollouts-preview` but uses `--namespaced --namespace=pymentor`; the target RoleBinding points to its service account. It may reconcile existing Rollouts in pymentor, not only this preview. Verify no overlapping controller. TraefikService support requires correct CRDs and rollout configuration; no traffic behavior is verified here.
* Upstream resources are not sized for this host; no guessed requests/limits are assigned. Before install measure allocatable, current workload requests, actual usage, memory pressure and rollout surge. A <=6 GiB host and ~2.2 GiB reported usage do not prove headroom, nor does an absent metrics-server imply zero consumption.

## Before any separately authorized apply

Obtain explicit cluster context and validate API identity, namespace, owners, existing CRDs/controllers, version compatibility, backups/recovery, pod resource baseline, single-node capacity, traffic and downtime constraints. Use explicit `--context` and `--namespace`; do not switch current context. Confirm all preconditions and review `kubectl diff` and server-side dry-runs where feasible. Do not force CRD conflicts. Render and inspect using `kubectl kustomize` for each directory. CRD rendering requires network access to public GitHub and a compatible local git/kustomize.

Example order, AFTER review and separate authorization, with `$ctx` set to the verified context and working directory at bootstrap:

```powershell
# Cluster-scoped changes; review CRD ownership, conversions and rollback beforehand.
kubectl --context $ctx apply --server-side -k ./crds-argocd
kubectl --context $ctx apply --server-side -k ./crds-rollouts
# Create control namespaces only after checking they do not already exist.
kubectl --context $ctx create namespace argocd-preview
kubectl --context $ctx create namespace argo-rollouts-preview
kubectl --context $ctx --namespace argocd-preview apply -k ./argocd
kubectl --context $ctx --namespace pymentor apply -k ./rollouts-access
kubectl --context $ctx --namespace argo-rollouts-preview apply -k ./rollouts
# Inspect readiness and permissions first; then install project/app and Argo CD role.
kubectl --context $ctx --namespace argocd-preview apply -k ./app
```

Stop on failed apply, health degradation or timeout; do not continue. Confirm CRD Established, controller readiness, in-cluster destination discovery, actual controller RBAC and denied permissions (including secrets, PVCs and deployments for the Argo CD controller) with `kubectl auth can-i --as=system:serviceaccount:argocd-preview:argocd-application-controller` in pymentor. Verify RoleBinding subjects, pod and service endpoints, rollout logs, and actual Application repo/destination status before any sync. Cluster-level discovery/cache restrictions with namespace-only RBAC are unproven and may require additional narrowly reviewed configuration; do not grant cluster-admin as a shortcut. Do not print Secrets or credential data.

Recovery must be selected before installation: stop further sync and reconcile using the existing workload owner, restore traffic from the recorded baseline, and remove/revert only newly installed resources after understanding ownership and in-flight rollouts. Do not delete shared CRDs, PVCs, databases, or existing workloads as a rollback. Controller removal pauses reconciliation and does not undo application/data changes. Measure health, endpoints, errors/latency and storage integrity before and after if available.

Sources: https://github.com/argoproj/argo-cd/blob/v3.6.1/docs/operator-manual/installation.md ; https://github.com/argoproj/argo-rollouts/blob/v1.10.2/docs/installation.md ; https://github.com/argoproj/argo-rollouts/blob/v1.10.2/cmd/rollouts-controller/main.go
