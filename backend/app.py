
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl
from fastapi.middleware.cors import CORSMiddleware

from services.extractor import (
    MediaExtractionError,
    get_formats,
    get_metadata,
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


@app.get("/")
def root() -> dict[str, str]:
    return {
        "name": "FlowSnap",
        "version": "0.1.0",
        "status": "online",
    }


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
        return get_formats(str(request.url))
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
