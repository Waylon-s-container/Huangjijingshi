// 三才框架对应图：天道/人道/物道三列对应。
// 交互：悬停某行高亮三列对应项；点击某项显示对应原典句。
const ROWS = [
  {
    tian: { term: '陰陽剛柔', quote: '天之四象，陰陽剛柔也。', cite: '《觀物內篇》' },
    ren:  { term: '仁義禮智', quote: '人之四德，仁義禮智，應乎天也。', cite: '《觀物內篇》' },
    wu:   { term: '萬物之理', quote: '物物各有其理。', cite: '《觀物內篇》（編者撮述）' },
  },
  {
    tian: { term: '春夏秋冬', quote: '天有四時，春夏秋冬。', cite: '《觀物內篇》' },
    ren:  { term: '聖人體之', quote: '聖人體天德以立人極。', cite: '《觀物內篇》（編者撮述）' },
    wu:   { term: '各正性命', quote: '各正性命，保合太和。', cite: '《周易·乾彖》' },
  },
  {
    tian: { term: '元亨利貞', quote: '天有四德，元亨利貞。', cite: '《觀物內篇》' },
    ren:  { term: '善化天下', quote: '善化天下者，止於盡道而已。', cite: '《觀物內篇》' },
    wu:   { term: '生生不息', quote: '天地之大德曰生。', cite: '《周易·繫辭》' },
  },
];

export function renderSanCai(container) {
  container.innerHTML = `
    <div class="sancai-box">
      <div class="sancai-head">
        <div class="sancai-col-title tian">天道</div>
        <div class="sancai-col-title ren">人道</div>
        <div class="sancai-col-title wu">物道</div>
      </div>
      <div class="sancai-body">
        ${ROWS.map((r, i) => `
          <div class="sancai-row" data-row="${i}">
            <div class="sancai-cell tian" data-col="tian">${r.tian.term}</div>
            <div class="sancai-cell ren" data-col="ren">${r.ren.term}</div>
            <div class="sancai-cell wu" data-col="wu">${r.wu.term}</div>
          </div>`).join('')}
      </div>
      <div class="sancai-quote" id="sancai-quote">懸停某行觀其對應 · 點擊某項閱其原典</div>
    </div>`;

  const quoteEl = container.querySelector('#sancai-quote');

  // 行悬停：整行高亮
  container.querySelectorAll('.sancai-row').forEach(row => {
    row.addEventListener('mouseenter', () => {
      row.classList.add('hover');
    });
    row.addEventListener('mouseleave', () => {
      row.classList.remove('hover');
    });
  });

  // 单元格点击：显示对应原典
  container.querySelectorAll('.sancai-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      const rowIdx = parseInt(cell.parentElement.dataset.row, 10);
      const col = cell.dataset.col;
      const item = ROWS[rowIdx][col];
      const colName = { tian: '天道', ren: '人道', wu: '物道' }[col];
      quoteEl.innerHTML = `<span class="scq-term">「${item.term}」</span>（${colName}）<br><span class="scq-quote">${item.quote}</span><br><span class="scq-cite">— ${item.cite}</span>`;
    });
  });
}
