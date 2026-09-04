// 生成旭日主视觉背景图（SVG -> PNG）· 明亮版
const fs = require('fs');
const sharp = require('sharp');

const W = 1920, H = 1080;

function rays({ cx, cy, n = 24, R = 2600, colors, alphaFrom = 0.95, alphaTo = 0.25, spread = 180, rot = 0, duty = 0.52 }) {
  let s = '';
  const step = spread / n;
  for (let i = 0; i < n; i++) {
    const a0 = rot + 180 + i * step;
    const a1 = a0 + step * duty;
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

/* ── 1. 封面 / 章节：暖橙天空 + 大而亮的日轮 ───────────────────
   不再用近黑底。改成深琥珀天空，光芒高饱和，日轮更大更亮。
   白字的可读性靠「左上角局部柔和暗角」，不是整片压黑。          */
const titleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#5E1A05"/>
      <stop offset="45%"  stop-color="#B23207"/>
      <stop offset="78%"  stop-color="#EE5F12"/>
      <stop offset="100%" stop-color="#FF8A1E"/>
    </linearGradient>
    <radialGradient id="sunGrad" cx="50%" cy="100%" r="100%">
      <stop offset="0%"  stop-color="#FFF8D0"/>
      <stop offset="26%" stop-color="#FFDE5C"/>
      <stop offset="58%" stop-color="#FFA51F"/>
      <stop offset="100%" stop-color="#F4551E"/>
    </radialGradient>
    <radialGradient id="halo" cx="50%" cy="100%" r="78%">
      <stop offset="0%"  stop-color="#FFD24A" stop-opacity="0.70"/>
      <stop offset="60%" stop-color="#FF9A1E" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#FF9A1E" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="scrim" cx="18%" cy="26%" r="72%">
      <stop offset="0%"   stop-color="#2A0A02" stop-opacity="0.72"/>
      <stop offset="62%"  stop-color="#2A0A02" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="#2A0A02" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <g>${rays({ cx: W / 2, cy: H * 1.14, n: 26, colors: ['#FFC93C', '#FF8A1E', '#FFE178'], alphaFrom: 0.46, alphaTo: 0.08, duty: 0.5 })}</g>
  <rect width="${W}" height="${H}" fill="url(#halo)"/>
  <rect width="${W}" height="${H}" fill="url(#scrim)"/>
  <circle cx="${W / 2}" cy="${H * 1.15}" r="${H * 0.48}" fill="url(#sunGrad)"/>
  <rect y="${H - 10}" width="${W}" height="10" fill="#FFC93C"/>
</svg>`;

/* ── 2. 分日章节：更亮，金色为主 ──────────────────────────── */
const daySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#6B2206"/>
      <stop offset="42%"  stop-color="#C93D08"/>
      <stop offset="76%"  stop-color="#F97316"/>
      <stop offset="100%" stop-color="#FFB024"/>
    </linearGradient>
    <radialGradient id="sunGrad" cx="50%" cy="100%" r="100%">
      <stop offset="0%"  stop-color="#FFFCE6"/>
      <stop offset="24%" stop-color="#FFE879"/>
      <stop offset="56%" stop-color="#FFB524"/>
      <stop offset="100%" stop-color="#F4551E"/>
    </radialGradient>
    <radialGradient id="scrim" cx="16%" cy="24%" r="70%">
      <stop offset="0%"   stop-color="#310C02" stop-opacity="0.70"/>
      <stop offset="60%"  stop-color="#310C02" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#310C02" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <g>${rays({ cx: W * 0.5, cy: H * 1.08, n: 30, colors: ['#FFE178', '#FFC93C', '#FF9A2E'], alphaFrom: 0.52, alphaTo: 0.08, duty: 0.5 })}</g>
  <rect width="${W}" height="${H}" fill="url(#scrim)"/>
  <circle cx="${W * 0.5}" cy="${H * 1.09}" r="${H * 0.54}" fill="url(#sunGrad)"/>
</svg>`;

/* ── 3. 内容页：暖白 + 更明显的晨光，不再灰扑扑 ──────────────── */
const contentSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0%"   stop-color="#FFFDF8"/>
      <stop offset="62%"  stop-color="#FFF7E9"/>
      <stop offset="100%" stop-color="#FFEFD6"/>
    </linearGradient>
    <radialGradient id="glow" cx="99%" cy="102%" r="66%">
      <stop offset="0%"  stop-color="#FFC93C" stop-opacity="0.60"/>
      <stop offset="42%" stop-color="#FFA93A" stop-opacity="0.26"/>
      <stop offset="100%" stop-color="#FF9A2E" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="2%" cy="0%" r="42%">
      <stop offset="0%"  stop-color="#FFD86B" stop-opacity="0.24"/>
      <stop offset="100%" stop-color="#FFD86B" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#paper)"/>
  <g opacity="0.52">${rays({ cx: W * 1.0, cy: H * 1.02, n: 16, R: 1900, colors: ['#FFC93C', '#FF9A2E'], alphaFrom: 0.46, alphaTo: 0.05, spread: 96, rot: 86, duty: 0.46 })}</g>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect width="${W}" height="${H}" fill="url(#glow2)"/>
</svg>`;

/* ── 4. 强调页：鲜亮朱红 ─────────────────────────────────── */
const redSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="rd" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#E42A16"/>
      <stop offset="70%"  stop-color="#F5461C"/>
      <stop offset="100%" stop-color="#FF6A22"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#rd)"/>
  <g opacity="0.42">${rays({ cx: W * 0.5, cy: H * 1.10, n: 24, colors: ['#FFC93C', '#FFE178'], alphaFrom: 0.50, alphaTo: 0.05, duty: 0.48 })}</g>
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
