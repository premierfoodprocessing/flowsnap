# FlowSnap Monetisation Plan

## Objective

Develop sustainable revenue without compromising user trust, responsible use, accessibility or platform compliance.

Advertising must never be confused with navigation, format selection or download controls.

## Design Principles

- Clearly label every advertisement or sponsorship.
- Keep ads separate from Continue, format selection and download actions.
- Never imitate download buttons.
- Do not use pop-ups, pop-unders, forced redirects or misleading countdowns.
- Preserve a fast, clean mobile experience.
- Process only public content users own or are authorised to save.
- Do not circumvent digital rights management or technical protections.

## Commercial Boundaries

FlowSnap will not monetise:

- Circumvention of private, protected, restricted or unauthorised media.
- Access to browser cookies, user accounts or platform credentials.
- Misleading download buttons, forced redirects or accidental clicks.
- Personal media URLs, titles, creators, filenames or download histories.
- The sale or sharing of user activity with data brokers.

Paid features must improve convenience or service quality. They must not weaken responsible-use controls or create access to media that FlowSnap would otherwise refuse.

## Revenue Channel Order

Introduce revenue channels in the following order:

1. **Voluntary support** — a clearly labelled contribution link with no feature pressure.
2. **Direct sponsorship** — fixed placements from legitimate creator or media tools.
3. **Contextual advertising** — subject to partner approval and consent requirements.
4. **Affiliate relationships** — only for relevant products, with clear disclosure.
5. **Optional premium plan** — considered only after usage and operating costs are understood.

This sequence allows FlowSnap to validate trust and demand before adding accounts, billing or subscription support.

## Placement Specification

Approved candidate placements:

1. A banner after the result card and responsible-use notice.
2. An in-content placement between major informational sections.
3. A clearly labelled footer sponsorship area.
4. A desktop-only side placement if the layout later supports it.

Placement rules:

- Advertisements must not appear inside the result card.
- Maintain clear visual separation from Continue, format-selection and download controls.
- Every placement must use an `Advertisement`, `Sponsored` or equivalent visible label.
- Do not use download icons, progress indicators or FlowSnap action-button styling.
- Reserve layout space before loading third-party content to prevent disruptive movement.
- Hide placements cleanly when no approved content is available.
- The first release may enable only one placement.

## Privacy-Preserving Measurement

FlowSnap needs enough information to understand reliability and operating cost without building a media-history database.

Permitted aggregate events:

- Page viewed.
- Analysis started, succeeded or failed.
- Platform category, using only FlowSnap's supported-platform name.
- Download preparation succeeded or failed.
- Delivery succeeded or failed.
- Broad error code such as `platform_blocked` or `download_failed`.
- Placement viewed or deliberately clicked when required for revenue reporting.

Do not collect:

- Submitted media URLs.
- Media titles, creator names, thumbnails or filenames.
- Analysis IDs or download job IDs in analytics.
- Browser cookies or persistent cross-site identifiers created by FlowSnap.
- Raw IP addresses in application analytics.

Retention periods, consent requirements and deletion procedures must be documented before analytics is enabled.

## Operating and Abuse Controls

Commercial activation requires predictable backend cost and reasonable abuse resistance.

Required controls:

- Rate limits for analysis, preparation and delivery endpoints.
- Separate limits for expensive extraction and download operations.
- Maximum supported file size or delivery budget.
- Existing short-lived, one-time jobs and automatic temporary-file cleanup retained.
- Aggregate monitoring for request volume, success rate, error rate and data transfer.
- Alerts or manual thresholds for unusual traffic and unexpected hosting cost.
- A documented emergency switch to disable delivery while leaving status information available.

Rate limiting should begin at the hosting or reverse-proxy layer when practical. Adding a production dependency requires a separate technical review and approval.

## Readiness Gates

All gates below must pass before the first revenue placement is activated.

### Product Reliability Gate

- Core workflow succeeds on the platforms FlowSnap publicly claims to support.
- Unsupported or blocked platforms show clear, structured errors.
- No known issue can expose raw backend responses or misleading controls.
- Mobile download controls are usable and accessible.
- Stable automated tests pass before release.

YouTube production support is not a launch requirement while FS-002 is explicitly disclosed and the platform is not advertised as reliably available.

### Trust and Compliance Gate

- Publish Privacy, Cookies, Terms, Contact and Copyright/Takedown pages.
- Keep the authorised-use confirmation visible in the workflow.
- Document analytics data, purpose, retention and deletion.
- Add consent handling where required by the selected technology and audience.
- Review current hosting, advertising and affiliate policies before selection.
- Obtain qualified legal review before commercial launch where appropriate.

### Operations Gate

- Production frontend and backend use suitable commercial hosting terms.
- Rate limits and cost thresholds are active.
- Error and uptime monitoring are available without logging media URLs.
- A production rollback or monetisation-disable procedure is documented.
- Support and takedown requests have a monitored destination.

### User Experience Gate

- Revenue content cannot be mistaken for a FlowSnap action.
- Keyboard and screen-reader flows remain usable.
- Mobile layout remains uncluttered.
- Performance is measured before and after activation.
- Download completion is not delayed to force an impression or click.

## Delivery Roadmap

### M0 — Foundation

Status: **In progress**

Deliverables:

- Complete request/job tracing without logging URLs or credentials (FS-007). **Complete.**
- Improve mobile filename and download controls (FS-011).
- Define aggregate event names and retention rules.
- Define rate-limit and cost thresholds from observed usage.
- Keep FS-002 deferred and clearly documented.

Exit criteria:

- Stable tests pass.
- Production errors can be diagnosed using safe identifiers and error codes.
- No analytics or revenue scripts are active.

### M1 — Trust and Measurement

Deliverables:

- Publish the required policy and contact pages.
- Add privacy-preserving first-party event collection or select an appropriate service.
- Add consent handling only where the chosen measurement approach requires it.
- Create an internal operating-cost dashboard or monthly worksheet.
- Add responsible-use educational content beyond the form notice.

Exit criteria:

- Data inventory and retention policy are documented.
- A user can find contact, privacy and takedown information from every page.
- FlowSnap can measure aggregate successful workflows and backend cost without storing media details.

### M2 — Revenue-Ready Interface

Deliverables:

- Build a disabled, provider-neutral placement component.
- Add layout, accessibility and responsive tests.
- Verify no placement resembles or shifts the download controls.
- Create a feature flag or configuration switch that defaults to off.
- Prepare sponsorship and affiliate disclosure text.

Exit criteria:

- The disabled component has no third-party requests.
- Enabling or disabling revenue content requires no download-workflow change.
- Accessibility and performance baselines remain acceptable.

### M3 — Controlled Launch

Deliverables:

- Select one approved revenue channel using the evaluation rubric below.
- Enable one clearly labelled placement for a limited audience or period.
- Monitor reliability, performance, complaints and revenue.
- Keep a documented immediate-disable procedure.

Exit criteria:

- No material increase in workflow abandonment or support complaints.
- No policy warning, deceptive placement or accessibility regression.
- Revenue contribution and operating cost are measurable.

### M4 — Review and Expansion

Possible work:

- Continue, replace or remove the first revenue channel.
- Test direct sponsorship before adding more display placements.
- Evaluate an optional supporter or premium plan.
- Consider frontend hosting migration if commercial terms or capabilities require it.

Expansion requires a fresh review; it is not automatic after M3.

## Provider Evaluation Rubric

Evaluate any advertising, analytics, affiliate, support or billing provider against:

- Acceptance of FlowSnap's authorised public-media use case.
- Current copyright, download-service and content policies.
- Geographic availability and payout requirements.
- Consent, cookie and cross-site tracking behavior.
- Ability to disable personalized advertising or tracking.
- Accessibility and control over placement appearance.
- Page-weight and performance impact.
- Reporting transparency and minimum payout.
- Contract, termination and data-deletion terms.
- Total integration and operating cost.

Record the review date because provider policies can change. Do not integrate a provider until this review is complete.

## Premium Feature Boundaries

Potential future paid conveniences:

- An ad-free interface.
- Clearly defined higher usage limits that remain within hosting capacity.
- Saved non-sensitive preferences.
- Batch workflow convenience only if platform rules, cost controls and responsible-use safeguards permit it.

Premium access must not include protected-content bypasses, credential use, DRM circumvention or hidden unlimited usage.

## Economics Worksheet

Track monthly values before setting prices:

- Successful analyses and deliveries.
- Backend compute cost.
- Data-transfer cost.
- Monitoring, consent and analytics cost.
- Support and compliance cost.
- Revenue by channel.
- Refunds, chargebacks or partner deductions where applicable.

Useful calculations:

- `cost per successful delivery = total monthly operating cost / successful deliveries`
- `net revenue = gross revenue - provider fees - operating cost`
- `break-even deliveries = fixed monthly cost / contribution per delivery`

Do not publish pricing until real cost and usage data make these estimates credible.

## Launch and Pause Criteria

The first revenue release is ready when every readiness gate passes and M0 through M2 are complete.

Pause or disable monetisation when:

- A placement can be confused with a FlowSnap control.
- Reliability, accessibility or page performance materially declines.
- A provider raises a policy or compliance concern.
- Hosting cost becomes unpredictable.
- User complaints indicate loss of trust.
- FlowSnap cannot honor consent, deletion or takedown obligations.

## Immediate Backlog

| ID      | Task                                                        | Depends on       | Status  |
| ------- | ----------------------------------------------------------- | ---------------- | ------- |
| MON-001 | Add privacy-safe request and job tracing                    | FS-007           | Complete |
| MON-002 | Define aggregate analytics events and prohibited fields     | MON-001          | Planned |
| MON-003 | Define rate limits, file limits and monthly cost thresholds | Usage observation| Planned |
| MON-004 | Publish policy, contact and takedown pages                  | Content review   | Planned |
| MON-005 | Improve mobile download controls                            | FS-011           | Planned |
| MON-006 | Build a disabled provider-neutral placement component       | MON-004          | Planned |
| MON-007 | Evaluate providers using the documented rubric              | MON-002–006      | Planned |
| MON-008 | Run one-placement controlled launch                         | All readiness gates | Planned |

## Current Status

Monetisation is specified but not enabled.

FlowSnap is currently at M0. FS-007/MON-001 is complete. The next monetisation-enabling task is MON-002: define aggregate analytics events and prohibited fields.
