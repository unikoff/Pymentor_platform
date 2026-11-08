"""Synthetic local oracle for a proposed Core -> future Analytics contract.

No broker, durable store, delivery, or real restoration implementation is modeled.
"""
from __future__ import annotations

import json
from collections import Counter
from datetime import datetime
from pathlib import Path
from uuid import UUID

import pytest

from content.catalog import get_public_lessons, get_tracks_summary

FIXTURES = Path(__file__).parent / "fixtures" / "c226"
CONTRACT = json.loads((FIXTURES / "contract.json").read_text(encoding="utf-8"))
EVENTS = json.loads((FIXTURES / "events.json").read_text(encoding="utf-8"))
DELETION = json.loads((FIXTURES / "deletion.json").read_text(encoding="utf-8"))
ENVELOPE_FIELDS = set(CONTRACT["envelope_fields"])


def synthetic_catalog() -> set[tuple[str, str, str | None]]:
    """Load the current local catalog API and retain only stable identity tuples."""
    identities = set()
    for track in get_tracks_summary():
        course_id = track["id"]
        for lesson in get_public_lessons(course_id):
            lesson_id = lesson["id"]
            identities.add((course_id, lesson_id, None))
            identities.update((course_id, lesson_id, task["id"]) for task in lesson["tasks"])
    return identities


CATALOG_IDENTITIES = synthetic_catalog()


def validate(event: dict) -> None:
    assert isinstance(event, dict) and set(event) == ENVELOPE_FIELDS
    encoded = json.dumps(event, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    assert len(encoded) <= CONTRACT["max_event_bytes"]
    for key in ("event_id", "subject_ref", "correlation_id"):
        UUID(event[key])
    timestamp = event["occurred_at"]
    assert timestamp.endswith("Z")
    datetime.fromisoformat(timestamp[:-1] + "+00:00")
    assert type(event["schema_version"]) is int
    assert event["schema_version"] == CONTRACT["schema_version"]
    assert event["source"] == "core"
    assert event["type"] in CONTRACT["event_types"]
    assert set(event["payload"]) == set(CONTRACT["event_types"][event["type"]])
    if event["type"] == "privacy.subject_deleted":
        assert event["course_id"] is event["lesson_id"] is event["task_id"] is None
        assert event["payload"]["scope"] == "subject"
    else:
        assert (event["course_id"], event["lesson_id"], event["task_id"]) in CATALOG_IDENTITIES
        assert event["payload"]["synthetic"] is True


def apply_reference(records: list[dict]) -> dict:
    """Apply events/markers to personal and shared synthetic contributions.

    The marker tombstones a subject permanently in this model. Repeated event
    UUIDs are idempotent; conflicting reuse is rejected. Equal timestamps use
    event UUID lexical order as a stable tie-break.
    """
    records_by_id: dict[str, dict] = {}
    for record in records:
        validate(record)
        prior = records_by_id.get(record["event_id"])
        if prior is not None and prior != record:
            raise ValueError("event_id reused with different content")
        records_by_id[record["event_id"]] = record

    tombstones = {
        record["subject_ref"]
        for record in records_by_id.values()
        if record["type"] == "privacy.subject_deleted"
    }
    personal: dict[tuple, dict] = {}
    shared: dict[tuple, dict] = {}
    for event in records_by_id.values():
        if event["type"] == "privacy.subject_deleted":
            continue
        if event["subject_ref"] in tombstones:
            continue
        key = (event["subject_ref"], event["course_id"], event["lesson_id"], event["type"])
        current = personal.get(key)
        event_order = (event["occurred_at"], event["event_id"])
        current_order = (current["occurred_at"], current["event_id"]) if current else None
        if current is None or event_order > current_order:
            personal[key] = event
        shared[event["event_id"]] = event
    aggregate_counts = dict(Counter(
        (event["course_id"], event["lesson_id"], event["type"])
        for event in shared.values()
    ))
    return {"tombstones": tombstones, "personal": personal, "shared": shared,
            "aggregate_counts": aggregate_counts}


def restore_reference(snapshot_records: list[dict], durable_journal: dict | None) -> dict:
    """Require verified full journal coverage; then apply tombstones before replay."""
    if not isinstance(durable_journal, dict) or durable_journal.get("complete") is not True:
        raise RuntimeError("durable journal completeness unknown or false; fail closed")
    high_watermark = durable_journal.get("high_watermark")
    scanned_through = durable_journal.get("scanned_through")
    if (type(high_watermark) is not int or high_watermark < 0
            or type(scanned_through) is not int or scanned_through != high_watermark):
        raise RuntimeError("durable journal high-watermark not fully scanned; fail closed")
    markers = durable_journal.get("tombstones")
    if not isinstance(markers, list):
        raise RuntimeError("durable tombstone set unavailable; fail closed")
    for marker in markers:
        validate(marker)
        assert marker["type"] == "privacy.subject_deleted"
    return apply_reference(markers + snapshot_records)


def full_journal(markers: list[dict], high_watermark: int = 1, scanned_through: int | None = None) -> dict:
    return {
        "complete": True,
        "high_watermark": high_watermark,
        "scanned_through": high_watermark if scanned_through is None else scanned_through,
        "tombstones": markers,
    }


def test_synthetic_fixtures_use_current_catalog_identity():
    assert CATALOG_IDENTITIES
    assert any(" " in course_id and not course_id.isascii() for course_id, _, _ in CATALOG_IDENTITIES)
    assert all(validate(event) is None for event in EVENTS)
    assert all(validate(marker) is None for marker in DELETION)


def test_task_reference_is_accepted_only_when_bound_to_current_catalog_lesson():
    course_id, lesson_id, task_id = next(identity for identity in CATALOG_IDENTITIES if identity[2] is not None)
    event = dict(EVENTS[0], course_id=course_id, lesson_id=lesson_id, task_id=task_id)
    validate(event)
    event["task_id"] = "synthetic-but-not-catalogued-task"
    with pytest.raises(AssertionError):
        validate(event)


def test_duplicate_is_idempotent_and_restore_order_is_stable():
    once = apply_reference(EVENTS)
    twice = apply_reference(EVENTS + EVENTS)
    assert once == twice
    assert apply_reference(list(reversed(EVENTS))) == once


def test_equal_timestamp_tie_break_is_independent_of_input_order():
    opened = EVENTS[0]
    same_time = dict(opened, event_id="ffffffff-ffff-4fff-8fff-ffffffffffff")
    forward = apply_reference([opened, same_time])
    reverse = apply_reference([same_time, opened])
    key = (opened["subject_ref"], opened["course_id"], opened["lesson_id"], opened["type"])
    assert forward == reverse
    assert forward["personal"][key]["event_id"] == max(opened["event_id"], same_time["event_id"])


@pytest.mark.parametrize("records", [[EVENTS[0], DELETION[0]], [DELETION[0], EVENTS[0]]], ids=["event-before-delete", "delete-before-event"])
def test_deletion_dominates_event_regardless_of_arrival_order(records):
    result = apply_reference(records)
    subject = EVENTS[0]["subject_ref"]
    assert subject in result["tombstones"]
    assert not any(key[0] == subject for key in result["personal"])
    assert not any(event["subject_ref"] == subject for event in result["shared"].values())


def test_delete_removes_existing_personal_and_shared_contributions_idempotently():
    deleted = apply_reference(EVENTS + DELETION)
    deleted_twice = apply_reference(EVENTS + DELETION + DELETION)
    assert deleted == deleted_twice
    assert deleted["personal"] == {}
    assert deleted["shared"] == {}
    assert apply_reference(DELETION + DELETION) == apply_reference(DELETION)


def test_delete_recalculates_shared_total_without_removing_other_subject():
    first = EVENTS[0]
    other = dict(first, subject_ref="8f57452e-713c-428a-87c5-08ce34e4a7b0",
                 event_id="bb8f8cdc-e06d-45ce-92e6-3e6b35eba2c4")
    key = (first["course_id"], first["lesson_id"], first["type"])
    before = apply_reference([first, other])
    after = apply_reference([first, other] + DELETION)
    assert before["aggregate_counts"][key] == 2
    assert after["aggregate_counts"][key] == 1
    assert set(after["shared"]) == {other["event_id"]}
    assert {value["subject_ref"] for value in after["personal"].values()} == {other["subject_ref"]}


def test_restore_reapplies_durable_tombstone_before_old_snapshot_and_late_events():
    old_snapshot = EVENTS[:]
    late_event = dict(EVENTS[0], event_id="4ded9c9a-3940-4de2-93e3-331e69cc3abd", occurred_at="2026-10-01T10:00:00Z")
    restored = restore_reference(old_snapshot + [late_event], full_journal(DELETION))
    assert restored["personal"] == {}
    assert restored["shared"] == {}
    assert EVENTS[0]["subject_ref"] in restored["tombstones"]


@pytest.mark.parametrize("journal", [None, {"complete": False, "high_watermark": 2, "scanned_through": 2, "tombstones": DELETION}, {"complete": True, "scanned_through": 0, "tombstones": []}, {"complete": True, "high_watermark": 2, "scanned_through": 1, "tombstones": DELETION}, {"complete": True, "high_watermark": True, "scanned_through": True, "tombstones": DELETION}], ids=["unknown", "incomplete", "missing-watermark", "behind-watermark", "boolean-watermark"])
def test_restore_fails_closed_without_verified_complete_journal(journal):
    with pytest.raises(RuntimeError, match="fail closed"):
        restore_reference(EVENTS, journal)


def test_restore_accepts_an_explicitly_empty_complete_journal():
    restored = restore_reference(EVENTS, full_journal([], high_watermark=0))
    assert restored["tombstones"] == set()
    assert len(restored["personal"]) == 2


def test_new_registration_requires_new_subject_and_new_event_identity():
    fresh = dict(EVENTS[0], event_id="bb8f8cdc-e06d-45ce-92e6-3e6b35eba2c4", subject_ref="8f57452e-713c-428a-87c5-08ce34e4a7b0", occurred_at="2026-10-01T09:04:00Z")
    result = restore_reference(EVENTS + [fresh], full_journal(DELETION))
    assert len(result["personal"]) == 1
    assert next(iter(result["personal"]))[0] == fresh["subject_ref"]
    assert fresh["event_id"] != EVENTS[0]["event_id"]
    assert fresh["subject_ref"] != EVENTS[0]["subject_ref"]
    assert fresh["occurred_at"] > DELETION[0]["occurred_at"]
    reassigned_old_event = dict(EVENTS[0], subject_ref=fresh["subject_ref"], occurred_at="2026-10-01T09:04:00Z")
    with pytest.raises(ValueError, match="event_id reused"):
        apply_reference([EVENTS[0], reassigned_old_event])


@pytest.mark.parametrize("case", json.loads((FIXTURES / "negative.json").read_text(encoding="utf-8")), ids=lambda case: case["name"])
def test_rejects_invalid_contract_or_untrusted_catalog_ids(case):
    with pytest.raises((AssertionError, ValueError, TypeError)):
        validate(case["event"])


def test_rejects_oversized_payload_and_event_id_collision():
    oversized = dict(EVENTS[0], payload={"synthetic": True, "padding": "x" * 5000})
    with pytest.raises(AssertionError):
        validate(oversized)
    collision = dict(EVENTS[0], payload={"synthetic": False})
    with pytest.raises(AssertionError):
        validate(collision)
    # Reuse is separately checked with two otherwise valid records.
    collision = dict(EVENTS[0], occurred_at="2026-10-01T09:01:00Z")
    with pytest.raises(ValueError, match="event_id reused"):
        apply_reference([EVENTS[0], collision])

    bool_version = dict(EVENTS[0], schema_version=True)
    with pytest.raises(AssertionError):
        validate(bool_version)


@pytest.mark.parametrize("records", [[EVENTS[0], dict(DELETION[0], event_id=EVENTS[0]["event_id"])], [dict(DELETION[0], event_id=EVENTS[0]["event_id"]), EVENTS[0]]], ids=["event-then-marker-collision", "marker-then-event-collision"])
def test_event_id_collision_with_deletion_marker_is_rejected_in_either_order(records):
    with pytest.raises(ValueError, match="event_id reused"):
        apply_reference(records)


def test_deletion_marker_event_id_cannot_be_reused_for_another_subject():
    changed_subject_marker = dict(DELETION[0], subject_ref="8f57452e-713c-428a-87c5-08ce34e4a7b0")
    with pytest.raises(ValueError, match="event_id reused"):
        apply_reference(DELETION + [changed_subject_marker])
