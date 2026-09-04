// 生成旭日主视觉背景图（SVG -> PNG），供 pptxgenjs 用作整页背景
const fs = require('fs');
const sharp = require('sharp');

const W = 1920, H = 1080;

// 旭日光芒：从底部中心向上放射
function rays({ cx, cy, n = 24, R = 2600, colors, alphaFrom = 0.95, alphaTo = 0.25, spread = 180, rot = 0 }) {
  let s = '';
  const step = spread / n;
  for (let i = 0; i < n; i++) {
    const a0 = rot + 180 + i * step;              // 180deg = 向上半圆
    const a1 = a0 + step * 0.52;                  // 光芒宽度约占一半，留缝
    const r0 = (a0 * Math.PI) / 180, r1 = (a1 * Math.PI) / 180;
    const x0 = cx + R * Math.cos(r0), y0 = cy + R * Math.sin(r0);
    const x1 = cx + R * Math.cos(r1), y1 = cy + R * Math.sin(r1);
    const c = colors[i % colors.length];
    const t = i / (n - 1);
    const a = (alphaFrom + (alphaTo - alphaFrom) * Math.abs(t - 0.5) * 2).toFixed(3);
    s += `<path d="M${cx},${cy} L${x0.toFixed(1)},${y0.toFixed(1)} L${x1.toFixed(1)},${y1.toFixed(1)} Z" fill="${c}" opacity="${a}"/>`;
  }
  return s;
}

function sunDisc(cx, cy, r, stops) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#sunGrad)"/>`;
}

// ── 1. 封面 / 章节：深色 + 底部升起的太阳 ──────────────────────
const titleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="sunGrad" cx="50%" cy="100%" r="95%">
      <stop offset="0%"  stop-color="#FFE066"/>
      <stop offset="34%" stop-color="#FFA51F"/>
      <stop offset="68%" stop-color="#F4551E"/>
      <stop offset="100%" stop-color="#B01705"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="100%" r="62%">
      <stop offset="0%"  stop-color="#FF8A1E" stop-opacity="0.50"/>
      <stop offset="100%" stop-color="#FF8A1E" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="veil" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#0B0705" stop-opacity="0.93"/>
      <stop offset="42%"  stop-color="#0B0705" stop-opacity="0.72"/>
      <stop offset="70%"  stop-color="#0B0705" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#0B0705" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#120D0B"/>
  <g>${rays({ cx: W / 2, cy: H * 1.16, n: 26, colors: ['#E63329', '#FF7A1A', '#FFB524'], alphaFrom: 0.55, alphaTo: 0.08 })}</g>
  <rect width="${W}" height="${H}" fill="url(#veil)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <circle cx="${W / 2}" cy="${H * 1.20}" r="${H * 0.40}" fill="url(#sunGrad)" opacity="0.97"/>
  <rect y="${H - 10}" width="${W}" height="10" fill="#E63329"/>
</svg>`;

// ── 2. 分日章节：太阳升高一点，更亮 ───────────────────────────
const daySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="sunGrad" cx="50%" cy="100%" r="100%">
      <stop offset="0%"  stop-color="#FFF0A8"/>
      <stop offset="28%" stop-color="#FFC93C"/>
      <stop offset="60%" stop-color="#FF7A1A"/>
      <stop offset="100%" stop-color="#D02A12"/>
    </radialGradient>
    <linearGradient id="veil" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#0B0705" stop-opacity="0.90"/>
      <stop offset="45%"  stop-color="#0B0705" stop-opacity="0.66"/>
      <stop offset="74%"  stop-color="#0B0705" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#0B0705" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#160E0A"/>
  <g>${rays({ cx: W * 0.5, cy: H * 1.10, n: 30, colors: ['#FF7A1A', '#FFC93C', '#E63329'], alphaFrom: 0.66, alphaTo: 0.10 })}</g>
  <rect width="${W}" height="${H}" fill="url(#veil)"/>
  <circle cx="${W * 0.5}" cy="${H * 1.12}" r="${H * 0.46}" fill="url(#sunGrad)" opacity="0.97"/>
</svg>`;

// ── 3. 内容页：米白 + 右下角一线日光（安静的呼应）────────────
const contentSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="sunGrad" cx="100%" cy="100%" r="60%">
      <stop offset="0%"  stop-color="#FFC93C" stop-opacity="0.34"/>
      <stop offset="55%" stop-color="#FF7A1A" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#FF7A1A" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#FBF7F0"/>
  <g opacity="0.30">${rays({ cx: W * 1.02, cy: H * 1.04, n: 14, R: 1700, colors: ['#FFC93C', '#FF9A2E'], alphaFrom: 0.5, alphaTo: 0.06, spread: 92, rot: 88 })}</g>
  <rect width="${W}" height="${H}" fill="url(#sunGrad)"/>
</svg>`;

// ── 4. 强调页：正红满版（红线、警告用）────────────────────────
const redSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#D8271C"/>
  <g opacity="0.30">${rays({ cx: W * 0.5, cy: H * 1.12, n: 22, colors: ['#FF6A2A', '#FFB524'], alphaFrom: 0.55, alphaTo: 0.06 })}</g>
</svg>`;

const jobs = [
  ['bg-title.png', titleSvg],
  ['bg-day.png', daySvg],
  ['bg-content.png', contentSvg],
  ['bg-red.png', redSvg],
];

(async () => {
  fs.mkdirSync(__dirname + '/img', { recursive: true });
  for (const [name, svg] of jobs) {
    await sharp(Buffer.from(svg)).png({ quality: 92 }).toFile(__dirname + '/img/' + name);
    console.log('wrote img/' + name);
  }
})();
