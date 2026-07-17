// 方圆图图解（详细版）：
// 圆图64卦每卦画迷你卦象，四正卦朱砂标记，复→乾→姤→坤消长走向箭头。
// 方图8x8方阵（每格标卦名首字）。
import { HEXAGRAMS } from '../../data/hexagrams.js';

// 迷你卦象 SVG（6爻，宽w高h）
function miniHex(lines, w, h, stroke) {
  const yh = h / 8;
  let r = '';
  for (let i = 5; i >= 0; i--) {
    const yang = lines[i] === '1';
    const y = (5 - i) * (h / 6) + yh / 2;
    if (yang) {
      r += `<rect x="0" y="${y.toFixed(1)}" width="${w}" height="${yh.toFixed(1)}" fill="${stroke}"/>`;
    } else {
      const gw = w * 0.4;
      r += `<rect x="0" y="${y.toFixed(1)}" width="${gw}" height="${yh.toFixed(1)}" fill="${stroke}"/>`;
      r += `<rect x="${w - gw}" y="${y.toFixed(1)}" width="${gw}" height="${yh.toFixed(1)}" fill="${stroke}"/>`;
    }
  }
  return r;
}

export function renderFangyuanTu(container) {
  const cx = 200, cy = 200, R = 150;
  // 圆图64卦（按 HEXAGRAMS 圆图序）
  let circleHex = '';
  HEXAGRAMS.forEach((hex, i) => {
    const a = (i / HEXAGRAMS.length) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(a) * R;
    const y = cy + Math.sin(a) * R;
    const isCardinal = hex.isCardinal;
    const sw = 14, sh = 16;
    const rot = (a + Math.PI / 2) * 180 / Math.PI;
    const g = `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot.toFixed(1)})">
      ${miniHex(hex.lines, sw, sh, isCardinal ? '#a02020' : '#2a2418')}
    </g>`;
    // 四正卦外加框+卦名
    const label = isCardinal
      ? `<text x="${(cx + Math.cos(a) * (R + 20)).toFixed(1)}" y="${(cy + Math.sin(a) * (R + 20)).toFixed(1)}" font-size="11" fill="#a02020" text-anchor="middle" font-weight="700">${hex.name}</text>`
      : '';
    circleHex += g + label;
  });

  // 消长走向箭头标注（复→乾→姤→坤）
  // 复在顶部(子位)，乾在右上(约i=30处1/4偏)，姤在底部偏，坤在左下
  const arc = (a1, a2, r, label, labelR) => {
    const x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
    const x2 = cx + Math.cos(a2) * r, y2 = cy + Math.sin(a2) * r;
    const lx = cx + Math.cos((a1 + a2) / 2) * labelR;
    const ly = cy + Math.sin((a1 + a2) / 2) * labelR;
    return `<path d="M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}" fill="none" stroke="#a02020" stroke-width="1" stroke-dasharray="3,2" opacity="0.5"/>
      <text x="${lx.toFixed(0)}" y="${ly.toFixed(0)}" font-size="9" fill="#a02020" text-anchor="middle" opacity="0.8">${label}</text>`;
  };

  // 方图8x8（取前64卦按方阵排，每格卦名首字）
  let squareCells = '';
  const cellSize = 9;
  const sqOrigin = cx - cellSize * 4;
  HEXAGRAMS.forEach((hex, i) => {
    const r = Math.floor(i / 8), c = i % 8;
    const x = sqOrigin + c * cellSize;
    const y = sqOrigin + r * cellSize;
    const isCardinal = hex.isCardinal;
    squareCells += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cellSize}" height="${cellSize}" fill="${isCardinal ? '#a02020' : 'none'}" fill-opacity="0.15" stroke="#aa9a72" stroke-width="0.3"/>`;
  });

  container.innerHTML = `
    <svg viewBox="0 0 400 400" class="diagram-svg" style="max-width:440px">
      <!-- 圆图外框 -->
      <circle cx="${cx}" cy="${cy}" r="${R + 8}" fill="none" stroke="#5a4a32" stroke-width="1"/>
      <!-- 消长走向（复→乾阳长，姤→坤阴长）-->
      ${arc(-Math.PI / 2, 0, R + 34, '陽長', R + 50)}
      ${arc(0, Math.PI, R + 34, '陰消', R + 50)}
      <!-- 圆图64卦 -->
      ${circleHex}
      <!-- 方图8x8 -->
      ${squareCells}
      <rect x="${sqOrigin}" y="${sqOrigin}" width="${cellSize * 8}" height="${cellSize * 8}" fill="none" stroke="#5a4a32" stroke-width="1"/>
      <!-- 标注 -->
      <text x="${cx}" y="${R + 80}" font-size="10" fill="#6a5a3a" text-anchor="middle">外圓象天（時間·卦序） · 內方象地（空間·方位）</text>
      <text x="${cx}" y="${R + 94}" font-size="9" fill="#a02020" text-anchor="middle">朱砂標示四正卦（乾坤坎離·不參與值年）</text>
    </svg>
    <div class="diagram-caption">
      圓圖自復卦起順時針，陽長至乾（陽極），轉陰生至姤，陰長至坤（陰極），周而復始。
    </div>`;
}
