import pytest
from fastapi.testclient import TestClient

import app as app_module
from services.extractor import MediaExtractionError


client = TestClient(app_module.app)


def test_root_returns_service_status():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {
        "name": "FlowSnap",
        "version": "0.1.0",
        "status": "online",
    }


def test_root_accepts_head_requests():
    response = client.head("/")

    assert response.status_code == 200
    assert response.content == b""


def test_backend_serves_favicon():
    response = client.get("/favicon.ico")

    assert response.status_code == 200
    assert response.headers["content-type"].startswith(
        "image/svg+xml"
    )
    assert response.content.startswith(b"<svg")


def test_health_returns_healthy():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_github_pages_origin_is_allowed_by_cors():
    response = client.options(
        "/api/media/formats",
        headers={
            "Origin": "https://premierfoodprocessing.github.io",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == (
        "https://premierfoodprocessing.github.io"
    )


def test_unknown_origin_is_not_allowed_by_cors():
    response = client.options(
        "/api/media/formats",
        headers={
            "Origin": "https://example.com",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert "access-control-allow-origin" not in response.headers


def test_media_info_rejects_invalid_url():
    response = client.post(
        "/api/media/info",
        json={"url": "not-a-valid-url"},
    )

    assert response.status_code == 422
    assert response.json()["detail"][0]["type"] == "url_parsing"


def test_media_info_returns_metadata(monkeypatch):
    expected = {
        "title": "Test Video",
        "uploader": "FlowSnap Tester",
        "duration": 42,
        "thumbnail": "https://example.com/thumbnail.jpg",
        "webpage_url": "https://example.com/video",
        "extractor": "TestPlatform",
    }

    monkeypatch.setattr(
        app_module,
        "get_metadata",
        lambda url: expected,
    )

    response = client.post(
        "/api/media/info",
        json={"url": "https://example.com/video"},
    )

    assert response.status_code == 200
    assert response.json() == expected


@pytest.mark.parametrize(
    ("code", "message"),
    [
        (
            "platform_blocked",
            "The platform temporarily refused access.",
        ),
        (
            "unsupported_url",
            "FlowSnap does not currently support this URL.",
        ),
    ],
)
def test_media_info_returns_structured_extraction_errors(
    monkeypatch,
    code,
    message,
):
    def raise_extraction_error(url):
        raise MediaExtractionError(code=code, message=message)

    monkeypatch.setattr(
        app_module,
        "get_metadata",
        raise_extraction_error,
    )

    response = client.post(
        "/api/media/info",
        json={"url": "https://example.com/video"},
    )

    assert response.status_code == 422
    assert response.json() == {
        "detail": {
            "code": code,
            "message": message,
        }
    }


def test_media_info_hides_unexpected_errors(monkeypatch):
    def raise_unexpected_error(url):
        raise RuntimeError("Sensitive internal details")

    monkeypatch.setattr(
        app_module,
        "get_metadata",
        raise_unexpected_error,
    )

    response = client.post(
        "/api/media/info",
        json={"url": "https://example.com/video"},
    )

    assert response.status_code == 500
    assert response.json() == {
        "detail": {
            "code": "internal_error",
            "message": "An unexpected error occurred.",
        }
    }
