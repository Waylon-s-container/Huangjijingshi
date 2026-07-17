// 教材渲染：左侧目录 + 右侧正文 + 五段式小节。
// 纯渲染，不直接持有内容数据（由调用方传入章节对象）。
import { CHAPTERS, getNext, getPrev } from './chapters.js';

// 渲染整个教材视图到 container。chapter=当前章节内容对象
export function renderBook(container, chapter) {
  container.innerHTML = `
    <div class="book-layout">
      <aside class="book-toc">${renderToc(chapter.id)}</aside>
      <main class="book-main">
        <header class="book-topbar">
          <a class="back-cover" href="#/">⟵ 返回封面</a>
          <span class="chapter-progress">${chapter.title}</span>
        </header>
        <article class="book-content">${renderChapter(chapter)}</article>
        <nav class="chapter-nav">${renderChapterNav(chapter.id)}</nav>
      </main>
    </div>`;
}

// 目录
function renderToc(currentId) {
  const items = CHAPTERS.map(c => {
    const cls = c.id === currentId ? 'toc-item active' : 'toc-item';
    const draftCls = c.draft ? ' draft' : '';
    return `<a class="${cls}${draftCls}" href="#/book/${c.id}"${c.draft ? ' aria-disabled="true"' : ''}>${c.title}</a>`;
  }).join('');
  return `<div class="toc-title">目錄</div>${items}`;
}

// 章节正文：标题 + 各小节（五段式）
function renderChapter(chapter) {
  const sections = (chapter.sections || [])
    .map(s => renderSection(s))
    .join('');
  return `<h1 class="chapter-title">${chapter.title}</h1>${sections}`;
}

// 五段式小节渲染
function renderSection(section) {
  return `
    <section class="book-section" id="sec-${section.id}">
      <h2 class="section-title">${section.id} ${section.title}</h2>
      <div class="seg intro">${section.intro || ''}</div>
      ${section.source ? renderSource(section.source) : ''}
      ${section.commentaries ? renderCommentaries(section.commentaries) : ''}
      ${section.diagram ? `<div class="seg diagram" data-diagram="${section.diagram}"></div>` : ''}
      ${section.summary ? `<div class="seg summary"><span class="seg-label">要點</span>${section.summary}</div>` : ''}
    </section>`;
}

function renderSource(src) {
  return `
    <div class="seg source">
      <div class="seg-label">原典</div>
      <blockquote class="source-quote">${src.text}</blockquote>
      <div class="source-cite">— ${src.citation}</div>
    </div>`;
}

function renderCommentaries(list) {
  const items = list.map(c =>
    `<div class="comm-item"><span class="comm-author">${c.author}</span>` +
    `${c.work ? `<span class="comm-work">《${c.work}》</span>` : ''}` +
    `<span class="comm-colon">：</span><span class="comm-text">${c.text}</span></div>`
  ).join('');
  return `<div class="seg commentaries"><div class="seg-label">注疏</div>${items}</div>`;
}

// 章末导航：上一章/下一章
function renderChapterNav(currentId) {
  const prev = getPrev(currentId);
  const next = getNext(currentId);
  const prevHtml = prev
    ? `<a class="nav-prev" href="#/book/${prev.id}">⟵ ${prev.title}</a>`
    : '<span></span>';
  const nextHtml = next
    ? (next.draft
        ? `<span class="nav-next disabled">${next.title}（待續）⟶</span>`
        : `<a class="nav-next" href="#/book/${next.id}">${next.title} ⟶</a>`)
    : '<span></span>';
  return prevHtml + nextHtml;
}
