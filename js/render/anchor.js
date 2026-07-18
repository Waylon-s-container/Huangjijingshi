// 朱砂描边 + 墨晕呼吸锚点。标示当前年值年卦的位置。
// 作为 SVG 叠在 Canvas 主图之上（pointer-events: none）。
import { HEXAGRAMS } from '../data/hexagrams.js';
import { valueYearHexagram } from '../data/calendar.js';
import { subscribe, getState } from '../store.js';

const ZHU = '#a02020';

// svg=覆盖在主图上的SVG元素, canvasW/canvasH=主图尺寸
export function initAnchor(svg, canvasW, canvasH) {
  const cx = canvasW / 2, cy = canvasH / 2;
  const R = Math.min(canvasW, canvasH) * 0.40; // 与 hexagramMap 一致

  function render() {
    const { year } = getState();
    const currentHex = valueYearHexagram(year);
    const idx = HEXAGRAMS.findIndex((h) => h.name === currentHex.name);
    const angle = (idx / HEXAGRAMS.length) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * R;
    const y = cy + Math.sin(angle) * R;

    // 多层：外墨晕呼吸 → 中层朱砂环 → 内点 → 指向中心的细射线
    svg.innerHTML = `
      <defs>
        <radialGradient id="ink-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${ZHU}" stop-opacity="0.28"/>
          <stop offset="55%" stop-color="${ZHU}" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="${ZHU}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <!-- 墨晕呼吸 -->
      <circle cx="${x}" cy="${y}" r="34" fill="url(#ink-halo)">
        <animate attributeName="r" values="28;40;28" dur="3.2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.7;1;0.7" dur="3.2s" repeatCount="indefinite"/>
      </circle>
      <!-- 外环虚线 -->
      <circle cx="${x}" cy="${y}" r="26" fill="none" stroke="${ZHU}" stroke-width="0.8"
              stroke-dasharray="2 3" opacity="0.55">
        <animateTransform attributeName="transform" type="rotate"
          from="0 ${x} ${y}" to="360 ${x} ${y}" dur="18s" repeatCount="indefinite"/>
      </circle>
      <!-- 主朱砂环 -->
      <circle cx="${x}" cy="${y}" r="22" fill="none" stroke="${ZHU}" stroke-width="2" opacity="0.9"/>
      <!-- 内环 -->
      <circle cx="${x}" cy="${y}" r="17" fill="none" stroke="${ZHU}" stroke-width="0.6" opacity="0.45"/>
      <!-- 四向小刻度 -->
      ${[0, 90, 180, 270].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = x + Math.cos(rad) * 22;
        const y1 = y + Math.sin(rad) * 22;
        const x2 = x + Math.cos(rad) * 26;
        const y2 = y + Math.sin(rad) * 26;
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ZHU}" stroke-width="1.2" opacity="0.7"/>`;
      }).join('')}
      <!-- 中心朱砂点 -->
      <circle cx="${x}" cy="${y}" r="2.5" fill="${ZHU}" opacity="0.85">
        <animate attributeName="r" values="2;3.2;2" dur="3.2s" repeatCount="indefinite"/>
      </circle>
    `;
  }

  subscribe(render);
  render();
}
