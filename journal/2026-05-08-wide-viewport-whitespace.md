# 2026-05-08 — Wide-viewport whitespace was never validated

## What happened

While producing social-media launch assets (X thread, Bluesky, Mastodon, Reddit, HN), I captured the homepage at three viewports: 1280×720, 1024×576, and 960×540.

At 1280×720 the rendered page shows ~224px of empty space on each side of the content column — roughly 35% of horizontal real estate is blank. The content reads fine, but the framing looks underbuilt for desktop users, who are the primary audience of a developer-oriented handbook.

At 960×540 the same page looks appropriately dense (~64px side whitespace). This is pure coincidence — the site was never explicitly designed for either viewport. It was designed for "reading comfort" via a fixed `--max-w: 52rem` (832px) content column and a single breakpoint at 640px.

## Root cause

The site's responsive strategy has exactly one media query: `@media (max-width: 640px)`. Everything from 640px to infinity uses one layout, with the content column centered in `body` via `margin: 0 auto; max-width: 52rem`.

This is the standard "narrow reading column" decision, and it is correct for the reading-optimized pages (concept articles, guides). But for:

- The homepage, which has a timeline and multiple section listings that could benefit from a wider layout
- Social-media screenshots, which are how most new readers will first see the site
- Users on 1440px+ displays (the majority of developers per StatCounter)

...the single-breakpoint strategy produces an underfilled canvas.

The issue was never caught because the Lighthouse baseline and the frontend-interaction-review skill both focus on correctness (accessibility, contrast, overflow, hover affordance), not on **visual density at different viewports**. Nothing in the review process asks "does this page look right at 1440×900?"

## Resolution

Two changes, tracked separately:

1. **Immediate (2026-05-08)**: Capture launch assets at 960×540, which happens to match the site's intended density. The launch-asset capture batch was kept local; 1280-wide screenshots were not used for promotion.

2. **Done — PR #76 (2026-06-01)**: Added `@media (min-width: 1100px)` to [build/css/style.css](../build/css/style.css) widening `--max-w` from `52rem` to `64rem` and bumping the hero `h1` to `3.2rem`. This is option 1 from the list below — the homepage and article pages share `--max-w`, so widening at the breakpoint applies to both, but the breakpoint is high enough that article reading on typical laptop screens still gets the 52rem narrow column.

   The other two options (2-column timeline+listings, decorative frame elements) were rejected: both conflict with [rules/design-intent.md](../rules/design-intent.md) §5 — wide viewports widen content, not whitespace, and not chrome.

Original options considered:
- Let the homepage use a wider `--max-w` (e.g. 64rem or 72rem) while article pages keep 52rem **← chosen, applied to both**
- Introduce a 2-column homepage layout at ≥1100px (timeline + listings side-by-side) **← rejected**
- Add visible frame elements (subtle borders, side marginalia) to make the whitespace intentional rather than accidental **← rejected**

## Prevention measures applied

- Added "viewport density check at 1280px and 1440px" to the frontend-interaction-review skill's next revision (not yet written — tracked in ROADMAP)
- Added ROADMAP entry: "Wide-viewport layout optimization"
- Future promotional content: always preview at the exact viewport the screenshot will be rendered from, not just "open the site"

## Related

- Launch assets: `assets/social/2026-05-08-launch/` (gitignored — local only)
- Homepage CSS: [build/css/style.css](../build/css/style.css) (`--max-w`, breakpoints at 640px and 1100px)
- Design intent §5 (density): [rules/design-intent.md](../rules/design-intent.md)
- Resolved by: PR #76 — "build: align homepage spacing and section order with design intent"
