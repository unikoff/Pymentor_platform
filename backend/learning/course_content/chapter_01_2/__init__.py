"""Practice catalogs for the temporary Python Foundations 01.2 course."""

from learning.practice_helpers import merge_lesson_maps

from . import block_01, block_02, block_03, block_04
from .block_00 import OVERVIEW_PRACTICE

TRACK_ID = "Основы Python и мышление программиста 01.2"
TRACK_ALIASES = (TRACK_ID,)

MANUAL_PRACTICE = merge_lesson_maps(
    block_01.MANUAL_PRACTICE,
    block_02.MANUAL_PRACTICE,
    block_03.MANUAL_PRACTICE,
    block_04.MANUAL_PRACTICE,
)
CODE_TASKS = merge_lesson_maps(
    block_01.CODE_TASKS,
    block_02.CODE_TASKS,
    block_03.CODE_TASKS,
    block_04.CODE_TASKS,
)

__all__ = ["TRACK_ID", "TRACK_ALIASES", "OVERVIEW_PRACTICE", "MANUAL_PRACTICE", "CODE_TASKS"]
