// 主视觉海报 · 旭日版（无人物插画 —— 解决「没有头、只露个裆」的问题）
const fs = require('fs');
const sharp = require('sharp');

const W = 1200, H = 1600;
const CN = 'WenQuanYi Zen Hei, Microsoft YaHei, sans-serif';

function rays({ cx, cy, n, R, colors, a0v, a1v, spread = 180, rot = 0 }) {
  let s = '';
  const step = spread / n;
  for (let i = 0; i < n; i++) {
    const A = rot + 180 + i * step, B = A + step * 0.55;
    const r0 = A * Math.PI / 180, r1 = B * Math.PI / 180;
    const t = i / (n - 1);
    const a = (a0v + (a1v - a0v) * Math.abs(t - 0.5) * 2).toFixed(3);
    s += `<path d="M${cx},${cy} L${(cx + R * Math.cos(r0)).toFixed(1)},${(cy + R * Math.sin(r0)).toFixed(1)} L${(cx + R * Math.cos(r1)).toFixed(1)},${(cy + R * Math.sin(r1)).toFixed(1)} Z" fill="${colors[i % colors.length]}" opacity="${a}"/>`;
  }
  return s;
}

// 信息块
function infoBox(x, y, w, h, num, label, value, sub) {
  return `
  <g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#FFFFFF" opacity="0.07"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="none" stroke="#FFC93C" stroke-opacity="0.45" stroke-width="1.5"/>
    <circle cx="${x + 30}" cy="${y + 30}" r="13" fill="#E63329"/>
    <text x="${x + 30}" y="${y + 35}" font-family="${CN}" font-size="15" font-weight="bold" fill="#FFF" text-anchor="middle">${num}</text>
    <text x="${x + 54}" y="${y + 36}" font-family="${CN}" font-size="15" fill="#FFC93C" letter-spacing="1.5">${label}</text>
    <text x="${x + 26}" y="${y + 72}" font-family="${CN}" font-size="26" font-weight="bold" fill="#FFFFFF">${value}</text>
    ${sub ? `<text x="${x + 26}" y="${y + 99}" font-family="${CN}" font-size="15" fill="#FFE7C8">${sub}</text>` : ''}
  </g>`;
}

function cred(y, n, text, hi) {
  return `
  <g>
    <rect x="90" y="${y}" width="${hi ? 34 : 30}" height="${hi ? 34 : 30}" rx="7" fill="${hi ? '#FFC93C' : '#E63329'}"/>
    <text x="${90 + (hi ? 17 : 15)}" y="${y + (hi ? 24 : 21)}" font-family="${CN}" font-size="16" font-weight="bold" fill="${hi ? '#141110' : '#FFF'}" text-anchor="middle">${n}</text>
    <text x="140" y="${y + 24}" font-family="${CN}" font-size="${hi ? 30 : 27}" font-weight="bold" fill="${hi ? '#FFC93C' : '#F5EAdc'}">${text}</text>
  </g>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#5E1A05"/>
      <stop offset="42%"  stop-color="#B23207"/>
      <stop offset="74%"  stop-color="#EE5F12"/>
      <stop offset="100%" stop-color="#FF9A24"/>
    </linearGradient>
    <radialGradient id="sun" cx="50%" cy="100%" r="95%">
      <stop offset="0%" stop-color="#FFF8D0"/><stop offset="26%" stop-color="#FFDE5C"/>
      <stop offset="58%" stop-color="#FFA51F"/><stop offset="100%" stop-color="#F4551E"/>
    </radialGradient>
    <radialGradient id="veil" cx="26%" cy="24%" r="86%">
      <stop offset="0%"   stop-color="#2A0A02" stop-opacity="0.74"/>
      <stop offset="58%"  stop-color="#2A0A02" stop-opacity="0.34"/>
      <stop offset="100%" stop-color="#2A0A02" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <g>${rays({ cx: W / 2, cy: H * 1.02, n: 30, R: 2100, colors: ['#FFC93C', '#FF8A1E', '#FFE178'], a0v: 0.44, a1v: 0.07 })}</g>
  <rect width="${W}" height="${H}" fill="url(#veil)"/>
  <circle cx="${W / 2}" cy="${H * 1.07}" r="${H * 0.20}" fill="url(#sun)"/>

  <!-- 眉标 -->
  <rect x="90" y="78" width="304" height="38" rx="19" fill="#E63329"/>
  <text x="242" y="104" font-family="${CN}" font-size="18" font-weight="bold" fill="#FFF" text-anchor="middle" letter-spacing="1">AI创造营 · 黑客松实战课程</text>

  <!-- 主标题 -->
  <text x="90" y="290" font-family="${CN}" font-size="152" font-weight="bold" fill="#FFFFFF" letter-spacing="10">上瘾自律</text>
  <text x="96" y="340" font-family="${CN}" font-size="21" fill="#FFC93C" letter-spacing="7">BREAK  THE  ALGORITHM　//　2026</text>

  <!-- 副标 -->
  <text x="90" y="416" font-family="${CN}" font-size="35" font-weight="bold" fill="#FFD24A">被算法困住的少年，</text>
  <text x="90" y="466" font-family="${CN}" font-size="35" font-weight="bold" fill="#FFD24A">用 AI 反杀算法。</text>

  <!-- 三行凭据 -->
  ${cred(540, '01', '休学厌学两年的初中生', false)}
  ${cred(600, '02', '用「反上瘾机制」做出 AI 应用', false)}
  ${cred(660, '03', '斩获腾讯黑客松大赛 金牌', true)}

  <!-- 一句话 -->
  <rect x="90" y="742" width="1020" height="2" fill="#FFC93C" opacity="0.35"/>
  <text x="90" y="806" font-family="${CN}" font-size="27" fill="#FFF4E4">他曾经每天刷到凌晨一点。</text>
  <text x="90" y="852" font-family="${CN}" font-size="27" fill="#FFF4E4">现在他每天去健身房一小时 ——</text>
  <text x="90" y="898" font-family="${CN}" font-size="27" font-weight="bold" fill="#FFFFFF">这两天，他把方法拆开讲给你听。</text>

  <!-- 四格信息 -->
  ${infoBox(90, 968, 495, 122, '1', 'TIME', '9月5日 – 6日', '两天 · 9:00 – 18:00')}
  ${infoBox(615, 968, 495, 122, '2', 'WHERE', '深圳福田', '高尔夫大厦 1701 室')}
  ${infoBox(90, 1108, 495, 122, '3', 'FEE', '0 – 200 元', '自愿打赏红包')}
  ${infoBox(615, 1108, 495, 122, '4', 'WHO', '14 岁亲历者 亲授', '手机沉迷 · 他自己走出来的')}

  <!-- 适合谁 -->
  <rect x="90" y="1252" width="1020" height="58" rx="10" fill="#FFFFFF" opacity="0.14"/>
  <rect x="90" y="1252" width="1020" height="58" rx="10" fill="none" stroke="#FFFFFF" stroke-opacity="0.55"/>
  <text x="600" y="1289" font-family="${CN}" font-size="20" fill="#FFFFFF" text-anchor="middle">适合对　AI × 青少年反沉迷 × 黑客松比赛　感兴趣的家庭</text>

  <!-- 页脚 -->
  <text x="90" y="1378" font-family="${CN}" font-size="19" fill="#FFE9A8" letter-spacing="4">HACK THE SELF</text>
  <text x="600" y="1378" font-family="${CN}" font-size="21" font-weight="bold" fill="#FFFFFF" text-anchor="middle">超级富AI玩家俱乐部 主办</text>
  <text x="1110" y="1378" font-family="${CN}" font-size="19" fill="#FFE9A8" text-anchor="end" letter-spacing="4">BREAK OUT</text>
  <rect x="0" y="${H - 14}" width="${W}" height="14" fill="#FFC93C"/>
</svg>`;

sharp(Buffer.from(svg)).png().toFile(__dirname + '/out/上瘾自律_主视觉海报_旭日版.png')
  .then(() => console.log('✔ 海报 -> out/上瘾自律_主视觉海报_旭日版.png'));
