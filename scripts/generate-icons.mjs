// Regenerates the favicon set, header logo, and social share card.
//
// NOT part of `npm run build` — it shells out to ffmpeg, which does not exist on
// Vercel's builder. The outputs are committed to frontend/public/ and this script
// exists so they can be reproduced rather than being mystery binaries.
//
//   npm run gen-icons
//
// Requires ffmpeg on PATH. Note that on Windows `convert` is the FAT-to-NTFS
// utility in system32, NOT ImageMagick — hence ffmpeg.

import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PUBLIC = join(ROOT, 'frontend', 'public');
// The 1024x1024 master lives outside public/ deliberately — it is a build input,
// not a served asset. It used to sit in public/ and ship 1.37 MB to every visitor.
const SOURCE_LOGO = join(ROOT, 'docs', 'brand', 'PortfolioVision.png');
const SOURCE_SHOT = join(ROOT, 'docs', 'screenshots', 'decomposed-portfolio.png');

function ffmpeg(args) {
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
    stdio: 'inherit',
  });
}

function square(size, outName) {
  ffmpeg(['-i', SOURCE_LOGO, '-vf', `scale=${size}:${size}:flags=lanczos`, join(PUBLIC, outName)]);
}

// Wrap a PNG in an ICONDIR header. A .ico may contain a PNG payload directly
// (Vista+), so no BMP re-encoding is needed and there's no dependency to add.
async function pngToIco(pngPath, icoPath, size) {
  const png = await readFile(pngPath);

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = icon
  header.writeUInt16LE(1, 4); // image count

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // width  (0 means 256)
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
  entry.writeUInt8(0, 2); // palette size
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8); // payload size
  entry.writeUInt32LE(header.length + entry.length, 12); // payload offset

  await writeFile(icoPath, Buffer.concat([header, entry, png]));
}

async function main() {
  // Social share card. Cropped to exactly 1000x525 — the 1.905 OG ratio — so it
  // fills the frame with no letterboxing, then upscaled to the canonical 1200x630.
  ffmpeg([
    '-i', SOURCE_SHOT,
    '-vf', 'crop=1000:525:460:140,scale=1200:630:flags=lanczos',
    '-pix_fmt', 'rgb24',
    join(PUBLIC, 'og-image.png'),
  ]);

  // Header logo. Rendered at 52px (40px mobile); 96px covers 2x displays.
  // Replaces a 1.37 MB 1024x1024 PNG that was being scaled down in the browser.
  square(96, 'logo-96.png');

  square(32, 'icon-32.png');
  square(180, 'apple-touch-icon.png');
  square(192, 'icon-192.png');
  square(512, 'icon-512.png');

  await pngToIco(join(PUBLIC, 'icon-32.png'), join(PUBLIC, 'favicon.ico'), 32);

  console.log('gen-icons: wrote og-image.png, logo-96.png, icon-{32,192,512}.png, apple-touch-icon.png, favicon.ico');
}

main().catch((err) => {
  console.error(`gen-icons failed: ${err.message}`);
  process.exit(1);
});
