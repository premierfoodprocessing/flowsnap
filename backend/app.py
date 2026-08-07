
import shutil
import tempfile
import threading
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import FileResponse
from pydantic import BaseModel, HttpUrl
from fastapi.middleware.cors import CORSMiddleware
from starlette.background import BackgroundTask

from services.analysis_store import AnalysisStore
from services.download_job_store import DownloadJobStore
from services.downloads import (
    DownloadPreparationError,
    prepare_download as build_download_job,
)
from services.delivery import DownloadDeliveryError, download_media
from services.extractor import (
    MediaExtractionError,
    get_formats,
    get_metadata,
)
from services.hosting_limits import (
    SlidingWindowRateLimiter,
    load_hosting_limits,
)

analysis_store = AnalysisStore()
download_job_store = DownloadJobStore()
hosting_limits = load_hosting_limits()
download_slots = threading.BoundedSemaphore(
    hosting_limits.max_concurrent_downloads
)
api_rate_limiter = SlidingWindowRateLimiter(
    hosting_limits.api_requests_per_window,
    hosting_limits.rate_window_seconds,
)
expensive_rate_limiter = SlidingWindowRateLimiter(
    hosting_limits.expensive_requests_per_window,
    hosting_limits.rate_window_seconds,
)
favicon_path = (
    Path(__file__).resolve().parent.parent
    / "assets"
    / "favicon.svg"
)

app = FastAPI(
    title="FlowSnap API",
    version="0.1.0",
    description="Multi-platform media metadata API.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://premierfoodprocessing.github.io",
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MediaRequest(BaseModel):
    url: HttpUrl



class PrepareDownloadRequest(BaseModel):
    analysis_id: str
    format_id: str


def enforce_rate_limits(
    request: Request,
    *,
    expensive: bool = False,
) -> None:
    client_key = request.client.host if request.client else "unknown"

    allowed = api_rate_limiter.allow(client_key)
    if allowed and expensive:
        allowed = expensive_rate_limiter.allow(client_key)

    if not allowed:
        raise HTTPException(
            status_code=429,
            detail={
                "code": "rate_limited",
                "message": (
                    "FlowSnap is receiving too many requests. "
                    "Please wait a minute and try again."
                ),
            },
            headers={
                "Retry-After": str(hosting_limits.rate_window_seconds)
            },
        )


def prepare_download(
    analysis_id: str,
    format_id: str,
) -> dict:
    return build_download_job(
        store=analysis_store,
        job_store=download_job_store,
        analysis_id=analysis_id,
        format_id=format_id,
    )


def create_download_directory() -> Path:
    return Path(tempfile.mkdtemp(prefix="flowsnap-"))

@app.get("/")
def root() -> dict[str, str]:
    return {
        "name": "FlowSnap",
        "version": "0.1.0",
        "status": "online",
    }


@app.head("/")
def root_head() -> Response:
    return Response(status_code=200)


@app.get("/favicon.ico", response_class=FileResponse)
def favicon() -> FileResponse:
    return FileResponse(
        favicon_path,
        media_type="image/svg+xml",
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "healthy"}


@app.post("/api/media/info")
def media_info(request: MediaRequest, http_request: Request) -> dict:
    enforce_rate_limits(http_request, expensive=True)
    try:
        return get_metadata(str(request.url))

    except MediaExtractionError as exc:
        raise HTTPException(
            status_code=422,
            detail={
                "code": exc.code,
                "message": exc.message,
            },
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail={
                "code": "internal_error",
                "message": "An unexpected error occurred.",
            },
        ) from exc

@app.post("/api/media/formats")
def media_formats(request: MediaRequest, http_request: Request) -> dict:
    enforce_rate_limits(http_request, expensive=True)
    try:
        analysis = get_formats(str(request.url))
        analysis_id = analysis_store.save(analysis)

        return {
            "analysis_id": analysis_id,
            **analysis,
        }
    except MediaExtractionError as exc:
        raise HTTPException(
            status_code=422,
            detail={
                "code": exc.code,
                "message": exc.message,
            },
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail={
                "code": "internal_error",
                "message": "An unexpected error occurred.",
            },
        ) from exc

@app.post("/api/media/prepare")
def media_prepare(
    request: PrepareDownloadRequest,
    http_request: Request,
) -> dict:
    enforce_rate_limits(http_request)
    try:
        return prepare_download(
            request.analysis_id,
            request.format_id,
        )

    except DownloadPreparationError as exc:
        raise HTTPException(
            status_code=422,
            detail={
                "code": exc.code,
                "message": exc.message,
            },
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail={
                "code": "internal_error",
                "message": "An unexpected error occurred.",
            },
        ) from exc

@app.get("/api/media/download/{job_id}")
def media_download(job_id: str, request: Request):
    enforce_rate_limits(request, expensive=True)

    if not download_slots.acquire(blocking=False):
        raise HTTPException(
            status_code=503,
            detail={
                "code": "download_capacity_reached",
                "message": (
                    "FlowSnap is already processing another download. "
                    "Please try again shortly."
                ),
            },
            headers={"Retry-After": "10"},
        )

    job = download_job_store.consume(job_id)

    if job is None:
        download_slots.release()
        raise HTTPException(
            status_code=410,
            detail={
                "code": "download_expired",
                "message": (
                    "This download has expired or is no longer available. "
                    "Please prepare it again."
                ),
            },
        )

    output_dir = create_download_directory()

    try:
        output_path = download_media(
            job=job,
            output_dir=output_dir,
            max_file_size_bytes=hosting_limits.max_file_size_bytes,
        )

        if output_path.stat().st_size > hosting_limits.max_file_size_bytes:
            raise HTTPException(
                status_code=413,
                detail={
                    "code": "file_too_large",
                    "message": (
                        "This file is larger than FlowSnap's current "
                        "download limit. Please choose a smaller format."
                    ),
                },
            )
    except HTTPException:
        shutil.rmtree(output_dir, ignore_errors=True)
        raise
    except DownloadDeliveryError as exc:
        shutil.rmtree(output_dir, ignore_errors=True)
        raise HTTPException(
            status_code=422,
            detail={
                "code": exc.code,
                "message": exc.message,
            },
        ) from exc
    except Exception as exc:
        shutil.rmtree(output_dir, ignore_errors=True)
        raise HTTPException(
            status_code=500,
            detail={
                "code": "internal_error",
                "message": "An unexpected error occurred.",
            },
        ) from exc
    finally:
        download_slots.release()

    return FileResponse(
        path=output_path,
        filename=job.get("filename") or output_path.name,
        media_type="application/octet-stream",
        background=BackgroundTask(
            shutil.rmtree,
            output_dir,
            ignore_errors=True,
        ),
    )
