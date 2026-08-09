# FlowSnap Beta Operations

## Purpose

This runbook supports MON-003 observation and cost control without collecting
media histories or user analytics. Keep monetary values and provider account
details in a private operating copy, not in the public repository.

## Thirty-Day Observation Worksheet

Create one row per UTC day. Use aggregate totals only.

| Date | API requests | Expensive requests | Analyses success/error | Preparations success/error | Deliveries success/error | Rate limited | Capacity rejected | Too large | Output MB | Transfer MB | Compute cost | Transfer cost | Other cost | Notes |
| --- | ---: | ---: | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| YYYY-MM-DD | 0 | 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | No media URLs, titles, filenames or identifiers. |

At the end of each week, record:

- Month-to-date cost as a percentage of the approved private budget.
- Delivery success, capacity-rejection and rate-limit rates.
- Average output MB and cost per successful delivery.
- Provider-reported peak CPU, memory and temporary-storage use.
- Any threshold response taken and whether it resolved the issue.

Do not enter URLs, titles, creators, filenames, IP addresses, request or
workflow references, analysis IDs, job IDs, cookies, credentials or individual
histories. Follow the MON-002 allowlist and retention rules.

## Budget Review

- Review manually every week until provider alerts are configured and tested.
- Investigate an unexpected day consuming more than 10% of the monthly budget.
- Apply the 50%, 75%, 90% and 100% responses in `docs/MONETIZATION.md`.
- Record the provider alert configuration date and one successful alert test in
  the private operating copy.

### Current Render Control

As checked in the Render workspace on 2026-08-09, the available Billing and
Usage interface did not expose a cost-control or spending-alert option. Until
that changes, FlowSnap uses a manual weekly review. Keep the approved monthly
budget amount and all billing details in the private operating copy, not in the
repository or chat.

Render's default service notifications were enabled on 2026-08-09 for service
and deployment events. These notifications do not replace the manual cost
review.

### Current Observation Window

- Start date: 2026-08-09
- Planned day 30: 2026-09-07
- Review frequency: weekly, plus month end or any unexpected usage event.
- Cost monitoring: manual Billing and Usage review.
- Operational notifications: Render default service notifications enabled.

## Emergency Delivery Pause

The backend reads `FLOWSNAP_DELIVERY_ENABLED` when it starts. The default is
`true`. Setting it to `false` prevents both new download preparation and file
delivery, returning a structured `503 delivery_paused` response. Health,
public status and format analysis remain available.

To pause production delivery:

1. Confirm the reason and record the UTC time in the private operating log.
2. Set `FLOWSNAP_DELIVERY_ENABLED=false` in the backend host's environment.
3. restart or redeploy the backend using the host's normal configuration flow.
4. Verify `GET /health` still returns `200`.
5. Verify a preparation request returns `503` with code `delivery_paused`.
6. Check that no new delivery work begins and publish a status notice if the
   pause will affect users materially.

To resume:

1. Confirm cost, capacity or reliability is back within the approved boundary.
2. Set `FLOWSNAP_DELIVERY_ENABLED=true` and restart or redeploy the backend.
3. Verify health, preparation and one authorised test delivery.
4. Record the UTC resume time, verification result and corrective action.

Do not delete temporary files manually as part of this procedure. Existing
one-time jobs expire normally, and FlowSnap's delivery cleanup remains active.

## Local Verification

Use a non-secret local environment setting and restart the backend:

```bash
FLOWSNAP_DELIVERY_ENABLED=false uvicorn app:app --reload
```

Do not place production credentials or provider account details in this file,
the worksheet or Git history.

## Production Verification Record

- Date: 2026-08-09
- Deployment commit: `4b3b4e8`
- Host: Render
- Paused-state result: preparation returned `503 delivery_paused`.
- Availability during pause: root and health checks returned `200`.
- Resumed-state result: the same fake preparation request returned the expected
  `422 analysis_expired`, confirming preparation was available again.
- Final configuration: `FLOWSNAP_DELIVERY_ENABLED=true`.
- Media-platform requests: none; verification used fake analysis and format
  identifiers.
