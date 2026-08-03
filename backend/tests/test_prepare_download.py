import pytest
from fastapi.testclient import TestClient

import app as app_module


client = TestClient(app_module.app)


def test_prepare_download_returns_a_download_job(
    monkeypatch,
):
    expected = {
        "status": "ready",
        "job_id": "test-job-123",
        "title": "Test Video",
        "format_id": "18",
        "filename": "Test Video.mp4",
        "download_url": (
            "/api/media/download/test-job-123"
        ),
    }

    monkeypatch.setattr(
        app_module,
        "prepare_download",
        lambda analysis_id, format_id: expected,
        raising=False,
    )

    response = client.post(
        "/api/media/prepare",
        json={
            "analysis_id": "analysis-test-123",
            "format_id": "18",
        },
    )

    assert response.status_code == 200
    assert response.json() == expected

@pytest.mark.parametrize(
    ("code", "message"),
    [
        (
            "analysis_expired",
            (
                "This media analysis has expired. "
                "Please check the link again."
            ),
        ),
        (
            "format_not_found",
            "The selected media format is not available.",
        ),
    ],
)
def test_prepare_download_returns_structured_errors(
    monkeypatch,
    code,
    message,
):
    from services.downloads import DownloadPreparationError

    def raise_preparation_error(
        analysis_id,
        format_id,
    ):
        raise DownloadPreparationError(
            code=code,
            message=message,
        )

    monkeypatch.setattr(
        app_module,
        "prepare_download",
        raise_preparation_error,
    )

    response = client.post(
        "/api/media/prepare",
        json={
            "analysis_id": "analysis-test-123",
            "format_id": "18",
        },
    )

    assert response.status_code == 422
    assert response.json() == {
        "detail": {
            "code": code,
            "message": message,
        }
    }
