"""One-shot synthetic session rollback and explicit-ID retry experiment."""

import asyncio
import sys

from tools.lab.c232_sessions_e2e_probe import probe


if __name__ == "__main__":
    try:
        asyncio.run(probe(sys.argv[1], fault_mode="before_commit"))
    except Exception:
        print(
            "BLOCKED: session rollback experiment failed or ambiguous; quarantine lab"
        )
        raise SystemExit(2)
