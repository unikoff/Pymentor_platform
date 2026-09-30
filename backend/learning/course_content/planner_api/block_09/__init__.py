from learning.practice_helpers import validate_block

from .code_tasks import CODE_TASKS
from .manual import MANUAL_PRACTICE

validate_block(45, 50, MANUAL_PRACTICE, CODE_TASKS)

__all__ = ["MANUAL_PRACTICE", "CODE_TASKS"]
