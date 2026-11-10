# GSAP ceremony choreography — 9 November 2026

All active decorative motion is implemented with the locally hosted GSAP 3.15.1 core and ScrollTrigger. The invitation is still static HTML/CSS/browser JavaScript and has no application build step.

## Experience

- Original 24-second alternating cloud drift, exact ease-in-out curve, 1.08 scale, and ±2%/±0.5% travel; pauses offscreen/in background tabs.
- Iframe scroll-driven temple/name/foliage depth with existing desktop/mobile caps; no pinning or scroll lock.
- Gold kolam ornaments draw once; short invitation group entrances.
- Celebration markers, headings, details, and illustrations enter in sequence; a maroon thread traces the timeline.
- Closing arch, jasmine crest, couple, lamps, and signature form one ceremonial entrance.
- GSAP flower shower and jasmine seal bloom; local acknowledgement remains after petals clear.
- Playback indicator follows actual music state and page visibility.

## Preview

`journey-390.webm` is a short Chromium recording of the phone experience. `depth-*`, `hero-*`, `celebrations-*`, `ending-*`, and `reduced-*` show actual 320/390/768/1440 outer viewports. `flowers-390.png` shows the live flower shower. The invitation/flower/ending 390px images are additional phone captures.

## Validation

- `integration-results.json`: 12 passing scenarios, including responsive framing, calendar configuration and handoffs, one persistent audio element, static content, storage failure, guest timezones, and the precise IST countdown boundary.
- `blessings-results.json`: 10 passing interaction/fallback scenarios, including keyboard reuse, nonstacking, cleanup, seal persistence, reduced motion, resize/offscreen cancellation, playing/paused audio continuity, missing GSAP, missing artwork, and no JavaScript.
- `results.json`: 7 passing GSAP lifecycle scenarios: four viewport sizes, one-time ornament drawing, original sky settings, capped parallax, offscreen pause, actual GSAP cleanup on preference changes, no CSS/WAAPI animation, repeated media changes without trigger growth, resize, library failures, and no dependency on Element.animate.
- `subpath.json`: actual GitHub Pages-style project subpath, JavaScript on/off, reduced motion, local vendor loading, no failed asset responses, and zero active motion in reduced mode.

JavaScript syntax and changed-line whitespace checks pass. The old perpetual polling engine and active CSS/native animation paths were removed. Source instructions/license links remain beside vendor distributions. Work is local and has not been committed or pushed in this motion pass.
