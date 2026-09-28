import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COLUMNS, SHARED_PATH, simulate, tally } from '../js/worktree-logic.js';

const kinds = (ev, k) => ev.filter((e) => e.kind === k);

test('four columns with distinct owned files when isolated', () => {
  assert.equal(COLUMNS.length, 4);
  const all = COLUMNS.flatMap((c) => c.owns);
  assert.equal(new Set(all).size, all.length);
});

test('isolated run: merges in completion order, release after last merge', () => {
  const { events, totals } = simulate({ isolated: true });
  assert.deepEqual(kinds(events, 'merge').map((e) => e.column), ['C', 'A', 'D', 'B']);
  assert.deepEqual(kinds(events, 'merge').map((e) => e.t), [1800, 2400, 2700, 3100]);
  assert.equal(kinds(events, 'release')[0].t, 3400);
  assert.equal(totals.collisions, 0);
  assert.equal(totals.reworks, 0);
  assert.equal(totals.releaseAt, 3400);
  assert.equal(kinds(events, 'collision').length, 0);
});

test('events are sorted by time', () => {
  for (const iso of [true, false]) {
    const { events } = simulate({ isolated: iso });
    for (let i = 1; i < events.length; i++) assert.ok(events[i].t >= events[i - 1].t);
  }
});

test('unisolated run: B and C collide on styles/, C reworks, release is delayed', () => {
  const { events, totals } = simulate({ isolated: false });
  const col = kinds(events, 'collision')[0];
  assert.deepEqual(col.columns, ['B', 'C']);
  assert.equal(col.detail, SHARED_PATH);
  assert.equal(col.t, 1080);                                   // 60% of C's 1800
  const rework = kinds(events, 'rework')[0];
  assert.equal(rework.column, 'C');
  assert.equal(kinds(events, 'resume')[0].t, 1080 + 1800);      // conflict pause
  assert.equal(kinds(events, 'resume')[0].remainingMs, 1260);   // 70% of 1800
  assert.equal(kinds(events, 'done').find((e) => e.column === 'C').t, 4140);
  // Queue paused until C's rework finished, then merges in completion order.
  assert.deepEqual(kinds(events, 'merge').map((e) => e.column), ['A', 'D', 'B', 'C']);
  assert.deepEqual(kinds(events, 'merge').map((e) => e.t), [4140, 4440, 4740, 5040]);
  assert.ok(kinds(events, 'merge').every((e) => e.t >= 4140), 'no merge during the collision');
  assert.equal(totals.releaseAt, 5340);
  assert.equal(totals.collisions, 2);
  assert.equal(totals.reworks, 1);
});

test('tally strings', () => {
  assert.equal(tally({ collisions: 0, reworks: 0, releaseAt: 3400 }, 3400), '0 collisions · 0 rework · release on time');
  assert.equal(tally({ collisions: 2, reworks: 1, releaseAt: 5340 }, 3400), '2 collisions · 1 rework loop · release delayed by 1.9 s');
});
