/**
 * Builds a high-resolution topographic sample: hillshade, index and
 * intermediate contours, and a light GPS overlay. Output is one SVG.
 */
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const WIDTH = 1600;
const HEIGHT = 900;
const COLS = 320;
const ROWS = 180;

function hash(ix, iy) {
  let n = Math.imul(ix, 374761393) + Math.imul(iy, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

function valueNoise(x, y) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = x - x0;
  const ty = y - y0;
  const sx = tx * tx * (3 - 2 * tx);
  const sy = ty * ty * (3 - 2 * ty);
  const v00 = hash(x0, y0);
  const v10 = hash(x0 + 1, y0);
  const v01 = hash(x0, y0 + 1);
  const v11 = hash(x0 + 1, y0 + 1);
  return (
    v00 * (1 - sx) * (1 - sy) +
    v10 * sx * (1 - sy) +
    v01 * (1 - sx) * sy +
    v11 * sx * sy
  );
}

function fbm(x, y) {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < 5; i += 1) {
    sum += valueNoise(x * freq, y * freq) * amp;
    norm += amp;
    freq *= 2;
    amp *= 0.5;
  }
  return sum / norm;
}

function smoothstep(edge0, edge1, x) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Feet. A hogback crest with two drainages and a side knob. */
function elevation(nx, ny) {
  const crest =
    0.62 +
    0.055 * Math.sin(nx * 2.15 + 0.4) +
    0.02 * Math.sin(nx * 6.1 + 1.1);
  const across = ny - crest;
  const scarp = Math.exp(-((across / 0.09) ** 2));
  const dip = Math.exp(-((across / 0.34) ** 2));
  const profile = across < 0 ? scarp : dip * 0.92;
  const along = 0.78 + 0.22 * Math.sin(nx * Math.PI * 0.92);
  let height = 2480 + profile * along * 1480;

  const knob = Math.exp(-((nx - 0.8) ** 2) / 0.01 - ((ny - 0.74) ** 2) / 0.016);
  height += knob * 420;

  const spur = Math.exp(-((nx - 0.33) ** 2) / 0.02 - ((ny - 0.48) ** 2) / 0.03);
  height += spur * 180;

  const g1 = 0.18 + (ny - 0.15) * 0.42;
  const cut1 = Math.exp(-(((nx - g1) / 0.011) ** 2)) * smoothstep(0.22, 0.5, ny);
  height -= cut1 * (across > -0.03 ? 340 : 60);

  const g2 = 0.58 - (ny - 0.4) * 0.18;
  const cut2 = Math.exp(-(((nx - g2) / 0.009) ** 2)) * smoothstep(0.38, 0.62, ny);
  height -= cut2 * 220;

  height += (fbm(nx * 1.8 + 2.2, ny * 1.8 + 0.7) - 0.5) * 160;
  height += (fbm(nx * 4.4 + 8, ny * 4.4 + 3) - 0.5) * 46;
  return height;
}

const field = new Float64Array(COLS * ROWS);
let minH = Infinity;
let maxH = -Infinity;
for (let y = 0; y < ROWS; y += 1) {
  for (let x = 0; x < COLS; x += 1) {
    const h = elevation(x / (COLS - 1), y / (ROWS - 1));
    field[y * COLS + x] = h;
    if (h < minH) minH = h;
    if (h > maxH) maxH = h;
  }
}

function sample(x, y) {
  const x0 = Math.max(0, Math.min(COLS - 2, Math.floor(x)));
  const y0 = Math.max(0, Math.min(ROWS - 2, Math.floor(y)));
  const tx = Math.min(1, Math.max(0, x - x0));
  const ty = Math.min(1, Math.max(0, y - y0));
  const v00 = field[y0 * COLS + x0];
  const v10 = field[y0 * COLS + x0 + 1];
  const v01 = field[(y0 + 1) * COLS + x0];
  const v11 = field[(y0 + 1) * COLS + x0 + 1];
  return (
    v00 * (1 - tx) * (1 - ty) +
    v10 * tx * (1 - ty) +
    v01 * (1 - tx) * ty +
    v11 * tx * ty
  );
}

function lerp(a, b, va, vb, level) {
  const t = (level - va) / (vb - va || 1e-9);
  return a + (b - a) * Math.min(1, Math.max(0, t));
}

/** Edge pairs for marching squares. Bits: BL=1 BR=2 TR=4 TL=8. */
const EDGE_PAIRS = {
  1: [[3, 0]],
  2: [[0, 1]],
  3: [[3, 1]],
  4: [[1, 2]],
  5: [[3, 0], [1, 2]],
  6: [[0, 2]],
  7: [[3, 2]],
  8: [[2, 3]],
  9: [[0, 2]],
  10: [[0, 3], [1, 2]],
  11: [[1, 2]],
  12: [[1, 3]],
  13: [[0, 1]],
  14: [[0, 3]],
};

function contours(level) {
  const segments = [];
  for (let y = 0; y < ROWS - 1; y += 1) {
    for (let x = 0; x < COLS - 1; x += 1) {
      const bl = field[y * COLS + x];
      const br = field[y * COLS + x + 1];
      const tr = field[(y + 1) * COLS + x + 1];
      const tl = field[(y + 1) * COLS + x];
      let index = 0;
      if (bl >= level) index |= 1;
      if (br >= level) index |= 2;
      if (tr >= level) index |= 4;
      if (tl >= level) index |= 8;
      if (index === 0 || index === 15) continue;
      let pairs = EDGE_PAIRS[index];
      if (index === 5 || index === 10) {
        const center = (bl + br + tr + tl) / 4;
        const prefer = center >= level;
        pairs = index === 5
          ? prefer
            ? [[3, 2], [0, 1]]
            : [[3, 0], [1, 2]]
          : prefer
            ? [[0, 1], [2, 3]]
            : [[0, 3], [1, 2]];
      }
      const edgePoint = (edge) => {
        if (edge === 0) return [lerp(x, x + 1, bl, br, level), y];
        if (edge === 1) return [x + 1, lerp(y, y + 1, br, tr, level)];
        if (edge === 2) return [lerp(x, x + 1, tl, tr, level), y + 1];
        return [x, lerp(y, y + 1, bl, tl, level)];
      };
      for (const [a, b] of pairs) {
        segments.push([edgePoint(a), edgePoint(b)]);
      }
    }
  }
  return joinSegments(segments);
}

function keyOf(point) {
  return `${point[0].toFixed(3)},${point[1].toFixed(3)}`;
}

function joinSegments(segments) {
  const unused = new Set(segments.keys());
  const startMap = new Map();
  const endMap = new Map();
  segments.forEach((seg, i) => {
    const a = keyOf(seg[0]);
    const b = keyOf(seg[1]);
    if (!startMap.has(a)) startMap.set(a, []);
    if (!endMap.has(b)) endMap.set(b, []);
    startMap.get(a).push(i);
    endMap.get(b).push(i);
  });

  function take(map, key) {
    const list = map.get(key);
    if (!list) return undefined;
    while (list.length) {
      const index = list.pop();
      if (unused.has(index)) return index;
    }
    return undefined;
  }

  const lines = [];
  while (unused.size) {
    const first = unused.values().next().value;
    unused.delete(first);
    const line = [segments[first][0], segments[first][1]];
    let grew = true;
    while (grew) {
      grew = false;
      const tail = keyOf(line[line.length - 1]);
      const forward = take(startMap, tail);
      if (forward !== undefined) {
        unused.delete(forward);
        line.push(segments[forward][1]);
        grew = true;
        continue;
      }
      const forwardReversed = take(endMap, tail);
      if (forwardReversed !== undefined) {
        unused.delete(forwardReversed);
        line.push(segments[forwardReversed][0]);
        grew = true;
        continue;
      }
      const head = keyOf(line[0]);
      const backward = take(endMap, head);
      if (backward !== undefined) {
        unused.delete(backward);
        line.unshift(segments[backward][0]);
        grew = true;
        continue;
      }
      const backwardReversed = take(startMap, head);
      if (backwardReversed !== undefined) {
        unused.delete(backwardReversed);
        line.unshift(segments[backwardReversed][1]);
        grew = true;
      }
    }
    if (line.length > 6) lines.push(line);
  }
  return lines;
}

function chaikin(points) {
  if (points.length < 3) return points;
  const closed = dist(points[0], points[points.length - 1]) < 0.8;
  const ring = closed ? points.slice(0, -1) : points;
  const next = [];
  const count = closed ? ring.length : ring.length - 1;
  if (!closed) next.push(ring[0]);
  for (let i = 0; i < count; i += 1) {
    const p = ring[i];
    const q = ring[(i + 1) % ring.length];
    next.push([p[0] * 0.75 + q[0] * 0.25, p[1] * 0.75 + q[1] * 0.25]);
    next.push([p[0] * 0.25 + q[0] * 0.75, p[1] * 0.25 + q[1] * 0.75]);
  }
  if (!closed) next.push(ring[ring.length - 1]);
  else next.push(next[0]);
  return next;
}

function dist(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function rdp(points, epsilon) {
  if (points.length < 3) return points;
  let max = 0;
  let index = 0;
  const start = points[0];
  const end = points[points.length - 1];
  for (let i = 1; i < points.length - 1; i += 1) {
    const d = pointLineDist(points[i], start, end);
    if (d > max) {
      max = d;
      index = i;
    }
  }
  if (max > epsilon) {
    const left = rdp(points.slice(0, index + 1), epsilon);
    const right = rdp(points.slice(index), epsilon);
    return left.slice(0, -1).concat(right);
  }
  return [start, end];
}

function pointLineDist(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  return Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / len;
}

function toSvgPoint(point) {
  const x = (point[0] / (COLS - 1)) * WIDTH;
  const y = HEIGHT - (point[1] / (ROWS - 1)) * HEIGHT;
  return [x, y];
}

function pathOf(points) {
  const svg = points.map(toSvgPoint);
  return svg
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join("");
}

function lineLength(points) {
  let length = 0;
  for (let i = 1; i < points.length; i += 1) length += dist(points[i - 1], points[i]);
  return length;
}

const INTERVAL = 40;
const INDEX_EVERY = 200;
const startLevel = Math.ceil(minH / INTERVAL) * INTERVAL;
const levels = [];
for (let level = startLevel; level < maxH; level += INTERVAL) levels.push(level);

const intermediate = [];
const index = [];
const labels = [];

for (const level of levels) {
  const isIndex = level % INDEX_EVERY === 0;
  const lines = contours(level)
    .map((line) => rdp(chaikin(chaikin(line)), 0.35))
    .filter((line) => lineLength(line) > 8);
  for (const line of lines) {
    const d = pathOf(line);
    if (isIndex) index.push(d);
    else intermediate.push(d);
    if (!isIndex || lineLength(line) < 36) continue;
    const svgLine = line.map(toSvgPoint);
    const total = lineLength(svgLine);
    const candidates = [0.3, 0.55, 0.75];
    for (const fraction of candidates) {
      let walked = 0;
      const target = total * fraction;
      let placed = null;
      for (let i = 1; i < svgLine.length; i += 1) {
        const step = dist(svgLine[i - 1], svgLine[i]);
        if (walked + step >= target) {
          const t = (target - walked) / (step || 1);
          placed = {
            x: svgLine[i - 1][0] + (svgLine[i][0] - svgLine[i - 1][0]) * t,
            y: svgLine[i - 1][1] + (svgLine[i][1] - svgLine[i - 1][1]) * t,
            text: String(level),
          };
          break;
        }
        walked += step;
      }
      if (!placed) continue;
      if (placed.x < 220 || placed.x > WIDTH - 120 || placed.y < 70 || placed.y > HEIGHT - 90) {
        continue;
      }
      const crowded = labels.some(
        (label) => Math.hypot(label.x - placed.x, label.y - placed.y) < 120,
      );
      if (crowded) continue;
      labels.push(placed);
      break;
    }
  }
}

function mix(a, b, t) {
  return a.map((channel, i) => Math.round(channel + (b[i] - channel) * t));
}

const shadeW = 800;
const shadeH = 450;
const rgba = Buffer.alloc(shadeW * shadeH * 4);
for (let y = 0; y < shadeH; y += 1) {
  for (let x = 0; x < shadeW; x += 1) {
    const gx = (x / (shadeW - 1)) * (COLS - 1);
    const gy = ((shadeH - 1 - y) / (shadeH - 1)) * (ROWS - 1);
    const h = sample(gx, gy);
    const z = (h - minH) / (maxH - minH);
    const dx = sample(gx + 1, gy) - sample(gx - 1, gy);
    const dy = sample(gx, gy + 1) - sample(gx, gy - 1);
    const slope = Math.atan(Math.hypot(dx, dy) / 260);
    const aspect = Math.atan2(dy, -dx);
    const zenith = (42 * Math.PI) / 180;
    const azimuth = (320 * Math.PI) / 180;
    let light =
      Math.cos(zenith) * Math.cos(slope) +
      Math.sin(zenith) * Math.sin(slope) * Math.cos(azimuth - aspect);
    light = Math.min(1, Math.max(0, light));
    const valley = [34, 30, 24];
    const slopeColor = [64, 52, 38];
    const ridge = [128, 106, 74];
    const elev = z < 0.45 ? mix(valley, slopeColor, z / 0.45) : mix(slopeColor, ridge, (z - 0.45) / 0.55);
    const shadow = [16, 14, 12];
    const rgb = mix(shadow, elev, 0.35 + light * 0.65);
    const i = (y * shadeW + x) * 4;
    rgba[i] = rgb[0];
    rgba[i + 1] = rgb[1];
    rgba[i + 2] = rgb[2];
    rgba[i + 3] = 255;
  }
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i];
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]);
  const out = Buffer.alloc(8 + body.length);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), 4 + body.length);
  return out;
}

const raw = Buffer.alloc(shadeH * (shadeW * 4 + 1));
for (let y = 0; y < shadeH; y += 1) {
  const row = y * (shadeW * 4 + 1);
  raw[row] = 0;
  rgba.copy(raw, row + 1, y * shadeW * 4, (y + 1) * shadeW * 4);
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(shadeW, 0);
ihdr.writeUInt32BE(shadeH, 4);
ihdr[8] = 8;
ihdr[9] = 6;
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw)),
  chunk("IEND", Buffer.alloc(0)),
]);

const grid = [];
for (let i = 1; i < 8; i += 1) {
  const x = ((WIDTH / 8) * i).toFixed(1);
  const y = ((HEIGHT / 6) * i).toFixed(1);
  if (i < 8) grid.push(`<path d="M${x} 0 V${HEIGHT}"/>`);
  if (i < 6) grid.push(`<path d="M0 ${y} H${WIDTH}"/>`);
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="Topographic map sample with elevation contours">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#121510"/>
  <image href="data:image/png;base64,${png.toString("base64")}" width="${WIDTH}" height="${HEIGHT}" preserveAspectRatio="none"/>
  <g fill="none" stroke="#8f8678" stroke-opacity="0.16" stroke-width="1">${grid.join("")}</g>
  <g fill="none" stroke="#c4a870" stroke-opacity="0.55" stroke-width="0.9" stroke-linejoin="round" stroke-linecap="round">
    ${intermediate.map((d) => `<path d="${d}"/>`).join("")}
  </g>
  <g fill="none" stroke="#ece2cc" stroke-opacity="0.9" stroke-width="1.45" stroke-linejoin="round" stroke-linecap="round">
    ${index.map((d) => `<path d="${d}"/>`).join("")}
  </g>
  <g font-family="ui-monospace, Menlo, monospace" font-size="13" font-weight="600" fill="#ece2cc" text-anchor="middle">
    ${labels
      .map(
        (label) =>
          `<text x="${label.x.toFixed(1)}" y="${(label.y - 4).toFixed(1)}" stroke="#121510" stroke-width="3" paint-order="stroke">${label.text}</text>`,
      )
      .join("")}
  </g>
  <g font-family="ui-monospace, Menlo, monospace" fill="#ece2cc" fill-opacity="0.82">
    <path d="M1488 78 V118 M1476 90 H1500" stroke="#c4a870" stroke-width="1.4"/>
    <path d="M1488 78 L1482 90 M1488 78 L1494 90" stroke="#ece2cc" stroke-width="1.4"/>
    <text x="1508" y="84" font-size="11" font-weight="700" letter-spacing="1.5">N</text>
    <text x="1188" y="812" font-size="12" font-weight="600" letter-spacing="1.6">45.6040° N</text>
    <text x="1188" y="830" font-size="12" font-weight="600" letter-spacing="1.6">121.1770° W</text>
    <text x="1424" y="812" font-size="12" font-weight="600" letter-spacing="1.4">CI 40 FT</text>
    <text x="1424" y="830" font-size="12" font-weight="600" letter-spacing="1.4">INDEX 200</text>
    <path d="M1188 760 H1308" stroke="#ece2cc" stroke-width="1.5"/>
    <path d="M1188 754 V766 M1248 756 V764 M1308 754 V766" stroke="#ece2cc" stroke-width="1.2"/>
    <text x="1188" y="746" font-size="11" letter-spacing="1.2">0</text>
    <text x="1272" y="746" font-size="11" letter-spacing="1.2">1 MI</text>
  </g>
</svg>
`;

writeFileSync(new URL("../public/brand/topo-field.svg", import.meta.url), svg);
console.log(
  `topo ${WIDTH}x${HEIGHT} levels=${levels.length} index=${index.length} intermediate=${intermediate.length} labels=${labels.length} bytes=${svg.length}`,
);
