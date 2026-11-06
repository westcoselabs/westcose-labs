import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

const base = process.env.PORTFOLIO_BASE_URL || 'http://localhost:3200';
const output = 'artifacts/world-showcase/review';
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-unsafe-swiftshader'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const report = { errors: [], checks: [] };
page.on('pageerror', error => report.errors.push(error.message));
await page.addInitScript(() => {
  if (sessionStorage.getItem('showcase-review')) return;
  sessionStorage.setItem('showcase-review', 'true');
  sessionStorage.setItem('wcl.session.v2', JSON.stringify({version:2,data:{readmeShown:true,startupPlayed:true,unlocked:true,page:0,originPage:null,dismissedNotificationIds:[]}}));
  localStorage.setItem('wcl.preferences.v2', JSON.stringify({version:2,data:{themeId:'dusk',wallpaperId:'dusk-cliffs',soundEnabled:false,highContrast:false,extraReducedMotion:true,displayPreference:'auto'}}));
});
async function shot(name) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${output}/${name}.png` });
  console.log(name);
}
try {
  await page.goto(`${base}/projects?view=os`);
  await page.locator('[data-world-flagship]:visible').waitFor();
  await shot('projects-desktop');
  await page.getByRole('link', {name:'Explore WestCose World',exact:true}).click();
  await page.locator('[data-world-case-study]:visible').waitFor();
  await shot('case-desktop');
  await page.goto(`${base}/projects/westcose-world?view=normal#loadout`);
  await page.locator('[data-world-loadout]:visible').waitFor();
  await shot('loadout-desktop');
  await page.getByRole('button',{name:'Inspect Dead Coast Pier sign in 3D'}).click();
  await page.getByRole('button',{name:'Reset view'}).waitFor({timeout:30000});
  await shot('model-desktop');
  await page.getByRole('button',{name:'Close exhibit'}).click();
  for (const theme of ['dusk','westcose-95','liquid-glass','westcose-xp']) {
    await page.evaluate(theme => {const saved=JSON.parse(localStorage.getItem('wcl.preferences.v2'));saved.data.themeId=theme;localStorage.setItem('wcl.preferences.v2',JSON.stringify(saved));},theme);
    await page.goto(`${base}/projects/westcose-world?view=normal`);
    await page.locator('[data-world-case-study]:visible').waitFor();
    await page.waitForFunction(theme => document.documentElement.dataset.theme === theme && document.documentElement.dataset.shellReady === 'true', theme);
    await page.waitForTimeout(300);
    const axe=await new AxeBuilder({page}).include('[data-world-case-study]').analyze();
    report.checks.push({theme,axe:axe.violations.map(item=>({id:item.id,nodes:item.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),overflow:await page.locator('[data-world-case-study]:visible').evaluate(e=>e.scrollWidth>e.clientWidth)});
    await shot(`case-${theme}`);
  }
  await page.setViewportSize({width:375,height:812});
  await page.goto(`${base}/projects?view=os`);
  await page.locator('[data-world-flagship]:visible').waitFor();
  await shot('projects-pocket');
  await page.getByRole('link',{name:'Explore WestCose World',exact:true}).click();
  await page.locator('[data-world-case-study]:visible').waitFor();
  await shot('case-pocket');
  await page.goto(`${base}/projects/westcose-world?view=os#loadout`);
  await page.locator('[data-world-loadout]:visible').waitFor();
  await shot('loadout-pocket');
  report.checks.push({state:'Pocket deep link',outerScroll:await page.evaluate(()=>scrollY)});
  const deckCollection = page.locator('[data-world-decks]:visible');
  await deckCollection.getByRole('button',{name:'Dead Coast',exact:true}).click();
  await shot('decks-pocket');
  await page.setViewportSize({width:768,height:1024});
  await page.goto(`${base}/projects/westcose-world?view=os#tools`);
  await page.locator('[data-world-case-study]:visible').waitFor();
  await shot('tools-tablet');
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(`${base}/projects/westcose-world?view=os#tools`);
  await page.getByRole('button',{name:'Maximize WestCose World',exact:true}).click();
  await shot('tools-maximized');
  for (const name of ['Development labs','World Builder workflow']) {
    const gallery = page.locator(`[data-world-gallery="${name}"]`);
    const choices = gallery.getByRole('group').getByRole('button');
    for (let index=0;index<await choices.count();index++) {
      await choices.nth(index).click();
      await page.waitForFunction(selector=>{const img=document.querySelector(selector);return img?.complete&&img.naturalWidth>0;},`[data-world-gallery="${name}"] img`);
    }
    await gallery.screenshot({path:`${output}/${name==='Development labs'?'labs-gallery':'builder-gallery'}.png`});
    report.checks.push({gallery:name,loadedChoices:await choices.count()});
  }
  await page.getByRole('button',{name:'Restore WestCose World',exact:true}).click();
  const corner=page.locator('[data-corner="se"]').first();
  const box=await corner.boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
  await page.mouse.down();
  await page.mouse.move(box.x+box.width/2-400,box.y+box.height/2,{steps:12});
  await page.mouse.up();
  await shot('case-narrow-window');
  report.checks.push({state:'Narrow desktop',overflow:await page.locator('[data-world-case-study]:visible').evaluate(e=>e.scrollWidth>e.clientWidth)});
  // Browser zoom halves the CSS viewport and doubles DPR; CSS zoom alone does not
  // exercise responsive media queries. Model a 1440×1000 screen at 200% instead.
  const zoomContext=await browser.newContext({viewport:{width:720,height:500},deviceScaleFactor:2,reducedMotion:'reduce'});
  const zoomPage=await zoomContext.newPage();
  await zoomPage.goto(`${base}/projects/westcose-world?view=normal#loadout`);
  await zoomPage.locator('[data-world-case-study]:visible').waitFor();
  await zoomPage.evaluate(()=>document.fonts.ready);
  const zoomHeading=await zoomPage.getByRole('heading',{name:'Clothing and decks',exact:true}).boundingBox();
  const zoomHeader=await zoomPage.getByRole('banner').boundingBox();
  const headerClearance=zoomHeading.y-(zoomHeader.y+zoomHeader.height);
  if(headerClearance<0) throw new Error('Document chapter title is hidden behind the header at 200% zoom');
  await zoomPage.screenshot({path:`${output}/case-200-percent.png`});
  report.checks.push({state:'200% zoom equivalent (720 CSS px, DPR 2)',headerClearance,overflow:await zoomPage.locator('[data-world-case-study]:visible').evaluate(e=>e.scrollWidth>e.clientWidth)});
  await zoomContext.close();
  await page.goto(`${base}/projects/westcose-world?view=normal#loadout`);
  await page.addInitScript(()=>{const saved=JSON.parse(localStorage.getItem('wcl.preferences.v2'));saved.data.highContrast=true;localStorage.setItem('wcl.preferences.v2',JSON.stringify(saved));});
  await page.reload();
  await page.waitForFunction(()=>document.documentElement.dataset.highContrast==='true');
  await shot('case-high-contrast');
  await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});
  await shot('case-forced-colors');
} catch (error) {
  report.errors.push(error.stack); console.log(error.stack);
  await page.screenshot({path:`${output}/failure.png`});
  report.state = await page.evaluate(() => ({html:document.documentElement.outerHTML.slice(0,1500), parents:(() => {const result=[];let node=document.querySelector('[data-world-flagship]');while(node){const s=getComputedStyle(node),r=node.getBoundingClientRect();result.push([node.tagName,node.className,s.display,s.visibility,r.width,r.height]);node=node.parentElement;}return result;})()}));
}
await fs.writeFile(`${output}/report.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
await browser.close();
