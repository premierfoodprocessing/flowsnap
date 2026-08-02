# FlowSnap Development Log

---

## 2026-07-31 - Session 1: The Beginning

Today FlowSnap became a real software project.

### Completed

- Created the GitHub repository.
- Published the first live website using GitHub Pages.
- Moved the project into a dedicated Development folder.
- Created the Python virtual environment.
- Installed FastAPI, Uvicorn, yt-dlp and FFmpeg.
- Built the first FastAPI backend.
- Created the first API endpoints:
  - /
  - /health
- Added a proper .gitignore.
- Created the initial project structure.

### Notes

Today's objective was not features.

Today's objective was building a solid foundation.

The frontend is now live on GitHub Pages.

The backend is running locally and responding successfully.

The project is now ready for real development.

---

Next milestone:

Build the Media Engine.

Accept a URL.

Identify the platform.

Return metadata.

No downloading yet.



---

## 2026-08-02 - Session 2: The Media Engine

FlowSnap can now accept a public media URL and request metadata from its local processing API.

### Completed

- Created the media extraction service in `backend/services/extractor.py`.
- Added the `/api/media/info` API endpoint.
- Added structured extraction errors for:
  - Platform access restrictions
  - Private or permission-controlled media
  - Unsupported URLs
  - General extraction failures
- Configured CORS for:
  - The live GitHub Pages website
  - Local frontend development
- Connected the frontend Continue button to the FastAPI backend.
- Successfully extracted metadata from a public TikTok video.
- Added TikTok-specific Chrome impersonation for JavaScript challenge compatibility.
- Added frontend handling for API and connection errors.
- Added a media preview card for:
  - Thumbnail
  - Title
  - Creator
  - Duration
  - Platform
  - Original source link
- Added Python cache exclusions to `.gitignore`.
- Validated the JavaScript syntax and Git whitespace checks.

### Technical Finding

TikTok may return JavaScript challenges or HTTP 403 responses after repeated requests.

FlowSnap now reports these failures clearly instead of presenting a generic server error. Chrome impersonation improved TikTok compatibility, but rate limiting and platform-side access controls must be considered before public backend deployment.

### Current Status

The Media Engine is implemented and has successfully returned TikTok metadata.

The local frontend and backend are connected.

The media preview interface is implemented and awaiting final successful browser verification after TikTok’s temporary access restriction clears.

---

Next milestone:

Verify the media preview card with a successful extraction.

Add controlled download formats and an authorised download endpoint.

Prepare the backend for public deployment.




---

## 2026-08-02 - Session 3: End-to-End Verification

### Completed

- Tested the backend root and health endpoints.
- Verified malformed and unsupported URL handling.
- Confirmed successful metadata extraction using MDN's public example video.
- Verified the complete frontend-to-backend workflow.
- Confirmed the media result card displays extracted metadata.
- Updated the result card to hide the preview pane when no thumbnail is available.
- Revalidated JavaScript syntax and Git whitespace checks.

### Result

FlowSnap's metadata workflow now works from browser submission through backend extraction and frontend presentation.

TikTok compatibility remains dependent on TikTok's changing access controls, but FlowSnap handles those failures cleanly.


---

## 2026-08-02 - Session 4: Automated Testing Foundation

### Completed

- Added pytest and a dedicated development requirements file.
- Added a clean FastAPI TestClient configuration using httpx2.
- Created permanent automated tests for:
  - Root service status
  - Health status
  - Invalid URL validation
  - Successful metadata responses
  - Structured extraction errors
  - Hidden internal server errors
- Added registered test switches for:
  - Live external-platform tests
  - Future download-feature tests
- Added an opt-in live integration test using MDN's public demonstration video.
- Added a gated failing test for the future formats endpoint.
- Used the failing test to implement `/api/media/formats`.
- Added sanitized media-format extraction.
- Added unit coverage for:
  - Audio-only format exclusion
  - Combined audio/video formats
  - Video-only formats
  - Resolution and quality labels
  - Exact and approximate file sizes
- Promoted the completed formats-endpoint test into the permanent regression suite.

### Test-Driven Findings

The initial suite discovered that unexpected API errors returned a different response structure from known extraction errors.

The API was corrected to return a consistent `internal_error` code and safe public message.

The formats feature then completed a deliberate red-to-green cycle:

1. Activated test returned HTTP 404.
2. Formats endpoint and extraction service were implemented.
3. Test passed.
4. Test was promoted into the permanent suite.

### Current Test Baseline

- Standard suite: 9 passed, 1 live test skipped.
- Live-enabled suite: 10 passed.
- No warnings.

---

Next milestone:

Display available media formats in the frontend.

Create the next gated test for authorised media downloading.



---

## 2026-08-03 - Session 5: Developer Toolkit and Live Format Regression

### Completed

- Live-tested the new `/api/media/formats` endpoint.
- Discovered that direct media files with unknown codec values were incorrectly excluded.
- Inspected the raw yt-dlp format contract.
- Added a regression test for direct media with unknown codecs.
- Updated format classification to distinguish unknown codecs from explicit `none` codecs.
- Verified the correction with stable and live test suites.
- Added `scripts/start-dev.sh` to launch both servers and open FlowSnap.
- Added duplicate-server protection.
- Added `scripts/check-dev.sh` with stable and live test switches.
- Added server health, script syntax and Git whitespace checks.
- Added `scripts/stop-dev.sh` with project-directory safety checks.
- Configured launcher terminals to close when their server processes stop.
- Replaced the outdated frontend-only README with current development documentation.

### Current Test Baseline

- Stable suite: 10 passed, 1 live test skipped.
- Live-enabled suite: 11 passed.
- All server, launcher syntax and Git whitespace checks pass.

### Development Commands

```bash
./scripts/start-dev.sh
./scripts/check-dev.sh --tests
./scripts/check-dev.sh --live
./scripts/stop-dev.sh
