// 教材渲染：左侧目录 + 右侧正文 + 五段式小节。
// 纯渲染，不直接持有内容数据（由调用方传入章节对象）。
// 所有文本输出经 t() 包装以支持简繁切换。
import { CHAPTERS, getNext, getPrev } from './chapters.js';
import { t, getLang } from '../i18n.js';

// ===== 阅读字号管理 =====
// 3 档：小 14 / 中 15（默认） / 大 17
const FONT_SIZES = [14, 15, 17];
const FONT_KEY = 'hjjss-font-size';
let fontIndex = loadFontIndex();

function loadFontIndex() {
  if (typeof localStorage === 'undefined') return 1;
  const stored = parseInt(localStorage.getItem(FONT_KEY), 10);
  return Number.isFinite(stored) && stored >= 0 && stored < FONT_SIZES.length ? stored : 1;
}
function applyFontSize(container) {
  const content = container.querySelector('.book-content');
  if (content) content.style.setProperty('--book-fs', FONT_SIZES[fontIndex] + 'px');
  const btns = container.querySelectorAll('.font-btn');
  btns.forEach(b => b.disabled = false);
  const dec = container.querySelector('.font-dec');
  const inc = container.querySelector('.font-inc');
  if (dec) dec.disabled = fontIndex === 0;
  if (inc) inc.disabled = fontIndex === FONT_SIZES.length - 1;
}

// 渲染整个教材视图到 container。chapter=当前章节内容对象
export function renderBook(container, chapter) {
  container.innerHTML = `
    <div class="book-layout">
      <main class="book-main">
        <header class="book-topbar">
          <div class="topbar-left">
            <button class="toc-toggle" id="toc-toggle" title="${t('目錄')}" aria-label="${t('目錄')}" aria-expanded="false" aria-controls="toc-drawer">${t('目')}</button>
            <a class="back-cover" href="#/">⟵ ${t('返回封面')}</a>
          </div>
          <span class="chapter-progress">${t(chapter.title)}</span>
          <div class="topbar-right">
            <div class="font-size-ctrl" role="group" aria-label="${t('字號')}">
              <button class="font-btn font-dec" title="${t('縮小字號')}" aria-label="${t('縮小字號')}">A⁻</button>
              <button class="font-btn font-inc" title="${t('放大字號')}" aria-label="${t('放大字號')}">A⁺</button>
            </div>
            <button class="lang-toggle" data-lang-toggle title="${t('切換簡繁')}">${getLang() === 'hant' ? '簡' : '繁'}</button>
          </div>
        </header>
        <div class="book-body">
          <article class="book-content"><div class="book-content-inner">${renderChapter(chapter)}</div></article>
          <aside class="book-aside" id="book-aside">${renderAside(chapter)}</aside>
        </div>
        <nav class="chapter-nav">${renderChapterNav(chapter.id)}</nav>
      </main>
      <div class="toc-drawer" id="toc-drawer" hidden>${renderToc(chapter.id)}</div>
      <div class="toc-overlay" id="toc-overlay" hidden></div>
    </div>`;
  bindTocDrawer(container);
  bindFontButtons(container);
  applyFontSize(container);
  bindScrollSpy(container);
}

function bindFontButtons(container) {
  const dec = container.querySelector('.font-dec');
  const inc = container.querySelector('.font-inc');
  if (dec) dec.addEventListener('click', () => {
    if (fontIndex > 0) { fontIndex--; saveAndApply(container); }
  });
  if (inc) inc.addEventListener('click', () => {
    if (fontIndex < FONT_SIZES.length - 1) { fontIndex++; saveAndApply(container); }
  });
}
function saveAndApply(container) {
  try { localStorage.setItem(FONT_KEY, String(fontIndex)); } catch (e) { /* ignore */ }
  applyFontSize(container);
}

// 目录
function renderToc(currentId) {
  const items = CHAPTERS.map(c => {
    const cls = c.id === currentId ? 'toc-item active' : 'toc-item';
    const draftCls = c.draft ? ' draft' : '';
    return `<a class="${cls}${draftCls}" href="#/book/${c.id}"${c.draft ? ' aria-disabled="true"' : ''}>${t(c.title)}</a>`;
  }).join('');
  return `<div class="toc-title">${t('目錄')}</div>${items}`;
}

// 绑定抽屉的开关逻辑（一次性绑定，避免章节切换时重复）
function bindTocDrawer(container) {
  const btn = container.querySelector('#toc-toggle');
  const drawer = container.querySelector('#toc-drawer');
  const overlay = container.querySelector('#toc-overlay');
  if (!btn || !drawer || !overlay) return;

  const open = () => {
    drawer.hidden = false;
    overlay.hidden = false;
    // 强制 reflow 后再加 class，触发 transition
    void drawer.offsetWidth;
    drawer.classList.add('open');
    overlay.classList.add('show');
    btn.setAttribute('aria-expanded', 'true');
    setTimeout(() => drawer.querySelector('.toc-item.active')?.focus(), 60);
  };
  const close = () => {
    drawer.classList.remove('open');
    overlay.classList.remove('show');
    btn.setAttribute('aria-expanded', 'false');
    // 等动画结束再隐藏
    setTimeout(() => {
      if (!drawer.classList.contains('open')) drawer.hidden = true;
      if (!overlay.classList.contains('show')) overlay.hidden = true;
    }, 260);
  };
  const toggle = () => drawer.classList.contains('open') ? close() : open();

  btn.addEventListener('click', toggle);
  overlay.addEventListener('click', close);
  // 点击目录项后自动收起
  drawer.addEventListener('click', (e) => {
    if (e.target.matches('.toc-item:not(.draft)')) close();
  });
  // Esc 关闭
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      close();
      btn.focus();
    }
  });
}

// 右侧辅助面板：本章节子目录（点击跳转 + scrollspy）
function renderAside(chapter) {
  // 附录无 sections，显示原典索引快链（跳到附录）
  if (chapter.layout === 'appendix' || !chapter.sections?.length) {
    return `
      <div class="aside-block">
        <div class="aside-title">${t('本章無小節')}</div>
        <div class="aside-hint">${t('附錄為索引結構，可點目錄中各章查閱。')}</div>
      </div>`;
  }
  const items = chapter.sections.map(s =>
    `<a class="aside-item" href="#sec-${s.id}" data-sec-id="${s.id}"><span class="aside-num">${s.id}</span><span class="aside-text">${t(s.title)}</span></a>`
  ).join('');
  return `
    <div class="aside-block">
      <div class="aside-title">${t('本文章節')}</div>
      <nav class="aside-list">${items}</nav>
    </div>`;
}

// scrollspy：滚动时高亮右侧当前可见小节
function bindScrollSpy(container) {
  const aside = container.querySelector('#book-aside');
  if (!aside) return;
  const items = Array.from(aside.querySelectorAll('.aside-item'));
  if (!items.length) return;

  // 平滑滚动到锚点
  aside.addEventListener('click', (e) => {
    const link = e.target.closest('.aside-item');
    if (!link) return;
    e.preventDefault();
    // href="#sec-0.2"，但 section id 含 '.'，querySelector 不合法，必须用 getElementById
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      // sticky topbar 高 ~48px，预留 16px 视觉缓冲
      const top = target.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });

  // IntersectionObserver 监听各 section 进入视口
  const sections = items
    .map(it => {
      const id = it.getAttribute('href').slice(1);
      return document.getElementById(id);
    })
    .filter(Boolean);
  if (!sections.length) return;

  const visible = new Set();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) visible.add(en.target.id);
      else visible.delete(en.target.id);
    });
    // 取可见中第一个按 DOM 顺序的 section 高亮
    const firstVisible = sections.find(s => visible.has(s.id));
    items.forEach(it => {
      const isActive = firstVisible && it.getAttribute('href') === '#' + firstVisible.id;
      it.classList.toggle('active', isActive);
    });
  }, { rootMargin: '-64px 0px -70% 0px', threshold: [0, 0.1, 0.5] });

  sections.forEach(s => observer.observe(s));
}

// 章节正文：标题 + 各小节（五段式）；附录用专门的 blocks 渲染
function renderChapter(chapter) {
  if (chapter.layout === 'appendix') {
    const blocks = (chapter.blocks || []).map(renderBlock).join('');
    return `<h1 class="chapter-title">${t(chapter.title)}</h1>${blocks}`;
  }
  const sections = (chapter.sections || [])
    .map(s => renderSection(s))
    .join('');
  return `<h1 class="chapter-title">${t(chapter.title)}</h1>${sections}`;
}

// 附录块渲染
function renderBlock(block) {
  switch (block.type) {
    case 'section_title':
      return `<h2 class="section-title appx-section">${t(block.title)}</h2>`;
    case 'paragraph':
      return `<p class="seg appx-para">${t(block.text)}</p>`;
    case 'list':
      return '<ul class="appx-list">' +
        block.items.map(it =>
          `<li><span class="appx-term">${t(it.term)}</span><span class="appx-desc">${t(it.desc)}</span></li>`
        ).join('') + '</ul>';
    case 'sources':
      return `<h3 class="appx-sub">${t(block.title)}</h3><ul class="appx-sources">` +
        block.items.map(s =>
          `<li><span class="appx-term">${t(s.name)}</span>` +
          `${s.url ? `<a class="appx-url" href="${s.url}" target="_blank" rel="noopener">${s.url}</a>` : ''}` +
          `${s.note ? `<span class="appx-desc">　${t(s.note)}</span>` : ''}</li>`
        ).join('') + '</ul>';
    default:
      return '';
  }
}

// 五段式小节渲染
function renderSection(section) {
  return `
    <section class="book-section" id="sec-${section.id}">
      <h2 class="section-title">${section.id} ${t(section.title)}</h2>
      <div class="seg intro">${t(section.intro || '')}</div>
      ${section.source ? renderSource(section.source) : ''}
      ${section.commentaries ? renderCommentaries(section.commentaries) : ''}
      ${section.diagram ? `<div class="seg diagram" data-diagram="${section.diagram}"></div>` : ''}
      ${section.summary ? `<div class="seg summary"><span class="seg-label">${t('要點')}</span>${t(section.summary)}</div>` : ''}
    </section>`;
}

function renderSource(src) {
  return `
    <div class="seg source">
      <div class="seg-label">${t('原典')}</div>
      <blockquote class="source-quote">${t(src.text)}</blockquote>
      <div class="source-cite">— ${t(src.citation)}</div>
    </div>`;
}

function renderCommentaries(list) {
  const items = list.map(c =>
    `<div class="comm-item"><span class="comm-author">${t(c.author)}</span>` +
    `${c.work ? `<span class="comm-work">《${t(c.work)}》</span>` : ''}` +
    `<span class="comm-colon">：</span><span class="comm-text">${t(c.text)}</span></div>`
  ).join('');
  return `<div class="seg commentaries"><div class="seg-label">${t('注疏')}</div>${items}</div>`;
}

// 章末导航：上一章/下一章
function renderChapterNav(currentId) {
  const prev = getPrev(currentId);
  const next = getNext(currentId);
  const prevHtml = prev
    ? `<a class="nav-prev" href="#/book/${prev.id}">⟵ ${t(prev.title)}</a>`
    : '<span></span>';
  const nextHtml = next
    ? (next.draft
        ? `<span class="nav-next disabled">${t(next.title)}（${t('待續')}）⟶</span>`
        : `<a class="nav-next" href="#/book/${next.id}">${t(next.title)} ⟶</a>`)
    : '<span></span>';
  return prevHtml + nextHtml;
}
