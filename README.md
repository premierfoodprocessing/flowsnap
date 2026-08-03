# FlowSnap

FlowSnap is a lightweight multi-platform media workflow with a responsive static frontend and a FastAPI processing backend.

The project accepts authorised public media URLs, extracts metadata, presents sanitized format options, prepares short-lived download jobs and delivers completed files through the browser.

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
- Secure one-time download jobs
- Isolated temporary download directories and automatic cleanup
- Browser file delivery with same-backend URL validation
- Public FastAPI backend on Render
- Automatic local/production API selection

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

Current test baseline after the deployment connection:

- Frontend suite: 21 passed
- Backend download-enabled suite: 35 passed, 1 live test skipped

## API endpoints

- `GET /`
- `GET /health`
- `POST /api/media/info`
- `POST /api/media/formats`
- `POST /api/media/prepare`
- `GET /api/media/download/{job_id}`
- Interactive documentation: `http://127.0.0.1:8000/docs`
- Public API: `https://flowsnap-api.onrender.com`

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

- TikTok may return changing JavaScript challenges or temporary HTTP 403 responses.
- Render's free service may sleep after inactivity, making the first request slower.
- Downloads depend on each source platform permitting server-side access.
- Download jobs and media analyses are held in application memory and are cleared when the backend restarts.
- Render's filesystem is temporary; FlowSnap intentionally removes completed download files after delivery.
## Responsible use

FlowSnap should only process public content that the user owns or is authorised to save. Platform rules, copyright and applicable laws must be respected.
