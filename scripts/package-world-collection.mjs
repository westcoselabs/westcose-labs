import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const imageRoot = 'public/images/projects/westcose-world';
const provenancePath = 'docs/WORLD_SHOWCASE_ASSETS.json';
const provenance = JSON.parse(await fs.readFile(provenancePath, 'utf8'));
const refinementPath = 'src/components/projects/world/refinement.generated.json';
const refinement = JSON.parse(await fs.readFile(refinementPath, 'utf8'));
const sources = {
  ak: 'ak-47.glb', mp5: 'mp5sd-reward.glb', riptide: 'riptide-reward.glb', blowhole: 'blowhole-reward.glb',
};
refinement.weapons = {};
for (const [name, model] of Object.entries(sources)) {
  const file = `${imageRoot}/weapon-${name}.webp`;
  const info = await sharp(`artifacts/world-showcase/weapon-models/${name}.png`).webp({quality:90}).toFile(file);
  const src = file.replace(/^public/, '');
  refinement.weapons[name] = {src, width:info.width, height:info.height};
  const original = await fs.readFile(`../westcose-world/public/world/outbreak/models/${model}`);
  provenance.sources = provenance.sources.filter(item => item.output !== src);
  provenance.sources.push({output:src, source:`public/world/outbreak/models/${model}`, sha256:createHash('sha256').update(original).digest('hex'), bytes:info.size, kind:'studio render of current game model', method:'scripts/render-world-weapons.py; source geometry and materials unchanged; no raw weapon model distributed'});
}
const heroSource = process.argv[2];
if(heroSource) {
  const file = `${imageRoot}/coast-key-art-v3.webp`;
  const info = await sharp(heroSource).webp({quality:88}).toFile(file);
  const src = file.replace(/^public/, '');
  refinement.promotional['coast-key-art-v3'] = {src,width:info.width,height:info.height};
  provenance.sources = provenance.sources.filter(item=>item.output!==src);
  provenance.sources.push({output:src,source:heroSource,sha256:createHash('sha256').update(await fs.readFile(heroSource)).digest('hex'),bytes:info.size,kind:'AI-generated promotional artwork',credit:'WestCose game references; built-in image_gen; spherical-world correction'});
}
await fs.writeFile(refinementPath, JSON.stringify(refinement,null,2)+'\n');
await fs.writeFile(provenancePath, JSON.stringify(provenance,null,2)+'\n');
