"""Errors exchanged between landing storage and its HTTP boundary."""


class LandingError(Exception):
    def __init__(self, status_code: int, detail, headers=None):
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail
        self.headers = headers


LANDING_EVENT_CONTRACTS = {
    "telegram_connection_test.v1": {"schema_version": 1, "payload_keys": frozenset()},
    "consultation_request.v1": {
        "schema_version": 1,
        "payload_keys": frozenset(
            {"name", "contact", "goal", "consented_at", "consent_version"}
        ),
    },
}
MAX_TEST_EVENTS_PER_HOUR = 3
MAX_CONSULTATION_REQUESTS_PER_HOUR = 50
MAX_MANUAL_RETRIES = 3
