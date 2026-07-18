// 应用入口：初始化各模块 + 绑定状态驱动的中栏卦辞/右栏信息表/页脚
import { initHexagramMap } from './render/hexagramMap.js';
import { initAnchor } from './render/anchor.js';
import { initTimeScrubber } from './ui/timeScrubber.js';
import { locate, valueYearHexagram, EPOCH_YEAR, YAO_YEAR } from './data/calendar.js';
import { HEXAGRAMS } from './data/hexagrams.js';
import { subscribe, getState } from './store.js';
import { t } from './i18n.js';

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
      <div class="label">${t('值年卦')} · ${year}</div>
      <div class="hex-display">
        ${gongbiSvg(yearHex.lines)}
        <div>
          <div class="hex-name">${t(yearHex.name)}</div>
        </div>
      </div>
    </div>`;

  // 元会运世信息表
  infoTableEl.innerHTML = `
    <tr><th>${t('會')}</th><td>${t(HUI_NAMES[loc.huiIndex] + '會')}（${t('第')}${loc.huiIndex + 1}${t('會')}）</td></tr>
    <tr><th>${t('運')}</th><td>${t('會內第')}${loc.yunInHui + 1}${t('運')}（${t('全元第')}${loc.yunAbs + 1}${t('運')}）</td></tr>
    <tr><th>${t('世')}</th><td>${t('運內第')}${loc.shiInYun + 1}${t('世')}</td></tr>
    <tr><th>${t('世中年')}</th><td>${t('第')}${loc.yearInShi + 1}${t('年')}</td></tr>
    <tr class="highlight"><th>${t('所閱卦')}</th><td>${t(displayHex.name)}</td></tr>
  `;
}

// 中栏：竖排卦辞（选中卦时显示）
function renderText() {
  const { selectedHexagram } = getState();
  if (!selectedHexagram) {
    textPanelEl.className = 'text-empty';
    textPanelEl.innerHTML = t('點擊圓圖中的卦象<br>以閱其辭');
    return;
  }
  textPanelEl.className = 'vertical-text';
  // 竖排：卦名（大字）+ 卦辞
  textPanelEl.innerHTML = `<span class="hex-name-big">${t(selectedHexagram.name)}</span>　${t(selectedHexagram.judgment)}`;
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
    t(`${HUI_NAMES[loc.huiIndex]}會 · 第${loc.yunInHui + 1}運 · 第${loc.shiInYun + 1}世（${year}年）`);
});
renderInfo();
renderText();

// 页脚透明声明（设计 §4.5）
function setFooterNote() {
  // 经 i18n.t 包装以支持简繁切换
  noteEl.textContent = t(`起算：一元之初（前${-EPOCH_YEAR}）· 人事紀年自堯元年（前${-YAO_YEAR}）· 配卦法：去四正卦六十甲子基準外推法`);
}
setFooterNote();

// ===== 路由集成：封面 ↔ 教材 =====
import { start, navigate } from './router.js';
import { renderChapterView } from './book/index.js';
import { initI18n, toggleLang, getLang } from './i18n.js';

const coverView = document.getElementById('cover-view');
const bookView = document.getElementById('book-view');

let currentView = 'cover';   // 'cover' | 'book'
let currentChapter = null;

function showCover() {
  currentView = 'cover';
  coverView.hidden = false;
  bookView.hidden = true;
}
function showBook(chapterId) {
  currentView = 'book';
  currentChapter = chapterId;
  coverView.hidden = true;
  bookView.hidden = false;
  renderChapterView(bookView, chapterId);
  window.scrollTo(0, 0);
}

// ===== 简繁切换 =====
function refreshLangButton() {
  // 按钮显示"对端"语言：繁体模式显示"簡"，简体模式显示"繁"
  const label = getLang() === 'hant' ? '簡' : '繁';
  document.querySelectorAll('[data-lang-toggle], #lang-toggle-cover').forEach(btn => {
    btn.textContent = label;
  });
}

function handleToggle() {
  toggleLang();
  refreshLangButton();
  setFooterNote();
  // 重渲染当前视图
  if (currentView === 'book' && currentChapter) {
    renderChapterView(bookView, currentChapter);
  } else {
    // 封面：手动重渲染受 lang 影响的部分
    renderInfo();
    renderText();
    applyCoverI18n();
  }
}

// 封面固定文本（带 data-i18n 属性）的简繁转换
function applyCoverI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    // 首次记录原文（繁体），后续基于原文转换
    if (!el.dataset.i18nOrig) el.dataset.i18nOrig = el.innerHTML;
    el.innerHTML = t(el.dataset.i18nOrig);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    if (!el.dataset.i18nTitleOrig) el.dataset.i18nTitleOrig = el.getAttribute('title');
    el.setAttribute('title', t(el.dataset.i18nTitleOrig));
  });
}
applyCoverI18n();

// 绑定切换按钮（封面那个 + 教材内动态生成的都用事件委托）
document.getElementById('lang-toggle-cover').addEventListener('click', handleToggle);
document.addEventListener('click', (e) => {
  if (e.target.matches('[data-lang-toggle]')) handleToggle();
});

// 初始化 i18n（异步加载 OpenCC）后刷新按钮
initI18n().then(() => {
  refreshLangButton();
  // OpenCC 就绪后，若用户此前已切到简体但当时未就绪，补一次渲染
  if (getLang() === 'hans' && currentView === 'book' && currentChapter) {
    renderChapterView(bookView, currentChapter);
    setFooterNote();
  }
});

// 路由表
start({
  '/': showCover,
  '/book': () => { navigate('/book/intro'); },
  '/book/intro': () => showBook('intro'),
  '/book/ch1': () => showBook('ch1'),
  '/book/ch2': () => showBook('ch2'),
  '/book/ch3': () => showBook('ch3'),
  '/book/chshu': () => showBook('chshu'),
  '/book/chguan': () => showBook('chguan'),
  '/book/chnian': () => showBook('chnian'),
  '/book/chsheng': () => showBook('chsheng'),
  '/book/ch4': () => showBook('ch4'),
  '/book/appendix': () => showBook('appendix'),
  '*': () => showBook('intro'), // 兜底：后续章节等回导言（draft 章节会显示"待续"）
});
