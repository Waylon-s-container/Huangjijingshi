// 公历↔皇极历换算与值年卦推演（纯函数，无 DOM 依赖）
export const EPOCH_YEAR = -67017; // 一元之初
export const YAO_YEAR = -2357;    // 尧元年（人事纪年起始，午会开端附近）

// 距一元之初的年数（含无公元0年校正）
// 前 A 年到后 B 年 = A + B - 1（中间没有公元0年）
// 前 A 年到前 C 年（A<C）= A - C
export function yearsSinceEpoch(year) {
  if (year > 0) {
    return (-EPOCH_YEAR) + year - 1;   // 67017 + year - 1
  }
  return (-EPOCH_YEAR) - (-year);       // 67017 - |year|
}

// 十二会名（地支），索引 0=子 … 6=午 … 11=亥
const HUI_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 元会运世定位。所有索引均为 0-based；显示时 +1 转 1-based。
// 返回字段：yuanIndex/huiIndex/huiName/yunInHui(会内)/yunAbs(全元)/shiInYun/yearInShi
export function locate(year) {
  const total = yearsSinceEpoch(year);
  const yuanIndex = Math.floor(total / 129600);
  const rem1 = total % 129600;
  const huiIndex = Math.floor(rem1 / 10800);
  const rem2 = rem1 % 10800;
  const yunInHui = Math.floor(rem2 / 360);
  const rem3 = rem2 % 360;
  const shiInYun = Math.floor(rem3 / 30);
  const yearInShi = rem3 % 30;
  return {
    yuanIndex,
    huiIndex,
    huiName: HUI_NAMES[huiIndex],
    yunInHui,
    yunAbs: huiIndex * 30 + yunInHui, // 全元第几运(0-based)
    shiInYun,
    yearInShi,
  };
}
