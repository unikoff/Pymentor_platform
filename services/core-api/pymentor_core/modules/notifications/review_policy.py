"""Queue safety policy, independent of how an import review is stored."""

from dataclasses import dataclass


@dataclass(frozen=True)
class ReviewState:
    imported: bool
    available: bool = True
    unresolved: bool = False
    failed: bool = False


def enforce_review(state: ReviewState, *, for_retry=False):
    if not state.imported:
        return
    if not state.available:
        raise RuntimeError("imported_outbox_review_unavailable")
    if state.unresolved:
        raise RuntimeError("imported_outbox_review_required")
    if for_retry and state.failed:
        raise RuntimeError("imported_outbox_retry_requires_review")
