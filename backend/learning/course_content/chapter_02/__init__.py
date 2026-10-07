"""Practice catalogs for this course, grouped by block."""

from learning.practice_helpers import merge_lesson_maps

from . import block_05, block_06, block_07, block_08
from .block_00 import OVERVIEW_PRACTICE

TRACK_ID = 'Python глубже, файлы и структура небольшого проекта'
TRACK_ALIASES = ('Python глубже, файлы и структура небольшого проекта',)

MANUAL_PRACTICE = merge_lesson_maps(
    block_05.MANUAL_PRACTICE,
    block_06.MANUAL_PRACTICE,
    block_07.MANUAL_PRACTICE,
    block_08.MANUAL_PRACTICE
)
CODE_TASKS = merge_lesson_maps(
    block_05.CODE_TASKS,
    block_06.CODE_TASKS,
    block_07.CODE_TASKS,
    block_08.CODE_TASKS
)

__all__ = ["TRACK_ID", "TRACK_ALIASES", "OVERVIEW_PRACTICE", "MANUAL_PRACTICE", "CODE_TASKS"]
