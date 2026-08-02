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
