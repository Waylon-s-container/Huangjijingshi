import { test } from 'node:test';
import assert from 'node:assert/strict';
import { yearsSinceEpoch, EPOCH_YEAR, YAO_YEAR } from '../js/data/calendar.js';

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
