# Temple entrance — implemented design

The first section follows the supplied blue-sky and antique-gold reference, within the existing portrait iframe. The formal invitation uses a short Tamil welcome and English family copy within the original arch artwork; events and closing artwork are retained.

## Composition

Ganesha → small devotional HTML blessing → the supplied combined gold Tamil/English name banner → short Tamil invitation caption → existing temple and foreground foliage. `Golden Tamil Wedding Name Banner.png` now replaces the separate Deepak and Gomathi images and live connector. A semantic HTML heading names the hero region; the duplicate banner image is decorative to avoid repeating the names to screen readers. There is no language switch.

The hero fills the actual iframe viewport using `100dvh`, with a `100vh` fallback. Ganesha and the devotional line remain small. The combined banner width is capped by both the container width and height to fit short and tall screens. Its intrinsic lettering, ribbon, and ornaments remain a single proportional composition. The invitation caption uses live Noto Serif Tamil text at 12–14px on normal frames, with a 9px compact treatment in very narrow frames.

The temple starts at 36% of the hero height and uses the larger of the available width and 49% of the hero height for its width. Its intrinsic aspect ratio is preserved; excess lower artwork is cropped by the hero, with foliage covering the bottom. This fills tall screens without vertically stretching the tower. The existing music control retains its 50px touch target and keyboard focus outline, with a quieter maroon surface, thin gold border, and softer shadow. Original source assets remain untouched.

Typography and placement use container units, preserving proportions inside the existing desktop portrait iframe and on phones. A semantic HTML heading preserves the couple’s names for assistive technology. Font licenses are included.

## Asset map

Original files in `assets/img/New-section/` remain untouched. Five complete images were resized and encoded as WebP in `web/`; SVG view boxes crop their empty margins and exclude corner marks without stretching them. An SVG alpha filter removes the opaque dark backgrounds at runtime while preserving their gold colors.

| Supplied image suffix | Optimized file | Purpose |
| --- | --- | --- |
| `ddrzq0ddrzq0ddrz.png` | `web/ganesha.webp` | Ganesha ornament |
| `nwupc8nwupc8nwup.png` | `web/blessing.webp` | Retained derivative; replaced in the UI by crisp HTML text |
| `4wqjkt4wqjkt4wqj.png` | `web/groom.webp` | Retained derivative; replaced by the newly requested Deepak artwork |
| `h8auslh8auslh8au.png` | `web/ribbon.webp` | Retained artwork; replaced in the hero by a quiet HTML connector |
| `pmpjt0pmpjt0pmpj.png` | `web/invitation.webp` | Retained derivative; caption now uses crisp HTML Tamil |
| `lt5voylt5voylt5v.png` | unused | Alternate blessing with duplicated lines |
| `bwaciobwaciobwac.png` | retained source | Previous separate Deepak lettering; no longer used in the hero |
| `Gomathi.png` | retained source | Previous separate Gomathi lettering; no longer used in the hero |
| `Golden Tamil Wedding Name Banner.png` | original PNG | Current combined lettering; SVG crop `240 0 1280 887`, preserving original alpha |

Existing artwork: `xZKlIX9XaacbmAvyKmu8rqVXE.webp` (sky), `J6YiMAQTDPTAlfG2On7An1Q5lB4.webp` (temple), `VrdsdVM2OwyjQkw6YWOB0OowTQ.webp` (trees).

## Motion and controls

All active decorative motion is now implemented with locally hosted GSAP 3.15.1 and ScrollTrigger. `temple-hero.js` owns the sky and layered entrance; `wedding-theme.js` owns one-time section choreography, the wedding-thread trace, and music bars; `blessings.js` owns the guest-triggered shower and seal bloom. Native scroll timelines, CSS keyframes for the active scene, WAAPI petal animation, and the legacy perpetual animation polling loop have been removed.

The sky alternates over 4 seconds per direction (8 seconds for a full return cycle), six times faster than the previous 24-second drift, with the original CSS ease-in-out curve, ±2% horizontal and ±0.5% vertical motion, at scale 1.08. IntersectionObserver and page visibility pause its GSAP tween offscreen and in background tabs. ScrollTrigger uses the iframe’s own window without pinning, scroll locking, or smoothing. The parallax range remains 65% of the hero height or 55% of the viewport height, whichever is smaller, with a 200px minimum. The sky moves down by up to 18px on desktop / 10px on mobile, while the temple rises by up to 50px / 30px. Trees rise by up to 30px / 18px. The name group moves down by that range so the opaque temple covers the lettering as before.

The small gold kolam ornaments draw once. Invitation groups enter with restrained 14px motion, celebrations reveal their marker, heading, details, and illustration in sequence, and a maroon thread traces the existing timeline. In the closing alcove, the arch, jasmine crest, couple, lamps, and signature enter as a coordinated scene. Essential text is visible in static HTML and remains readable if either library fails. Focusing an in-progress entrance completes it immediately.

GSAP matchMedia reverts all decorative scene and scroll animations when reduced motion is enabled. The flower button then uses three stationary petals and the same acknowledgement. Resize refreshes measured scroll ranges, including changes to the outer viewport while the portrait iframe retains its width. The persistent music player still owns actual playback; its GSAP bars pause with music or page visibility. English accessible music labels and focus visibility remain intact.

## Files and hosting

`invite.html` contains the entrance markup; `temple-hero.css` and `temple-hero.js` scope its appearance and motion. All assets use relative paths. GitHub Pages serves these files directly with no framework or build step. Include the entrance/theme/closing scripts and styles, `blessings.js`, local fonts, artwork, and the two `assets/vendor/gsap/` browser distributions when deploying. No publishing, committing, or pushing is performed here.

Review screenshots and browser-check results are in `artifacts/temple-hero/`.

## Verification

Chromium screenshots were inspected at 320×844, 390×844, 768×1024, and 1440×900. Checks passed for horizontal overflow, local Tamil font loading, one persistent audio element, bilingual music labels, manual pause after another interaction, and desktop scroll transforms. Scroll transforms for both the name group and temple were verified on mobile, tablet, and desktop. Reduced-motion changes stopped motion immediately. The current GSAP pass verifies readable static fallbacks when GSAP or ScrollTrigger is unavailable, as well as zero active decorative GSAP tweens and triggers in reduced-motion mode. Desktop → phone → desktop resizing recalculated eligibility correctly. Direct access, JavaScript-disabled rendering, and simulated GitHub Pages project-subpath asset loading passed. No page JavaScript errors were observed; JavaScript syntax checks passed. The existing reformatted invitation file has unrelated trailing-whitespace warnings; those lines were preserved.

Autoplay succeeded in the test browser; browser-specific blocking policies still apply, with the existing player retrying after interaction. Browser QA used Chromium; other rendering engines were not exercised.

## Second section — concise web invitation

The printed card supplies the factual names and date; the website section is a short welcome rather than a transcription of the whole card. The structure is inspired by the classic/minimalist options in [Joy’s template gallery](https://withjoy.com/designs/?l=en-GB) and the concise wording / separate logistics guidance in [VistaPrint’s wedding invitation guide](https://www.vistaprint.com/hub/wedding-invite-wording). The temple artwork, ivory paper, maroon type, and Tamil/English treatment remain specific to this site.

The reading order is a small devotional blessing, a short Tamil invitation line, one English welcome, each couple name in English with its parents immediately below, and one English celebrations link. The accessible invitation heading is English. Tamil provides the traditional voice in the hero, the invitation salutation/connector, and the final blessing; practical information is written once in English. There is one shared invitation with no language switch, language selection screen, or separate language links.

The couple's formal English names are the primary type inside the arch at 18–27px. Parent names use the supplied English spellings at 12–15px. The website does not duplicate the entire printed card: qualifications, jobs, long formal requests, and event logistics are omitted here. Mr. N.G. Keerthikumar's compliments credit has been removed at the user's request. The wedding date, timings, venue, and Google Calendar actions are in the following celebrations section.

`invitation.css` keeps content in normal flow with no fixed text coordinates or scaled SVG lettering. The original frame adapts to the shorter reading panel. Focus remains visible on the English celebrations link targeting `#wedding-celebrations`.

The original artwork is untouched. The proportional crops in `assets/img/invitation-frame/` are `arch.webp` (1300×572), `pillars.webp` (1300×630), and `base.webp` (1300×455). The ivory panel follows the content height. Hero motion, iframe framing, music playback, event values, and map destination are unchanged by this refinement.

### Reference information

- Parents: Mr. N. Guru Moorthy & Mrs. Girija Guru Moorthy; Mr. E. Sundaram & Mrs. Kalaivani Sundaram.
- Couple: N.G. Deepak Kumar and S. Gomathi.
- Wedding: Friday, 12 March 2027, 6:00–7:30 a.m. IST; countdown target `2027-03-12T06:00:00+05:30`.
- Reception: Thursday, 11 March 2027, 6:30 p.m. onwards IST.
- Venue: En Sesha Mahal, No. 71, Peter’s Road, Ganapathy Colony, Royapettah, Chennai – 600 014.
- Source-only secondary information: groom B.Tech., IT, Software Engineer, Bangalore; bride B.Sc., CS, Software Engineer, Chennai; compliments Mr. N.G. Keerthikumar, B.Tech. IT.

Full-section previews: `artifacts/temple-hero/invitation-minimal-{320,390,506,576}.png`. Layout and content checks are in `invitation-minimal-checks.json`. Verification covers actual iframe widths for outer viewports 320, 390, 768, and 1440px; no overlaps or horizontal overflow; preserved couple/parent names; no repeated logistics; a working keyboard-operated celebrations link; and the full venue address in the existing event cards. Enlarged body text and JavaScript-disabled rendering are also checked.

The minimal section measures 913px high at a 390px frame (previously 1163px). The closing credit is captured in `artifacts/temple-hero/invitation-footer-390.png`. Checks additionally verify that the credit is outside Section 2 and follows the closing illustration, parent names occur in two single-language parent blocks, and Section 2 contains no date or event logistics.

## Section 3 — concise celebrations timeline

The carousel is replaced by a semantic ordered list in `invite.html`, styled by `celebrations.css`. Reception and ceremony are both always present and readable. Each entry leads with one English heading, date, and time; the existing illustration is secondary and keeps its natural proportions. A single shared venue block contains the complete English address and one directions button. English calendar actions appear with each event; the reception is explicitly a start-time reminder.

Reception: Thursday, 11 March 2027, 6:30 PM onwards IST (`2027-03-11T18:30:00+05:30`). Ceremony: Friday, 12 March 2027, 6:00–7:30 AM IST (start `2027-03-12T06:00:00+05:30`). Both events are at En Sesha Mahal, No. 71, Peter’s Road, Ganapathy Colony, Royapettah, Chennai – 600014. The existing map link is retained. Descriptions are short, neutral invitations without unconfirmed meal or programme promises.

The section uses locally hosted Tamil/Latin serif typography, maroon headings, antique-gold timeline markers, and ivory surfaces. Date text has a 14px minimum, times a 16px minimum, and the directions button has a minimum 54px height. A visible keyboard focus outline and English new-tab notice are provided. Images are decorative; the article headings carry their event meaning. There are no slide controls, autoplay intervals, hidden event panels, or motion within this section, including reduced-motion mode.

`site.js` retains an `initEvents` bridge hook that updates existing text and image/link configuration without replacing the static markup or animating. The bridge preserves event ISO start/end fields for calendar URLs. Invalid date ranges hide calendar actions rather than retaining stale dates. With JavaScript disabled, the correct English event details, illustrations, address, directions, and native calendar links are available immediately. Hero parallax and the persistent audio player remain intact.

Full-section screenshots and verification results are in `artifacts/celebrations/`. The new `celebrations.css` must be included with the other static files when deploying to GitHub Pages; no build step is introduced.

## Section 4 — English countdown and Tamil blessing

The closing section now uses semantic static HTML and `closing.css`, with a compact ivory heading/countdown panel followed by the maroon ceremonial sign-off described below, the restored garland-exchange couple, a short Tamil blessing, and a very small final attribution. Tamil and English have distinct roles instead of repeating every line. Typography uses the locally hosted Temple Tamil font with Georgia for the English heading and numerals. Layout follows the actual iframe width rather than the outer viewport.

The four countdown units have single English labels and tabular numerals. `initClosingCountdown` in `site.js` consumes the existing wedding configuration and formats the target in Asia/Kolkata. The target remains `2027-03-12T06:00:00+05:30`. Before runtime initialization, guests see the real wedding date and time; the timer stays hidden instead of presenting false zeros. The date, blessings, artwork, and credits remain readable with JavaScript disabled. At the target, the timer is replaced by an English wedding-day message and heading; its interval stops. Seconds are not announced as a live region.

The artwork scene uses the original `sdAKyTg4o5WmZhgAcUR0DbKY-1024.webp` couple cutout, keeping its intrinsic proportions. The former sky and full-height temple/lotus backdrop remain in the asset directory but are no longer downloaded by the closing section. A static clip excludes extraneous edge pixels on the couple cutout. The couple no longer uses the legacy document-scroll offset or negative positioning, so normal motion, reduced motion, and static access show the same composition. Its one-time GSAP entrance coordinates the arch, jasmine crest, couple, lamps, and signature; reduced motion shows their final positions immediately. The approved entrance parallax and persistent music player remain intact.

The closing footer contains one Tamil blessing and a short English personal sign-off, with bottom clearance for the floating music control. The compliments credit was removed. Arun Nagarajan’s copyright is the last line, outside the main reading footer, at 6px in a faint color as explicitly requested. It adds no repeated venue logistics; the optional blessing action remains local to the closing scene.

Validation covers outer viewports 320×844, 390×844, 768×1024, and 1440×900; direct portrait widths 320, 390, 506, and 576; no horizontal overflow; illustration containment during scrolling and resize; reduced motion; no JavaScript; one persistent audio element; the exact IST countdown boundary and completion state; blocked remote fonts; and a simulated GitHub Pages project subpath. Screenshots and checks are under `artifacts/closing/`. Include `closing.css` with the existing relative assets when hosting on GitHub Pages; no build step is required. Changes remain local and unpublished.


## Mixed-language refinement — 9 November 2026

The approved direction is one multilingual invitation, without line-by-line translation. Keep the existing Tamil hero lettering and small English name captions. Use Tamil for the devotional opening, short `அன்புடன் அழைக்கிறோம்` salutation, `மற்றும்` connector, and closing blessing. Use English once for family details, event headings/descriptions, dates/times, venue/address, countdown, action labels, accessible control names, and calendar event descriptions. Shared dates, venue, links, and audio remain unchanged.

The wording hierarchy was informed by [Pranav Cards' traditional, bilingual, and concise examples](https://pranavcards.com/blogs/tamil-wedding-invitation-wording-examples/) and [Funvite's Tamil invitation structure](https://funvite.live/tamil-wedding-invitation/). The selected arrangement is specific to this website rather than a copy of either example. Static HTML contains the actual final copy; removed translations are not merely hidden with CSS.

Fresh live browser results and screenshots are saved under `artifacts/mixed-language-2026-11-09/`. The repeatable browser integration runner checks the new English action labels while preserving tests for correct calendar dates, configuration updates, invalid-date recovery, no-JavaScript access, reduced motion, responsive layout, and countdown boundaries.

At 390px, the revised celebrations section measures 945px high, compared with 1369px before the language refinement (about 31% shorter). All 12 browser integration scenarios passed. Direct 320/390/506/576px checks additionally verify two preserved Tamil hero names, the Tamil welcome and closing blessing, no Tamil translations inside the English practical-information blocks, correct formal English names, and the retained 6px final copyright.

## Shower your blessings — 9 November 2026

The closing illustration now has a small English `Shower your blessings` button below it. One tap releases 16 jasmine/rose sprites over the couple for roughly 2.6 seconds and announces `உங்கள் ஆசிகளுக்கு நன்றி` through a polite Tamil status region. The interaction is local and decorative; it does not submit guest information. Repeated taps are guarded until cleanup, and keyboard focus stays on the native button so it can be used again.

`blessings.js` owns the interaction independently of the configuration bridge and persistent audio player. The overlay is an absolutely positioned child of `.closing-scene`, with pointer events disabled and no full-viewport canvas. The browser animates only small transforms and opacity; no animation-frame polling loop is added. Completion, a three-second safety timeout, resize, off-screen visibility, page hiding, and preference changes clean up pending animation state. Reduced motion and unavailable GSAP show three stationary flowers briefly with the same acknowledgement. Without JavaScript or if flower artwork cannot load, the original illustration/blessing remains readable and the optional action is hidden. The sprite is loaded before the action appears so a first tap does not outrun its image download.

### Flower asset mapping

- Original provided by the user: `assets/img/Gemini_Generated_Image_34uh2a34uh2a34uh.png` (2400×1792), preserved untouched.
- Transparent derivative: `assets/img/blessings/flower-sheet.png` (1451×1084, about 623KB), prepared with the image-editing tool to remove the opaque background.
- Six inline SVG view boxes in `blessings.js` render the two jasmine flowers, two deep rose petals, and two blush petals separately from that sheet. The image is shared/cached; its original full-resolution source is not downloaded by the invitation.
- `closing.css` styles the overlay, small action, focus state, and reserved acknowledgement area. The existing hero parallax, illustrations, English practical details, Tamil blessing, calendar links, music player, and tiny last-line copyright are retained.

The focused browser runner is `scripts/blessings-browser.cjs`, using the same optional QA environment variables as the general browser runner. It covers actual phone/tablet/desktop frames, rapid taps, keyboard reuse, cleanup, reduced motion, cancellation, playing/paused music continuity, unavailable animation support, no-JavaScript content, missing image failure, and prepared-image alpha. Test results/screenshots are delivered under `artifacts/blessings-2026-11-09/`. Include `blessings.js` and `assets/img/blessings/flower-sheet.png` with the static site for GitHub Pages; no package, framework, or build step is required.


## Personal ceremonial ending — 9 November 2026

The reference’s intimate personal sign-off is adapted to this invitation’s Tamil temple identity. The repeated full-height temple poster has been replaced by a maroon ceremonial alcove: a double gold arch, two understated lamp outlines, the existing garland-exchange couple, and a lotus-shaped gold thread beneath their feet. These ornaments are lightweight inline SVG, with the couple’s proportions preserved. No new raster asset, font download, framework, or dependency is needed.

Below the illustration, `Deepak & Gomathi` forms the main ivory italic signature. A custom interlaced D/G monogram sits inside a kolam-inspired seal. The Tamil blessing is followed by the personal English note, “Come for the celebration. Stay in our story, always.” This keeps the two languages complementary rather than repeating every line. The existing real-date/countdown panel remains above the sign-off, so the closing does not repeat event logistics.

The existing flower button is now inside the closing scene; its transparent jasmine and rose sprites shower the whole personal panel without blocking the text or controls. The button retains its keyboard operation, status announcement, rapid-tap guard, static reduced-motion fallback, and cleanup behavior. Its light-gold surface and ivory focus outline contrast with the dark background. The music player and entrance parallax are unchanged. Arun Nagarajan’s requested faint 6px copyright remains the final line.

The alcove scales with the actual iframe width and viewport height. The illustration is capped at 320px wide and becomes smaller on shorter screens, without changing its aspect ratio; names and Tamil copy remain live HTML in normal flow. The optional flower controls stay hidden until the sprite loads and remain hidden without JavaScript. Current ending previews and verification evidence are under `artifacts/personal-ending-2026-11-09/`. Work remains local, without committing or publishing.


## A shared ceremonial theme — 9 November 2026

`wedding-theme.css` now supplies shared ivory, maroon, antique-gold, ink, paper, display, and body tokens for the existing sections and desktop surround. The paper color follows the supplied arch artwork (`#f1ede5`) so its seams remain quiet; ivory (`#fff3e1`) is used for inset surfaces and controls. The realistic blue-sky entrance, Tamil gold names, moving temple, and colorful original architectural artwork remain intact.

A reusable inline SVG wedding-thread/kolam motif connects the invitation, celebrations, venue, and countdown. Repeated arch shapes connect the event illustrations, venue frame, countdown numerals, and closing alcove. English ceremonial headings use the same italic Georgia family as the closing signature; Tamil continues to use the locally hosted fonts. Buttons share a rounded shape, gold edges, and maroon/ivory surfaces. The desktop backdrop now echoes the maroon stationery, without the former large blurred image layer. The music control has a two-color focus treatment visible against both paper and maroon.

The ending gains a delicate jasmine crest and a dotted gold border. Its D/G seal is surrounded by eight outlined jasmine blossoms. Tapping the existing flower button fills this wreath with ivory blossoms, leaving a visible acknowledgement after the falling petals finish. This state lasts for the current page visit only; no guest information is collected or stored. The native button, existing polite Tamil acknowledgement, manual music state, and all cleanup/fallback behavior remain intact.

`wedding-theme.js` now uses GSAP ScrollTrigger for one-time gold-thread drawing and section entrances. Content is visible before JavaScript and with unsupported observers. Reduced motion disables both this entrance and the small seal-bloom motion, while still showing the completed blossom state after a tap. The GSAP browser distributions are hosted locally; no application-owned polling loop or build step is added.

Deploy `wedding-theme.css` and `wedding-theme.js` alongside the existing static files. The stylesheet is linked by both entry points; all internal links and artwork remain relative for GitHub Pages project hosting. Current visual previews, flower-interaction results, integration results, and shared-paper/overflow measurements are under `artifacts/ceremonial-theme-2026-11-09/`. Changes remain uncommitted and unpublished.


## GSAP choreography — 9 November 2026

The requested GSAP-only motion pass adds intentional movement to the existing design without altering its content or artwork proportions. Motion is limited to the temple depth/sky, small one-time ceremonial entrances, a timeline thread, the persistent playback indicator, and the guest-triggered flower/seal interaction. Countdown digits do not flip every second, and reading sections are not pinned or automatically scrolled.

The pinned files `assets/vendor/gsap/gsap.min.js` and `ScrollTrigger.min.js` load before the local animation scripts using ordered `defer` tags. The original license banners are preserved; provenance and the standard license link are in the vendor README. Shipping local distributions keeps the website compatible with GitHub Pages and avoids a runtime CDN dependency. If GSAP fails, the page shows the complete static invitation, directions, calendar links, date, names, and closing blessing. If only ScrollTrigger fails, the optional GSAP flower shower still works.

Implementation references: [GSAP matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/), [GSAP context](https://gsap.com/docs/v3/GSAP/gsap.context()/), and [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), consulted through Context7 and official documentation. The only stroke painting is on small gold ornament paths; larger scenes animate transforms and opacity. Native CSS animation and Web Animations API motion no longer run on the active invitation.

Fresh browser evidence is under `artifacts/gsap-motion-2026-11-09/`, including phone/tablet/desktop captures, reduced-motion and missing-library fallbacks, actual GSAP lifecycle checks, regression results, and a short phone journey recording. The new GSAP pass remains local until explicitly committed/pushed.


## Full-viewport hero and supplied name artwork — 9 November 2026

The former width-derived `10/16.8` aspect ratio made the hero shorter than tall phone screens and the desktop iframe. The hero now uses the visible viewport height, while the desktop portrait frame dimensions stay unchanged. A normal-flow name stack inside the moving name layer keeps the supplied lettering, live connector, and short Tamil caption together. The tower is proportionally centered and sized to extend below the viewport; sky and foliage fill the remaining scene. Small container queries prevent devotional/caption wrapping from colliding with the name artwork in short, narrow frames. A static foreground mask on very short screens keeps foliage below the name/caption area. All existing GSAP depth caps, sky timing, foreground stacking, and temple-over-name behavior remain intact.

The original `Gemini_Generated_Image_bwaciobwaciobwac.png` and `Gomathi.png` are used directly and preserved untouched. SVG view boxes exclude empty margins and corner marks; the existing alpha filter removes the dark background. The raster name art has explicit Tamil/English accessible names, and the semantic H1 remains real HTML. The unused Tiro face is no longer requested for the hero; live devotional/caption/body text continues to use locally hosted Noto Serif Tamil.

At the user’s request, verification used direct `file://` browser previews with local-file access enabled in Chromium; no HTTP preview server was used after that instruction. `scripts/hero-browser.cjs` verifies ten size/resize cases: 320×568, 320×844, 390×844, 430×932, 768×1024, 1440×900, 844×390, 390×320, 390×660, and back to 390×844. Checks cover exact viewport height, the next section beginning below it, artwork proportions, image labels/sources, loaded fonts, no overflow, touch target placement, GSAP depth after scrolling, reduced motion, and static no-JavaScript content. The seven GSAP lifecycle scenarios also pass against a direct-file URL. Screenshots and reports are under `artifacts/full-height-hero-2026-11-09/`.


## Hero wording refinement — 9 November 2026

The devotional line is now the concise `ஸ்ரீ கணபதியே துணை`. The former mixed devotional/invitation phrase was incomplete. Beneath the supplied name artwork, `எங்கள் திருமணத்திற்கு அன்புடன் அழைக்கிறோம்` provides a complete personal invitation (“We warmly invite you to our wedding”). The chosen name images, full-height composition, and GSAP motion remain unchanged. The existing accessible English invitation expresses the same meaning without duplicating a visible translated line.


## Calmer hero name block — 9 November 2026

The name block has been simplified in response to the crowded appearance. The decorative ribbon has been removed from the active composition. A small HTML `மற்றும்` with two fine side rules joins the names; the source ribbon file remains untouched. The supplied Deepak artwork is slightly smaller, and Gomathi has a narrower width to balance its taller letterforms. The invitation line is shortened to `அன்புடன் அழைக்கிறோம்`, with normal weight, no heavy shadow, and a clear gap beneath the names. The temple moves up from 38% to 36% of the viewport height to keep the text and architecture connected.

No new decorative effect is added. The complete name block still participates in the existing GSAP depth sequence, and the hero continues to fill the viewport. Ten direct-file browser size/resize checks pass, including very short screens, parallax, reduced motion, and JavaScript disabled. Screenshots and results are in `artifacts/calm-hero-2026-11-09/`; no HTTP preview server is used.


## Combined supplied name banner — 10 November 2026

The newly supplied `assets/img/New-section/Golden Tamil Wedding Name Banner.png` replaces both separate name artworks and the HTML `மற்றும்` divider in the active hero. Its ribbon already joins the names, so no second connector is added. The original 1774×887 PNG is preserved untouched. A `240 0 1280 887` SVG view box excludes the unused side margins while retaining the gold composition’s proportions and its existing transparency; the former dark-background-removal filter is not applied to this asset.

The banner width is now `min(74cqw, 35cqh)`, with a smaller height cap on very short frames. The short `அன்புடன் அழைக்கிறோம்` caption, devotional line, semantic heading, full-viewport hero, temple/foliage layers, and existing GSAP name-layer movement remain. Superseded images stay in the assets directory but are no longer referenced by the hero. `scripts/hero-browser.cjs` now checks the single supplied banner and its accessible name. Direct-file screenshots and the ten viewport/resize checks are saved under `artifacts/combined-banner-2026-11-10/`; no HTTP server is used.


## Headed Playwright hero audit — 10 November 2026

The audit used non-headless Chromium (`headless: false`) through Playwright on Xvfb because the remote workspace has no physical desktop display. Navigation uses direct local `file://` URLs with local-file access enabled; no HTTP server is started. This is a real headed browser session on a virtual display, not a window opened on the user’s computer. The audit runner verifies Chromium’s launch command has no `--headless` flag and saves the virtual display identifier and a browser recording.

### Findings and fixes

- The 390px frame’s invitation caption was 10px. Its pale text/base-sky color pair had approximately 3.04:1 contrast. It now uses 12px or larger text on normal frames, stronger weight, ivory lettering, and a static blue tint behind the upper copy. The tint preserves the sky imagery without adding another badge behind the caption. The small devotional line remains small as requested, with stronger background contrast.
- The combined name banner was 265px wide in the 390px frame. Its width cap is now slightly larger, giving the names a clearer primary role and reducing the loose space before the temple. Artwork proportions and the user’s supplied PNG remain intact.
- The scroll arrow had no visible action label. Normal frames now show `Read invitation` in a 44px-high maroon control, aligned vertically with the persistent music button. Compact frames retain a 44px icon-only control with the same accessible name. The two targets keep at least an 8px gap in the checked layouts. Safe-area insets are included in their bottom placement.
- The name banner’s accessible image label duplicated the semantic H1. The banner is now decorative; the hero region uses `aria-labelledby="entrance-title"` to reference the real HTML heading once. The control’s accessible name matches its visible label.

The recording exercises native wheel scrolling, the gopuram covering the name layer, keyboard focus, Enter navigation into the actual invitation, manual audio pause through that navigation, and a live switch to reduced motion. Normal screenshots cover 320×568, 390×844, 768×1024, 1440×900, and the compact 844×390 landscape frame. Contrast checks sample actual sky pixels behind both text lines at the cloud drift endpoints and midpoint. The geometry/resize and GSAP lifecycle suites also run in headed mode through `QA_HEADED=1`.

Results, before/after screenshots, contrast measurements, browser-mode evidence, and `headed-hero-review.webm` are saved in `artifacts/hero-headed-audit-2026-11-10/`. Chromium was exercised; other browser engines and real-device safe-area behavior were not tested. Work remains local and uncommitted.


## Adaptive closing scene — 10 November 2026

The maroon closing scene now uses the actual iframe viewport height, with a minimum height of `100dvh - 14px` to accommodate the final copyright line. The countdown remains a separate prelude above it. The illustration responds to both available height and width; the couple, double arch, and jasmine crest retain their original proportions. A single grid gap replaces stacked footer margins, the monogram is smaller, and the English sign-off wraps naturally. The decorative uppercase tagline is omitted below 700px viewport height so the names, Tamil blessing, and action have priority.

The scene has no fixed height or internal scrolling. Very short landscape windows and enlarged text expand the document and remain reachable through normal page scrolling. Grid columns may shrink below their content’s intrinsic width, keeping the flower button within the panel on narrow portrait frames. Bottom padding reserves space for the persistent music button and safe-area inset. Existing focus outlines, polite acknowledgement, reduced-motion behavior, and manually paused music are preserved. The scene is a named semantic section; the faint 6px copyright remains last.

Headed Chromium verification uses local `file://` entry points and Xvfb, without an HTTP server. `scripts/closing-browser.cjs` checks phone, tablet, desktop and short landscape frames, live resizing, text enlargement, keyboard activation, music clearance, proportional artwork, reduced motion and JavaScript-disabled content. Evidence and a headed recording are in `artifacts/responsive-ending-2026-11-10/`. No committing, pushing, or publishing is included.

## Bilingual blessing action and growing jasmine wreath — 10 November 2026

The flower button now leads with Tamil, `மலர் தூவி வாழ்த்துங்கள்`, and retains the smaller English `Shower your blessings` label. Both language spans are included in the native accessible name. This is a deliberate bilingual control, without repeating the rest of the invitation line by line.

Each accepted activation lights one of the eight jasmine flowers around the D/G seal. After eight showers the wreath stays complete; further showers remain available. The existing section-scoped GSAP petals and reduced-motion fallback remain. The polite acknowledgement contains only Tamil thanks, `உங்கள் ஆசிகளுக்கு நன்றி`. No visible or announced counts are shown. Each accepted shower lights the next unlit flower; rapid taps during an active shower are ignored. The wreath resets on reload. No network service or database is introduced.

The illustration’s height budget and acknowledgement’s reserved space account for the two-line button and Tamil thank-you. This keeps the responsive ending stable while the acknowledgement appears. Keyboard access, manually paused music, sprite failure behavior and no-JavaScript content remain intact. Headed, direct-file browser results are under `artifacts/bilingual-blessings-2026-11-10/`.
