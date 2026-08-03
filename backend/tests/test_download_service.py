import pytest


def test_prepare_download_builds_job_from_stored_analysis():
    from services.downloads import prepare_download

    class FakeAnalysisStore:
        def get(self, analysis_id):
            assert analysis_id == "analysis-test-123"

            return {
                "title": "Test Video",
                "formats": [
                    {
                        "format_id": "18",
                        "extension": "mp4",
                    }
                ],
            }

    result = prepare_download(
        store=FakeAnalysisStore(),
        analysis_id="analysis-test-123",
        format_id="18",
        id_factory=lambda: "test-job-123",
    )

    assert result == {
        "status": "ready",
        "job_id": "test-job-123",
        "title": "Test Video",
        "format_id": "18",
        "filename": "Test Video.mp4",
        "download_url": (
            "/api/media/download/test-job-123"
        ),
    }


def test_prepare_download_rejects_expired_analysis():
    from services.downloads import (
        DownloadPreparationError,
        prepare_download,
    )

    class EmptyAnalysisStore:
        def get(self, analysis_id):
            return None

    with pytest.raises(
        DownloadPreparationError,
    ) as error:
        prepare_download(
            store=EmptyAnalysisStore(),
            analysis_id="expired-analysis",
            format_id="18",
        )

    assert error.value.code == "analysis_expired"
    assert error.value.message == (
        "This media analysis has expired. "
        "Please check the link again."
    )


def test_prepare_download_rejects_unknown_format():
    from services.downloads import (
        DownloadPreparationError,
        prepare_download,
    )

    class FakeAnalysisStore:
        def get(self, analysis_id):
            return {
                "title": "Test Video",
                "formats": [
                    {
                        "format_id": "18",
                        "extension": "mp4",
                    }
                ],
            }

    with pytest.raises(
        DownloadPreparationError,
    ) as error:
        prepare_download(
            store=FakeAnalysisStore(),
            analysis_id="analysis-test-123",
            format_id="unavailable-format",
        )

    assert error.value.code == "format_not_found"
    assert error.value.message == (
        "The selected media format is not available."
    )
