# One invitation with Tamil and English — 9 November 2026

The site now uses both languages with distinct roles rather than translating every line. There are no language switches, language gates, separate language pages, or new frameworks.

| Part | Treatment |
| --- | --- |
| Temple entrance | Existing Tamil names, English name captions, tiny Tamil devotional line, and Tamil invitation caption preserved. Artwork and parallax unchanged. |
| Formal invitation | Short Tamil salutation (`அன்புடன் அழைக்கிறோம்`), one English invitation paragraph, English formal names/parents, and Tamil `மற்றும்` connector. |
| Celebrations | Single English headings, dates, times, descriptions, calendar actions, shared address, and directions. |
| Countdown | One English date and one set of English unit labels; runtime and wedding-day message use the same approach. |
| Ending | One Tamil blessing. Removed compliments remain removed. The requested faint 6px copyright remains the final line. |
| Controls/accessibility | English action labels, accessible names, new-tab notices, and music tooltip. Correct `lang` attributes retained on Tamil content. |
| Google Calendar | Existing exact ISO/IST event values and start-time reminder preserved; event descriptions use English once. Static and runtime links agree. |

## Online references

[Pranav Cards' invitation wording examples](https://pranavcards.com/blogs/tamil-wedding-invitation-wording-examples/) cover traditional openings, family/couple details, and concise practical information. [Funvite's Tamil invitation guidance](https://funvite.live/tamil-wedding-invitation/) outlines invocation, family introduction, muhurtham/reception details, and venue. These informed the editorial hierarchy; the precise Tamil/English split is a design choice for this site, not a copied template or a claim that all invitations should use this format.

## Live browser verification

All **12 integration scenarios passed** in Chromium: four framed viewports, configuration-driven calendar updates, malformed/reversed-date handling, both real Google handoffs, JavaScript-disabled content, blocked storage in two guest timezones, the exact muhurtham countdown boundary, and full-page visual captures. Main viewports were 320×844, 390×844, 768×1024, and 1440×900. Screenshots were inspected for Tamil wrapping, arch composition, name hierarchy, artwork proportions, and practical-detail readability.

At 390px the celebrations section fell from **1369px to 945px**, approximately **31% shorter**. At 320px it fell from 1556px to 978px. This reduction comes from removing duplicate translations, not hiding duplicate content with CSS or reducing the dates/body text below the existing readable scale.

[Language-policy checks](language-policy.json) additionally verify the preserved Tamil hero/welcome/closing, English-only logistics, correct formal names, English music labels, no horizontal document overflow, and the final 6px credit at direct widths 320, 390, 506, and 576px.

The first run on the auto-reloading Live Server was interrupted by reloads triggered by screenshot writes. The final passing run used a stable local static server serving the same working-tree files, with output outside the repository. The resulting screenshots and results were then copied here. No code changes were made to suppress runtime errors or bypass failed assertions.

## Previews

- [Formal invitation, phone](screenshots/invitation-390.png)
- [Events and Google Calendar actions, phone](screenshots/calendar-section-390.png)
- [Closing section, phone](screenshots/closing-390.png)
- [Complete phone page](screenshots/full-site-390.png)
- [Narrow-phone invitation](screenshots/invitation-320.png)
- [Integration results](results.json)

The final Save operation in a signed-in Google account, physical devices, Safari, and Firefox were not exercised. Existing music-button overlap/focus and legacy idle animation-loop findings remain separate audit recommendations; this change focuses on language/content clarity. No commit, push, or publication was performed.
