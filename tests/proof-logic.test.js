import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SLOTS, SCENARIOS, missingSlots, verify, repair, narrate } from '../js/proof-logic.js';

test('five slots in contract order', () => {
  assert.deepEqual(SLOTS, ['artifact', 'diff', 'tests', 'limits', 'receipt']);
});

test('scenarios map to the four outcomes', () => {
  assert.equal(verify(SCENARIOS.complete), 'VERIFIED');
  assert.equal(verify(SCENARIOS['missing-tests']), 'INCOMPLETE');
  assert.equal(verify(SCENARIOS.mismatch), 'REFUTED');
  assert.equal(verify(SCENARIOS['dead-receipt']), 'UNKNOWN');
});

test('empty evidence is INCOMPLETE', () => {
  assert.equal(verify({ evidence: {}, matchesGoal: true, receiptResolves: true }), 'INCOMPLETE');
  assert.deepEqual(missingSlots({}), SLOTS);
});

test('incompleteness wins over everything else', () => {
  assert.equal(verify({ evidence: { artifact: true }, matchesGoal: false, receiptResolves: false }), 'INCOMPLETE');
});

test('an unresolvable receipt is UNKNOWN even if the goal would mismatch', () => {
  const ev = Object.fromEntries(SLOTS.map((s) => [s, true]));
  assert.equal(verify({ evidence: ev, matchesGoal: false, receiptResolves: false }), 'UNKNOWN');
});

test('repair fills the missing slot and keeps the rest', () => {
  const fixed = repair(SCENARIOS['missing-tests']);
  assert.equal(verify(fixed), 'VERIFIED');
  assert.deepEqual(missingSlots(fixed.evidence), []);
  assert.equal(SCENARIOS['missing-tests'].evidence.tests, false, 'original untouched');
});

test('narration names the missing slots', () => {
  assert.match(narrate('INCOMPLETE', ['tests']), /tests/);
  assert.match(narrate('VERIFIED', []), /merge/i);
  assert.match(narrate('REFUTED', []), /revise/i);
  assert.match(narrate('UNKNOWN', []), /reproduce/i);
});

// Fix pass: a static step list per outcome (review finding I3).
import { stepsFor } from '../js/proof-logic.js';

test('stepsFor lists the path a verifier takes, ending in the outcome', () => {
  assert.deepEqual(stepsFor('VERIFIED'), ['Evidence complete? yes', 'Independent review', 'Matches the goal? yes', 'Accept and merge']);
  assert.deepEqual(stepsFor('INCOMPLETE'), ['Evidence complete? no', 'Return for repair']);
  assert.deepEqual(stepsFor('REFUTED'), ['Evidence complete? yes', 'Independent review', 'Matches the goal? no', 'Revise']);
  assert.deepEqual(stepsFor('UNKNOWN'), ['Evidence complete? yes', 'Independent review: receipt does not resolve', 'Revise, and fix the receipt']);
});
