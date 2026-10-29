#!/usr/bin/env bash

# Buildx images loaded into Docker need not have a registry RepoDigest. Give
# each local image a content-derived tag so a rebuild changes the Helm pod
# template and Kubernetes can use the image imported into each k3d node.
prepare_local_image_ref() {
  local source_image="$1" image_id repository reference
  if ! image_id="$(docker image inspect --format '{{.Id}}' "$source_image")"; then
    echo "Missing local image: $source_image. Run scripts/local-k3s/build-images.sh first." >&2
    return 1
  fi
  if [[ ! "$image_id" =~ ^sha256:[0-9a-f]{64}$ ]]; then
    echo "Invalid local image ID for $source_image: $image_id" >&2
    return 1
  fi
  repository="${source_image%:*}"
  reference="${repository}:c1.3-${image_id#sha256:}"
  docker tag "$source_image" "$reference" || return 1
  printf '%s\n' "$reference"
}
