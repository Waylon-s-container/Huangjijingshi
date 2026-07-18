// 元会运世层级钻取器：点击元→展开12会，点会→展开30运，点运→展开12世。
// 当前年(2026)自动定位+朱砂高亮。复用 calendar.js 的 locate()。
import { locate } from '../../data/calendar.js';

const HUI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const cur = locate(2026);

export function renderEraDrill(container) {
  // 状态：展开的会索引、展开的运索引
  let state = { openHui: cur.huiIndex, openYun: cur.yunInHui };

  function render() {
    container.innerHTML = `
      <div class="drill-box">
        <div class="drill-row drill-yuan">
          <span class="drill-label">元</span>
          <span class="drill-val">第${cur.yuanIndex + 1}元（129600年）</span>
        </div>
        <div class="drill-grid drill-hui-grid">
          ${HUI.map((h, i) => {
            const open = i === state.openHui;
            const isCur = i === cur.huiIndex;
            return `<button class="drill-cell ${open ? 'open' : ''} ${isCur ? 'current' : ''}" data-hui="${i}">${h}會</button>`;
          }).join('')}
        </div>
        <div class="drill-expand" id="drill-yun-area"></div>
      </div>`;

    renderYunArea(container.querySelector('#drill-yun-area'));

    // 绑定会点击
    container.querySelectorAll('[data-hui]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.hui, 10);
        state.openHui = state.openHui === i ? -1 : i;
        state.openYun = (i === cur.huiIndex) ? cur.yunInHui : 0;
        render();
      });
    });
  }

  function renderYunArea(area) {
    if (state.openHui < 0) { area.innerHTML = ''; return; }
    // 该会的30运
    const yunCells = Array.from({ length: 30 }, (_, y) => {
      const open = y === state.openYun;
      const isCur = state.openHui === cur.huiIndex && y === cur.yunInHui;
      const yunAbs = state.openHui * 30 + y;
      return `<button class="drill-cell-sm ${open ? 'open' : ''} ${isCur ? 'current' : ''}" data-yun="${y}">運${y + 1}</button>`;
    }).join('');

    area.innerHTML = `
      <div class="drill-sublabel">${HUI[state.openHui]}會 30運（每運360年）· 全元第${state.openHui * 30 + 1}-${state.openHui * 30 + 30}運</div>
      <div class="drill-grid-sm">${yunCells}</div>
      <div id="drill-shi-area"></div>`;

    renderShiArea(area.querySelector('#drill-shi-area'));

    area.querySelectorAll('[data-yun]').forEach(btn => {
      btn.addEventListener('click', () => {
        const y = parseInt(btn.dataset.yun, 10);
        state.openYun = state.openYun === y ? -1 : y;
        renderYunArea(area);
        bindYun(area);
      });
    });
  }

  function bindYun(area) {
    renderShiArea(area.querySelector('#drill-shi-area'));
  }

  function renderShiArea(area) {
    if (!area || state.openYun < 0) { if (area) area.innerHTML = ''; return; }
    // 该运的12世
    const shiCells = Array.from({ length: 12 }, (_, s) => {
      const isCur = state.openHui === cur.huiIndex && state.openYun === cur.yunInHui && s === cur.shiInYun;
      return `<span class="drill-cell-sm ${isCur ? 'current' : ''}">世${s + 1}</span>`;
    }).join('');
    const yunAbs = state.openHui * 30 + state.openYun + 1;
    area.innerHTML = `
      <div class="drill-sublabel">運內12世（每世30年）· 全元第${yunAbs}運</div>
      <div class="drill-grid-sm">${shiCells}</div>`;
  }

  render();
}
