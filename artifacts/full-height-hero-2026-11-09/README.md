# Full-height hero — 9 November 2026

The hero now fills the actual viewport, with proportional temple/foliage cropping and the two supplied gold name images. SVG crops exclude black margins/corner marks; original images remain untouched. GSAP parallax remains active and the temple continues to cover the names while scrolling.

Verification uses Playwright Chromium through direct local-file previews, with no HTTP server. `scripts/hero-browser.cjs` is the repeatable check. Results cover ten viewport/resize cases, exact full height, proportions, source images/accessibility, font loading, no horizontal overflow, next-section placement, touch targets, parallax, reduced motion, and JavaScript disabled. `gsap-results.json` contains seven additional passing lifecycle/fallback scenarios run from a file URL.

Screenshots `hero-WIDTHxHEIGHT.png` show the final composition on small/tall phones, tablet, desktop, landscape, and very short screens. `reduced-motion.png` and `no-javascript.png` show static fallbacks.

Changes remain local and uncommitted.
