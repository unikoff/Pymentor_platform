"""Portable application failures translated at the HTTP boundary."""


class ApplicationError(Exception):
    def __init__(self, status_code, detail, headers=None):
        self.status_code = status_code
        self.detail = detail
        self.headers = headers
        super().__init__(str(detail))
