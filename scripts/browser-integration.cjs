/* QA only. The invitation itself remains static HTML/CSS/JS with no build step.
 * Run against a local server using Playwright available in your Node environment:
 *   node scripts/browser-integration.cjs
 * Optional: QA_BASE_URL, QA_OUTPUT_DIR, PLAYWRIGHT_MODULE, CHROMIUM_EXECUTABLE.
 */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = (process.env.QA_BASE_URL || 'http://localhost:4173').replace(/\/$/, '');
const output = process.env.QA_OUTPUT_DIR || 'artifacts/browser-integration';
const shots = path.join(output, 'screenshots');
const sections = ['.temple-entrance', '.formal-invitation', '.celebrations', '.wedding-closing'];
const dates = ['20270311T130000Z/20270311T130000Z', '20270312T003000Z/20270312T020000Z'];
const report = { runAt: new Date().toISOString(), tests: [], views: [], googleHandoffs: [] };
fs.mkdirSync(shots, { recursive: true });
let browser;
async function step(name, fn) {
  const started = Date.now();
  try { const evidence = await fn(); report.tests.push({ name, passed: true, milliseconds: Date.now() - started, evidence }); console.log('PASS', name); }
  catch (error) { report.tests.push({ name, passed: false, error: error.stack }); console.error('FAIL', name, error.message); }
}
async function open(options = {}, iframe = true) {
  const page = await browser.newPage(options);
  page.setDefaultTimeout(12000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(iframe ? base + '/' : base + '/invite.html?standalone=true', { waitUntil: 'domcontentloaded' });
  const frame = iframe ? await (await page.locator('iframe').elementHandle()).contentFrame() : page;
  if (options.javaScriptEnabled !== false) await frame.waitForSelector('.mp-btn');
  return { page, frame, errors };
}
async function calendarLinks(frame) {
  return frame.locator('.ce-calendar').evaluateAll(es => es.map(e => ({
    href: e.href, target: e.target, rel: e.rel,
    width: e.getBoundingClientRect().width, height: e.getBoundingClientRect().height,
    tamil: !!e.querySelector('[lang="ta"]'), english: !!e.querySelector('[lang="en"]')
  })));
}
function validateLinks(links) {
  assert.equal(links.length, 2);
  links.forEach((link, index) => {
    const u = new URL(link.href);
    assert.equal(u.origin, 'https://calendar.google.com');
    assert.equal(u.pathname, '/calendar/render');
    assert.equal(u.searchParams.get('action'), 'TEMPLATE');
    assert.equal(u.searchParams.get('dates'), dates[index]);
    assert.equal(u.searchParams.get('ctz'), 'Asia/Kolkata');
    assert(u.searchParams.get('text').includes('Deepak Kumar & Gomathi'));
    assert(u.searchParams.get('location').includes('No. 71'));
    assert(u.searchParams.get('details').includes('https://share.google/9cDnaaYRR4evNU4Ec'));
    assert.equal(link.target, '_blank'); assert(link.rel.includes('noopener'));
    assert(link.english && !link.tamil); assert(link.width >= 44 && link.height >= 44);
  });
}
async function fixtureEvents(frame) {
  return frame.locator('[data-event-key]').evaluateAll(es => es.map((e, index) => ({
    id: e.dataset.eventKey, title: e.querySelector('[data-ce-title]').textContent,
    date: e.querySelector('[data-ce-date]').textContent, time: e.querySelector('[data-ce-time]').textContent,
    venue: document.querySelector('[data-ce-venue]').textContent,
    description: e.querySelector('[data-ce-description]').textContent,
    start: index ? '2027-03-12T06:00:00+05:30' : '2027-03-11T18:30:00+05:30',
    end: index ? '2027-03-12T07:30:00+05:30' : null,
    mapLink: 'https://share.google/9cDnaaYRR4evNU4Ec'
  })));
}
async function sendEvents(frame, events) {
  await frame.evaluate(events => window.postMessage({ type: 'invite-data', payload: { config: { events }, texts: {} } }, location.origin), events);
}
(async () => {
  browser = await chromium.launch({ ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : {}), args: ['--no-sandbox'] });
  try {
    for (const [width, height] of [[320, 844], [390, 844], [768, 1024], [1440, 900]]) {
      await step(`Framed layout and controls ${width}x${height}`, async () => {
        const { page, frame, errors } = await open({ viewport: { width, height } });
        try {
          await frame.evaluate(() => Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 5000))]));
          validateLinks(await calendarLinks(frame));
          await frame.evaluate(() => scrollTo(0, 0));
          const first = await frame.locator('.entrance-temple').evaluate(e => getComputedStyle(e).transform);
          await page.screenshot({ path: path.join(shots, `hero-${width}.png`) });
          await frame.evaluate(() => scrollTo(0, 200)); await page.waitForTimeout(150);
          assert.notEqual(await frame.locator('.entrance-temple').evaluate(e => getComputedStyle(e).transform), first);
          await page.screenshot({ path: path.join(shots, `parallax-${width}.png`) });
          for (let i = 1; i < sections.length; i++) {
            await frame.locator(sections[i]).evaluate(e => scrollTo(0, scrollY + e.getBoundingClientRect().top));
            await frame.locator(sections[i] + ' img').evaluateAll(es => Promise.all(es.map(e => { e.loading = 'eager'; return e.decode().catch(() => {}); })));
            await page.screenshot({ path: path.join(shots, `section${i + 1}-${width}.png`) });
          }
          const metrics = await frame.evaluate(() => ({
            frame: innerWidth, overflow: document.documentElement.scrollWidth > innerWidth,
            sections: [...document.querySelectorAll('.temple-entrance,.formal-invitation,.celebrations,.wedding-closing')].map(e => ({ class: e.className, top: e.getBoundingClientRect().top + scrollY, height: e.getBoundingClientRect().height })),
            fonts: [...document.fonts].filter(f => f.family.includes('Temple')).map(f => ({ family: f.family, status: f.status })),
            targets: [...document.querySelectorAll('.entrance-next,.fi-events-link,.ce-calendar,.ce-directions,.mp-btn')].map(e => ({ class: e.className, width: e.getBoundingClientRect().width, height: e.getBoundingClientRect().height })),
            audioCount: document.querySelectorAll('audio').length,
            skyPaused: !window.gsap || !gsap.getById('temple-clouds') || gsap.getById('temple-clouds').paused()
          }));
          assert(!metrics.overflow); assert.equal(metrics.audioCount, 1); assert(metrics.skyPaused);
          assert(metrics.fonts.every(f => f.status === 'loaded'));
          assert(metrics.targets.every(t => t.width >= 44 && t.height >= 44));
          for (let i = 1; i < metrics.sections.length; i++) assert(metrics.sections[i].top >= metrics.sections[i - 1].top + metrics.sections[i - 1].height - 1);
          await frame.locator('.ce-calendar').first().focus();
          assert.equal(await frame.locator('.ce-calendar').first().evaluate(e => getComputedStyle(e).outlineWidth), '3px');
          await page.keyboard.press('Tab');
          assert(await frame.locator('.ce-calendar').nth(1).evaluate(e => document.activeElement === e));
          await page.emulateMedia({ reducedMotion: 'reduce' });
          await frame.waitForFunction(() => getComputedStyle(document.querySelector('.entrance-temple')).transform === 'none');
          assert.equal(await frame.locator('.wedding-closing').evaluate(e => e.getAnimations({ subtree: true }).length), 0);
          await page.setViewportSize({ width: width === 320 ? 390 : 320, height });
          await page.waitForTimeout(250); assert(!await frame.evaluate(() => document.documentElement.scrollWidth > innerWidth));
          assert.deepEqual(errors, []); report.views.push({ viewport: [width, height], ...metrics }); return metrics;
        } finally { await page.close(); }
      });
    }
    await step('Bridge remount updates Calendar timestamps and preserves one audio player', async () => {
      const { page, frame, errors } = await open({ viewport: { width: 390, height: 844 } }, false);
      try {
        const events = await fixtureEvents(frame);
        const changed = events.map(e => ({ ...e }));
        changed[1].start = '2027-03-12T08:00:00+05:30'; changed[1].end = '2027-03-12T09:00:00+05:30';
        changed[1].time = '8:00 AM to 9:00 AM'; changed[1].venue = 'Integration fixture venue';
        await sendEvents(frame, changed);
        await page.waitForFunction(() => new URL(document.querySelector('[data-event-key="wedding"] [data-ce-calendar]').href).searchParams.get('dates') === '20270312T023000Z/20270312T033000Z');
        const changedUrl = new URL(await frame.locator('.ce-calendar').nth(1).getAttribute('href'));
        assert.equal(changedUrl.searchParams.get('location'), 'Integration fixture venue');
        assert.equal(await frame.locator('audio').count(), 1);
        await sendEvents(frame, events);
        await page.waitForFunction(() => new URL(document.querySelector('[data-event-key="wedding"] [data-ce-calendar]').href).searchParams.get('dates') === '20270312T003000Z/20270312T020000Z');
        validateLinks(await calendarLinks(frame)); assert.deepEqual(errors, []);
        return { updatedRange: changedUrl.searchParams.get('dates'), restored: true };
      } finally { await page.close(); }
    });
    await step('Invalid event dates never leave an old Calendar link active', async () => {
      const { page, frame } = await open({ viewport: { width: 390, height: 844 } }, false);
      try {
        const events = await fixtureEvents(frame); const invalid = events.map(e => ({ ...e })); invalid[1].end = 'invalid';
        await sendEvents(frame, invalid);
        await page.waitForFunction(() => document.querySelector('[data-event-key="wedding"] [data-ce-calendar]').hidden);
        assert.equal(await frame.locator('.ce-calendar').nth(1).getAttribute('href'), null);
        invalid[1].end = '2027-03-12T05:00:00+05:30'; await sendEvents(frame, invalid); await page.waitForTimeout(200);
        assert(!await frame.locator('.ce-calendar').nth(1).isVisible());
        await sendEvents(frame, events); await frame.locator('.ce-calendar').nth(1).waitFor({ state: 'visible' });
        validateLinks(await calendarLinks(frame)); return { invalidEndRejected: true, reversedRangeRejected: true, restored: true };
      } finally { await page.close(); }
    });
    await step('Both real Google Calendar handoffs retain the exact event dates', async () => {
      const { page, frame } = await open({ viewport: { width: 390, height: 844 } });
      try {
        for (let i = 0; i < 2; i++) {
          const [popup] = await Promise.all([page.context().waitForEvent('page'), frame.locator('.ce-calendar').nth(i).click()]);
          try {
            await popup.waitForLoadState('domcontentloaded', { timeout: 20000 });
            const destination = new URL(popup.url());
            assert(['calendar.google.com', 'accounts.google.com'].includes(destination.hostname));
            const calendar = destination.hostname === 'accounts.google.com' ? new URL(destination.searchParams.get('continue')) : destination;
            assert.equal(calendar.searchParams.get('dates'), dates[i]);
            await popup.screenshot({ path: path.join(shots, `google-handoff-${i}.png`) });
            report.googleHandoffs.push({ event: i ? 'ceremony' : 'reception', hostname: destination.hostname, dates: calendar.searchParams.get('dates'), savePerformed: false });
          } finally { await popup.close(); }
        }
        return report.googleHandoffs;
      } finally { await page.close(); }
    });
    await step('JavaScript-disabled Calendar links and static wedding date', async () => {
      const { page, frame } = await open({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false }, false);
      try { validateLinks(await calendarLinks(frame)); assert(await frame.locator('.closing-date').isVisible()); assert(!await frame.locator('.closing-timer').isVisible()); return { nativeLinks: true }; }
      finally { await page.close(); }
    });
    for (const timezoneId of ['Asia/Kolkata', 'America/Los_Angeles']) {
      await step(`Guest timezone ${timezoneId} and unavailable storage`, async () => {
        const page = await browser.newPage({ viewport: { width: 390, height: 844 }, timezoneId });
        try {
          await page.addInitScript(() => { Storage.prototype.getItem = Storage.prototype.setItem = function () { throw new DOMException('Blocked', 'SecurityError'); }; });
          await page.goto(base + '/invite.html?standalone=true'); await page.waitForSelector('.mp-btn');
          validateLinks(await calendarLinks(page)); return { utcRanges: dates };
        } finally { await page.close(); }
      });
    }
    await step('Muhurtham countdown switches at the exact IST boundary', async () => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      try {
        const time = new Date('2027-03-12T00:29:58Z'); await page.clock.install({ time }); await page.clock.pauseAt(time);
        await page.goto(base + '/invite.html?standalone=true'); await page.clock.runFor(260);
        assert(await page.locator('.closing-timer').isVisible());
        await page.clock.runFor(2000);
        assert(!await page.locator('.closing-timer').isVisible()); assert(await page.locator('.closing-arrival').isVisible());
        assert.equal(await page.locator('#closing-title [lang="en"]').innerText(), 'Our wedding day'); return { boundary: '2027-03-12T06:00:00+05:30' };
      } finally { await page.close(); }
    });
    await step('Full visual captures and music overlap evidence', async () => {
      const observations = [];
      for (const width of [320, 390, 506, 576]) {
        const { page, frame } = await open({ viewport: { width, height: 900 }, reducedMotion: 'reduce' }, false);
        try {
          await frame.evaluate(() => document.fonts.ready);
          await frame.locator('.fi-arch,.fi-base,.ce-illustration,.closing-scene img').evaluateAll(es => Promise.all(es.map(e => { e.loading = 'eager'; return e.decode(); })));
          await page.screenshot({ path: path.join(shots, `full-site-${width}.png`), fullPage: true });
          await frame.locator('.celebrations').screenshot({ path: path.join(shots, `calendar-section-${width}.png`) });
          const overlap = await frame.evaluate(() => {
            const text = document.querySelector('[data-ce-venue]'), button = document.querySelector('.mp-btn');
            scrollBy(0, text.getBoundingClientRect().top - button.getBoundingClientRect().top);
            const b = button.getBoundingClientRect(); const range = document.createRange(); range.selectNodeContents(text);
            return [...range.getClientRects()].filter(r => r.left < b.right && r.right > b.left && r.top < b.bottom && r.bottom > b.top).length;
          });
          if (overlap) await page.screenshot({ path: path.join(shots, `music-overlap-${width}.png`) });
          observations.push({ width, intersectingTextRects: overlap });
        } finally { await page.close(); }
      }
      return observations;
    });
  } finally {
    report.passed = report.tests.every(t => t.passed);
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2) + '\n');
    await browser.close();
  }
  if (!report.passed) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
