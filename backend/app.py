from fastapi import FastAPI

app = FastAPI(
    title="FlowSnap API",
    version="0.1.0",
    description="Multi-platform media metadata and download API.",
)


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
