"""Practice catalogs for this course, grouped by block."""

from learning.practice_helpers import merge_lesson_maps

from . import block_13, block_14, block_15, block_16
from .block_00 import OVERVIEW_PRACTICE

TRACK_ID = 'FastAPI, SQLite и SQLAlchemy - StudyHub Database API'
TRACK_ALIASES = ('FastAPI, SQLite и SQLAlchemy - StudyHub Database API',)

MANUAL_PRACTICE = merge_lesson_maps(
    block_13.MANUAL_PRACTICE,
    block_14.MANUAL_PRACTICE,
    block_15.MANUAL_PRACTICE,
    block_16.MANUAL_PRACTICE
)
CODE_TASKS = merge_lesson_maps(
    block_13.CODE_TASKS,
    block_14.CODE_TASKS,
    block_15.CODE_TASKS,
    block_16.CODE_TASKS
)

__all__ = ["TRACK_ID", "TRACK_ALIASES", "OVERVIEW_PRACTICE", "MANUAL_PRACTICE", "CODE_TASKS"]
