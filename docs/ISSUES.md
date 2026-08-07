# FlowSnap Issue Register

This file is the lightweight issue tracker for FlowSnap. It records confirmed bugs, production limitations, usability problems, and technical concerns discovered during development and testing.

## Status Definitions

* **Open** — Confirmed issue awaiting investigation or repair.
* **Investigating** — Evidence is being gathered or the cause is being diagnosed.
* **Blocked** — Progress depends on an external service or unresolved dependency.
* **Fixed** — A repair has been implemented and verified.
* **Monitoring** — No immediate repair required, but the issue may recur.
* **External** — Caused by a browser, platform, or service outside FlowSnap.

## Severity Definitions

* **Critical** — FlowSnap is unavailable or a core workflow is unusable.
* **High** — A major platform or download workflow fails.
* **Medium** — The workflow functions, but reliability or usability is affected.
* **Low** — Minor usability, maintenance, or presentation issue.

## Issue Summary

| ID     | Issue                                                                       | Status        | Severity |
| ------ | --------------------------------------------------------------------------- | ------------- | -------- |
| FS-001 | TikTok extraction sometimes fails on the local backend                      | Open          | High     |
| FS-002 | YouTube works locally but fails or is refused through Render                | Open          | High     |
| FS-003 | TikTok formats labelled “Video + audio” can produce silent video-only files | Confirmed     | High     |
| FS-004 | Duplicate-looking TikTok format choices are displayed                       | Open          | Medium   |
| FS-005 | A failed download can navigate away and display raw backend JSON            | Resolved      | Medium   |
| FS-006 | Analysis and download repeat media extraction                               | Investigating | High     |
| FS-007 | Different TikTok video IDs appeared during one testing sequence             | Investigating | Medium   |
| FS-008 | Render health probe receives `405 Method Not Allowed` for `HEAD /`          | Open          | Low      |
| FS-009 | Backend returns `404 Not Found` for `/favicon.ico`                          | Open          | Low      |
| FS-010 | Hibernation left duplicate local backend processes running                  | Monitoring    | Low      |
| FS-011 | Mobile filename and download controls are cramped                           | Open          | Low      |
| FS-012 | Browser may save downloads to an unexpected directory                       | External      | Low      |

---

## FS-001 — TikTok extraction sometimes fails locally

* **Status:** Open
* **Severity:** High
* **Environment:** Ubuntu local backend
* **Platform:** TikTok

### Description

The local backend sometimes cannot retrieve TikTok metadata or download media, even when the same link works through the public Render backend.

### Evidence

Observed yt-dlp error:

```text
Unable to extract universal data for rehydration
```

Observed API response:

```text
POST /api/media/formats HTTP/1.1
422 Unprocessable Entity
```

### Notes

The same TikTok link successfully returned formats and downloaded through the public FlowSnap site using the Render backend. The behaviour may depend on TikTok’s response to different network addresses or may be intermittent.

### Next action

Capture and compare yt-dlp metadata and request behaviour locally and on Render.

---

## FS-002 — YouTube fails or is refused through Render

* **Status:** Open
* **Severity:** High
* **Environment:** Render production backend
* **Platform:** YouTube

### Description

YouTube links work through the local Ubuntu backend but fail when processed by the deployed Render backend.

### Suspected cause

YouTube may be challenging or blocking Render’s cloud-server IP address. Authentication, cookies, rate limits, or bot detection may also be involved.

### Next action

Reproduce the failure while monitoring Render logs and record the complete yt-dlp error.

---

## FS-003 — TikTok “Video + audio” option can produce a silent file

* **Status:** Confirmed
* **Severity:** High
* **Environment:** Public site, Render backend, Chromium on Ubuntu
* **Platform:** TikTok

### Description

A TikTok option displayed as:

```text
1280p · MP4 · 24.4 MB · Video + audio
```

downloaded successfully but contained video only.

### Evidence

`ffprobe` reported:

```text
index=0
codec_name=hevc
codec_type=video
width=720
height=1280
```

No audio stream was present.

### Impact

Users can select an option described as containing audio and receive a silent file.

### Suspected cause

FlowSnap may be trusting incomplete or misleading yt-dlp/TikTok metadata when classifying formats. Duplicate-looking formats may also include separate video-only and combined streams without distinguishing them in the interface.

### Required fix

* Verify the actual audio codec before displaying “Video + audio.”
* Never preselect a confirmed video-only stream as a combined download.
* Merge separate video and audio streams with FFmpeg where appropriate.
* Test the final downloaded file for expected stream composition.

---

## FS-004 — Duplicate-looking TikTok formats

* **Status:** Open
* **Severity:** Medium
* **Environment:** Mobile and laptop public site
* **Platform:** TikTok

### Description

FlowSnap displays multiple choices with identical visible labels, including repeated options such as:

```text
1024p · MP4 · 33.8 MB · Video + audio
1024p · MP4 · 33.8 MB · Video + audio
1280p · MP4 · 24.4 MB · Video + audio
1280p · MP4 · 24.4 MB · Video + audio
```

### Suspected cause

TikTok provides different internal format IDs that share the same visible resolution, extension, size, and apparent audio classification. They may differ by codec, bitrate, watermark status, or stream composition.

### Required fix

Remove true duplicates and expose meaningful differences between formats that are technically distinct.

---

## FS-005 — Failed download displays raw backend JSON

* **Status:** Resolved
* **Severity:** Medium
* **Environment:** Local frontend and backend

### Description

When a prepared download failed, the browser navigated to the backend endpoint and displayed:

```json
{"detail":{"code":"download_failed","message":"FlowSnap could not download this media."}}
```

### Impact

The user leaves the FlowSnap interface and sees an unfriendly raw API response.

### Required fix

Keep the user on the FlowSnap page and display the error in the existing message area.

### Resolution

The frontend now requests the prepared file itself and starts the browser save only after a successful response. Structured delivery failures remain on the FlowSnap page and appear in the existing preparation-status area.

---

## FS-006 — Analysis and download repeat extraction

* **Status:** Investigating
* **Severity:** High
* **Environment:** Local and production backends

### Description

FlowSnap extracts media information while listing formats, but the download endpoint appears to perform a fresh extraction.

### Impact

A link may succeed during analysis and fail during download because the platform rejects the second request or changes the available media URLs.

### Evidence

The format and preparation requests succeeded, but the final download request failed during another TikTok extraction.

### Required investigation

Determine whether prepared jobs can securely retain the selected direct-media information long enough to avoid an unnecessary second extraction.

---

## FS-007 — Different TikTok IDs appeared during testing

* **Status:** Investigating
* **Severity:** Medium
* **Environment:** Local backend

### Description

During one testing sequence, the logs referenced two different TikTok video IDs:

```text
7669497672142736660
7669418700717575445
```

### Possible explanations

* Multiple links were tested in the same session.
* An older prepared job remained active.
* Browser state or cached results were reused.
* The selected job was not clearly associated with the currently displayed media.

### Next action

Add or inspect request/job logging so each format, preparation, and download request can be traced to the same source URL and job ID.

---

## FS-008 — Render `HEAD /` returns 405

* **Status:** Open
* **Severity:** Low
* **Environment:** Render production backend

### Evidence

```text
HEAD / HTTP/1.1
405 Method Not Allowed
```

### Impact

The service remains healthy because `/health` returns `200 OK`, but some automated checks may interpret the root response as a failure.

### Possible fix

Add support for `HEAD /` or configure Render to use `/health` exclusively.

---

## FS-009 — Missing backend favicon

* **Status:** Open
* **Severity:** Low
* **Environment:** Backend

### Evidence

```text
GET /favicon.ico HTTP/1.1
404 Not Found
```

### Impact

None on the download workflow. This is primarily log noise and browser presentation.

---

## FS-010 — Duplicate local processes after hibernation

* **Status:** Monitoring
* **Severity:** Low
* **Environment:** Ubuntu development environment

### Description

After laptop hibernation, the development terminal remained open and multiple backend processes were still associated with port 8000.

The stop script found and stopped both backend processes before restarting the development environment successfully.

### Existing mitigation

Use:

```bash
./scripts/stop-dev.sh
./scripts/start-dev.sh
```

The scripts successfully restored a clean development environment.

---

## FS-011 — Mobile download controls are cramped

* **Status:** Open
* **Severity:** Low
* **Environment:** Mobile browser

### Description

The filename area and **Prepare download** button appear cramped near the bottom of the mobile layout.

### Required fix

Review responsive spacing, filename wrapping, button width, and bottom padding on narrow screens.

---

## FS-012 — Unexpected browser download location

* **Status:** External
* **Severity:** Low
* **Environment:** Chromium on Ubuntu

### Description

A downloaded TikTok file was saved in:

```text
~/Documents/Ogunbusola_Group/01_Premier_Food_Processing_Ltd/14_Images/
```

rather than the usual Downloads directory.

### Cause

The browser controls the download destination. This is not currently considered a FlowSnap backend defect.

### Suggested action

Review Chromium’s download-location setting and “Ask where to save each file” preference.

---

## Verified Working Behaviour

The following behaviour has been verified successfully:

* Render deployment is live.
* `GET /health` returns a healthy response.
* The public GitHub Pages frontend communicates with the Render backend.
* TikTok metadata and format choices can load through Render.
* A default TikTok format downloaded successfully on mobile.
* The successful mobile file contained good-quality video and audio.
* The successful mobile file played from beginning to end.
* The public TikTok workflow can begin downloads on both mobile and laptop.
* Local development servers can be managed using the start and stop scripts.

## Issue Maintenance Rules

When a new issue is discovered:

1. Assign the next `FS-###` identifier.
2. Add it to the summary table.
3. Record the environment, evidence, impact, and reproduction details.
4. Avoid marking an issue fixed until the repair has been tested.
5. Record the resolving commit when an issue is fixed.
6. Keep historical details instead of deleting resolved issues.

## Last Updated

2026-08-07 — FS-005 resolved with frontend-managed delivery and in-page errors.
