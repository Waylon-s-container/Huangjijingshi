// 声音唱和拼合器：天声(韵母系统)×地音(声母系统)交叉拼合。
// 交互：点天声选韵，点地音选声，交叉格高亮并显示拼合结果。
// 数据依《声音唱和图》简化框架：天声按平上去入×辟翕，地音按开发收闭×清浊。
// 注：此为示意性拼合器，非严格音韵学还原。

// 天声（10类，简化为 平上去入×辟翕 展示）
const TIAN = [
  { id: 't1', cat: '平', type: '辟', ex: '宮商' },
  { id: 't2', cat: '平', type: '翕', ex: '角徵' },
  { id: 't3', cat: '上', type: '辟', ex: '古今' },
  { id: 't4', cat: '上', type: '翕', ex: '坤乾' },
  { id: 't5', cat: '去', type: '辟', ex: '萬化' },
  { id: 't6', cat: '去', type: '翕', ex: '物事' },
  { id: 't7', cat: '入', type: '辟', ex: '日月' },
  { id: 't8', cat: '入', type: '翕', ex: '色聲' },
];

// 地音（12类，简化为 开发收闭×清浊 展示8个）
const DI = [
  { id: 'd1', cat: '開', voice: '清', ex: '見溪' },
  { id: 'd2', cat: '開', voice: '濁', ex: '群疑' },
  { id: 'd3', cat: '發', voice: '清', ex: '端透' },
  { id: 'd4', cat: '發', voice: '濁', ex: '定泥' },
  { id: 'd5', cat: '收', voice: '清', ex: '幫滂' },
  { id: 'd6', cat: '收', voice: '濁', ex: '並明' },
  { id: 'd7', cat: '閉', voice: '清', ex: '精清' },
  { id: 'd8', cat: '閉', voice: '濁', ex: '從心' },
];

export function renderShengHe(container) {
  let selTian = TIAN[0];
  let selDi = DI[0];

  function render() {
    // 表格：行=天声，列=地音
    const head = '<div class="sh-cell sh-corner">天聲╲地音</div>' +
      DI.map(d => `<div class="sh-cell sh-head-di" data-di="${d.id}">${d.cat}<small>${d.voice}</small></div>`).join('');
    const rows = TIAN.map(t => {
      const cells = DI.map(d => {
        const sel = (t.id === selTian.id || d.id === selDi.id);
        const cross = (t.id === selTian.id && d.id === selDi.id);
        return `<div class="sh-cell ${cross ? 'cross' : ''} ${sel ? 'selected' : ''}" data-tian="${t.id}" data-di="${d.id}">${cross ? '◉' : '○'}</div>`;
      }).join('');
      return `<div class="sh-cell sh-head-tian" data-tian="${t.id}">${t.cat}<small>${t.type}</small></div>${cells}`;
    }).join('');

    container.innerHTML = `
      <div class="sh-box">
        <div class="sh-explain">邵雍以天聲（韻）與地音（聲）唱和拼合。點選天聲行或地音列，交叉格顯示拼合。</div>
        <div class="sh-grid" style="grid-template-columns: 70px repeat(${DI.length}, 1fr);">
          ${head}${rows}
        </div>
        <div class="sh-result" id="sh-result"></div>
      </div>`;

    const resultEl = container.querySelector('#sh-result');
    resultEl.innerHTML = `
      <div class="sh-result-row">
        <span class="sh-label">所選天聲</span>
        <span class="sh-val">${selTian.cat}${selTian.type}（${selTian.ex}）</span>
      </div>
      <div class="sh-result-row">
        <span class="sh-label">所選地音</span>
        <span class="sh-val">${selDi.cat}${selDi.voice}（${selDi.ex}）</span>
      </div>
      <div class="sh-result-row sh-cross">
        <span class="sh-label">唱和</span>
        <span class="sh-val">天聲 ${selTian.ex} 唱 · 地音 ${selDi.ex} 和</span>
      </div>
      <div class="sh-note">註：此為示意性拼合器，展示「唱和」之結構關係，非嚴格音韻還原。</div>`;

    // 点击单元格：选择对应天声+地音
    container.querySelectorAll('.sh-cell[data-tian][data-di]').forEach(cell => {
      cell.addEventListener('click', () => {
        const tid = cell.dataset.tian;
        const did = cell.dataset.di;
        selTian = TIAN.find(t => t.id === tid);
        selDi = DI.find(d => d.id === did);
        render();
      });
    });
    // 点击行头：只选天声
    container.querySelectorAll('.sh-head-tian').forEach(cell => {
      cell.addEventListener('click', () => {
        selTian = TIAN.find(t => t.id === cell.dataset.tian);
        render();
      });
    });
    // 点击列头：只选地音
    container.querySelectorAll('.sh-head-di').forEach(cell => {
      cell.addEventListener('click', () => {
        selDi = DI.find(d => d.id === cell.dataset.di);
        render();
      });
    });
  }

  render();
}
