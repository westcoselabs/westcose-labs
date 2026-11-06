import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const manifest = JSON.parse(await fs.readFile('docs/THEME_WALLPAPER_PROMPTS.json', 'utf8'));
const catalog = [];
for (const entry of manifest.entries) {
  const original = await fs.readFile(entry.source);
  const desktop = await sharp(original).webp({quality:88}).toFile(entry.outputDesktop);
  const pocket = await sharp(original).resize(640,960,{fit:'cover',position:entry.id === '95-tidal-grid' ? 'left' : 'centre'}).webp({quality:88}).toFile(entry.outputPocket);
  const thumbnail = `public/images/wallpapers/${entry.id}-preview.webp`;
  await sharp(original).resize(400,250,{fit:'cover'}).webp({quality:78}).toFile(thumbnail);
  catalog.push({id:entry.id,themeId:entry.theme,name:entry.name,desktop:{src:entry.outputDesktop.replace('public',''),width:desktop.width,height:desktop.height},pocket:{src:entry.outputPocket.replace('public',''),width:pocket.width,height:pocket.height},preview:thumbnail.replace('public','')});
  entry.sourceSha256 = createHash('sha256').update(original).digest('hex');
  entry.desktopBytes = desktop.size;
  entry.pocketBytes = pocket.size;
}
await fs.writeFile('src/registry/wallpapers.generated.json', JSON.stringify(catalog,null,2)+'\n');
await fs.writeFile('docs/THEME_WALLPAPER_PROMPTS.json', JSON.stringify(manifest,null,2)+'\n');
console.log(`Packaged ${catalog.length} wallpapers with desktop, portrait, and picker assets.`);
