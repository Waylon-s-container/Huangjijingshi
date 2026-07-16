// 单一状态源 + 发布-订阅。所有 UI/渲染模块 subscribe 它。
const state = {
  year: new Date().getFullYear(),  // 当前选定年份
  scale: 'year',                   // 当前尺度（P1 固定 'year'）
  selectedHexagram: null,          // 用户点击选中的卦（用于详情面板）
};

const listeners = new Set();

export function getState() {
  return state;
}

export function setState(patch) {
  Object.assign(state, patch);
  listeners.forEach((fn) => {
    try { fn(state); } catch (e) { console.error('store listener error', e); }
  });
}

// 返回取消订阅函数
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
