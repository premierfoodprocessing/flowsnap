import pytest
from fastapi.testclient import TestClient

import app as app_module


client = TestClient(app_module.app)


@pytest.mark.download
def test_download_route_rejects_unknown_or_expired_job(
    monkeypatch,
):
    class EmptyJobStore:
        def consume(self, job_id):
            assert job_id == "missing-job"
            return None

    monkeypatch.setattr(
        app_module,
        "download_job_store",
        EmptyJobStore(),
    )

    response = client.get(
        "/api/media/download/missing-job"
    )

    assert response.status_code == 410
    assert response.json() == {
        "detail": {
            "code": "download_expired",
            "message": (
                "This download has expired or is no longer available. "
                "Please prepare it again."
            ),
        }
    }


@pytest.mark.download
def test_download_route_returns_file_and_cleans_directory(
    monkeypatch,
    tmp_path,
):
    output_dir = tmp_path / "delivery"
    output_dir.mkdir()

    class JobStore:
        def consume(self, job_id):
            return {
                "source_url": "https://example.com/video",
                "format_id": "18",
                "filename": "Test Video.mp4",
            }

    def fake_download_media(job, output_dir):
        output_path = output_dir / "download.mp4"
        output_path.write_bytes(b"test media")
        return output_path

    monkeypatch.setattr(app_module, "download_job_store", JobStore())
    monkeypatch.setattr(
        app_module,
        "create_download_directory",
        lambda: output_dir,
    )
    monkeypatch.setattr(app_module, "download_media", fake_download_media)

    response = client.get("/api/media/download/test-job")

    assert response.status_code == 200
    assert response.content == b"test media"
    assert response.headers["content-disposition"] == (
        "attachment; filename*=utf-8''Test%20Video.mp4"
    )
    assert not output_dir.exists()


@pytest.mark.download
def test_download_route_returns_structured_delivery_error_and_cleans(
    monkeypatch,
    tmp_path,
):
    from services.delivery import DownloadDeliveryError

    output_dir = tmp_path / "delivery"
    output_dir.mkdir()

    class JobStore:
        def consume(self, job_id):
            return {
                "source_url": "https://example.com/video",
                "format_id": "18",
                "filename": "Test Video.mp4",
            }

    def fail_download(job, output_dir):
        raise DownloadDeliveryError(
            code="download_failed",
            message="FlowSnap could not download this media.",
        )

    monkeypatch.setattr(app_module, "download_job_store", JobStore())
    monkeypatch.setattr(
        app_module,
        "create_download_directory",
        lambda: output_dir,
    )
    monkeypatch.setattr(app_module, "download_media", fail_download)

    response = client.get("/api/media/download/test-job")

    assert response.status_code == 422
    assert response.json() == {
        "detail": {
            "code": "download_failed",
            "message": "FlowSnap could not download this media.",
        }
    }
    assert not output_dir.exists()


@pytest.mark.download
def test_download_route_hides_unexpected_error_and_cleans(
    monkeypatch,
    tmp_path,
):
    output_dir = tmp_path / "delivery"
    output_dir.mkdir()

    class JobStore:
        def consume(self, job_id):
            return {
                "source_url": "https://example.com/video",
                "format_id": "18",
                "filename": "Test Video.mp4",
            }

    def crash_download(job, output_dir):
        raise RuntimeError("secret internal detail")

    monkeypatch.setattr(app_module, "download_job_store", JobStore())
    monkeypatch.setattr(
        app_module,
        "create_download_directory",
        lambda: output_dir,
    )
    monkeypatch.setattr(app_module, "download_media", crash_download)

    response = client.get("/api/media/download/test-job")

    assert response.status_code == 500
    assert response.json() == {
        "detail": {
            "code": "internal_error",
            "message": "An unexpected error occurred.",
        }
    }
    assert "secret" not in response.text
    assert not output_dir.exists()
