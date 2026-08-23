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

### Pulling Peak CPU/Memory/Disk/Bandwidth Automatically

`./scripts/render-usage-report.sh` calls Render's metrics API directly and
prints a day-by-day CPU, memory, disk and bandwidth/request summary for the
FlowSnap backend service, ready to paste into the worksheet above (in the
private operating copy, not here). It requires a Render API key in
`RENDER_API_KEY` or a gitignored `scripts/.render.env` file - see
`./scripts/render-usage-report.sh --help`. Render's API does not expose
billing or cost figures, so the cost columns and the private budget
comparison still have to come from the Billing and Usage dashboard.

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

### First Weekly Review — 2026-08-16

Review the seven UTC dates from 2026-08-09 through 2026-08-15. Enter all
provider usage and cost values only in the private operating copy.

Checklist:

- [x] Confirm daily aggregate rows exist for all seven dates.
- [x] Record total API and expensive requests.
- [x] Record analysis, preparation and delivery success/error totals.
- [x] Calculate delivery success, rate-limit and capacity-rejection rates.
- [x] Calculate average output MB and cost per successful delivery.
- [ ] Record peak CPU, memory and temporary-storage use reported by Render.
- [x] Compare month-to-date cost with the private monthly budget.
- [x] Apply and record any 50%, 75%, 90% or 100% threshold response.
- [x] Note any day that unexpectedly consumed more than 10% of the budget.
- [ ] Confirm default service notifications remain enabled.
- [x] Record the review result in this runbook without monetary values or
      provider account details.

Public-safe review result template:

```text
Review date: 2026-08-16
Observation dates: 2026-08-09 through 2026-08-15
Daily rows complete: yes/no
Reliability within provisional limits: yes/no
Capacity within provisional limits: yes/no
Cost threshold reached: none/50%/75%/90%/100%
Unexpected >10% budget day: yes/no
Action taken: none/pause/lower limits/investigate/other
Next review date: 2026-08-23
```

### First Weekly Review — Result (completed 2026-08-19, three days late)

```text
Review date: 2026-08-16 (recorded 2026-08-19)
Observation dates: 2026-08-09 through 2026-08-15
Daily rows complete: yes (owner-confirmed qualitative basis, not a raw dashboard export)
Reliability within provisional limits: yes
Capacity within provisional limits: yes
Cost threshold reached: none
Unexpected >10% budget day: no
Action taken: none
Next review date: 2026-08-23
```

Basis and limitation: this review relied on the owner's confirmation that
production cost was near $0 for the window, consistent with FlowSnap not yet
being publicly promoted (monetisation milestone M0, sponsorship disabled).
Render's peak CPU/memory/storage graphs and confirmation that default service
notifications remain enabled were not independently pulled this cycle; do a
full dashboard-sourced review once real public traffic exists, and no later
than the 2026-09-07 thirty-day checkpoint.

### Second Weekly Review — Result (2026-08-23)

```text
Review date: 2026-08-23
Observation dates: 2026-08-16 through 2026-08-22
Daily rows complete: yes (private operating copy)
Reliability within provisional limits: yes
Capacity within provisional limits: yes
Cost threshold reached: none
Unexpected >10% budget day: no
Action taken: none; continue weekly monitoring
Next review date: 2026-08-30
```

Basis and limitation: the weekly review used a successful Render metrics API
report for reliability and capacity, plus a manual Billing and Usage review
for the cost outcome. Monetary figures and provider account details remain in
the gitignored private operating copy. Default service-notification status was
not independently reconfirmed in this review and remains a check for the next
weekly review.

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
