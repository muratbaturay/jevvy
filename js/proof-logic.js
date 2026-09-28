// Pure verifier logic for the chapter 3 demo. No DOM. See spec §6.3.
export const SLOTS = Object.freeze(['artifact', 'diff', 'tests', 'limits', 'receipt']);

const all = (except = []) => Object.fromEntries(SLOTS.map((s) => [s, !except.includes(s)]));

export const SCENARIOS = Object.freeze({
  'complete':      { label: 'Complete and correct',    evidence: all(),          matchesGoal: true,  receiptResolves: true },
  'missing-tests': { label: 'Missing tests',           evidence: all(['tests']), matchesGoal: true,  receiptResolves: true },
  'mismatch':      { label: "Doesn't match the goal",  evidence: all(),          matchesGoal: false, receiptResolves: true },
  'dead-receipt':  { label: "Receipt doesn't resolve", evidence: all(),          matchesGoal: true,  receiptResolves: false },
});

export function missingSlots(evidence = {}) {
  return SLOTS.filter((s) => !evidence[s]);
}

export function verify({ evidence = {}, matchesGoal = true, receiptResolves = true }) {
  if (missingSlots(evidence).length > 0) return 'INCOMPLETE';
  if (!receiptResolves) return 'UNKNOWN';
  if (!matchesGoal) return 'REFUTED';
  return 'VERIFIED';
}

export function repair(scenario) {
  return { ...scenario, evidence: all() };
}

export function narrate(result, missing = []) {
  switch (result) {
    case 'VERIFIED':   return 'Evidence complete, receipt reproduces, artifact matches the goal. Accept and merge.';
    case 'INCOMPLETE': return `Missing: ${missing.join(', ')}. Not done: return for repair.`;
    case 'REFUTED':    return "Evidence is complete, but the artifact doesn't do what the goal asked. Revise.";
    case 'UNKNOWN':    return "The receipt doesn't resolve, so the review can't reproduce the result. Revise, and fix the receipt.";
    default:           return '';
  }
}
