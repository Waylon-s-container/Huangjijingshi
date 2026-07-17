import { test } from 'node:test';
import assert from 'node:assert/strict';

// router.js 依赖 location/hashchange，测试里用 stub 全局
test('parseHash 解析 hash 为路径', async () => {
  const { parseHash } = await import('../js/router.js');
  assert.equal(parseHash(''), '/');
  assert.equal(parseHash('#/'), '/');
  assert.equal(parseHash('#/book/intro'), '/book/intro');
  assert.equal(parseHash('#/book/ch1'), '/book/ch1');
});

test('navigate 设置 location.hash', async () => {
  const { navigate, _reset } = await import('../js/router.js');
  _reset(); // 清空内部状态
  const saved = globalThis.location;
  let setHash = '';
  globalThis.location = { get hash() { return setHash; }, set hash(v) { setHash = v; } };
  try {
    navigate('/book/intro');
    assert.equal(globalThis.location.hash, '#/book/intro');
  } finally {
    globalThis.location = saved;
  }
});
