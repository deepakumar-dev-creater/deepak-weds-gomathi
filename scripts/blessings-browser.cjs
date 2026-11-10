/* Run with the same PLAYWRIGHT_MODULE / CHROMIUM_EXECUTABLE settings as browser-integration.cjs. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = (process.env.QA_BASE_URL || 'http://localhost:4173').replace(/\/$/, '');
const output = process.env.QA_OUTPUT_DIR || 'artifacts/blessings';
fs.mkdirSync(output, { recursive: true });
const results = [];
let browser;
async function step(name, fn) {
  try { const evidence = await fn(); results.push({ name, passed: true, evidence }); console.log('PASS', name); }
  catch (error) { results.push({ name, passed: false, error: error.stack }); console.error('FAIL', name, error.message); }
}
async function open(options = {}, framed = true, setup) {
  const page = await browser.newPage(options);
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  if (setup) await setup(page);
  await page.goto(framed ? base + '/index.html' : base + '/invite.html?standalone=true', { waitUntil: 'domcontentloaded' });
  const frame = framed ? await (await page.locator('iframe').elementHandle()).contentFrame() : page;
  if (options.javaScriptEnabled !== false) {
    await frame.waitForSelector('.mp-btn');
    await frame.waitForSelector('#blessings-button');
    // Consume the player's first-interaction fallback, then keep audio deliberately paused.
    await frame.locator('.mp-btn').click();
    if (!await frame.locator('audio').evaluate(e => e.paused)) await frame.locator('.mp-btn').click();
  }
  return { page, frame, errors };
}
async function position(frame) {
  await frame.locator('.closing-scene').evaluate(e => scrollTo(0, e.getBoundingClientRect().bottom + scrollY - innerHeight + 130));
}
async function ready(frame) {
  await frame.waitForFunction(() => document.querySelector('#blessings-button').getAttribute('aria-disabled') === 'false');
}
(async () => {
  browser = await chromium.launch({ headless:process.env.QA_HEADED!=='1', ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : {}), args: ['--no-sandbox',...(base.startsWith('file:')?['--allow-file-access-from-files']:[])] });
  try {
    for (const [width, height] of [[320,844],[390,844],[768,1024],[1440,900]]) {
      await step(`Flower shower, rapid taps, repeat and keyboard ${width}x${height}`, async () => {
        const { page, frame, errors } = await open({ viewport: { width, height } });
        try {
          await position(frame);
          const button = frame.locator('#blessings-button');
          const layer = frame.locator('.blessing-petals');
          const target = await button.boundingBox(); assert(target.height >= 44 && target.width >= 44);
          await button.click();
          assert.equal(await button.getAttribute('aria-disabled'), 'true');
          assert.equal(await layer.locator('.blessing-petal').count(), 16);
          for (let i=0;i<5;i++) await button.dispatchEvent('click');
          assert.equal(await layer.locator('.blessing-petal').count(), 16);
          assert.equal(await layer.evaluate(e => getComputedStyle(e).pointerEvents), 'none');
          assert(await layer.evaluate(e => e.parentElement.classList.contains('closing-scene')));
          assert(await frame.locator('.closing-scene').evaluate(e => e.classList.contains('has-blessing')));
          assert.equal(await frame.locator('.seal-blossoms').evaluate(e => getComputedStyle(e).fill), 'rgb(255, 243, 225)');
          await page.waitForTimeout(750);
          assert((await frame.locator('#blessings-status').innerText()).includes('உங்கள் ஆசிகளுக்கு நன்றி'));
          await page.screenshot({ path: path.join(output, `shower-${width}.png`) });
          await ready(frame);
          assert.equal(await layer.locator('.blessing-petal').count(),0);
          assert(await frame.locator('.closing-scene.has-blessing').count() === 1);
          assert.equal(await layer.evaluate(e => e.getAnimations({ subtree:true }).length),0);
          assert(await frame.locator('audio').evaluate(e => e.paused));
          await button.focus();
          await page.keyboard.press('Enter');
          assert.equal(await layer.locator('.blessing-petal').count(),16);
          await ready(frame);
          assert(await button.evaluate(e => document.activeElement === e));
          assert(!await frame.evaluate(() => document.documentElement.scrollWidth > innerWidth));
          assert.deepEqual(errors,[]);
          return { target, count:16, rapidTapGuard:true, cleanup:true, repeatByKeyboard:true, audioStayedPaused:true };
        } finally { await page.close(); }
      });
    }
    await step('Reduced motion uses still flowers and a polite acknowledgement', async () => {
      const { page, frame, errors } = await open({ viewport:{width:390,height:844}, reducedMotion:'reduce' });
      try {
        await position(frame); await frame.locator('#blessings-button').focus(); await page.keyboard.press('Space');
        assert.equal(await frame.locator('.blessing-petal').count(),3);
        assert.equal(await frame.locator('.blessing-petals').evaluate(e=>e.getAnimations({subtree:true}).length),0);
        assert.equal(await frame.locator('#blessings-status').getAttribute('aria-live'),'polite');
        await page.waitForTimeout(100); await page.screenshot({path:path.join(output,'reduced-motion.png')});
        await ready(frame); assert.equal(await frame.locator('.blessing-petal').count(),0); assert.deepEqual(errors,[]);
        return { staticFlowers:3, animations:0, keyboardSpace:true };
      } finally { await page.close(); }
    });
    await step('Resize, scrolling away, and changing motion preference cancel cleanly', async () => {
      const { page, frame } = await open({viewport:{width:390,height:844}});
      try {
        await position(frame); await frame.locator('#blessings-button').click();
        await page.setViewportSize({width:320,height:844}); await ready(frame); assert.equal(await frame.locator('.blessing-petal').count(),0);
        await position(frame); await frame.locator('#blessings-button').click();
        await frame.evaluate(()=>scrollTo(0,0)); await ready(frame); assert.equal(await frame.locator('.blessing-petal').count(),0);
        await position(frame); await frame.locator('#blessings-button').click();
        await page.emulateMedia({reducedMotion:'reduce'}); await ready(frame); assert.equal(await frame.locator('.blessing-petal').count(),0);
        return { resize:true, offscreen:true, preferenceChange:true };
      } finally { await page.close(); }
    });
    await step('Playing music continues through a flower shower', async () => {
      const { page, frame } = await open({viewport:{width:390,height:844}});
      try {
        await frame.locator('.mp-btn').click();
        await frame.waitForFunction(()=>!document.querySelector('audio').paused);
        await position(frame); await frame.locator('#blessings-button').click(); await ready(frame);
        assert(await frame.locator('audio').evaluate(e=>!e.paused)); assert.equal(await frame.locator('audio').count(),1);
        return { playing:true, audioCount:1 };
      } finally { await page.close(); }
    });
    await step('Unavailable GSAP fallback and JavaScript-disabled invitation', async () => {
      const { page, frame } = await open({viewport:{width:390,height:844}},false,p=>p.route('**/assets/vendor/gsap/gsap.min.js', route=>route.abort()));
      try { await position(frame); await frame.locator('#blessings-button').click(); assert.equal(await frame.locator('.blessing-petal').count(),3); await ready(frame); }
      finally { await page.close(); }
      const plain = await open({viewport:{width:390,height:844},javaScriptEnabled:false},false);
      try { assert(!await plain.frame.locator('#blessings-button').isVisible()); assert(await plain.frame.locator('.closing-blessing').isVisible()); return { staticFallback:true, noJsButtonHidden:true }; }
      finally { await plain.page.close(); }
    });
    await step('Prepared flower sheet has real alpha; original remains unchanged', async () => {
      const page = await browser.newPage();
      try {
        await page.goto(base+'/invite.html?standalone=true',{waitUntil:'domcontentloaded'});
        const pixels = await page.evaluate(async()=>{
          const read=async src=>{const i=new Image();i.src=src;await i.decode();const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const x=c.getContext('2d');x.drawImage(i,0,0);return {width:i.width,height:i.height,corner:[...x.getImageData(0,0,1,1).data],flower:[...x.getImageData(Math.round(i.width*.2),Math.round(i.height*.2),1,1).data]}};
          return {prepared:await read('assets/img/blessings/flower-sheet.png'),original:await read('assets/img/Gemini_Generated_Image_34uh2a34uh2a34uh.png')};
        });
        assert.equal(pixels.prepared.corner[3],0); assert(pixels.prepared.flower[3]>0); assert.equal(pixels.original.corner[3],255);
        return pixels;
      } finally { await page.close(); }
    });
    await step('Missing flower artwork leaves the original invitation readable', async () => {
      const page = await browser.newPage({ viewport:{width:390,height:844} });
      try {
        await page.route('**/assets/img/blessings/flower-sheet.png', route=>route.abort());
        await page.goto(base+'/invite.html?standalone=true');
        await page.waitForSelector('.mp-btn');
        assert(!await page.locator('#blessings-button').isVisible());
        assert(await page.locator('.closing-blessing').isVisible());
        assert.equal(await page.locator('.blessing-petal').count(),0);
        return { hiddenUntilArtworkReady:true, staticBlessingVisible:true };
      } finally { await page.close(); }
    });
  } finally {
    fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({passed:results.every(r=>r.passed),tests:results},null,2)+'\n');
    await browser.close();
  }
  if(results.some(r=>!r.passed))process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
