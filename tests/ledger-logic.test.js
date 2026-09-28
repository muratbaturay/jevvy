import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, PROVENANCE, sanitize, computeLedger } from '../js/ledger-logic.js';

const close = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} !~ ${b}`);

test('defaults reproduce the article arithmetic', () => {
  const l = computeLedger(DEFAULTS);
  close(l.before.classificationPerDay, 3.9);          // 50*3*520/1e6*50
  close(l.after.classificationPerDay, 0.003276);      // 50*3*520/1e6*0.042
  close(l.before.generationPerDay, 7.5);              // 50*3000/1e6*50
  close(l.after.generationPerDay, 7.5);               // unchanged by design
  close(l.before.classificationShare, 3.9 / 11.4);
  close(l.secondsSavedPerPr, 12.06);                  // 3*(4.3-0.28)
  close(l.hoursSavedPerDay, 12.06 * 50 / 3600);
  close(l.before.totalPerMonth, 11.4 * 22);
  close(l.savingPerDay, 3.9 - 0.003276);
});

test('generation column is identical on both sides', () => {
  const l = computeLedger({ ...DEFAULTS, generationTokensPerPr: 12345 });
  assert.equal(l.before.generationPerDay, l.after.generationPerDay);
});

test('zero inputs give zeros, never NaN', () => {
  const l = computeLedger({ prsPerDay: 0 });
  assert.equal(l.before.totalPerDay, 0);
  assert.equal(l.before.classificationShare, 0);
  assert.equal(l.hoursSavedPerDay, 0);
  for (const v of Object.values(l.before)) assert.ok(Number.isFinite(v));
});

test('handles large and fractional inputs', () => {
  const l = computeLedger({ ...DEFAULTS, tokensPerDecision: 1e9, prsPerDay: 0.5 });
  for (const side of [l.before, l.after]) for (const v of Object.values(side)) assert.ok(Number.isFinite(v));
  assert.ok(l.before.classificationPerDay > 0);
});

test('reports negative savings honestly when Jev is slower', () => {
  const l = computeLedger({ ...DEFAULTS, jevSecondsPerDecision: 10 });
  close(l.secondsSavedPerPr, 3 * (4.3 - 10));
  assert.ok(l.secondsSavedPerPr < 0);
});

test('sanitize maps junk to zero', () => {
  assert.equal(sanitize('abc'), 0);
  assert.equal(sanitize(-5), 0);
  assert.equal(sanitize(Infinity), 0);
  assert.equal(sanitize('12.5'), 12.5);
  assert.equal(sanitize(null), 0);
});

test('every default has a provenance label', () => {
  for (const key of Object.keys(DEFAULTS)) {
    assert.ok(['article', 'derived', 'estimate'].includes(PROVENANCE[key].kind), key);
    assert.ok(PROVENANCE[key].note.length > 0, key);
  }
});
