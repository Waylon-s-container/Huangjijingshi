// 治乱循环可视化：以圆环展示历史周期。
// 学术红线："治/乱"判定主观性强，本图只展示循环结构与朝代位置，不评判具体治乱。
// 交互：点击圆环上朝代点 → 显示该朝代的元会运世定位。
import { locate } from '../../data/calendar.js';

const HUI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const DYNASTIES = [
  { year: -2070, name: '夏', desc: '約前2070-前1600' },
  { year: -1600, name: '商', desc: '約前1600-前1046' },
  { year: -1046, name: '周', desc: '前1046-前256' },
  { year: -221,  name: '秦', desc: '前221-前206' },
  { year: -202,  name: '漢', desc: '前202-公元220' },
  { year: 618,   name: '唐', desc: '公元618-907' },
  { year: 960,   name: '宋', desc: '公元960-1279' },
  { year: 1368,  name: '明', desc: '公元1368-1644' },
  { year: 1644,  name: '清', desc: '公元1644-1912' },
  { year: 2026,  name: '今', desc: '公元2026' },
];

export function renderZhiLuan(container) {
  // 朝代按年份在半圆弧上分布（前2070为左端，2026为右端）
  const MIN_Y = -2100, MAX_Y = 2100;
  const cx = 180, cy = 150, R = 110;

  // 先算每个朝代点的角度，再检测相邻过近的，错开标签 y 偏移避免重叠
  const rawAngles = DYNASTIES.map(d => {
    const pct = (d.year - MIN_Y) / (MAX_Y - MIN_Y);
    return Math.PI - pct * Math.PI; // π(左)→0(右)
  });

  // 标签 y 偏移：若与前一点角度差过小（标签会重叠），则把当前标签向外推（y 更小）
  const labelOffsets = rawAngles.map((a, i) => {
    if (i === 0) return 0;
    const prevA = rawAngles[i - 1];
    const dAngle = Math.abs(a - prevA);
    // 弧长 = R * dAngle；标签宽度约 12px，换算成角度约 0.11 弧度
    if (dAngle < 0.11) return -14; // 与上一个重叠，向外（y 减小）推 14px
    return 0;
  });

  const arcPoints = DYNASTIES.map((d, i) => {
    const a = rawAngles[i];
    return {
      ...d,
      x: cx + Math.cos(a) * R,
      y: cy - Math.sin(a) * R,
      labelY: cy - Math.sin(a) * R - 12 + labelOffsets[i],
    };
  });

  container.innerHTML = `
    <div class="zl-box">
      <div class="zl-svg-wrap">
        <svg viewBox="0 0 360 200" class="zl-svg">
          <!-- 半圆弧（历史之流） -->
          <path d="M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}" fill="none" stroke="#8a7a5a" stroke-width="1.2"/>
          <!-- 阳长阴消示意（左半阳长，右半阴消）-->
          <path d="M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx} ${cy - R}" fill="none" stroke="#a02020" stroke-width="2" opacity="0.4"/>
          <path d="M ${cx} ${cy - R} A ${R} ${R} 0 0 1 ${cx + R} ${cy}" fill="none" stroke="#2a2418" stroke-width="2" opacity="0.3"/>
          <!-- 朝代点 -->
          ${arcPoints.map(p => `
            <g class="zl-pt" data-year="${p.year}" data-name="${p.name}">
              <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="6" fill="#f4ecd8" stroke="#a02020" stroke-width="1.5" class="zl-dot"/>
              <text x="${p.x.toFixed(1)}" y="${p.labelY.toFixed(1)}" font-size="10" fill="#2a2418" text-anchor="middle" font-weight="700">${p.name}</text>
            </g>`).join('')}
          <!-- 标注 -->
          <text x="${cx - R - 8}" y="${cy + 5}" font-size="9" fill="#a02020" text-anchor="end">陽息（始）</text>
          <text x="${cx}" y="${cy - R - 8}" font-size="9" fill="#6a5a3a" text-anchor="middle">陽極</text>
          <text x="${cx + R + 8}" y="${cy + 5}" font-size="9" fill="#2a2418">陰消（終）</text>
        </svg>
      </div>
      <div class="zl-result" id="zl-result">點擊圓弧上的朝代點，查看其元會運世定位</div>
      <div class="zl-note">註：圓弧象徵歷史如環，邵雍謂「陰陽之消長，古今之治亂」。本圖只標朝代位置，不判定具體治亂（治亂判定主觀性強，非本圖職責）。</div>
    </div>`;

  const resultEl = container.querySelector('#zl-result');

  arcPoints.forEach(p => {
    const g = container.querySelector(`.zl-pt[data-year="${p.year}"]`);
    if (!g) return;
    g.style.cursor = 'pointer';
    g.addEventListener('click', () => {
      const loc = locate(p.year);
      const bc = (y) => y <= 0 ? '前' + (-y) : '公元' + y;
      // 清除其他高亮
      container.querySelectorAll('.zl-dot').forEach(d => d.setAttribute('r', 6));
      g.querySelector('.zl-dot').setAttribute('r', 9);
      resultEl.innerHTML = `
        <div class="zl-r-name">${p.name}（${p.desc}）</div>
        <div class="zl-r-loc">${bc(p.year)} · ${HUI[loc.huiIndex]}會 · 第${loc.yunInHui + 1}運 · 第${loc.shiInYun + 1}世</div>
        <div class="zl-r-abs">全元第${loc.yunAbs + 1}運</div>`;
    });
  });
}
