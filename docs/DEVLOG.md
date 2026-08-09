## FlowSnap Development Log

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
```

---

## 2026-08-03 - Session 6: Tested Frontend Format Options

### Completed

- Added frontend tests using Node's built-in test runner.
- Added tested file-size and format-description utilities.
- Enriched `/api/media/formats` with preview metadata.
- Avoided extracting the same platform URL twice.
- Connected the result card to the formats endpoint.
- Added visible format quality, file type, size and audio status.
- Added frontend tests and module syntax checks to `check-dev.sh`.
- Verified the interface using MDN's public flower video.
- Completed the previously truncated README.

### Test Baseline

- Frontend suite: 5 passed.
- Backend stable suite: 11 passed, 1 live test skipped.
- Backend live-enabled suite: 12 passed.
- Full development checker: passed.

### Result

FlowSnap now retrieves preview metadata and format options in one extraction and displays them in the browser.

---

Next milestone:

Add format selection and create a gated test for the authorised download endpoint.


---

## 2026-08-03 - Session 7: Secure Download Preparation

### Completed

- Added automatic preferred-format selection.
- Preferred the highest-quality combined video-and-audio format.
- Added accessible selectable format controls.
- Added tested preparation-payload creation.
- Added opaque media-analysis identifiers.
- Added short-lived in-memory analysis storage.
- Added analysis expiry handling.
- Added download-preparation service validation.
- Added `/api/media/prepare`.
- Added structured errors for expired analyses and unavailable formats.
- Verified the preparation workflow in the browser.
- Promoted all completed preparation tests into the permanent suite.

### Security Design

The browser submits only an opaque analysis ID and selected format ID.

The backend retrieves the trusted stored analysis and validates the requested format. The browser does not supply a raw download URL.

### Test Baseline

- Frontend suite: 11 passed.
- Backend stable suite: 19 passed, 1 live test skipped.
- Backend live-enabled suite: 20 passed.

### Current Boundary

FlowSnap can analyse, select and prepare a media format.

Actual file delivery remains disabled.

---

Next milestone:

Create a gated failing test for controlled file delivery.

Keep monetisation readiness and responsible ad placement in the design.


---

## 2026-08-03 - Session 8: Download Delivery and Public Backend

### Completed

- Added secure, short-lived, one-time download jobs.
- Added selected-format delivery through yt-dlp.
- Isolated every delivery in a temporary directory.
- Added path validation and automatic temporary-file cleanup.
- Connected the frontend Prepare download action to browser file delivery.
- Verified a complete YouTube workflow from link analysis to a playable MP4 with video and audio.
- Expanded the verified baseline to 18 frontend tests and 33 passing backend tests with one intentional live-platform skip.
- Deployed the FastAPI backend to Render at `https://flowsnap-api.onrender.com`.
- Verified the public root and `/health` endpoints.
- Added automatic frontend API selection: Render for the published site and `127.0.0.1:8000` for local development.
- Added production-routing and GitHub Pages CORS regression tests.

### Result

FlowSnap now has a working end-to-end download pipeline and a publicly reachable backend. The GitHub Pages frontend is ready to use Render without disrupting local development.

### Current Test Baseline

- Frontend suite: 21 passed.
- Backend download-enabled suite: 35 passed, 1 live test skipped.


---

## 2026-08-04 - Session 9: Audio-Aware Format Delivery

### Completed

- Preserved the selected format's audio capability in short-lived download jobs.
- Returned `has_audio` in the download-preparation response.
- Kept combined video-and-audio formats on their original yt-dlp selector.
- Added automatic best-audio merging for video-only formats.
- Added a selected-video-only fallback when no separate audio stream is available.
- Added regression coverage for both combined and video-only formats.
- Verified the complete download-enabled backend suite.

### Delivery Design

Formats that already contain audio use their selected format ID directly.

Video-only formats use `selected-format+bestaudio/selected-format`, allowing yt-dlp to merge the best available audio while retaining a safe video-only fallback.

### Current Test Baseline

- Frontend suite: 21 passed.
- Backend stable suite: 21 passed, 16 gated tests skipped.
- Backend download-enabled suite: 36 passed, 1 live-platform test skipped.

### Result

FlowSnap now preserves audio-aware format information throughout preparation and delivery. Selecting a higher-quality video-only format no longer silently prevents yt-dlp from including available audio.

---

Next milestone:

Verify the audio-aware workflow with a live YouTube download, then deploy the backend update and confirm production delivery.


---

## 2026-08-04 - Session 10: Environment-Aware yt-dlp Configuration

### Completed

- Added a shared environment-aware yt-dlp configuration service.
- Applied the shared configuration to metadata extraction, format discovery and file delivery.
- Added optional Deno JavaScript runtime configuration.
- Added optional remote EJS component support for YouTube extraction.
- Added optional Chromium cookie loading for local development.
- Kept browser-cookie loading disabled by default for production safety.
- Added `backend/.env.example` documenting the available configuration.
- Excluded the private `backend/.env` file from Git.
- Added unit tests for safe defaults and configured local operation.
- Added a dedicated live YouTube metadata test while retaining the generic MDN media test.
- Verified successful live extraction from both MDN and YouTube.

### Configuration Design

FlowSnap now builds yt-dlp options from environment variables through one shared configuration service.

Local development can enable Deno, remote EJS components and Chromium cookies without placing machine-specific paths or private browser data in source control. Production continues to use safe defaults unless the corresponding environment variables are explicitly configured.

### Test Baseline

- Standard backend suite: 23 passed, 17 gated tests skipped.
- Live extraction suite: 2 passed.
- Verified platforms in the live suite: generic public media and YouTube.
- Working tree passed `git diff --check`.

### Result

FlowSnap can successfully extract current YouTube metadata using optional local compatibility settings while preserving safe production defaults.

The shared configuration is also available to the download-delivery path.

---

Next milestone:

Verify an audio-aware YouTube file download locally, deploy the backend configuration update and confirm production delivery.

---

## 2026-08-04 - Session 11: Live Audio-Aware YouTube Delivery Verification

### Completed

- Ran the FlowSnap backend and frontend locally.
- Analysed a live public YouTube video through the browser workflow.
- Selected a `240p · MP4 · 223.8 KB · video only` source format.
- Prepared and completed the download through FlowSnap.
- Confirmed that the downloaded file played with both picture and sound.
- Inspected the completed file with `ffprobe`.
- Verified separate video and audio streams in the delivered MP4.

### Verification Result

The completed file contained:

- Video: H.264 at 320 × 240.
- Audio: Opus.
- Container: MP4.
- Source selection: video only.

This confirms that FlowSnap’s delivery service successfully used the audio-aware selector to retrieve and merge the best available audio with the selected video-only stream.

### Result

The complete local workflow is now verified:

1. Analyse a public YouTube link.
2. Display available formats.
3. Select a video-only format.
4. Prepare a secure, short-lived download job.
5. Retrieve and merge the selected video with audio.
6. Deliver a playable file containing both streams.

---

Next milestone:

Deploy the environment-aware backend update to Render, configure the required production-safe extraction settings and verify the complete production delivery workflow.


## 2026-08-05 - Session 12: Clear Platform Errors and Audio Selection Guidance

### Completed

- Identified YouTube sign-in and bot-confirmation challenges during format discovery.
- Returned a structured `platform_blocked` error when YouTube refuses access from the download server.
- Added regression coverage for YouTube bot-challenge detection.
- Added a tested frontend rule for identifying video-only format selections.
- Added a dynamic interface notice explaining that FlowSnap will add audio during preparation.
- Updated the notice automatically when the default or user-selected format changes.
- Hid the notice when the selected format already contains audio.
- Added accessible live-status behaviour and matching warning styling.

### Error Handling

When YouTube returns a sign-in or bot-confirmation challenge, FlowSnap now reports:

`YouTube is temporarily refusing access from FlowSnap's download server. Please try again later.`

This prevents the temporary platform restriction from being presented as an unsupported link or unexplained extraction failure.

### Audio Guidance

When a video-only format is selected, the interface now explains:

`This format contains video only. FlowSnap will add audio during preparation.`

The notice disappears automatically when the selected format already includes audio.

### Test Baseline

- Frontend suite: 24 passed.
- Standard backend suite: 24 passed, 17 gated tests skipped.
- Download-enabled backend suite: 39 passed, 2 live-platform tests skipped.
- Working tree passed `git diff --check`.

### Result

FlowSnap now communicates both temporary YouTube access restrictions and audio-aware format behaviour more clearly. Users receive an actionable platform message when YouTube blocks the server and reassurance that video-only selections will receive audio during preparation.

---

Next milestone:

Deploy the environment-aware backend and interface updates, configure the required production-safe yt-dlp settings on Render and verify the complete production workflow.

---

## 2026-08-07 - Session 13: In-Page Download Error Handling

### Completed

- Resolved FS-005.
- Replaced direct browser navigation to the delivery endpoint with a frontend-managed file request.
- Kept users on the FlowSnap page when delivery fails.
- Displayed structured backend delivery errors in the existing preparation-status area.
- Added frontend regression tests for successful file delivery and failed delivery responses.

### Result

A failed prepared download no longer replaces FlowSnap with raw backend JSON. Successful responses still start a normal browser file save.

---

## 2026-08-07 - Session 14: Production Platform Verification

### Verified

- Pushed and deployed the FS-005 frontend correction.
- Confirmed successful TikTok delivery locally and in production.
- Confirmed Instagram video-only selections receive audio and produce playable files locally and in production.
- Confirmed Facebook video-only selections receive audio and produce playable files locally and in production.
- Confirmed YouTube works locally but remains blocked from the Render backend with FlowSnap's structured platform message.

### Decisions

- FS-005 is production-verified and complete.
- FS-002 remains open, but further YouTube investigation is deferred until the other issues have been addressed.
- FS-003 requires reproduction with the affected TikTok link and format before changing format classification or delivery behavior.

### Result

TikTok, Instagram and Facebook completed successful production downloads. Instagram and Facebook also verified FlowSnap's audio-aware merge path. YouTube remains the only currently verified platform blocked in production.

---

## 2026-08-07 - Session 15: Delivery Reuse Investigation

### Investigated

- Traced the repeated extraction to the delivery service's second `extract_info()` call.
- Confirmed yt-dlp can process an already-resolved analysis without revisiting the platform page.
- Evaluated retaining that processed analysis in FlowSnap's short-lived stores.

### Security Finding

The processed result contains signed direct-media URLs and may contain sensitive request headers. Retaining it would conflict with FlowSnap's credential-safety requirements. The reuse implementation was therefore rejected before release.

### Current Status

FS-006 remains under investigation. A safe solution must reduce repeated platform extraction without copying platform tokens or cookies into application stores.

---

## 2026-08-07 - Session 16: Backend Health and Favicon Routes

### Completed

- Resolved FS-008 by adding explicit support for `HEAD /`.
- Preserved the existing JSON response for `GET /`.
- Resolved FS-009 by serving the existing FlowSnap SVG favicon from `/favicon.ico`.
- Added API regression coverage for both routes.

### Test Baseline

- Stable backend suite: 26 passed, 17 gated tests skipped.
- Delivery, format and preparation service subset: 14 passed.
- Python compilation, direct route checks and Git whitespace validation passed.

### Result

Render and other automated probes can check the backend root without receiving `405 Method Not Allowed`, and browser favicon requests no longer add `404 Not Found` noise to backend logs.

---

## 2026-08-07 - Session 17: Actionable Monetisation Roadmap

### Completed

- Expanded the monetisation strategy into an implementation roadmap.
- Defined commercial and premium-feature safety boundaries.
- Prioritised voluntary support, sponsorship, advertising, affiliate and premium channels.
- Specified responsible placement and privacy-preserving measurement rules.
- Added reliability, compliance, operations and user-experience readiness gates.
- Added milestones M0 through M4 with deliverables and exit criteria.
- Added provider evaluation, operating-cost and launch-pause frameworks.
- Created the MON-001 through MON-008 implementation backlog.

### Current Status

FlowSnap is at monetisation milestone M0. The next enabling task is privacy-safe request and job tracing through FS-007/MON-001.

---

## 2026-08-07 - Session 18: Actionable SEO Roadmap

### Completed

- Audited the current static site for search readiness.
- Identified outdated homepage, FAQ, Privacy and Terms claims as the first trust issue.
- Defined search-safety boundaries based on current Google Search guidance.
- Specified legitimate search intents, topic clusters and platform-page gates.
- Proposed a crawlable information architecture and technical SEO requirements.
- Added content-quality, authority, performance and measurement standards.
- Added milestones S0 through S4 with deliverables and exit criteria.
- Created the SEO-001 through SEO-012 implementation backlog.
- Connected SEO milestones to FlowSnap's monetisation readiness plan.

### Current Status

FlowSnap is at SEO milestone S0. The next task is SEO-001: replace outdated public claims so the site accurately describes the live processing and download workflow.

---

## 2026-08-07 - Session 19: Accurate Public Product Copy

### Completed

- Completed SEO-001.
- Updated the homepage title and description for the live authorised workflow.
- Replaced static-demonstration and future-backend statements.
- Updated How It Works to describe analysis, format selection and one-time delivery.
- Replaced outdated FAQ entries with current platform, audio and responsible-use guidance.
- Preserved clear platform limitations and authorised-use boundaries.
- Added regression tests preventing obsolete demonstration claims from returning.

### Current Status

SEO milestone S0 is in progress. The next task is SEO-002: update Privacy and Terms for the live backend processing workflow.

---

## 2026-08-07 - Session 20: Live Processing Policies

### Completed

- Completed SEO-002.
- Replaced static-demonstration Privacy and Terms content.
- Documented submitted-link and extracted-metadata processing.
- Documented the 10-minute analysis and 5-minute prepared-job limits.
- Documented one-time jobs, temporary files and cleanup behavior.
- Identified GitHub Pages, Render and source platforms in the data flow.
- Clarified that accounts, application analytics, advertising and FlowSnap tracking cookies are not currently active.
- Updated authorised-use, prohibited-use, platform-availability and non-affiliation terms.
- Added regression coverage for current processing and retention statements.

### Review Boundary

A monitored contact and takedown channel remains required under SEO-003. Qualified legal review remains a prerequisite before commercial features are activated.

### Current Status

SEO milestone S0 is in progress. The next task is SEO-003: add Contact and Copyright/Takedown pages using an approved monitored contact address.

---

## 2026-08-07 - Session 21: Public Contact and Takedown Process

### Completed

- Completed SEO-003.
- Published `flowsnap.support@gmail.com` as the approved monitored contact.
- Added a public Contact page for support, privacy, accessibility, security and responsible-use questions.
- Added a Copyright and Takedown Requests page with clear information requirements.
- Added warnings against sending passwords, cookies, API keys or unauthorised private links.
- Linked Contact and Copyright pages from the homepage, Privacy and Terms.
- Removed the remaining planned-contact wording.
- Added regression coverage for contact consistency and takedown guidance.

### Current Status

SEO milestone S0 is in progress. The next task is SEO-004: publish the current verified platform-support matrix.

---

## 2026-08-07 - Session 22: Verified Platform Status Page

### Completed

- Completed SEO-004 and SEO milestone S0.
- Added a public Supported Platforms and Current Status page.
- Published separate local and production results for TikTok, Instagram, Facebook and YouTube.
- Documented TikTok's intermittent access, duplicate-format and historical audio-label limitations.
- Documented Instagram and Facebook video-only detection and verified audio-aware delivery.
- Clearly marked YouTube as locally verified but currently unavailable through the production backend.
- Added responsible-use, verification-date and no-guarantee language.
- Linked the status page from the homepage FAQ and footer.
- Added regression coverage for platform results and limitations.

### Current Status

SEO milestone S0 is complete. The next milestone is S1, beginning with SEO-005: choose the long-term production domain and canonical URL convention.

---

## 2026-08-07 - Session 23: Hosting Safety and Cost Planning

### Completed

- Added configurable maximum output-size, concurrent-download and request-rate safeguards.
- Set conservative beta defaults of 100 MB per output, one active media build, 60 API requests per client per minute and 12 expensive requests per client per minute.
- Preserved one-time jobs and temporary-file cleanup for rejected or failed delivery work.
- Added structured `429`, `503` and `413` responses for rate, capacity and size limits.
- Documented dated infrastructure estimates without purchasing, provisioning or migrating services.
- Recorded Render and GitHub Pages as the current deployment, with Koyeb and Cloudflare R2 retained only as future candidates.

### Current Status

The safeguards are implemented locally and require automated verification before deployment. Infrastructure selection remains deferred until measured beta traffic and launch requirements are available.

---

## 2026-08-07 - Session 24: Privacy-Safe Workflow Tracing

### Completed

- Completed FS-007 and MON-001.
- Added operational events for format analysis, download preparation and delivery.
- Carried an opaque internal workflow marker from analysis into the one-time download job without exposing it through the API.
- Logged only event names, outcomes, structured error codes and short hashes of random request, workflow, analysis and job identifiers.
- Explicitly excluded URLs, titles, filenames, raw identifiers, client addresses, cookies and credentials from workflow logs.
- Added regression coverage for stable safe references, prohibited values and internal trace propagation.

### Current Status

FS-007 is resolved. Monetisation milestone M0 remains in progress; the next enabling task is MON-002: define aggregate analytics events and prohibited fields.

---

## 2026-08-07 - Session 25: Mobile Download Controls

### Completed

- Completed FS-011 and MON-005.
- Allowed long media titles, filenames and preparation status messages to wrap safely on narrow screens.
- Stacked mobile format descriptions and selection status to prevent horizontal crowding.
- Changed mobile previews to a responsive 16:9 ratio.
- Added spacing around the preparation area and preserved a full-width 48-pixel minimum touch target.
- Added frontend regression coverage for the critical responsive rules.
- Clarified that Facebook and similar selections can begin as video-only source streams while the completed file receives separate audio when available.

### Current Status

FS-011 is resolved. Monetisation milestone M0 remains in progress; MON-002 is the next enabling task.

---

## 2026-08-08 - Session 26: Aggregate Analytics Data Boundary

### Completed

- Completed MON-002 without enabling analytics or adding third-party scripts.
- Defined provider-neutral aggregate event names for page use, analysis,
  preparation, delivery and future revenue placements.
- Limited analytics dimensions to fixed page categories, supported-platform
  names, broad outcomes, approved error codes and approved placement keys.
- Prohibited URLs, media details, workflow identifiers, IP addresses, contact
  details, cookies, fingerprints, credentials and individual histories.
- Required explicit event and field allowlists that drop unknown data.
- Defined a 24-hour aggregation target, a seven-day hard ceiling for temporary
  event-level records and a 13-month maximum for daily aggregate counts.
- Documented deletion, implementation, policy-update, consent-review and test
  gates that must pass before analytics can be enabled.
- Kept aggregate analytics separate from privacy-safe operational tracing.
- Reconciled MON-004's backlog status with the policy, contact and takedown
  pages completed in Sessions 20 and 21.

### Current Status

Analytics remains disabled. Monetisation milestone M0 remains in progress; the
next enabling task is MON-003: define rate limits, file limits and monthly cost
thresholds from observed usage.

---

## 2026-08-08 - Session 27: Beta Limits and Cost Thresholds

### Completed

- Defined the MON-003 policy without changing the existing runtime limits.
- Confirmed the provisional beta defaults of a 100 MB output, one concurrent
  build, 60 total requests and 12 expensive requests per client per minute.
- Documented why application rate limits remain per-instance safeguards rather
  than replacements for provider-level controls.
- Added monthly budget responses at 50%, 75%, 90% and 100%, plus review for an
  unexpected day consuming more than 10% of the monthly budget.
- Defined a 30-day aggregate observation window and the reliability, resource,
  transfer and cost measures required before limits can be called demand-based.
- Added rules for raising, lowering or pausing capacity.
- Documented all existing hosting-limit variables in `backend/.env.example`.

### Current Status

The MON-003 policy is defined, but MON-003 remains in progress until a
representative 30-day observation window is complete and production budget
alerts are configured. MON-006 may be developed in parallel, but FlowSnap
cannot advance past M0 until the MON-003 evidence is recorded.

---

## 2026-08-08 - Session 28: Observation Runbook and Delivery Pause

### Completed

- Added a privacy-safe 30-day operations worksheet using aggregate daily
  reliability, capacity, transfer and cost totals only.
- Added weekly review instructions tied to the MON-003 budget thresholds.
- Added `FLOWSNAP_DELIVERY_ENABLED` as an emergency application control.
- Kept delivery enabled by default.
- Made the disabled state reject both download preparation and file delivery
  with a structured `503 delivery_paused` response and `Retry-After` header.
- Kept health, public status and media analysis available during a pause.
- Documented production pause, verification and resume procedures without
  changing the current Render configuration.
- Added regression coverage for configuration parsing and both paused routes.

### Verification

- Stable backend suite: 35 passed, 20 gated tests skipped.
- Download-enabled backend suite: 53 passed, 2 live tests skipped.
- Focused hosting, preparation and delivery suite: 17 passed.
- Frontend automated tests: passed.
- Frontend module and launcher syntax checks: passed.
- Git whitespace check: passed after the final changes.

### Test Environment Finding

The default asyncio event loop in the current command environment could not
wake work scheduled from another thread. This caused AnyIO's blocking portal
and Starlette TestClient to stall, including for a minimal application unrelated
to FlowSnap. The already-installed uvloop implementation completed the same
cross-thread TestClient request successfully.

FlowSnap now creates its test clients through one helper configured with
uvloop. No dependency version was changed. Both stable and download-enabled
backend suites complete normally with this test configuration.

### Current Status

The local observation package and emergency delivery control are ready for
review. Render settings were not changed, and the 30-day observation period has
not started.

---

## 2026-08-09 - Session 29: Production Delivery-Pause Verification

### Completed

- Deployed commit `4b3b4e8` through Render.
- Added `FLOWSNAP_DELIVERY_ENABLED` to the production environment.
- Confirmed the production root and health checks return `200`.
- Temporarily set delivery to `false` for a controlled emergency-pause test.
- Verified a harmless preparation request returned structured
  `503 delivery_paused` without contacting a media platform.
- Restored delivery to `true` and redeployed immediately.
- Verified the same fake request returned the normal `422 analysis_expired`
  response, confirming preparation was available again.
- Recorded the production verification in the operations runbook.

### Current Status

Production delivery is enabled and healthy. The emergency pause procedure is
verified end to end. MON-003 remains in progress until notification and budget
controls are configured and the 30-day observation period is completed.

---

## 2026-08-09 - Session 30: Production Observation Started

### Completed

- Enabled Render's default service notifications.
- Inspected the workspace Billing and Usage interface.
- Confirmed the current interface does not expose a cost-control or
  spending-alert option for this workspace.
- Retained the MON-003 manual weekly cost review as the active fallback.
- Kept the approved monthly budget and billing details outside the repository
  and chat.
- Started the 30-day production observation window on 2026-08-09, with day 30
  planned for 2026-09-07.

### Current Status

MON-003 production observation is active. The emergency delivery control and
service notifications are configured. Weekly manual Billing and Usage reviews
are required because native spending alerts are not available in the current
Render interface.

---

## 2026-08-09 - Session 31: Disabled Revenue Placement Component

### Completed

- Completed MON-006 without enabling monetisation.
- Added one provider-neutral placement after the hero result and responsible-use
  notice, outside the media result and download controls.
- Added a hardcoded feature flag that defaults to `false`.
- Kept the disabled placement fully hidden with no reserved page space.
- Added a visible `Sponsored` label and separation disclosure for any future
  enabled state.
- Used neutral styling that does not resemble FlowSnap action buttons.
- Reserved stable desktop and mobile layout space only when the placement is
  enabled.
- Added no provider scripts, links, tracking calls or third-party requests.
- Added regression coverage for disabled state, placement separation,
  disclosure, responsive dimensions and prohibited provider markers.

### Verification

- Frontend automated tests: passed.
- Frontend module syntax: passed.
- Git whitespace check: passed.

### Current Status

MON-006 is complete, but the component remains disabled and monetisation is not
active. MON-003 observation continues through 2026-09-07. MON-007 provider
evaluation remains dependent on the outstanding MON-003 evidence and other
readiness gates.

---

## 2026-08-09 - Session 32: Controlled Direct Sponsorship Pipeline

### Completed

- Added a source-controlled direct-sponsorship configuration.
- Kept both the master placement flag and sponsorship entry disabled by default.
- Added validation for approved labels, required copy, HTTPS destinations,
  optional local images and UTC start/end dates.
- Restricted images to local files under `assets/sponsors/`.
- Required alternative text whenever a sponsorship image is configured.
- Rejected remote images, unsafe paths, non-HTTPS links, incomplete content,
  invalid dates, future entries and expired entries.
- Rendered sponsor fields with DOM text properties rather than raw HTML.
- Added `noopener`, `noreferrer` and `sponsored` link relationships.
- Avoided assigning an image source until a valid active sponsorship exists.
- Added a complete review, configuration, testing, publishing and emergency-off
  workflow in `docs/SPONSORSHIPS.md`.
- Added automated tests for disabled, active, invalid, scheduled and expired
  sponsorship configurations.

### Verification

- Frontend test files: 3 passed.
- Main, configuration and sponsorship module syntax checks: passed.
- Git whitespace check: passed.

### Current Status

The direct-sponsorship pipeline is implemented but remains disabled. No sponsor
content, provider script, tracking request or remote image is active. Publishing
the first sponsorship requires separate content approval, tests, commit, push
and controlled-launch review.

---

## 2026-08-09 - Session 33: Facebook Playback Compatibility

### Diagnosis

- Reproduced a reported Facebook Reel download through the local FlowSnap
  delivery path.
- Confirmed the automatically selected 1080-by-1920 stream contained 418 AV1
  video frames at 30 frames per second and clear AAC audio.
- Confirmed FFmpeg detected no frozen intervals in the downloaded stream.
- Identified AV1 playback performance or decoder compatibility as the reason
  the video could appear as slowly changing still images while audio remained
  clear.
- Verified Facebook's `hd` fallback produced H.264 video at 30 frames per
  second with the same 418-frame content.

### Changed

- Added a sanitized compatibility signal to extracted video formats.
- Marked H.264 streams and Facebook's direct `sd`/`hd` fallbacks as compatible.
- Changed automatic selection to prefer compatible formats while keeping AV1
  formats available for manual selection.
- Capped the recommended automatic choice at 720p when a known 720p-or-lower
  option is available; higher resolutions remain manually selectable.
- Marked the automatic choice as `Recommended` in the format list.
- Versioned the frontend module URLs so browsers load the new selection policy
  instead of retaining the earlier highest-resolution behavior.
- Corrected portrait quality labels to use the shorter image dimension, so
  1080-by-1920 is presented as 1080p rather than 1920p.
- Added backend and frontend regression coverage for Facebook compatibility,
  portrait labels and compatible default selection.

### Current Status

The compatibility change is implemented and verified locally. SEO and
domain-name selection remain paused; FlowSnapDL.com or a close variation is the
current preference for later review.

### Verification

- Focused format-extraction backend tests: 5 passed.
- Stable backend suite: 36 passed, 20 gated tests skipped.
- Download-enabled backend suite: 54 passed, 2 live tests skipped.
- Frontend automated tests: 51 passed.
- Python compilation, frontend module syntax and Git whitespace checks passed.
- The exact reported Facebook Reel resolved through the running local API with
  Facebook `hd` (720p) as the compatible recommended selection.

---

## 2026-08-09 - Session 34: Recommended-Quality Platform Verification

### Completed

- Recorded Gee's manual post-deployment verification of the recommended
  720p-or-lower selection.
- Confirmed Facebook, Instagram and TikTok produced good-quality, synchronized
  video and audio with the recommendation applied.
- Confirmed YouTube still refused extraction during the latest check.
- Updated the public platform-status page and its last-verified date.
- Retained TikTok's intermittent-access and historical audio-label disclosures.
- Added Facebook's higher-resolution AV1 playback limitation while keeping
  those formats available for manual selection.

### Current Status

Facebook, Instagram and TikTok are currently verified with the recommended
quality policy. YouTube remains unavailable in the latest check. MON-003's
30-day production observation continues, with the first weekly review planned
for approximately 2026-08-16. SEO and domain selection remain paused.

---

## 2026-08-09 - Session 35: Project Readiness Housekeeping

### Completed

- Reconciled the issue summary with each detailed issue status.
- Added FS-013 for the fixed Facebook high-resolution AV1 playback problem.
- Updated FS-002 to reflect the latest local and production YouTube refusal.
- Kept intermittent TikTok extraction and the historical silent-file result in
  monitoring rather than overstating them as permanently fixed.
- Preserved FS-006 as investigating because delivery still reopens the source
  URL and a safe credential-free alternative remains unresolved.
- Added a localhost-only sponsorship layout preview using fixed sample copy,
  no image, no tracker and no real sponsor.
- Kept both production sponsorship feature flags disabled.
- Added a skip link, an explicit media-link label, visible keyboard focus,
  Escape-to-close mobile navigation and reduced-motion handling.
- Confirmed the core frontend files remain approximately 44 KB and contain no
  remote scripts, iframes, ad-network code or remote CSS imports.
- Added lazy image decoding/loading for the optional sponsorship image.
- Verified the deployed platform-status page returns HTTP 200 and contains the
  2026-08-09 platform results.
- Prepared the public-safe checklist and result template for the first MON-003
  weekly review on 2026-08-16.

### Current Status

The readiness housekeeping is implemented locally. Advertising and analytics
remain disabled, the public site has no preview path outside localhost, and no
new external request is active. The next operational checkpoint is the first
MON-003 weekly review.

### Verification

- Complete frontend test files passed, including the new preview, accessibility
  and lightweight-loading assertions.
- Main, sponsorship and revenue configuration module syntax checks passed.
- Git whitespace check passed.
- Production platform-status page returned HTTP 200 with the expected date and
  platform results.
- Development launcher checks passed; backend and frontend reachability were
  not run because both local servers were intentionally stopped.
