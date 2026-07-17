// 交互式时间定位器：输入年份，动态显示该年在元会运世中的位置 + 值年卦。
// 复用 calendar.js 的 locate() 与 valueYearHexagram()。
import { locate, valueYearHexagram, EPOCH_YEAR, YAO_YEAR } from '../../data/calendar.js';
import { HEXAGRAMS } from '../../data/hexagrams.js';

const HUI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 迷你工笔卦象
function miniHex(lines) {
  let r = '';
  for (let i = 5; i >= 0; i--) {
    const yang = lines[i] === '1';
    const y = 4 + (5 - i) * 7;
    if (yang) r += `<rect x="4" y="${y}" width="32" height="4" fill="#1a1410"/>`;
    else { r += `<rect x="4" y="${y}" width="13" height="4" fill="#1a1410"/>`; r += `<rect x="23" y="${y}" width="13" height="4" fill="#1a1410"/>`; }
  }
  return `<svg viewBox="0 0 40 46" width="40" height="46">${r}</svg>`;
}

export function renderTimeLocator(container) {
  container.innerHTML = `
    <div class="locator-box">
      <div class="locator-input-row">
        <label class="locator-label">輸入年份</label>
        <input type="number" class="locator-input" id="loc-year" value="2026" step="1">
        <button class="locator-btn" id="loc-btn">定位</button>
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
    const bc = (y) => y <= 0 ? '公元前' + (-y) + '年' : '公元' + y + '年';
    const total = loc.yuanIndex * 129600 + loc.huiIndex * 10800 + loc.yunInHui * 360 + loc.shiInYun * 30 + loc.yearInShi;
    result.innerHTML = `
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
          <div class="loc-hex-name">${hex.name}</div>
          <div class="loc-hex-judge">${hex.judgment.slice(0, 24)}…</div>
        </div>
      </div>
      <div class="loc-meta">距一元之初 ${total} 年 · 對應 ${bc(year)}</div>`;
  }

  btn.addEventListener('click', update);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') update(); });
  update(); // 初始显示2026
}
