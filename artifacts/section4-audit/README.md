# Section 4 UI/UX audit

Reviewed the actual portrait iframe at outer viewports 320×844, 390×844, 768×1024 and 1440×900. Captured reduced-motion screenshots with external requests blocked, including remote fonts, to exercise local font fallbacks. Also checked normal motion, JavaScript-disabled content and a simulated date after the wedding. No site source was changed for this audit.

## Findings

1. **High — illustration placement.** The couple cutout uses legacy absolute positioning and a document-scroll parallax offset. Its base position is outside Section 4; reduced motion leaves it outside the visible section. Place it within a stable section composition and apply only a bounded decorative offset.
2. **High — incomplete bilingual content.** The title and timer labels are English-only. D/H/M/S require interpretation. Supply Tamil and English headings and complete unit labels, with a semantic heading and an accessible timer description. Avoid announcing every second to screen readers.
3. **Medium — delayed/misleading initial state.** The timer shows 00 values until the bridge's approximately four-second fallback initialization. With JavaScript disabled it stays at zero. Render the wedding date/time as static HTML and use a neutral loading state until the timer initializes.
4. **Medium — missing completion state.** The explicit target is correctly configured as 2027-03-12T06:00:00+05:30 and the timer clamps at zero. After the target it still says Counting the Days with four zeros. Replace the timer with a bilingual wedding-day blessing after the target.
5. **Medium — fragile hierarchy.** The script font depends on a remote font. When unavailable the title falls back to a wide sans-serif face, wrapping to two lines at 320px and some framed desktop/tablet widths. The absolute overlay then extends over the temple. Give the countdown an ivory content area in normal flow, use local fonts and size it using actual frame width.
6. **Medium — weak ending.** Attribution is 9.5px over detailed artwork, while compliments are in a separate following footer. Keep the credit but group it beneath the illustration with compliments and a short bilingual blessing on a quiet surface.

## Preserve

Retain the existing temple/lotus artwork, couple illustration, portrait frame, music player and precise IST target. Do not duplicate event logistics or add RSVP/contact actions. All tested widths had no document horizontal overflow; reduced-motion snapshots had no active Web Animations in Section 4. These checks do not constitute a complete accessibility conformance audit.

## Recommended structure

Short bilingual closing heading → four readable countdown units with full bilingual labels → temple and couple composition → short bilingual blessing → compliments and attribution. Keep the countdown stable; decorative motion should be small, section-relative, and disabled without changing layout for reduced motion.

Screenshots and runtime measurements are alongside this file in `section-*.png`, `view-*.png`, and `audit.json`.
