"""One-shot synthetic session commit connection-fault experiment."""
import asyncio
import sys

from c232_sessions_e2e_probe import probe


if __name__ == '__main__':
    try:
        asyncio.run(probe(sys.argv[1], fault_mode='disconnect'))
    except Exception:
        print('BLOCKED: session disconnect experiment failed or ambiguous; quarantine lab')
        raise SystemExit(2)
