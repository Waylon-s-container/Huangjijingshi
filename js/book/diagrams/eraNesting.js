// 元会运世嵌套圈图解（详细版）：
// 12会全标名称+年份范围，午会内30运刻度，当前2026定位精确标注。
// 数据来自 calendar.js 算法（经黄金用例验证）。
import { locate, yearsSinceEpoch, EPOCH_YEAR } from '../../data/calendar.js';

const HUI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
// 各会年份范围（距元初起讫 → 公历）
function toYear(n) { return n < 67017 ? -(67017 - n) : (n - 67017 + 1); }
function fmt(y) { return y <= 0 ? '前' + (-y) : String(y); }

export function renderEraNesting(container) {
  // 12会年份范围
  const huiRanges = HUI.map((name, i) => {
    const s = i * 10800, e = (i + 1) * 10800 - 1;
    return { name, idx: i, ya: toYear(s), yb: toYear(e) };
  });
  // 当前定位（2026）
  const cur = locate(2026);

  // 生成12会的方位（圆周等分，子会正上方顺时针）
  const cx = 200, cy = 200, R = 170;
  const huiMarks = huiRanges.map((h, i) => {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + Math.cos(a) * (R + 6);
    const y1 = cy + Math.sin(a) * (R + 6);
    const x2 = cx + Math.cos(a) * (R - 8);
    const y2 = cy + Math.sin(a) * (R - 8);
    const xt = cx + Math.cos(a) * (R + 22);
    const yt = cy + Math.sin(a) * (R + 22);
    const isCur = i === cur.huiIndex;
    const color = isCur ? '#a02020' : '#6a5a3a';
    const yearShort = h.ya <= 0 ? '前' + Math.round(-h.ya / 1000) + 'k' : Math.round(h.ya / 1000) + 'k';
    return `
      <line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="${isCur ? 2 : 0.8}"/>
      <text x="${xt.toFixed(1)}" y="${yt.toFixed(1)}" font-size="13" fill="${color}" text-anchor="middle" font-weight="${isCur ? 700 : 400}">${h.name}</text>
      <text x="${xt.toFixed(1)}" y="${(yt + 12).toFixed(1)}" font-size="8" fill="${color}" text-anchor="middle" opacity="0.8">${yearShort}</text>`;
  }).join('');

  // 午会扇区高亮（30运刻度）
  const huiAngleStart = (cur.huiIndex / 12) * Math.PI * 2 - Math.PI / 2;
  const huiAngleEnd = ((cur.huiIndex + 1) / 12) * Math.PI * 2 - Math.PI / 2;
  let yunTicks = '';
  for (let y = 0; y < 30; y++) {
    const a = huiAngleStart + (y / 30) * (huiAngleEnd - huiAngleStart);
    const isCur = y === cur.yunInHui;
    const x1 = cx + Math.cos(a) * (R - 8);
    const y1 = cy + Math.sin(a) * (R - 8);
    const x2 = cx + Math.cos(a) * (R - 22);
    const y2 = cy + Math.sin(a) * (R - 22);
    yunTicks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${isCur ? '#a02020' : '#aa9a72'}" stroke-width="${isCur ? 2 : 0.5}"/>`;
  }
  // 当前运的扇区
  const yunA = huiAngleStart + (cur.yunInHui / 30) * (huiAngleEnd - huiAngleStart);
  const yunB = huiAngleStart + ((cur.yunInHui + 1) / 30) * (huiAngleEnd - huiAngleStart);
  const r1 = 36, r2 = R - 22;
  const curSector = `
    <path d="M ${cx + Math.cos(yunA) * r1} ${cy + Math.sin(yunA) * r1}
             L ${cx + Math.cos(yunA) * r2} ${cy + Math.sin(yunA) * r2}
             A ${r2} ${r2} 0 0 1 ${cx + Math.cos(yunB) * r2} ${cy + Math.sin(yunB) * r2}
             L ${cx + Math.cos(yunB) * r1} ${cy + Math.sin(yunB) * r1} Z"
          fill="#a02020" opacity="0.12"/>`;

  container.innerHTML = `
    <svg viewBox="0 0 400 400" class="diagram-svg" style="max-width:420px">
      <!-- 四层同心环：元/会/运/世 -->
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#5a4a32" stroke-width="1.2"/>
      <circle cx="${cx}" cy="${cy}" r="${R - 22}" fill="none" stroke="#8a7a5a" stroke-width="0.8"/>
      <circle cx="${cx}" cy="${cy}" r="${R - 50}" fill="none" stroke="#8a7a5a" stroke-width="0.6" stroke-dasharray="2,3"/>
      <circle cx="${cx}" cy="${cy}" r="${r1}" fill="none" stroke="#8a7a5a" stroke-width="0.6" stroke-dasharray="2,3"/>
      <!-- 12会标记 -->
      ${huiMarks}
      <!-- 午会高亮扇区 -->
      ${curSector}
      <!-- 30运刻度 -->
      ${yunTicks}
      <!-- 中心层级标注 -->
      <text x="${cx}" y="${cy - 4}" font-size="11" fill="#6a5a3a" text-anchor="middle">元</text>
      <text x="${cx}" y="${cy + 10}" font-size="9" fill="#8a7a5a" text-anchor="middle">129600年</text>
      <!-- 当前定位标注 -->
      <g transform="translate(${cx}, ${cy + 30})">
        <rect x="-70" y="0" width="140" height="44" fill="#a02020" opacity="0.08" stroke="#a02020" stroke-width="0.5" rx="2"/>
        <text x="0" y="14" font-size="10" fill="#a02020" text-anchor="middle" font-weight="700">2026年定位</text>
        <text x="0" y="28" font-size="9" fill="#2a2418" text-anchor="middle">${HUI[cur.huiIndex]}會·第${cur.yunInHui + 1}運·第${cur.shiInYun + 1}世</text>
        <text x="0" y="40" font-size="8" fill="#6a5a3a" text-anchor="middle">全元第${cur.yunAbs + 1}運</text>
      </g>
    </svg>
    <div class="diagram-caption">
      外環十二會（標名稱與大約年份），內環刻度為午會三十運（朱砂為當前運）。
      一元=12會=360運=4320世=129600年。
    </div>`;
}
