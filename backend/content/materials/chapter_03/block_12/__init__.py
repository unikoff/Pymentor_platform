from content.practice.helpers import validate_block

from .code_tasks import CODE_TASKS
from .manual import MANUAL_PRACTICE

legacy_manual_practice = {
    number: tasks
    for number, tasks in MANUAL_PRACTICE.items()
    if type(number) is int and 63 <= number <= 68
}
renumbered_manual_practice = {
    number: tasks
    for number, tasks in MANUAL_PRACTICE.items()
    if isinstance(number, str) or (type(number) is int and 56 <= number <= 60)
}

validate_block(63, 68, legacy_manual_practice, CODE_TASKS)
validate_block(56, 60, renumbered_manual_practice)

__all__ = ["MANUAL_PRACTICE", "CODE_TASKS"]
