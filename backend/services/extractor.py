from urllib.parse import urlparse

from yt_dlp import YoutubeDL
from services.ytdlp_config import build_ytdlp_options
from yt_dlp.networking.impersonate import ImpersonateTarget
from yt_dlp.utils import DownloadError


class MediaExtractionError(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(message)


def describe_video_codec(value) -> str:
    codec = str(value or "").lower()

    if codec.startswith(("avc", "h264")):
        return "H.264"
    if codec.startswith(("hev", "hvc", "h265")):
        return "H.265"
    if codec.startswith("av01"):
        return "AV1"
    if codec.startswith(("vp09", "vp9")):
        return "VP9"

    return "Unknown"


def get_bitrate_kbps(item: dict) -> int | None:
    bitrate = item.get("tbr") or item.get("vbr")

    if not isinstance(bitrate, (int, float)) or bitrate <= 0:
        return None

    return round(bitrate)


def get_metadata(url: str) -> dict:
    options = build_ytdlp_options() | {
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
    options = build_ytdlp_options() | {
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

        youtube_bot_challenge = (
            hostname == "youtube.com"
            or hostname.endswith(".youtube.com")
            or hostname == "youtu.be"
            or hostname.endswith(".youtu.be")
        ) and (
            "confirm you're not a bot" in error_text
            or "confirm you’re not a bot" in error_text
            or "sign in to confirm" in error_text
        )

        if youtube_bot_challenge:
            raise MediaExtractionError(
                code="platform_blocked",
                message=(
                    "YouTube is temporarily refusing access from "
                    "FlowSnap's download server. Please try again later."
                ),
            ) from exc

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
    seen_format_fingerprints = set()
    extractor_name = str(info.get("extractor") or "").lower()

    for item in info.get("formats") or []:
        has_video = item.get("vcodec") != "none"
        audio_codec = item.get("acodec")
        has_audio = bool(
            audio_codec and audio_codec != "none"
        )

        if not has_video:
            continue

        width = item.get("width")
        height = item.get("height")

        if width and height:
            resolution = f"{width}x{height}"
        else:
            resolution = item.get("resolution") or "unknown"

        if width and height:
            quality = f"{min(width, height)}p"
        elif (
            extractor_name == "facebook"
            and str(item.get("format_id")) == "hd"
        ):
            quality = "720p"
        else:
            quality = (
                f"{height}p"
                if height
                else item.get("format_note") or "unknown"
            )

        video_codec = str(item.get("vcodec") or "").lower()
        is_compatible = (
            video_codec.startswith(("avc", "h264"))
            or (
                extractor_name == "facebook"
                and str(item.get("format_id")) in {"sd", "hd"}
            )
        )

        media_format = {
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
            "is_compatible": is_compatible,
            "video_codec": describe_video_codec(video_codec),
            "bitrate_kbps": get_bitrate_kbps(item),
        }
        fingerprint = (
            media_format["extension"],
            media_format["resolution"],
            media_format["quality"],
            media_format["filesize"],
            media_format["has_audio"],
            media_format["video_codec"],
            media_format["bitrate_kbps"],
            item.get("protocol"),
        )

        if fingerprint in seen_format_fingerprints:
            continue

        seen_format_fingerprints.add(fingerprint)
        formats.append(media_format)
    return {
        "title": info.get("title") or "Untitled media",
        "uploader": info.get("uploader"),
        "duration": info.get("duration"),
        "thumbnail": info.get("thumbnail"),
        "webpage_url": info.get("webpage_url"),
        "extractor": info.get("extractor"),
        "formats": formats,
    }
