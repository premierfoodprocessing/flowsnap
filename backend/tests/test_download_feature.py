from fastapi.testclient import TestClient

import app as app_module


client = TestClient(app_module.app)


def test_download_formats_endpoint_stores_analysis(monkeypatch):
    analysis = {
        "title": "Test Video",
        "formats": [
            {
                "format_id": "18",
                "extension": "mp4",
                "resolution": "640x360",
                "quality": "360p",
                "filesize": 1_500_000,
                "has_audio": True,
                "has_video": True,
            }
        ],
    }

    saved_analyses = []

    class FakeAnalysisStore:
        def save(self, supplied_analysis):
            saved_analyses.append(supplied_analysis)
            return "analysis-test-123"

    monkeypatch.setattr(
        app_module,
        "get_formats",
        lambda url: analysis,
    )

    monkeypatch.setattr(
        app_module,
        "analysis_store",
        FakeAnalysisStore(),
        raising=False,
    )

    response = client.post(
        "/api/media/formats",
        json={"url": "https://example.com/video"},
    )

    assert response.status_code == 200
    assert saved_analyses == [analysis]
    assert response.json() == {
        "analysis_id": "analysis-test-123",
        **analysis,
    }
