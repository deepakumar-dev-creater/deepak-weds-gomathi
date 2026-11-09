# Shower your blessings

The last illustration now has a small **Shower your blessings** action. It releases 16 ivory jasmine/deep rose/blush flowers over the couple for about 2.6 seconds, then clears them. A polite Tamil acknowledgement reads **உங்கள் ஆசிகளுக்கு நன்றி**. The action can be repeated once the current shower ends.

## Artwork

The source is the user's `assets/img/Gemini_Generated_Image_34uh2a34uh2a34uh.png`, retained untouched. Its background was opaque, so an image-edited transparent derivative is saved at `assets/img/blessings/flower-sheet.png`. Six inline SVG view boxes isolate its flowers/petals. Browser checks confirm that the derivative's background alpha is zero and the flowers are visible. The original remains opaque and unchanged.

## Behavior

- The overlay is clipped to the existing couple/temple scene and never captures pointer input.
- The native button keeps keyboard focus. Repeated taps during a shower do not stack animations.
- Reduced motion and unavailable animation APIs use three stationary flowers briefly, plus the acknowledgement.
- Animation completion, a safety timeout, resize, scrolling the scene off-screen, page hiding, and motion-preference changes clean up the effect.
- The flower sheet loads before the optional action is revealed, avoiding an empty first animation on slow networks. A missing image or disabled JavaScript leaves the original illustration/blessing readable without a broken button.
- Music is not controlled by the new interaction. Both playing and manually paused states were checked.
- The implementation uses browser-native [Element.animate](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate) and completion promises; it adds no permanent animation-frame loop, canvas, package, framework, backend, or build step.

## Live Playwright checks

All **10 focused scenarios passed** in Chromium:

1. 320×844: shower, rapid taps, cleanup, repeat with Enter, focus, overflow, paused audio.
2. 390×844: same interaction checks.
3. 768×1024: same checks in the portrait tablet frame.
4. 1440×900: same checks in the desktop portrait frame.
5. Reduced motion: three still flowers, no overlay animations, Space activation, polite acknowledgement.
6. Resize/off-screen/motion-preference cancellation and state recovery.
7. Playing music continues; one persistent audio player remains.
8. Missing animation API and JavaScript-disabled access.
9. Transparent prepared sheet and preserved original-image alpha.
10. Missing flower artwork: no broken action; static blessing remains available.

[Results](results.json) · [Phone shower](shower-390.png) · [Narrow phone](shower-320.png) · [Desktop](shower-1440.png) · [Reduced motion](reduced-motion.png).

The repeatable runner is `scripts/blessings-browser.cjs`; it accepts `PLAYWRIGHT_MODULE`, `CHROMIUM_EXECUTABLE`, `QA_BASE_URL`, and `QA_OUTPUT_DIR`, like the existing integration runner. Physical phones, Safari, and Firefox were not exercised. No commit, push, or publication was performed. Existing unrelated working-tree changes were preserved.
