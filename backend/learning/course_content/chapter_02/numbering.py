"""Chapter 2 learning days, with original numbers retained for progress aliases."""

import re


LESSON_NUMBERS: dict[str, str] = {
    "21": "21",
    "22": "21.1",
    "23": "21.2",
    "24": "22",
    "24.1": "22.1",
    "25": "23",
    "26": "24",
    "26.1": "24.1",
    "27": "25",
    "27.1": "25.1",
    "28": "26",
    "29": "26.1",
    "30": "27",
    "30.1": "27.1",
    "31": "28",
    "32": "28.1",
    "33": "28.2",
    "34": "29",
    "34.1": "29.1",
    "35": "30",
    "35.1": "30.1",
    "35.2": "30.2",
    "36": "31",
    "36.1": "31.1",
    "36.2": "32",
    "37": "32.1",
    "37.1": "33",
    "37.2": "33.1",
    "38": "34",
    "38.1": "34.1",
    "38.2": "35",
    "39": "36",
    "39.1": "36.1",
    "40": "37",
    "40.1": "37.1",
    "40.2": "37.2",
    "41": "38",
    "41.1": "38.1",
    "41.2": "39",
    "42": "39.1",
    "42.1": "39.2",
    "43": "40",
    "44": "40.1",
}
LEGACY_NUMBERS = {number: old for old, number in LESSON_NUMBERS.items()}

# Positional aliases existed only for the original main lessons, not sublessons.
LEGACY_INDICES: dict[str, int] = {
    "21": 1,
    "22": 4,
    "23": 5,
    "24": 6,
    "25": 7,
    "26": 8,
    "27": 10,
    "28": 11,
    "29": 14,
    "30": 15,
    "31": 16,
    "34": 18,
    "36": 19,
    "37": 20,
    "38": 21,
    "40": 22,
    "21.1": 2,
    "21.2": 3,
    "26.1": 9,
    "28.1": 12,
    "28.2": 13,
    "32.1": 17,
    "40.1": 23,
}


def legacy_filename(filename: str) -> str:
    """Restore the source identity that existing progress hashes were based on."""
    match = re.match(r"^(\d+(?:\.\d+)*)\s+-\s+(.+)$", filename)
    if match is None:
        return filename
    number = ".".join(str(int(part)) for part in match.group(1).split("."))
    old = LEGACY_NUMBERS.get(number)
    if old is None:
        return filename
    # This existing lesson had been renamed without updating the loader's allowlist.
    if old == "42":
        return "42 - Финальный проект 1, архитектура Persistent Planner.md"
    return f"{old} - {match.group(2)}"
