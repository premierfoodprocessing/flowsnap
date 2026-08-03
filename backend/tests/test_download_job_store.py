import pytest


@pytest.mark.download
def test_download_job_store_saves_and_returns_job():
    from services.download_job_store import DownloadJobStore

    store = DownloadJobStore(
        ttl_seconds=60,
        now=lambda: 1_000.0,
        id_factory=lambda: "test-job-123",
    )

    job_id = store.save(
        {
            "title": "Test Video",
            "format_id": "18",
            "filename": "Test Video.mp4",
        }
    )

    assert job_id == "test-job-123"
    assert store.get(job_id) == {
        "title": "Test Video",
        "format_id": "18",
        "filename": "Test Video.mp4",
    }

@pytest.mark.download
def test_download_job_store_removes_expired_job():
    from services.download_job_store import DownloadJobStore

    clock = [1_000.0]

    store = DownloadJobStore(
        ttl_seconds=60,
        now=lambda: clock[0],
        id_factory=lambda: "test-job-123",
    )

    job_id = store.save(
        {
            "title": "Test Video",
            "format_id": "18",
            "filename": "Test Video.mp4",
        }
    )

    clock[0] = 1_061.0

    assert store.get(job_id) is None

@pytest.mark.download
def test_download_job_store_consumes_job_once():
    from services.download_job_store import DownloadJobStore

    store = DownloadJobStore(
        ttl_seconds=60,
        now=lambda: 1_000.0,
        id_factory=lambda: "test-job-123",
    )

    job_id = store.save(
        {
            "title": "Test Video",
            "format_id": "18",
            "filename": "Test Video.mp4",
        }
    )

    assert store.consume(job_id) == {
        "title": "Test Video",
        "format_id": "18",
        "filename": "Test Video.mp4",
    }

    assert store.consume(job_id) is None
    assert store.get(job_id) is None
