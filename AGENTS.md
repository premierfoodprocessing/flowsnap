# FlowSnap Project Instructions

## Project purpose

FlowSnap is a multi-platform public-media metadata and authorised-download workflow application.

Initial platforms:

- YouTube
- TikTok
- Instagram
- Facebook

## Current architecture

- Backend: FastAPI
- Runtime: Python 3.12
- Media extraction: yt-dlp
- Media processing: FFmpeg
- Frontend: HTML, CSS, and JavaScript
- Static hosting: GitHub Pages
- Local backend: http://127.0.0.1:8001
- Local frontend: http://127.0.0.1:5500

## Important files

- backend/app.py
- backend/services/extractor.py
- backend/requirements.txt
- index.html
- script.js
- styles.css
- docs/DEVLOG.md

## Development rules

- Inspect git status before editing.
- Preserve the current frontend and backend structure unless a change is justified.
- Do not weaken authorised-use messaging.
- Do not add download bypasses for protected, private, restricted, or unauthorised content.
- Do not store user media unnecessarily.
- Maintain clear error handling for unsupported links, forbidden access, cookie requirements, and extraction failures.
- Update docs/DEVLOG.md after meaningful development work.
- Run relevant checks after changing Python or JavaScript.
- Do not change CORS origins without explaining why.
- Do not install dependencies without Gee's approval.
- Do not commit or push without Gee's approval.
- For hands-on development, browser review or local workflow testing, start all
  relevant local engines with `./scripts/start-dev.sh` after the initial
  repository inspection. Confirm both the frontend and backend are reachable
  before reporting that the environment is ready. Do not start services for a
  report-only, documentation-only or planning-only session unless Gee asks.
- Use `./scripts/stop-dev.sh` when Gee is finished testing or asks to stop the
  local environment.

## Known platform behaviour

Recent live testing found:

- YouTube currently fails.
- Instagram and Facebook may expose video without audio.
- TikTok may expose both video-and-audio and video-only options.
- TikTok extraction has previously returned HTTP 403 errors.

Verify current behaviour rather than assuming these results remain unchanged.

## Session startup

At the beginning of a new session:

1. Greet Gee.
2. Check the current directory.
3. Check git status.
4. Read docs/DEVLOG.md.
5. Summarise where development stopped.
6. Give Gee a concise project roadmap showing:
   - Work completed.
   - Work currently in progress.
   - Work still to be done, in recommended order.
7. Ask what Gee wants to work on, unless he already provided a task.
8. Recheck FS-015 on the affected Wi-Fi network and update `docs/ISSUES.md`
   with the outcome.

## Issue Register

- Maintain `docs/ISSUES.md` as the dedicated permanent bug register.
- Log every confirmed bug or production limitation, whether open, monitoring,
  external, investigating or fixed.
- When a bug is fixed, update its existing entry with the resolution and
  verification evidence; never delete its history.
- Add newly discovered confirmed bugs promptly, including environment, impact,
  reproduction evidence and next action.

## Personal address preferences

- Address the user as Captain.
- The user calls the assistant Uno, short for Ubuntu Number One.
