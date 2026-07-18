// 应用入口：初始化各模块 + 绑定状态驱动的中栏卦辞/右栏信息表/页脚
import { initHexagramMap } from './render/hexagramMap.js';
import { initAnchor } from './render/anchor.js';
import { initTimeScrubber } from './ui/timeScrubber.js';
import { locate, valueYearHexagram, EPOCH_YEAR, YAO_YEAR } from './data/calendar.js';
import { HEXAGRAMS } from './data/hexagrams.js';
import { subscribe, getState } from './store.js';

const HUI_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const MAP_SIZE = 600;

const canvas = document.getElementById('hex-map');
const anchorSvg = document.getElementById('anchor-layer');
const scrubberEl = document.getElementById('time-scrubber');
const detailEl = document.getElementById('detail-panel');
const textPanelEl = document.getElementById('text-panel');
const infoTableEl = document.getElementById('info-table');
const locatorEl = document.getElementById('era-locator');
const noteEl = document.getElementById('footer-note');

initHexagramMap(canvas);
initAnchor(anchorSvg, MAP_SIZE, MAP_SIZE);
initTimeScrubber(scrubberEl, [YAO_YEAR, 2100]);

// 右栏：值年卦卡片 + 元会运世信息表（随 year 变化）
function renderInfo() {
  const { year, selectedHexagram } = getState();
  const loc = locate(year);
  const yearHex = valueYearHexagram(year);
  // 显示的卦：优先用户选中的，否则当前值年卦
  const displayHex = selectedHexagram || yearHex;

  // 顶部值年卦卡片
  detailEl.innerHTML = `
    <div class="info-card">
      <div class="label">值年卦 · ${year}</div>
      <div class="hex-display">
        ${gongbiSvg(yearHex.lines)}
        <div>
          <div class="hex-name">${yearHex.name}</div>
        </div>
      </div>
    </div>`;

  // 元会运世信息表
  infoTableEl.innerHTML = `
    <tr><th>會</th><td>${HUI_NAMES[loc.huiIndex]}會（第${loc.huiIndex + 1}會）</td></tr>
    <tr><th>運</th><td>會內第${loc.yunInHui + 1}運（全元第${loc.yunAbs + 1}運）</td></tr>
    <tr><th>世</th><td>運內第${loc.shiInYun + 1}世</td></tr>
    <tr><th>世中年</th><td>第${loc.yearInShi + 1}年</td></tr>
    <tr class="highlight"><th>所閱卦</th><td>${displayHex.name}</td></tr>
  `;
}

// 中栏：竖排卦辞（选中卦时显示）
function renderText() {
  const { selectedHexagram } = getState();
  if (!selectedHexagram) {
    textPanelEl.className = 'text-empty';
    textPanelEl.innerHTML = '點擊圓圖中的卦象<br>以閱其辭';
    return;
  }
  textPanelEl.className = 'vertical-text';
  // 竖排：卦名（大字）+ 卦辞
  textPanelEl.innerHTML = `<span class="hex-name-big">${selectedHexagram.name}</span>　${selectedHexagram.judgment}`;
}

// 工笔规整卦象 SVG（用于右栏卡片）— 圆角爻、阴爻留白更清晰
function gongbiSvg(lines) {
  let yao = '';
  for (let i = 5; i >= 0; i--) {
    const yang = lines[i] === '1';
    const y = 5 + (5 - i) * 9.2;
    if (yang) {
      yao += `<rect x="6" y="${y}" width="44" height="5" rx="1" fill="#1a1410"/>`;
    } else {
      yao += `<rect x="6" y="${y}" width="17" height="5" rx="1" fill="#1a1410"/>`;
      yao += `<rect x="33" y="${y}" width="17" height="5" rx="1" fill="#1a1410"/>`;
    }
  }
  return `<svg viewBox="0 0 56 60" class="dp-svg">${yao}</svg>`;
}

subscribe(() => {
  renderInfo();
  renderText();
  const { year } = getState();
  const loc = locate(year);
  locatorEl.textContent =
    `${HUI_NAMES[loc.huiIndex]}會 · 第${loc.yunInHui + 1}運 · 第${loc.shiInYun + 1}世（${year}年）`;
});
renderInfo();
renderText();

// 页脚透明声明（设计 §4.5）
noteEl.textContent =
  `起算：一元之初（前${-EPOCH_YEAR}）· 人事紀年自堯元年（前${-YAO_YEAR}）· 配卦法：去四正卦六十甲子基準外推法`;

// ===== 路由集成：封面 ↔ 教材 =====
import { start, navigate } from './router.js';
import { renderChapterView } from './book/index.js';

const coverView = document.getElementById('cover-view');
const bookView = document.getElementById('book-view');

function showCover() {
  coverView.hidden = false;
  bookView.hidden = true;
}
function showBook(chapterId) {
  coverView.hidden = true;
  bookView.hidden = false;
  renderChapterView(bookView, chapterId);
  window.scrollTo(0, 0);
}

// 路由表
start({
  '/': showCover,
  '/book': () => { navigate('/book/intro'); },
  '/book/intro': () => showBook('intro'),
  '/book/ch1': () => showBook('ch1'),
  '/book/ch2': () => showBook('ch2'),
  '/book/ch3': () => showBook('ch3'),
  '/book/chguan': () => showBook('chguan'),
  '/book/chnian': () => showBook('chnian'),
  '/book/chsheng': () => showBook('chsheng'),
  '/book/ch4': () => showBook('ch4'),
  '/book/appendix': () => showBook('appendix'),
  '*': () => showBook('intro'), // 兜底：后续章节等回导言（draft 章节会显示"待续"）
});
