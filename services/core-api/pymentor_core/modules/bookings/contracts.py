"""Domain errors shared by the booking port and its adapters."""


class BookingError(Exception):
    def __init__(self, status_code: int, detail, headers: dict | None = None):
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail
        self.headers = headers
