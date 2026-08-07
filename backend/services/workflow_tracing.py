import hashlib
import logging
from uuid import uuid4


logger = logging.getLogger("uvicorn.error.flowsnap.workflow")


def new_trace_id() -> str:
    return uuid4().hex


def safe_reference(value: str | None) -> str | None:
    if not value:
        return None

    return hashlib.sha256(str(value).encode("utf-8")).hexdigest()[:12]


def log_workflow_event(
    event: str,
    *,
    request_id: str,
    trace_id: str | None = None,
    analysis_id: str | None = None,
    job_id: str | None = None,
    outcome: str | None = None,
    error_code: str | None = None,
) -> None:
    fields = {
        "event": event,
        "request_ref": safe_reference(request_id),
        "workflow_ref": safe_reference(trace_id),
        "analysis_ref": safe_reference(analysis_id),
        "job_ref": safe_reference(job_id),
        "outcome": outcome,
        "error_code": error_code,
    }
    message = " ".join(
        f"{key}={value}"
        for key, value in fields.items()
        if value is not None
    )
    logger.info(message)
