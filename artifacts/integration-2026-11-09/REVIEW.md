# Live browser integration and UI/UX audit

Reviewed **9 November 2026** using the current `Deepak` working tree, with Playwright 1.56.1 and Chromium. This run used the real local static website and opened both real Google Calendar links. Previous uncommitted work was preserved. No commit, push, or publication was performed.

## Outcome

**All 12 integration scenarios passed after fixing a Calendar integration defect.** The site remains static HTML/CSS/browser JavaScript with no application dependencies or build step.

Google Calendar actions already existed under both events. They were retained and verified rather than duplicated:

| Event | Google Calendar entry |
| --- | --- |
| Reception | 11 March 2027, 6:30 PM IST; start-time reminder, with no invented end time, as selected by the user. |
| Wedding ceremony | 12 March 2027, 6:00–7:30 AM IST. |

Both actions include the names, full En Sesha Mahal address, directions, and `Asia/Kolkata` timezone. Guests review and save the event in Google Calendar. Both real clicks reached Google's sign-in screen with the exact outgoing event dates preserved. Account authentication and the final Save action were not performed.

## Integration defect fixed

The configuration bridge copied event labels, locations, and images but omitted `start` and `end`. A configuration update therefore changed visible event information while the calendar action retained its original static URL.

Browser reproduction changed only a temporary test fixture to an 8:00–9:00 AM ceremony. Before the fix, the calendar URL incorrectly remained `20270312T003000Z/20270312T020000Z`; afterward it correctly became `20270312T023000Z/20270312T033000Z`. The test restores the real event values and does not change the actual wedding schedule.

- [bridge.js:120](../../bridge.js:120) now preserves both ISO timestamp fields when applying event configuration.
- [site.js:425](../../site.js:425) updates the existing calendar action after configuration changes. Malformed or reversed ranges hide the invalid action and remove its old URL, preventing guests from saving stale dates. Valid configuration restores it.
- [celebrations.css](../../celebrations.css) ensures hidden calendar actions/helper text are actually hidden despite their flex display styles.
- [scripts/browser-integration.cjs](../../scripts/browser-integration.cjs) supplies repeatable integration coverage, including the regression above.

## UI/UX findings and recommended improvements

The approved blue-sky temple hero, small devotional line, rising gopuram, ornate invitation arch, bilingual copy, and portrait desktop frame were preserved. Their intentional visual treatment was not treated as a flaw. The review used UI Skills' accessibility, motion-performance, and visual-baseline guidance within the existing static stack.

| Priority | Verified problem | Evidence | Recommended improvement |
| --- | --- | --- | --- |
| **1 — High** | The floating music button can obscure event/venue text. | Fresh text-range intersection checks reproduced this at direct widths 320, 390, and 506px. [Phone evidence](screenshots/music-overlap-390.png) shows part of the address underneath the button. The fixed 50px player occupies space that the celebrations copy still uses. | Give event/venue text and actions a protected right-side area, or place the persistent player in a dedicated control gutter. Reuse the closing footer's clearance as the starting point, preserve the 50px target, and check 320px Tamil wrapping before accepting the layout. |
| **2 — Medium** | Keyboard focus on the music button is weak against ivory. | The focused control uses a 2px `#D9B25E` outline over `#FFF3E1`: approximately **1.83:1** contrast. [Fresh focus screenshot](screenshots/music-focus-390.png) and [computed-style evidence](ui-details.json). | Use a dual light/dark focus ring that is visible over both the sky/artwork and ivory reading surfaces. Retain the existing native button and bilingual accessible name. |
| **3 — Medium** | The old motion engine schedules frames even when there is no visible animation work. | Fresh instrumentation recorded **63 animation-frame callbacks in 1.05 seconds** with the hero off-screen. `site.js` schedules the next legacy frame unconditionally. The new hero sky itself correctly pauses off-screen. | Stop the legacy frame loop while idle and wake it only for visible motion or pending entrances. Preserve the working native hero scroll timelines and event-driven fallback. This is an efficiency finding; no battery or frame-rate improvement is claimed without profiling. |

The **first improvement should be text clearance around the music button**: it affects information guests need to reach the venue. The current layout otherwise keeps a consistent ivory/maroon reading hierarchy, proportional artwork, and clear event actions across the inspected sizes. A full visual redesign is unnecessary.

Optional polish after those fixes: shorten generic event descriptions to make dates/times and calendar actions faster to scan on narrow phones. Preserve the exact event facts, names, bilingual labels, and approved artwork. This is a design suggestion, not a measured failure.

## Verification performed

| Scenario | Result |
| --- | --- |
| 320×844 phone | Passed layout, controls, local font loading, parallax, reduced motion, resize, and overflow checks. |
| 390×844 phone | Passed the same checks. |
| 768×1024 tablet | Passed; actual portrait iframe is 576px wide. |
| 1440×900 desktop | Passed; actual portrait iframe is 506px wide. |
| Configuration updates | Calendar dates/venue update; restoring configuration restores the original links; one audio player remains. |
| Malformed/reversed dates | No stale calendar action remains active; valid dates restore the link. |
| Both real Google handoffs | Reached Google sign-in; both exact event ranges were retained. |
| JavaScript disabled | Native calendar actions and static wedding date remain available. |
| Asia/Kolkata and America/Los_Angeles guest timezones, storage blocked | Both calendar ranges remain correct. |
| Countdown boundary | At `2027-03-12T06:00:00+05:30`, the countdown gives way to the bilingual wedding-day message. |
| Full visual capture | Complete pages inspected at direct widths 320, 390, 506, and 576px; overlap evidence recorded separately. |

Additional observations: every main action measured at least 44×44px; calendar focus uses a visible 3px outline; Tab proceeds between the event links; local Tamil fonts loaded; sections stayed sequential without document horizontal overflow; reduced motion removed hero transforms; the hero sky paused off-screen; one audio element remained; manual pause stayed paused after another interaction. Page JavaScript exception checks passed in all four main viewport runs. Syntax and scoped whitespace checks passed for the changed JavaScript/CSS and the test runner.

Passing integration checks **do not mean all design findings are resolved**. The three design/accessibility/performance recommendations above remain open; only the broken Calendar integration was changed in this task.

## Screenshots and raw results

- [Full phone invitation](screenshots/full-site-390.png)
- [Calendar controls and venue](screenshots/calendar-section-390.png)
- [Desktop hero](screenshots/hero-1440.png)
- [Reception Google handoff](screenshots/google-handoff-0.png)
- [Ceremony Google handoff](screenshots/google-handoff-1.png)
- [Machine-readable integration results](results.json)
- [Additional focus/motion/audio evidence](ui-details.json)

## Repeat the tests

Run a static server from the repository root in one terminal:

```sh
python -m http.server 4173
```

With Playwright available to Node and its Chromium browser installed, run in another terminal:

```sh
QA_BASE_URL=http://localhost:4173 QA_OUTPUT_DIR=artifacts/browser-integration node scripts/browser-integration.cjs
```

For a Playwright installation outside the repository, set `PLAYWRIGHT_MODULE` to its absolute module directory. Optionally set `CHROMIUM_EXECUTABLE` to an existing compatible Chromium executable. No QA dependency needs to be added to the deployed website. The script returns a nonzero exit code on integration failures and writes `results.json` plus screenshots.

## Limits

This run used live **Chromium** with emulated viewport sizes, not physical devices, Safari, Firefox, or the Google Calendar mobile app. No signed-in calendar save was performed. This was targeted integration testing plus visual/accessibility/motion review, not a complete WCAG certification or a benchmark of CPU, battery, or animation frame rate.
