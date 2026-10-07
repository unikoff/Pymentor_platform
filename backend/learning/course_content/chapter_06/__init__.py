"""Practice catalogs for this course, grouped by block."""

from learning.practice_helpers import merge_lesson_maps

from . import block_21, block_22, block_23, block_24
from .block_00 import OVERVIEW_PRACTICE

TRACK_ID = 'SQL, PostgreSQL и выбор хранилища - PostgreSQL StudyHub'
TRACK_ALIASES = ('SQL, PostgreSQL и выбор хранилища - PostgreSQL StudyHub', 'SQL, PostgreSQL и модели хранения - PostgreSQL StudyHub')

MANUAL_PRACTICE = merge_lesson_maps(
    block_21.MANUAL_PRACTICE,
    block_22.MANUAL_PRACTICE,
    block_23.MANUAL_PRACTICE,
    block_24.MANUAL_PRACTICE
)
CODE_TASKS = merge_lesson_maps(
    block_21.CODE_TASKS,
    block_22.CODE_TASKS,
    block_23.CODE_TASKS,
    block_24.CODE_TASKS
)

__all__ = ["TRACK_ID", "TRACK_ALIASES", "OVERVIEW_PRACTICE", "MANUAL_PRACTICE", "CODE_TASKS"]
