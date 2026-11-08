"""Registration use-case errors."""


class EmailAlreadyExists(Exception):
    """The requested email is already registered."""
