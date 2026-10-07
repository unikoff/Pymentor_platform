"""Practice catalogs for this course, grouped by block."""

from learning.practice_helpers import merge_lesson_maps

from . import block_29, block_30, block_31, block_32
from .block_00 import OVERVIEW_PRACTICE

TRACK_ID = 'Docker, CI-CD и первый стабильный деплой - Deployable StudyHub'
TRACK_ALIASES = ('Docker, CI-CD и первый стабильный деплой - Deployable StudyHub', 'Docker, CI/CD и первый стабильный деплой - Deployable StudyHub', 'Docker, CI/CD и деплой - Deployable StudyHub', 'Docker и CI/CD - Deployable StudyHub')

MANUAL_PRACTICE = merge_lesson_maps(
    block_29.MANUAL_PRACTICE,
    block_30.MANUAL_PRACTICE,
    block_31.MANUAL_PRACTICE,
    block_32.MANUAL_PRACTICE
)
CODE_TASKS = merge_lesson_maps(
    block_29.CODE_TASKS,
    block_30.CODE_TASKS,
    block_31.CODE_TASKS,
    block_32.CODE_TASKS
)

__all__ = ["TRACK_ID", "TRACK_ALIASES", "OVERVIEW_PRACTICE", "MANUAL_PRACTICE", "CODE_TASKS"]
