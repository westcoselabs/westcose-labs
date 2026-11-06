/** Fresh presentation cameras; no game assets, layouts, or authoring state are changed. */
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const output='artifacts/world-showcase/refinement-captures';
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11','--enable-unsafe-swiftshader']});
try {
  const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1,reducedMotion:'reduce'});
  await page.goto(`${process.env.WORLD_BASE_URL || 'http://127.0.0.1:3002'}/world`,{timeout:180000});
  await page.getByTestId('enter-world').click({timeout:180000});
  await page.waitForFunction(()=>window.__WESTCOSE_WORLD__?.getState().mode==='exploring',null,{timeout:120000});
  await page.addStyleTag({content:'body * { visibility:hidden !important; } canvas { visibility:visible !important; }'});
  const views=[
    {name:'shop-current',spawn:[14,7.7],from:[9.5,11.8,2.7],to:[18,11.8,3.4]},
    {name:'shop-exterior-current',spawn:[3,12],from:[-3,8,5.5],to:[12,11.8,3.8]},
    {name:'coast-current',spawn:[3,-15],from:[-8,-24,5],to:[10,-10,2.5]},
    {name:'street-current',spawn:[3,12],from:[1,6.5,2.5],to:[12,11.8,3]},
  ];
  for(const view of views){
    await page.evaluate(v=>{const d=window.__WESTCOSE_WORLD__;d.spawnAt(...v.spawn,'east');d.setCamera({from:v.from,to:v.to});},view);
    await page.waitForTimeout(3000);
    await page.locator('canvas').first().screenshot({path:`${output}/${view.name}.png`});
    console.log(`Captured ${view.name}`);
  }
  await fs.writeFile(`${output}/cameras.json`,JSON.stringify({capturedAt:new Date().toISOString(),viewport:{width:1920,height:1080},method:'Current game renderer, fixed review camera, HUD hidden. No image retouching.',views},null,2));
} finally {await browser.close();}
