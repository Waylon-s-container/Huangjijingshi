// 阴阳消息消长图：十二消息卦 + 阳爻数量色深变化。
// 展示"消息"（消=阴长阳消，息=阳长）的核心概念。
// 十二消息卦：复(1阳)→临(2)→泰(3)→大壮(4)→夬(5)→乾(6阳极)→姤(1阴)→遁→否→观→剥→坤(6阴极)
// 用阳爻数量决定底色深浅：阳多=暖色深，阳少=冷色深。

// 十二消息卦（自下而上6爻，1=阳）
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
      r += `<rect x="0" y="${y.toFixed(1)}" width="${gw}" height="${yh.toFixed(1)}" fill="${stroke}" opacity="0.5"/>`;
      r += `<rect x="${w - gw}" y="${y.toFixed(1)}" width="${gw}" height="${yh.toFixed(1)}" fill="${stroke}" opacity="0.5"/>`;
    }
  }
  return r;
}

export function renderXiaoXi(container) {
  const cols = XIAOXI.length;
  const colW = 48;
  const totalW = cols * colW;
  const baseX = 20, baseY = 30;
  let items = '';
  XIAOXI.forEach((x, i) => {
    const cx = baseX + i * colW + colW / 2;
    // 色深：阳爻越多越暖（朱砂），越少越冷（墨）
    const yangRatio = x.yang / 6;
    // 背景：阳长用暖色渐变，阴长用冷色
    const isYangHalf = i < 6;
    const bgOpacity = 0.05 + (isYangHalf ? yangRatio : (1 - yangRatio)) * 0.12;
    const bgColor = isYangHalf ? '#a02020' : '#2a2418';
    items += `
      <g transform="translate(${cx},${baseY})">
        <rect x="-20" y="-4" width="40" height="120" fill="${bgColor}" opacity="${bgOpacity.toFixed(2)}" rx="2"/>
        <text x="0" y="6" font-size="10" fill="#6a5a3a" text-anchor="middle">${x.month}月</text>
        <g transform="translate(-10, 14)">${miniHex(x.lines, 20, 28, '#1a1410')}</g>
        <text x="0" y="58" font-size="13" fill="#2a2418" text-anchor="middle" font-weight="700">${x.name}</text>
        <text x="0" y="72" font-size="8" fill="#6a5a3a" text-anchor="middle">陽${x.yang}</text>
        <text x="0" y="86" font-size="8" fill="#6a5a3a" text-anchor="middle">${x.desc}</text>
      </g>`;
  });
  // 阳长/阴消分隔线（乾与姤之间）
  const divX = baseX + 6 * colW;

  container.innerHTML = `
    <svg viewBox="0 0 ${totalW + 40} 160" class="diagram-svg" style="max-width:600px">
      <!-- 阳长区域标注 -->
      <text x="${baseX + 3 * colW / 2 + colW / 2}" y="14" font-size="10" fill="#a02020" text-anchor="middle" font-weight="700">陽息（陽長）⟶</text>
      <text x="${baseX + 9 * colW}" y="14" font-size="10" fill="#2a2418" text-anchor="middle" font-weight="700">⟵ 陰消（陰長）</text>
      <line x1="${divX}" y1="20" x2="${divX}" y2="150" stroke="#a02020" stroke-width="0.8" stroke-dasharray="4,3" opacity="0.4"/>
      ${items}
    </svg>
    <div class="diagram-caption">
      十二消息卦：左半陽息（復→乾，一陽漸長至純陽），右半陰消（姤→坤，一陰漸長至純陰）。
      底色深淺對應陽氣盛衰。此為皇極經世配卦的陰陽節律基礎。
    </div>`;
}
