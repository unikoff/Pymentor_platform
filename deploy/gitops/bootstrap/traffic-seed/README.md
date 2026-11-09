# Rollouts traffic seed — create once

These two TraefikServices belong to the Rollouts traffic controller, not the Argo CD Application. Argo CD is explicitly denied writing them. Traefik CRD service lists were overwritten by full app sync during acceptance; separating ownership avoids that conflict rather than ignoring it.

On a fresh test cluster, create these objects after their stable/canary Kubernetes Services are planned and before public routing is enabled. Do not blindly apply a seed during an active canary: it resets weights. For the existing cluster, they were retained with prune=false, detached from Argo tracking and verified at stable100/canary0. No running object was deleted.

```sh
k3s kubectl --context default create -k deploy/gitops/bootstrap/traffic-seed
```

If either object already exists, inspect its rollout owner and stable/canary selectors instead of overwriting it. Wire changes are infrastructure changes; ordinary image releases need no seed apply. Rollouts remains responsible for subsequent traffic weights and abort.
