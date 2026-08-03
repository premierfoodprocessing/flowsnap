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
def get_formats(url: str) -> dict:
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

        if (
            "403" in error_text
            or "forbidden" in error_text
            or "blocked" in error_text
            or "429" in error_text
            or "too many requests" in error_text
        ):
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

    formats = []

    for item in info.get("formats") or []:
        has_video = item.get("vcodec") != "none"
        has_audio = item.get("acodec") != "none"

        if not has_video:
            continue

        width = item.get("width")
        height = item.get("height")

        if width and height:
            resolution = f"{width}x{height}"
        else:
            resolution = item.get("resolution") or "unknown"

        quality = (
            f"{height}p"
            if height
            else item.get("format_note") or "unknown"
        )

        formats.append(
            {
                "format_id": str(item.get("format_id")),
                "extension": item.get("ext"),
                "resolution": resolution,
                "quality": quality,
                "filesize": (
                    item.get("filesize")
                    or item.get("filesize_approx")
                ),
                "has_audio": has_audio,
                "has_video": has_video,
            }
        )
    return {
        "title": info.get("title") or "Untitled media",
        "uploader": info.get("uploader"),
        "duration": info.get("duration"),
        "thumbnail": info.get("thumbnail"),
        "webpage_url": info.get("webpage_url"),
        "extractor": info.get("extractor"),
        "formats": formats,
    }
