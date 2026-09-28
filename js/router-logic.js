// Pure routing decision for the chapter 1 demo. No DOM. See spec §6.1.
export const DEFAULT_THRESHOLD = 0.87;

export const QUESTIONS = Object.freeze([
  { id: 'tests', label: 'Did the test suite pass?', kind: 'bounded', type: 'boolean', answer: 'no', probability: 0.94 },
  { id: 'agent', label: 'Which of five specialist agents should take this ticket?', kind: 'bounded', type: 'categorical', answer: 'billing-agent', probability: 0.71 },
  { id: 'persuasive', label: 'Is this argument persuasive?', kind: 'judgment' },
]);

export function normalizeThreshold(value) {
  const n = typeof value === 'number' ? value : parseFloat(value);
  if (!Number.isFinite(n)) return DEFAULT_THRESHOLD;
  return Math.min(0.99, Math.max(0.5, Math.round(n * 100) / 100));
}

const fmt = (n) => n.toFixed(2);

// What the policy-gate label says for each routing outcome (and at rest).
const GATE_TEXT = {
  idle: 'threshold',
  jev: '≥ threshold ✓',
  fallback: '< threshold ↓',
  direct: 'no threshold',
};
export function gateText(path) {
  return GATE_TEXT[path] ?? GATE_TEXT.idle;
}

export function route(question, thresholdValue) {
  const threshold = normalizeThreshold(thresholdValue);
  if (question.kind === 'judgment') {
    return { path: 'direct', reason: 'No fixed schema fits a judgment call, so the router sends it straight to Claude. Jev is never asked.' };
  }
  const p = question.probability;
  if (p >= threshold) {
    return { path: 'jev', reason: `Jev answered "${question.answer}" at ${fmt(p)}. That clears the ${fmt(threshold)} threshold, so the gate lets it through to Claude Code.` };
  }
  return { path: 'fallback', reason: `Jev answered "${question.answer}" at ${fmt(p)}, below the ${fmt(threshold)} threshold. The gate falls back to Claude to reason it out before Claude Code acts.` };
}
