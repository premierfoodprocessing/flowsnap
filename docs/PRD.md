# FlowSnap Product Requirements

## Product Purpose

FlowSnap helps people analyse and save public media that they own or are
authorised to download. It supports a clear, temporary workflow: submit a
public link, review available formats, select one, and receive a short-lived
browser download.

FlowSnap must not bypass private, protected, restricted or unauthorised media.
It must not request, store or expose source-platform credentials.

## Current Product Scope

- Analyse public TikTok, Instagram and Facebook links when their platforms
  permit server-side access.
- Present sanitised format, file-size and audio information before download.
- Create secure, one-time download jobs and remove temporary output promptly.
- Report unsupported links, platform restrictions, expired analyses and
  download failures in plain language.
- Keep YouTube clearly disclosed as currently unavailable rather than promise
  universal platform support.

## Core User Experience Requirements

1. A visitor must understand that FlowSnap has not processed their media URL
   until they explicitly submit it.
2. The page must warm the processing service with a credential-free health
   request on load, without sending a media URL or starting extraction.
3. The interface must visibly report service states: connecting, starting,
   ready or unavailable.
4. If the processing service is waking, the interface must say that no link
   has been sent yet and that the wait may take up to a minute.
5. Link analysis and file preparation must show clear delayed-work messages so
   users do not mistake a slower platform response for hidden activity.
6. The download workflow must remain keyboard accessible, mobile usable and
   visually separate from any future sponsorship content.

## Non-Functional Requirements

- Do not retain submitted media URLs, titles, filenames, raw identifiers,
  client addresses, cookies or credentials in operational tracing.
- Use short-lived in-memory analyses and jobs, and clean temporary download
  files after delivery.
- Apply configured file-size, concurrency and request-rate safeguards.
- Keep the frontend free of remote scripts, ad-network code and hidden
  tracking while advertising and analytics remain disabled.
- Keep service-state messages truthful; never claim that a download, analysis
  or platform request has begun before it has.

## Current Acceptance Criteria

- On page load, a single `GET /health` request is made without credentials and
  without a media URL.
- A successful health response displays a ready state before a submitted URL is
  analysed where timing permits.
- A delayed health response explains that the service is starting and that no
  link has been sent.
- A failed health response gives a retry-oriented unavailable message.
- Existing authorised-use boundaries and structured error handling remain
  unchanged.

## Out of Scope

- Private or authenticated source-platform access.
- Credential, cookie or proxy-based download bypasses.
- X/Twitter support at this time.
- Monetisation, advertising, analytics or sponsorship activation.

## Current Release Gate

The public workflow is live but wider promotion remains gated by MON-003's
30-day operational observation through 2026-09-07. The next review is
scheduled for 2026-08-30.
