# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目是什么

**皇极经世** 单页 Web 应用：以邵雍《皇极经世》时间哲学为内容，提供：

1. **封面（时钟日历）** — 64卦圆图 + 值年卦锚点 + 时间轴漫游（P1 已完成）
2. **教材** — 学术研究级教材（导言 + 第1–2章已完成；第3–4章/附录为 draft）

纯静态、零依赖、零构建。所有计算在浏览器端完成。设计与实现计划见 `docs/superpowers/`。

## 常用命令

```bash
# 运行全部测试（node:test，ESM）
npm test
# 等价于
node --test

# 跑单个测试文件
node --test tests/calendar.test.js
node --test tests/hexagrams.test.js
node --test tests/router.test.js
node --test tests/chapters.test.js

# 本地预览（ES Modules 需要 http 协议，不能 file://）
node spike/server.mjs . 8765
# 然后打开 http://localhost:8765
```

无 lint / 无 build / 无 bundler。`"type": "module"` 写在 `package.json`。

## 架构总览

```
index.html
  ├─ #cover-view   时钟日历三栏（P1）
  └─ #book-view    教材（由 hash 路由挂载）

js/app.js          入口：初始化封面模块 + 注册路由
js/store.js        封面状态（year / scale / selectedHexagram）+ pub/sub
js/router.js       零依赖 hash 路由（path → handler）
js/data/           纯函数数据层（无 DOM，可 node:test）
js/render/         封面 Canvas/SVG 渲染
js/ui/             封面交互（时间轴）
js/book/           教材：内容数据 + 渲染 + 图解
css/style.css      封面样式
css/book.css       教材样式
```

### 双视图切换

`js/app.js` 用 `router.start({...})` 注册：

| hash | 行为 |
|------|------|
| `#/` | 显示 `#cover-view` |
| `#/book` | 重定向到 `#/book/intro` |
| `#/book/intro` `#/book/ch1` `#/book/ch2` | 显示 `#book-view` 并 `renderChapterView` |
| 其它 | 兜底到导言（draft 章显示「待续」） |

封面与教材共用同一 `index.html`，不拆多 HTML。

### 数据层（`js/data/`）

纯函数、无 DOM，是测试重点。

- **`hexagrams.js`**：64卦，按先天圆图序（复起）。`lines` 为6位二进制，**自下而上**（`lines[0]=初爻`）。四正卦（乾坤坎离）标 `isCardinal: true`，**不参与值年配卦**。同人（圆图序去四正后第15卦）是 2026 值年锚点，由 `calendar.js` 按卦名查找，不依赖固定 id。
- **`calendar.js`**：
  - `EPOCH_YEAR = -67017`（一元之初）
  - `YAO_YEAR = -2357`（尧元年，人事纪年起点）
  - `yearsSinceEpoch(year)`：**无公元0年校正**——前A到后B = A+B−1
  - `locate(year)` → 元会运世定位（所有索引 0-based；显示时 +1）
  - `valueYearHexagram(year)` → **基准外推法**：2026=同人，沿去四正后的60卦圆图顺时针推进，60年一轮

换算关系：

```
1元 = 12会 = 129600年
1会 = 30运 = 10800年
1运 = 12世 = 360年
1世 = 30年
```

黄金回归用例（测试锁定）：2026 → 午七会 · 会内第12运 · 全元第192运 · 运内第10世 · 值年卦「同人」。

### 封面状态流

```
store.setState({ year })  ←  timeScrubber 拖拽 / 初始年份
        │
        ▼  subscribe
  hexagramMap 重绘圆图 + 当前值年卦放大
  anchor      朱砂+墨晕移到当前卦
  app.js      右栏信息表 / 中栏卦辞 / 底部定位文字
```

点击圆图卦象 → `setState({ selectedHexagram })` → 中栏显示卦辞。

### 教材内容模型

- `js/book/chapters.js` — 章节元数据（id/title/draft），无 DOM
- `js/book/intro.js` `ch1.js` `ch2.js` — **纯内容数据**（五段式结构），无 DOM
- `js/book/render.js` — 数据 → DOM（目录 + 正文 + 章末导航）
- `js/book/index.js` — 按 id 取内容、渲染、挂载图解
- `js/book/diagrams/*` — 图解组件，由 `data-diagram="name"` 槽位挂载

每节五段式字段：

```
intro          【導讀】
source         【原典】{ text, citation }
commentaries   【注疏】[{ author, work, text }]
diagram        【圖解】组件名字符串（可选）
summary        【要點】
```

已注册图解：`eraNesting` `fangyuanTu` `xiaoXi` `timeLocator`。

## 学术红线（改内容时必须遵守）

来自设计文档，贯穿全部教材与算法标注：

1. **原典引述**必须可追溯（ctext / 维基文库的篇卷），写在 `source.citation`
2. **注疏引述**必须标明注者与书名
3. **导读/要点只做事实陈述**（「邵雍将一元分为十二会」），**不下学术论断**（不说「正确地指出」）
4. 有争议并列各家，标「待考」，不臆断
5. 页脚透明声明起算点与配卦法（见 `app.js` 中 `footer-note`）
6. 值年卦配法当前是 **P1 基准外推法**（2026=同人），不是完整「会→运→世→旬→年」推演链；完整链留 P2，代码注释与页脚已标明，勿伪装为唯一正解

## 视觉约定

- 背景宣纸米黄 `#f4ecd8`，墨黑 `#2a2418`，朱砂 `#a02020`
- 字体：Noto Serif SC（思源宋体）
- 主图卦象：水墨写意（`inkBrush.js` Canvas）；详情卦象：工笔规整 SVG
- 当前锚点：朱砂描边 + 墨晕呼吸

## 分期与边界

| 阶段 | 内容 | 状态 |
|------|------|------|
| P1 | 值年卦层（圆图+时间轴+定位） | 已完成 |
| 教材首期 | 路由 + 导言 + ch1 + ch2 + 图解 | 已完成 |
| P2 | 宏观会/运/世/旬卦 | 未做 |
| P3 | 日卦 | 未做 |
| 教材后续 | ch3 卦气配法、ch4 以史推步、附录 | draft 占位 |

YAGNI（设计文档明确不做）：全文搜索、用户笔记、多语言、后端。

## 改代码时的注意点

- **数据层优先可测**：`js/data/*` 与 `js/router.js`、`js/book/chapters.js` 无 DOM，改它们先补/跑 `tests/`
- **索引约定**：`locate()` 返回 0-based；UI 显示一律 `+1`。会名用 `HUI_NAMES[huiIndex]`（子…亥）
- **无公元0年**：跨公元前后的年差用 `yearsSinceEpoch`，禁止 `year - (-N)` 隐式写法
- **新增教材章**：在 `chapters.js` 去掉 draft → 新建 `chN.js` 内容模块 → `book/index.js` 的 `CHAPTER_DATA` 注册 → `app.js` 路由表加路径
- **新增图解**：实现 `diagrams/xxx.js` 导出 `renderXxx(slot)` → 在 `book/index.js` 的 `DIAGRAMS` 注册 → 节数据里 `diagram: 'xxx'`
- **spike/** 是实验与静态服务器，不是生产路径；`enhance-directions.html` 等可随意迭代
- 设计权威文档：`docs/superpowers/specs/`；任务拆解：`docs/superpowers/plans/`。算法或学术规则有疑，先读对应 spec 再改
)
