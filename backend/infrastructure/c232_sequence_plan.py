"""Conservative sequence arithmetic for a future synthetic-only importer.

This module performs no SQL and does not lock or alter a sequence. Callers
must establish ownership, identify the sequence and exclude all concurrent
users before trusting a plan; cached values from other sessions are unsafe.
"""


def next_restart_value(*, last_value, is_called, max_id, increment, minimum,
                       maximum, cache, cycle):
    """Return a non-rewinding candidate next ID, or reject uncertain states."""
    numbers = (last_value, increment, minimum, maximum, cache)
    if (any(type(value) is not int for value in numbers)
            or type(is_called) is not bool or type(cycle) is not bool
            or (max_id is not None and type(max_id) is not int)
            or increment != 1 or minimum != 1 or cache != 1 or cycle
            or maximum < minimum or not minimum <= last_value <= maximum
            or (max_id is not None and not minimum <= max_id <= maximum)):
        raise ValueError('Invalid sequence state')
    current_next = last_value + int(is_called)
    imported_next = minimum if max_id is None else max_id + 1
    candidate = max(current_next, imported_next)
    if candidate > maximum:
        raise ValueError('Invalid sequence state')
    return candidate
