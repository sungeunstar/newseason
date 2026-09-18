import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require('sharp');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cols = 4;
const rows = 8;
const thumbW = 352;
const thumbH = 198;
const cellH = 228;
const gap = 18;
const pad = 32;
const headerH = 78;
const width = pad * 2 + cols * thumbW + (cols - 1) * gap;
const height = headerH + pad + rows * cellH + (rows - 1) * gap + pad;
const composites = [];

for (let page = 1; page <= 31; page += 1) {
  const index = page - 1;
  const col = index % cols;
  const row = Math.floor(index / cols);
  const left = pad + col * (thumbW + gap);
  const top = headerH + pad + row * (cellH + gap);
  const src = path.join(root, '_audit', 'final-pages', `p${String(page).padStart(2, '0')}.png`);
  const image = await sharp(src).resize(thumbW, thumbH).png().toBuffer();
  const label = Buffer.from(`<svg width="${thumbW}" height="${cellH - thumbH}"><style>text{font:700 13px Consolas,monospace;fill:#7892ff}</style><text x="2" y="21">${String(page).padStart(2, '0')}</text></svg>`);
  composites.push({ input: image, left, top }, { input: label, left, top: top + thumbH });
}

const header = Buffer.from(`<svg width="${width}" height="${headerH}"><style>.t{font:700 28px Arial,sans-serif;fill:#f1f3f7}.m{font:13px Arial,sans-serif;fill:#7f8794}</style><text class="t" x="${pad}" y="44">Portfolio Final · 31 Pages</text><text class="m" x="${width - pad}" y="44" text-anchor="end">1280 × 720 · HTML Review</text></svg>`);
composites.push({ input: header, left: 0, top: 0 });

await sharp({ create: { width, height, channels: 3, background: '#080a0e' } })
  .composite(composites)
  .png()
  .toFile(path.join(root, '_audit', 'portfolio-contact-final.png'));

console.log(`contact sheet created · ${width}×${height}`);
