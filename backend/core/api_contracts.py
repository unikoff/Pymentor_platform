"""Shared OpenAPI descriptions for the existing legacy HTTP error format."""

from typing import Any

from pydantic import BaseModel


class LegacyErrorResponse(BaseModel):
    """FastAPI's current error envelope; the value under ``detail`` is unchanged."""

    model_config = {"extra": "forbid"}

    detail: Any


_ERROR_DESCRIPTIONS = {
    400: "Request could not be processed; legacy detail response.",
    401: "Authentication is missing or invalid; legacy detail response.",
    403: "The authenticated user is not allowed; legacy detail response.",
    404: "The requested resource was not found; legacy detail response.",
    409: "The request conflicts with current state; legacy detail response.",
    503: "The service is temporarily unavailable; legacy detail response.",
}


def legacy_error_responses(*status_codes: int) -> dict[int, dict[str, object]]:
    """Document existing ``{"detail": ...}`` errors without changing handlers."""

    responses = {}
    for status_code in status_codes:
        response: dict[str, object] = {
            "model": LegacyErrorResponse,
            "description": _ERROR_DESCRIPTIONS[status_code],
        }
        if status_code == 503:
            response["headers"] = {
                "Retry-After": {
                    "description": "Suggested number of seconds before retrying.",
                    "schema": {"type": "string"},
                }
            }
        responses[status_code] = response
    return responses


def api_contract_responses(
    success_model: type[BaseModel],
    *error_status_codes: int,
) -> dict[int, dict[str, object]]:
    """Add OpenAPI DTOs without installing FastAPI runtime response validators."""

    return {
        200: {
            "model": success_model,
            "description": "Current success response; legacy response body is preserved.",
        },
        **legacy_error_responses(*error_status_codes),
    }
