"""Local images need stable references even when Docker has no RepoDigests."""

import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest


LOCAL_K3S = Path(__file__).resolve().parents[1]
HELPER = LOCAL_K3S / "local-image-refs.sh"


def bash_executable():
    if os.name == "nt":
        git_bash = Path(os.environ.get("ProgramFiles", "C:/Program Files")) / "Git/bin/bash.exe"
        if git_bash.exists():
            return str(git_bash)
    return shutil.which("bash")


class LocalImageReferenceTests(unittest.TestCase):
    def prepare(self, image_id, *, fail_tag=False):
        image = "pymentor/core-api:c1.3-local"
        with tempfile.TemporaryDirectory(prefix="pymentor-image-ref-") as tmp:
            log = Path(tmp) / "docker.log"
            env = dict(
                os.environ,
                FAKE_IMAGE_ID=image_id,
                FAKE_DOCKER_LOG=log.as_posix(),
                FAKE_FAIL_TAG="1" if fail_tag else "0",
            )
            shell = r'''
docker() {
  if [[ "$1" == image && "$2" == inspect ]]; then
    [[ "$3" == --format && "$4" == '{{.Id}}' ]] || return 2
    printf '%s\n' "$FAKE_IMAGE_ID"
  elif [[ "$1" == tag ]]; then
    [[ "$FAKE_FAIL_TAG" == 0 ]] || return 3
    printf '%s -> %s\n' "$2" "$3" >> "$FAKE_DOCKER_LOG"
  else
    return 2
  fi
}
source "$1"
prepare_local_image_ref "$2"
'''
            result = subprocess.run(
                [bash_executable(), "-c", shell, "test", HELPER.as_posix(), image],
                env=env,
                capture_output=True,
                text=True,
                timeout=30,
            )
            return result, log.read_text(encoding="utf-8").strip() if log.exists() else ""

    @unittest.skipUnless(bash_executable(), "bash is required")
    def test_locally_built_image_without_repository_digest_gets_content_tag(self):
        expected = "pymentor/core-api:c1.3-" + "a" * 64
        result, tagged = self.prepare("sha256:" + "a" * 64)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout.strip(), expected)
        self.assertEqual(tagged, f"pymentor/core-api:c1.3-local -> {expected}")

    @unittest.skipUnless(bash_executable(), "bash is required")
    def test_rebuilt_image_gets_a_different_reference(self):
        first, _ = self.prepare("sha256:" + "a" * 64)
        second, _ = self.prepare("sha256:" + "b" * 64)
        self.assertEqual(first.returncode, 0, first.stderr)
        self.assertEqual(second.returncode, 0, second.stderr)
        self.assertNotEqual(first.stdout.strip(), second.stdout.strip())

    @unittest.skipUnless(bash_executable(), "bash is required")
    def test_invalid_image_id_does_not_create_a_reference(self):
        result, tagged = self.prepare("sha256:not-a-valid-image-id")
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(result.stdout.strip(), "")
        self.assertEqual(tagged, "")

    @unittest.skipUnless(bash_executable(), "bash is required")
    def test_docker_tag_failure_does_not_return_a_reference(self):
        result, tagged = self.prepare("sha256:" + "a" * 64, fail_tag=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(result.stdout.strip(), "")
        self.assertEqual(tagged, "")

    @unittest.skipUnless(bash_executable(), "bash is required")
    def test_missing_local_image_stops_before_creating_a_cluster(self):
        with tempfile.TemporaryDirectory(prefix="pymentor-cluster-preflight-") as tmp:
            log = Path(tmp) / "mutations.log"
            env = dict(os.environ, FAKE_MUTATION_LOG=log.as_posix())
            shell = r'''
docker() {
  case "$1" in
    info|buildx) return 0 ;;
    image) return 1 ;;
    *) printf 'docker %s\n' "$*" >> "$FAKE_MUTATION_LOG" ;;
  esac
}
k3d() {
  if [[ "$1" == version ]]; then printf 'k3d version v5.9.0\n';
  else printf 'k3d %s\n' "$*" >> "$FAKE_MUTATION_LOG"; fi
}
helm() { printf 'v4.3.1\n'; }
kubectl() { printf '{"clientVersion":{"gitVersion":"v1.37.1"}}\n'; }
python3() { printf 'v1.37.1\n'; }
ctr() { return 0; }
source "$1" create local-single
'''
            result = subprocess.run(
                [bash_executable(), "-c", shell, "test", (LOCAL_K3S / "cluster.sh").as_posix()],
                env=env,
                capture_output=True,
                text=True,
                timeout=30,
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Missing local image", result.stderr)
            self.assertFalse(log.exists(), "cluster or image mutation happened before preflight")


if __name__ == "__main__":
    unittest.main()
