# FlowSnap

FlowSnap is a lightweight multi-platform media workflow with a responsive static frontend and a FastAPI processing backend.

The project currently accepts public media URLs, extracts metadata, reports structured errors and returns sanitized format options. Actual media downloading is not yet enabled.

## Current features

- Responsive one-page frontend
- Clipboard paste and URL validation
- FastAPI backend
- Health and status endpoints
- Media metadata extraction
- Sanitized media-format options
- TikTok-specific browser impersonation
- Structured API error responses
- Media preview card
- Automated unit, API and live integration tests
- One-command development controls
- GitHub Pages-compatible frontend
- Automatic preferred-format selection
- Temporary opaque analysis identifiers
- Short-lived in-memory media analysis storage
- Validated download-preparation requests
- Structured preparation errors for expired analyses and unavailable formats

## Development controls

From the project root:

```bash
# Start the backend and frontend
./scripts/start-dev.sh

# Check servers and script syntax
./scripts/check-dev.sh

# Run checks and stable automated tests
./scripts/check-dev.sh --tests

# Run checks, stable tests and live integration tests
./scripts/check-dev.sh --live

# Stop the development servers
./scripts/stop-dev.sh


```

The start script opens dedicated terminal windows for:

- FastAPI on `http://127.0.0.1:8000`
- Frontend on `http://127.0.0.1:5500`

It then opens FlowSnap in the default browser and avoids starting duplicate servers.

## Automated tests

Development dependencies are stored separately in `backend/requirements-dev.txt`.

Run the stable backend suite:

```bash
cd backend
source .venv/bin/activate
python -m pytest
```

Run the live-enabled backend suite:

```bash
python -m pytest --run-live
```

Run the frontend suite:

```bash
cd ..
node --test frontend-tests/*.test.mjs
```

Current test baseline:

- Frontend suite: 11 passed
- Backend stable suite: 19 passed, 1 live test skipped
- Backend live-enabled suite: 20 passed

## API endpoints

- `GET /`
- `GET /health`
- `POST /api/media/info`
- `POST /api/media/formats`
- `POST /api/media/prepare`
- Interactive documentation: `http://127.0.0.1:8000/docs`

## Project structure

```text
FlowSnap/
├── backend/
│   ├── services/
│   ├── tests/
│   ├── app.py
│   ├── pytest.ini
│   ├── requirements.txt
│   └── requirements-dev.txt
├── docs/
│   └── DEVLOG.md
├── frontend-tests/
├── scripts/
│   ├── start-dev.sh
│   ├── check-dev.sh
│   └── stop-dev.sh
├── format-utils.mjs
├── index.html
├── script.js
└── styles.css
```

## Current limitations

- The GitHub Pages frontend still points to a backend running on `127.0.0.1`.
- Public visitors cannot process links until the backend is deployed.
- TikTok may return changing JavaScript challenges or temporary HTTP 403 responses.
- Format options are displayed but cannot yet initiate downloads.
- Actual media downloading is not yet implemented.
- Download preparation is implemented, but actual file delivery is not yet enabled.
- Prepared download jobs are not yet stored or served by a download endpoint.
- The temporary analysis store is held in application memory and is cleared when the backend restarts.
## Responsible use

FlowSnap should only process public content that the user owns or is authorised to save. Platform rules, copyright and applicable laws must be respected.
