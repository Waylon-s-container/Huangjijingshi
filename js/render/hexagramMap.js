// 64卦水墨圆图主图。
// 外环：地支刻度 + 装饰环（浑天仪感）
// 中环：64卦水墨卦象
// 内环：中心印章式年份/值年卦名
// 点击卦象触发选中。
import { HEXAGRAMS } from '../data/hexagrams.js';
import { valueYearHexagram } from '../data/calendar.js';
import { drawHexagram } from './inkBrush.js';
import { getState, setState, subscribe } from '../store.js';

const HUI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const INK = '#2a2418';
const INK_LIGHT = '#6a5a3a';
const LINE = '#8a7a5a';
const ZHU = '#a02020';

// canvas=主图画布元素。返回 { render }
export function initHexagramMap(canvas) {
  const ctx = canvas.getContext('2d');

  function render() {
    const { year, selectedHexagram } = getState();
    const w = canvas.width, h = canvas.height;
    const cx = w / 2, cy = h / 2;
    const R = Math.min(w, h) * 0.40; // 卦象环半径
    ctx.clearRect(0, 0, w, h);

    const currentHex = valueYearHexagram(year);

    // —— 装饰层 ——
    drawPaperGlow(ctx, cx, cy, R);
    drawDecorativeRings(ctx, cx, cy, R);
    drawBranchTicks(ctx, cx, cy, R);
    drawCardinalRays(ctx, cx, cy, R);

    // —— 64卦 ——
    HEXAGRAMS.forEach((hex, i) => {
      const angle = (i / HEXAGRAMS.length) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * R;
      const y = cy + Math.sin(angle) * R;
      const isCurrent = hex.name === currentHex.name;
      const isSelected = selectedHexagram && selectedHexagram.name === hex.name;
      const isCardinal = !!hex.isCardinal;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + Math.PI / 2);

      // 当前/选中底晕
      if (isCurrent || isSelected) {
        const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, isCurrent ? 28 : 22);
        if (isCurrent) {
          grad.addColorStop(0, 'rgba(160,32,32,0.22)');
          grad.addColorStop(0.6, 'rgba(160,32,32,0.08)');
          grad.addColorStop(1, 'rgba(160,32,32,0)');
        } else {
          grad.addColorStop(0, 'rgba(90,74,50,0.18)');
          grad.addColorStop(1, 'rgba(90,74,50,0)');
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, isCurrent ? 28 : 22, 0, Math.PI * 2);
        ctx.fill();
      }

      // 四正卦淡朱砂点缀
      if (isCardinal && !isCurrent) {
        ctx.globalAlpha = 0.85;
      }
      drawHexagram(ctx, 0, 0, isCurrent ? 36 : (isSelected ? 26 : 18), hex.lines, hex.name);
      ctx.globalAlpha = 1;
      ctx.restore();

      // 四正卦名（不旋转，始终正读）
      if (isCardinal) {
        const lx = cx + Math.cos(angle) * (R + 28);
        const ly = cy + Math.sin(angle) * (R + 28);
        ctx.save();
        ctx.font = '700 12px "Noto Serif SC", serif';
        ctx.fillStyle = ZHU;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hex.name, lx, ly);
        ctx.restore();
      }
    });

    // —— 中心印章 ——
    drawCenterSeal(ctx, cx, cy, year, currentHex);
  }

  // 点击命中检测
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const R = Math.min(canvas.width, canvas.height) * 0.40;
    let nearest = null, minDist = Infinity;
    HEXAGRAMS.forEach((hex, i) => {
      const angle = (i / HEXAGRAMS.length) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * R;
      const y = cy + Math.sin(angle) * R;
      const d = Math.hypot(mx - x, my - y);
      if (d < minDist && d < 34) { minDist = d; nearest = hex; }
    });
    if (nearest) setState({ selectedHexagram: nearest });
  });

  subscribe(render);
  render();
  return { render };
}

// 中心柔光（宣纸上的一圈淡晕）
function drawPaperGlow(ctx, cx, cy, R) {
  const g = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.15);
  g.addColorStop(0, 'rgba(235,224,200,0.55)');
  g.addColorStop(0.55, 'rgba(235,224,200,0.15)');
  g.addColorStop(1, 'rgba(235,224,200,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.15, 0, Math.PI * 2);
  ctx.fill();
}

// 多层装饰环
function drawDecorativeRings(ctx, cx, cy, R) {
  const rings = [
    { r: R + 38, w: 1.2, color: 'rgba(90,74,50,0.55)' },
    { r: R + 32, w: 0.5, color: 'rgba(138,122,90,0.45)', dash: [2, 3] },
    { r: R + 14, w: 0.7, color: 'rgba(138,122,90,0.35)' },
    { r: R - 22, w: 0.5, color: 'rgba(138,122,90,0.25)', dash: [1.5, 4] },
    { r: 52, w: 0.8, color: 'rgba(90,74,50,0.4)' },
    { r: 46, w: 0.4, color: 'rgba(160,32,32,0.25)' },
  ];
  for (const ring of rings) {
    ctx.beginPath();
    ctx.strokeStyle = ring.color;
    ctx.lineWidth = ring.w;
    if (ring.dash) ctx.setLineDash(ring.dash);
    else ctx.setLineDash([]);
    ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

// 十二地支刻度（外环）
function drawBranchTicks(ctx, cx, cy, R) {
  const outer = R + 38;
  ctx.font = '11px "Noto Serif SC", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    // 主刻度
    const x1 = cx + Math.cos(a) * (outer - 1);
    const y1 = cy + Math.sin(a) * (outer - 1);
    const x2 = cx + Math.cos(a) * (outer - 8);
    const y2 = cy + Math.sin(a) * (outer - 8);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(90,74,50,0.7)';
    ctx.lineWidth = 1.2;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    // 地支字
    const tx = cx + Math.cos(a) * (outer + 14);
    const ty = cy + Math.sin(a) * (outer + 14);
    ctx.fillStyle = INK_LIGHT;
    ctx.fillText(HUI[i], tx, ty);

    // 细分刻度（每支间 4 格）
    for (let j = 1; j < 5; j++) {
      const a2 = a + (j / 5) * (Math.PI * 2 / 12);
      const sx1 = cx + Math.cos(a2) * (outer - 1);
      const sy1 = cy + Math.sin(a2) * (outer - 1);
      const sx2 = cx + Math.cos(a2) * (outer - 4);
      const sy2 = cy + Math.sin(a2) * (outer - 4);
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(138,122,90,0.4)';
      ctx.lineWidth = 0.6;
      ctx.moveTo(sx1, sy1);
      ctx.lineTo(sx2, sy2);
      ctx.stroke();
    }
  }
}

// 四正方向射线（淡）
function drawCardinalRays(ctx, cx, cy, R) {
  // 乾坤坎离在圆图中的大致方位：按 isCardinal 实际角度画射线
  HEXAGRAMS.forEach((hex, i) => {
    if (!hex.isCardinal) return;
    const a = (i / HEXAGRAMS.length) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(160,32,32,0.12)';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([3, 5]);
    ctx.moveTo(cx + Math.cos(a) * 54, cy + Math.sin(a) * 54);
    ctx.lineTo(cx + Math.cos(a) * (R - 24), cy + Math.sin(a) * (R - 24));
    ctx.stroke();
  });
  ctx.setLineDash([]);
}

// 中心印章：年份 + 值年卦名
function drawCenterSeal(ctx, cx, cy, year, hex) {
  // 外方内圆（仿印章）
  const s = 38;
  ctx.save();
  // 淡朱砂底
  ctx.fillStyle = 'rgba(160,32,32,0.06)';
  ctx.strokeStyle = 'rgba(160,32,32,0.45)';
  ctx.lineWidth = 1.2;
  roundRect(ctx, cx - s, cy - s, s * 2, s * 2, 3);
  ctx.fill();
  ctx.stroke();

  // 内圆
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(160,32,32,0.25)';
  ctx.lineWidth = 0.6;
  ctx.arc(cx, cy, s - 6, 0, Math.PI * 2);
  ctx.stroke();

  // 年份
  ctx.fillStyle = INK_LIGHT;
  ctx.font = '10px "Noto Serif SC", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(year), cx, cy - 14);

  // 卦名
  ctx.fillStyle = INK;
  ctx.font = '700 18px "Noto Serif SC", serif';
  ctx.fillText(hex.name, cx, cy + 4);

  // 小字
  ctx.fillStyle = ZHU;
  ctx.font = '9px "Noto Serif SC", serif';
  ctx.fillText('值年', cx, cy + 20);
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
