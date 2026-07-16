// 朱砂描边 + 墨晕呼吸锚点。标示当前年值年卦的位置。
// 作为 SVG 叠在 Canvas 主图之上（pointer-events: none，不拦截点击）。
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
    const idx = HEXAGRAMS.findIndex((h) => h.name === currentHex.name);
    const angle = (idx / HEXAGRAMS.length) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * R;
    const y = cy + Math.sin(angle) * R;

    // 朱砂描边圆圈（定位"现在"）+ 墨晕呼吸（时间流动感）
    svg.innerHTML = `
      <circle cx="${x}" cy="${y}" r="26" fill="${ZHU}" opacity="0.10">
        <animate attributeName="r" values="22;30;22" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.06;0.16;0.06" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="${x}" cy="${y}" r="20" fill="none" stroke="${ZHU}" stroke-width="2"/>
    `;
  }

  subscribe(render);
  render();
}
