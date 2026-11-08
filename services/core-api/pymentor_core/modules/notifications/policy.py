"""Transport-independent notification retry policy."""

from collections.abc import Callable

MAX_ATTEMPTS = 8
MAX_BATCH_SIZE = 20
RUN_BUDGET_SECONDS = 45.0
LEASE_SECONDS = 60
SENT_RETENTION_DAYS = 30
MAX_PRUNED_PER_RUN = 500
BACKOFF_SECONDS = (60, 120, 300, 900, 1800, 3600, 3600, 3600)


def retry_delay(
    attempt: int, retry_after: int | None, randint: Callable[[int, int], int]
) -> int:
    if retry_after is not None:
        base = retry_after
    else:
        base = BACKOFF_SECONDS[min(max(attempt - 1, 0), len(BACKOFF_SECONDS) - 1)]
    return base + randint(0, max(1, min(30, base // 10)))
