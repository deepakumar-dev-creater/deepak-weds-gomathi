/* Headed, direct-file regression checks for the adaptive ceremonial ending. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/home/codespace/.npm/_npx/d537ee5ee2a13f03/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const out = path.resolve(process.env.QA_OUTPUT_DIR || 'artifacts/responsive-ending-2026-11-10');
fs.mkdirSync(out, { recursive: true });
const entry = pathToFileURL(path.resolve('index.html')).href;
(async () => {
  const browser = await chromium.launch({ headless: false, executablePath: process.env.CHROMIUM_EXECUTABLE || '/home/codespace/.cache/ms-playwright/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const tests = [];
  const command = await (await browser.newBrowserCDPSession()).send('Browser.getBrowserCommandLine');
  assert(!command.arguments.some(a => a.startsWith('--headless')));
  async function ending(page, js = true) {
    const frame = await (await page.locator('iframe').elementHandle()).contentFrame();
    await frame.locator('.closing-signature').waitFor({ state: 'attached' });
    await frame.evaluate(() => document.fonts.ready);
    if (js) await frame.locator('#blessings-button').waitFor();
    await frame.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(1200);
    return frame;
  }
  async function geometry(frame, fullFit) {
    const m = await frame.evaluate(() => {
      const rect = s => { const r = document.querySelector(s).getBoundingClientRect(); return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height }; };
      return { frame: [innerWidth, innerHeight], scene: rect('.closing-scene'), art: rect('.closing-vignette'), footer: rect('.closing-footer'), names: rect('.closing-signature'), blessing: rect('.closing-blessing'), note: rect('.closing-note'), button: rect('#blessings-button'), music: document.querySelector('.mp-btn') ? rect('.mp-btn') : null, credit: rect('.closing-credit'), overflow: document.documentElement.scrollWidth > innerWidth, sceneOverflow: getComputedStyle(document.querySelector('.closing-scene')).overflowY };
    });
    assert(!m.overflow, 'No horizontal overflow');
    assert(Math.abs(m.art.width / m.art.height - 320 / 330) < .01, 'Proportional illustration');
    for (const key of ['names', 'blessing', 'note']) {
      assert(m[key].left >= m.scene.left - 1 && m[key].right <= m.scene.right + 1, key + ' inside scene');
      assert(m[key].bottom <= m.scene.bottom, key + ' not clipped');
    }
    if (m.button.height) {
      assert(m.button.left >= m.footer.left - 1 && m.button.right <= m.footer.right + 1, 'Button inside footer: ' + JSON.stringify(m));
      if (m.music) assert(m.button.bottom <= m.music.top || m.button.right <= m.music.left || m.button.left >= m.music.right, 'Controls do not overlap');
    }
    if (fullFit) {
      assert(m.scene.top >= -1 && m.scene.bottom <= m.frame[1] + 1, 'Whole scene fits viewport: ' + JSON.stringify(m));
      assert(m.credit.bottom <= m.frame[1] + 1, 'Final copyright visible');
    }
    return m;
  }
  try {
    for (const [width, height] of [[320,568],[360,640],[390,660],[390,844],[430,932],[768,1024],[1440,900],[1774,988],[844,390]]) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      await page.goto(entry);
      const frame = await ending(page);
      const metrics = await geometry(frame, height >= 568);
      assert.deepEqual(errors, []);
      await page.screenshot({ path: path.join(out, `ending-${width}x${height}.png`) });
      tests.push({ name: `Responsive ending ${width}x${height}`, passed: true, metrics });
      await page.close();
    }
    for (const [label, options] of [['reduced-motion', { reducedMotion: 'reduce' }], ['no-javascript', { javaScriptEnabled: false }]]) {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 }, ...options });
      await page.goto(entry);
      const frame = await ending(page, options.javaScriptEnabled !== false);
      const metrics = await geometry(frame, true);
      if (options.javaScriptEnabled === false) assert(await frame.locator('#blessings-button').isHidden());
      await page.screenshot({ path: path.join(out, label + '.png') });
      tests.push({ name: label, passed: true, metrics }); await page.close();
    }
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, recordVideo: { dir: path.join(out, 'raw-video'), size: { width: 390, height: 844 } } });
    const page = await context.newPage(); await page.goto(entry);
    let frame = await ending(page);
    await frame.locator('.mp-btn').click();
    if (!await frame.locator('audio').evaluate(e => e.paused)) await frame.locator('.mp-btn').click();
    await page.keyboard.press('Tab');
    await frame.locator('#blessings-button').focus();
    assert(await frame.locator('#blessings-button').evaluate(e => getComputedStyle(e).outlineWidth === '3px'));
    await page.keyboard.press('Enter'); await page.waitForTimeout(400);
    await frame.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(100);
    await geometry(frame, true);
    await page.screenshot({ path: path.join(out, 'keyboard-blessings.png') });
    await page.waitForTimeout(2900);
    assert(await frame.locator('audio').evaluate(e => e.paused), 'Manual audio pause retained');
    assert(await frame.locator('.closing-scene').evaluate(e => e.classList.contains('has-blessing')));
    for (const viewport of [{width:320,height:568},{width:844,height:390},{width:390,height:844}]) {
      await page.setViewportSize(viewport); frame = await ending(page); await geometry(frame, viewport.height >= 568);
    }
    // Larger guest text must grow the document, never disappear in a fixed-height panel.
    await frame.addStyleTag({ content: '.closing-signature{font-size:84px}.closing-blessing,.closing-note{font-size:30px}.blessings-btn{font-size:28px}' });
    await frame.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    const enlarged = await geometry(frame, false);
    assert(enlarged.scene.height > 830);
    await page.screenshot({ path: path.join(out, 'larger-text-natural-scroll.png') });
    tests.push({ name: 'Keyboard blessing, paused audio, live resizing and larger text fallback', passed: true, enlarged });
    const video = page.video(); await context.close(); await video.saveAs(path.join(out, 'headed-ending-review.webm'));
    fs.rmSync(path.join(out, 'raw-video'), { recursive: true, force: true });
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ passed: true, headless: false, headlessFlagPresent: false, display: process.env.DISPLAY, entry, tests }, null, 2) + '\n');
    console.log(`PASS ${tests.length} headed closing checks; ${out}`);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
