// 《上瘾自律》课件 · 共用设计系统（旭日主视觉）
const path = require('path');
const IMG = p => path.join(__dirname, 'img', p);

const C = {
  ink: '141110',
  cream: 'FFF9EF',
  white: 'FFFFFF',
  red: 'F03A21',
  redDeep: 'B01705',
  orange: 'FF8A1E',
  gold: 'FFD24A',
  muted: '9A7550',
  line: 'F0DCBC',
  card: 'FFFFFF',
  inkSoft: '4A3B2C',
};
const F = 'Microsoft YaHei';
// 亮底白字用：每次新建，绝不复用同一个 shadow 对象
const sh = (o = 0.55, b = 9) => ({ type: 'outer', color: '5A1A00', blur: b, offset: 2, angle: 90, opacity: o });
const W = 13.3, H = 7.5;

const BG = {
  title: { path: IMG('bg-title.png') },
  day: { path: IMG('bg-day.png') },
  content: { path: IMG('bg-content.png') },
  red: { path: IMG('bg-red.png') },
};

// 每页统一的「日轮」小记号 + 眉标
function kicker(s, text, { dark = false } = {}) {
  s.addShape('ellipse', { x: 0.62, y: 0.46, w: 0.17, h: 0.17, fill: { color: dark ? C.gold : C.orange } });
  s.addText(text, {
    x: 0.88, y: 0.40, w: 9.0, h: 0.3, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 12, bold: true, charSpacing: 2,
    color: dark ? 'FFF0D4' : C.muted, valign: 'middle',
  });
}

function pageNo(s, n) {
  s.addText(String(n), {
    x: W - 1.0, y: H - 0.62, w: 0.5, h: 0.3, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 11, color: C.muted, align: 'right', valign: 'middle',
  });
}

// ── 版式 ───────────────────────────────────────────────────────
function slideTitle(pres, { title, sub, meta = [], notes }) {
  const s = pres.addSlide();
  s.background = { ...BG.title };
  s.addText(title, {
    x: 0.9, y: 1.55, w: 11.5, h: 1.9, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 76, bold: true, color: C.white, charSpacing: 6, shadow: sh(0.5, 14),
  });
  if (sub) s.addText(sub, {
    x: 0.95, y: 3.55, w: 11.0, h: 0.62, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 23, color: 'FFFFFF', bold: true, shadow: sh(0.55, 8),
  });
  meta.forEach((m, i) => {
    s.addText(m, {
      x: 0.95 + i * 3.1, y: 4.45, w: 3.0, h: 0.4, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 13.5, color: 'FFF6E8', bold: true, shadow: sh(0.6, 6),
    });
  });
  if (notes) s.addNotes(notes);
  return s;
}

function slideSection(pres, { kicker: k, title, sub, notes }) {
  const s = pres.addSlide();
  s.background = { ...BG.day };
  s.addText(k, {
    x: 0.9, y: 1.35, w: 10, h: 0.44, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 15, bold: true, color: 'FFFFFF', charSpacing: 4, shadow: sh(0.6, 6),
  });
  s.addText(title, {
    x: 0.88, y: 1.95, w: 11.5, h: 1.5, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 58, bold: true, color: C.white, charSpacing: 3, shadow: sh(0.5, 12),
  });
  if (sub) s.addText(sub, {
    x: 0.95, y: 3.55, w: 10.8, h: 0.9, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 19, color: 'FFFFFF', bold: true, shadow: sh(0.6, 7),
  });
  if (notes) s.addNotes(notes);
  return s;
}

// 大字断言页（红底）
function slideStatement(pres, { kicker: k, lines, foot, notes, size = 46 }) {
  const s = pres.addSlide();
  s.background = { ...BG.red };
  if (k) kicker(s, k, { dark: true });
  const arr = Array.isArray(lines) ? lines : [lines];
  s.addText(arr.map((t, i) => ({ text: t, options: { breakLine: i < arr.length - 1 } })), {
    x: 0.9, y: 2.0, w: 11.5, h: 2.7, isTextBox: true, margin: 0,
    fontFace: F, fontSize: size, bold: true, color: C.white, lineSpacing: size * 1.5, shadow: sh(0.42, 12),
  });
  if (foot) s.addText(foot, {
    x: 0.95, y: 4.95, w: 11.3, h: 1.55, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 16.5, color: 'FFFFFF', lineSpacing: 26, valign: 'top', shadow: sh(0.5, 7),
  });
  if (notes) s.addNotes(notes);
  return s;
}

// 内容页骨架
function base(pres, { kicker: k, title, sub, n, notes }) {
  const s = pres.addSlide();
  s.background = { ...BG.content };
  if (k) kicker(s, k);
  if (title) s.addText(title, {
    x: 0.6, y: 0.92, w: 12.1, h: 0.85, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 38, bold: true, color: C.ink,
  });
  if (sub) s.addText(sub, {
    x: 0.62, y: 1.78, w: 11.9, h: 0.5, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 16, color: C.muted,
  });
  if (n != null) pageNo(s, n);
  if (notes) s.addNotes(notes);
  return s;
}

// 中文字形≈1em，据此估算一段文字要占几行
function cwid(ch) {
  const c = ch.codePointAt(0);
  if (ch === ' ') return 0.30;
  const cjk = (c >= 0x1100 && c <= 0x115F) || (c >= 0x2E80 && c <= 0xA4CF) ||
              (c >= 0xAC00 && c <= 0xD7A3) || (c >= 0xF900 && c <= 0xFAFF) ||
              (c >= 0xFE30 && c <= 0xFE6F) || (c >= 0xFF00 && c <= 0xFF60) ||
              (c >= 0xFFE0 && c <= 0xFFE6) || (c >= 0x3000 && c <= 0x303F);
  return cjk ? 1.0 : 0.52;
}
function estLines(text, boxW, pt) {
  const cap = boxW / (pt / 72);
  return String(text).split('\n').reduce((n, seg) => {
    const w = [...seg].reduce((a, ch) => a + cwid(ch), 0);
    return n + (w > 0 ? Math.max(1, Math.ceil(w / cap)) : 1);
  }, 0);
}

// 卡片网格
function cards(s, items, { y = 2.5, cols = 3, h = 2.5, accent = C.red } = {}) {
  const gap = 0.32, x0 = 0.6;
  const w = (12.1 - gap * (cols - 1)) / cols;
  const hSize = cols >= 5 ? 17 : cols === 4 ? 19 : 21;   // 列多则表头缩小，避免换行溢出
  let bSize = cols >= 5 ? 13 : 14.5;
  const hLines = Math.max(...items.map(it => estLines(it.h, w - 0.6, hSize)));
  const hH = hLines * hSize * 1.45 / 72 + 0.12;          // 表头按真实行数占高

  // 自适应：算出最挤的一张卡需要多高；先缩正文字号，实在不够再把卡片整体加高
  const need = (bs) => Math.max(...items.map(it => {
    if (!it.b) return 0;
    return 0.26 + (it.tag ? 0.34 : 0) + hH - 0.06
         + estLines(it.b, w - 0.6, bs) * bs * 1.55 / 72 + 0.22;
  }));
  while (bSize > 11.5 && need(bSize) > h) bSize -= 0.5;
  if (need(bSize) > h) h = need(bSize);                  // 仍不够就加高
  items.forEach((it, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    const x = x0 + col * (w + gap), yy = y + row * (h + gap);
    s.addShape('roundRect', {
      x, y: yy, w, h, rectRadius: 0.09,
      fill: { color: C.card },
      line: { color: C.line, width: 1 },
      shadow: { type: 'outer', angle: 90, blur: 12, offset: 2, opacity: 0.14, color: 'C99A5E' },
    });
    const tagH = it.tag ? 0.34 : 0;
    if (it.tag) s.addText(it.tag, {
      x: x + 0.3, y: yy + 0.22, w: w - 0.6, h: 0.3, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 13, bold: true, color: it.accent || accent, charSpacing: 1,
    });
    const headY = yy + 0.26 + tagH;
    s.addText(it.h, {
      x: x + 0.3, y: headY, w: w - 0.6, h: hH, isTextBox: true, margin: 0,
      fontFace: F, fontSize: hSize, bold: true, color: C.ink, valign: 'top', lineSpacing: hSize * 1.45,
    });
    if (it.b) {
      const bY = headY + hH - 0.06;
      const bH = yy + h - 0.22 - bY;
      if (bH > 0.2) s.addText(it.b, {
        x: x + 0.3, y: bY, w: w - 0.6, h: bH,
        isTextBox: true, margin: 0, fontFace: F, fontSize: bSize, color: C.inkSoft, lineSpacing: bSize * 1.55, valign: 'top',
      });
    }
  });
  const rows = Math.ceil(items.length / cols);
  return y + rows * h + (rows - 1) * gap;                // 返回底边
}

// 编号步骤行
function steps(s, items, { y = 2.4, h = 0.92, gap = 0.2 } = {}) {
  // 行高自适应；若整体越过 6.85 就把字号收小，保证不掉出版心
  let hS = 20, bS = 14.5;
  const rowNeed = () => Math.max(...items.map(it =>
    (estLines(it.h, 10.85, hS) * hS * 1.45 + estLines(it.b, 10.85, bS) * bS * 1.5) / 72 + 0.16));
  let rh = Math.max(h, rowNeed());
  while (hS > 15 && y + items.length * rh + (items.length - 1) * gap > 6.85) {
    hS -= 0.5; bS -= 0.4;
    rh = Math.max(rowNeed(), 0.5);
  }
  h = rh;
  items.forEach((it, i) => {
    const yy = y + i * (h + gap);
    s.addShape('ellipse', { x: 0.62, y: yy + (h - 0.5) / 2, w: 0.5, h: 0.5, fill: { color: it.color || C.red } });
    s.addText(it.n || String(i + 1), {
      x: 0.62, y: yy + (h - 0.5) / 2, w: 0.5, h: 0.5, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 17, bold: true, color: C.white, align: 'center', valign: 'middle',
    });
    // 标题 + 正文同框：框自己撑得下，不会互撞，也不会伸到页码上
    s.addText([
      { text: it.h, options: { fontSize: hS, bold: true, color: C.ink, breakLine: true } },
      { text: it.b, options: { fontSize: bS, color: C.inkSoft } },
    ], {
      x: 1.34, y: yy, w: 10.85, h, isTextBox: true, margin: 0,
      fontFace: F, valign: 'middle', lineSpacing: bS * 1.5,
    });
  });
  return y + items.length * h + (items.length - 1) * gap;
}

// 左右对照
function compare(s, left, right, { y = 2.5, h = 3.4 } = {}) {
  const w = 5.89, gap = 0.32;
  // 条目区能放多高，就用多大字号
  const availH = h - 2.0;
  let iSize = 15;
  const iNeed = (fs) => Math.max(
    ...[left, right].map(d => d.items.reduce((n, t) => n + estLines(t, w - 0.9, fs), 0) * fs * 1.5 / 72
      + d.items.length * 8 / 72));
  while (iSize > 11.5 && iNeed(iSize) > availH) iSize -= 0.5;
  [[left, 0.6, C.red, 'FFF2F0'], [right, 0.6 + w + gap, '1E9E4F', 'F0FAF3']].forEach(([d, x, col, bg]) => {
    s.addShape('roundRect', { x, y, w, h, rectRadius: 0.09, fill: { color: bg }, line: { color: col, width: 1.5 } });
    s.addText(d.tag, {
      x: x + 0.34, y: y + 0.26, w: w - 0.68, h: 0.32, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 13, bold: true, color: col, charSpacing: 2,
    });
    s.addText(d.h, {
      x: x + 0.32, y: y + 0.64, w: w - 0.64, h: 1.02, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 24, bold: true, color: C.ink, lineSpacing: 32, valign: 'top',
    });
    s.addText(d.items.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < d.items.length - 1 } })), {
      x: x + 0.32, y: y + 1.74, w: w - 0.64, h: h - 2.0, isTextBox: true, margin: 0,
      fontFace: F, fontSize: iSize, color: C.inkSoft, paraSpaceAfter: 8, lineSpacing: iSize * 1.5,
    });
  });
}

// 巨型数字 / 关键句
function bigLine(s, text, { y = 2.7, size = 52, color = C.ink, w = 12.1, x = 0.6 } = {}) {
  const lines = String(text).split('\n').length;
  const h = lines * size * 1.45 / 72 + 0.22;      // 高度跟着行数走
  s.addText(text, { x, y, w, h, isTextBox: true, margin: 0, fontFace: F, fontSize: size, bold: true, color, lineSpacing: size * 1.45, valign: 'top' });
  return y + h;                                    // 返回底边，方便排下一个元素
}

function note(s, text, { y = 6.15, color = C.muted, size = 14.5 } = {}) {
  s.addText(text, { x: 0.62, y, w: 11.5, h: 0.8, isTextBox: true, margin: 0, fontFace: F, fontSize: size, color, lineSpacing: 22 });
}

// 强调条（非装饰色条：带内容的高亮块）
function callout(s, text, { y = 5.5, color = C.red, bg = 'FDECEA', h = 0.95 } = {}) {
  s.addShape('roundRect', { x: 0.6, y, w: 12.1, h, rectRadius: 0.08, fill: { color: bg }, line: { color, width: 1.5 } });
  s.addText(text, {
    x: 0.92, y: y + 0.06, w: 11.5, h: h - 0.12, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 18, bold: true, color: C.ink, valign: 'middle', lineSpacing: 26,
  });
}

function table(s, rows, { y = 2.4, colW, fontSize = 14, h } = {}) {
  s.addTable(rows, {
    x: 0.6, y, w: 12.1, colW, fontFace: F, fontSize,
    color: C.inkSoft, border: { type: 'solid', color: C.line, pt: 1 },
    fill: { color: 'FFFFFF' }, valign: 'middle', autoPage: false,
    rowH: h,
  });
}

module.exports = { C, F, W, H, BG, IMG, kicker, pageNo, slideTitle, slideSection, slideStatement, base, cards, steps, compare, bigLine, note, callout, table };
