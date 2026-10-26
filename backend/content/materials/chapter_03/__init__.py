"""Практика Planner API: обзор и блоки 9–12."""

from content.practice.helpers import merge_lesson_maps

from . import block_09, block_10, block_11, block_12
from .block_00 import OVERVIEW_PRACTICE

TRACK_ID = "HTTP, API и FastAPI - Planner API"
TRACK_ALIASES = (TRACK_ID,)

MANUAL_PRACTICE = merge_lesson_maps(
    block_09.MANUAL_PRACTICE,
    {
        number: tasks
        for number, tasks in block_10.MANUAL_PRACTICE.items()
        if number not in {51, 52, 55}  # Legacy records have no source in the current track.
    },
    {
        number: tasks
        for number, tasks in block_11.MANUAL_PRACTICE.items()
        if number not in {58, 59, 60}  # Block 12 owns the current manual keys.
    },
    {
        number: tasks
        for number, tasks in block_12.MANUAL_PRACTICE.items()
        if number not in {56, 58}  # Source-aware catalog resolves colliding lesson numbers.
    },
)
CODE_TASKS = merge_lesson_maps(
    block_09.CODE_TASKS,
    block_10.CODE_TASKS,
    block_11.CODE_TASKS,
    block_12.CODE_TASKS,
)

__all__ = ["TRACK_ID", "TRACK_ALIASES", "OVERVIEW_PRACTICE", "MANUAL_PRACTICE", "CODE_TASKS"]
