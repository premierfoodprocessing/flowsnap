from pathlib import Path

import pytest
from yt_dlp.utils import DownloadError


@pytest.mark.download
def test_download_media_uses_selected_format_and_directory(
    tmp_path,
):
    from services.delivery import download_media

    captured = {}

    class FakeYoutubeDL:
        def __init__(self, options):
            captured["options"] = options

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_value, traceback):
            return False

        def extract_info(self, url, download):
            captured["url"] = url
            captured["download"] = download

            output_path = tmp_path / "download.mp4"
            output_path.write_bytes(b"test media")

            return {
                "requested_downloads": [
                    {
                        "filepath": str(output_path),
                    }
                ]
            }

    result = download_media(
        job={
            "source_url": "https://example.com/video",
            "format_id": "18",
            "has_audio": True,
        },
        output_dir=tmp_path,
        youtube_dl_factory=FakeYoutubeDL,
        max_file_size_bytes=25 * 1024 * 1024,
    )

    assert result == Path(tmp_path / "download.mp4")
    assert captured["url"] == "https://example.com/video"
    assert captured["download"] is True
    assert captured["options"]["format"] == "18"
    assert captured["options"]["max_filesize"] == 25 * 1024 * 1024
    assert captured["options"]["paths"] == {
        "home": str(tmp_path),
        "temp": str(tmp_path),
    }

@pytest.mark.download
def test_download_media_adds_audio_to_video_only_format(
    tmp_path,
):
    from services.delivery import download_media

    captured = {}

    class FakeYoutubeDL:
        def __init__(self, options):
            captured["options"] = options

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_value, traceback):
            return False

        def extract_info(self, url, download):
            output_path = tmp_path / "download.mp4"
            output_path.write_bytes(b"test media")

            return {
                "requested_downloads": [
                    {
                        "filepath": str(output_path),
                    }
                ]
            }

    download_media(
        job={
            "source_url": "https://example.com/video",
            "format_id": "137",
            "has_audio": False,
        },
        output_dir=tmp_path,
        youtube_dl_factory=FakeYoutubeDL,
    )

    assert captured["options"]["format"] == (
        "137+bestaudio/137"
    )

@pytest.mark.download
def test_download_media_rejects_path_outside_directory(
    tmp_path,
):
    from services.delivery import (
        DownloadDeliveryError,
        download_media,
    )

    allowed_directory = tmp_path / "allowed"
    outside_file = tmp_path / "outside.mp4"
    outside_file.write_bytes(b"outside media")

    class EscapingYoutubeDL:
        def __init__(self, options):
            pass

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_value, traceback):
            return False

        def extract_info(self, url, download):
            return {
                "requested_downloads": [
                    {
                        "filepath": str(outside_file),
                    }
                ]
            }

    with pytest.raises(DownloadDeliveryError) as error:
        download_media(
            job={
                "source_url": "https://example.com/video",
                "format_id": "18",
            },
            output_dir=allowed_directory,
            youtube_dl_factory=EscapingYoutubeDL,
        )

    assert error.value.code == "download_failed"
    assert error.value.message == (
        "FlowSnap could not create the media file."
    )


@pytest.mark.download
def test_download_media_rejects_incomplete_job(tmp_path):
    from services.delivery import (
        DownloadDeliveryError,
        download_media,
    )

    with pytest.raises(DownloadDeliveryError) as error:
        download_media(
            job={"source_url": "https://example.com/video"},
            output_dir=tmp_path,
        )

    assert error.value.code == "invalid_download_job"


@pytest.mark.download
def test_download_media_rejects_missing_output(tmp_path):
    from services.delivery import (
        DownloadDeliveryError,
        download_media,
    )

    class EmptyYoutubeDL:
        def __init__(self, options):
            pass

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_value, traceback):
            return False

        def extract_info(self, url, download):
            return {"requested_downloads": []}

    with pytest.raises(DownloadDeliveryError) as error:
        download_media(
            job={
                "source_url": "https://example.com/video",
                "format_id": "18",
            },
            output_dir=tmp_path,
            youtube_dl_factory=EmptyYoutubeDL,
        )

    assert error.value.code == "download_failed"


@pytest.mark.download
def test_download_media_translates_ytdlp_failure(tmp_path):
    from services.delivery import (
        DownloadDeliveryError,
        download_media,
    )

    class FailingYoutubeDL:
        def __init__(self, options):
            pass

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_value, traceback):
            return False

        def extract_info(self, url, download):
            raise DownloadError("platform refused access")

    with pytest.raises(DownloadDeliveryError) as error:
        download_media(
            job={
                "source_url": "https://example.com/video",
                "format_id": "18",
            },
            output_dir=tmp_path,
            youtube_dl_factory=FailingYoutubeDL,
        )

    assert error.value.code == "download_failed"
    assert error.value.message == (
        "FlowSnap could not download this media."
    )
