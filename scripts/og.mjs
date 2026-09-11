// Renders the Open Graph images into public/og/. Runs at development time, not
// at build, so the PNGs are committed and the build stays dependency-free.
//
//   node scripts/og.mjs
//
// satori turns a small HTML-like tree into SVG with fonts embedded
// deterministically — the reason to use it instead of drawing an SVG by hand
// is that librsvg on Windows will not load a web font from a data URI, and an
// OG card in a fallback face reads as unfinished. sharp then rasterises to PNG.

import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// satori reads TTF/OTF/WOFF, not WOFF2, so the static package supplies these.
const fontDir = dirname(require.resolve('@fontsource/archivo/package.json'));
const [regular, bold] = await Promise.all([
  readFile(resolve(fontDir, 'files/archivo-latin-400-normal.woff')),
  readFile(resolve(fontDir, 'files/archivo-latin-800-normal.woff')),
]);

// Direction A: graphite ground, one teal signal, colour used as data.
const ground = '#0F1519';
const ink = '#DEE7EC';
const soft = '#93A3AD';
const signal = '#3ED6C1';

const cards = {
  en: {
    eyebrow: 'PAYMENTS · FULL-STACK · AI',
    name: 'Cristopher Martinez',
    role: 'Senior full-stack engineer',
    line: 'Four years of payments infrastructure. Two products in production. AI tooling for agents.',
  },
  es: {
    eyebrow: 'PAGOS · FULL-STACK · IA',
    name: 'Cristopher Martinez',
    role: 'Ingeniero full-stack senior',
    line: 'Cuatro años de infraestructura de pagos. Dos productos en producción. Tooling de IA para agentes.',
  },
};

const el = (type, style, children) => ({ type, props: { style, children } });

function card(c) {
  return el(
    'div',
    {
      width: 1200,
      height: 630,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '72px 80px',
      background: ground,
      color: ink,
      fontFamily: 'Archivo',
    },
    [
      el('div', { display: 'flex', flexDirection: 'column' }, [
        el(
          'div',
          { fontSize: 22, letterSpacing: 6, color: signal, fontWeight: 400, marginBottom: 28 },
          c.eyebrow,
        ),
        el(
          'div',
          { fontSize: 88, fontWeight: 800, letterSpacing: -3, lineHeight: 1.0 },
          c.name,
        ),
        el('div', { fontSize: 34, color: soft, marginTop: 18 }, c.role),
      ]),
      el('div', { display: 'flex', flexDirection: 'column' }, [
        el('div', { width: 96, height: 4, background: signal, marginBottom: 26 }),
        el('div', { fontSize: 30, color: soft, lineHeight: 1.35, maxWidth: 980 }, c.line),
      ]),
    ],
  );
}

await mkdir(resolve(root, 'public/og'), { recursive: true });

for (const [lang, c] of Object.entries(cards)) {
  const svg = await satori(card(c), {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Archivo', data: regular, weight: 400, style: 'normal' },
      { name: 'Archivo', data: bold, weight: 800, style: 'normal' },
    ],
  });
  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
  const out = resolve(root, `public/og/${lang}.png`);
  await writeFile(out, png);
  console.log(`${out}  ${(png.length / 1024).toFixed(1)} KB`);
}
