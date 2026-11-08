"""Published booking operations; failures remain transport independent."""

from pymentor_core.shared.bindings import get_bindings
from .policy import (
    now_moscow,
    slot_has_ended,
    _month_bounds as month_bounds,
    serialize_slot_admin,
    serialize_slot_student,
)


def get_quota(*args, **kwargs):
    return get_bindings().bookings.get_quota(*args, **kwargs)


def add_quota(*args, **kwargs):
    return get_bindings().bookings.add_quota(*args, **kwargs)


def count_bookings_in_month(*args, **kwargs):
    return get_bindings().bookings.count_bookings_in_month(*args, **kwargs)


def get_quota_status(*args, **kwargs):
    return get_bindings().bookings.get_quota_status(*args, **kwargs)


def create_slot(*args, **kwargs):
    return get_bindings().bookings.create_slot(*args, **kwargs)


def delete_slot(*args, **kwargs):
    return get_bindings().bookings.delete_slot(*args, **kwargs)


def list_slots_for_month_admin(*args, **kwargs):
    return get_bindings().bookings.list_slots_for_month_admin(*args, **kwargs)


def list_bookable_slots(*args, **kwargs):
    return get_bindings().bookings.list_bookable_slots(*args, **kwargs)


def book_slot(*args, **kwargs):
    return get_bindings().bookings.book_slot(*args, **kwargs)


def cancel_booking(*args, **kwargs):
    return get_bindings().bookings.cancel_booking(*args, **kwargs)
