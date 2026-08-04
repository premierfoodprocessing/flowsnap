from pathlib import Path
from typing import Callable

from yt_dlp import YoutubeDL
from yt_dlp.utils import DownloadError


class DownloadDeliveryError(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(message)


def download_media(
    job: dict,
    output_dir: Path,
    youtube_dl_factory: Callable = YoutubeDL,
) -> Path:
    source_url = job.get("source_url")
    format_id = job.get("format_id")
    has_audio = job.get("has_audio") is True

    if not source_url or not format_id:
        raise DownloadDeliveryError(
            code="invalid_download_job",
            message="This download job is incomplete.",
        )

    output_dir = Path(output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    if has_audio:
        format_selector = str(format_id)
    else:
        format_selector = (
            f"{format_id}+bestaudio/{format_id}"
        )

    options = {
        "quiet": True,
        "noplaylist": True,
        "format": format_selector,
        "paths": {
            "home": str(output_dir),
            "temp": str(output_dir),
        },
        "outtmpl": {
            "default": "download.%(ext)s",
        },
    }

    try:
        with youtube_dl_factory(options) as ydl:
            info = ydl.extract_info(
                source_url,
                download=True,
            )
    except DownloadError as exc:
        raise DownloadDeliveryError(
            code="download_failed",
            message="FlowSnap could not download this media.",
        ) from exc

    requested_downloads = (
        info.get("requested_downloads") or []
    )

    candidate_paths = [
        item.get("filepath")
        for item in requested_downloads
        if item.get("filepath")
    ]

    if not candidate_paths:
        raise DownloadDeliveryError(
            code="download_failed",
            message="FlowSnap could not create the media file.",
        )

    output_path = Path(candidate_paths[-1]).resolve()

    if (
        not output_path.is_relative_to(output_dir)
        or not output_path.is_file()
    ):
        raise DownloadDeliveryError(
            code="download_failed",
            message="FlowSnap could not create the media file.",
        )

    return output_path
