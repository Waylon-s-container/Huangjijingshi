// 元会运世嵌套圈图解。
// 方位遵循传统地支：子=北(下)、午=南(上)、卯=东(右)、酉=西(左)。
//   即子会起始角为 +π/2（正下方），顺时针推进：子→丑→…→午(正上)→…→亥。
// 当前运扇区只画在运环内（不侵入世环），避免运/世视觉混淆。
import { locate } from '../../data/calendar.js';

const HUI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ZHU = '#a02020';

function toYear(n) { return n < 67017 ? -(67017 - n) : (n - 67017 + 1); }
function fmtK(y) {
  if (y <= 0) return '前' + Math.round(-y / 1000) + 'k';
  return Math.round(y / 1000) + 'k';
}
function polar(cx, cy, r, a) {
  return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
}
function sectorPath(cx, cy, rIn, rOut, a0, a1) {
  const [x0, y0] = polar(cx, cy, rOut, a0);
  const [x1, y1] = polar(cx, cy, rOut, a1);
  const [x2, y2] = polar(cx, cy, rIn, a1);
  const [x3, y3] = polar(cx, cy, rIn, a0);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${x0.toFixed(1)} ${y0.toFixed(1)}
    A ${rOut} ${rOut} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}
    L ${x2.toFixed(1)} ${y2.toFixed(1)}
    A ${rIn} ${rIn} 0 ${large} 0 ${x3.toFixed(1)} ${y3.toFixed(1)} Z`;
}

// 第 i 会的起始角（子=北/下方=+π/2，顺时针）
function huiStart(i) {
  // 顺时针推进 = 角度递增（SVG y 向下，cos/sin 标准定义下 +π/2 是正下方）
  return Math.PI / 2 + (i / 12) * Math.PI * 2;
}

export function renderEraNesting(container) {
  const huiRanges = HUI.map((name, i) => {
    const s = i * 10800, e = (i + 1) * 10800 - 1;
    return { name, idx: i, ya: toYear(s), yb: toYear(e) };
  });
  const cur = locate(2026);

  const cx = 220, cy = 220;
  const R_LABEL = 198;
  const R_OUT = 172;
  const R_HUI = 158;
  const R_HUI_IN = 122;
  const R_YUN = 118;
  const R_YUN_IN = 86;
  const R_SHI = 80;
  const R_CORE = 40;

  // 12会扇区 + 标签
  let huiSectors = '';
  let huiLabels = '';
  huiRanges.forEach((h, i) => {
    const a0 = huiStart(i);
    const a1 = huiStart(i + 1);
    const isCur = i === cur.huiIndex;
    const mid = (a0 + a1) / 2;
    const opacity = isCur ? 0.18 : 0.06;
    huiSectors += `<path d="${sectorPath(cx, cy, R_HUI_IN, R_HUI, a0, a1)}"
      fill="${isCur ? ZHU : '#8a6a3a'}" opacity="${opacity}"
      stroke="${isCur ? ZHU : '#8a7a5a'}" stroke-width="${isCur ? 1.4 : 0.4}"/>`;

    const [lx1, ly1] = polar(cx, cy, R_HUI_IN, a0);
    const [lx2, ly2] = polar(cx, cy, R_HUI, a0);
    huiSectors += `<line x1="${lx1.toFixed(1)}" y1="${ly1.toFixed(1)}" x2="${lx2.toFixed(1)}" y2="${ly2.toFixed(1)}"
      stroke="#8a7a5a" stroke-width="0.5" opacity="0.45"/>`;

    // 会名：扇区中心
    const [tx, ty] = polar(cx, cy, (R_HUI + R_HUI_IN) / 2, mid);
    // 年份：环外
    const [ex, ey] = polar(cx, cy, R_LABEL, mid);
    huiLabels += `
      <text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" font-size="${isCur ? 15 : 13}"
        fill="${isCur ? ZHU : '#2a2418'}" text-anchor="middle" dominant-baseline="middle"
        font-weight="${isCur ? 700 : 500}">${h.name}</text>
      <text x="${ex.toFixed(1)}" y="${ey.toFixed(1)}" font-size="8"
        fill="${isCur ? ZHU : '#6a5a3a'}" text-anchor="middle" dominant-baseline="middle"
        opacity="0.85">${fmtK(h.ya)}</text>`;
  });

  // 午会内 30 运刻度（只画在运环 R_YUN_IN~R_YUN 内）
  const huiA0 = huiStart(cur.huiIndex);
  const huiA1 = huiStart(cur.huiIndex + 1);
  let yunTicks = '';
  for (let y = 0; y <= 30; y++) {
    const a = huiA0 + (y / 30) * (huiA1 - huiA0);
    const isMajor = y % 5 === 0;
    const isCur = y === cur.yunInHui;
    const [x1, y1] = polar(cx, cy, R_YUN_IN, a);
    const [x2, y2] = polar(cx, cy, isMajor ? R_YUN : R_YUN - 7, a);
    yunTicks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"
      stroke="${isCur ? ZHU : '#aa9a72'}" stroke-width="${isCur ? 2 : (isMajor ? 0.9 : 0.4)}"/>`;
  }
  // 当前运扇区：只画在运环内（R_YUN_IN ~ R_YUN），不侵入世环
  const yunA = huiA0 + (cur.yunInHui / 30) * (huiA1 - huiA0);
  const yunB = huiA0 + ((cur.yunInHui + 1) / 30) * (huiA1 - huiA0);
  const curSector = `<path d="${sectorPath(cx, cy, R_YUN_IN, R_YUN, yunA, yunB)}"
    fill="${ZHU}" opacity="0.22" stroke="${ZHU}" stroke-width="1"/>`;

  // 当前运内 12 世刻度（只画在世环 R_CORE ~ R_SHI 内）
  let shiTicks = '';
  for (let s = 0; s <= 12; s++) {
    const a = yunA + (s / 12) * (yunB - yunA);
    const isCur = s === cur.shiInYun;
    const [x1, y1] = polar(cx, cy, R_CORE + 2, a);
    const [x2, y2] = polar(cx, cy, R_SHI, a);
    shiTicks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"
      stroke="${isCur ? ZHU : '#c0b090'}" stroke-width="${isCur ? 1.6 : 0.4}"/>`;
  }
  // 当前世小扇区（世环内）
  const shiA = yunA + (cur.shiInYun / 12) * (yunB - yunA);
  const shiB = yunA + ((cur.shiInYun + 1) / 12) * (yunB - yunA);
  const curShiSector = `<path d="${sectorPath(cx, cy, R_CORE + 2, R_SHI, shiA, shiB)}"
    fill="${ZHU}" opacity="0.28"/>`;

  // 指针指向当前运中线
  const midYun = (yunA + yunB) / 2;
  const [px, py] = polar(cx, cy, R_YUN - 4, midYun);
  const pointer = `
    <line x1="${cx}" y1="${cy}" x2="${px.toFixed(1)}" y2="${py.toFixed(1)}"
      stroke="${ZHU}" stroke-width="1.1" stroke-dasharray="3,2" opacity="0.5"/>
    <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3.5" fill="${ZHU}" opacity="0.85">
      <animate attributeName="r" values="2.8;4.2;2.8" dur="2.4s" repeatCount="indefinite"/>
    </circle>`;

  // 环层标注（放在四正方位的空隙，避免压字）：北、南、东、西四正
  const ringLabels = `
    <text x="${cx}" y="${cy + (R_HUI + R_HUI_IN) / 2}" font-size="9" fill="#6a5a3a"
      text-anchor="middle" opacity="0.6">會</text>
    <text x="${cx + (R_YUN + R_YUN_IN) / 2}" y="${cy + 4}" font-size="9" fill="#6a5a3a"
      text-anchor="middle" opacity="0.6">運</text>
    <text x="${cx + (R_SHI + R_CORE) / 2}" y="${cy + 4}" font-size="9" fill="#6a5a3a"
      text-anchor="middle" opacity="0.6">世</text>`;

  const pad = 16;
  const extent = R_LABEL + 12;
  const vbMin = cx - extent - pad;
  const vbSize = (extent + pad) * 2;

  container.innerHTML = `
    <div class="era-wrap">
      <svg viewBox="${vbMin} ${vbMin} ${vbSize} ${vbSize}" class="diagram-svg era-svg" style="max-width:480px">
        <defs>
          <radialGradient id="era-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${ZHU}" stop-opacity="0.12"/>
            <stop offset="100%" stop-color="${ZHU}" stop-opacity="0"/>
          </radialGradient>
        </defs>

        <circle cx="${cx}" cy="${cy}" r="${R_OUT}" fill="none" stroke="#5a4a32" stroke-width="1.1"/>
        <circle cx="${cx}" cy="${cy}" r="${R_OUT - 5}" fill="none" stroke="#8a7a5a" stroke-width="0.4" stroke-dasharray="2,3"/>

        ${huiSectors}
        <circle cx="${cx}" cy="${cy}" r="${R_HUI}" fill="none" stroke="#5a4a32" stroke-width="1"/>
        <circle cx="${cx}" cy="${cy}" r="${R_HUI_IN}" fill="none" stroke="#8a7a5a" stroke-width="0.7"/>

        <circle cx="${cx}" cy="${cy}" r="${R_YUN}" fill="none" stroke="#aa9a72" stroke-width="0.5"/>
        <circle cx="${cx}" cy="${cy}" r="${R_YUN_IN}" fill="none" stroke="#aa9a72" stroke-width="0.5" stroke-dasharray="2,2"/>
        <circle cx="${cx}" cy="${cy}" r="${R_SHI}" fill="none" stroke="#c0b090" stroke-width="0.4" stroke-dasharray="2,2"/>

        ${curSector}
        ${curShiSector}
        ${yunTicks}
        ${shiTicks}
        ${pointer}

        <circle cx="${cx}" cy="${cy}" r="${R_CORE}" fill="url(#era-core)" stroke="${ZHU}" stroke-width="1"/>
        <text x="${cx}" y="${cy - 4}" font-size="13" fill="${ZHU}" text-anchor="middle" font-weight="700">元</text>
        <text x="${cx}" y="${cy + 10}" font-size="8" fill="#6a5a3a" text-anchor="middle">129600年</text>

        ${huiLabels}
        ${ringLabels}
      </svg>

      <div class="era-card">
        <div class="era-card-title">2026 · 當前定位</div>
        <div class="era-card-main">${HUI[cur.huiIndex]}會 · 第${cur.yunInHui + 1}運 · 第${cur.shiInYun + 1}世</div>
        <div class="era-card-sub">全元第${cur.yunAbs + 1}運 · 世中第${cur.yearInShi + 1}年</div>
      </div>
    </div>
    <div class="diagram-caption">
      地支方位：子北（下）、午南（上）、卯東（右）、酉西（左）。外環十二會（朱砂為當前午會，外圈為約略起始年份），
      中環午會三十運刻度（朱砂為當前第${cur.yunInHui + 1}運），內環當前運內十二世（朱砂為當前第${cur.shiInYun + 1}世）。
    </div>`;
}
