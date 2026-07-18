// 时间轴：拖拽改变 state.year，朱砂游标随拖动移动。
// 两端显示年份刻度；拖动时游标上方浮显当前年。
import { getState, setState, subscribe } from '../store.js';

// container=时间轴容器元素, range=[minYear, maxYear]
export function initTimeScrubber(container, range = [-2357, 2100]) {
  const [minY, maxY] = range;

  // 端点年份标签
  const labels = document.createElement('div');
  labels.className = 'ts-labels';
  labels.innerHTML = `<span>${fmtYear(minY)}</span><span>${fmtYear(maxY)}</span>`;
  container.appendChild(labels);

  const track = document.createElement('div');
  track.className = 'ts-track';
  const cursor = document.createElement('div');
  cursor.className = 'ts-cursor';
  const tip = document.createElement('div');
  tip.className = 'ts-tip';
  cursor.appendChild(tip);
  track.appendChild(cursor);
  container.appendChild(track);

  function updateCursor() {
    const { year } = getState();
    const pct = ((year - minY) / (maxY - minY)) * 100;
    cursor.style.left = `${pct}%`;
    tip.textContent = fmtYear(year);
    container.dataset.year = year;
  }

  let dragging = false;
  function setFromX(clientX) {
    const rect = track.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const year = Math.round(minY + pct * (maxY - minY));
    setState({ year });
  }
  track.addEventListener('pointerdown', (e) => {
    dragging = true;
    track.classList.add('dragging');
    track.setPointerCapture(e.pointerId);
    setFromX(e.clientX);
  });
  track.addEventListener('pointermove', (e) => {
    if (dragging) setFromX(e.clientX);
  });
  track.addEventListener('pointerup', (e) => {
    dragging = false;
    track.classList.remove('dragging');
    track.releasePointerCapture(e.pointerId);
  });

  subscribe(updateCursor);
  updateCursor();
}

function fmtYear(y) {
  return y <= 0 ? `前${-y}` : String(y);
}
