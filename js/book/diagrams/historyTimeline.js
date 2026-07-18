// 历史治乱时间轴：拖动游标漫游，实时显示朝代+元会运世定位。
// 预设关键朝代标记点。复用 calendar.js locate()。
import { locate, YAO_YEAR } from '../../data/calendar.js';

const HUI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 关键朝代/事件标记（年份, 名称）
const MARKS = [
  { year: -2357, name: '堯元年' },
  { year: -2070, name: '夏' },
  { year: -1600, name: '商' },
  { year: -1046, name: '周' },
  { year: -770,  name: '東周' },
  { year: -221,  name: '秦' },
  { year: 206,   name: '漢' },
  { year: 618,   name: '唐' },
  { year: 960,   name: '宋' },
  { year: 1368,  name: '明' },
  { year: 1644,  name: '清' },
  { year: 2026,  name: '今' },
];

const MIN_YEAR = -2400;
const MAX_YEAR = 2100;

export function renderHistoryTimeline(container) {
  container.innerHTML = `
    <div class="htl-box">
      <div class="htl-track-wrap">
        <div class="htl-marks">
          ${MARKS.map(m => {
            const pct = ((m.year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;
            return `<div class="htl-mark" style="left:${pct}%" data-year="${m.year}">
              <div class="htl-mark-tick"></div>
              <div class="htl-mark-label">${m.name}</div>
            </div>`;
          }).join('')}
        </div>
        <div class="htl-track" id="htl-track">
          <div class="htl-cursor" id="htl-cursor"></div>
        </div>
      </div>
      <div class="htl-result" id="htl-result"></div>
    </div>`;

  const track = container.querySelector('#htl-track');
  const cursor = container.querySelector('#htl-cursor');
  const result = container.querySelector('#htl-result');

  function setYear(year) {
    year = Math.max(MIN_YEAR, Math.min(MAX_YEAR, Math.round(year)));
    const pct = ((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;
    cursor.style.left = pct + '%';
    const loc = locate(year);
    const bc = (y) => y <= 0 ? '前' + (-y) : String(y);
    // 找最近朝代
    let near = MARKS[0];
    for (const m of MARKS) if (m.year <= year) near = m;
    result.innerHTML = `
      <div class="htl-year">${bc(year)}年</div>
      <div class="htl-loc">${HUI[loc.huiIndex]}會 · 第${loc.yunInHui + 1}運 · 第${loc.shiInYun + 1}世 <small>（全元第${loc.yunAbs + 1}運）</small></div>
      <div class="htl-era">最近朝代：${near.name}（${bc(near.year)}起）</div>`;
  }

  let dragging = false;
  function fromX(clientX) {
    const rect = track.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setYear(MIN_YEAR + pct * (MAX_YEAR - MIN_YEAR));
  }
  track.addEventListener('pointerdown', (e) => {
    dragging = true; track.setPointerCapture(e.pointerId); fromX(e.clientX);
  });
  track.addEventListener('pointermove', (e) => { if (dragging) fromX(e.clientX); });
  track.addEventListener('pointerup', (e) => { dragging = false; track.releasePointerCapture(e.pointerId); });

  // 点击朝代标记跳转
  container.querySelectorAll('.htl-mark').forEach(m => {
    m.addEventListener('click', () => setYear(parseInt(m.dataset.year, 10)));
  });

  setYear(2026);
}
