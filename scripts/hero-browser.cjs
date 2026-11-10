/* Direct file preview only: no HTTP server is needed for the hero review. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const output=process.env.QA_OUTPUT_DIR||'/tmp/wedding-full-height-hero';
const entry=pathToFileURL(path.resolve('index.html')).href;
fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:process.env.QA_HEADED!=='1',...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{}),args:['--no-sandbox','--allow-file-access-from-files']});
 const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));const results=[];
 try{
  await page.goto(entry);const frame=await(await page.locator('iframe').elementHandle()).contentFrame();await frame.waitForSelector('.mp-btn');
  for(const[width,height]of[[320,568],[320,844],[390,844],[430,932],[768,1024],[1440,900],[844,390],[390,320],[390,660],[390,844]]){
   await page.setViewportSize({width,height});await frame.evaluate(()=>scrollTo(0,0));await frame.evaluate(()=>document.fonts.ready);await page.waitForTimeout(350);
   const m=await frame.evaluate(()=>{
    const hero=document.querySelector('.temple-entrance').getBoundingClientRect();const temple=document.querySelector('.entrance-temple').getBoundingClientRect();const next=document.querySelector('.entrance-next').getBoundingClientRect();const caption=document.querySelector('.entrance-invitation').getBoundingClientRect();
    return{outer:[parent.innerWidth,parent.innerHeight],frame:[innerWidth,innerHeight],hero:{width:hero.width,height:hero.height},temple:{top:temple.top,bottom:temple.bottom,width:temple.width,height:temple.height},captionBottom:caption.bottom,next:{top:next.top,bottom:next.bottom,height:next.height},secondTop:document.querySelector('.formal-invitation').getBoundingClientRect().top,overflow:document.documentElement.scrollWidth>innerWidth,names:[...document.querySelectorAll('.entrance-name-art')].map(e=>({label:document.querySelector('h1').textContent,decorative:e.getAttribute('aria-hidden')==='true',source:e.querySelector('image').href.baseVal,bounds:{x:e.getBoundingClientRect().x,right:e.getBoundingClientRect().right}})),fonts:[...document.fonts].filter(f=>f.family.includes('Temple')).map(f=>({family:f.family,status:f.status})),skyPaused:gsap.getById('temple-clouds').paused()};
   });
   assert(Math.abs(m.hero.height-height)<1);assert(Math.abs(m.hero.width-m.frame[0])<1);assert(m.secondTop>=height-1);assert(!m.overflow);assert(m.temple.bottom>=height);assert(Math.abs(m.temple.width/m.temple.height-1300/1965)<.001);assert(m.next.bottom<=height&&m.next.height>=44);assert.equal(m.names.length,1);assert(m.names[0].source.endsWith('Golden Tamil Wedding Name Banner.png'));assert(m.names.every(n=>n.label&&n.decorative&&n.bounds.x>=0&&n.bounds.right<=m.frame[0]));assert(m.fonts.every(f=>f.status==='loaded'));
   await page.screenshot({path:path.join(output,`hero-${width}x${height}.png`)});
   await frame.evaluate(()=>scrollTo(0,200));await page.waitForTimeout(150);const depth=await frame.evaluate(()=>({temple:+gsap.getProperty('.entrance-temple','y'),names:+gsap.getProperty('.entrance-name-layer','y')}));assert(depth.temple<0);assert(Math.abs(depth.names-200)<2);m.depth=depth;results.push(m);
  }
  await page.emulateMedia({reducedMotion:'reduce'});await frame.waitForFunction(()=>!gsap.getById('temple-clouds'));assert.equal(await frame.locator('.entrance-temple').evaluate(e=>getComputedStyle(e).transform),'none');await frame.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(output,'reduced-motion.png')});assert.deepEqual(errors,[]);
  const plain=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:false});await plain.goto(entry);const pf=await(await plain.locator('iframe').elementHandle()).contentFrame();assert.equal(await pf.locator('.temple-entrance').evaluate(e=>e.offsetHeight),844);assert.equal(await pf.locator('h1').innerText(),'தீபக் குமார் மற்றும் கோமதி — Deepak Kumar & Gomathi');assert.equal(await pf.locator('.entrance-name-art').count(),1);await plain.screenshot({path:path.join(output,'no-javascript.png')});await plain.close();
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({passed:true,mode:'direct-file, no HTTP server',views:results,reducedMotion:true,noJavaScript:true,errors},null,2)+'\n');console.log('PASS 10 viewport/resize cases, supplied artwork, proportion, full height, parallax, reduced motion, no JavaScript');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
