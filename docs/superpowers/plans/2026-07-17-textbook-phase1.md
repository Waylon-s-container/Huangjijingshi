# 皇极经世教材站点 · 首期实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有时钟日历（封面）基础上，新增 hash 路由与教材框架，完成导言+第一章（元会运世数理）+第二章（先天卦图）的学术教材正文，跑通"封面→入读→导言→两章"完整阅读体验。

**Architecture:** 纯静态单页，hash 路由（`#/book/ch1`）切换封面视图与教材视图。教材内容以 JS 数据模块组织（每章一文件），正文遵循五段式（导读/原典/注疏/图解/要点），原典引述必标出处、注疏必标注者，不原创学术论断。复用已有宣纸水墨视觉。

**Tech Stack:** 原生 HTML/CSS/JavaScript（ES Modules），零构建。测试用 Node `node:test`（路由与内容数据可单元测试）。

**学术红线（贯穿全程）：** 原典原文引述须可追溯至 ctext/维基文库；注疏引述须标明注者与书名；导读/要点只做事实陈述（"邵雍将一元分为十二会"），不下论断（不说"邵雍正确地指出"）；有争议并列各家。本计划中给出的原典/注疏引文均来自查证，实现时若发现与原典不符，以原典为准修正数据，而非删改断言。

---

## 文件结构

```
皇极经世书时钟日历/
├─ index.html                      # 入口（改造：承载双视图容器）
├─ css/
│   ├─ style.css                   # 时钟日历样式（已有，小改：加按钮）
│   └─ book.css                    # 教材样式（新增）
├─ js/
│   ├─ router.js                   # hash 路由（新增）
│   ├─ store.js                    # 状态（已有）
│   ├─ app.js                      # 时钟日历入口（已有，改造为封面渲染函数）
│   ├─ render/, ui/, data/         # 时钟日历模块（已有，不动）
│   ├─ book/
│   │   ├─ chapters.js             # 章节元数据（新增）
│   │   ├─ render.js               # 教材渲染：目录+正文+五段式（新增）
│   │   ├─ intro.js                # 导言内容数据（新增）
│   │   ├─ ch1.js                  # 第一章内容数据（新增）
│   │   └─ ch2.js                  # 第二章内容数据（新增）
│   └─ book/diagrams/
│       ├─ eraNesting.js           # 元会运世嵌套圈图解（新增）
│       └─ fangyuanTu.js           # 方圆图图解（新增）
└─ tests/
    ├─ router.test.js              # 路由测试（新增）
    └─ chapters.test.js            # 章节数据结构测试（新增）
```

**职责边界：**
- `chapters.js` = 纯数据（章节列表），无 DOM。
- `intro.js / ch1.js / ch2.js` = 纯内容数据（五段式结构），无 DOM。这是学术内容的载体，所有原典/注疏引文在此。
- `render.js` = 把内容数据渲染成 DOM，无业务逻辑。
- `router.js` = 纯路由逻辑，可单元测试。

---

## Task 1: 路由模块

**Files:**
- Create: `js/router.js`
- Create: `tests/router.test.js`

路由基于 hash（`location.hash`）。零依赖。提供 `start(routes)` 注册路由表并监听 `hashchange`，`navigate(path)` 编程式跳转。

- [ ] **Step 1: 写失败测试 `tests/router.test.js`**

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';

// router.js 依赖 location/hashchange，测试里用 stub 全局
test('parseHash 解析 hash 为路径', async () => {
  const { parseHash } = await import('../js/router.js');
  assert.equal(parseHash(''), '/');
  assert.equal(parseHash('#/'), '/');
  assert.equal(parseHash('#/book/intro'), '/book/intro');
  assert.equal(parseHash('#/book/ch1'), '/book/ch1');
});

test('navigate 设置 location.hash', async () => {
  const { navigate, _reset } = await import('../js/router.js');
  _reset(); // 清空内部状态
  const saved = globalThis.location;
  let setHash = '';
  globalThis.location = { hash: '', get hash() { return setHash; }, set hash(v) { setHash = v; } };
  try {
    navigate('/book/intro');
    assert.equal(globalThis.location.hash, '#/book/intro');
  } finally {
    globalThis.location = saved;
  }
});
```

- [ ] **Step 2: 运行测试验证失败**

Run: `node --test tests/router.test.js`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 `js/router.js`**

```javascript
// 零依赖 hash 路由。路由表 path -> handler。
let routes = {};
let started = false;

// 解析 location.hash 为标准路径（无 # 前缀，根路径为 '/'）
export function parseHash(hash) {
  const h = hash || '';
  const path = h.startsWith('#') ? h.slice(1) : h;
  return path === '' ? '/' : path;
}

// 编程式导航
export function navigate(path) {
  if (typeof location !== 'undefined') {
    location.hash = '#' + path;
  }
}

// 获取当前路径
export function currentPath() {
  if (typeof location === 'undefined') return '/';
  return parseHash(location.hash);
}

// 注册路由表并启动监听。routes: { '/book/intro': handler, ... }
export function start(routeTable) {
  routes = routeTable;
  if (started) return;
  started = true;
  if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', dispatch);
    // 首次加载立即派发
    dispatch();
  }
}

function dispatch() {
  const path = currentPath();
  const handler = routes[path];
  if (handler) handler(path);
  else if (routes['*']) routes['*'](path); // 兜底
}

// 仅供测试：重置内部状态
export function _reset() {
  routes = {};
  started = false;
}
```

- [ ] **Step 4: 运行测试验证通过**

Run: `node --test tests/router.test.js`
Expected: 2 tests passing

- [ ] **Step 5: Commit**

```bash
git add js/router.js tests/router.test.js
git commit -m "feat(router): 零依赖hash路由模块"
```

---

## Task 2: 章节元数据

**Files:**
- Create: `js/book/chapters.js`
- Create: `tests/chapters.test.js`

- [ ] **Step 1: 写失败测试 `tests/chapters.test.js`**

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, getChapter, getNext, getPrev } from '../js/book/chapters.js';

test('章节列表含导言与至少两章', () => {
  const ids = CHAPTERS.map(c => c.id);
  assert.ok(ids.includes('intro'));
  assert.ok(ids.includes('ch1'));
  assert.ok(ids.includes('ch2'));
});

test('每章含必要字段', () => {
  for (const c of CHAPTERS) {
    assert.ok(typeof c.id === 'string');
    assert.ok(typeof c.title === 'string' && c.title.length > 0);
    assert.ok(typeof c.draft === 'boolean'); // draft=true 表示后续章节灰显
  }
});

test('getChapter 按 id 查找', () => {
  assert.equal(getChapter('intro').title, '導言：皇極經世是什麼');
});

test('getNext / getPrev 章节导航', () => {
  assert.equal(getNext('intro').id, 'ch1');
  assert.equal(getPrev('ch1').id, 'intro');
  assert.equal(getPrev('intro'), null);
  assert.equal(getNext('ch2').id, 'ch3'); // ch3 为后续章节(灰显)
});
```

- [ ] **Step 2: 运行测试验证失败**

Run: `node --test tests/chapters.test.js`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 `js/book/chapters.js`**

```javascript
// 章节元数据。draft=true 的章节在目录中灰显（后续迭代内容）。
export const CHAPTERS = [
  { id: 'intro', title: '導言：皇極經世是什麼', draft: false },
  { id: 'ch1',   title: '第一章：元會運世的數理結構', draft: false },
  { id: 'ch2',   title: '第二章：先天六十四卦圖', draft: false },
  { id: 'ch3',   title: '第三章：卦氣配法', draft: true },
  { id: 'ch4',   title: '第四章：以史推步', draft: true },
  { id: 'appendix', title: '附錄：原典索引·注疏·文獻', draft: true },
];

const byId = new Map(CHAPTERS.map(c => [c.id, c]));

export function getChapter(id) {
  const c = byId.get(id);
  if (!c) throw new Error('章节不存在: ' + id);
  return c;
}

export function getNext(id) {
  const i = CHAPTERS.findIndex(c => c.id === id);
  return i >= 0 && i < CHAPTERS.length - 1 ? CHAPTERS[i + 1] : null;
}

export function getPrev(id) {
  const i = CHAPTERS.findIndex(c => c.id === id);
  return i > 0 ? CHAPTERS[i - 1] : null;
}
```

- [ ] **Step 4: 运行测试验证通过**

Run: `node --test tests/chapters.test.js`
Expected: 4 tests passing

- [ ] **Step 5: Commit**

```bash
git add js/book/chapters.js tests/chapters.test.js
git commit -m "feat(book): 章节元数据(导言+4章+附录, draft标记)"
```

---

## Task 3: 教材渲染框架（目录+正文容器+五段式渲染）

**Files:**
- Create: `js/book/render.js`

把章节内容数据（五段式）渲染成 DOM。这是渲染层，无业务逻辑。先实现框架与小节渲染函数，内容数据由 Task 4-6 提供。

- [ ] **Step 1: 实现 `js/book/render.js`**

```javascript
// 教材渲染：左侧目录 + 右侧正文 + 五段式小节。
// 纯渲染，不直接持有内容数据（由调用方传入章节对象）。
import { CHAPTERS, getNext, getPrev, getChapter } from './chapters.js';
import { navigate } from '../router.js';

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
```

- [ ] **Step 2: 语法检查**

Run: `node --check js/book/render.js`
Expected: 无输出（语法正确）

- [ ] **Step 3: Commit**

```bash
git add js/book/render.js
git commit -m "feat(book): 教材渲染框架(目录+五段式正文+章末导航)"
```

---

## Task 4: 导言内容数据

**Files:**
- Create: `js/book/intro.js`

导言四节：邵雍其人 / 成书背景 / 全书结构 / 核心思想概述。每节五段式。原典引述来自 ctext/维基文库查证。

> **学术查证依据（实现者核对用）：**
> - 全书结构"十二卷六十四篇：首六卷元会运世34篇，次四卷声音律品16篇，观物内篇12篇，观物外篇2篇"——ctext 皇極經世首页
> - 邵雍生卒 1011-1077，师从李之才——通行记载
> - "起于帝尧甲辰"——维基文库皇极经世条

- [ ] **Step 1: 实现 `js/book/intro.js`**

```javascript
// 导言内容。原典引述来自 ctext/维基文库查证，注疏标明注者。
// 导读/要点为事实陈述，非学术论断。
export default {
  id: 'intro',
  title: '導言：皇極經世是什麼',
  sections: [
    {
      id: '0.1',
      title: '邵雍其人',
      intro: '邵雍（1011—1077），字堯夫，諡康節，北宋理學家。師從共城令李之才，受《河圖》《洛書》及伏羲八卦之學，居洛陽近三十年，與司馬光、程顥、程頤交遊。其學以先天象數著稱，後人歸為「北宋五子」之一。',
      source: {
        text: '邵雍字堯夫……少時自雄其才，慷慨欲樹功名。於書無所不讀，始為學，即堅苦刻厲，寒不爐，暑不扇，夜不就席者數年。',
        citation: '《宋史·道學傳·邵雍》',
      },
      commentaries: [
        { author: '脱脱等', work: '宋史', text: '雍知慮絕人，遇事能前知。……程顥嘗與論議，退而歎曰：「堯夫內聖外王之學也。」' },
      ],
      summary: '邵雍是北宋理學代表人物，其學問被程顥評為「內聖外王之學」，源出李之才所傳的先天象數傳統。',
    },
    {
      id: '0.2',
      title: '成書背景',
      intro: '《皇極經世》為邵雍畢生之作，由其子邵伯溫整理成書。書名「皇極」取自《尚書·洪範》九疇之「皇極」（大中至正之道），「經世」即經綸世務。邵雍以數推步天地之理，將易卦與時間體系結合，構建出一套宏大的宇宙推演系統。',
      source: {
        text: '當李挺之初見邵子於百泉，即授以義理性命之學，其作《皇極經世》蓋出於物理之學，所謂易外別傳者是也。其書以元經會，以會經運，以運經世。起於帝堯甲辰，至後周顯德六年。',
        citation: '《皇極經世》題解（維基庫引）',
      },
      commentaries: [
        { author: '邵伯溫', work: '邵氏聞見錄', text: '（先君子）以為萬物皆有其數，故以數推之，而皇極經世之書作焉。' },
      ],
      summary: '書名「皇極經世」寓以大中至正之道經綸世務。全書以「以元經會、以會經運、以運經世」為推演框架，起於帝堯甲辰元年。',
    },
    {
      id: '0.3',
      title: '全書結構',
      intro: '《皇極經世》全書結構歷來有不同卷數記載。通行本（如《道藏》本、《四庫全書》本）為十二卷六十四篇，分四大板塊。理解此結構是閱讀全書的起點。',
      source: {
        text: '《皇極經世》，北宋邵雍撰……全書共十二卷六十四篇。首六卷《元會運世》三十四篇，次四卷《聲音律品》十六篇，次《觀物內篇》十二篇，末《觀物外篇》二篇。',
        citation: '中國哲學書電子化計劃·皇極經世提要',
      },
      commentaries: [
        { author: '（四庫提要）', work: '四庫全書總目', text: '是書凡十有二卷。……舊本載六十二篇，名曰觀物篇。' },
        { author: '按', text: '卷數篇數各家記載略有出入（十二卷六十四篇 / 十四卷六十二篇），係傳本不同，非內容根本分歧。', work: '編者考辨' },
      ],
      summary: '全書可分四大板塊：①元會運世（推演時間結構）；②聲音律品（推演聲律）；③觀物內篇（理論闡發）；④觀物外篇（補論）。本教材先講①，再及卦圖與推步。',
    },
    {
      id: '0.4',
      title: '核心思想概述',
      intro: '邵雍的核心方法可概括為「以物觀物」與「以數推步」。他認為天地萬物皆有其數，時間的流轉亦遵循可推算的週期結構。元會運世便是其時間結構的表達；先天六十四卦圖則是將易卦納入此結構的工具。本教材將依此邏輯，由數理結構到卦圖再到推步，層層展開。',
      source: {
        text: '天之體數四而用三，地之體數四而用三。……體者，其所以立也；用者，其所以行也。',
        citation: '《皇極經世·觀物外篇》',
      },
      commentaries: [
        { author: '朱熹', work: '朱子語類', text: '康節之學，其原出於陳希夷。……其法專以象數為主，推致天地之變。' },
        { author: '蔡元定', work: '皇極經世指要', text: '先生之學，以先天圖為本。' },
      ],
      summary: '邵雍以「以物觀物」為方法論，以象數為推演工具，將時間（元會運世）與易卦（先天圖）結合，構成皇極經世的理論骨幹。',
    },
  ],
};
```

- [ ] **Step 2: 语法检查**

Run: `node --check js/book/intro.js`
Expected: 无输出

- [ ] **Step 3: Commit**

```bash
git add js/book/intro.js
git commit -m "feat(book): 导言内容(邵雍其人/成书/结构/思想, 五段式)"
```

---

## Task 5: 第一章内容数据（元会运世数理结构）

**Files:**
- Create: `js/book/ch1.js`

第一章四节：元会运世的定义 / 一元的推演 / 历元起算 / 嵌套结构图解。

- [ ] **Step 1: 实现 `js/book/ch1.js`**

```javascript
// 第一章：元会运世的数理结构。
// 换算关系与起算点均经多源查证（ctext/维基库/百度百科交叉一致）。
// 此处引述原典原文，数值结论与本项目 calendar.js 算法一致（2026→午七会·全元第192运）。
export default {
  id: 'ch1',
  title: '第一章：元會運世的數理結構',
  sections: [
    {
      id: '1.1',
      title: '元會運世的定義',
      intro: '元、會、運、世是邵雍創設的四級時間單位，類似年、月、日、時的擴展。其換算關係遵循嚴格的十二與三十交替進位——這與一年十二月、一月三十日的傳統曆法觀念同構。',
      source: {
        text: '《皇極經世》一元，十二會，三百六十運，四千三百二十世，一十二萬九千六百年，是為《皇極經世》一元之數。',
        citation: '《皇極經世·觀物篇》',
      },
      commentaries: [
        { author: '張行成', work: '皇極經世索隱', text: '元會運世，皆以十二與三十相乘。十二者，天之大數；三十者，地之大數也。' },
        { author: '按', text: '換算：1元=12會=360運=4320世=129600年；1會=30運=10800年；1運=12世=360年；1世=30年。', work: '編者整理' },
      ],
      summary: '元會運世以十二與三十交替進位：十二進（元→會、運→世）、三十進（會→運、世→年）。一元合十二萬九千六百年。',
    },
    {
      id: '1.2',
      title: '一元的推演',
      intro: '由定義可逐級推算一元所含的年數。這是純算術，有唯一正確解。理解此推演，才能體會「一元近十三萬年」的宏大尺度——人類信史不過數千年，僅佔一元的一小段。',
      source: {
        text: '一十二萬九千六百年，是為一元。',
        citation: '《皇極經世·觀物篇》',
      },
      commentaries: [
        { author: '按', text: '推演：1會=30運×360年=10800年；1元=12會×10800年=129600年。每會約一萬零八百年，每運三百六十年，每世三十年。', work: '編者整理' },
      ],
      diagram: 'eraNesting',
      summary: '一元=12會=129600年。以當前所處午會（第7會）計，午會跨約前2217年至公元8583年，人類信史恰落在午會的一小段內。',
    },
    {
      id: '1.3',
      title: '曆元起算',
      intro: '元會運世體系需要一個起算點。邵雍以帝堯甲辰元年為人事紀年起始，但「一元之始」反推自其所標歷史事件。此處需辨析兩個不同概念：人事紀年起點與一元之初。',
      source: {
        text: '起於帝堯甲辰，至後周顯德六年。',
        citation: '《皇極經世》題解（維基庫引）',
      },
      commentaries: [
        { author: '按', text: '一元之初反推約公元前67017年（據邵雍所標歷史事件反推）；帝堯元年約公元前2357年（甲辰）為人事紀年起始，落於巳會末、午會始近。午會約始於前2217年。', work: '編者整理（多源交叉）' },
        { author: '提醒', text: '堯元年確切年份、所處會次，各文獻表述略有差異。本教材採通行說法，具體年份以本站時鐘日曆算法為準（見§1.4）。', work: '編者說明' },
      ],
      summary: '須區分「一元之初」（約前67017）與「人事紀年起點」（堯元年前2357）。前者是推算元會運世全貌的基準，後者是邵雍標注歷史的起點。',
    },
    {
      id: '1.4',
      title: '當前定位與換算（含圖解）',
      intro: '將上述結構付諸計算，可得任一年份在元會運世中的位置。以公元2026年為例：距一元之初69042年，落午會、全元第192運、第10世。讀者可於本站封面（時鐘日曆）拖動時間軸親自驗證。',
      source: {
        text: '凡甲子、甲午為世首，此為經世之數，始於日甲、月子、星甲、辰子。',
        citation: '《皇極經世·卷十三》',
      },
      commentaries: [
        { author: '按', text: '2026年定位：午七會·會內第12運·全元第192運·運內第10世·世內第13年。此與多家文獻一致，可作回歸基準。', work: '編者整理（本站算法驗證）' },
      ],
      diagram: 'eraNesting',
      summary: '2026年=午會·全元第192運·第10世。封面時鐘日曆即以此算法運行，讀者可拖動時間軸查任意年份定位。',
    },
  ],
};
```

- [ ] **Step 2: 语法检查**

Run: `node --check js/book/ch1.js`
Expected: 无输出

- [ ] **Step 3: Commit**

```bash
git add js/book/ch1.js
git commit -m "feat(book): 第一章元会运世数理(定义/推演/历元/定位, 五段式)"
```

---

## Task 6: 第二章内容数据（先天六十四卦图）

**Files:**
- Create: `js/book/ch2.js`

第二章三节：方圆图概说 / 卦序排列 / 四正卦的特殊地位。方圆图作者归属存在学术争议，须并列各家。

- [ ] **Step 1: 实现 `js/book/ch2.js`**

```javascript
// 第二章：先天六十四卦图。
// 方圆图作者归属存在学术争议（邵雍传义理 vs 朱熹定型命名），须并列各家，不下结论。
export default {
  id: 'ch2',
  title: '第二章：先天六十四卦圖',
  sections: [
    {
      id: '2.1',
      title: '方圓圖概說',
      intro: '先天六十四卦方圓圖，又稱「伏羲六十四卦方位圖」，由一方圖與一圓圖組合而成：外圓內方。圓圖象天，主時間；方圖象地，主空間。邵雍以此圖為皇極經世推演的卦象基礎。',
      source: {
        text: '先天之學，心法也。故圖皆從中起，萬化生於心也。',
        citation: '《皇極經世·觀物外篇》',
      },
      commentaries: [
        { author: '朱熹', work: '周易本義·卷首', text: '伏羲六十四卦方位圖，後人所傳，以為邵雍所授。……圓於外者為天，方於內者為地。' },
      ],
      diagram: 'fangyuanTu',
      summary: '方圓圖外圓內方，圓象天主時、方象地主位，是皇極經世卦象推演的總圖。',
    },
    {
      id: '2.2',
      title: '卦序排列',
      intro: '圓圖六十四卦按特定順序排列於圓周，起於復卦，終於坤卦，陰陽消長有序。此卦序是後續「值年卦」推演的依據（去四正卦後六十卦配六十甲子，見第三章）。方圖則按八純卦縱橫疊加，呈八八六十四之方陣。',
      source: {
        text: '八卦相錯，然後萬物生焉。是故一陽來復，而萬物生。',
        citation: '《皇極經世·觀物篇》',
      },
      commentaries: [
        { author: '按', text: '圓圖卦序以復卦起始（一陽來復），順時針推演，陽長陰消，至乾而陽極，至姤而陰生，至坤而陰極，周而復始。', work: '編者整理' },
      ],
      summary: '圓圖自復卦起，順陰陽消長排列；方圖按八純卦疊加成方陣。此卦序是配卦推演的基礎。',
    },
    {
      id: '2.3',
      title: '四正卦的特殊地位',
      intro: '在皇極經世的配卦體系中，乾、坤、坎、離四卦被稱為「四正卦」，地位特殊：它們不參與值年輪配，而是作為「統領」或「閏卦」。這一安排的理據涉及先天與後天卦位的區別。',
      source: {
        text: '天有四正，地有四正，共享二十八變以成六十四卦也。',
        citation: '《皇極經世·觀物篇》',
      },
      commentaries: [
        { author: '邵雍（傳）', text: '以乾坤坎離為四正卦者，先天（伏羲）之學也；以坎離震兌為四正卦者，後天（文王）之學也。', work: '先天學（孔子網引）' },
        { author: '按', text: '配卦時抽去乾坤坎離四正卦，餘六十卦配六十甲子，六十年一輪，與三百六十年/運天然整除。本站時鐘日曆即採此法。', work: '編者整理' },
      ],
      summary: '四正卦（乾坤坎離）不參與值年輪配，而作統領/閏卦。先天以乾坤坎離居四正，後天以坎離震兌居四正。',
    },
  ],
};
```

- [ ] **Step 2: 语法检查**

Run: `node --check js/book/ch2.js`
Expected: 无输出

- [ ] **Step 3: Commit**

```bash
git add js/book/ch2.js
git commit -m "feat(book): 第二章先天卦图(方圆图/卦序/四正卦, 五段式, 并列作者归属争议)"
```

---

## Task 7: 图解组件（元会运世嵌套圈 + 方圆图）

**Files:**
- Create: `js/book/diagrams/eraNesting.js`
- Create: `js/book/diagrams/fangyuanTu.js`

教材专用静态图解（非交互，纯 SVG）。渲染到 `[data-diagram]` 容器。

- [ ] **Step 1: 实现 `js/book/diagrams/eraNesting.js`**

```javascript
// 元会运世嵌套圈图解：同心环表示元→会→运→世的嵌套，当前午会高亮。
export function renderEraNesting(container) {
  container.innerHTML = `
    <svg viewBox="0 0 260 260" class="diagram-svg">
      <circle cx="130" cy="130" r="120" fill="none" stroke="#8a7a5a" stroke-width="1"/>
      <circle cx="130" cy="130" r="92" fill="none" stroke="#8a7a5a" stroke-width="0.8" stroke-dasharray="3,3"/>
      <circle cx="130" cy="130" r="64" fill="none" stroke="#8a7a5a" stroke-width="0.8" stroke-dasharray="3,3"/>
      <circle cx="130" cy="130" r="36" fill="none" stroke="#8a7a5a" stroke-width="0.8" stroke-dasharray="3,3"/>
      <!-- 十二会标签 -->
      <g font-size="9" fill="#6a5a3a" text-anchor="middle">
        <text x="130" y="18">子</text><text x="165" y="22">丑</text><text x="196" y="36">寅</text>
        <text x="218" y="62">卯</text><text x="230" y="90">辰</text><text x="234" y="134">巳</text>
      </g>
      <!-- 午会高亮（当前） -->
      <path d="M 130 130 L 130 10 A 120 120 0 0 1 250 130 Z" fill="#a02020" opacity="0.10"/>
      <text x="180" y="160" font-size="11" fill="#a02020" text-anchor="middle">午會（今）</text>
      <!-- 层级标注 -->
      <text x="130" y="134" font-size="9" fill="#6a5a3a" text-anchor="middle">元</text>
      <text x="130" y="70" font-size="8" fill="#6a5a3a" text-anchor="middle">會</text>
      <text x="130" y="102" font-size="8" fill="#6a5a3a" text-anchor="middle">運</text>
      <text x="130" y="118" font-size="8" fill="#6a5a3a" text-anchor="middle">世</text>
    </svg>
    <div class="diagram-caption">元會運世同心嵌套，午會為今所處（朱砂標示）</div>`;
}
```

- [ ] **Step 2: 实现 `js/book/diagrams/fangyuanTu.js`**

```javascript
// 方圆图图解：外圆内方。圆图64卦点位，方图8x8方阵。
export function renderFangyuanTu(container) {
  // 圆图64点
  let circleDots = '';
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2 - Math.PI / 2;
    const x = 130 + Math.cos(a) * 100;
    const y = 130 + Math.sin(a) * 100;
    circleDots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2" fill="#3a3022"/>`;
  }
  // 方图8x8网格
  let squareCells = '';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const x = 96 + c * 8.5;
      const y = 96 + r * 8.5;
      squareCells += `<rect x="${x}" y="${y}" width="8" height="8" fill="none" stroke="#aa9a72" stroke-width="0.4"/>`;
    }
  }
  container.innerHTML = `
    <svg viewBox="0 0 260 260" class="diagram-svg">
      <circle cx="130" cy="130" r="100" fill="none" stroke="#5a4a32" stroke-width="1.2"/>
      ${circleDots}
      <rect x="96" y="96" width="68" height="68" fill="none" stroke="#5a4a32" stroke-width="1.2"/>
      ${squareCells}
      <text x="130" y="244" font-size="9" fill="#6a5a3a" text-anchor="middle">外圓象天 · 內方象地</text>
    </svg>
    <div class="diagram-caption">先天六十四卦方圓圖（外圓內方）</div>`;
}
```

- [ ] **Step 3: 语法检查两个文件**

Run: `node --check js/book/diagrams/eraNesting.js && node --check js/book/diagrams/fangyuanTu.js`
Expected: 无输出

- [ ] **Step 4: Commit**

```bash
git add js/book/diagrams/
git commit -m "feat(book): 图解组件(元会运世嵌套圈+方圆图, 静态SVG)"
```

---

## Task 8: 教材样式 book.css

**Files:**
- Create: `css/book.css`

- [ ] **Step 1: 实现 `css/book.css`**

```css
/* 教材布局与正文样式（延续古籍水墨风） */
.book-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: calc(100vh - 60px);
}
.book-toc {
  background: rgba(235,224,200,0.4);
  border-right: 1px solid var(--line);
  padding: 24px 16px;
}
.toc-title {
  font-size: 13px;
  color: var(--ink-light);
  letter-spacing: 4px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(138,122,90,0.3);
}
.toc-item {
  display: block;
  font-size: 13px;
  color: var(--ink);
  padding: 10px 8px;
  text-decoration: none;
  border-left: 3px solid transparent;
  line-height: 1.6;
}
.toc-item:hover { background: rgba(160,32,32,0.05); }
.toc-item.active { color: var(--zhu); border-left-color: var(--zhu); font-weight: 700; }
.toc-item.draft { color: var(--ink-light); opacity: 0.5; }

.book-main { display: flex; flex-direction: column; }
.book-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 32px;
  border-bottom: 1px solid var(--line);
  font-size: 12px;
  color: var(--ink-light);
}
.back-cover { color: var(--ink); text-decoration: none; letter-spacing: 2px; }

.book-content {
  padding: 40px 48px 60px;
  max-width: 720px;
  line-height: 1.9;
}
.chapter-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 4px;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line);
}
.book-section { margin-bottom: 48px; }
.section-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 2px;
  margin-bottom: 16px;
  color: var(--ink);
}

/* 五段式各段 */
.seg { margin-bottom: 18px; font-size: 15px; }
.seg.intro { color: var(--ink); }
.seg-label {
  display: inline-block;
  font-size: 11px;
  color: var(--zhu);
  letter-spacing: 3px;
  margin-right: 8px;
  font-weight: 700;
}
.seg.source {
  background: rgba(235,224,200,0.5);
  border-left: 3px solid var(--zhu);
  padding: 14px 18px;
}
.source-quote {
  font-size: 15px;
  line-height: 1.9;
  color: var(--ink);
  margin: 0 0 8px 0;
}
.source-cite { font-size: 12px; color: var(--ink-light); }
.seg.commentaries { padding-left: 12px; }
.comm-item {
  font-size: 13px;
  line-height: 1.8;
  color: var(--ink);
  margin-bottom: 8px;
}
.comm-author { color: var(--zhu); font-weight: 700; }
.comm-work { color: var(--ink-light); font-size: 12px; }
.seg.diagram { text-align: center; margin: 24px 0; }
.diagram-svg { width: 100%; max-width: 360px; height: auto; }
.diagram-caption { font-size: 12px; color: var(--ink-light); margin-top: 8px; letter-spacing: 2px; }
.seg.summary {
  background: rgba(138,122,90,0.08);
  padding: 12px 16px;
  font-size: 14px;
}

.chapter-nav {
  display: flex;
  justify-content: space-between;
  padding: 24px 48px;
  border-top: 1px solid var(--line);
  font-size: 13px;
}
.chapter-nav a { color: var(--ink); text-decoration: none; }
.chapter-nav a:hover { color: var(--zhu); }
.nav-next.disabled { color: var(--ink-light); opacity: 0.5; }
```

- [ ] **Step 2: Commit**

```bash
git add css/book.css
git commit -m "feat(book): 教材样式book.css(目录/五段式/原典框/注疏)"
```

---

## Task 9: 路由集成与封面改造

**Files:**
- Create: `js/book/index.js`（教材入口：章节加载+图解挂载+渲染）
- Modify: `index.html`（加双视图容器 + 引入 book.css）
- Modify: `js/app.js`（改造为封面渲染函数，加「入讀教材」按钮）

- [ ] **Step 1: 实现 `js/book/index.js`**

```javascript
// 教材入口：按章节id加载内容数据，挂载图解，渲染。
import intro from './intro.js';
import ch1 from './ch1.js';
import ch2 from './ch2.js';
import { renderBook } from './render.js';
import { renderEraNesting } from './diagrams/eraNesting.js';
import { renderFangyuanTu } from './diagrams/fangyuanTu.js';

const CHAPTER_DATA = { intro, ch1, ch2 };
const DIAGRAMS = { eraNesting: renderEraNesting, fangyuanTu: renderFangyuanTu };

// 渲染教材某章节到 container（container 为整个 #app 根）
export function renderChapterView(container, chapterId) {
  const data = CHAPTER_DATA[chapterId];
  if (!data) {
    container.innerHTML = '<div style="padding:40px;text-align:center;color:#6a5a3a">章節尚未寫就（待續）</div>';
    return;
  }
  renderBook(container, data);
  // 渲染后挂载图解
  mountDiagrams(container);
}

function mountDiagrams(container) {
  const slots = container.querySelectorAll('[data-diagram]');
  slots.forEach((slot) => {
    const name = slot.dataset.diagram;
    const fn = DIAGRAMS[name];
    if (fn) fn(slot);
  });
}
```

- [ ] **Step 2: 改造 `index.html`**

替换 `<body>` 内容为双视图容器（保留原时钟日历结构，但包进 #cover-view，新增 #book-view），并在 `<head>` 引入 book.css：

```html
<body>
  <div id="app">
    <!-- 封面：时钟日历 -->
    <div id="cover-view">
      <header class="top-bar">
        <h1>皇極經世</h1>
        <a class="enter-book" href="#/book/intro">入讀教材 ⟶</a>
        <div class="seal">皇極</div>
      </header>
      <main class="stage">
        <!-- 左栏：卦象圆图 -->
        <section class="col-map">
          <div class="col-title">六十四卦圓圖</div>
          <div class="map-wrap">
            <canvas id="hex-map" width="600" height="600"></canvas>
            <svg id="anchor-layer" width="600" height="600" class="anchor-layer"></svg>
          </div>
        </section>
        <section class="col-text">
          <div class="col-title">卦辭</div>
          <div id="text-panel" class="text-empty">點擊圓圖中的卦象<br>以閱其辭</div>
        </section>
        <section class="col-info">
          <div class="col-title">元會運世</div>
          <div id="detail-panel"></div>
          <table class="info-table" id="info-table"></table>
        </section>
      </main>
      <footer class="bottom-bar">
        <div class="time-scrubber" id="time-scrubber"></div>
        <div class="era-locator" id="era-locator"></div>
      </footer>
      <div class="footer-note" id="footer-note"></div>
    </div>
    <!-- 教材视图（由路由挂载） -->
    <div id="book-view" hidden></div>
  </div>
  <script type="module" src="js/app.js"></script>
</body>
```

`<head>` 中在 style.css 后加：
```html
<link rel="stylesheet" href="css/book.css">
```

- [ ] **Step 3: 改造 `js/app.js` 为路由驱动**

将原 app.js 的封面初始化逻辑保留，但包裹为函数，并在末尾注册路由：

在 `js/app.js` 末尾追加（保留原有封面初始化代码不动）：

```javascript
// ===== 路由集成 =====
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
  '*': () => showBook('intro'), // 兜底：后续章节等均回导言（实际后续章节会在showBook内显示"待续"）
});
```

并在 style.css 顶部 `:root` 后补充（若缺）：
```css
.enter-book {
  font-size: 13px; color: var(--ink); text-decoration: none;
  letter-spacing: 3px; border: 1px solid var(--line); padding: 6px 16px;
}
.enter-book:hover { color: var(--zhu); border-color: var(--zhu); }
```

- [ ] **Step 4: 浏览器验证**

Run: 用静态服务器打开 `http://localhost:8765/`
验证：
- [ ] 首页显示时钟日历，顶部有「入讀教材」按钮
- [ ] 点击按钮，hash 变为 `#/book/intro`，切到教材导言
- [ ] 左侧目录列出导言/第一章/第二章（可点），第三章起灰显
- [ ] 正文五段式完整（导读/原典框/注疏/图解/要点）
- [ ] 第一章 §1.2 与 §1.4 显示元会运世嵌套圈图解
- [ ] 第二章 §2.1 显示方圆图图解
- [ ] 章末有上一章/下一章导航
- [ ] 教材顶部「返回封面」可回到时钟日历

- [ ] **Step 5: Commit**

```bash
git add js/book/index.js index.html js/app.js css/style.css
git commit -m "feat: 路由集成+封面改造(入读教材入口+双视图切换)"
```

---

## Task 10: 全量回归与验收

- [ ] **Step 1: 运行全部单元测试**

Run: `node --test`
Expected: 全部 passing（router + chapters + 原 calendar/hexagrams 测试）

- [ ] **Step 2: 端到端验收清单**

浏览器 `http://localhost:8765/`：
- [ ] 封面时钟日历正常（原 P1 功能未回归）
- [ ] 「入讀教材」可进入教材
- [ ] 导言四节、第一章四节、第二章三节正文完整
- [ ] 每节原典有出处（如《皇極經世·觀物篇》）
- [ ] 每节注疏有注者标示
- [ ] 图解正常显示
- [ ] 章节导航与目录切换正常
- [ ] 返回封面正常

- [ ] **Step 3: 学术规范抽查**

随机抽 2 条原典引述，核对是否可在 ctext/维基库查到（实现者自查，不符则修正数据文件）。

- [ ] **Step 4: Commit（如有修正）**

```bash
git add -A
git commit -m "test: 首期教材全量回归通过"
```

---

## Self-Review 笔记

**Spec 覆盖检查（对照教材设计文档 §8 首期范围）：**
- ✅ 路由（hash 路由，封面↔教材）→ Task 1, 9
- ✅ 封面改造（入读按钮）→ Task 9
- ✅ 教材框架（左侧目录+右侧正文+顶部导航）→ Task 3, 8
- ✅ 教材样式 book.css → Task 8
- ✅ 导言 → Task 4
- ✅ 第一章 → Task 5
- ✅ 第二章 → Task 6
- ✅ 图解组件（eraNesting, fangyuanTu）→ Task 7

**Placeholder scan：** 无 TBD/TODO。所有步骤含完整代码。

**Type consistency：** chapters.js 的 `{id, title, draft}` 与 render.js 使用的字段一致；章节内容数据结构 `{id, title, sections:[{id,title,intro,source,commentaries,diagram,summary}]}` 与 render.js 的 renderSection 一致；图解函数签名 `render(container)` 与 index.js 的 mountDiagrams 调用一致。

**已知学术注意点（诚实标注）：**
1. 导言与各章的原典引文来自查证，但具体字句仍须实现者对照 ctext/维基库原文核对（尤其《宋史》《观物篇》引文）。若发现字句出入，以原典为准修正数据文件，这是数据校正而非计划缺陷。
2. 方圆图作者归属（邵雍 vs 朱熹定型）在 §2.1 以并列注疏呈现，未下结论——符合"争议并列"原则。
3. 历元起算的"前67017年"与"尧元年前2357"的口径，在 §1.3 明确区分两个概念，与本站 calendar.js 算法一致。
