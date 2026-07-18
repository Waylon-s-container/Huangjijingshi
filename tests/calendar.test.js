import { test } from 'node:test';
import assert from 'node:assert/strict';
import { yearsSinceEpoch, locate, valueYearHexagram, EPOCH_YEAR, YAO_YEAR } from '../js/data/calendar.js';

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

// ===== 值年卦推演（基准外推法，P1） =====
test('2026年值年卦为同人（黄金用例）', () => {
  const hex = valueYearHexagram(2026);
  assert.equal(hex.name, '同人');
});

test('值年卦返回完整卦对象', () => {
  const hex = valueYearHexagram(2026);
  assert.equal(hex.lines.length, 6);
  assert.ok(typeof hex.judgment === 'string');
});

test('60年周期：2086与1966同为同人', () => {
  assert.equal(valueYearHexagram(2086).name, '同人');
  assert.equal(valueYearHexagram(1966).name, '同人');
});

test('相邻年份值年卦为同人前后卦（锁定先天圆图序）', () => {
  // 同人按先天圆图序(去四正)为第15卦：前(第14)=革，后(第16)=临。
  // 此用例锁定 HEXAGRAMS 圆图序正确，防止同人/丰/革错位回归。
  assert.equal(valueYearHexagram(2025).name, '革');
  assert.equal(valueYearHexagram(2027).name, '临');
});
