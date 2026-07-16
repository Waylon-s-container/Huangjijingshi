import { test } from 'node:test';
import assert from 'node:assert/strict';
import { yearsSinceEpoch, locate, EPOCH_YEAR, YAO_YEAR } from '../js/data/calendar.js';

test('历元边界：前67017年距元初为0', () => {
  assert.equal(yearsSinceEpoch(EPOCH_YEAR), 0);
});

test('尧元年距元初为64660', () => {
  // 67017 - 2357 = 64660
  assert.equal(yearsSinceEpoch(YAO_YEAR), 64660);
});

test('2026年距元初为69042（无公元0年校正）', () => {
  // 67017 + 2026 - 1 = 69042
  assert.equal(yearsSinceEpoch(2026), 69042);
});

test('公元元年距元初为67017', () => {
  assert.equal(yearsSinceEpoch(1), 67017);
});

test('2026年定位：午七会·会内第12运·全元第192运·运内第10世', () => {
  const loc = locate(2026);
  assert.equal(loc.yuanIndex, 0);      // 第1元(索引0)
  assert.equal(loc.huiIndex, 6);       // 第7会=午(索引6)
  assert.equal(loc.huiName, '午');
  assert.equal(loc.yunInHui, 11);      // 会内第12运(0-based索引11)
  assert.equal(loc.yunAbs, 191);       // 全元第192运(0-based索引191)
  assert.equal(loc.shiInYun, 9);       // 运内第10世(0-based索引9)
  assert.equal(loc.yearInShi, 12);     // 世内第13年(0-based索引12)
});

test('尧元年位于巳会（午会始于前2217年，尧元年前2357在巳会末尾）', () => {
  const loc = locate(-2357);
  // 尧元年距元初64660年，64800/10800=6，64660<64800 故落巳会(索引5)
  assert.equal(loc.huiName, '巳');
});

test('午会始于公元前2217年', () => {
  // 67017 - 64800 = 2217，午会第1年
  const loc = locate(-2217);
  assert.equal(loc.huiName, '午');
  assert.equal(loc.yunInHui, 0);
});

test('历元位于子会第1运第1世', () => {
  const loc = locate(-67017);
  assert.equal(loc.huiName, '子');
  assert.equal(loc.yunInHui, 0);
  assert.equal(loc.shiInYun, 0);
});
