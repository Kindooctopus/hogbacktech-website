import sharp from "sharp";
import { readdir, mkdir } from "fs/promises";
import path from "path";

const TILES_DIR = path.resolve("public/brand/tiles");
const SOURCE_DIR =
  "/Users/davidjensen/Library/CloudStorage/OneDrive-Personal/Hogback Ridge Technologies/Logo and Pictures";

const SOURCE_MAP = {
  "software-transparent.png": "software tansparent bck.png",
  "mobile-app-transparent.png": "Mobile app tile.png",
  "customize-transparent.png": "customized transparent.png",
  "secure-platform-transparent.png": "secure platforms transparent.png",
  "comms-strategy-transparent.png": "comms transparent.png",
};

function isBackground(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max - min;
  const lightness = (r + g + b) / 3;

  // Solid white / off-white export background
  if (lightness >= 248 && saturation <= 8) return true;

  // Checkerboard and light gray matte backgrounds
  if (saturation <= 18 && lightness >= 165) return true;

  // Solid black / near-black export background
  if (lightness <= 18 && saturation <= 20) return true;

  return false;
}

function isCheckerboardGray(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max - min;
  const lightness = (r + g + b) / 3;

  // Internal checkerboard squares not reached by edge flood fill
  if (saturation <= 15 && lightness >= 150 && lightness <= 230) return true;

  // Internal black matte not reached by edge flood fill
  if (lightness <= 18 && saturation <= 20) return true;

  return false;
}

async function removeBackground(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const pixels = Uint8ClampedArray.from(data);
  const visited = new Uint8Array(width * height);
  const queue = [];

  const idx = (x, y) => y * width + x;
  const pushIfBackground = (x, y) => {
    const i = idx(x, y);
    if (visited[i]) return;
    const o = i * channels;
    if (!isBackground(pixels[o], pixels[o + 1], pixels[o + 2])) return;
    visited[i] = 1;
    queue.push(i);
  };

  for (let x = 0; x < width; x++) {
    pushIfBackground(x, 0);
    pushIfBackground(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    pushIfBackground(0, y);
    pushIfBackground(width - 1, y);
  }

  while (queue.length) {
    const i = queue.pop();
    const x = i % width;
    const y = (i - x) / width;
    const o = i * channels;
    pixels[o + 3] = 0;

    if (x > 0) pushIfBackground(x - 1, y);
    if (x < width - 1) pushIfBackground(x + 1, y);
    if (y > 0) pushIfBackground(x, y - 1);
    if (y < height - 1) pushIfBackground(x, y + 1);
  }

  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    if (pixels[o + 3] === 0) continue;
    if (isCheckerboardGray(pixels[o], pixels[o + 1], pixels[o + 2])) {
      pixels[o + 3] = 0;
    }
  }

  await sharp(Buffer.from(pixels), {
    raw: { width, height, channels },
  })
    .trim({ threshold: 1 })
    .png()
    .toFile(outputPath);

  const meta = await sharp(outputPath).metadata();
  console.log(`Wrote ${path.basename(outputPath)} (${meta.width}x${meta.height}, ${meta.channels}ch)`);
}

async function main() {
  await mkdir(TILES_DIR, { recursive: true });

  for (const [outName, sourceName] of Object.entries(SOURCE_MAP)) {
    const outputPath = path.join(TILES_DIR, outName);
    let inputPath = outputPath;

    if (sourceName) {
      inputPath = path.join(SOURCE_DIR, sourceName);
    }

    try {
      await removeBackground(inputPath, outputPath);
    } catch (err) {
      console.error(`Failed ${outName}:`, err.message);
    }
  }

  // Process any other *transparent*.png in tiles folder
  for (const name of await readdir(TILES_DIR)) {
    if (!name.includes("transparent") || SOURCE_MAP[name]) continue;
    await removeBackground(path.join(TILES_DIR, name), path.join(TILES_DIR, name));
  }
}

main();
