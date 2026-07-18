// 水墨写意笔触绘制器（共享给 hexagramMap 主图）
// 确定性伪随机：同一卦象每次重绘完全一致，避免闪烁。

const INK = [26, 20, 16]; // 墨色 RGB

// 简易确定性伪随机（mulberry32）
function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 将字符串哈希为种子
function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// 画一条爻。ctx, x/y=左端中心, width=爻长, isYang, rng=可选随机源
export function drawLine(ctx, x, y, width, isYang, rng = Math.random) {
  const h = width * 0.14;
  if (isYang) {
    drawStroke(ctx, x, y, width, h, rng);
  } else {
    // 阴爻：中间断开明显。间隙占整体 24%
    const gap = width * 0.24;
    const segW = (width - gap) / 2;
    drawStroke(ctx, x, y, segW, h, rng);
    drawStroke(ctx, x + segW + gap, y, segW, h, rng);
  }
}

// 单条墨笔：多层叠加 + 两端收笔 + 中段浓墨
function drawStroke(ctx, x, y, w, h, rng) {
  // 底层：淡墨晕染（更宽更淡）
  const wash = ctx.createLinearGradient(x, 0, x + w, 0);
  wash.addColorStop(0, `rgba(${INK.join(',')},0.04)`);
  wash.addColorStop(0.15, `rgba(${INK.join(',')},0.12)`);
  wash.addColorStop(0.5, `rgba(${INK.join(',')},0.18)`);
  wash.addColorStop(0.85, `rgba(${INK.join(',')},0.12)`);
  wash.addColorStop(1, `rgba(${INK.join(',')},0.04)`);
  ctx.beginPath();
  ctx.strokeStyle = wash;
  ctx.lineWidth = h * 1.8;
  ctx.lineCap = 'round';
  const wob0 = (rng() - 0.5) * 1.2;
  ctx.moveTo(x, y + wob0);
  ctx.bezierCurveTo(
    x + w * 0.25, y + wob0 * 1.4,
    x + w * 0.75, y - wob0 * 1.2,
    x + w, y - wob0 * 0.6
  );
  ctx.stroke();

  // 中层：3–5 次主笔触，浓淡不均
  const passes = 3 + Math.floor(rng() * 2);
  for (let i = 0; i < passes; i++) {
    ctx.beginPath();
    const grad = ctx.createLinearGradient(x, 0, x + w, 0);
    const a = 0.22 + rng() * 0.28;
    grad.addColorStop(0, `rgba(${INK.join(',')},${(a * 0.35).toFixed(3)})`);
    grad.addColorStop(0.12, `rgba(${INK.join(',')},${(a * 0.85).toFixed(3)})`);
    grad.addColorStop(0.5, `rgba(${INK.join(',')},${a.toFixed(3)})`);
    grad.addColorStop(0.88, `rgba(${INK.join(',')},${(a * 0.85).toFixed(3)})`);
    grad.addColorStop(1, `rgba(${INK.join(',')},${(a * 0.35).toFixed(3)})`);
    ctx.strokeStyle = grad;
    ctx.lineWidth = h * (0.7 + rng() * 0.55);
    ctx.lineCap = 'round';
    const wob = (rng() - 0.5) * 2.2;
    const midWob = (rng() - 0.5) * 1.6;
    ctx.moveTo(x, y + wob * 0.5);
    ctx.bezierCurveTo(
      x + w * 0.28, y + midWob,
      x + w * 0.72, y - midWob * 0.8,
      x + w, y - wob * 0.4
    );
    ctx.stroke();
  }

  // 飞白：偶尔在中段加一条极细断续线
  if (rng() > 0.55) {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(${INK.join(',')},0.18)`;
    ctx.lineWidth = h * 0.25;
    ctx.setLineDash([1.5, 2.5 + rng() * 2]);
    const fy = y + (rng() - 0.5) * h * 0.4;
    ctx.moveTo(x + w * 0.18, fy);
    ctx.lineTo(x + w * 0.82, fy);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

// 画完整一卦（6爻自下而上）。cx/cy=卦象中心, scale=尺寸, lines=6位二进制串
// seedKey 用于确定性笔触（传入卦名或 lines 即可）
export function drawHexagram(ctx, cx, cy, scale, lines, seedKey) {
  const rng = makeRng(hashSeed(String(seedKey ?? lines) + '|' + scale));
  const lineW = scale * 0.82;
  const gap = scale * 0.16;
  for (let i = 0; i < 6; i++) {
    // 每爻独立子种子，保证层间变化
    const lineRng = makeRng((hashSeed(String(seedKey ?? lines) + ':' + i) + Math.floor(scale * 10)) >>> 0);
    const y = cy + (2.5 - i) * (scale * 0.20 + gap);
    drawLine(ctx, cx - lineW / 2, y, lineW, lines[i] === '1', lineRng);
  }
}

// 导出工具供其它模块做确定性装饰
export { makeRng, hashSeed };
