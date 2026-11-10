"""One-shot gate recovery experiment in a frozen synthetic migration lab."""

import asyncio
import sys

from tools.lab.c232_sessions_e2e_probe import probe


if __name__ == "__main__":
    try:
        asyncio.run(probe(sys.argv[1], test_gate_recovery=True))
    except Exception:
        print("BLOCKED: synthetic gate recovery failed or ambiguous; quarantine lab")
        raise SystemExit(2)
