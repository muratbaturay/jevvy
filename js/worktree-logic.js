// Pure timeline for the chapter 2 demo. No DOM. See spec §6.2.
export const COLUMNS = Object.freeze([
  { id: 'A', name: 'API',   owns: ['api/', 'services/', 'db/'],        fillMs: 2400 },
  { id: 'B', name: 'UI',    owns: ['ui/', 'components/', 'styles/'],   fillMs: 3100 },
  { id: 'C', name: 'Tests', owns: ['tests/', 'fixtures/', 'mocks/'],   fillMs: 1800 },
  { id: 'D', name: 'Docs',  owns: ['docs/', 'guides/', 'examples/'],   fillMs: 2700 },
]);
export const SHARED_PATH = 'styles/';
export const MERGE_GAP_MS = 300;
export const COLLISION_AT_FRACTION = 0.6;
export const REWORK_RESET_FRACTION = 0.3;
export const CONFLICT_PAUSE_MS = 1800;
const COLLIDERS = ['B', 'C']; // the column that reworks is the last one listed

export function simulate({ isolated }) {
  const events = [];
  const doneAt = {};
  for (const c of COLUMNS) {
    events.push({ t: 0, kind: 'start', column: c.id, detail: `${c.fillMs}` });
    doneAt[c.id] = c.fillMs;
  }
  let collisions = 0, reworks = 0;
  if (!isolated) {
    const victim = COLUMNS.find((c) => c.id === COLLIDERS[1]);
    const tCollide = Math.round(victim.fillMs * COLLISION_AT_FRACTION);
    events.push({ t: tCollide, kind: 'collision', columns: [...COLLIDERS], detail: SHARED_PATH });
    events.push({ t: tCollide, kind: 'rework', column: victim.id, detail: `${REWORK_RESET_FRACTION}` });
    const remainingMs = Math.round(victim.fillMs * (1 - REWORK_RESET_FRACTION));
    const tResume = tCollide + CONFLICT_PAUSE_MS;
    events.push({ t: tResume, kind: 'resume', column: victim.id, remainingMs });
    doneAt[victim.id] = tResume + remainingMs;
    collisions = COLLIDERS.length;
    reworks = 1;
  }
  for (const c of COLUMNS) {
    events.push({ t: doneAt[c.id], kind: 'done', column: c.id });
    events.push({ t: doneAt[c.id], kind: 'review', column: c.id });
  }
  // Merge in completion order. While a collision is unresolved the queue is
  // paused: nothing merges until the reworked column is done.
  const order = Object.entries(doneAt).sort((a, b) => a[1] - b[1]).map(([id]) => id);
  const blockUntil = isolated ? -Infinity : doneAt[COLLIDERS[1]];
  let prevMerge = -Infinity;
  for (const id of order) {
    const t = Math.max(doneAt[id], prevMerge + MERGE_GAP_MS, blockUntil);
    events.push({ t, kind: 'merge', column: id });
    prevMerge = t;
  }
  const releaseAt = prevMerge + MERGE_GAP_MS;
  events.push({ t: releaseAt, kind: 'release' });
  events.sort((a, b) => a.t - b.t);
  return { events, totals: { collisions, reworks, releaseAt } };
}

export function tally(totals, isolatedReleaseAt) {
  const delay = totals.releaseAt - isolatedReleaseAt;
  const release = delay > 0 ? `release delayed by ${(delay / 1000).toFixed(1)} s` : 'release on time';
  const rework = totals.reworks === 1 ? '1 rework loop' : `${totals.reworks} rework`;
  return `${totals.collisions} collisions · ${rework} · ${release}`;
}
