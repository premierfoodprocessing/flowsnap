import logging

from services.workflow_tracing import (
    log_workflow_event,
    safe_reference,
)


def test_safe_reference_is_stable_and_does_not_reveal_identifier():
    identifier = "analysis-test-123"

    reference = safe_reference(identifier)

    assert reference == safe_reference(identifier)
    assert len(reference) == 12
    assert identifier not in reference


def test_workflow_log_contains_only_safe_operational_fields(caplog):
    source_url = "https://example.com/private-media?token=secret"

    with caplog.at_level(
        logging.INFO,
        logger="uvicorn.error.flowsnap.workflow",
    ):
        log_workflow_event(
            "prepare.completed",
            request_id="request-test-123",
            trace_id="workflow-test-123",
            analysis_id="analysis-test-123",
            job_id="job-test-123",
            outcome="success",
        )

    message = caplog.messages[-1]
    assert "event=prepare.completed" in message
    assert "outcome=success" in message
    assert "request-test-123" not in message
    assert "workflow-test-123" not in message
    assert "analysis-test-123" not in message
    assert "job-test-123" not in message
    assert source_url not in message
