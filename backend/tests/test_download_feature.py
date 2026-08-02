
from fastapi.testclient import TestClient

import app as app_module


client = TestClient(app_module.app)



def test_download_formats_endpoint_is_available(monkeypatch):
    expected = {
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

    monkeypatch.setattr(
        app_module,
        "get_formats",
        lambda url: expected,
        raising=False,
    )

    response = client.post(
        "/api/media/formats",
        json={"url": "https://example.com/video"},
    )

    assert response.status_code == 200
    assert response.json() == expected
