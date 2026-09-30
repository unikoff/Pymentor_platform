from learning.practice_helpers import validate_block

from .manual import MANUAL_PRACTICE
from .code_tasks import CODE_TASKS

validate_block(16, 20, MANUAL_PRACTICE, CODE_TASKS)

__all__ = ["MANUAL_PRACTICE", "CODE_TASKS"]
