// 详情面板：点击卦象后弹出，工笔规整风格（等宽墨线 SVG）。
// 与主图的写意风格区分：这里要清晰可辨。
import { subscribe, getState } from '../store.js';

// container=详情面板容器
export function initDetailPanel(container) {
  function render() {
    const { selectedHexagram, year } = getState();
    if (!selectedHexagram) {
      container.innerHTML = '';
      return;
    }
    const h = selectedHexagram;
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

// 工笔规整卦象：等宽矩形墨线，阴阳分明
function renderGongbiHexagram(lines) {
  let yao = '';
  // 自上而下渲染（上爻在顶）：lines[5]=上爻 … lines[0]=初爻
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
