// 交互式时间定位器（美化版）：
// 输入年份 → 迷你嵌套定位环 + 元会运世格子 + 值年卦工笔。
import { locate, valueYearHexagram } from '../../data/calendar.js';

const HUI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ZHU = '#a02020';
const INK = '#2a2418';

function miniHex(lines) {
  let r = '';
  for (let i = 5; i >= 0; i--) {
    const yang = lines[i] === '1';
    const y = 4 + (5 - i) * 7.5;
    if (yang) {
      r += `<rect x="6" y="${y}" width="36" height="4.5" rx="0.8" fill="${INK}"/>`;
    } else {
      r += `<rect x="6" y="${y}" width="14" height="4.5" rx="0.8" fill="${INK}"/>`;
      r += `<rect x="28" y="${y}" width="14" height="4.5" rx="0.8" fill="${INK}"/>`;
    }
  }
  return `<svg viewBox="0 0 48 52" width="52" height="56">${r}</svg>`;
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

// 迷你定位罗盘：高亮当前会/运
function miniCompass(loc) {
  const cx = 70, cy = 70, R = 58;
  let sectors = '';
  for (let i = 0; i < 12; i++) {
    const a0 = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / 12) * Math.PI * 2 - Math.PI / 2;
    const isCur = i === loc.huiIndex;
    const mid = (a0 + a1) / 2;
    sectors += `<path d="${sectorPath(cx, cy, 28, R, a0, a1)}"
      fill="${isCur ? ZHU : INK}" opacity="${isCur ? 0.2 : 0.04}"
      stroke="${isCur ? ZHU : '#8a7a5a'}" stroke-width="${isCur ? 1.2 : 0.4}"/>`;
    const [tx, ty] = polar(cx, cy, 43, mid);
    sectors += `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" font-size="9"
      fill="${isCur ? ZHU : '#6a5a3a'}" text-anchor="middle" dominant-baseline="middle"
      font-weight="${isCur ? 700 : 400}">${HUI[i]}</text>`;
  }
  // 当前运指针
  const huiA0 = (loc.huiIndex / 12) * Math.PI * 2 - Math.PI / 2;
  const huiA1 = ((loc.huiIndex + 1) / 12) * Math.PI * 2 - Math.PI / 2;
  const yunMid = huiA0 + ((loc.yunInHui + 0.5) / 30) * (huiA1 - huiA0);
  const [px, py] = polar(cx, cy, 24, yunMid);
  return `
    <svg viewBox="0 0 140 140" width="140" height="140" class="loc-compass">
      <circle cx="${cx}" cy="${cy}" r="${R + 4}" fill="none" stroke="#5a4a32" stroke-width="1"/>
      ${sectors}
      <circle cx="${cx}" cy="${cy}" r="26" fill="#f4ecd8" stroke="${ZHU}" stroke-width="0.8"/>
      <line x1="${cx}" y1="${cy}" x2="${px.toFixed(1)}" y2="${py.toFixed(1)}"
        stroke="${ZHU}" stroke-width="1.5"/>
      <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3" fill="${ZHU}"/>
      <text x="${cx}" y="${cy - 2}" font-size="10" fill="${ZHU}" text-anchor="middle" font-weight="700">${HUI[loc.huiIndex]}</text>
      <text x="${cx}" y="${cy + 11}" font-size="8" fill="#6a5a3a" text-anchor="middle">第${loc.yunInHui + 1}運</text>
    </svg>`;
}

export function renderTimeLocator(container) {
  container.innerHTML = `
    <div class="locator-box">
      <div class="locator-input-row">
        <label class="locator-label">輸入年份</label>
        <input type="number" class="locator-input" id="loc-year" value="2026" step="1">
        <button class="locator-btn" id="loc-btn">定位</button>
        <div class="locator-presets">
          <button type="button" data-y="-67017" class="loc-preset">一元初</button>
          <button type="button" data-y="-2357" class="loc-preset">堯元年</button>
          <button type="button" data-y="-2217" class="loc-preset">午會始</button>
          <button type="button" data-y="2026" class="loc-preset">今年</button>
        </div>
      </div>
      <div class="locator-result" id="loc-result"></div>
    </div>`;

  const input = container.querySelector('#loc-year');
  const btn = container.querySelector('#loc-btn');
  const result = container.querySelector('#loc-result');

  function update() {
    const year = parseInt(input.value, 10);
    if (isNaN(year)) {
      result.innerHTML = '<span class="loc-err">請輸入有效年份</span>';
      return;
    }
    const loc = locate(year);
    const hex = valueYearHexagram(year);
    const bc = (y) => (y <= 0 ? '公元前' + (-y) + '年' : '公元' + y + '年');
    // 用 yearsSinceEpoch 语义：与 calendar 一致
    const total =
      loc.yuanIndex * 129600 +
      loc.huiIndex * 10800 +
      loc.yunInHui * 360 +
      loc.shiInYun * 30 +
      loc.yearInShi;

    result.innerHTML = `
      <div class="loc-layout">
        <div class="loc-compass-wrap">${miniCompass(loc)}</div>
        <div class="loc-main">
          <div class="loc-grid">
            <div class="loc-cell"><div class="loc-cell-label">元</div><div class="loc-cell-val">第${loc.yuanIndex + 1}元</div></div>
            <div class="loc-cell highlight"><div class="loc-cell-label">會</div><div class="loc-cell-val">${HUI[loc.huiIndex]}會<br><small>第${loc.huiIndex + 1}會</small></div></div>
            <div class="loc-cell highlight"><div class="loc-cell-label">運</div><div class="loc-cell-val">第${loc.yunInHui + 1}運<br><small>全元第${loc.yunAbs + 1}運</small></div></div>
            <div class="loc-cell"><div class="loc-cell-label">世</div><div class="loc-cell-val">第${loc.shiInYun + 1}世</div></div>
            <div class="loc-cell"><div class="loc-cell-label">年</div><div class="loc-cell-val">世中第${loc.yearInShi + 1}年</div></div>
          </div>
          <div class="loc-hex-row">
            <div class="loc-hex-svg">${miniHex(hex.lines)}</div>
            <div class="loc-hex-info">
              <div class="loc-hex-label">值年卦</div>
              <div class="loc-hex-name">${hex.name}</div>
              <div class="loc-hex-judge">${hex.judgment}</div>
            </div>
          </div>
          <div class="loc-meta">距一元之初 ${total} 年 · ${bc(year)}</div>
        </div>
      </div>`;
  }

  btn.addEventListener('click', update);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') update(); });
  container.querySelectorAll('.loc-preset').forEach((b) => {
    b.addEventListener('click', () => {
      input.value = b.dataset.y;
      update();
    });
  });
  update();
}
