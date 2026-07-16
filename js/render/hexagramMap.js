// 64卦水墨圆图主图。64卦沿圆周排列，当前年值年卦用更大尺寸突出。
// 点击卦象触发选中（详情面板响应）。
import { HEXAGRAMS } from '../data/hexagrams.js';
import { valueYearHexagram } from '../data/calendar.js';
import { drawHexagram } from './inkBrush.js';
import { getState, setState, subscribe } from '../store.js';

// canvas=主图画布元素。返回 { render } 供外部触发重绘。
export function initHexagramMap(canvas) {
  const ctx = canvas.getContext('2d');

  function render() {
    const { year } = getState();
    const w = canvas.width, h = canvas.height;
    const cx = w / 2, cy = h / 2;
    const R = Math.min(w, h) * 0.42;
    ctx.clearRect(0, 0, w, h);

    const currentHex = valueYearHexagram(year);

    // 64卦沿圆周等分排列，自正上方顺时针
    HEXAGRAMS.forEach((hex, i) => {
      const angle = (i / HEXAGRAMS.length) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * R;
      const y = cy + Math.sin(angle) * R;
      const isCurrent = hex.name === currentHex.name;
      ctx.save();
      ctx.translate(x, y);
      // 小卦象朝向圆心（旋转使爻线水平指向圆心方向）
      ctx.rotate(angle + Math.PI / 2);
      drawHexagram(ctx, 0, 0, isCurrent ? 34 : 20, hex.lines);
      ctx.restore();
    });
  }

  // 点击命中检测：找最近的卦象
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    // 处理 CSS 缩放：换算到画布内部坐标
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const R = Math.min(canvas.width, canvas.height) * 0.42;
    let nearest = null, minDist = Infinity;
    HEXAGRAMS.forEach((hex, i) => {
      const angle = (i / HEXAGRAMS.length) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * R;
      const y = cy + Math.sin(angle) * R;
      const d = Math.hypot(mx - x, my - y);
      if (d < minDist && d < 32) { minDist = d; nearest = hex; }
    });
    if (nearest) setState({ selectedHexagram: nearest });
  });

  subscribe(render);
  render();
  return { render };
}
