#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root"

build_root="$(mktemp -d)"
trap 'rm -rf -- "$build_root"' EXIT
mkdir -p "$build_root/backend" "$build_root/frontend"

# Stage a clean context on WSL's Linux filesystem. This avoids traversing
# permission-protected Windows pytest cache directories and excludes local
# env files, SQLite data, caches, and generated frontend output.
tar -C backend \
  --exclude=.pytest_cache --exclude='.pytest-tmp*' \
  --exclude=.env --exclude='.env.*' \
  --exclude='*.db*' --exclude='*.sqlite*' \
  --exclude=.venv --exclude='*/.venv' \
  --exclude=tests --exclude='*/tests' \
  --exclude=__pycache__ --exclude='*/__pycache__' \
  -cf - . | tar -C "$build_root/backend" -xf -
tar -C frontend \
  --exclude=.pytest_cache --exclude='.pytest-tmp*' \
  --exclude=.env --exclude='.env.*' \
  --exclude='*.db*' --exclude='*.sqlite*' \
  --exclude=node_modules --exclude='*/node_modules' \
  --exclude=dist --exclude='*/dist' \
  --exclude=output --exclude='*/output' \
  --exclude=.vite --exclude='*/.vite' \
  --exclude=tests --exclude='*/tests' \
  --exclude=__pycache__ --exclude='*/__pycache__' \
  -cf - . | tar -C "$build_root/frontend" -xf -

docker buildx build --platform linux/amd64 --provenance=false --sbom=false \
  --output=type=docker \
  -f "$build_root/backend/Dockerfile" \
  -t pymentor/core-api:c1.3-local "$build_root/backend"
if [[ "${BUILD_FRONTEND:-1}" == "1" ]]; then
  docker buildx build --platform linux/amd64 --provenance=false --sbom=false \
    --output=type=docker \
    -f "$build_root/frontend/Dockerfile" \
    -t pymentor/frontend:c1.3-local "$build_root/frontend"
else
  docker image inspect pymentor/frontend:c1.2-local >/dev/null || {
    echo "Missing C1.2 frontend image; build frontend after resolving its current TypeScript error, or set BUILD_FRONTEND=1." >&2
    exit 1
  }
  docker tag pymentor/frontend:c1.2-local pymentor/frontend:c1.3-local
fi

printf '\nPinned local repository digests for deploy/helm/pymentor/values.yaml:\n'
docker image inspect pymentor/core-api:c1.3-local pymentor/frontend:c1.3-local \
  --format '{{.RepoTags}} {{range .RepoDigests}}{{.}} {{end}}'
