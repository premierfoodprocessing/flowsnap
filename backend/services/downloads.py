from typing import Callable
from uuid import uuid4


class DownloadPreparationError(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(message)


def prepare_download(
    store,
    analysis_id: str,
    format_id: str,
    job_store=None,
    id_factory: Callable[[], str] = lambda: uuid4().hex,
) -> dict:
    analysis = store.get(analysis_id)

    if analysis is None:
        raise DownloadPreparationError(
            code="analysis_expired",
            message=(
                "This media analysis has expired. "
                "Please check the link again."
            ),
        )

    selected_format = next(
        (
            media_format
            for media_format in analysis.get("formats", [])
            if str(media_format.get("format_id")) == str(format_id)
        ),
        None,
    )

    if selected_format is None:
        raise DownloadPreparationError(
            code="format_not_found",
            message="The selected media format is not available.",
        )

    title = analysis.get("title") or "media"
    extension = selected_format.get("extension") or "mp4"

    job = {
        "source_url": analysis.get("webpage_url"),
        "title": title,
        "format_id": str(format_id),
        "extension": extension,
        "filename": f"{title}.{extension}",
    }

    if job_store is None:
        job_id = id_factory()
    else:
        job_id = job_store.save(job)

    return {
        "status": "ready",
        "job_id": job_id,
        "title": title,
        "format_id": str(format_id),
        "filename": job["filename"],
        "download_url": f"/api/media/download/{job_id}",
    }
