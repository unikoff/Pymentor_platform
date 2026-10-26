from content.practice.helpers import validate_block

from .manual import MANUAL_PRACTICE
from .code_tasks import CODE_TASKS

validate_block(71, 75, MANUAL_PRACTICE, CODE_TASKS)

__all__ = ["MANUAL_PRACTICE", "CODE_TASKS"]
