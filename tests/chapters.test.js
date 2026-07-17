import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, getChapter, getNext, getPrev } from '../js/book/chapters.js';

test('章节列表含导言与至少两章', () => {
  const ids = CHAPTERS.map(c => c.id);
  assert.ok(ids.includes('intro'));
  assert.ok(ids.includes('ch1'));
  assert.ok(ids.includes('ch2'));
});

test('每章含必要字段', () => {
  for (const c of CHAPTERS) {
    assert.ok(typeof c.id === 'string');
    assert.ok(typeof c.title === 'string' && c.title.length > 0);
    assert.ok(typeof c.draft === 'boolean');
  }
});

test('getChapter 按 id 查找', () => {
  assert.equal(getChapter('intro').title, '導言：皇極經世是什麼');
});

test('getNext / getPrev 章节导航', () => {
  assert.equal(getNext('intro').id, 'ch1');
  assert.equal(getPrev('ch1').id, 'intro');
  assert.equal(getPrev('intro'), null);
  assert.equal(getNext('ch2').id, 'ch3');
});
