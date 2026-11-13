"""Build and exercise the exact disposable canonical image/Compose contract."""
from pathlib import Path
import subprocess
import sys
from uuid import uuid4

ROOT = Path(__file__).resolve().parents[2]


def main():
    project = "knowi-local-ci-" + uuid4().hex[:12]
    command = ["docker", "compose", "-p", project, "-f", str(ROOT / "deploy/local-postgres-redis/compose.yaml")]
    def run(args, timeout=180):
        subprocess.run([*command, *args], cwd=ROOT, check=True, timeout=timeout)
    try:
        run(["up", "--build", "--wait", "--wait-timeout", "180", "core"], timeout=600)
        run(["run", "--rm", "--no-deps", "smoke"])
        run(["run", "--rm", "--no-deps", "worker"])
        subprocess.run([sys.executable, "scripts/ci/check_single_runtime.py", "--image", "knowi/core-local:pg06"],
                       cwd=ROOT, check=True, timeout=90)
    finally:
        subprocess.run([*command, "down", "--remove-orphans"], cwd=ROOT, check=True, timeout=90)


if __name__ == "__main__": main()
