from urllib.parse import urlparse

from yt_dlp import YoutubeDL
from yt_dlp.networking.impersonate import ImpersonateTarget
from yt_dlp.utils import DownloadError


class MediaExtractionError(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(message)


def get_metadata(url: str) -> dict:
    options = {
        "quiet": True,
        "skip_download": True,
        "noplaylist": True,
    }

    hostname = (urlparse(url).hostname or "").lower()

    if hostname == "tiktok.com" or hostname.endswith(".tiktok.com"):
        options["impersonate"] = ImpersonateTarget.from_str("chrome")

    try:
        with YoutubeDL(options) as ydl:
            info = ydl.extract_info(url, download=False)

    except DownloadError as exc:
        error_text = str(exc).lower()

        if "403" in error_text or "forbidden" in error_text:
            raise MediaExtractionError(
                code="platform_blocked",
                message=(
                    "The platform temporarily refused access. "
                    "Please try another public link or try again later."
                ),
            ) from exc

        if "private" in error_text or "login" in error_text:
            raise MediaExtractionError(
                code="private_media",
                message="This media appears to be private or requires permission.",
            ) from exc

        if "unsupported url" in error_text:
            raise MediaExtractionError(
                code="unsupported_url",
                message="FlowSnap does not currently support this URL.",
            ) from exc

        raise MediaExtractionError(
            code="extraction_failed",
            message="FlowSnap could not read information from this link.",
        ) from exc

    return {
        "title": info.get("title"),
        "uploader": info.get("uploader"),
        "duration": info.get("duration"),
        "thumbnail": info.get("thumbnail"),
        "webpage_url": info.get("webpage_url"),
        "extractor": info.get("extractor"),
    }
