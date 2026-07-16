// 时间轴：拖拽改变 state.year，朱砂游标随拖动移动。
import { getState, setState, subscribe } from '../store.js';

// container=时间轴容器元素, range=[minYear, maxYear]
export function initTimeScrubber(container, range = [-2357, 2100]) {
  const [minY, maxY] = range;
  const track = document.createElement('div');
  track.className = 'ts-track';
  const cursor = document.createElement('div');
  cursor.className = 'ts-cursor';
  track.appendChild(cursor);
  container.appendChild(track);

  function updateCursor() {
    const { year } = getState();
    const pct = ((year - minY) / (maxY - minY)) * 100;
    cursor.style.left = `${pct}%`;
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
    track.setPointerCapture(e.pointerId);
    setFromX(e.clientX);
  });
  track.addEventListener('pointermove', (e) => {
    if (dragging) setFromX(e.clientX);
  });
  track.addEventListener('pointerup', (e) => {
    dragging = false;
    track.releasePointerCapture(e.pointerId);
  });

  subscribe(updateCursor);
  updateCursor();
}
