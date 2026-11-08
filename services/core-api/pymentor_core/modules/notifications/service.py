"""Public notification service port."""

from pymentor_core.shared.bindings import get_bindings


def drain_notifications(*args, **kwargs):
    return get_bindings().notifications.drain_notifications(*args, **kwargs)


def queue_stats(*args, **kwargs):
    return get_bindings().notifications.queue_stats(*args, **kwargs)


def retry_failed(*args, **kwargs):
    return get_bindings().notifications.retry_failed(*args, **kwargs)


def verify_telegram_destination(*args, **kwargs):
    return get_bindings().telegram.verify_telegram_destination(*args, **kwargs)
