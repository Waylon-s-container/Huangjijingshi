// 应用入口：初始化各模块 + 绑定状态驱动的角标/页脚
import { initHexagramMap } from './render/hexagramMap.js';
import { initAnchor } from './render/anchor.js';
import { initTimeScrubber } from './ui/timeScrubber.js';
import { initDetailPanel } from './render/detailPanel.js';
import { locate, EPOCH_YEAR, YAO_YEAR } from './data/calendar.js';
import { subscribe, getState } from './store.js';

const HUI_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const canvas = document.getElementById('hex-map');
const anchorSvg = document.getElementById('anchor-layer');
const scrubberEl = document.getElementById('time-scrubber');
const detailEl = document.getElementById('detail-panel');
const locatorEl = document.getElementById('era-locator');
const noteEl = document.getElementById('footer-note');

const MAP_SIZE = 700;

initHexagramMap(canvas);
initAnchor(anchorSvg, MAP_SIZE, MAP_SIZE);
initTimeScrubber(scrubberEl, [YAO_YEAR, 2100]);
initDetailPanel(detailEl);

// 宏观定位角标：随 year 更新（1-based 显示，匹配传统说法）
subscribe(() => {
  const { year } = getState();
  const loc = locate(year);
  locatorEl.textContent =
    `${HUI_NAMES[loc.huiIndex]}会 · 第${loc.yunInHui + 1}运 · 第${loc.shiInYun + 1}世（${year}年）`;
});

// 页脚透明声明（设计 §4.5）
noteEl.textContent =
  `起算：一元之初（前${-EPOCH_YEAR}）· 人事纪年自尧元年（前${-YAO_YEAR}）· 配卦法：去四正卦60甲子基准外推法`;
