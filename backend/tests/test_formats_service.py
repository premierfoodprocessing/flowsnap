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
        "formats": [
            {
                "format_id": "18",
                "extension": "mp4",
                "resolution": "640x360",
                "quality": "360p",
                "filesize": 1_500_000,
                "has_audio": True,
                "has_video": True,
            },
            {
                "format_id": "137",
                "extension": "mp4",
                "resolution": "1920x1080",
                "quality": "1080p",
                "filesize": 8_000_000,
                "has_audio": False,
                "has_video": True,
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
        "formats": [
            {
                "format_id": "mp4",
                "extension": "mp4",
                "resolution": "unknown",
                "quality": "unknown",
                "filesize": None,
                "has_audio": True,
                "has_video": True,
            }
        ],
    }
