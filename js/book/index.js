// 教材入口：按章节id加载内容数据，挂载图解，渲染。
import intro from './intro.js';
import ch1 from './ch1.js';
import ch2 from './ch2.js';
import ch3 from './ch3.js';
import { renderBook } from './render.js';
import { renderEraNesting } from './diagrams/eraNesting.js';
import { renderFangyuanTu } from './diagrams/fangyuanTu.js';
import { renderXiaoXi } from './diagrams/xiaoXi.js';
import { renderTimeLocator } from './diagrams/timeLocator.js';

const CHAPTER_DATA = { intro, ch1, ch2, ch3 };
const DIAGRAMS = {
  eraNesting: renderEraNesting,
  fangyuanTu: renderFangyuanTu,
  xiaoXi: renderXiaoXi,
  timeLocator: renderTimeLocator,
};

// 渲染教材某章节到 container
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
