// 阴阳消息消长图（美化版）：
// 十二消息卦横向展开，阳息/阴消分区，阳气柱状起伏，迷你卦象。
const XIAOXI = [
  { name: '復',  lines: '100000', yang: 1, month: '子', desc: '一陽來復' },
  { name: '臨',  lines: '110000', yang: 2, month: '丑', desc: '陽長' },
  { name: '泰',  lines: '111000', yang: 3, month: '寅', desc: '三陽開泰' },
  { name: '大壯',lines: '111100', yang: 4, month: '卯', desc: '陽盛' },
  { name: '夬',  lines: '111110', yang: 5, month: '辰', desc: '陽極將決' },
  { name: '乾',  lines: '111111', yang: 6, month: '巳', desc: '純陽' },
  { name: '姤',  lines: '011111', yang: 5, month: '午', desc: '一陰始生' },
  { name: '遯',  lines: '001111', yang: 4, month: '未', desc: '陰長' },
  { name: '否',  lines: '000111', yang: 3, month: '申', desc: '陰陽不交' },
  { name: '觀',  lines: '000011', yang: 2, month: '酉', desc: '陰盛' },
  { name: '剝',  lines: '000001', yang: 1, month: '戌', desc: '陰極將剝' },
  { name: '坤',  lines: '000000', yang: 0, month: '亥', desc: '純陰' },
];

const ZHU = '#a02020';
const INK = '#2a2418';

function miniHex(lines, w, h, stroke) {
  const yh = Math.max(1.4, h / 9);
  const gap = (h - yh * 6) / 5;
  let r = '';
  for (let i = 5; i >= 0; i--) {
    const yang = lines[i] === '1';
    const y = (5 - i) * (yh + gap);
    if (yang) {
      r += `<rect x="0" y="${y.toFixed(1)}" width="${w}" height="${yh.toFixed(1)}" rx="0.5" fill="${stroke}"/>`;
    } else {
      const gw = w * 0.38;
      r += `<rect x="0" y="${y.toFixed(1)}" width="${gw}" height="${yh.toFixed(1)}" rx="0.5" fill="${stroke}" opacity="0.55"/>`;
      r += `<rect x="${(w - gw).toFixed(1)}" y="${y.toFixed(1)}" width="${gw}" height="${yh.toFixed(1)}" rx="0.5" fill="${stroke}" opacity="0.55"/>`;
    }
  }
  return r;
}

export function renderXiaoXi(container) {
  const cols = XIAOXI.length;
  const colW = 52;
  const padL = 28, padR = 28;
  const totalW = padL + cols * colW + padR;
  const baseY = 48;
  const barMaxH = 56;
  const hexY = baseY + barMaxH + 18;

  // 背景分区
  const midX = padL + 6 * colW;
  const bg = `
    <rect x="${padL}" y="28" width="${6 * colW}" height="200" fill="${ZHU}" opacity="0.04" rx="4"/>
    <rect x="${midX}" y="28" width="${6 * colW}" height="200" fill="${INK}" opacity="0.04" rx="4"/>
    <line x1="${midX}" y1="28" x2="${midX}" y2="228" stroke="${ZHU}" stroke-width="1" stroke-dasharray="4,3" opacity="0.35"/>
    <text x="${padL + 3 * colW}" y="20" font-size="11" fill="${ZHU}" text-anchor="middle" font-weight="700">陽息（陽長）⟶</text>
    <text x="${midX + 3 * colW}" y="20" font-size="11" fill="${INK}" text-anchor="middle" font-weight="700">⟵ 陰消（陰長）</text>`;

  // 阳气起伏折线路径
  let wavePts = [];
  XIAOXI.forEach((x, i) => {
    const cx = padL + i * colW + colW / 2;
    const barH = (x.yang / 6) * barMaxH;
    const y = baseY + barMaxH - barH;
    wavePts.push(`${cx},${y}`);
  });
  const wave = `
    <polyline points="${wavePts.join(' ')}" fill="none" stroke="${ZHU}" stroke-width="1.5" opacity="0.5"/>
    <polyline points="${wavePts.join(' ')} ${padL + (cols - 0.5) * colW},${baseY + barMaxH} ${padL + 0.5 * colW},${baseY + barMaxH}"
      fill="${ZHU}" opacity="0.06" stroke="none"/>`;

  let items = '';
  XIAOXI.forEach((x, i) => {
    const cx = padL + i * colW + colW / 2;
    const isYangHalf = i < 6;
    const barH = Math.max(4, (x.yang / 6) * barMaxH);
    const barY = baseY + barMaxH - barH;
    const barColor = isYangHalf ? ZHU : INK;
    const peak = x.yang === 6 || x.yang === 0;

    items += `
      <g>
        <!-- 阳气柱 -->
        <rect x="${cx - 10}" y="${barY}" width="20" height="${barH}"
          fill="${barColor}" opacity="${0.12 + x.yang * 0.06}" rx="2"/>
        <rect x="${cx - 10}" y="${barY}" width="20" height="2"
          fill="${barColor}" opacity="0.55" rx="1"/>
        <!-- 月支 -->
        <text x="${cx}" y="${baseY + barMaxH + 14}" font-size="10" fill="#6a5a3a" text-anchor="middle">${x.month}</text>
        <!-- 卦象 -->
        <g transform="translate(${cx - 11}, ${hexY})">${miniHex(x.lines, 22, 32, INK)}</g>
        <!-- 卦名 -->
        <text x="${cx}" y="${hexY + 48}" font-size="13" fill="${peak ? ZHU : INK}"
          text-anchor="middle" font-weight="700">${x.name}</text>
        <text x="${cx}" y="${hexY + 62}" font-size="9" fill="#6a5a3a" text-anchor="middle">陽${x.yang}</text>
        <text x="${cx}" y="${hexY + 76}" font-size="8" fill="#6a5a3a" text-anchor="middle">${x.desc}</text>
      </g>`;
  });

  container.innerHTML = `
    <svg viewBox="0 0 ${totalW} 250" class="diagram-svg" style="max-width:680px">
      ${bg}
      ${wave}
      ${items}
    </svg>
    <div class="diagram-caption">
      十二消息卦：左半陽息（復→乾，一陽漸長至純陽），右半陰消（姤→坤，一陰漸長至純陰）。
      柱高與折線對應陽爻多寡，是皇極經世配卦的陰陽節律基礎。
    </div>`;
}
