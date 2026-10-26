"""Chapter 4 learning-day numbers; legacy sources remain progress identities."""

import re


LESSON_NUMBERS: dict[str, str] = {
    "69": "61",
    "70": "62",
    "71": "62.1",
    "72": "63",
    "73": "63.1",
    "74": "64",
    "75": "65",
    "76": "65.1",
    "77": "65.2",
    "78": "66",
    "79": "66.1",
    "80": "67",
    "81": "67.1",
    "82": "68",
    "83": "68.1",
    "84": "68.2",
    "85": "69",
    "86": "69.1",
    "87": "70",
    "88": "70.1",
    "89": "70.2",
    "90": "71",
    "91": "71.1",
    "92": "72",
    "93": "72.1",
    "94": "73",
    "95": "73.1",
    "96": "74",
    "97": "74.1",
    "98": "75",
    "99": "75.1",
    "100": "76",
    "101": "76.1",
    "102": "77",
    "103": "78",
    "104": "79",
    "105": "80",
}
LEGACY_NUMBERS = {number: old for old, number in LESSON_NUMBERS.items()}
# Includes the overview at index zero, exactly as before day grouping.
LEGACY_INDICES = {number: int(old) - 68 for old, number in LESSON_NUMBERS.items()}


def legacy_filename(filename: str) -> str:
    """Return the original basename without changing the module identity."""
    match = re.match(r"^(\d+(?:\.\d+)*)\s+-\s+(.+)$", filename)
    if match is None:
        return filename
    old = LEGACY_NUMBERS.get(match.group(1))
    return f"{old} - {match.group(2)}" if old else filename
