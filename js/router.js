// 零依赖 hash 路由。路由表 path -> handler。
let routes = {};
let started = false;

// 解析 location.hash 为标准路径（无 # 前缀，根路径为 '/'）
export function parseHash(hash) {
  const h = hash || '';
  const path = h.startsWith('#') ? h.slice(1) : h;
  return path === '' ? '/' : path;
}

// 编程式导航
export function navigate(path) {
  if (typeof location !== 'undefined') {
    location.hash = '#' + path;
  }
}

// 获取当前路径
export function currentPath() {
  if (typeof location === 'undefined') return '/';
  return parseHash(location.hash);
}

// 注册路由表并启动监听。routes: { '/book/intro': handler, ... }
export function start(routeTable) {
  routes = routeTable;
  if (started) return;
  started = true;
  if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', dispatch);
    // 首次加载立即派发
    dispatch();
  }
}

function dispatch() {
  const path = currentPath();
  const handler = routes[path];
  if (handler) handler(path);
  else if (routes['*']) routes['*'](path); // 兜底
}

// 仅供测试：重置内部状态
export function _reset() {
  routes = {};
  started = false;
}
