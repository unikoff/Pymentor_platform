"""Identity storage contracts; device policy and cookies belong to use cases."""

from typing import Any
from typing import Protocol


class AccountReader(Protocol):
    def user_by_email(self, email: str) -> Any | None: ...
    def user_by_id(self, user_id: int) -> Any | None: ...
