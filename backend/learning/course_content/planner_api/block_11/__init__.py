from learning.practice_helpers import validate_block

from .code_tasks import CODE_TASKS
from .manual import MANUAL_PRACTICE

validate_block(57, 62, MANUAL_PRACTICE, CODE_TASKS)

__all__ = ["MANUAL_PRACTICE", "CODE_TASKS"]
