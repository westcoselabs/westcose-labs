import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const base=process.env.PORTFOLIO_BASE_URL || 'http://localhost:3101';
const output='artifacts/world-showcase/refinement-review';
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={errors:[],checks:[]};
try {
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage();
  page.on('pageerror',error=>report.errors.push(error.message));
  await page.addInitScript(()=>{
    sessionStorage.setItem('wcl.session.v2',JSON.stringify({version:2,data:{readmeShown:true,startupPlayed:true,unlocked:true,page:0,originPage:null,dismissedNotificationIds:[]}}));
  });
  async function capture(name,route,focus){
    await page.goto(`${base}${route}`);
    await page.locator('[data-world-case-study]:visible, [data-world-flagship]:visible').first().waitFor();
    await page.evaluate(()=>document.fonts.ready);
    if(focus)await page.getByRole('heading',{name:focus,exact:true}).scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({path:`${output}/${name}.png`});
    const article=page.locator('[data-world-case-study]:visible');
    report.checks.push({name,overflow:await article.count()?await article.evaluate(e=>e.scrollWidth>e.clientWidth):false});
  }
  await capture('projects','/projects?view=os');
  await capture('case','/projects/westcose-world?view=os');
  await capture('shop','/projects/westcose-world?view=normal#art','Step inside WestCose.');
  await page.getByRole('button',{name:'Enlarge Art direction',exact:true}).first().click();
  await page.getByRole('dialog').screenshot({path:`${output}/shop-exhibit.png`});
  await page.getByRole('button',{name:'Close exhibit',exact:true}).click();
  await capture('decks-desktop','/projects/westcose-world?view=os#loadout');
  await capture('apparel-desktop','/projects/westcose-world?view=normal#loadout','Wear the coast.');
  await page.setViewportSize({width:375,height:812});
  await capture('projects-mobile','/projects?view=os');
  await capture('case-mobile','/projects/westcose-world?view=os');
  await capture('decks-mobile','/projects/westcose-world?view=os#loadout');
  await page.locator('[data-world-decks] fieldset').scrollIntoViewIfNeeded();
  await page.screenshot({path:`${output}/deck-rack-mobile.png`});
  await capture('apparel-mobile','/projects/westcose-world?view=os#loadout','Wear the coast.');
} finally {
  await fs.writeFile(`${output}/refinement-report.json`,JSON.stringify(report,null,2));
  await browser.close();
}
console.log(JSON.stringify(report));
