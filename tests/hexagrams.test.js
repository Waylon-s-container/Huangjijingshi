import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HEXAGRAMS, getById, getByName } from '../js/data/hexagrams.js';

test('共64卦', () => {
  assert.equal(HEXAGRAMS.length, 64);
});

test('每卦含必要字段', () => {
  for (const h of HEXAGRAMS) {
    assert.ok(h.id >= 1 && h.id <= 64, `id 范围: ${h.id}`);
    assert.ok(typeof h.name === 'string' && h.name.length > 0);
    assert.ok(/^[01]{6}$/.test(h.lines), `lines 须6位二进制: ${h.lines}`);
    assert.ok(typeof h.judgment === 'string', 'judgment 卦辞');
  }
});

test('四正卦标记正确', () => {
  const cardinal = HEXAGRAMS.filter(h => h.isCardinal).map(h => h.name);
  // 用集合比较，避免 JS 默认 sort 对中文按码点排序的不稳定结果
  assert.equal(cardinal.length, 4);
  for (const name of ['乾', '坤', '坎', '离']) {
    assert.ok(cardinal.includes(name), `缺少四正卦: ${name}`);
  }
});

test('getById / getByName 查找', () => {
  assert.equal(getById(1).name, '复');
  assert.equal(getByName('同人').id, 13);
});
