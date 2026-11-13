"""Ручная практика блока 17, по одному исходному модулю на занятие."""

from content.practice.helpers import merge_lesson_maps

from .manual_81 import MANUAL_PRACTICE as LESSON_81
from .manual_81_1 import MANUAL_PRACTICE as LESSON_81_1
from .manual_82 import MANUAL_PRACTICE as LESSON_82
from .manual_82_1 import MANUAL_PRACTICE as LESSON_82_1
from .manual_83 import MANUAL_PRACTICE as LESSON_83
from .manual_83_1 import MANUAL_PRACTICE as LESSON_83_1
from .manual_84 import MANUAL_PRACTICE as LESSON_84
from .manual_84_1 import MANUAL_PRACTICE as LESSON_84_1
from .manual_85 import MANUAL_PRACTICE as LESSON_85
from .manual_85_1 import MANUAL_PRACTICE as LESSON_85_1

MANUAL_PRACTICE = merge_lesson_maps(
    LESSON_81,
    LESSON_81_1,
    LESSON_82,
    LESSON_82_1,
    LESSON_83,
    LESSON_83_1,
    LESSON_84,
    LESSON_84_1,
    LESSON_85,
    LESSON_85_1,
)
