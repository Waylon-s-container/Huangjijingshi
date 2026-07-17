// 元会运世嵌套圈图解：同心环表示元→会→运→世的嵌套，当前午会高亮。
export function renderEraNesting(container) {
  container.innerHTML = `
    <svg viewBox="0 0 260 260" class="diagram-svg">
      <circle cx="130" cy="130" r="120" fill="none" stroke="#8a7a5a" stroke-width="1"/>
      <circle cx="130" cy="130" r="92" fill="none" stroke="#8a7a5a" stroke-width="0.8" stroke-dasharray="3,3"/>
      <circle cx="130" cy="130" r="64" fill="none" stroke="#8a7a5a" stroke-width="0.8" stroke-dasharray="3,3"/>
      <circle cx="130" cy="130" r="36" fill="none" stroke="#8a7a5a" stroke-width="0.8" stroke-dasharray="3,3"/>
      <g font-size="9" fill="#6a5a3a" text-anchor="middle">
        <text x="130" y="18">子</text><text x="165" y="22">丑</text><text x="196" y="36">寅</text>
        <text x="218" y="62">卯</text><text x="230" y="90">辰</text><text x="234" y="134">巳</text>
      </g>
      <path d="M 130 130 L 130 10 A 120 120 0 0 1 250 130 Z" fill="#a02020" opacity="0.10"/>
      <text x="180" y="160" font-size="11" fill="#a02020" text-anchor="middle">午會（今）</text>
      <text x="130" y="134" font-size="9" fill="#6a5a3a" text-anchor="middle">元</text>
      <text x="130" y="70" font-size="8" fill="#6a5a3a" text-anchor="middle">會</text>
      <text x="130" y="102" font-size="8" fill="#6a5a3a" text-anchor="middle">運</text>
      <text x="130" y="118" font-size="8" fill="#6a5a3a" text-anchor="middle">世</text>
    </svg>
    <div class="diagram-caption">元會運世同心嵌套，午會為今所處（朱砂標示）</div>`;
}
