"""Display numbering for chapter 01; old ordinals preserve lesson identities."""

import re


LESSON_NUMBERS: dict[int, str] = {
    1: "1",
    2: "1.1",
    3: "2",
    4: "2.1",
    5: "3",
    6: "3.1",
    7: "4",
    8: "4.1",
    9: "5",
    10: "5.1",
    11: "6",
    12: "6.1",
    13: "7",
    14: "7.1",
    15: "7.2",
    16: "8",
    17: "8.1",
    18: "9",
    19: "9.1",
    20: "10",
    21: "10.1",
    22: "10.2",
    23: "11",
    24: "11.1",
    25: "11.2",
    26: "12",
    27: "12.1",
    28: "13",
    29: "13.1",
    30: "13.2",
    31: "14",
    32: "14.1",
    33: "14.2",
    34: "15",
    35: "15.1",
    36: "16",
    37: "16.1",
    38: "17",
    39: "17.1",
    40: "18",
    41: "18.1",
    42: "19",
    43: "19.1",
    44: "20",
    45: "20.1",
}
LEGACY_NUMBERS = {number: ordinal for ordinal, number in LESSON_NUMBERS.items()}


def legacy_filename(filename: str) -> str:
    """Restore the original filename for hashing existing progress and links."""
    match = re.match(r"^(\d+(?:\.\d+)*)\s+-\s+(.+)$", filename)
    if match is None:
        return filename
    number = ".".join(str(int(part)) for part in match.group(1).split("."))
    ordinal = LEGACY_NUMBERS.get(number)
    if ordinal is None:
        return filename
    return f"{ordinal:02d} - {match.group(2)}"
