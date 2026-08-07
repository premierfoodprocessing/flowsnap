# FlowSnap Development Roadmap

This roadmap records product priorities and planning assumptions. Prices are
estimates, not purchasing commitments, and must be rechecked before launch.

## Infrastructure and Cost Plan

**Estimate date:** 7 August 2026

FlowSnap can use separate providers for its domain, DNS/CDN, static frontend,
API compute and any future object storage. No infrastructure purchase or
migration is currently planned.

| Stage | Planning allowance | Intended approach |
| --- | ---: | --- |
| Development and private testing | $0/month | Keep the static frontend on GitHub Pages and the FastAPI backend on Render Free. |
| Domain | Approximately $6–13/year | Decide and purchase separately when the long-term name is settled. |
| Initial public launch | Approximately $2–10/month plus domain | Select a small production-suitable compute service after measuring beta usage. |
| Early growth | Approximately $10–30/month | Increase compute and introduce delivery architecture based on measured load. |
| Significant traffic | Usage-dependent | Price from actual CPU, memory, request and media-transfer measurements. |

### Current and Candidate Services

- **Current:** GitHub Pages hosts the frontend and Render Free hosts the API.
- **Koyeb Free candidate:** one test/hobby web service with 512 MB RAM,
  0.1 vCPU and 2 GB SSD. It scales to zero after one hour without traffic and
  is explicitly not intended for production.
- **Koyeb Eco candidate:** published compute pricing starts at $1.61/month for
  0.1 vCPU and 256 MB RAM in selected regions. FlowSnap may require a larger
  instance once FFmpeg memory and CPU use are measured.
- **Cloudflare R2 candidate:** Standard storage includes 10 GB-month per month,
  with published storage pricing of $0.015/GB-month beyond the allowance and
  no direct Internet egress fee. Request-operation costs and temporary-object
  lifecycle design must be included in any future assessment.

### Cost-Control Requirements Before Public Promotion

- Keep file-size, concurrency and request-rate limits configurable.
- Measure aggregate request counts, output sizes, CPU, memory and bandwidth
  without retaining submitted media URLs or raw IP addresses in analytics.
- Configure provider billing alerts or hard spending limits where available.
- Verify each provider's current acceptable-use and commercial terms.
- Load-test FFmpeg and yt-dlp on the intended production instance.
- Review whether direct temporary object delivery reduces API bandwidth without
  retaining media longer than necessary.
- Record a rollback and emergency delivery-disable procedure.

### Decision Point

Reassess providers and prices immediately before public promotion or
monetisation. Do not select infrastructure from headline compute price alone;
bandwidth, request charges, platform access, cold starts and operational effort
are part of the total cost.
