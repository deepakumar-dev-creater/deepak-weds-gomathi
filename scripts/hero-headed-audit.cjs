/* Headed Chromium audit on a virtual display. Direct local files only; no server. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const{pathToFileURL}=require('node:url');
const out=process.env.QA_OUTPUT_DIR||'/tmp/wedding-hero-headed-audit';fs.mkdirSync(out,{recursive:true});
const entry=pathToFileURL(path.resolve('index.html')).href;const results=[];let browser;
async function open(options={}){const context=await browser.newContext(options);const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(entry);const frame=await(await page.locator('iframe').elementHandle()).contentFrame();await frame.waitForSelector('.mp-btn');await frame.evaluate(()=>document.fonts.ready);return{context,page,frame,errors}}
function lum(rgb){return rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0)}
function ratio(a,b){const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
(async()=>{
 browser=await chromium.launch({headless:false,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{}),args:['--no-sandbox','--allow-file-access-from-files']});
 try{
 const cdp=await browser.newBrowserCDPSession();const command=await cdp.send('Browser.getBrowserCommandLine');assert(!command.arguments.some(a=>a.startsWith('--headless')));
 for(const[width,height]of[[320,568],[390,844],[768,1024],[1440,900],[844,390]]){
  const{context,page,frame,errors}=await open({viewport:{width,height}});
  try{
   const metrics=await frame.evaluate(()=>{
    const box=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}};
    const range=document.createRange();range.selectNodeContents(document.querySelector('.entrance-invitation'));const ink=range.getBoundingClientRect();
    return{hero:box(document.querySelector('.temple-entrance')),banner:box(document.querySelector('.entrance-name-banner')),caption:{...box(document.querySelector('.entrance-invitation')),font:parseFloat(getComputedStyle(document.querySelector('.entrance-invitation')).fontSize),color:getComputedStyle(document.querySelector('.entrance-invitation')).color,ink:{x:ink.x,y:ink.y,width:ink.width,height:ink.height}},next:box(document.querySelector('.entrance-next')),music:box(document.querySelector('.mp-btn')),labelVisible:getComputedStyle(document.querySelector('.entrance-next-label')).display!=='none',heading:document.querySelector('h1').textContent,bannerHidden:document.querySelector('.entrance-name-banner').getAttribute('aria-hidden'),headingLink:document.querySelector('.temple-entrance').getAttribute('aria-labelledby'),overflow:document.documentElement.scrollWidth>innerWidth};
   });
   assert.equal(metrics.hero.height,height);assert(!metrics.overflow);assert(metrics.caption.font>=12||metrics.hero.width<260);assert(metrics.next.height>=44&&metrics.music.height>=44);assert(metrics.music.x-metrics.next.right>=8);assert(Math.abs(metrics.next.y+metrics.next.height/2-metrics.music.y-metrics.music.height/2)<1);assert.equal(metrics.bannerHidden,'true');assert.equal(metrics.headingLink,'entrance-title');assert.equal(metrics.labelVisible,metrics.hero.width>260);
   await page.screenshot({path:path.join(out,`hero-${width}x${height}.png`)});
   // Sample the actual moving sky behind both text lines at the drift endpoints
   // and midpoint. Hide the two lines only while taking the measurement image.
   const iframe=await page.locator('iframe').boundingBox();
   const targets=await frame.evaluate(()=>['.entrance-invitation','.entrance-blessing'].map(selector=>{
    const el=document.querySelector(selector),range=document.createRange();range.selectNodeContents(el);const r=range.getBoundingClientRect();return{selector,color:getComputedStyle(el).color,rect:{x:r.x,y:r.y,width:r.width,height:r.height}};
   }));
   const minima=targets.map(()=>100);const original=await frame.evaluate(()=>({progress:gsap.getById('temple-clouds').progress(),paused:gsap.getById('temple-clouds').paused()}));
   try{
    await frame.evaluate(()=>document.querySelectorAll('.entrance-invitation,.entrance-blessing').forEach(e=>e.style.visibility='hidden'));
    for(const phase of [0,.5,1]){
     await frame.evaluate(phase=>{gsap.getById('temple-clouds').pause().progress(phase)},phase);
     const png=await page.screenshot();
     const rects=targets.map(t=>({x:Math.floor(iframe.x+t.rect.x),y:Math.floor(iframe.y+t.rect.y),width:Math.ceil(t.rect.width),height:Math.ceil(t.rect.height)}));
     const pixels=await page.evaluate(async({src,rects})=>{const img=new Image();img.src=src;await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);return rects.map(r=>Array.from(ctx.getImageData(r.x,r.y,r.width,r.height).data))},{src:'data:image/png;base64,'+png.toString('base64'),rects});
     pixels.forEach((colors,j)=>{const fg=targets[j].color.match(/\d+/g).slice(0,3).map(Number);for(let i=0;i<colors.length;i+=4)minima[j]=Math.min(minima[j],ratio(fg,colors.slice(i,i+3)))});
    }
   }finally{
    await frame.evaluate(original=>{document.querySelectorAll('.entrance-invitation,.entrance-blessing').forEach(e=>e.style.removeProperty('visibility'));gsap.getById('temple-clouds').progress(original.progress).paused(original.paused)},original);
   }
   metrics.caption.sampledContrast=+minima[0].toFixed(2);metrics.devotionalContrast=+minima[1].toFixed(2);metrics.contrastDriftPhases=[0,.5,1];
   minima.forEach((minimum,i)=>assert(minimum>=4.5,`${targets[i].selector} contrast ${minimum.toFixed(2)} at ${width}`));
   // Tab into the document from its first native action and activate the real link.
   await frame.locator('.entrance-next').focus();assert(await frame.locator('.entrance-next').evaluate(e=>getComputedStyle(e).outlineWidth==='3px'));
   await page.keyboard.press('Enter');await frame.waitForFunction(()=>location.hash==='#formal-invitation');assert(await frame.locator('.formal-invitation').evaluate(e=>e.getBoundingClientRect().top>=-1&&e.getBoundingClientRect().top<=20));assert.deepEqual(errors,[]);
   results.push({name:`Headed hierarchy/contrast/keyboard ${width}x${height}`,passed:true,metrics});console.log('PASS',results.at(-1).name,metrics.caption.sampledContrast||'compact frame');
  }finally{await context.close()}
 }
 const{context,page,frame,errors}=await open({viewport:{width:390,height:844},recordVideo:{dir:path.join(out,'raw-video'),size:{width:390,height:844}}});
 try{
  await frame.locator('.mp-btn').click();if(!await frame.locator('audio').evaluate(e=>e.paused))await frame.locator('.mp-btn').click();await page.waitForTimeout(1200);await page.mouse.move(195,430);
  for(let i=0;i<5;i++){await page.mouse.wheel(0,60);await page.waitForTimeout(250)}
  await page.screenshot({path:path.join(out,'live-parallax-390.png')});assert(await frame.evaluate(()=>+gsap.getProperty('.entrance-temple','y')<0));await frame.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(500);await frame.locator('.entrance-next').focus();await page.screenshot({path:path.join(out,'keyboard-focus-390.png')});await page.keyboard.press('Enter');await page.waitForTimeout(1500);assert(await frame.locator('audio').evaluate(e=>e.paused));assert.equal(await frame.locator('audio').count(),1);
  await frame.evaluate(()=>scrollTo(0,0));await page.emulateMedia({reducedMotion:'reduce'});await frame.waitForFunction(()=>!gsap.getById('temple-clouds'));assert.equal(await frame.locator('.entrance-temple').evaluate(e=>getComputedStyle(e).transform),'none');await page.screenshot({path:path.join(out,'reduced-motion-390.png')});assert.deepEqual(errors,[]);await page.waitForTimeout(1000);
  const video=page.video();await context.close();await video.saveAs(path.join(out,'headed-hero-review.webm'));results.push({name:'Headed live scroll, focus, anchor, audio continuity and reduced motion recording',passed:true});
 }catch(e){await context.close();throw e}
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({passed:true,mode:'headed Chromium, virtual display, direct file, no HTTP server',headless:false,headlessFlagPresent:false,display:process.env.DISPLAY,tests:results},null,2)+'\n');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
