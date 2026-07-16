// 水墨写意笔触绘制器（共享给 hexagramMap 主图与 detailPanel 详情）
// 将阴阳爻画成水墨毛笔笔触。
// 注意：本模块依赖 Canvas 2D Context，仅在浏览器环境调用。

const INK = [26, 20, 16]; // 墨色 RGB

// 画一条爻。ctx=画布上下文, x/y=左端中心, width=爻长, isYang=是否阳爻
export function drawLine(ctx, x, y, width, isYang) {
  const h = width * 0.12; // 笔画粗细
  if (isYang) {
    drawStroke(ctx, x, y, width, h);
  } else {
    // 阴爻：中间断开要明显。两段较短，间隙占整体的 22%。
    const gap = width * 0.22;
    const segW = (width - gap) / 2;
    drawStroke(ctx, x, y, segW, h);
    drawStroke(ctx, x + segW + gap, y, segW, h);
  }
}

// 单条墨笔：多次叠加描边 + 线性渐变 = 浓淡；两端收笔无飞白
function drawStroke(ctx, x, y, w, h) {
  // 主体：5次叠加描边，每次随机透明度和粗细，模拟墨色不均
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
}

// 画完整一卦（6爻自下而上）。cx/cy=卦象中心, scale=尺寸, lines=6位二进制串
export function drawHexagram(ctx, cx, cy, scale, lines) {
  const lineW = scale * 0.8;
  const gap = scale * 0.18;
  for (let i = 0; i < 6; i++) {
    const y = cy + (2.5 - i) * (scale * 0.22 + gap);
    drawLine(ctx, cx - lineW / 2, y, lineW, lines[i] === '1');
  }
}
