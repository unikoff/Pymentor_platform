"""Practice catalogs for this course, grouped by block."""

from learning.practice_helpers import merge_lesson_maps

from . import block_33, block_34, block_35, block_36
from .block_00 import OVERVIEW_PRACTICE

TRACK_ID = 'StudyHub LMS, Redis, портфолио и собеседования - StudyHub LMS Release'
TRACK_ALIASES = ('StudyHub LMS, Redis, портфолио и собеседования - StudyHub LMS Release', 'LMS Core, Redis и финальный релиз - StudyHub LMS Release', 'LMS, Redis и портфолио - StudyHub LMS Release')

MANUAL_PRACTICE = merge_lesson_maps(
    block_33.MANUAL_PRACTICE,
    block_34.MANUAL_PRACTICE,
    block_35.MANUAL_PRACTICE,
    block_36.MANUAL_PRACTICE
)
CODE_TASKS = merge_lesson_maps(
    block_33.CODE_TASKS,
    block_34.CODE_TASKS,
    block_35.CODE_TASKS,
    block_36.CODE_TASKS
)

__all__ = ["TRACK_ID", "TRACK_ALIASES", "OVERVIEW_PRACTICE", "MANUAL_PRACTICE", "CODE_TASKS"]
