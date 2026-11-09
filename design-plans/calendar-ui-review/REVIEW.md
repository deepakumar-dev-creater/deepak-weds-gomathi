# Google Calendar delivery and live UI review

Reviewed 8 November 2026 on branch `Deepak`, based on `7f52eb4` plus the existing uncommitted work. Nothing was committed, pushed, or published.

## Calendar feature delivered

Both events now have a secondary **Add to Google Calendar / நாள்காட்டியில் சேர்** action in the existing celebrations timeline. The links include the couple, event, full venue address, and directions. They open a Google Calendar draft in another tab for the guest to review and save. No account connection, framework, backend, or build step is required.

| Event | Confirmed local time | Calendar representation |
| --- | --- | --- |
| Reception | 11 March 2027, 6:30 PM IST onwards | Start-time reminder; identical start/end timestamps, as selected by the user. No invented finishing time. |
| Ceremony | 12 March 2027, 6:00–7:30 AM IST | Exact 90-minute event. |

Runtime links consume explicit ISO timestamps in `site.js` and the embedded invitation payload. Their UTC ranges are `20270311T130000Z/20270311T130000Z` and `20270312T003000Z/20270312T020000Z`, with `ctz=Asia/Kolkata`. Static HTML supplies working links when JavaScript is unavailable. The reception also has a short bilingual start-time-reminder explanation.

The implementation uses the Google Calendar template URL format documented by the [calendar-link project maintainers](https://github.com/InteractionDesignFoundation/add-event-to-calendar-docs/blob/main/services/google.md). UTC pairs preserve the moment across guest timezones; equal start/end values represent the reception reminder.

Changed feature owners: [invite.html](../../invite.html), [site.js](../../site.js), [celebrations.css](../../celebrations.css). Existing artwork, music, parallax, and prior uncommitted work were retained.

## Design language

- **Audited surface:** `index.html` and its live `invite.html` portrait iframe, from the entrance through the closing footer. Other standalone/legacy entry files were excluded because the live page does not load them.
- **Design sources:** the user-approved temple invitation, current [DESIGN.md](../../DESIGN.md), and the rendered four-section flow. Design evidence was traced from the actual entry point through its loaded CSS and scripts.
- **Documented decisions:** realistic blue-sky hero, antique gold accents, maroon text on ivory reading surfaces, ornate arch, Tamil and English together, local Tamil fonts, static HTML, desktop portrait frame, original artwork proportions, persistent music control, and reduced-motion support.
- **Governing owners and consumers:** `temple-hero.css` / `temple-hero.js` own the entrance; `invitation.css` owns Section 2; `celebrations.css` plus `initEvents` own event details/calendar links; `closing.css` plus `initClosingCountdown` own the ending; `site.css` and `initMusic` own the shared floating player. `index.html` owns the outer frame. `bridge.js` owns widget initialization/configuration integration.
- **Explicit exceptions:** the devotional hero line is deliberately tiny, as requested by the user. Hero name occlusion by the rising gopuram is intentional. Desktop framing, autoplay with a visible pause control, and the different original illustration styles are preserved user requirements. Parent names retain the supplied English spellings. The reception has no fixed end time.

UI Skills was loaded through `ui-skills@0.2.4`, with `improve-ui`, `fixing-accessibility`, and `fixing-motion-performance` guidance. This review preserves the approved identity; it does not propose a redesign.

## Findings

| # | Problem | Evidence | Proposed change | Scope | Confidence |
| --- | --- | --- | --- | --- | --- |
| 1 | **High: the persistent music control obscures event/venue copy at some scroll positions.** | The reading layout must keep essential event details legible. `site.css:49` fixes the 50px player 18px from the right/bottom, while `celebrations.css:26` leaves only 18px inside the venue card. Live text-range intersection checks reproduce overlap at outer widths 320, 390, and 1440. [390px evidence](screenshots/venue-music-overlap-390.png) shows the address under the player. The closing footer already handles the same player with 74px side clearance (`closing.css:22`). | Extend the existing 74px right-side text/action clearance from the closing footer to the celebrations reading areas while retaining the player's 50px target. Recheck Tamil wrapping and both calendar links at 320px. | Section 3 layout in `celebrations.css`; preserve artwork and playback behavior. | High — source, measured text intersections, and actual viewport screenshots agree. |

## Improve first

Resolve finding 1 first: the covered text is part of the address guests need to reach the wedding. The new calendar controls themselves have readable labels, large targets, and a visible focus state. No other evidence-supported visual redesign is recommended from the inspected views.

## Additional accessibility and motion checks

These checks come from the separate accessibility/motion skills; they are not additional speculative design findings.

- **Music focus indicator could be stronger.** The live keyboard-focused button uses a 2px `#D9B25E` outline on the closing footer's `#FFF3E1` background. Their calculated contrast is **1.83:1**. [Focus screenshot](screenshots/music-keyboard-focus-390.png) and [computed styles](focus-check.json) confirm the current state. A dual light/dark focus indicator would remain visible over both artwork and plain ivory; keep the current button size. This is a contrast concern, not a claim of a complete WCAG audit.
- **Legacy animation scheduling still runs while idle.** `site.js:196–219` unconditionally schedules another animation frame, even when there is no visible work. Instrumented browser runs counted **63 callbacks in 1.05 seconds** after the hero was off-screen. The new entrance sky correctly pauses off-screen, and visible reduced-motion checks passed. Stop legacy scheduling when no active visible tween/layer remains; keep the existing native hero timelines and event-driven fallback. This evidence proves unnecessary scheduling, not a measured frame-rate or battery regression.
- Calendar links have native anchor semantics, decorative SVGs hidden from assistive technology, bilingual labels, event-specific screen-reader context, and bilingual new-tab notices. Keyboard Tab moves from reception to ceremony. Their 3px maroon focus outline is visible, and targets measure approximately **69px high** at all tested frame widths.
- Main maroon `#6B1730` on ivory `#FFF3E1` calculates to **10.70:1**. Secondary brown `#70564A` on ivory calculates to **6.14:1**. Photo/gradient text contrast was inspected visually; it was not certified pixel by pixel.

## Browser verification

Actual Chromium rendering and interaction were exercised through Playwright. Main viewport runs allowed external requests; additional direct-page runs blocked external requests to check the locally hosted font fallback.

| Outer viewport | Actual iframe width | Result |
| --- | --- | --- |
| 320×844 | 320px | All four sections in flow; no horizontal document overflow; calendar actions usable. |
| 390×844 | 390px | All four sections in flow; real Google handoff reached sign-in; calendar actions usable. |
| 768×1024 | 576px | Portrait frame preserved; no horizontal document overflow. |
| 1440×900 | 506px | Desktop portrait frame preserved; no horizontal document overflow. |

Passed checks:

- Both exact UTC calendar ranges, full venue/directions, encoded names, and `Asia/Kolkata` timezone.
- Equivalent calendar instants with guest timezones Asia/Kolkata and America/Los_Angeles.
- Real reception-link click opened Google's sign-in screen with the event URL retained in its continuation. [Google handoff screenshot](screenshots/google-calendar-handoff.png).
- Native calendar/directions links and the static wedding date remain available with JavaScript disabled.
- Unavailable local storage does not break calendar controls.
- All four sections remain sequential with no overlap; actions and music retain targets of at least 44×44px.
- Local Temple Tamil and Temple Calligraphy fonts loaded. Tamil wrapping and proportional artwork were inspected at narrow phone, phone, tablet-frame, and desktop-frame widths.
- Hero names and temple use different scroll transforms, with the original 24-second sky drift. Sky animation pauses off-screen. Reduced motion removes hero transforms and leaves events/closing static.
- Viewport resizing does not introduce horizontal document overflow.
- One persistent audio element; manual pause remains paused after another interaction.
- A simulated GitHub Pages project subpath preserves relative assets/styles and calendar links.
- No observed page JavaScript exceptions or failing local resource responses in the four primary viewport runs.
- JavaScript syntax and scoped whitespace checks passed. Existing unrelated whitespace changes in `invite.html` were preserved.

## Evidence and limits

[checks.json](checks.json) contains measured layouts, outgoing calendar URLs, motion states, and scenario results. The screenshot folder includes live framed views (`hero-*`, `section2-*`, `section3-*`, `section4-*`), parallax states, focus/overlap evidence, and complete direct-page captures at 320, 390, 506, and 576px. [Complete phone page](screenshots/full-site-390.png) · [New calendar controls](screenshots/full-section3-390.png) · [Desktop hero](screenshots/hero-1440.png).

Testing used Chromium viewport emulation, not physical phones, Safari, or Firefox. Google account sign-in and the final Save action were not performed, so saving into a signed-in calendar remains a guest-side step. The Google Calendar mobile app was not exercised. No claim of complete WCAG or cross-browser conformance is made. The existing floating-player overlap, low-contrast focus ring on ivory, and idle animation loop remain audit recommendations; the review did not silently redesign unrelated parts of the site.
