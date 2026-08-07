# FlowSnap SEO Roadmap

## Objective

Build sustainable organic discovery for FlowSnap by making the site technically accessible, genuinely useful and trustworthy for people seeking authorised public-media workflows.

SEO cannot guarantee a first-place ranking. Search visibility is earned over time through reliable functionality, helpful original content, sound technical foundations and legitimate recommendations from other sites.

## Search-Safety Boundaries

FlowSnap will not use:

- Keyword stuffing or hidden text.
- Purchased links, link exchanges or automated backlink schemes.
- Mass-generated platform, location or keyword pages.
- Doorway pages that repeat the same workflow for slightly different queries.
- Copied or lightly rewritten competitor content.
- Misleading claims about supported platforms or successful downloads.
- Pages that advertise bypasses for private, protected or unauthorised media.
- Structured data that is not visible and accurate on the page.

These boundaries follow Google Search Essentials and spam policies:

- [Google Search Essentials](https://developers.google.com/search/docs/essentials)
- [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Spam policies for Google web search](https://developers.google.com/search/docs/essentials/spam-policies)
- [Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)

## Current Audit

### Existing Strengths

- Responsive, lightweight static frontend.
- One clear homepage title and meta description.
- Open Graph title, description and type.
- Semantic main heading, sections and visible FAQ content.
- Accessible form labels and responsible-use messaging.
- Existing Privacy and Terms pages.
- SVG favicon and custom 404 page.
- Real platform-testing knowledge that can become original content.

### Critical Gaps

- Homepage copy still says the backend will be connected later.
- FAQ says FlowSnap does not download real files.
- Privacy and Terms describe a static demonstration without processing.
- Privacy contains a placeholder contact instruction.
- No dedicated Contact or Copyright/Takedown page.
- No canonical URL strategy.
- No `robots.txt` or XML sitemap.
- No Google Search Console or equivalent webmaster-tool workflow.
- No structured data plan.
- No Open Graph URL or share image.
- Legal pages lack unique meta descriptions and canonical references.
- Navigation is mostly single-page anchor links, leaving little crawlable topic depth.
- No documented keyword map, content calendar or backlink strategy.
- No search-performance baseline.

The outdated product and policy claims are the first priority. FlowSnap should not ask search engines to index statements that no longer describe the live service.

## Audience and Search Intent

FlowSnap should serve four legitimate intents.

### Action Intent

People want a straightforward way to save public media they own or are authorised to download.

Example themes:

- Save an authorised public video.
- Download your own social-media video.
- Choose a video quality or file format.
- Save a public video with audio.

### Troubleshooting Intent

People need help understanding why a link, format or completed file behaves unexpectedly.

Example themes:

- Why a platform temporarily blocks a download server.
- Why some formats are video only.
- How FlowSnap adds audio when a separate stream exists.
- Why a browser saves a file to a particular folder.

### Educational Intent

People want to understand media formats and responsible saving.

Example themes:

- Combined video-and-audio versus video-only streams.
- Resolution, container and file-size differences.
- Public content, permission and copyright basics.
- How temporary processing and cleanup work.

### Brand and Trust Intent

People want to verify what FlowSnap is, which platforms it supports, how it handles data and how to contact its operator.

## Keyword Strategy

Keywords should guide useful content, not dictate repetitive wording.

### Core Topic

The homepage should target FlowSnap's broad, accurate proposition: an authorised public-media download workflow.

### Supporting Clusters

- Public video saving and download guidance.
- Video format and audio-stream education.
- Platform support and current limitations.
- Troubleshooting real FlowSnap errors.
- Privacy, temporary processing and responsible use.

### Platform Pages

Create a platform-specific page only when:

- The workflow is currently verified in production.
- The page contains substantial platform-specific guidance.
- Limitations and non-affiliation are clear.
- The page is maintained when platform behavior changes.
- Its purpose is helping users, not capturing a keyword variation.

TikTok, Instagram and Facebook are candidates after the core trust pages are corrected. Defer a YouTube landing page while FS-002 remains open in production.

### Keyword Research Process

1. Start with Search Console query data after indexing.
2. Group queries by intent rather than creating one page per phrase.
3. Compare impressions, clicks and user outcomes.
4. Write or improve a page only when FlowSnap can add original value.
5. Reassess quarterly because platform terminology and search demand change.

Do not use a meta-keywords tag; Google does not use it for ranking.

## Information Architecture

### Core Pages

- `/` — main authorised download workflow.
- `/how-it-works/` — accurate explanation of analysis, selection, preparation and delivery.
- `/supported-platforms/` — current verified support matrix and limitations.
- `/responsible-use/` — ownership, permission and protected-content boundaries.
- `/privacy/` — current data-processing and retention policy.
- `/terms/` — current service terms.
- `/contact/` — monitored contact method.
- `/copyright/` — copyright and takedown process.

### Helpful Content

- `/guides/video-only-and-audio/`
- `/guides/choosing-video-quality/`
- `/guides/browser-download-location/`
- `/troubleshooting/platform-blocked/`
- `/troubleshooting/download-failed/`

These are proposed paths, not approval to create thin pages. Each page needs a clear user question, original FlowSnap experience and useful standalone answer.

### Internal Linking

- Keep the primary workflow reachable from every page.
- Link platform and troubleshooting pages to relevant guides.
- Link policy pages from the footer on every page.
- Use descriptive anchor text instead of generic `learn more` links.
- Avoid orphan pages that appear only in the sitemap.

## Technical SEO Specification

### Domain and Canonical URLs

- Choose the long-term production domain before setting permanent canonicals.
- Use HTTPS only.
- Select one preferred hostname and URL style.
- Redirect alternative hosts and paths when hosting supports redirects.
- Add a self-referencing canonical to every indexable page.
- Do not canonicalise distinct useful pages to the homepage.

GitHub Pages can support the initial work, but a commercial launch should use a stable custom domain and hosting terms appropriate for FlowSnap.

### Crawling and Indexing

- Add `robots.txt` at the site root.
- Allow public content required to render each page.
- Reference the sitemap from `robots.txt`.
- Add an XML sitemap containing canonical, indexable pages only.
- Exclude API endpoints, temporary job URLs and internal error payloads from indexing.
- Give 404 pages a real 404 status through the hosting configuration.
- Register the site in Google Search Console after domain ownership is settled.
- Submit the sitemap and inspect representative URLs.

### Page Metadata

Every indexable page needs:

- A concise, unique and accurate `<title>`.
- A unique meta description written for users.
- One clear visible page heading.
- Canonical URL.
- Open Graph title, description, type and URL.
- A representative share image when one is available.
- Appropriate image alternative text.

Titles and descriptions must reflect current functionality. Do not claim universal platform support, guaranteed success or affiliation with source platforms.

### Structured Data

Start conservatively:

- `WebSite` for the site identity and canonical homepage.
- `Organization` only after real operator name, URL, logo and contact details are publishable.
- `BreadcrumbList` on multi-level guide and troubleshooting pages.
- `SoftwareApplication` only if the visible page supplies all required, accurate information.

Validate markup with Google's Rich Results Test where applicable. Structured data does not guarantee a rich result or higher ranking.

Do not add FAQ structured data solely for ranking; the visible FAQ remains useful without it, and search-feature eligibility can change.

### Performance and Accessibility

- Track Core Web Vitals for real users when privacy requirements are satisfied.
- Keep JavaScript and CSS small and cacheable.
- Reserve dimensions for thumbnails, artwork and future revenue placements.
- Avoid render-blocking third-party advertising and analytics during early milestones.
- Preserve keyboard operation, visible focus and screen-reader status messages.
- Test mobile layouts before every search-focused release.

Google describes Core Web Vitals as one part of page experience, not a standalone guarantee of ranking:

- [Core Web Vitals and Google Search](https://developers.google.com/search/docs/appearance/core-web-vitals)

## Content Quality Standard

Publish a page only when it:

- Answers a real user question completely.
- Reflects current FlowSnap behavior and testing.
- Includes original explanation, evidence or experience.
- States limitations and responsible-use boundaries.
- Has an identified owner and review date.
- Fits a defined intent in the keyword map.
- Provides more value than adding the same paragraph to an existing page.

Review platform pages after material extractor or platform changes. Update, consolidate or remove content that becomes inaccurate.

## Authority and Promotion

Sustainable authority should come from usefulness and legitimate relationships.

Approved approaches:

- Publish transparent engineering and compatibility findings.
- Share genuinely useful guides in relevant creator communities where promotion is permitted.
- List FlowSnap in reputable product directories with accurate descriptions.
- Build relationships with legitimate creator tools and educators.
- Seek editorial mentions based on useful functionality or original research.
- Publish release notes worth linking to.

Prohibited approaches:

- Buying ranking links.
- Automated directory submission.
- Comment or forum spam.
- Private blog networks.
- Fake reviews, traffic or engagement.

Affiliate and sponsored links must use appropriate disclosure and link attributes.

## Measurement

### Search Metrics

- Valid indexed pages.
- Search impressions.
- Search clicks.
- Click-through rate.
- Queries and country/device trends.
- Average position as a directional metric, not the sole goal.
- Core Web Vitals status.
- Crawl and indexing errors.

### Product Outcomes

- Organic visitors who start analysis.
- Successful analyses from organic sessions.
- Successful deliveries from organic sessions.
- Structured error rate by supported platform.
- Return visits without storing media history.
- Support or voluntary-contribution conversion when enabled.

Do not send media URLs, titles, filenames, analysis IDs or download job IDs to search or analytics tools.

### Reporting Rhythm

- Weekly during initial indexing: coverage, errors and obvious technical problems.
- Monthly after stabilisation: queries, content outcomes and product conversion.
- Quarterly: content accuracy, platform support, policy changes and roadmap priorities.

SEO changes should normally be evaluated over weeks or months, not hours.

## Delivery Roadmap

### S0 — Truth and Trust

Status: **Complete**

Deliverables:

- Replace all static-demonstration and future-backend statements.
- Update Privacy and Terms for the live backend workflow.
- Replace placeholder contact text with an approved monitored contact method.
- Add Contact and Copyright/Takedown pages.
- Publish an accurate supported-platform matrix.

Exit criteria:

- Every public claim matches production behavior.
- Policy pages describe current processing and retention.
- No placeholder business or contact text remains.

### S1 — Crawlable Foundation

Deliverables:

- Decide the long-term production domain.
- Add canonical metadata.
- Add `robots.txt` and XML sitemap.
- Add unique metadata to public pages.
- Register and verify Search Console.
- Establish indexing and performance baselines.

Exit criteria:

- Canonical public pages are crawlable and included in the sitemap.
- Search Console reports no blocking technical issue.
- API and temporary workflow URLs are not indexable.

### S2 — Helpful Content

Deliverables:

- Publish How It Works and Responsible Use pages.
- Publish the verified Supported Platforms page.
- Create the first two original guides from real FlowSnap behavior.
- Add crawlable navigation and contextual internal links.
- Establish page owners and review dates.

Exit criteria:

- Each page satisfies the content quality standard.
- No doorway or near-duplicate platform pages exist.
- Users can navigate the content without relying on the sitemap.

### S3 — Discovery and Authority

Deliverables:

- Promote useful resources through appropriate communities and directories.
- Publish original compatibility or engineering findings.
- Build legitimate creator-tool relationships.
- Monitor new queries and improve existing pages before adding more pages.

Exit criteria:

- Search impressions and relevant referring sites show sustained discovery.
- Promotion has not produced spam complaints or policy warnings.
- Content updates are driven by evidence and user needs.

### S4 — Optimisation

Deliverables:

- Improve titles and snippets using Search Console evidence.
- Consolidate overlapping or underperforming content.
- Improve Core Web Vitals where field data identifies a problem.
- Evaluate additional verified platform pages.
- Connect organic outcomes to the monetisation economics worksheet.

Exit criteria:

- Organic traffic produces measurable successful workflows.
- Search growth does not reduce trust, accessibility or reliability.
- Expansion decisions use observed results rather than ranking promises.

## Immediate Backlog

| ID      | Task                                                           | Depends on          | Status  |
| ------- | -------------------------------------------------------------- | ------------------- | ------- |
| SEO-001 | Correct outdated homepage and FAQ claims                       | Current production  | Complete |
| SEO-002 | Update Privacy and Terms for live processing                   | Data-flow review    | Complete |
| SEO-003 | Add Contact and Copyright/Takedown pages                       | Approved contact    | Complete |
| SEO-004 | Publish an accurate supported-platform matrix                  | Live verification   | Complete |
| SEO-005 | Select the long-term domain and canonical convention           | Hosting decision    | Planned |
| SEO-006 | Add unique metadata, canonicals, robots and sitemap            | SEO-005             | Planned |
| SEO-007 | Register Search Console and record the baseline                 | SEO-006             | Planned |
| SEO-008 | Publish How It Works and Responsible Use pages                 | SEO-001–004         | Planned |
| SEO-009 | Publish two original help or troubleshooting guides            | SEO-008             | Planned |
| SEO-010 | Begin legitimate discovery and authority outreach              | SEO-007–009         | Planned |
| SEO-011 | Review search and product outcomes monthly                     | Search data         | Planned |
| SEO-012 | Evaluate expansion using evidence, not keyword volume alone     | SEO-011             | Planned |

## Relationship to Monetisation

SEO supports monetisation by attracting relevant users and proving lawful organic demand. Monetisation must not undermine SEO with distracting ads, slow third-party scripts or thin pages designed only for impressions.

Shared dependencies:

- FS-007/MON-001 enables privacy-safe operational understanding.
- FS-011/MON-005 protects the mobile experience.
- SEO S0 supplies accurate policy and trust content required by monetisation M1.
- SEO S1 supplies measurement and discoverability foundations.
- SEO S2 creates original content that can earn links and support responsible revenue.

The first revenue placement should not activate until the monetisation readiness gates pass, regardless of search traffic.

## Current Status

SEO is now specified but not implemented.

FlowSnap has completed S0. SEO-001 through SEO-004 are complete. The next milestone is S1, beginning with SEO-005: select the long-term production domain and canonical URL convention.
