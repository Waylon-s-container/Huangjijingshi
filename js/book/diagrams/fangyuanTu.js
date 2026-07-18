// 方圆图图解（可交互）：
// 外圆：64卦迷你卦象 + 四正朱砂 + 消长弧标注（可点击）
// 内方：8×8 方阵（卦名一字，可点击高亮）
// 点击后下方详情卡显示卦名/工笔卦象/卦辞/四正标记
import { HEXAGRAMS } from '../../data/hexagrams.js';

const ZHU = '#a02020';
const INK = '#2a2418';
const LINE = '#8a7a5a';

// 迷你卦象：圆角爻线
function miniHex(lines, w, h, stroke, yangOpacity = 1) {
  const yh = Math.max(1.2, h / 9);
  const gap = (h - yh * 6) / 5;
  let r = '';
  for (let i = 5; i >= 0; i--) {
    const yang = lines[i] === '1';
    const y = (5 - i) * (yh + gap);
    if (yang) {
      r += `<rect x="0" y="${y.toFixed(1)}" width="${w}" height="${yh.toFixed(1)}" rx="0.6" fill="${stroke}" opacity="${yangOpacity}"/>`;
    } else {
      const gw = w * 0.38;
      r += `<rect x="0" y="${y.toFixed(1)}" width="${gw}" height="${yh.toFixed(1)}" rx="0.6" fill="${stroke}" opacity="${yangOpacity * 0.85}"/>`;
      r += `<rect x="${(w - gw).toFixed(1)}" y="${y.toFixed(1)}" width="${gw}" height="${yh.toFixed(1)}" rx="0.6" fill="${stroke}" opacity="${yangOpacity * 0.85}"/>`;
      r += `<circle cx="${(w / 2).toFixed(1)}" cy="${(y + yh / 2).toFixed(1)}" r="0.6" fill="${stroke}" opacity="0.15"/>`;
    }
  }
  return r;
}

// 工笔规整卦象（详情卡用，较大）
function gongbiHex(lines) {
  let r = '';
  for (let i = 5; i >= 0; i--) {
    const yang = lines[i] === '1';
    const y = 6 + (5 - i) * 10;
    if (yang) {
      r += `<rect x="8" y="${y}" width="48" height="5.5" rx="1" fill="${INK}"/>`;
    } else {
      r += `<rect x="8" y="${y}" width="19" height="5.5" rx="1" fill="${INK}"/>`;
      r += `<rect x="37" y="${y}" width="19" height="5.5" rx="1" fill="${INK}"/>`;
    }
  }
  return `<svg viewBox="0 0 64 68" width="56" height="60">${r}</svg>`;
}

function polar(cx, cy, r, a) {
  return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
}

function yangCount(lines) {
  let n = 0;
  for (const ch of lines) if (ch === '1') n++;
  return n;
}

export function renderFangyuanTu(container) {
  const cx = 220, cy = 220, R = 168;
  const cell = 16; // 略放大，便于点击
  const sqSize = cell * 8;
  const sq0 = cx - sqSize / 2;

  // —— 圆图 64 卦（可点击 hit 区域）——
  let circleHex = '';
  HEXAGRAMS.forEach((hex, i) => {
    const a = (i / HEXAGRAMS.length) * Math.PI * 2 - Math.PI / 2;
    const [x, y] = polar(cx, cy, R, a);
    const isCardinal = !!hex.isCardinal;
    const sw = 15, sh = 18;
    const rot = (a + Math.PI / 2) * 180 / Math.PI;

    if (isCardinal) {
      circleHex += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="14" fill="${ZHU}" opacity="0.08" pointer-events="none"/>`;
    }

    // 可见卦象（不拦截事件）
    circleHex += `<g class="fy-hex-draw" data-id="${hex.id}" transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot.toFixed(1)}) translate(${(-sw / 2).toFixed(1)},${(-sh / 2).toFixed(1)})" pointer-events="none">
      ${miniHex(hex.lines, sw, sh, isCardinal ? ZHU : INK, isCardinal ? 0.95 : 0.8)}
    </g>`;

    // 透明圆形 hit 区
    circleHex += `<circle class="fy-hit fy-circle-hit" data-id="${hex.id}" data-name="${hex.name}"
      cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="13"
      fill="transparent" stroke="transparent" stroke-width="1.5"/>`;

    // 选中高亮环（默认隐藏，由 CSS/JS 控制）
    circleHex += `<circle class="fy-sel-ring" data-id="${hex.id}"
      cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="15"
      fill="none" stroke="${ZHU}" stroke-width="1.6" opacity="0" pointer-events="none"/>`;

    if (isCardinal) {
      const [lx, ly] = polar(cx, cy, R + 24, a);
      circleHex += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" font-size="12" fill="${ZHU}"
        text-anchor="middle" dominant-baseline="middle" font-weight="700" pointer-events="none">${hex.name}</text>`;
    }
  });

  // 消长弧：顺时针弧 + 细线开放式箭头（古籍注记风，非实心三角）。
  // 阳长：复(北) → 乾(东)；阴消：姤后(南偏东) → 坤(西)。
  function arcLabel(a0, a1, r, label, labelBias = 0.5, labelRExtra = 14) {
    const mid = a0 + (a1 - a0) * labelBias;
    const [x0, y0] = polar(cx, cy, r, a0);
    const [x1, y1] = polar(cx, cy, r, a1);
    const [lx, ly] = polar(cx, cy, r + labelRExtra, mid);
    const large = a1 - a0 > Math.PI ? 1 : 0;

    // 末端切向（顺时针）：a1 + π/2
    const tang = a1 + Math.PI / 2;
    const wing = 7;          // 翼长
    const wingAng = 0.48;    // 翼张开角（弧度）
    // 两翼从尖端沿 -tang ± wingAng 退回
    const w1x = x1 - Math.cos(tang - wingAng) * wing;
    const w1y = y1 - Math.sin(tang - wingAng) * wing;
    const w2x = x1 - Math.cos(tang + wingAng) * wing;
    const w2y = y1 - Math.sin(tang + wingAng) * wing;

    // 起点：极短的一撇（与切向垂直的小横，像笔锋起笔）
    const st = a0 + Math.PI / 2;
    const sWing = 3.2;
    const s1x = x0 + Math.cos(st + Math.PI / 2) * sWing;
    const s1y = y0 + Math.sin(st + Math.PI / 2) * sWing;
    const s2x = x0 - Math.cos(st + Math.PI / 2) * sWing;
    const s2y = y0 - Math.sin(st + Math.PI / 2) * sWing;

    return `
      <path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}"
        fill="none" stroke="${ZHU}" stroke-width="1" stroke-linecap="round" opacity="0.65" pointer-events="none"/>
      <path d="M ${s1x.toFixed(1)} ${s1y.toFixed(1)} L ${s2x.toFixed(1)} ${s2y.toFixed(1)}"
        fill="none" stroke="${ZHU}" stroke-width="1" stroke-linecap="round" opacity="0.55" pointer-events="none"/>
      <path d="M ${w1x.toFixed(1)} ${w1y.toFixed(1)} L ${x1.toFixed(1)} ${y1.toFixed(1)} L ${w2x.toFixed(1)} ${w2y.toFixed(1)}"
        fill="none" stroke="${ZHU}" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round" opacity="0.8" pointer-events="none"/>
      <text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" font-size="10" fill="${ZHU}"
        text-anchor="middle" dominant-baseline="middle" font-weight="700" opacity="0.88" pointer-events="none">${label}</text>`;
  }

  // —— 方图 8×8（可点击格子）——
  let squareCells = '';
  HEXAGRAMS.forEach((hex, i) => {
    const row = Math.floor(i / 8), col = i % 8;
    const x = sq0 + col * cell;
    const y = sq0 + row * cell;
    const isCardinal = !!hex.isCardinal;
    const yc = yangCount(hex.lines);
    const bgOp = 0.04 + yc * 0.03;
    squareCells += `
      <g class="fy-cell" data-id="${hex.id}" data-name="${hex.name}" data-row="${row}" data-col="${col}">
        <rect class="fy-cell-bg" x="${x}" y="${y}" width="${cell}" height="${cell}"
          fill="${isCardinal ? ZHU : INK}" fill-opacity="${isCardinal ? 0.16 : bgOp}"
          stroke="${isCardinal ? ZHU : LINE}" stroke-width="${isCardinal ? 0.9 : 0.35}"/>
        <text class="fy-cell-text" x="${x + cell / 2}" y="${y + cell / 2 + 0.5}" font-size="9"
          fill="${isCardinal ? ZHU : INK}" text-anchor="middle" dominant-baseline="middle"
          font-weight="${isCardinal ? 700 : 400}" pointer-events="none">${hex.name.charAt(0)}</text>
        <title>${hex.name}${isCardinal ? '（四正）' : ''}</title>
      </g>`;
  });

  // 方位：正南/正北略外推；东西同半径
  const dirs = [
    { a: -Math.PI / 2, t: '北 · 復', r: R + 50 },
    { a: 0, t: '東', r: R + 48 },
    { a: Math.PI / 2, t: '南 · 姤', r: R + 50 },
    { a: Math.PI, t: '西', r: R + 48 },
  ];
  let dirLabels = '';
  for (const d of dirs) {
    const [x, y] = polar(cx, cy, d.r, d.a);
    dirLabels += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="9" fill="#6a5a3a"
      text-anchor="middle" dominant-baseline="middle" pointer-events="none">${d.t}</text>`;
  }

  // 行/列坐标（方图旁）
  let axisLabels = '';
  for (let i = 0; i < 8; i++) {
    // 上方列号 1–8
    axisLabels += `<text x="${sq0 + i * cell + cell / 2}" y="${sq0 - 4}" font-size="7" fill="#8a7a5a"
      text-anchor="middle" pointer-events="none">${i + 1}</text>`;
    // 左侧行号 1–8
    axisLabels += `<text x="${sq0 - 5}" y="${sq0 + i * cell + cell / 2 + 0.5}" font-size="7" fill="#8a7a5a"
      text-anchor="end" dominant-baseline="middle" pointer-events="none">${i + 1}</text>`;
  }

  // viewBox：圆图外沿约 R+48+字高，四周留白，底部说明改走 HTML，避免与南位/圆环重叠
  const pad = 18;
  const vbMinX = cx - (R + 56) - pad;
  const vbMinY = cy - (R + 56) - pad;
  const vbW = (R + 56) * 2 + pad * 2;
  const vbH = (R + 56) * 2 + pad * 2;

  container.innerHTML = `
    <div class="fy-wrap">
      <svg viewBox="${vbMinX} ${vbMinY} ${vbW} ${vbH}" class="diagram-svg fy-svg" style="max-width:500px">
        <defs>
          <radialGradient id="fy-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ebe0c8" stop-opacity="0.9"/>
            <stop offset="70%" stop-color="#f4ecd8" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#f4ecd8" stop-opacity="0"/>
          </radialGradient>
        </defs>

        <circle cx="${cx}" cy="${cy}" r="${R + 50}" fill="url(#fy-glow)" pointer-events="none"/>

        <circle cx="${cx}" cy="${cy}" r="${R + 32}" fill="none" stroke="#5a4a32" stroke-width="1.1" pointer-events="none"/>
        <circle cx="${cx}" cy="${cy}" r="${R + 26}" fill="none" stroke="#8a7a5a" stroke-width="0.4" stroke-dasharray="2,3" pointer-events="none"/>
        <circle cx="${cx}" cy="${cy}" r="${R + 8}" fill="none" stroke="#5a4a32" stroke-width="0.9" pointer-events="none"/>
        <circle cx="${cx}" cy="${cy}" r="${R - 18}" fill="none" stroke="#aa9a72" stroke-width="0.4" stroke-dasharray="1.5,3" pointer-events="none"/>

        ${arcLabel(-Math.PI / 2 + 0.12, -0.08, R + 36, '陽長', 0.55, 16)}
        ${arcLabel(Math.PI / 2 + 0.35, Math.PI - 0.12, R + 36, '陰消', 0.62, 16)}

        ${circleHex}

        <!-- 方图底板 -->
        <rect x="${sq0 - 4}" y="${sq0 - 4}" width="${sqSize + 8}" height="${sqSize + 8}"
          fill="#f4ecd8" stroke="#5a4a32" stroke-width="1.2" rx="2" pointer-events="none"/>
        ${axisLabels}
        ${squareCells}
        <text x="${cx}" y="${sq0 - 14}" font-size="9" fill="#6a5a3a" text-anchor="middle" pointer-events="none">方圖 · 8×8（點擊格內卦）</text>

        ${dirLabels}
      </svg>

      <div class="fy-legend">
        <div class="fy-legend-main">外圓象天（時間·卦序） · 內方象地（空間·方位）</div>
        <div class="fy-legend-sub">朱砂標示四正卦（乾坤坎離 · 不參與值年）· 圓圖亦可點選</div>
      </div>

      <div class="fy-detail" id="fy-detail" hidden>
        <div class="fy-detail-inner">
          <div class="fy-detail-hex" id="fy-detail-hex"></div>
          <div class="fy-detail-body">
            <div class="fy-detail-top">
              <span class="fy-detail-name" id="fy-detail-name"></span>
              <span class="fy-detail-badge" id="fy-detail-badge" hidden>四正</span>
              <span class="fy-detail-pos" id="fy-detail-pos"></span>
            </div>
            <div class="fy-detail-lines" id="fy-detail-lines"></div>
            <div class="fy-detail-judge" id="fy-detail-judge"></div>
          </div>
          <button type="button" class="fy-detail-close" id="fy-detail-close" aria-label="關閉">×</button>
        </div>
      </div>
    </div>
    <div class="diagram-caption">
      點擊方圖格子或圓圖卦象，可閱該卦卦辭。圓圖自復卦起順時針：陽長至乾，轉陰生至姤，陰長至坤。
      內方為先天方圖 8×8 陣，色深對應陽爻多寡。
    </div>`;

  // —— 交互 ——
  const byId = new Map(HEXAGRAMS.map((h) => [String(h.id), h]));
  const detail = container.querySelector('#fy-detail');
  const detailHex = container.querySelector('#fy-detail-hex');
  const detailName = container.querySelector('#fy-detail-name');
  const detailBadge = container.querySelector('#fy-detail-badge');
  const detailPos = container.querySelector('#fy-detail-pos');
  const detailLines = container.querySelector('#fy-detail-lines');
  const detailJudge = container.querySelector('#fy-detail-judge');
  const closeBtn = container.querySelector('#fy-detail-close');

  let selectedId = null;

  function clearSelection() {
    container.querySelectorAll('.fy-cell.is-selected').forEach((el) => el.classList.remove('is-selected'));
    container.querySelectorAll('.fy-sel-ring').forEach((el) => el.setAttribute('opacity', '0'));
    container.querySelectorAll('.fy-circle-hit.is-selected').forEach((el) => el.classList.remove('is-selected'));
    selectedId = null;
  }

  function selectHex(id) {
    const hex = byId.get(String(id));
    if (!hex) return;
    clearSelection();
    selectedId = String(hex.id);

    // 方图高亮
    const cellEl = container.querySelector(`.fy-cell[data-id="${hex.id}"]`);
    if (cellEl) cellEl.classList.add('is-selected');

    // 圆图高亮环
    const ring = container.querySelector(`.fy-sel-ring[data-id="${hex.id}"]`);
    if (ring) ring.setAttribute('opacity', '0.95');
    const chit = container.querySelector(`.fy-circle-hit[data-id="${hex.id}"]`);
    if (chit) chit.classList.add('is-selected');

    // 方图行列
    const idx = HEXAGRAMS.findIndex((h) => h.id === hex.id);
    const row = Math.floor(idx / 8) + 1;
    const col = (idx % 8) + 1;
    const circleOrd = idx + 1;

    detailHex.innerHTML = gongbiHex(hex.lines);
    detailName.textContent = hex.name;
    if (hex.isCardinal) {
      detailBadge.hidden = false;
    } else {
      detailBadge.hidden = true;
    }
    detailPos.textContent = `圓圖第${circleOrd}位 · 方圖 ${row}行${col}列 · 陽${yangCount(hex.lines)}陰${6 - yangCount(hex.lines)}`;
    detailLines.textContent = `爻（自下而上）：${formatLines(hex.lines)}`;
    detailJudge.textContent = hex.judgment;
    detail.hidden = false;
  }

  function formatLines(lines) {
    // lines[0]=初爻 … lines[5]=上爻
    const names = ['初', '二', '三', '四', '五', '上'];
    return [...lines].map((ch, i) => `${names[i]}${ch === '1' ? '陽' : '陰'}`).join(' · ');
  }

  // 方图点击
  container.querySelectorAll('.fy-cell').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      selectHex(el.dataset.id);
    });
  });

  // 圆图点击
  container.querySelectorAll('.fy-circle-hit').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      selectHex(el.dataset.id);
    });
  });

  closeBtn.addEventListener('click', () => {
    clearSelection();
    detail.hidden = true;
  });
}
