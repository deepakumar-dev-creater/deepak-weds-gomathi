# Shared ceremonial theme — 9 November 2026

The invitation now repeats a wedding-thread/kolam motif, maroon and antique-gold stationery, italic English ceremonial headings, arch-shaped illustration/countdown/venue details, and rounded controls. The blue-sky temple hero and original architectural artwork remain. The desktop surround now follows the maroon palette.

The ending gains a jasmine crest, dotted gold border, and eight-blossom wreath. A guest’s blessing fills that wreath with ivory flowers for the current visit, while the existing brief petal shower and Tamil acknowledgement remain. No guest data is stored.

## Visuals

- `hero-*`, `invitation-*`, `celebrations-*`, `ending-*`: complete sections at actual iframe widths corresponding to outer 320/390/768/1440px viewports. Captured through direct invitation access to avoid clipping sections taller than an iframe viewport.
- `frame-*`: real framed desktop/mobile views.
- `seal-*`: the filled wreath after a blessing.
- `blessed-ending-390.png`: complete ending after the shower clears.

## Verification

- `integration-results.json`: 12 passed scenarios, including calendar links/config updates/real handoffs, responsive framing, static content, blocked storage, guest timezones, and the exact IST countdown boundary.
- `blessings-results.json`: 10 passed scenarios, now also checking the new seal state/fill and its persistence after petals clear; keyboard reuse, rapid taps, cleanup, reduced motion, resize, audio continuity, missing images, unavailable animation API, and JavaScript disabled.
- `checks.json`: 4 viewport measurements; no horizontal overflow, shared paper color across content sections, one audio element, completed cleanup, persistent filled wreath, and retained 6px copyright.
- `subpath-fallback.json`: real `/deepak-weds-gomathi/` project-subpath access with JavaScript on/off and reduced motion enabled; no failed asset responses.

New files to include in GitHub Pages: `wedding-theme.css` and `wedding-theme.js`. No framework, dependency, or build step. All work remains local and unpublished.
