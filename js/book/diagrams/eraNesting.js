// 元会运世嵌套圈图解：
// 外环十二会扇区 + 年份；午会内运/世刻度；朱砂指针；定位信息在图下方（避免与南位重叠）。
import { locate } from '../../data/calendar.js';

const HUI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const HUI_TINT = [
  '#a02020', '#8a4a32', '#a06030', '#8a6a3a',
  '#6a5a3a', '#5a4a32', '#a02020', '#6a5a3a',
  '#5a4a42', '#4a4a52', '#4a3a4a', '#5a3a42',
];
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

export function renderEraNesting(container) {
  const huiRanges = HUI.map((name, i) => {
    const s = i * 10800, e = (i + 1) * 10800 - 1;
    return { name, idx: i, ya: toYear(s), yb: toYear(e) };
  });
  const cur = locate(2026);

  const cx = 220, cy = 220;
  // 环半径：外标签在 R_LABEL，不再把定位卡塞进 SVG
  const R_LABEL = 198;   // 年份/会名外标
  const R_OUT = 172;     // 最外装饰环
  const R_HUI = 158;     // 会环外
  const R_HUI_IN = 122;  // 会环内
  const R_YUN = 118;
  const R_YUN_IN = 82;
  const R_SHI = 80;
  const R_CORE = 40;

  // 12会扇区 + 标签（会名在扇区中部，年份在环外）
  let huiSectors = '';
  let huiLabels = '';
  huiRanges.forEach((h, i) => {
    const a0 = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / 12) * Math.PI * 2 - Math.PI / 2;
    const isCur = i === cur.huiIndex;
    const mid = (a0 + a1) / 2;
    const opacity = isCur ? 0.18 : 0.06;
    huiSectors += `<path d="${sectorPath(cx, cy, R_HUI_IN, R_HUI, a0, a1)}"
      fill="${HUI_TINT[i]}" opacity="${opacity}"
      stroke="${isCur ? ZHU : '#8a7a5a'}" stroke-width="${isCur ? 1.4 : 0.4}"/>`;

    const [lx1, ly1] = polar(cx, cy, R_HUI_IN, a0);
    const [lx2, ly2] = polar(cx, cy, R_HUI, a0);
    huiSectors += `<line x1="${lx1.toFixed(1)}" y1="${ly1.toFixed(1)}" x2="${lx2.toFixed(1)}" y2="${ly2.toFixed(1)}"
      stroke="#8a7a5a" stroke-width="0.5" opacity="0.45"/>`;

    // 会名：扇区中心
    const [tx, ty] = polar(cx, cy, (R_HUI + R_HUI_IN) / 2, mid);
    // 年份：环外，与会名径向错开
    const [ex, ey] = polar(cx, cy, R_LABEL, mid);
    huiLabels += `
      <text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" font-size="${isCur ? 15 : 13}"
        fill="${isCur ? ZHU : '#2a2418'}" text-anchor="middle" dominant-baseline="middle"
        font-weight="${isCur ? 700 : 500}">${h.name}</text>
      <text x="${ex.toFixed(1)}" y="${ey.toFixed(1)}" font-size="8"
        fill="${isCur ? ZHU : '#6a5a3a'}" text-anchor="middle" dominant-baseline="middle"
        opacity="0.85">${fmtK(h.ya)}</text>`;
  });

  // 午会内 30 运刻度
  const huiA0 = (cur.huiIndex / 12) * Math.PI * 2 - Math.PI / 2;
  const huiA1 = ((cur.huiIndex + 1) / 12) * Math.PI * 2 - Math.PI / 2;
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
  const yunA = huiA0 + (cur.yunInHui / 30) * (huiA1 - huiA0);
  const yunB = huiA0 + ((cur.yunInHui + 1) / 30) * (huiA1 - huiA0);
  const curSector = `<path d="${sectorPath(cx, cy, R_CORE + 4, R_YUN, yunA, yunB)}"
    fill="${ZHU}" opacity="0.16" stroke="${ZHU}" stroke-width="0.8"/>`;

  // 当前运内 12 世
  let shiTicks = '';
  for (let s = 0; s <= 12; s++) {
    const a = yunA + (s / 12) * (yunB - yunA);
    const isCur = s === cur.shiInYun;
    const [x1, y1] = polar(cx, cy, R_CORE + 4, a);
    const [x2, y2] = polar(cx, cy, R_SHI - 4, a);
    shiTicks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"
      stroke="${isCur ? ZHU : '#c0b090'}" stroke-width="${isCur ? 1.5 : 0.4}"/>`;
  }

  // 指针
  const midYun = (yunA + yunB) / 2;
  const [px, py] = polar(cx, cy, R_YUN - 6, midYun);
  const pointer = `
    <line x1="${cx}" y1="${cy}" x2="${px.toFixed(1)}" y2="${py.toFixed(1)}"
      stroke="${ZHU}" stroke-width="1.1" stroke-dasharray="3,2" opacity="0.5"/>
    <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3.5" fill="${ZHU}" opacity="0.85">
      <animate attributeName="r" values="2.8;4.2;2.8" dur="2.4s" repeatCount="indefinite"/>
    </circle>`;

  // 环层标注：放在右侧水平位置，径向错开，不压扇区字
  // 会环右缘外侧、运环右缘、世环右缘 —— 略偏上避免与卯会字重叠
  const ringLabels = `
    <text x="${cx + (R_HUI + R_HUI_IN) / 2}" y="${cy + 14}" font-size="8" fill="#6a5a3a"
      text-anchor="middle" opacity="0.55">會</text>
    <text x="${cx + (R_YUN + R_YUN_IN) / 2}" y="${cy + 14}" font-size="8" fill="#6a5a3a"
      text-anchor="middle" opacity="0.55">運</text>
    <text x="${cx + (R_SHI + R_CORE) / 2}" y="${cy + 14}" font-size="8" fill="#6a5a3a"
      text-anchor="middle" opacity="0.55">世</text>`;

  // viewBox：包住外圈年份标签
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

        <!-- 外装饰环 -->
        <circle cx="${cx}" cy="${cy}" r="${R_OUT}" fill="none" stroke="#5a4a32" stroke-width="1.1"/>
        <circle cx="${cx}" cy="${cy}" r="${R_OUT - 5}" fill="none" stroke="#8a7a5a" stroke-width="0.4" stroke-dasharray="2,3"/>

        <!-- 会环 -->
        ${huiSectors}
        <circle cx="${cx}" cy="${cy}" r="${R_HUI}" fill="none" stroke="#5a4a32" stroke-width="1"/>
        <circle cx="${cx}" cy="${cy}" r="${R_HUI_IN}" fill="none" stroke="#8a7a5a" stroke-width="0.7"/>

        <!-- 运环 -->
        <circle cx="${cx}" cy="${cy}" r="${R_YUN}" fill="none" stroke="#aa9a72" stroke-width="0.5"/>
        <circle cx="${cx}" cy="${cy}" r="${R_YUN_IN}" fill="none" stroke="#aa9a72" stroke-width="0.5" stroke-dasharray="2,2"/>

        ${curSector}
        ${yunTicks}
        ${shiTicks}
        ${pointer}

        <!-- 中心 -->
        <circle cx="${cx}" cy="${cy}" r="${R_CORE}" fill="url(#era-core)" stroke="${ZHU}" stroke-width="1"/>
        <circle cx="${cx}" cy="${cy}" r="${R_CORE - 6}" fill="none" stroke="${ZHU}" stroke-width="0.4" opacity="0.4"/>
        <text x="${cx}" y="${cy - 6}" font-size="13" fill="${ZHU}" text-anchor="middle" font-weight="700">元</text>
        <text x="${cx}" y="${cy + 10}" font-size="9" fill="#6a5a3a" text-anchor="middle">129600年</text>

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
      外環十二會（色帶標示，外圈為約略起始年份），中環運刻度（午會三十運），內環世刻度。
      朱砂扇區與指針指向 2026 年所在運世。一元 = 12會 = 360運 = 4320世 = 129600年。
    </div>`;
}
