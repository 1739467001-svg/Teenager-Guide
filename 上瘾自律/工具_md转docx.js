const fs = require('fs');
const d = require('docx');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  LevelFormat, convertInchesToTwip
} = d;

const SRC = process.argv[2];
const OUT = process.argv[3];

const CN = "Microsoft YaHei";      // 正文中文
const MONO = "Consolas";
const MONO_CJK = "NSimSun";   // 真·中日韩等宽，ASCII 方框图里混中文才不会错位
const INK = "1A1F27";
const MUTED = "5B6472";
const ACCENT = "1D4ED8";
const RED = "BE123C";
const RULE = "D8DEE8";
const SHADE = "F1F4F9";
const SHADE2 = "FFF1F4";

// page width available for tables (A4 = 11906 dxa, margins 1080 each) -> ~9746
const TW = 9600;

// Bold can straddle a line break (common inside blockquotes). runs() works
// line-by-line, so carry an unterminated ** over to the next line.
let BOLD_CARRY = false;

function runs(text, opts = {}) {
  // split on **bold**, `code`
  if (BOLD_CARRY) text = '**' + text;
  const odd = (text.match(/\*\*/g) || []).length % 2 === 1;
  if (odd) { text = text + '**'; BOLD_CARRY = true; } else if (!/\*\*/.test(text)) { /* keep */ } else { BOLD_CARRY = false; }
  const out = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(mk(text.slice(last, m.index), opts));
    const t = m[0];
    if (t.startsWith('**')) out.push(mk(t.slice(2, -2), { ...opts, bold: true }));
    else out.push(mk(t.slice(1, -1), { ...opts, mono: true }));
    last = re.lastIndex;
  }
  if (last < text.length) out.push(mk(text.slice(last), opts));
  return out.length ? out : [mk('', opts)];
}

function mk(text, o = {}) {
  return new TextRun({
    text,
    bold: !!o.bold,
    italics: !!o.italics,
    color: o.color || INK,
    size: o.size || 21,                 // half-points -> 10.5pt
    font: o.mono ? MONO : (o.font || CN),
  });
}

function para(text, o = {}) {
  return new Paragraph({
    children: runs(text, o),
    alignment: o.align,
    spacing: { before: o.before ?? 60, after: o.after ?? 60, line: o.line ?? 300 },
    indent: o.indent,
    border: o.border,
    shading: o.shading,
    keepNext: o.keepNext,
  });
}

function heading(text, level) {
  const map = {
    1: { size: 34, color: INK, before: 360, after: 160, hr: true },
    2: { size: 27, color: ACCENT, before: 300, after: 130 },
    3: { size: 23, color: INK, before: 240, after: 100 },
    4: { size: 21, color: MUTED, before: 200, after: 80 },
  };
  const s = map[level] || map[4];
  return new Paragraph({
    heading: [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4][level - 1],
    children: runs(text.replace(/[⭐📄🔹🟢🟡🟠🔴✅❌⚠️️]/g, '').replace(/\s{2,}/g, ' ').trim(), { size: s.size, bold: true, color: s.color }),
    spacing: { before: s.before, after: s.after, line: 300 },
    keepNext: true,
    border: s.hr ? { bottom: { style: BorderStyle.SINGLE, size: 8, color: RULE, space: 6 } } : undefined,
  });
}

function cell(text, o = {}) {
  const lines = String(text).split('<br>');
  return new TableCell({
    width: { size: o.w, type: WidthType.DXA },
    shading: o.shading ? { type: ShadingType.CLEAR, fill: o.shading, color: 'auto' } : undefined,
    margins: { top: 90, bottom: 90, left: 130, right: 130 },
    children: lines.map((ln, i) => new Paragraph({
      children: runs(ln.trim(), { bold: o.bold, size: 19, color: o.color }),
      spacing: { before: i ? 20 : 0, after: 0, line: 260 },
    })),
  });
}

function buildTable(rows) {
  const head = rows[0];
  const n = head.length;
  const widths = Array(n).fill(Math.floor(TW / n));
  // widen last-but content columns heuristically: give col 3 (具体内容) more if 4 cols
  if (n === 4) {
    const w = [Math.round(TW * 0.11), Math.round(TW * 0.17), Math.round(TW * 0.52), Math.round(TW * 0.20)];
    w[3] = TW - w[0] - w[1] - w[2];
    widths.splice(0, n, ...w);
  } else if (n === 3) {
    const w = [Math.round(TW * 0.22), Math.round(TW * 0.39), TW - Math.round(TW * 0.22) - Math.round(TW * 0.39)];
    widths.splice(0, n, ...w);
  } else if (n === 5) {
    const w = [Math.round(TW * 0.07), Math.round(TW * 0.22), Math.round(TW * 0.33), Math.round(TW * 0.20)];
    w.push(TW - w.reduce((a, b) => a + b, 0));
    widths.splice(0, n, ...w);
  }
  const body = rows.slice(1);
  return new Table({
    columnWidths: widths,
    width: { size: TW, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: RULE },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: RULE },
      left: { style: BorderStyle.SINGLE, size: 4, color: RULE },
      right: { style: BorderStyle.SINGLE, size: 4, color: RULE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: RULE },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: RULE },
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: head.map((c, i) => cell(c, { w: widths[i], bold: true, shading: SHADE, color: INK })),
      }),
      ...body.map(r => new TableRow({
        children: Array.from({ length: n }, (_, i) => cell(r[i] ?? '', { w: widths[i] })),
      })),
    ],
  });
}

// ───────── parse ─────────
const lines = fs.readFileSync(SRC, 'utf8').split('\n');
const kids = [];
let i = 0;

const isTableRow = s => /^\s*\|.*\|\s*$/.test(s);
const splitRow = s => s.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
const isSep = s => /^\s*\|[\s:|-]+\|\s*$/.test(s);

while (i < lines.length) {
  let L = lines[i];

  if (!L.trim()) { i++; continue; }

  // code fence
  if (/^\s*```/.test(L)) {
    i++;
    const buf = [];
    while (i < lines.length && !/^\s*```/.test(lines[i])) { buf.push(lines[i]); i++; }
    i++;
    buf.forEach((ln, k) => kids.push(new Paragraph({
      children: [new TextRun({ text: ln.replace(/\t/g, '  ') || ' ', font: MONO_CJK, size: 16, color: INK })],
      spacing: { before: k === 0 ? 100 : 0, after: k === buf.length - 1 ? 140 : 0, line: 220 },
      shading: { type: ShadingType.CLEAR, fill: SHADE, color: 'auto' },
      indent: { left: 180, right: 180 },
    })));
    continue;
  }

  // table
  if (isTableRow(L) && i + 1 < lines.length && isSep(lines[i + 1])) {
    const rows = [splitRow(L)];
    i += 2;
    while (i < lines.length && isTableRow(lines[i])) { rows.push(splitRow(lines[i])); i++; }
    kids.push(buildTable(rows));
    kids.push(new Paragraph({ children: [new TextRun({ text: '', size: 10 })], spacing: { after: 120 } }));
    continue;
  }

  // heading
  let m = L.match(/^(#{1,6})\s+(.*)$/);
  if (m) { kids.push(heading(m[2], Math.min(m[1].length, 4))); i++; continue; }

  // hr
  if (/^\s*---+\s*$/.test(L)) {
    kids.push(new Paragraph({
      children: [new TextRun({ text: '', size: 2 })],
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: RULE, space: 1 } },
      spacing: { before: 160, after: 160 },
    }));
    i++; continue;
  }

  // blockquote block
  if (/^\s*>/.test(L)) {
    const buf = [];
    while (i < lines.length && /^\s*>/.test(lines[i])) {
      buf.push(lines[i].replace(/^\s*>\s?/, ''));
      i++;
    }
    const inner = buf.filter(s => s.trim() !== '');
    inner.forEach((ln, k) => {
      const hm = ln.match(/^(#{1,6})\s+(.*)$/);
      const txt = hm ? hm[2] : ln;
      const big = !!hm;
      kids.push(new Paragraph({
        children: runs(txt.replace(/[⭐📄🔹]/g, '').replace(/\s{2,}/g, ' ').trim(), { size: big ? 24 : 20, bold: big, color: big ? ACCENT : INK }),
        spacing: { before: k === 0 ? 140 : 40, after: k === inner.length - 1 ? 140 : 40, line: 300 },
        indent: { left: 260, right: 200 },
        shading: { type: ShadingType.CLEAR, fill: SHADE, color: 'auto' },
        border: { left: { style: BorderStyle.SINGLE, size: 18, color: ACCENT, space: 8 } },
      }));
    });
    continue;
  }

  // list item
  m = L.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
  if (m) {
    const depth = Math.min(Math.floor(m[1].length / 2), 2);
    const ordered = /\d/.test(m[2]);
    kids.push(new Paragraph({
      numbering: { reference: ordered ? 'ord' : 'bul', level: depth },
      children: runs(m[3]),
      spacing: { before: 30, after: 30, line: 290 },
    }));
    i++; continue;
  }

  kids.push(para(L.trim()));
  i++;
}

const doc = new Document({
  creator: 'Teenager-Guide',
  title: '上瘾自律 两天AI创造营 实战设计 v3.0',
  description: '基于《上瘾》《焦虑的一代》《不可打扰》《欲罢不能》四本书精读的两天AI创造营实战设计',
  styles: {
    default: {
      document: { run: { font: CN, size: 21, color: INK }, paragraph: { spacing: { line: 300 } } },
    },
  },
  numbering: {
    config: [
      {
        reference: 'bul',
        levels: [0, 1, 2].map(l => ({
          level: l, format: LevelFormat.BULLET, text: ['●', '○', '▪'][l], alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 300 + l * 300, hanging: 240 } } },
        })),
      },
      {
        reference: 'ord',
        levels: [0, 1, 2].map(l => ({
          level: l, format: LevelFormat.DECIMAL, text: `%${l + 1}.`, alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 300 + l * 300, hanging: 240 } } },
        })),
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
      },
    },
    children: kids,
  }],
});

Packer.toBuffer(doc).then(b => { fs.writeFileSync(OUT, b); console.log('wrote', OUT, b.length, 'bytes'); });
