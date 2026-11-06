/** Curate a portable, attributed snapshot. Run after capture-world-showcase.mjs. */
import fs from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import ts from 'typescript';
import sharp from 'sharp';

const root = path.resolve(process.argv[2] || '../westcose-world');
const target = path.resolve('public/images/projects/westcose-world');
const component = path.resolve('src/components/projects/world');
await fs.mkdir(target, { recursive: true });
await fs.mkdir(component, { recursive: true });
const previousCatalog = existsSync(path.join(component, 'catalog.generated.json')) ? JSON.parse(readFileSync(path.join(component, 'catalog.generated.json'), 'utf8')) : null;
const previousProvenance = existsSync('docs/WORLD_SHOWCASE_ASSETS.json') ? JSON.parse(readFileSync('docs/WORLD_SHOWCASE_ASSETS.json', 'utf8')) : null;
const sources = previousProvenance?.sources ?? [];
const digest = file => createHash('sha256').update(readFileSync(file)).digest('hex');
const relative = file => path.relative(root, file).replaceAll('\\', '/');
const sourceRevision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
function moduleFrom(file) {
  if (file.endsWith('.json')) return JSON.parse(readFileSync(file, 'utf8'));
  const loadedModule = { exports: {} };
  const output = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  vm.runInNewContext(output, { module: loadedModule, exports: loadedModule.exports, require: spec => {
    const next = path.resolve(path.dirname(file), spec);
    return moduleFrom(existsSync(next) ? next : `${next}.ts`);
  } }, { filename: file });
  return loadedModule.exports;
}
async function image(source, name, width = 1600) {
  const destination = path.join(target, `${name}.webp`);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  const info = await sharp(source).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 84 }).toFile(destination);
  sources.push({ output: `/images/projects/westcose-world/${name}.webp`, source: relative(source), sha256: digest(source), bytes: info.size });
  return { src: `/images/projects/westcose-world/${name}.webp`, width: info.width, height: info.height };
}
const media = previousCatalog?.media ?? {};
for (const name of ['start','explore','world','pause','loadout','builder','builder-placement','builder-walkthrough','builder-review','lab-arsenal','lab-range','lab-zombies','lab-barricades','lab-effects','lab-reclamation','lab-hounds','lab-skater']) {
  const source = path.resolve(`artifacts/world-showcase/captures/${name}.png`);
  if (existsSync(source)) media[name] = await image(source, name);
}
const evidence = {
  grotto: 'docs/qa/grotto-black-tide/desktop-flooded.png',
  reclamation: 'docs/qa/backroads/P47/P47-yard-power.png',
  clock: 'docs/qa/backroads/P54/P54-check-clock.jpg',
  gary: 'docs/qa/backroads/P49/concept-v6/P49-gary-v6-lineup.png',
  'gary-game': 'docs/qa/backroads/P49/G5/G5-digester-gary.jpg',
  'pier-model': 'docs/qa/dead-coast/pier-sign-integration/asset-oblique.png',
  'pier-game': 'docs/qa/dead-coast/pier-sign-painted/production-oblique.png',
  shop: 'docs/qa/shop-flagship/final/05-showroom.jpg',
  'shop-front': 'docs/qa/shop-flagship/final/01-courtyard.jpg',
  'shirt-art': 'public/textures/shirts/artwork/westcose-social-club.webp',
  'shirt-atlas': 'public/textures/shirts/westcose-social-club.webp',
  'shirt-game': 'public/textures/shirts/previews/westcose-social-club-back.webp',
  'intro-poster': 'docs/design/world-intro-broadcast-16x9.jpg',
  'weapon': 'docs/qa/combat-labs/framing-after/mp5-hip.png',
};
for (const [name, source] of Object.entries(evidence)) media[name] = await image(path.join(root, source), name);
const { SHIRT_SKINS } = moduleFrom(path.join(root, 'src/features/world/wardrobe/shirt-skins.ts'));
const { DECK_SKINS } = moduleFrom(path.join(root, 'src/features/world/skate/deck-skins.ts'));
const apparel = [];
for (const shirt of SHIRT_SKINS) {
  const front = await image(path.join(root, `public/textures/shirts/previews/${shirt.id}-front.webp`), `apparel/${shirt.id}-front`, 560);
  const back = await image(path.join(root, `public/textures/shirts/previews/${shirt.id}-back.webp`), `apparel/${shirt.id}-back`, 560);
  const artwork = shirt.id === 'plain-black' ? front : await image(path.join(root, `public/textures/shirts/artwork/${shirt.id}.webp`), `apparel/${shirt.id}-art`, 320);
  apparel.push({ id: shirt.id, name: shirt.name, category: shirt.category, detail: shirt.detail.replaceAll(' · ', '. '), front, back, artwork });
}
const decks = [];
for (const deck of DECK_SKINS) {
  const artwork = await image(path.join(root, `public/textures/skateboards/previews/artwork/${deck.id}.webp`), `decks/${deck.id}`, 480);
  const name = deck.name === deck.name.toUpperCase() ? deck.name.toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase()) : deck.name;
  decks.push({ id: deck.id, name, brand: deck.brand, artwork });
}
await fs.mkdir('public/models/projects/westcose-world', { recursive: true });
for (const [name, source] of [['pier-sign', 'dead-coast-pier-sign-v2.glb'], ['shop', 'shop-flagship-v1.glb']]) {
  const file = path.join(root, 'public/models', source);
  await fs.copyFile(file, `public/models/projects/westcose-world/${name}.glb`);
  sources.push({ output: `/models/projects/westcose-world/${name}.glb`, source: relative(file), sha256: digest(file), bytes: (await fs.stat(file)).size });
}
for (const name of ['PIER_SIGN_ASSET_CREDITS.md', 'SHOP_ASSET_CREDITS.md']) {
  const source = path.join(root, 'public/models', name);
  const output = `/models/projects/westcose-world/${name}`;
  await fs.copyFile(source, path.join('public', output));
  sources.push({ output, source: relative(source), sha256: digest(source), bytes: (await fs.stat(source)).size });
}
await fs.mkdir('public/media/westcose-world', { recursive: true });
for (const [name, source] of [
  ['world-walkthrough.webm', path.resolve('artifacts/world-showcase/captures/world-walkthrough.webm')],
  ['intro.webm', path.join(root, 'public/intro/westcose-intro-16x9.webm')],
]) {
  if (!existsSync(source)) continue;
  await fs.copyFile(source, `public/media/westcose-world/${name}`);
  sources.push({ output: `/media/westcose-world/${name}`, source: relative(source), sha256: digest(source), bytes: (await fs.stat(source)).size });
  const fallback = `/media/westcose-world/${name.replace('.webm', '.mp4')}`;
  execFileSync(process.env.FFMPEG_PATH || 'ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', source,
    '-c:v', 'libx264', '-threads', '2', '-preset', 'veryfast', '-crf', '24', '-vf', 'scale=w=min(1280\\,iw):h=-2', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', path.join('public', fallback)]);
  sources.push({ output: fallback, source: relative(source), sha256: digest(source), bytes: (await fs.stat(path.join('public', fallback))).size, preparation: 'H.264/AAC MP4 with fast-start, up to 1280px wide, derived from the same recording' });
}
await fs.copyFile(path.join(root, 'node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-700-normal.woff2'), path.join(component, 'display.woff2'));
await fs.mkdir('public/fonts', { recursive: true });
await fs.copyFile(path.join(root, 'node_modules/@fontsource/barlow-condensed/LICENSE'), 'public/fonts/barlow-condensed-LICENSE.txt');
await fs.writeFile(path.join(component, 'catalog.generated.json'), `${JSON.stringify({ sourceRevision, media, apparel, decks }, null, 2)}\n`);
await fs.writeFile('docs/WORLD_SHOWCASE_ASSETS.json', `${JSON.stringify({ sourceRepository: 'westcose-world', sourceRevision, sources: [...new Map(sources.map(source => [source.output, source])).values()] }, null, 2)}\n`);
console.log(`Prepared ${Object.keys(media).length} exhibits, ${apparel.length} shirts, ${decks.length} decks, and two original/attributed 3D assets.`);
