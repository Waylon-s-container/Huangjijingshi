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
