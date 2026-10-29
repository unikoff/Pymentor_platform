#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
chart_dir="$repo_root/deploy/helm/pymentor"
versions="$repo_root/scripts/local-k3s/tool-versions.env"
# This file contains fixed public version strings only.
# shellcheck disable=SC1090
source "$versions"
# shellcheck disable=SC1091
source "$repo_root/scripts/local-k3s/local-image-refs.sh"

usage() {
  echo "Usage: bash scripts/local-k3s/cluster.sh {create|start|stop|status|delete} {local-single|local-multinode}" >&2
  exit 2
}

[[ $# -eq 2 ]] || usage
action="$1"
profile="$2"

case "$profile" in
  local-single)
    cluster="pymentor-local-single"
    context="k3d-${cluster}"
    agents=0
    api_port=26550
    http_port=28080
    values_file="$chart_dir/values-local-single.yaml"
    ;;
  local-multinode)
    cluster="pymentor-local-multinode"
    context="k3d-${cluster}"
    agents=2
    api_port=26551
    http_port=28081
    values_file="$chart_dir/values-local-multinode.yaml"
    ;;
  *) usage ;;
esac

require_tools() {
  for tool in docker k3d kubectl helm ctr; do
    command -v "$tool" >/dev/null || { echo "Missing required CLI: $tool" >&2; exit 1; }
  done
  docker info >/dev/null
  docker buildx version >/dev/null
  grep -Fq "k3d version ${K3D_VERSION}" < <(k3d version)
  [[ "$(helm version --template '{{.Version}}')" == "$HELM_VERSION" ]]
  [[ "$(kubectl version --client --output=json | python3 -c 'import json,sys; print(json.load(sys.stdin)["clientVersion"]["gitVersion"])')" == "$KUBECTL_VERSION" ]]
}

cluster_state() {
  k3d cluster list -o json | python3 -c '
import json, sys
clusters = json.load(sys.stdin)
cluster = next((item for item in clusters if item.get("name") == sys.argv[1]), None)
if cluster is None:
    print("absent")
else:
    nodes = cluster.get("nodes", [])
    print("running" if nodes and all(node.get("State", {}).get("Running") for node in nodes) else "stopped")
' "$cluster"
}

case "$action" in
  create)
    require_tools
    # Validate and tag locally built images before creating or resuming a cluster.
    core_ref="$(prepare_local_image_ref pymentor/core-api:c1.3-local)"
    frontend_ref="$(prepare_local_image_ref pymentor/frontend:c1.3-local)"
    docker pull --platform linux/amd64 "$K3S_LOCAL_PATH_IMAGE"
    if [[ "$(cluster_state)" != absent ]]; then
      echo "Resuming bootstrap for existing cluster: $cluster"
      if [[ "$(cluster_state)" != running ]]; then
        k3d cluster start "$cluster" --wait --timeout 15m
      fi
    else
      for port in "$api_port" "$http_port"; do
        if ss -H -ltn "sport = :$port" | grep -q .; then
          echo "Host port already in use: $port" >&2
          exit 1
        fi
      done

      create_args=(
        cluster create "$cluster"
        --image "rancher/k3s:${K3S_VERSION}"
        --k3s-arg "--disable=metrics-server@server:*"
        --servers 1
        --agents "$agents"
        --servers-memory 2g
        --agents-memory 768m
        --api-port "127.0.0.1:${api_port}"
        --port "127.0.0.1:${http_port}:80@loadbalancer"
        --k3s-node-label "pymentor-role=server@server:0"
        --kubeconfig-update-default=false
        --wait
        --timeout 15m
      )
      if [[ "$agents" -eq 2 ]]; then
        create_args+=(--k3s-node-label "pymentor-role=agent@agent:0,1")
      fi
      k3d "${create_args[@]}"
    fi
    k3d kubeconfig merge "$cluster" --kubeconfig-merge-default --kubeconfig-switch-context=false
    klipper_image=""
    for attempt in {1..60}; do
      klipper_image="$(kubectl --context "$context" -n kube-system get helmchart traefik -o jsonpath='{.spec.jobImage}' 2>/dev/null || true)"
      if [[ -z "$klipper_image" ]]; then
        klipper_image="$(kubectl --context "$context" -n kube-system get job helm-install-traefik -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null || true)"
      fi
      [[ -n "$klipper_image" ]] && break
      sleep 2
    done
    [[ -n "$klipper_image" ]] || {
      echo "K3s HelmChart traefik did not publish its job image" >&2
      exit 1
    }
    qualified_klipper_image="docker.io/${klipper_image#docker.io/}"
    docker pull --platform linux/amd64 "$K3S_LOCAL_PATH_IMAGE"
    for system_image in "${K3S_SYSTEM_IMAGES[@]}"; do
      if ! docker image inspect "$system_image" >/dev/null 2>&1; then
        mirror_image="mirror.gcr.io/$system_image"
        if docker pull --platform linux/amd64 "$mirror_image"; then
          docker tag "$mirror_image" "$system_image"
        else
          docker pull --platform linux/amd64 "$system_image"
        fi
      fi
    done
    traefik_values="$(kubectl --context "$context" -n kube-system get helmchart traefik -o jsonpath='{.spec.valuesContent}')"
    traefik_tag="$(sed -n 's/^[[:space:]]*tag: "\(.*\)"$/\1/p' <<< "$traefik_values" | head -n 1)"
    traefik_original_repository="$(sed -n 's/^[[:space:]]*repository: "\(.*\)"$/\1/p' <<< "$traefik_values" | head -n 1)"
    traefik_image_repository="$(sed -n 's/^[[:space:]]*imageRepository: //p' "$chart_dir/values.yaml" | head -n 1)"
    [[ -n "$traefik_tag" && -n "$traefik_original_repository" && -n "$traefik_image_repository" ]] || {
      echo "Could not resolve the pinned Traefik image tag or local repository" >&2
      exit 1
    }
    [[ "$traefik_tag" == "$K3S_TRAEFIK_VERSION" ]] || {
      echo "K3s Traefik version $traefik_tag does not match pinned binary $K3S_TRAEFIK_VERSION" >&2
      exit 1
    }
    traefik_tag="$K3S_TRAEFIK_VERSION"
    qualified_traefik_image="$(sed -n 's/^[[:space:]]*imageRepository: //p' "$chart_dir/values.yaml" | head -n 1)"
    traefik_image="$qualified_traefik_image:$traefik_tag"
    klipper_context="$(mktemp -d)"
    trap 'rm -rf -- "$klipper_context"' EXIT
    for index in "${!K3S_SYSTEM_IMAGES[@]}"; do
      system_image="${K3S_SYSTEM_IMAGES[$index]}"
      system_normalized_tag="${K3S_SYSTEM_NORMALIZED_TAGS[$index]}"
      printf 'FROM %s\n' "$system_image" > "$klipper_context/Dockerfile"
      docker buildx build --platform linux/amd64 --provenance=false --sbom=false \
        --output=type=docker --file "$klipper_context/Dockerfile" \
        --tag "$system_normalized_tag" "$klipper_context"
    done
    traefik_normalized_tag="pymentor/traefik-local:$traefik_tag"
    if ! docker image inspect "$traefik_image" >/dev/null 2>&1; then
      release_url="https://github.com/traefik/traefik/releases/download/v$traefik_tag/traefik_v${traefik_tag}_linux_amd64.tar.gz"
      if command -v aria2c >/dev/null; then
        aria2c --quiet=true --file-allocation=none --split=8 \
          --max-connection-per-server=8 --min-split-size=1M \
          --dir="$klipper_context" --out=traefik.tar.gz "$release_url"
      else
        curl --fail --location --silent --show-error --retry 3 --retry-all-errors \
          --max-time 900 "$release_url" --output "$klipper_context/traefik.tar.gz"
      fi
      printf '%s  %s\n' "$K3S_TRAEFIK_LINUX_AMD64_SHA256" "$klipper_context/traefik.tar.gz" \
        | sha256sum --check --status || {
        echo "Official Traefik release checksum did not match" >&2
        exit 1
      }
      tar -xzf "$klipper_context/traefik.tar.gz" -C "$klipper_context" traefik
      cat > "$klipper_context/Dockerfile" <<'EOF'
FROM scratch
COPY traefik /usr/local/bin/traefik
USER 65532:65532
ENTRYPOINT ["/usr/local/bin/traefik"]
EOF
      docker buildx build --platform linux/amd64 --provenance=false --sbom=false \
        --output=type=docker --file "$klipper_context/Dockerfile" \
        --tag "$traefik_normalized_tag" "$klipper_context"
    fi
    for image in "$K3S_LOCAL_PATH_IMAGE" pymentor/core-api:c1.3-local pymentor/frontend:c1.3-local; do
      if ! docker image inspect "$image" >/dev/null 2>&1; then
        docker pull --platform linux/amd64 "$image"
      fi
    done
    if ! docker image inspect "$qualified_klipper_image" >/dev/null 2>&1; then
      docker pull --platform linux/amd64 "$qualified_klipper_image"
    fi
    node_images=(
      "$K3S_LOCAL_PATH_IMAGE"
      "${K3S_SYSTEM_IMAGES[@]}"
      "${K3S_SYSTEM_NORMALIZED_TAGS[@]}"
      "$qualified_klipper_image"
      "$traefik_normalized_tag"
      "$core_ref"
      "$frontend_ref"
    )
    node_images_archive="$klipper_context/pymentor-node-images.tar"
    docker save --output "$node_images_archive" "${node_images[@]}"
    while read -r node; do
      [[ -n "$node" ]] || continue
      # k3d image import may report success while omitting descriptors; use one checked Docker archive per node instead.
      docker cp "$node_images_archive" "$node:/tmp/pymentor-node-images.tar" >/dev/null
      docker cp "$(command -v ctr)" "$node:/tmp/pymentor-ctr" >/dev/null
      docker cp /lib/x86_64-linux-gnu/libc.so.6 "$node:/tmp/libc.so.6" >/dev/null
      docker cp /lib/x86_64-linux-gnu/ld-linux-x86-64.so.2 "$node:/tmp/pymentor-ld-linux.so.2" >/dev/null
      node_image_import_log="$klipper_context/${node}-image-import.log"
      if ! docker exec "$node" /tmp/pymentor-ld-linux.so.2 --library-path /tmp /tmp/pymentor-ctr \
        --address /run/k3s/containerd/containerd.sock --namespace k8s.io images import \
        /tmp/pymentor-node-images.tar >"$node_image_import_log" 2>&1; then
        cat "$node_image_import_log" >&2
        exit 1
      fi
      for index in "${!K3S_SYSTEM_IMAGES[@]}"; do
        docker exec "$node" /tmp/pymentor-ld-linux.so.2 --library-path /tmp /tmp/pymentor-ctr \
          --address /run/k3s/containerd/containerd.sock --namespace k8s.io images tag \
          "docker.io/${K3S_SYSTEM_NORMALIZED_TAGS[$index]}" \
          "docker.io/${K3S_SYSTEM_IMAGES[$index]}"
      done
      docker exec "$node" /tmp/pymentor-ld-linux.so.2 --library-path /tmp /tmp/pymentor-ctr \
        --address /run/k3s/containerd/containerd.sock --namespace k8s.io images tag \
        "docker.io/$traefik_normalized_tag" "$qualified_traefik_image:$traefik_tag"
      docker exec "$node" crictl inspecti "$qualified_klipper_image" >/dev/null
      docker exec "$node" crictl inspecti "$K3S_LOCAL_PATH_IMAGE" >/dev/null
      docker exec "$node" crictl inspecti "docker.io/$core_ref" >/dev/null
      docker exec "$node" crictl inspecti "docker.io/$frontend_ref" >/dev/null
      for image in "${K3S_SYSTEM_IMAGES[@]}"; do
        docker exec "$node" crictl inspecti "docker.io/${image#docker.io/}" >/dev/null
      done
      docker exec "$node" rm -f /tmp/pymentor-node-images.tar /tmp/pymentor-ctr /tmp/libc.so.6 /tmp/pymentor-ld-linux.so.2
    done < <(k3d node list --no-headers | awk -v target="$cluster" '$3 == target && $2 != "loadbalancer" {print $1}')
    # K3s may start pulling these add-ons before local images are imported.
    # Replace any early pull attempts so their pods consume the normalized local aliases.
    kubectl --context "$context" -n kube-system delete pods -l k8s-app=kube-dns \
      --ignore-not-found --grace-period=0 --force --wait=false
    kubectl --context "$context" -n kube-system rollout status deployment/coredns --timeout=180s
    helm_job_patch="{\"spec\":{\"jobImage\":\"$qualified_klipper_image\"}}"
    traefik_values="$(printf '%s' "$traefik_values" | sed "s|repository: \"$traefik_original_repository\"|repository: \"$qualified_traefik_image\"|")"
    traefik_values_patch="$(printf '%s' "$traefik_values" | python3 -c 'import json,sys; print(json.dumps({"spec":{"valuesContent":sys.stdin.read()}}))')"
    kubectl --context "$context" -n kube-system patch helmchart traefik \
      --type=merge --patch="$traefik_values_patch"
    for chart in gateway-api-crd traefik-crd traefik; do
      kubectl --context "$context" -n kube-system patch helmchart "$chart" \
        --type=merge --patch="$helm_job_patch"
      kubectl --context "$context" -n kube-system delete job "helm-install-$chart" \
        --ignore-not-found --wait=false
    done
    # Preserve the upstream tag: a locally synthesized manifest digest is not pullable from Docker Hub.
    kubectl --context "$context" -n kube-system set image \
      deployment/local-path-provisioner \
      "local-path-provisioner=$K3S_LOCAL_PATH_IMAGE"
    kubectl --context "$context" -n kube-system rollout status \
      deployment/local-path-provisioner --timeout=180s
    kubectl --context "$context" wait --for=condition=Ready nodes --all --timeout=180s
    for attempt in {1..60}; do
      kubectl --context "$context" get deployment/traefik -n kube-system >/dev/null 2>&1 && break
      sleep 2
    done
    kubectl --context "$context" get deployment/traefik -n kube-system >/dev/null
    kubectl --context "$context" rollout status deployment/traefik -n kube-system --timeout=240s

    # The app images above are imported directly from the local Docker engine.
    kubectl --context "$context" get namespace pymentor >/dev/null 2>&1 \
      || kubectl --context "$context" create namespace pymentor
    kubectl --context "$context" -n pymentor create secret generic pymentor-runtime \
      --from-literal=DATABASE_URL='sqlite:////data/pymentor.sqlite3' \
      --dry-run=client -o yaml | kubectl --context "$context" apply -f -
    helm upgrade --install pymentor "$chart_dir" \
      --kube-context "$context" --namespace pymentor --create-namespace \
      --values "$values_file" \
      --set images.core.digest=null --set-string "images.core.tag=${core_ref##*:}" \
      --set images.frontend.digest=null --set-string "images.frontend.tag=${frontend_ref##*:}" \
      --wait --timeout 8m
    kubectl --context "$context" rollout status deployment/traefik -n kube-system --timeout=240s
    kubectl --context "$context" rollout status deployment/pymentor-core -n pymentor --timeout=240s
    kubectl --context "$context" rollout status deployment/pymentor-frontend -n pymentor --timeout=240s
    printf 'URL: http://pymentor.localhost:%s/\nContext: %s\n' "$http_port" "$context"
    ;;
  status)
    state="$(cluster_state)"
    if [[ "$state" != running ]]; then
      echo "Cluster state: $state. Run 'bash scripts/local-k3s/cluster.sh start $profile' before querying Kubernetes resources."
      exit 0
    fi
    kubectl --context "$context" get nodes -o wide
    kubectl --context "$context" -n pymentor get deployment,pod,service,ingressroute,pvc,networkpolicy
    ;;
  start)
    command -v k3d >/dev/null || { echo "Missing required CLI: k3d" >&2; exit 1; }
    state="$(cluster_state)"
    [[ "$state" != absent ]] || { echo "Cluster does not exist: $cluster" >&2; exit 1; }
    if [[ "$state" != running ]]; then
      k3d cluster start "$cluster" --wait --timeout 15m
    fi
    k3d kubeconfig merge "$cluster" --kubeconfig-merge-default --kubeconfig-switch-context=false
    kubectl --context "$context" wait --for=condition=Ready nodes --all --timeout=180s
    ;;
  stop)
    command -v k3d >/dev/null || { echo "Missing required CLI: k3d" >&2; exit 1; }
    state="$(cluster_state)"
    [[ "$state" != absent ]] || { echo "Cluster does not exist: $cluster" >&2; exit 1; }
    if [[ "$state" == running ]]; then
      k3d cluster stop "$cluster"
    else
      echo "Cluster is already stopped: $cluster"
    fi
    ;;
  delete)
    if [[ "$(cluster_state)" != absent ]]; then
      k3d cluster delete "$cluster"
    else
      echo "Cluster is already absent: $cluster"
    fi
    ;;
  *) usage ;;
esac
