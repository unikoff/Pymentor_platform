"""Practice catalogs for this course, grouped by block."""

from learning.practice_helpers import merge_lesson_maps

from . import block_17, block_18, block_19, block_20
from .block_00 import OVERVIEW_PRACTICE

TRACK_ID = 'Аутентификация, сессии, токены и завершение FastAPI - Personal StudyHub API'
TRACK_ALIASES = ('Аутентификация, сессии, токены и завершение FastAPI - Personal StudyHub API',)

MANUAL_PRACTICE = merge_lesson_maps(
    block_17.MANUAL_PRACTICE,
    block_18.MANUAL_PRACTICE,
    block_19.MANUAL_PRACTICE,
    block_20.MANUAL_PRACTICE
)
CODE_TASKS = merge_lesson_maps(
    block_17.CODE_TASKS,
    block_18.CODE_TASKS,
    block_19.CODE_TASKS,
    block_20.CODE_TASKS
)

__all__ = ["TRACK_ID", "TRACK_ALIASES", "OVERVIEW_PRACTICE", "MANUAL_PRACTICE", "CODE_TASKS"]
