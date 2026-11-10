"""Classify collected synthetic core rows; this is not import authorization.

The caller must separately verify target sessions and their markers, Redis,
source provenance, database identity, locks, privileges and sequences.
"""

from collections.abc import Mapping

from tools.lab.storage.c232_compare import compare_rows
from tools.lab.storage.c232_mapping import TABLE_ORDER
from tools.lab.storage.c232_preflight import preflight


def classify_core_replay(
    *,
    source,
    target,
    marker,
    snapshot_digest,
    transform_version,
    session_import_markers,
):
    """Return 'new' or 'core_complete'; otherwise raise a data-free ValueError.

    A core_complete result does not compare target session contents. The caller
    must reconcile them separately, even when session_import_markers is false.
    """
    if (
        type(snapshot_digest) is not str
        or not snapshot_digest
        or type(transform_version) is not str
        or not transform_version
    ):
        raise ValueError("identity_invalid")
    if type(session_import_markers) is not bool:
        raise ValueError("consumed_flag_invalid")
    try:
        preflight(source)
    except ValueError:
        raise ValueError("source_invalid") from None
    if (
        not isinstance(target, Mapping)
        or set(target) != set(TABLE_ORDER)
        or any(not isinstance(target[table], (list, tuple)) for table in TABLE_ORDER)
    ):
        raise ValueError("target_invalid")
    if marker is None:
        if not session_import_markers and all(
            not target[table] for table in TABLE_ORDER
        ):
            return "new"
        raise ValueError("state_mismatch")
    if (
        type(marker) is not dict
        or marker.keys() != {"singleton", "snapshot_digest", "transform_version"}
        or marker["singleton"] is not True
        or type(marker["snapshot_digest"]) is not str
        or type(marker["transform_version"]) is not str
        or marker["snapshot_digest"] != snapshot_digest
        or marker["transform_version"] != transform_version
    ):
        raise ValueError("marker_invalid")
    source_core = dict(source)
    target_core = dict(target)
    source_core["sessions"] = []
    target_core["sessions"] = []
    try:
        compare_rows(source_core, target_core)
    except ValueError:
        raise ValueError("core_mismatch") from None
    return "core_complete"
