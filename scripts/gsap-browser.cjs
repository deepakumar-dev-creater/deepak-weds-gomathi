/* GSAP lifecycle/regression checks, using the same QA variables as browser-integration.cjs. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=(process.env.QA_BASE_URL||'http://localhost:4173').replace(/\/$/,'');
const out=process.env.QA_OUTPUT_DIR||'/tmp/wedding-gsap-lifecycle';
fs.mkdirSync(out,{recursive:true});
const results=[];
let browser;
async function step(name,fn){try{results.push({name,passed:true,evidence:await fn()});console.log('PASS',name)}catch(e){results.push({name,passed:false,error:e.stack});console.error('FAIL',name,e.message)}}
async function open(options={},setup){
 const p=await browser.newPage(options);p.setDefaultTimeout(12000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
 if(setup)await setup(p);
 await p.goto(base+'/index.html',{waitUntil:'domcontentloaded'});
 const f=await(await p.locator('iframe').elementHandle()).contentFrame();await f.waitForSelector('.mp-btn');
 await f.evaluate(()=>document.fonts.ready);return{p,f,errors};
}
(async()=>{
 browser=await chromium.launch({headless:process.env.QA_HEADED!=='1',...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{}),args:['--no-sandbox',...(base.startsWith('file:')?['--allow-file-access-from-files']:[])]});
 try{
 for(const[width,height]of[[320,844],[390,844],[768,1024],[1440,900]])await step(`GSAP-only scene lifecycle ${width}x${height}`,async()=>{
  const{p,f,errors}=await open({viewport:{width,height}});
  try{
   const initial=await f.evaluate(()=>({version:gsap.version,triggers:ScrollTrigger.getAll().length,cloudDuration:gsap.getById('temple-clouds').duration(),cloud:gsap.getById('temple-clouds').vars,cssAnimations:document.getAnimations().length}));
   assert.equal(initial.version,'3.15.1');assert.equal(initial.cloudDuration,24);assert.equal(initial.cloud.xPercent,2);assert.equal(initial.cloud.yPercent,.5);assert.equal(initial.cloud.scale,1.08);assert.equal(initial.cssAnimations,0);
   await p.screenshot({path:path.join(out,`hero-${width}.png`)});
   await f.evaluate(()=>scrollTo(0,200));await p.waitForTimeout(150);
   const depth=await f.evaluate(()=>({temple:+gsap.getProperty('.entrance-temple','y'),names:+gsap.getProperty('.entrance-name-layer','y'),limit:parent.innerWidth>=810?50:30}));
   assert(depth.temple<0&&depth.temple>=-depth.limit-.01);assert(Math.abs(depth.names-200)<2);
   await p.screenshot({path:path.join(out,`depth-${width}.png`)});
   await f.locator('.ce-header').scrollIntoViewIfNeeded();await p.waitForTimeout(1200);
   assert(await f.evaluate(()=>gsap.getById('temple-clouds').paused()));
   await p.screenshot({path:path.join(out,`celebrations-${width}.png`)});
   await f.locator('.closing-scene').scrollIntoViewIfNeeded();await p.waitForTimeout(1400);
   await p.screenshot({path:path.join(out,`ending-${width}.png`)});
   // A completed ornament must not draw again when revisited.
   await f.evaluate(()=>scrollTo(0,0));await f.locator('.ce-header').scrollIntoViewIfNeeded();await p.waitForTimeout(100);
   assert(await f.locator('.ce-header .wedding-thread path').evaluateAll(es=>es.every(e=>!e.style.strokeDashoffset)));
   await p.emulateMedia({reducedMotion:'reduce'});
   await f.waitForFunction(()=>!gsap.getById('temple-clouds')&&ScrollTrigger.getAll().length===0);
   const reduced=await f.evaluate(()=>({transform:getComputedStyle(document.querySelector('.entrance-temple')).transform,cssAnimations:document.getAnimations().length,activeTweens:gsap.globalTimeline.getChildren(true,true,false).filter(t=>t.isActive()).length}));
   assert.equal(reduced.transform,'none');assert.equal(reduced.cssAnimations,0);assert.equal(reduced.activeTweens,0);
   await f.locator('#blessings-button').click();assert.equal(await f.locator('.blessing-petal').count(),3);await p.waitForTimeout(100);
   await p.screenshot({path:path.join(out,`reduced-${width}.png`)});
   await p.emulateMedia({reducedMotion:'no-preference'});await f.waitForFunction(()=>!!gsap.getById('temple-clouds'));
   for(let i=0;i<2;i++){await p.emulateMedia({reducedMotion:'reduce'});await f.waitForFunction(()=>ScrollTrigger.getAll().length===0);await p.emulateMedia({reducedMotion:'no-preference'});await f.waitForFunction(()=>!!gsap.getById('temple-clouds'));}
   const finalCount=await f.evaluate(()=>ScrollTrigger.getAll().length);assert(finalCount<=initial.triggers);
   await p.setViewportSize({width:width===1440?390:1440,height});await p.waitForTimeout(300);await f.evaluate(()=>scrollTo(0,500));await p.waitForTimeout(150);
   const resized=await f.evaluate(()=>({y:+gsap.getProperty('.entrance-temple','y'),cap:parent.innerWidth>=810?50:30,overflow:document.documentElement.scrollWidth>innerWidth}));
   assert(resized.y>=-resized.cap-.01);assert(!resized.overflow);assert.deepEqual(errors,[]);
   return{initial,depth,reduced,finalCount,resized,once:true};
  }finally{await p.close()}
 });
 await step('Missing GSAP leaves readable static invitation and a still blessing',async()=>{
  const{p,f,errors}=await open({viewport:{width:390,height:844}},p=>p.route('**/assets/vendor/gsap/gsap.min.js',r=>r.abort()));
  try{assert(await f.locator('.fi-intro').isVisible());assert(await f.locator('.closing-signature').isVisible());await f.locator('#blessings-button').click();assert.equal(await f.locator('.blessing-petal').count(),3);assert.equal(await f.locator('.ce-calendar').count(),2);assert.deepEqual(errors,[]);return{staticContent:true,flowers:3,errors};}finally{await p.close()}
 });
 await step('Missing ScrollTrigger leaves sections static and GSAP shower usable',async()=>{
  const{p,f,errors}=await open({viewport:{width:390,height:844}},p=>p.route('**/assets/vendor/gsap/ScrollTrigger.min.js',r=>r.abort()));
  try{await f.locator('#blessings-button').click();assert.equal(await f.locator('.blessing-petal').count(),16);assert.equal(await f.locator('.entrance-temple').evaluate(e=>getComputedStyle(e).transform),'none');assert.deepEqual(errors,[]);return{staticSections:true,gsapShower:true};}finally{await p.close()}
 });
 await step('No Web Animations API dependency; paused player and GSAP bars stay paused',async()=>{
  const{p,f,errors}=await open({viewport:{width:390,height:844}},p=>p.addInitScript(()=>{Element.prototype.animate=undefined}));
  try{await f.locator('.mp-btn').click();if(!await f.locator('audio').evaluate(e=>e.paused))await f.locator('.mp-btn').click();await f.locator('#blessings-button').click();assert.equal(await f.locator('.blessing-petal').count(),16);await f.waitForFunction(()=>document.querySelector('#blessings-button').getAttribute('aria-disabled')==='false');assert(await f.locator('audio').evaluate(e=>e.paused));assert(await f.evaluate(()=>gsap.getById('music-bars').paused()));assert.equal(await f.locator('.blessing-petal').count(),0);assert.deepEqual(errors,[]);return{nativeAnimateUnavailable:true,gsapShower:true,pausedMusic:true,pausedBars:true};}finally{await p.close()}
 });
 }finally{fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({passed:results.every(r=>r.passed),tests:results},null,2)+'\n');await browser.close()}
 if(results.some(r=>!r.passed))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
