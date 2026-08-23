# FlowSnap Testing Record

## 2026-08-23 — Transparent Processing-Service Warm-Up

### Automated checks

- `node --check script.js` — passed.
- `node --test frontend-tests/*.test.mjs` — passed: three test files, zero
  failures.
- `git diff --check` — passed.

### Regression coverage

`frontend-tests/content.test.mjs` verifies that the homepage includes:

- an accessible live backend-status element;
- a health request to the configured API base URL;
- credential-free warm-up behaviour;
- visible ready and no-link-sent messaging;
- delayed messages for format analysis and download preparation.

### Manual follow-up

- Before release, check the published site after an idle period and confirm
  that the connecting, starting, ready and unavailable states read clearly on
  mobile and desktop.
- Confirm that submitting a URL while the backend is waking waits for service
  readiness and does not send the URL before that point.

## Test Boundaries

- Automated frontend checks validate code structure and messaging; they do not
  simulate Render's real cold-start timing.
- Live platform extraction remains opt-in because platform responses can vary.
- Do not include media URLs, credentials, private billing values or provider
  account details in this record.
