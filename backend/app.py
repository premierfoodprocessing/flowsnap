
import shutil
import tempfile
from pathlib import Path

from fastapi import FastAPI, HTTPException, Response
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

analysis_store = AnalysisStore()
download_job_store = DownloadJobStore()
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
def media_info(request: MediaRequest) -> dict:
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
def media_formats(request: MediaRequest) -> dict:
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
) -> dict:
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
def media_download(job_id: str):
    job = download_job_store.consume(job_id)

    if job is None:
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
        )
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
