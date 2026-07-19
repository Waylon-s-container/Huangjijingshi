// 六十甲子与六十卦对应表：列出60甲子→对应卦，当前年(2026=同人)高亮。
// 数据由本站算法生成：去四正卦后的60卦圆图，以2026=同人为基准反推（基准外推法，见§3.4与封面）。
// 学术说明：60甲子配卦的具体起点，各家或不同；此表为本站算法的自洽呈现，非唯一定论。
import { HEXAGRAMS } from '../../data/hexagrams.js';
import { valueYearHexagram, locate } from '../../data/calendar.js';

// 去四正卦后的60卦圆图（按 HEXAGRAMS 圆图序）
const CIRCLE60 = HEXAGRAMS.filter(h => !h.isCardinal);

const JIAZI = [
  '甲子','乙丑','丙寅','丁卯','戊辰','己巳','庚午','辛未','壬申','癸酉',
  '甲戌','乙亥','丙子','丁丑','戊寅','己卯','庚辰','辛巳','壬午','癸未',
  '甲申','乙酉','丙戌','丁亥','戊子','己丑','庚寅','辛卯','壬辰','癸巳',
  '甲午','乙未','丙申','丁酉','戊戌','己亥','庚子','辛丑','壬寅','癸卯',
  '甲辰','乙巳','丙午','丁未','戊申','己酉','庚戌','辛亥','壬子','癸丑',
  '甲寅','乙卯','丙辰','丁巳','戊午','己未','庚申','辛酉','壬戌','癸亥',
];

// 工笔迷你卦象（等宽矩形）
function miniHex(lines) {
  let r = '';
  for (let i = 5; i >= 0; i--) {
    const yang = lines[i] === '1';
    const y = 2 + (5 - i) * 3.2;
    if (yang) r += `<rect x="0" y="${y.toFixed(1)}" width="16" height="2.4" fill="#1a1410"/>`;
    else { r += `<rect x="0" y="${y.toFixed(1)}" width="6" height="2.4" fill="#1a1410"/>`; r += `<rect x="10" y="${y.toFixed(1)}" width="6" height="2.4" fill="#1a1410"/>`; }
  }
  return `<svg viewBox="0 0 16 20" width="16" height="20">${r}</svg>`;
}

export function renderJiaziHexTable(container) {
  // 由本站算法确定甲子起卦：2026=同人=甲子序42，反推甲子序0对应的圆图索引
  const BASE_YEAR = 2026;
  const BASE_HEX = valueYearHexagram(BASE_YEAR); // 同人
  const BASE_IDX = CIRCLE60.findIndex(h => h.name === BASE_HEX.name);
  // 甲子序号: 公元年份 mod 60 === 4 (1984甲子)
  const baseJiaziIdx = ((BASE_YEAR % 60) - 4 + 60) % 60; // 2026 → 42
  const idxAtJiazi0 = ((BASE_IDX - baseJiaziIdx) % 60 + 60) % 60;

  // 当前年高亮
  const curYear = new Date().getFullYear();
  const curJiaziIdx = ((curYear % 60) - 4 + 60) % 60;

  const rows = [];
  for (let i = 0; i < 60; i++) {
    const hexIdx = (idxAtJiazi0 + i) % 60;
    const hex = CIRCLE60[hexIdx];
    const year = 1984 + i; // 甲子年1984起的首轮
    const isCur = i === curJiaziIdx;
    rows.push(`
      <tr class="${isCur ? 'jht-cur' : ''}">
        <td class="jht-jiazi">${JIAZI[i]}</td>
        <td class="jht-mini">${miniHex(hex.lines)}</td>
        <td class="jht-name">${hex.name}</td>
        <td class="jht-year">${year}</td>
      </tr>`);
  }

  container.innerHTML = `
    <div class="jht-box">
      <div class="jht-explain">
        去四正卦（乾、坤、坎、離）後，餘六十卦配六十甲子，六十年一輪。
        下表依本站基準外推法（2026=同人為錨）排列，當前年（${curYear}）朱砂標示。
      </div>
      <div class="jht-grid">
        <table class="jht-table">
          <thead><tr><th>甲子</th><th></th><th>卦</th><th>首輪年</th></tr></thead>
          <tbody>${rows.slice(0, 30).join('')}</tbody>
        </table>
        <table class="jht-table">
          <thead><tr><th>甲子</th><th></th><th>卦</th><th>首輪年</th></tr></thead>
          <tbody>${rows.slice(30, 60).join('')}</tbody>
        </table>
      </div>
      <div class="jht-note">
        註：本表為本站算法（2026=同人基準反推）的自洽呈現。六十甲子配卦的具體起點，文獻或不同，此表非唯一定論。完整推演鏈見§3.3。
      </div>
    </div>`;
}
