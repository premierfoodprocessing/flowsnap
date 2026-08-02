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
