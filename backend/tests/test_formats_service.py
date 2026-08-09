import pytest
from services import extractor


class FakeYoutubeDL:
    def __init__(self, options):
        self.options = options

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        return False

    def extract_info(self, url, download):
        return {
            "title": "Test Video",
            "formats": [
                {
                    "format_id": "audio-only",
                    "ext": "m4a",
                    "vcodec": "none",
                    "acodec": "aac",
                    "filesize": 500_000,
                },
                {
                    "format_id": "18",
                    "ext": "mp4",
                    "width": 640,
                    "height": 360,
                    "vcodec": "h264",
                    "acodec": "aac",
                    "filesize": 1_500_000,
                    "tbr": 850.4,
                },
                {
                    "format_id": "137",
                    "ext": "mp4",
                    "width": 1920,
                    "height": 1080,
                    "vcodec": "h264",
                    "acodec": "none",
                    "filesize_approx": 8_000_000,
                },
            ],
        }


def test_get_formats_returns_sanitized_video_options(monkeypatch):
    monkeypatch.setattr(
        extractor,
        "YoutubeDL",
        FakeYoutubeDL,
    )

    result = extractor.get_formats(
        "https://example.com/video"
    )

    assert result == {
        "title": "Test Video",
        "uploader": None,
        "duration": None,
        "thumbnail": None,
        "webpage_url": None,
        "extractor": None,
        "formats": [
            {
                "format_id": "18",
                "extension": "mp4",
                "resolution": "640x360",
                "quality": "360p",
                "filesize": 1_500_000,
                "has_audio": True,
                "has_video": True,
                "is_compatible": True,
                "video_codec": "H.264",
                "bitrate_kbps": 850,
            },
            {
                "format_id": "137",
                "extension": "mp4",
                "resolution": "1920x1080",
                "quality": "1080p",
                "filesize": 8_000_000,
                "has_audio": False,
                "has_video": True,
                "is_compatible": True,
                "video_codec": "H.264",
                "bitrate_kbps": None,
            },
        ],
    }


class FakeDirectMediaYoutubeDL:
    def __init__(self, options):
        self.options = options

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        return False

    def extract_info(self, url, download):
        return {
            "title": "flower",
            "formats": [
                {
                    "format_id": "mp4",
                    "ext": "mp4",
                    "protocol": "https",
                    "vcodec": None,
                    "acodec": None,
                    "width": None,
                    "height": None,
                    "resolution": None,
                }
            ],
        }


def test_get_formats_keeps_direct_media_with_unknown_codecs(
    monkeypatch,
):
    monkeypatch.setattr(
        extractor,
        "YoutubeDL",
        FakeDirectMediaYoutubeDL,
    )

    result = extractor.get_formats(
        "https://example.com/flower.mp4"
    )

    assert result == {
        "title": "flower",
        "uploader": None,
        "duration": None,
        "thumbnail": None,
        "webpage_url": None,
        "extractor": None,
        "formats": [
            {
                "format_id": "mp4",
                "extension": "mp4",
                "resolution": "unknown",
                "quality": "unknown",
                "filesize": None,
                "has_audio": False,
                "has_video": True,
                "is_compatible": False,
                "video_codec": "Unknown",
                "bitrate_kbps": None,
            }
        ],
    }


class FakeFacebookYoutubeDL:
    def __init__(self, options):
        self.options = options

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        return False

    def extract_info(self, url, download):
        return {
            "title": "Facebook Reel",
            "extractor": "facebook",
            "formats": [
                {
                    "format_id": "hd",
                    "ext": "mp4",
                    "vcodec": None,
                    "acodec": None,
                },
                {
                    "format_id": "dash-av1",
                    "ext": "mp4",
                    "width": 1080,
                    "height": 1920,
                    "vcodec": "av01.0.08M.08",
                    "acodec": "none",
                },
            ],
        }


def test_get_formats_marks_facebook_hd_as_compatible(monkeypatch):
    monkeypatch.setattr(
        extractor,
        "YoutubeDL",
        FakeFacebookYoutubeDL,
    )

    result = extractor.get_formats(
        "https://www.facebook.com/reel/example"
    )

    assert result["formats"][0]["is_compatible"] is True
    assert result["formats"][0]["quality"] == "720p"
    assert result["formats"][0]["video_codec"] == "Unknown"
    assert result["formats"][1]["is_compatible"] is False
    assert result["formats"][1]["video_codec"] == "AV1"
    assert result["formats"][1]["resolution"] == "1080x1920"
    assert result["formats"][1]["quality"] == "1080p"


class FakeDuplicateFormatsYoutubeDL:
    def __init__(self, options):
        self.options = options

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        return False

    def extract_info(self, url, download):
        base_format = {
            "ext": "mp4",
            "width": 720,
            "height": 1280,
            "vcodec": "h264",
            "acodec": "aac",
            "filesize": 4_000_000,
            "tbr": 1_200,
            "protocol": "https",
        }
        return {
            "title": "Duplicate formats",
            "formats": [
                {**base_format, "format_id": "first"},
                {**base_format, "format_id": "duplicate"},
                {
                    **base_format,
                    "format_id": "different-bitrate",
                    "tbr": 1_600,
                },
            ],
        }


def test_get_formats_removes_only_identical_technical_duplicates(
    monkeypatch,
):
    monkeypatch.setattr(
        extractor,
        "YoutubeDL",
        FakeDuplicateFormatsYoutubeDL,
    )

    result = extractor.get_formats(
        "https://example.com/duplicates"
    )

    assert [
        media_format["format_id"]
        for media_format in result["formats"]
    ] == ["first", "different-bitrate"]
    assert [
        media_format["bitrate_kbps"]
        for media_format in result["formats"]
    ] == [1_200, 1_600]

class FakeRichMediaYoutubeDL:
    def __init__(self, options):
        self.options = options

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        return False

    def extract_info(self, url, download):
        return {
            "title": "Test Video",
            "uploader": "FlowSnap Tester",
            "duration": 42,
            "thumbnail": "https://example.com/thumbnail.jpg",
            "webpage_url": "https://example.com/video",
            "extractor": "TestPlatform",
            "formats": [],
        }


def test_get_formats_includes_preview_metadata(monkeypatch):
    monkeypatch.setattr(
        extractor,
        "YoutubeDL",
        FakeRichMediaYoutubeDL,
    )

    result = extractor.get_formats(
        "https://example.com/video"
    )

    assert result["title"] == "Test Video"
    assert result["uploader"] == "FlowSnap Tester"
    assert result["duration"] == 42
    assert result["thumbnail"] == (
        "https://example.com/thumbnail.jpg"
    )
    assert result["webpage_url"] == (
        "https://example.com/video"
    )
    assert result["extractor"] == "TestPlatform"
    assert result["formats"] == []


class FakeYoutubeBotChallengeYoutubeDL:
    def __init__(self, options):
        self.options = options

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        return False

    def extract_info(self, url, download):
        raise extractor.DownloadError(
            "Sign in to confirm you’re not a bot."
        )


def test_get_formats_identifies_youtube_bot_challenge(
    monkeypatch,
):
    monkeypatch.setattr(
        extractor,
        "YoutubeDL",
        FakeYoutubeBotChallengeYoutubeDL,
    )

    with pytest.raises(
        extractor.MediaExtractionError
    ) as captured_error:
        extractor.get_formats(
            "https://www.youtube.com/watch?v=test"
        )

    assert captured_error.value.code == "platform_blocked"
    assert captured_error.value.message == (
        "YouTube is temporarily refusing access from "
        "FlowSnap's download server. Please try again later."
    )
