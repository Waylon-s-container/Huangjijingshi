// 国际化模块：简繁切换。
// 内容源为繁体（zh-Hant），通过 OpenCC 实时转换为简体（zh-Hans）。
// OpenCC 通过 index.html 的 CDN script 标签全局加载（window.OpenCC）。

let lang = 'hant'; // 'hant'（繁，默认）| 'hans'（简）
let toSimplified = null; // OpenCC 转换器，加载后赋值
let ready = false;

const listeners = new Set();

// 初始化 OpenCC 转换器（异步：等待 CDN 脚本加载）
export async function initI18n() {
  // 等待全局 OpenCC 可用
  let waited = 0;
  while (typeof window !== 'undefined' && !window.OpenCC && waited < 5000) {
    await new Promise(r => setTimeout(r, 50));
    waited += 50;
  }
  if (typeof window !== 'undefined' && window.OpenCC) {
    toSimplified = window.OpenCC.Converter({ from: 't', to: 'cn', mode: 'default' });
    ready = true;
  } else {
    console.warn('OpenCC 未加载，简繁切换将不可用（保持繁体）');
  }
}

// 当前语言
export function getLang() { return lang; }
export function isReady() { return ready; }

// 切换语言，触发所有监听者重渲染
export function toggleLang() {
  lang = lang === 'hant' ? 'hans' : 'hant';
  listeners.forEach(fn => { try { fn(lang); } catch (e) { console.error(e); } });
  return lang;
}

export function subscribeLang(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// 核心转换函数：文本经此包装后按当前语言输出。
// 繁体（默认）原样返回；简体则用 OpenCC 转换。
// 若 OpenCC 未就绪，降级返回原文（保持繁体）。
export function t(text) {
  if (typeof text !== 'string') return text;
  if (lang === 'hant' || !toSimplified) return text;
  return toSimplified(text);
}
