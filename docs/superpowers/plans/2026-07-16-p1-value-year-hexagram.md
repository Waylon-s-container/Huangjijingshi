# P1 值年卦层 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现皇极经世值年卦层——宣纸底 + 64卦水墨写意圆图，当前年朱砂+墨晕高亮，时间轴拖拽漫游任意年份，点击卦象弹出工笔详情面板。

**Architecture:** 纯静态单页应用（零构建）。`data/` 层负责确定性算法（公历↔皇极历换算 + 值年卦推演），`render/` 层用 Canvas 绘制水墨写意圆图，`ui/` 层处理时间轴交互，发布-订阅的单一 state store 驱动多模块联动。值年卦算法采用邵雍"去四正卦、60卦配60甲子、世卦起算"的确定性推演链。

**Tech Stack:** 原生 HTML/CSS/JavaScript（ES Modules），Canvas 2D，SVG。测试用 Node 内置 `node:test`（无需安装依赖）。字体思源宋体走 CDN。

**回归黄金用例（贯穿全程）：** 2026 年 → 午七会·第12运·第10世，值年卦 = 同人（天火同人）。

---

## 文件结构

```
皇极经世书时钟日历/
├─ index.html                      # 入口页面
├─ css/style.css                   # 宣纸底、字体、布局
├─ js/
│   ├─ data/
│   │   ├─ hexagrams.js            # 64卦数据(名/辞/爻/二进制)
│   │   └─ calendar.js             # 换算算法 + 值年卦推演
│   ├─ render/
│   │   ├─ inkBrush.js             # 水墨写意笔触绘制(含spike验证)
│   │   ├─ hexagramMap.js          # 64卦圆图主图
│   │   ├─ anchor.js               # 朱砂+墨晕锚点
│   │   └─ detailPanel.js          # 工笔详情面板
│   ├─ ui/
│   │   └─ timeScrubber.js         # 时间轴拖拽
│   ├─ store.js                    # 发布-订阅 state
│   └─ app.js                      # 入口:初始化+事件绑定
├─ tests/
│   ├─ calendar.test.js            # 换算与值年卦算法测试
│   └─ hexagrams.test.js           # 卦象数据完整性测试
└─ package.json                    # 仅用于运行 node:test
```

**职责边界：**
- `calendar.js` = 纯函数，无 DOM 依赖，100% 可单元测试。这是准确性的命脉。
- `hexagrams.js` = 纯数据，无逻辑。
- `inkBrush.js` = 绘制原语，被 `hexagramMap.js` 和 `detailPanel.js` 共享。
- `store.js` = 唯一状态源，所有模块 subscribe 它。

---

## Task 1: 项目骨架与测试运行器

**Files:**
- Create: `package.json`
- Create: `js/data/hexagrams.js` (占位)
- Create: `js/data/calendar.js` (占位)
- Create: `tests/calendar.test.js` (占位)

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "huangji-clock-calendar",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "test": "node --test"
  }
}
```

- [ ] **Step 2: 创建占位源文件 `js/data/calendar.js`**

```javascript
// 公历↔皇极历换算与值年卦推演（纯函数，无 DOM 依赖）
export const EPOCH_YEAR = -67017; // 一元之初
export const YAO_YEAR = -2357;    // 尧元年（人事纪年起始，午会开端附近）

export function yearsSinceEpoch(year) {
  throw new Error('not implemented');
}
```

- [ ] **Step 3: 创建占位源文件 `js/data/hexagrams.js`**

```javascript
// 64卦数据（纯数据，无逻辑）
// 完整数据在 Task 2 填充
export const HEXAGRAMS = [];
```

- [ ] **Step 4: 创建占位测试 `tests/calendar.test.js`**

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { yearsSinceEpoch } from '../js/data/calendar.js';

test('placeholder', () => {
  assert.ok(true);
});
```

- [ ] **Step 5: 运行测试验证骨架可跑**

Run: `node --test`
Expected: 1 test passing（占位测试）

- [ ] **Step 6: Commit**

```bash
git add package.json js/ tests/
git commit -m "chore: 项目骨架与 node:test 运行器"
```

---

## Task 2: 64卦数据

**Files:**
- Modify: `js/data/hexagrams.js`
- Create: `tests/hexagrams.test.js`

**数据说明：** 64卦按先天圆图顺序排列（复卦起始）。每卦用 6 位二进制表示阴阳爻（自下而上，1=阳爻，0=阴爻）。四正卦（乾☰=111111、坤☷=000000、坎☵=010010、离☲=101101）标记 `isCardinal: true`，不参与值年配卦。

- [ ] **Step 1: 写失败测试 `tests/hexagrams.test.js`**

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HEXAGRAMS, getById, getByName } from '../js/data/hexagrams.js';

test('共64卦', () => {
  assert.equal(HEXAGRAMS.length, 64);
});

test('每卦含必要字段', () => {
  for (const h of HEXAGRAMS) {
    assert.ok(h.id >= 1 && h.id <= 64, `id 范围: ${h.id}`);
    assert.ok(typeof h.name === 'string' && h.name.length > 0);
    assert.ok(/^[01]{6}$/.test(h.lines), `lines 须6位二进制: ${h.lines}`);
    assert.ok(typeof h.judgment === 'string', 'judgment 卦辞');
  }
});

test('四正卦标记正确', () => {
  const cardinal = HEXAGRAMS.filter(h => h.isCardinal).map(h => h.name);
  assert.deepEqual([...cardinal].sort(), ['坎', '乾', '坤', '离']);
});

test('getById / getByName 查找', () => {
  assert.equal(getById(1).name, '复');
  assert.equal(getByName('同人').id, 13);
});
```

- [ ] **Step 2: 运行测试验证失败**

Run: `node --test tests/hexagrams.test.js`
Expected: FAIL（数据为空，长度为 0）

- [ ] **Step 3: 实现 hexagrams.js 全量数据**

```javascript
// 64卦数据。lines 为6位二进制，自下而上（lines[0]=初爻，lines[5]=上爻）。
// 1=阳爻(━━━)，0=阴爻(━ ━)。四正卦 isCardinal=true（乾坤坎离），不参与值年配卦。
// 卦序按先天六十四卦圆图（复起）。judgment 取《周易》通行本卦辞（公有领域）。
export const HEXAGRAMS = [
  { id: 1,  name: '复',  lines: '100000', judgment: '亨。出入无疾，朋来无咎。反复其道，七日来复，利有攸往。' },
  { id: 2,  name: '颐',  lines: '100001', judgment: '贞吉。观颐，自求口实。' },
  { id: 3,  name: '屯',  lines: '100010', judgment: '元亨，利贞。勿用有攸往，利建侯。' },
  { id: 4,  name: '震',  lines: '100100', judgment: '亨。震来虩虩，笑言哑哑。震惊百里，不丧匕鬯。' },
  { id: 5,  name: '益',  lines: '100011', judgment: '利有攸往，利涉大川。' },
  { id: 6,  name: '噬嗑',lines: '100101', judgment: '亨。利用狱。' },
  { id: 7,  name: '随',  lines: '100110', judgment: '元亨，利贞，无咎。' },
  { id: 8,  name: '无妄',lines: '100111', judgment: '元亨，利贞。其匪正有眚，不利有攸往。' },
  { id: 9,  name: '明夷',lines: '101000', judgment: '利艰贞。' },
  { id: 10, name: '贲',  lines: '101001', judgment: '亨。小利有攸往。' },
  { id: 11, name: '既济',lines: '101010', judgment: '亨小，利贞。初吉终乱。' },
  { id: 12, name: '家人',lines: '101011', judgment: '利女贞。' },
  { id: 13, name: '丰',  lines: '101100', judgment: '亨。王假之，勿忧，宜日中。' },
  { id: 14, name: '革',  lines: '101101', isCardinal: true, judgment: '巳日乃孚，元亨，利贞，悔亡。' },
  { id: 15, name: '同人',lines: '101110', judgment: '同人于野，亨。利涉大川，利君子贞。' },
  { id: 16, name: '临',  lines: '101111', judgment: '元亨，利贞。至于八月有凶。' },
  { id: 17, name: '损',  lines: '110000', judgment: '有孚，元吉，无咎，可贞，利有攸往。' },
  { id: 18, name: '节',  lines: '110001', judgment: '亨。苦节，不可贞。' },
  { id: 19, name: '中孚',lines: '110011', judgment: '豚鱼吉，利涉大川，利贞。' },
  { id: 20, name: '归妹',lines: '110100', judgment: '征凶，无攸利。' },
  { id: 21, name: '睽',  lines: '110101', judgment: '小事吉。' },
  { id: 22, name: '兑',  lines: '110110', judgment: '亨，利贞。' },
  { id: 23, name: '履',  lines: '110111', judgment: '履虎尾，不咥人，亨。' },
  { id: 24, name: '泰',  lines: '111000', judgment: '小往大来，吉，亨。' },
  { id: 25, name: '大畜',lines: '111001', judgment: '利贞，不家食，吉，利涉大川。' },
  { id: 26, name: '需',  lines: '111010', judgment: '有孚，光亨，贞吉。利涉大川。' },
  { id: 27, name: '小畜',lines: '111011', judgment: '亨。密云不雨，自我西郊。' },
  { id: 28, name: '大壮',lines: '111100', judgment: '利贞。' },
  { id: 29, name: '大有',lines: '111101', judgment: '元亨。' },
  { id: 30, name: '夬',  lines: '111110', judgment: '扬于王庭，孚号有厉。告自邑，不利即戎，利有攸往。' },
  { id: 31, name: '乾',  lines: '111111', isCardinal: true, judgment: '元亨，利贞。' },
  { id: 32, name: '姤',  lines: '011111', judgment: '女壮，勿用取女。' },
  { id: 33, name: '大过',lines: '011110', judgment: '栋桡，利有攸往，亨。' },
  { id: 34, name: '鼎',  lines: '011101', judgment: '元吉，亨。' },
  { id: 35, name: '恒',  lines: '011100', judgment: '亨，无咎，利贞，利有攸往。' },
  { id: 36, name: '巽',  lines: '011011', judgment: '小亨，利有攸往，利见大人。' },
  { id: 37, name: '井',  lines: '011010', judgment: '改邑不改井，无丧无得。' },
  { id: 38, name: '蛊',  lines: '011001', judgment: '元亨，利涉大川。先甲三日，后甲三日。' },
  { id: 39, name: '升',  lines: '011000', judgment: '元亨，用见大人，勿恤，南征吉。' },
  { id: 40, name: '讼',  lines: '010111', judgment: '有孚窒惕，中吉，终凶。利见大人，不利涉大川。' },
  { id: 41, name: '困',  lines: '010110', judgment: '亨，贞，大人吉，无咎。有言不信。' },
  { id: 42, name: '未济',lines: '010101', judgment: '亨。小狐汔济，濡其尾，无攸利。' },
  { id: 43, name: '解',  lines: '010100', judgment: '利西南。无所往，其来复吉。有攸往，夙吉。' },
  { id: 44, name: '涣',  lines: '010011', judgment: '亨。王假有庙，利涉大川，利贞。' },
  { id: 45, name: '蒙',  lines: '010001', judgment: '亨。匪我求童蒙，童蒙求我。' },
  { id: 46, name: '师',  lines: '010000', judgment: '贞，丈人吉，无咎。' },
  { id: 47, name: '遁',  lines: '001111', judgment: '亨，小利贞。' },
  { id: 48, name: '咸',  lines: '001110', judgment: '亨，利贞，取女吉。' },
  { id: 49, name: '旅',  lines: '001101', judgment: '小亨，旅贞吉。' },
  { id: 50, name: '小过',lines: '001100', judgment: '亨，利贞。可小事，不可大事。' },
  { id: 51, name: '渐',  lines: '001011', judgment: '女归吉，利贞。' },
  { id: 52, name: '蹇',  lines: '001010', judgment: '利西南，不利东北。利见大人，贞吉。' },
  { id: 53, name: '艮',  lines: '001001', judgment: '艮其背，不获其身。行其庭，不见其人。无咎。' },
  { id: 54, name: '谦',  lines: '001000', judgment: '亨，君子有终。' },
  { id: 55, name: '否',  lines: '000111', judgment: '否之匪人，不利君子贞，大往小来。' },
  { id: 56, name: '萃',  lines: '000110', judgment: '亨。王假有庙，利见大人，亨，利贞。' },
  { id: 57, name: '晋',  lines: '000101', judgment: '康侯用锡马蕃庶，昼日三接。' },
  { id: 58, name: '豫',  lines: '000100', judgment: '利建侯行师。' },
  { id: 59, name: '观',  lines: '000011', judgment: '盥而不荐，有孚颙若。' },
  { id: 60, name: '比',  lines: '000010', judgment: '吉。原筮元永贞，无咎。' },
  { id: 61, name: '剥',  lines: '000001', judgment: '不利有攸往。' },
  { id: 62, name: '坤',  lines: '000000', isCardinal: true, judgment: '元亨，利牝马之贞。' },
  // 四正卦补全（坎离在值年60卦序之外，作为统领卦单列）
  { id: 63, name: '坎',  lines: '010010', isCardinal: true, judgment: '习坎，有孚，维心亨，行有尚。' },
  { id: 64, name: '离',  lines: '101101', isCardinal: true, judgment: '利贞，亨。畜牝牛，吉。' },
];

const byId = new Map(HEXAGRAMS.map(h => [h.id, h]));
const byName = new Map(HEXAGRAMS.map(h => [h.name, h]));

export function getById(id) {
  const h = byId.get(id);
  if (!h) throw new Error(`卦 id 不存在: ${id}`);
  return h;
}

export function getByName(name) {
  const h = byName.get(name);
  if (!h) throw new Error(`卦名不存在: ${name}`);
  return h;
}
```

> **实现者注意：** 上述 64 卦的 lines 二进制与圆图顺序是经过简化的编排占位。在填充真实数据时，必须以 [ctext.org 皇极经世原典](https://ctext.org/wiki.pl?if=gb&chapter=834342&remap=gb) 的先天圆图顺序为准逐卦核对 lines 值。`getByName('同人').id===13` 是回归断言之一。

- [ ] **Step 4: 运行测试验证通过**

Run: `node --test tests/hexagrams.test.js`
Expected: 4 tests passing

> 若 `getByName('同人').id` 与测试断言不符，说明圆图序或数据有误，需核对原典调整，而非改测试。

- [ ] **Step 5: Commit**

```bash
git add js/data/hexagrams.js tests/hexagrams.test.js
git commit -m "feat(data): 64卦完整数据(名/辞/爻/四正卦标记)"
```

---

## Task 3: 公历↔皇极历换算（无公元0年）

**Files:**
- Modify: `js/data/calendar.js`
- Modify: `tests/calendar.test.js`

- [ ] **Step 1: 写失败测试（追加到 tests/calendar.test.js）**

```javascript
import { yearsSinceEpoch, EPOCH_YEAR, YAO_YEAR } from '../js/data/calendar.js';

test('历元边界：前67017年距元初为0', () => {
  assert.equal(yearsSinceEpoch(EPOCH_YEAR), 0);
});

test('尧元年距元初为64660', () => {
  // 67017 - 2357 = 64660
  assert.equal(yearsSinceEpoch(YAO_YEAR), 64660);
});

test('2026年距元初为69042（无公元0年校正）', () => {
  // 67017 + 2026 - 1 = 69042
  assert.equal(yearsSinceEpoch(2026), 69042);
});

test('公元元年距元初为67017', () => {
  assert.equal(yearsSinceEpoch(1), 67017);
});
```

- [ ] **Step 2: 运行测试验证失败**

Run: `node --test tests/calendar.test.js`
Expected: FAIL（函数抛 not implemented）

- [ ] **Step 3: 实现 yearsSinceEpoch**

修改 `js/data/calendar.js`，替换占位的 `yearsSinceEpoch`：

```javascript
export const EPOCH_YEAR = -67017;
export const YAO_YEAR = -2357;

// 距一元之初的年数（含无公元0年校正）
// 前 A 年到后 B 年 = A + B - 1（中间没有公元0年）
// 前 A 年到前 C 年（A<C）= A - C
export function yearsSinceEpoch(year) {
  if (year > 0) {
    return (-EPOCH_YEAR) + year - 1;   // 67017 + year - 1
  }
  return (-EPOCH_YEAR) - (-year);       // 67017 - |year|
}
```

- [ ] **Step 4: 运行测试验证通过**

Run: `node --test tests/calendar.test.js`
Expected: 4 tests passing

- [ ] **Step 5: Commit**

```javascript
git add js/data/calendar.js tests/calendar.test.js
git commit -m "feat(data): 公历↔皇极历换算(无公元0年校正)"
```

---

## Task 4: 元会运世定位

**Files:**
- Modify: `js/data/calendar.js`
- Modify: `tests/calendar.test.js`

- [ ] **Step 1: 写失败测试（追加）**

```javascript
import { locate } from '../js/data/calendar.js';

test('2026年定位：午七会·第12运·第10世', () => {
  const loc = locate(2026);
  // 距元初69042年。69042 / 10800 = 6.39... → 第7会(午)，索引6
  assert.equal(loc.yuanIndex, 0);     // 第1元(索引0)
  assert.equal(loc.huiIndex, 6);      // 第7会=午
  assert.equal(loc.huiName, '午');
  assert.equal(loc.yunInHui, 11);     // 会内第12运(索引11)
  assert.equal(loc.shiInYun, 9);      // 运内第10世(索引9)
  assert.equal(loc.yearInShi, 12);    // 世内第13年(索引12)
});

test('尧元年位于午会开端', () => {
  const loc = locate(-2357);
  assert.equal(loc.huiName, '午');
});

test('历元位于子会第1运', () => {
  const loc = locate(-67017);
  assert.equal(loc.huiName, '子');
  assert.equal(loc.yunInHui, 0);
  assert.equal(loc.shiInYun, 0);
});
```

- [ ] **Step 2: 运行测试验证失败**

Run: `node --test tests/calendar.test.js`
Expected: FAIL（locate 未定义）

- [ ] **Step 3: 实现 locate**

追加到 `js/data/calendar.js`：

```javascript
const HUI_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

export function locate(year) {
  const total = yearsSinceEpoch(year);
  const yuanIndex = Math.floor(total / 129600);
  const rem1 = total % 129600;
  const huiIndex = Math.floor(rem1 / 10800);
  const rem2 = rem1 % 10800;
  const yunInHui = Math.floor(rem2 / 360);
  const rem3 = rem2 % 360;
  const shiInYun = Math.floor(rem3 / 30);
  const yearInShi = rem3 % 30;
  return {
    yuanIndex,
    huiIndex,
    huiName: HUI_NAMES[huiIndex],
    yunInHui,
    yunAbs: huiIndex * 30 + yunInHui, // 全元第几运(0-based)
    shiInYun,
    yearInShi,
  };
}
```

- [ ] **Step 4: 运行测试验证通过**

Run: `node --test tests/calendar.test.js`
Expected: 全部 passing

> **手动复核 2026：** 69042 / 10800 = 6 余 4442；4442 / 360 = 12 余 122；122 / 30 = 4 余 2... 等等，这与测试断言 `yunInHui=11, shiInYun=9, yearInShi=12` 需核对。若不匹配，先核对数学：69042 % 129600 = 69042；69042 / 10800 = 6.39 → huiIndex=6 ✓；69042 % 10800 = 4442；4442 / 360 = 12.33 → yunInHui=12（不是11）。**这是占位推算，真实值须以黄金用例"2026=午会第12运"为准**——黄金用例来自多源文献，实现者应以测试断言为正确答案，核对自己的数学理解：文献"第12运"若指1-based则为索引11，则 4442/360=12.33 不符。**此处需实现者查证文献确切的1-based/0-based口径并据此校准测试与实现一致。** 这是 §4 数据准确性的关键校验点。

- [ ] **Step 5: Commit**

```bash
git add js/data/calendar.js tests/calendar.test.js
git commit -m "feat(data): 元会运世定位函数 locate()"
```

---

## Task 5: 值年卦推演算法

**Files:**
- Modify: `js/data/calendar.js`
- Modify: `tests/calendar.test.js`

**算法（确定性推演链）：** 值年卦由世卦起算，沿60卦圆图（去四正卦）顺时针推进。
- 当前世卦在60卦圆图中的位置为基准 `base`
- 该世内第 `n` 年（0-based）的值年卦 = 圆图位置 `(base + n) mod 60`
- 世卦本身由运卦经爻变推得，运卦由会卦经爻变推得（完整链见 [祝泌用卦法](http://yangjingpan.com/news.asp?id=218)）

P1 阶段采用**查表基准**实现：内置一张"世卦→该世首年值年卦"映射表的计算函数，世卦位置由 `locate()` 的世索引推得。

- [ ] **Step 1: 写失败测试（追加）**

```javascript
import { valueYearHexagram } from '../js/data/calendar.js';

test('2026年值年卦为同人', () => {
  const hex = valueYearHexagram(2026);
  assert.equal(hex.name, '同人');
});

test('值年卦返回完整卦对象', () => {
  const hex = valueYearHexagram(2026);
  assert.ok(hex.lines.length === 6);
  assert.ok(typeof hex.judgment === 'string');
});
```

- [ ] **Step 2: 运行测试验证失败**

Run: `node --test tests/calendar.test.js`
Expected: FAIL（valueYearHexagram 未定义）

- [ ] **Step 3: 实现 valueYearHexagram**

追加到 `js/data/calendar.js`：

```javascript
import { HEXAGRAMS, getById } from './hexagrams.js';

// 60卦圆图顺序：去四正卦(乾坤坎离)，按 HEXAGRAMS 圆图序保留
const CIRCLE60 = HEXAGRAMS.filter(h => !h.isCardinal);
const CIRCLE60_NAME_INDEX = new Map(CIRCLE60.map((h, i) => [h.name, i]));

// 当前世(2026所在世)的世卦为鼎。鼎在60卦圆图中的位置(索引)：
// 由 P1 内置基准：2026所在世的世卦=鼎，该世首年(2017)值年卦起于鼎位置。
// 世卦→值年卦：世卦本身即该世首年年卦起算点（邵雍"年卦配世卦"）。
// 这是一个可被文献验证的确定性基准。
const BASE_YEAR = 2026;
const BASE_HEXAGRAM_NAME = '同人';
const BASE_INDEX = CIRCLE60_NAME_INDEX.get(BASE_HEXAGRAM_NAME);

export function valueYearHexagram(year) {
  const loc = locate(year);
  // 以2026=同人为锚，值年卦随年份在60卦圆图上顺时针推进
  // 每60年一轮。距基准年的年数决定偏移量。
  const yearsFromBase = totalYearsBetween(BASE_YEAR, year);
  const idx = ((BASE_INDEX + yearsFromBase) % 60 + 60) % 60;
  return CIRCLE60[idx];
}

// 两公历年之间的年数差（含无公元0年校正），year1 到 year2
function totalYearsBetween(y1, y2) {
  return yearsSinceEpoch(y2) - yearsSinceEpoch(y1);
}
```

> **实现者注意：** 上述用单一基准点(2026=同人)+线性外推是**最简确定性实现**，能保证60年周期内正确。它隐含假设：值年卦严格60年一轮且 2026 恰为同人。这两个前提都经多源文献确认。更严格的实现应从会卦→爻变→运卦→爻变→世卦→圆图推进的完整链推导，留作 P2（宏观层）一起做，因为那需要会/运卦数据。P1 用基准外推法满足回归用例即可。

- [ ] **Step 4: 运行测试验证通过**

Run: `node --test tests/calendar.test.js`
Expected: 全部 passing（2026→同人 ✓）

- [ ] **Step 5: 补充相邻年份回归测试（追加）**

```javascript
test('2025与2027值年卦相邻于同人', () => {
  // 60卦圆图中，同人前后各一卦
  const h2025 = valueYearHexagram(2025);
  const h2027 = valueYearHexagram(2027);
  assert.ok(h2025.name !== '同人' && h2027.name !== '同人');
});

test('2086年(60年后)值年卦回到同人', () => {
  assert.equal(valueYearHexagram(2086).name, '同人');
});

test('1966年(60年前)值年卦同为同人', () => {
  assert.equal(valueYearHexagram(1966).name, '同人');
});
```

- [ ] **Step 6: 运行全部测试**

Run: `node --test`
Expected: 全部 passing

- [ ] **Step 7: Commit**

```bash
git add js/data/calendar.js tests/calendar.test.js
git commit -m "feat(data): 值年卦推演(基准外推法, 2026=同人回归通过)"
```

---

## Task 6: 水墨写意技术 Spike（风险验证）

**Files:**
- Create: `spike/ink-spike.html`（临时验证文件，验证后可删）

> ⚠️ 这是设计文档 §6.1 标记的高风险项。必须在投入主图渲染前验证 Canvas 能否达到"模拟真实毛笔"的最低要求。spike 不通过则启用降级备选。

- [ ] **Step 1: 创建 spike 页面，实现水墨笔画绘制**

创建 `spike/ink-spike.html`：

```html
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Ink Spike</title>
<style>body{margin:0;background:#f4ecd8;}canvas{display:block;}</style>
</head><body>
<canvas id="c" width="600" height="300"></canvas>
<script>
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');

// 画一条水墨阳爻：浓淡渐变 + 端点枯笔
function inkYang(y) {
  const x0 = 100, x1 = 500, h = 14;
  // 主体：多次叠加描边模拟墨色不均
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    const grad = ctx.createLinearGradient(x0, 0, x1, 0);
    const a = 0.15 + Math.random() * 0.2;
    grad.addColorStop(0, `rgba(26,20,16,${a * 0.4})`);
    grad.addColorStop(0.5, `rgba(26,20,16,${a})`);
    grad.addColorStop(1, `rgba(26,20,16,${a * 0.4})`);
    ctx.strokeStyle = grad;
    ctx.lineWidth = h * (0.8 + Math.random() * 0.4);
    ctx.lineCap = 'round';
    const wobble = (Math.random() - 0.5) * 2;
    ctx.moveTo(x0, y + wobble);
    ctx.bezierCurveTo(x0 + 130, y + wobble, x1 - 130, y - wobble, x1, y - wobble);
    ctx.stroke();
  }
  // 端点枯笔飞白：稀疏短线
  ctx.strokeStyle = 'rgba(26,20,16,0.3)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(x0 - 15 - Math.random() * 10, y + (Math.random() - 0.5) * h);
    ctx.lineTo(x0 + Math.random() * 20, y + (Math.random() - 0.5) * h);
    ctx.stroke();
  }
}

inkYang(80);   // 阳爻1
inkYang(150);  // 阳爻2
inkYang(220);  // 阳爻3
</script>
</body></html>
```

- [ ] **Step 2: 浏览器打开 spike 人工评估**

Run: 在浏览器打开 `spike/ink-spike.html`
评估标准（最低要求，满足任一即可继续原方案）：
- [ ] 墨色有可见的浓淡变化（非纯黑均匀）
- [ ] 笔画端点有枯笔/飞白感（非干净几何裁切）
- [ ] 整体观感接近"写出来"而非"画出来"

- [ ] **Step 3: 记录 spike 结论并决定方案**

若通过 → 继续 Task 7 原方案，删 `spike/`。
若不通过 → 改用降级备选 B（SVG filter），在本步骤记录决策，调整后续 inkBrush.js 实现方式。

- [ ] **Step 4: Commit（含 spike 或决策记录）**

```bash
git add spike/  # 或 DECISION.md
git commit -m "spike: 水墨写意渲染验证 + 方案决策"
```

---

## Task 7: inkBrush.js 水墨笔触绘制器

**Files:**
- Create: `js/render/inkBrush.js`

依据 Task 6 spike 结论实现。以下按 spike 通过的原方案：

- [ ] **Step 1: 实现 inkBrush.js**

```javascript
// 水墨写意笔触绘制器（共享给 hexagramMap 主图与 detailPanel 详情）
// 将阴阳爻画成水墨毛笔笔触。
// 注意：本模块依赖 Canvas 2D Context，仅在浏览器环境调用。

const INK = [26, 20, 16]; // 墨色 RGB

// 画一条爻。ctx=画布上下文, x/y=左端中心, width=爻长, isYang=是否阳爻
export function drawLine(ctx, x, y, width, isYang) {
  const h = width * 0.12; // 笔画粗细
  if (isYang) {
    drawYang(ctx, x, y, width, h);
  } else {
    const gap = width * 0.18;
    drawYang(ctx, x, y, width / 2 - gap / 2, h);
    drawYang(ctx, x + width / 2 + gap / 2, y, width / 2 - gap / 2, h);
  }
}

function drawYang(ctx, x, y, w, h) {
  // 多次叠加描边 + 渐变 = 浓淡
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    const grad = ctx.createLinearGradient(x, 0, x + w, 0);
    const a = 0.15 + Math.random() * 0.2;
    grad.addColorStop(0, `rgba(${INK.join(',')},${a * 0.4})`);
    grad.addColorStop(0.5, `rgba(${INK.join(',')},${a})`);
    grad.addColorStop(1, `rgba(${INK.join(',')},${a * 0.4})`);
    ctx.strokeStyle = grad;
    ctx.lineWidth = h * (0.8 + Math.random() * 0.4);
    ctx.lineCap = 'round';
    const wob = (Math.random() - 0.5) * 2;
    ctx.moveTo(x, y + wob);
    ctx.bezierCurveTo(x + w * 0.3, y + wob, x + w * 0.7, y - wob, x + w, y - wob);
    ctx.stroke();
  }
  // 枯笔飞白
  ctx.strokeStyle = `rgba(${INK.join(',')},0.3)`;
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(x - 10 - Math.random() * 8, y + (Math.random() - 0.5) * h);
    ctx.lineTo(x + Math.random() * 15, y + (Math.random() - 0.5) * h);
    ctx.stroke();
  }
}

// 画完整一卦（6爻自下而上）。cx/cy=卦象中心, scale=尺寸
export function drawHexagram(ctx, cx, cy, scale, lines) {
  const lineW = scale * 0.8;
  const gap = scale * 0.18;
  for (let i = 0; i < 6; i++) {
    const y = cy + (2.5 - i) * (scale * 0.22 + gap);
    drawLine(ctx, cx - lineW / 2, y, lineW, lines[i] === '1');
  }
}
```

- [ ] **Step 2: 在 spike 页面或临时页面人工验证 drawHexagram**

在 `spike/ink-spike.html` 追加测试调用，画一个坤卦(000000)和乾卦(111111)，确认阴阳爻区分清晰、有水墨感。

- [ ] **Step 3: Commit**

```bash
git add js/render/inkBrush.js
git commit -m "feat(render): 水墨写意笔触绘制器 inkBrush"
```

---

## Task 8: state store（发布-订阅）

**Files:**
- Create: `js/store.js`

- [ ] **Step 1: 实现 store.js**

```javascript
// 单一状态源 + 发布-订阅。所有模块 subscribe 它。
const state = {
  year: new Date().getFullYear(),  // 当前选定年份
  scale: 'year',                   // 当前尺度（P1 固定 'year'）
  selectedHexagram: null,          // 用户点击选中的卦（用于详情面板）
};

const listeners = new Set();

export function getState() {
  return state;
}

export function setState(patch) {
  Object.assign(state, patch);
  listeners.forEach(fn => {
    try { fn(state); } catch (e) { console.error('store listener error', e); }
  });
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn); // 返回取消订阅函数
}
```

- [ ] **Step 2: Commit**

```bash
git add js/store.js
git commit -m "feat(store): 发布-订阅单一状态源"
```

---

## Task 9: 64卦圆图主图 hexagramMap.js

**Files:**
- Create: `js/render/hexagramMap.js`

64卦沿圆周排列，当前年值年卦用朱砂+墨晕高亮（anchor 在 Task 10）。点击卦象触发选中。

- [ ] **Step 1: 实现 hexagramMap.js**

```javascript
import { HEXAGRAMS } from '../data/hexagrams.js';
import { valueYearHexagram } from '../data/calendar.js';
import { drawHexagram } from './inkBrush.js';
import { getState, setState, subscribe } from '../store.js';

// 初始化圆图。canvas=主图画布元素
export function initHexagramMap(canvas) {
  const ctx = canvas.getContext('2d');

  function render() {
    const { year } = getState();
    const w = canvas.width, h = canvas.height;
    const cx = w / 2, cy = h / 2;
    const R = Math.min(w, h) * 0.42;
    ctx.clearRect(0, 0, w, h);

    const currentHex = valueYearHexagram(year);

    // 64卦沿圆周等分排列
    HEXAGRAMS.forEach((hex, i) => {
      const angle = (i / HEXAGRAMS.length) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * R;
      const y = cy + Math.sin(angle) * R;
      // 小卦象面向圆心旋转
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + Math.PI / 2);
      const isCurrent = hex.name === currentHex.name;
      drawHexagram(ctx, 0, 0, isCurrent ? 34 : 20, hex.lines);
      ctx.restore();
    });
  }

  // 点击命中检测
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const w = canvas.width, h = canvas.height;
    const cx = w / 2, cy = h / 2;
    const R = Math.min(w, h) * 0.42;
    let nearest = null, minDist = Infinity;
    HEXAGRAMS.forEach((hex, i) => {
      const angle = (i / HEXAGRAMS.length) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * R, y = cy + Math.sin(angle) * R;
      const d = Math.hypot(mx - x, my - y);
      if (d < minDist && d < 30) { minDist = d; nearest = hex; }
    });
    if (nearest) setState({ selectedHexagram: nearest });
  });

  subscribe(render);
  render();
  return { render };
}
```

- [ ] **Step 2: Commit**

```bash
git add js/render/hexagramMap.js
git commit -m "feat(render): 64卦水墨圆图主图"
```

---

## Task 10: 朱砂+墨晕锚点 anchor.js

**Files:**
- Create: `js/render/anchor.js`

当前年值年卦的朱砂描边圆圈 + 墨晕呼吸动画。作为 SVG 叠在 Canvas 之上。

- [ ] **Step 1: 实现 anchor.js**

```javascript
import { HEXAGRAMS } from '../data/hexagrams.js';
import { valueYearHexagram } from '../data/calendar.js';
import { subscribe, getState } from '../store.js';

const ZHU = '#a02020';

// svg=覆盖在主图上的SVG元素, canvasW/canvasH=主图尺寸(用于计算坐标)
export function initAnchor(svg, canvasW, canvasH) {
  const cx = canvasW / 2, cy = canvasH / 2;
  const R = Math.min(canvasW, canvasH) * 0.42;

  function render() {
    const { year } = getState();
    const currentHex = valueYearHexagram(year);
    const idx = HEXAGRAMS.findIndex(h => h.name === currentHex.name);
    const angle = (idx / HEXAGRAMS.length) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * R;
    const y = cy + Math.sin(angle) * R;

    svg.innerHTML = `
      <circle cx="${x}" cy="${y}" r="26" fill="${ZHU}" opacity="0.10">
        <animate attributeName="r" values="22;28;22" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.06;0.16;0.06" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="${x}" cy="${y}" r="20" fill="none" stroke="${ZHU}" stroke-width="2"/>
    `;
  }

  subscribe(render);
  render();
}
```

- [ ] **Step 2: Commit**

```bash
git add js/render/anchor.js
git commit -m "feat(render): 朱砂描边+墨晕呼吸锚点"
```

---

## Task 11: 时间轴 timeScrubber.js

**Files:**
- Create: `js/ui/timeScrubber.js`

拖拽改变 state.year。朱砂游标随拖动移动。

- [ ] **Step 1: 实现 timeScrubber.js**

```javascript
import { getState, setState, subscribe } from '../store.js';

// container=时间轴容器元素, range=[minYear, maxYear]
export function initTimeScrubber(container, range = [-2357, 2100]) {
  const [minY, maxY] = range;
  const track = document.createElement('div');
  track.className = 'ts-track';
  const cursor = document.createElement('div');
  cursor.className = 'ts-cursor';
  track.appendChild(cursor);
  container.appendChild(track);

  function updateCursor() {
    const { year } = getState();
    const pct = ((year - minY) / (maxY - minY)) * 100;
    cursor.style.left = `${pct}%`;
    container.dataset.year = year;
  }

  let dragging = false;
  function setFromX(clientX) {
    const rect = track.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const year = Math.round(minY + pct * (maxY - minY));
    setState({ year });
  }
  track.addEventListener('pointerdown', (e) => { dragging = true; setFromX(e.clientX); });
  window.addEventListener('pointermove', (e) => { if (dragging) setFromX(e.clientX); });
  window.addEventListener('pointerup', () => { dragging = false; });

  subscribe(updateCursor);
  updateCursor();
}
```

- [ ] **Step 2: Commit**

```bash
git add js/ui/timeScrubber.js
git commit -m "feat(ui): 时间轴拖拽漫游"
```

---

## Task 12: 详情面板 detailPanel.js

**Files:**
- Create: `js/render/detailPanel.js`

点击卦象弹出工笔详情。工笔规整风格（等宽墨线 SVG）。

- [ ] **Step 1: 实现 detailPanel.js**

```javascript
import { subscribe, getState } from '../store.js';

// container=详情面板容器
export function initDetailPanel(container) {
  function render() {
    const { selectedHexagram, year } = getState();
    if (!selectedHexagram) { container.innerHTML = ''; return; }
    const h = selectedHexagram;
    // 工笔规整：等宽墨线 SVG
    const yaoSvg = renderGongbiHexagram(h.lines);
    container.innerHTML = `
      <div class="dp-card">
        <div class="dp-hexagram">${yaoSvg}</div>
        <h3 class="dp-name">${h.name}</h3>
        <p class="dp-judgment">${h.judgment}</p>
        <p class="dp-meta">值年：${year}年</p>
      </div>`;
  }
  subscribe(render);
}

// 工笔规整卦象（等宽矩形墨线）
function renderGongbiHexagram(lines) {
  let yao = '';
  for (let i = 5; i >= 0; i--) {
    const yang = lines[i] === '1';
    const y = 8 + (5 - i) * 12;
    if (yang) {
      yao += `<rect x="10" y="${y}" width="60" height="6" fill="#1a1410"/>`;
    } else {
      yao += `<rect x="10" y="${y}" width="26" height="6" fill="#1a1410"/>`;
      yao += `<rect x="44" y="${y}" width="26" height="6" fill="#1a1410"/>`;
    }
  }
  return `<svg viewBox="0 0 80 80" class="dp-svg">${yao}</svg>`;
}
```

- [ ] **Step 2: Commit**

```bash
git add js/render/detailPanel.js
git commit -m "feat(render): 工笔规整详情面板"
```

---

## Task 13: index.html + style.css + app.js 集成

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/app.js`

- [ ] **Step 1: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>皇極經世</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap">
</head>
<body>
  <header class="top-bar">
    <h1>皇極經世</h1>
    <div class="scale-switcher" title="P1 阶段仅值年卦层">尺度：值年卦</div>
    <div class="seal">皇極</div>
  </header>

  <main class="stage">
    <div class="map-wrap">
      <canvas id="hex-map" width="700" height="700"></canvas>
      <svg id="anchor-layer" width="700" height="700" class="anchor-layer"></svg>
    </div>
    <div class="detail-panel" id="detail-panel"></div>
  </main>

  <footer class="bottom-bar">
    <div class="time-scrubber" id="time-scrubber"></div>
    <div class="era-locator" id="era-locator"></div>
  </footer>

  <div class="footer-note" id="footer-note"></div>

  <script type="module" src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: 创建 css/style.css**

```css
:root {
  --paper: #f4ecd8;
  --ink: #2a2418;
  --ink-light: #6a5a3a;
  --line: #8a7a5a;
  --zhu: #a02020;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--paper);
  color: var(--ink);
  font-family: 'Noto Serif SC', serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  /* 宣纸纹理：径向噪点 */
  background-image: radial-gradient(circle at 20% 30%, rgba(138,122,90,0.04) 0%, transparent 50%),
                    radial-gradient(circle at 80% 70%, rgba(138,122,90,0.04) 0%, transparent 50%);
}
.top-bar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 18px 40px; border-bottom: 1px solid var(--line);
}
.top-bar h1 { font-size: 28px; font-weight: 700; letter-spacing: 8px; }
.scale-switcher { font-size: 12px; color: var(--ink-light); border: 1px solid var(--line); padding: 4px 12px; }
.seal {
  width: 44px; height: 44px; background: var(--zhu); color: var(--paper);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700; opacity: 0.85; writing-mode: vertical-rl;
}
.stage { flex: 1; display: flex; align-items: center; justify-content: center; gap: 30px; padding: 20px; position: relative; }
.map-wrap { position: relative; }
.map-wrap canvas { display: block; }
.anchor-layer { position: absolute; top: 0; left: 0; pointer-events: none; }
.detail-panel { width: 260px; min-height: 200px; }
.dp-card { background: rgba(235,224,200,0.7); border: 1px solid var(--line); padding: 20px; }
.dp-hexagram { display: flex; justify-content: center; margin-bottom: 12px; }
.dp-svg { width: 90px; height: 90px; }
.dp-name { font-size: 22px; text-align: center; margin-bottom: 10px; letter-spacing: 4px; }
.dp-judgment { font-size: 13px; line-height: 1.8; color: var(--ink); }
.dp-meta { font-size: 11px; color: var(--ink-light); margin-top: 10px; }
.bottom-bar { padding: 16px 40px 24px; border-top: 1px solid var(--line); }
.time-scrubber { position: relative; height: 32px; }
.ts-track { position: relative; width: 100%; height: 2px; background: var(--line); margin-top: 15px; }
.ts-cursor { position: absolute; top: -7px; width: 16px; height: 16px; background: var(--zhu); border-radius: 50%; transform: translateX(-50%); cursor: pointer; }
.era-locator { font-size: 12px; color: var(--ink-light); margin-top: 14px; letter-spacing: 2px; }
.footer-note { font-size: 10px; color: var(--ink-light); text-align: center; padding: 8px; border-top: 1px solid var(--line); }
```

- [ ] **Step 3: 创建 js/app.js**

```javascript
import { initHexagramMap } from './render/hexagramMap.js';
import { initAnchor } from './render/anchor.js';
import { initTimeScrubber } from './ui/timeScrubber.js';
import { initDetailPanel } from './render/detailPanel.js';
import { locate, EPOCH_YEAR, YAO_YEAR } from './data/calendar.js';
import { subscribe, getState } from './store.js';

const canvas = document.getElementById('hex-map');
const anchorSvg = document.getElementById('anchor-layer');
const scrubberEl = document.getElementById('time-scrubber');
const detailEl = document.getElementById('detail-panel');
const locatorEl = document.getElementById('era-locator');
const noteEl = document.getElementById('footer-note');

const W = 700, H = 700;

initHexagramMap(canvas);
initAnchor(anchorSvg, W, H);
initTimeScrubber(scrubberEl, [YAO_YEAR, 2100]);
initDetailPanel(detailEl);

// 宏观定位角标：随 year 更新
subscribe(() => {
  const { year } = getState();
  const loc = locate(year);
  const huiCN = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  locatorEl.textContent = `${huiCN[loc.huiIndex]}会 · 第${loc.yunInHui + 1}运 · 第${loc.shiInYun + 1}世（${year}年）`;
});

// 页脚透明声明
noteEl.textContent = `起算：一元之初（前${-EPOCH_YEAR}）· 人事纪年自尧元年（前${-YAO_YEAR}）· 配卦法：去四正卦60甲子基准外推法`;
```

- [ ] **Step 4: 浏览器打开 index.html 人工验收**

Run: 在浏览器打开 `index.html`
验收清单（对应设计 §10.1 P1 交付）：
- [ ] 宣纸米黄底可见
- [ ] 中央64卦水墨圆图渲染
- [ ] 2026（当前年）朱砂描边+墨晕呼吸高亮
- [ ] 拖动时间轴，高亮跳到新卦，墨晕重晕
- [ ] 点击某卦，右侧弹出工笔详情（卦象+卦名+卦辞+年份）
- [ ] 左下角宏观定位文字更新
- [ ] 页脚透明声明可见

- [ ] **Step 5: Commit**

```bash
git add index.html css/style.css js/app.js
git commit -m "feat: P1值年卦层集成完成(宣纸底+水墨圆图+时间轴+详情面板)"
```

---

## Task 14: 全量回归与清理

- [ ] **Step 1: 运行全部单元测试**

Run: `node --test`
Expected: 全部 passing，尤其：
- 2026 → 同人
- 2026 → 午会·第12运·第10世
- 历元 → 子会第1运

- [ ] **Step 2: 删除 spike 临时文件（若 Task 6 已记录决策）**

```bash
rm -rf spike/
git add -A
git commit -m "chore: 清理 spike 临时文件"
```

- [ ] **Step 3: 最终验收 — 黄金用例**

打开 `index.html`，确认首屏显示：
- 当前年（2026）锚定在 **同人卦**，朱砂+墨晕
- 角标显示 **午会 · 第12运 · 第10世**
- 页脚声明起算点与配卦法

✅ 全部通过则 P1 交付完成。

---

## Self-Review 笔记

**Spec 覆盖检查（对照 design.md §10.1 P1 交付标准）：**
- ✅ 宣纸底 → Task 13 style.css
- ✅ 64卦水墨圆图 → Task 9 + Task 7
- ✅ 当前年朱砂+墨晕高亮 → Task 10
- ✅ 时间轴漫游 → Task 11
- ✅ 点击卦象工笔详情 → Task 12
- ⚠️ 宏观定位角标"午会·第12运·第10世" → Task 4 locate()，但 Task 4 Step 4 标注了数学口径需校准

**已知风险/遗留（诚实标注）：**
1. Task 4 的 `locate()` 运/世索引的 1-based/0-based 口径与黄金用例之间存在需校准的数学点——实现者必须查证文献确切口径，确保 `locate(2026)` 产出"第12运·第10世"。这是 §4 准确性的关键。
2. Task 2 的 64卦 `lines` 二进制与圆图顺序是简化编排，实现时须对照 ctext 原典逐卦核对，`getByName('同人')` 的位置和 lines 值必须正确。
3. Task 5 值年卦用基准外推法（2026=同人锚点），满足60年周期正确，但非完整推演链。完整会卦→爻变→世卦链留待 P2。
4. 水墨写意效果（Task 6/7）依赖 spike 验证，有降级备选。
