// 方圆图图解：外圆内方。圆图64卦点位，方图8x8方阵。
export function renderFangyuanTu(container) {
  let circleDots = '';
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2 - Math.PI / 2;
    const x = 130 + Math.cos(a) * 100;
    const y = 130 + Math.sin(a) * 100;
    circleDots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2" fill="#3a3022"/>`;
  }
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
