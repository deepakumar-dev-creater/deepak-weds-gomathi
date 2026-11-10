# Adaptive ceremonial ending — 10 November 2026

The maroon closing scene adapts to the actual portrait iframe width and viewport height. Artwork stays proportional; names, Tamil blessing, English sign-off and flower action remain in normal document flow. Standard viewports fit the complete scene and its final 14px copyright strip. The countdown remains above the scene.

- `before-390x844.png`: exact previous HTML/CSS served from saved pre-edit snapshots through Playwright file routing, without changing source files.
- `ending-*.png`: after screenshots at nine phone/tablet/desktop/landscape sizes.
- `keyboard-blessings.png`: visible keyboard focus, active flower shower, acknowledgement and paused music control.
- `no-javascript.png`, `reduced-motion.png`: progressive-enhancement fallbacks.
- `larger-text-natural-scroll.png`: enlarged text expands the document instead of clipping. Very short landscape windows also scroll normally; fitting everything at once would make it unreadable.
- `headed-ending-review.webm`: headed phone interaction and live resize recording on an Xvfb virtual display. This is not a window on the user's computer.
- `results.json`: 12 passing headed checks, including browser command verification that no headless flag is present. Checks include nine viewport sizes, artwork ratio, panel boundaries, music clearance, focus, keyboard activation, manual audio pause, live resizing, reduced motion, JavaScript disabled, and enlarged text.
- `blessings-results.json`: 10 passing flower interaction/fallback checks from the headed direct-file suite.

All checks used `file:///workspaces/deepak-weds-gomathi/index.html`; no HTTP server was used. Chromium can omit fixed controls in a screenshot before its next repaint after programmatic scrolling; the interaction screenshot and recording show the actual music control, and browser hit-testing confirmed its visibility.

Run the focused regression check with Playwright and Chromium installed:

```sh
xvfb-run -a -s '-screen 0 1800x1100x24' node scripts/closing-browser.cjs
```

`PLAYWRIGHT_MODULE`, `CHROMIUM_EXECUTABLE` and `QA_OUTPUT_DIR` can override this workspace's defaults. No framework, build, deployment, commit, or push was added.
