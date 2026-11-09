# Preview bootstrap — installed and exercised 2026-11-09

Scope: test VPS knowi01 / 13.140.29.11 only. Main runbook and acceptance: [docs/cicd](../../../docs/cicd/README.md). This stack does not provision a new VPS, PostgreSQL/Redis/PVCs, runtime/TLS secrets, gVisor, sandbox admission policies or the runner service account. Those already existed in the test cluster; a complete bare-host restore has not been rehearsed here.

- Argo CD v3.6.1 namespace install, upstream SHA256 `310ff8e2cbef2c4b84dd8d353bddc4c9afcec551e62af30560b0aa80ff140382`.
- Rollouts v1.10.2 namespace install, upstream SHA256 `e7836e21612034c1ae9ec175616c919b8295f29731f0767d5d608f2a0d727ef9`. Overlay pins controller version and removes aggregated ClusterRoles.
- Runtime observed: K3s v1.37.2+k3s1, Traefik 3.7.15, single node. Controllers are private ClusterIP services; Argo CD admin disabled. Resources sized in overlays.
- Argo CD is limited to `pymentor`; AppProject permits the declared namespaced kinds and no cluster resources. Direct Secret reads/PVC deletion are denied. Creating application workloads remains a trusted privilege and can indirectly access namespace secrets: protect Git writers and controller identities.
- Rollouts owns Service selectors/Traefik weights. Application ignores just those paths for comparison. Services use ServerSideApply with client-side migration disabled, leaving runtime fields with Rollouts. Argo owns desired templates and routes. Prune is off; self-heal and auto-sync are on.
- The controller sync timeout is 600 seconds, replacing the upstream unlimited default. A failed Rollout can leave a sync waiting for health; terminate that exact failed operation before an urgent Git revert is reconciled. This was exercised in the abort drill. The timeout value was verified in controller environment; waiting for the full timeout was not separately tested.

Reproduce only against a verified target/context with pre-existing resources checked. Render each directory and use server-side dry-run. CRDs are cluster scoped and admin-installed separately: never delete/recreate shared CRDs or force ownership conflicts as a shortcut.

```sh
k3s kubectl --context default apply --server-side -k deploy/gitops/bootstrap/crds-argocd
k3s kubectl --context default apply --server-side -k deploy/gitops/bootstrap/crds-rollouts
# After creating/confirming the two control namespaces:
k3s kubectl --context default -n argocd-preview apply -k deploy/gitops/bootstrap/argocd
k3s kubectl --context default -n pymentor apply -k deploy/gitops/bootstrap/rollouts-access
k3s kubectl --context default -n argo-rollouts-preview apply -k deploy/gitops/bootstrap/rollouts
# This contains explicit mixed namespaces, so do not supply -n:
k3s kubectl --context default apply -k deploy/gitops/bootstrap/app
```

Check controller readiness, role subjects, denied permissions, repo access, Application Synced/Healthy and actual routes before claiming completion. Updating cmd-params requires restarting the application-controller StatefulSet to reload its environment. Stop on errors; do not continue blindly. Removing a controller does not roll back application data or traffic.

Primary sources: [Argo CD installation](https://github.com/argoproj/argo-cd/blob/v3.6.1/docs/operator-manual/installation.md), [Rollouts installation](https://github.com/argoproj/argo-rollouts/blob/v1.10.2/docs/installation.md), [sync timeout](https://github.com/argoproj/argo-cd/blob/v3.6.1/docs/operator-manual/argocd-cmd-params-cm.yaml).
