import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS, DEFAULT_THRESHOLD, normalizeThreshold, route } from '../js/router-logic.js';

const q = (id) => QUESTIONS.find((x) => x.id === id);

test('three scripted questions exist with the spec values', () => {
  assert.equal(QUESTIONS.length, 3);
  assert.equal(q('tests').probability, 0.94);
  assert.equal(q('agent').probability, 0.71);
  assert.equal(q('persuasive').kind, 'judgment');
  assert.equal(DEFAULT_THRESHOLD, 0.87);
});

test('bounded question above threshold goes through Jev', () => {
  const r = route(q('tests'), 0.87);
  assert.equal(r.path, 'jev');
  assert.match(r.reason, /0\.94/);
});

test('bounded question below threshold falls back to Claude', () => {
  const r = route(q('agent'), 0.87);
  assert.equal(r.path, 'fallback');
  assert.match(r.reason, /below/i);
});

test('judgment question never reaches Jev', () => {
  const r = route(q('persuasive'), 0.5);
  assert.equal(r.path, 'direct');
  assert.match(r.reason, /straight to Claude/i);
});

test('boundary equality passes', () => {
  assert.equal(route(q('tests'), 0.94).path, 'jev');
  assert.equal(route(q('agent'), 0.71).path, 'jev');
  assert.equal(route(q('tests'), 0.95).path, 'fallback');
});

test('threshold is rounded to two decimals and clamped', () => {
  assert.equal(normalizeThreshold(0.7100000001), 0.71);
  assert.equal(normalizeThreshold('0.9'), 0.9);
  assert.equal(normalizeThreshold(2), 0.99);
  assert.equal(normalizeThreshold(-1), 0.5);
  assert.equal(normalizeThreshold('x'), DEFAULT_THRESHOLD);
  assert.equal(route(q('agent'), 0.7100000001).path, 'jev');
});

// Fix pass: gate label per path (review finding I2).
import { gateText } from '../js/router-logic.js';

test('gate text names the reason the gate opened', () => {
  assert.equal(gateText('jev'), '≥ threshold · allowed');
  assert.equal(gateText('fallback'), 'below · fall back');
  assert.equal(gateText('direct'), 'no threshold · allowed');
  assert.equal(gateText('idle'), 'threshold');
});
