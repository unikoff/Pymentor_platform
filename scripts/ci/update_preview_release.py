"""Update only the fixed preview GitOps release files with immutable image digests."""
import argparse
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2] / 'deploy/gitops/preview'
IMAGES = {
    'pymentor/core-api': 'ghcr.io/unikoff/pymentor-platform-core',
    'pymentor/frontend': 'ghcr.io/unikoff/pymentor-platform-frontend',
    'pymentor/preview-pool': 'ghcr.io/unikoff/pymentor-platform-runner-pool',
}
RESOURCES = {'applications.json', 'checks.json', 'analysis.json', 'routes.json', 'runner.json'}


def update(directory, source_sha, core_digest, frontend_digest, runner_digest):
    if not re.fullmatch(r'[0-9a-f]{40}', source_sha):
        raise ValueError('source SHA must be 40 lowercase hexadecimal characters')
    digests = (core_digest, frontend_digest, runner_digest)
    if any(not re.fullmatch(r'sha256:[0-9a-f]{64}', d) for d in digests):
        raise ValueError('digests must be lowercase sha256 digests')
    directory = Path(directory)

    def path(name):
        if name not in RESOURCES | {'kustomization.yaml', 'release.json'}:
            raise ValueError('unknown preview file')
        result = directory / name
        if result.is_symlink():
            raise ValueError('symlinked preview file rejected')
        return result

    def load(name):
        return json.loads(path(name).read_text(encoding='utf-8'))

    kustomization = load('kustomization.yaml')
    resources = kustomization.get('resources')
    if (not isinstance(resources, list) or 'applications.json' not in resources
            or any(not isinstance(item, str) or item not in RESOURCES for item in resources)
            or len(resources) != len(set(resources))):
        raise ValueError('unknown or duplicate preview resource')
    existing_images = kustomization.get('images', [])
    if not isinstance(existing_images, list):
        raise ValueError('invalid image mappings')
    seen = set()
    for entry in existing_images:
        if not isinstance(entry, dict) or entry.get('name') not in IMAGES:
            raise ValueError('unknown image mapping')
        name = entry['name']
        if name in seen or entry.get('newName', IMAGES[name]) != IMAGES[name]:
            raise ValueError('duplicate or unexpected image mapping')
        seen.add(name)
    kustomization['images'] = [dict(name=name, newName=target, digest=digest)
                               for (name, target), digest in zip(IMAGES.items(), digests)]

    changed = {'kustomization.yaml': kustomization}
    for filename, kind in (('applications.json', 'Rollout'), ('runner.json', 'Deployment')):
        if filename not in resources:
            continue
        document = load(filename)
        items = document.get('items') if document.get('kind') == 'List' else [document]
        if not isinstance(items, list):
            raise ValueError('invalid resource list')
        workloads = [item for item in items if isinstance(item, dict) and item.get('kind') == kind]
        if not workloads:
            raise ValueError(f'{filename} has no {kind}')
        for workload in workloads:
            template = workload['spec']['template']
            template.setdefault('metadata', {}).setdefault('annotations', {})['pymentor.io/source-revision'] = source_sha
            containers = template['spec']['containers']
            if not containers:
                raise ValueError('workload has no containers')
            for container in containers:
                env = container.setdefault('env', [])
                revisions = [entry for entry in env if entry.get('name') == 'PYMENTOR_RELEASE_REVISION']
                if len(revisions) > 1:
                    raise ValueError('duplicate revision environment variable')
                if revisions:
                    revisions[0].clear()
                    revisions[0].update(name='PYMENTOR_RELEASE_REVISION', value=source_sha)
                else:
                    env.append(dict(name='PYMENTOR_RELEASE_REVISION', value=source_sha))
        changed[filename] = document
    changed['release.json'] = dict(source_sha=source_sha, core_digest=core_digest,
                                   frontend_digest=frontend_digest, runner_digest=runner_digest)
    # Validate all target paths before the first write.
    for name in changed:
        path(name)
    for name, document in changed.items():
        path(name).write_text(json.dumps(document, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ('source-sha', 'core-digest', 'frontend-digest', 'runner-digest'):
        parser.add_argument('--' + name, required=True)
    args = parser.parse_args()
    update(ROOT, args.source_sha, args.core_digest, args.frontend_digest, args.runner_digest)


if __name__ == '__main__':
    main()
