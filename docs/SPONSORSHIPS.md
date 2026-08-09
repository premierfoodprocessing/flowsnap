# Direct Sponsorship Publishing

## Current State

Direct sponsorship support is implemented but disabled. FlowSnap makes no
sponsor, advertising or tracking request while the configuration remains off.

## Approved Content

Each sponsorship may contain:

- A `Sponsored` or `Advertisement` label.
- A short headline and description.
- An optional image stored under `assets/sponsors/`.
- Descriptive alternative text when an image is present.
- One HTTPS destination and a short link label.
- Optional UTC start and end timestamps.

Raw HTML, scripts, tracking pixels, remote images, HTTP destinations and image
paths outside `assets/sponsors/` are rejected.

## Publishing Workflow

1. Review the sponsor and destination against `docs/MONETIZATION.md`.
2. Obtain written approval for the exact copy, image, destination and dates.
3. Add the approved image under `assets/sponsors/` if one is required.
4. Enter the approved fields in `revenue-config.js`.
5. Set the sponsorship's `enabled` value to `true`.
6. Set the master `placementsEnabled` value to `true` only for an approved
   controlled launch.
7. Run the frontend tests, syntax check and a local visual/accessibility review.
8. Show the complete change and proposed commit to Gee before committing.
9. Deploy only with Gee's separate push/deployment approval.
10. Verify the label, copy, image, link, responsive layout and end date in
    production.

To disable all sponsorships immediately, set `placementsEnabled` to `false` and
deploy. To disable only the current entry, set its `enabled` value to `false`.

## Important Boundary

Adding a sponsor asset or editing the configuration is a source-code change,
not an unaudited upload. Every sponsorship therefore passes through Git review,
tests and deployment history. Never place contracts, invoices, contact details,
credentials or private sponsor files in the repository.
