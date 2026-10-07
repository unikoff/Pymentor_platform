"""Practice catalogs for this course, grouped by block."""

from learning.practice_helpers import merge_lesson_maps

from . import block_25, block_26, block_27, block_28
from .block_00 import OVERVIEW_PRACTICE

TRACK_ID = 'Асинхронность и производительность backend - Async StudyHub'
TRACK_ALIASES = ('Асинхронность и производительность backend - Async StudyHub', 'Асинхронность, FastAPI и Async SQLAlchemy - Async StudyHub', 'Асинхронность и Async SQLAlchemy - Async StudyHub')

MANUAL_PRACTICE = merge_lesson_maps(
    block_25.MANUAL_PRACTICE,
    block_26.MANUAL_PRACTICE,
    block_27.MANUAL_PRACTICE,
    block_28.MANUAL_PRACTICE
)
CODE_TASKS = merge_lesson_maps(
    block_25.CODE_TASKS,
    block_26.CODE_TASKS,
    block_27.CODE_TASKS,
    block_28.CODE_TASKS
)

__all__ = ["TRACK_ID", "TRACK_ALIASES", "OVERVIEW_PRACTICE", "MANUAL_PRACTICE", "CODE_TASKS"]
