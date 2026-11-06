/** Read-only media capture of the sibling game's development server. No layouts are saved/applied. */
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const base = process.env.WORLD_BASE_URL || 'http://127.0.0.1:3002';
const output = path.resolve('artifacts/world-showcase/captures');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=d3d11', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
page.setDefaultTimeout(40000);
const report = { base, captures: [], errors: [] };
page.on('pageerror', error => report.errors.push(error.message));
async function capture(name) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.race([Promise.all([...document.images].filter(i => { const r = i.getBoundingClientRect(); return r.width && r.top < innerHeight && r.bottom > 0; }).map(i => i.decode().catch(() => {}))), new Promise(resolve => setTimeout(resolve, 5000))]);
  });
  await page.mouse.move(1438, 898);
  await page.screenshot({ path: path.join(output, `${name}.png`) });
  report.captures.push(name);
  console.log(`Captured ${name}`);
}
if (!process.argv.includes('--builder-only')) {
try {
  await page.goto(`${base}/world`, { timeout: 180000 });
  await page.getByTestId('enter-world').waitFor({ timeout: 180000 });
  await capture('start');
  await page.getByTestId('enter-world').click();
  await page.waitForFunction(() => window.__WESTCOSE_WORLD__?.getState().mode === 'exploring', null, { timeout: 120000 });
  await page.waitForTimeout(2500);
  await capture('explore');
  await page.getByRole('button', { name: 'Planet view', exact: true }).click();
  await page.waitForTimeout(2500);
  await capture('world');
  await page.evaluate(() => window.__WESTCOSE_WORLD__.spawn('entry'));
  await page.waitForTimeout(1600);
  await page.keyboard.press('Escape');
  await page.getByRole('dialog', { name: /Paused/ }).waitFor();
  await capture('pause');
  await page.keyboard.press('Escape');
  await page.evaluate(() => window.__WESTCOSE_WORLD__.spawn('wardrobeCounter'));
  await page.waitForFunction(() => window.__WESTCOSE_WORLD__.getState().hotspot === 'workshop');
  await page.keyboard.press('e');
  await page.getByRole('dialog', { name: 'WestCose Loadout' }).waitFor();
  await page.waitForTimeout(2500);
  await capture('loadout');
  await page.getByRole('button', { name: 'Back to game', exact: true }).click();
  await page.evaluate(() => {
    const canvas = window.__WESTCOSE_RENDER__.gl.domElement;
    const stream = canvas.captureStream(24), chunks = [];
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 2200000 });
    window.__portfolioRecording = { recorder, chunks, stream };
    recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    recorder.start();
    window.__WESTCOSE_WORLD__.spawn('courtyard');
  });
  await page.keyboard.down('w');
  await page.waitForTimeout(4000);
  await page.keyboard.up('w');
  await page.evaluate(() => window.__WESTCOSE_WORLD__.spawn('pierapproach'));
  await page.waitForTimeout(3500);
  await page.getByRole('button', { name: 'Planet view', exact: true }).click();
  await page.waitForTimeout(3500);
  const video = await page.evaluate(() => new Promise(resolve => {
    const { recorder, chunks, stream } = window.__portfolioRecording;
    recorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(new Blob(chunks, { type: 'video/webm' }));
    };
    recorder.stop();
  }));
  await writeFile(path.join(output, 'world-walkthrough.webm'), Buffer.from(video, 'base64'));
  console.log('Recorded world walkthrough');
} catch (error) { report.errors.push(`world: ${error.message}`); console.log(error.message); }
}

for (const [name, route, ready] of [
  ['builder', '/world/builder?workspace=reclamation', 'canvas'],
  ['lab-arsenal', '/world/outbreak-lab?lab=arsenal', 'canvas[data-outbreak-art-ready="true"]'],
  ['lab-range', '/world/outbreak-lab?lab=range', 'canvas[data-outbreak-art-ready="true"]'],
  ['lab-zombies', '/world/outbreak-lab?lab=zombies', 'canvas'],
  ['lab-barricades', '/world/outbreak-lab?lab=barricades&map=reclamation', 'canvas'],
  ['lab-effects', '/world/outbreak-lab?lab=effects&map=reclamation', 'canvas'],
  ['lab-reclamation', '/world/outbreak-lab?lab=reclamation&map=reclamation', 'canvas'],
  ['lab-hounds', '/world/outbreak-lab?lab=hounds', 'canvas'],
  ['lab-skater', '/world/skater-lab', 'canvas'],
]) {
  if (process.argv.includes('--world-only')) break;
  if (process.argv.includes('--builder-only') && name !== 'builder') continue;
  try {
    await page.goto(`${base}${route}`, { timeout: 180000 });
    await page.locator(ready).first().waitFor({ timeout: 180000 });
    await page.waitForTimeout(6500);
    if (name === 'builder') {
      await page.getByLabel('Inspection lighting', { exact: true }).check();
      await page.waitForTimeout(1500);
    }
    await capture(name);
    if (name === 'builder') {
      await page.locator('.wb-items > summary').click();
      await page.locator('.wb-items button').first().click();
      await page.getByRole('button', { name: 'Focus item', exact: true }).click();
      await page.locator('.wb-items > summary').click();
      await page.waitForTimeout(1000);
      await capture('builder-placement');
      await page.getByRole('button', { name: 'Walk through', exact: true }).click();
      await page.waitForTimeout(1000);
      await capture('builder-walkthrough');
      await page.getByRole('button', { name: 'Return to Edit', exact: true }).click();
      await page.getByRole('button', { name: 'Review for game', exact: true }).click();
      await page.getByRole('dialog').filter({ visible: true }).waitFor();
      await page.waitForTimeout(1000);
      await capture('builder-review');
    }
  } catch (error) { report.errors.push(`${name}: ${error.message}`); console.log(`${name}: ${error.message}`); }
}
await writeFile(path.join(output, 'capture-report.json'), JSON.stringify(report, null, 2));
await browser.close();
console.log(JSON.stringify(report));
