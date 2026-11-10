# Hero audit and fixes — 10 November 2026

The audit used Playwright with **`headless: false`** in Chromium, on an Xvfb virtual display. There is no physical display in the remote workspace. This is headed testing, but no window opens on the user’s computer. The runner confirms the browser command has no `--headless` flag. Navigation uses direct local files; **no HTTP server** is started.

## Changes

| Finding | Implemented fix |
| --- | --- |
| Name banner was small relative to its surrounding space | Modestly larger, still proportional, with responsive width/height caps |
| Caption was 10px and low contrast against the base blue | 12–14px on normal frames, stronger type, ivory text, and a static blue tint behind the upper composition |
| Devotional text sat against the bottom of Ganesha | Added 4px of separation while retaining the requested small devotional size |
| Scroll arrow gave no visible destination | Added “Read invitation” on normal frames; compact frames retain an accessible 44px icon action |
| Two floating controls were vertically misaligned | Matched their visual center lines and respected safe-area insets; minimum checked separation is 8px |
| Accessible banner image repeated the semantic heading | Banner is decorative; the section references the real H1, and the action’s visible/accessibility names match |

The supplied combined PNG, viewport-filling hero, temple/foliage proportions, GSAP depth, cloud timing, audio ownership, and Tamil/English content hierarchy remain intact.

## Evidence

- `before-390.png` and `before-metrics.json`: original headed capture and baseline measurements.
- `hero-WIDTHxHEIGHT.png`: revised headed captures at 320×568, 390×844, 768×1024, 1440×900, and 844×390.
- `headed-hero-review.webm`: silent headed recording exercising wheel scrolling, temple/name overlap, keyboard focus and Enter navigation, music state continuity, and reduced motion.
- `keyboard-focus-390.png`, `live-parallax-390.png`, `reduced-motion-390.png`: additional actual interaction states.
- `results.json`: five layout/contrast/keyboard scenarios and one recorded interaction scenario passed. Actual background pixels were sampled beneath the devotional and invitation text at sky tween progress 0, 0.5, and 1. The lowest checked caption ratio was 4.80:1; the lowest devotional ratio was 4.88:1. These measurements cover the sampled artwork states, not arbitrary replacement sky images.
- `geometry-results.json`: ten headed viewport/resize cases, reduced motion, no JavaScript, original artwork/labels, overflow, proportions, and full height.
- `gsap-results.json`: seven headed GSAP lifecycle/fallback scenarios, including paused music/bar state and missing dependencies.

## Reproduce

With Playwright and Chromium paths set in the environment:

```bash
QA_HEADED=1 xvfb-run -a -s '-screen 0 1600x1100x24' node scripts/hero-browser.cjs
xvfb-run -a -s '-screen 0 1600x1100x24' node scripts/hero-headed-audit.cjs
QA_HEADED=1 QA_BASE_URL=file:///workspaces/deepak-weds-gomathi xvfb-run -a -s '-screen 0 1600x1100x24' node scripts/gsap-browser.cjs
```

The scripts also accept `PLAYWRIGHT_MODULE`, `CHROMIUM_EXECUTABLE`, and `QA_OUTPUT_DIR`. Chromium was tested; no Safari/Firefox or real-device safe-area claim is made. Work remains local and uncommitted.
