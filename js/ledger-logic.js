// Pure ledger math. No DOM. See spec §6.4.
export const DEFAULTS = Object.freeze({
  prsPerDay: 50,
  decisionsPerPr: 3,
  tokensPerDecision: 520,
  generationTokensPerPr: 3000,
  claudeRatePerM: 50,
  jevRatePerM: 0.042,
  claudeSecondsPerDecision: 4.3,
  jevSecondsPerDecision: 0.28,
  workingDaysPerMonth: 22,
});

export const PROVENANCE = Object.freeze({
  prsPerDay:                { kind: 'article',  note: 'from the article' },
  decisionsPerPr:           { kind: 'article',  note: 'from the article' },
  tokensPerDecision:        { kind: 'derived',  note: 'derived: 1,550 tokens across 3 decisions' },
  generationTokensPerPr:    { kind: 'estimate', note: 'our estimate: review ~1,400 plus a fix of similar size' },
  claudeRatePerM:           { kind: 'article',  note: 'from the article: its output-weighted assumption, not a published price' },
  jevRatePerM:              { kind: 'article',  note: "from the article: TypeSafe's published input price, output free" },
  claudeSecondsPerDecision: { kind: 'derived',  note: 'derived: ~13 s across 3 decisions' },
  jevSecondsPerDecision:    { kind: 'derived',  note: 'derived: mean of 0.30, 0.25 and 0.28 s' },
  workingDaysPerMonth:      { kind: 'estimate', note: 'our estimate' },
});

// Inputs above this are nonsense for the model (a billion PRs a day) and would
// push products past what the formatters can show; clamp instead of exploding.
export const MAX_INPUT = 1e9;

export function sanitize(value) {
  const n = typeof value === 'number' ? value : parseFloat(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, MAX_INPUT);
}

// Formatters. Anything non-finite becomes a dash rather than 'NaN' or 'Infinity'.
const DASH = '\u2014';
const MINUS = '\u2212';
const grouped = (n, digits) => n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export function formatMoney(n) {
  if (!Number.isFinite(n)) return DASH;
  const abs = Math.abs(n);
  const body = abs > 0 && abs < 0.01 ? grouped(abs, 4) : grouped(abs, 2);
  return `${n < 0 ? MINUS : ''}$${body}`;
}

export function formatPct(share) {
  if (!Number.isFinite(share)) return DASH;
  const pct = share * 100;
  if (pct === 0) return '0%';
  if (pct < 0.1) return '<0.1%';
  if (pct < 1) return `${pct.toFixed(1)}%`;
  return `${pct.toFixed(0)}%`;
}

const signed = (n, digits, unit) => (Number.isFinite(n) ? `${n < 0 ? MINUS : ''}${Math.abs(n).toFixed(digits)} ${unit}` : DASH);
export const formatSecs = (n) => signed(n, 1, 's');
export const formatHours = (n) => signed(n, 2, 'h');

function side(prs, decisionsPerDay, tokensPerDecision, generationTokensPerPr, classificationRate, generationRate, days) {
  const classificationPerDay = decisionsPerDay * tokensPerDecision / 1e6 * classificationRate;
  const generationPerDay = prs * generationTokensPerPr / 1e6 * generationRate;
  const totalPerDay = classificationPerDay + generationPerDay;
  return {
    classificationPerDay,
    generationPerDay,
    totalPerDay,
    totalPerMonth: totalPerDay * days,
    classificationShare: totalPerDay > 0 ? classificationPerDay / totalPerDay : 0,
  };
}

export function computeLedger(raw = {}) {
  const i = {};
  for (const key of Object.keys(DEFAULTS)) i[key] = sanitize(raw[key] ?? DEFAULTS[key]);
  const decisionsPerDay = i.prsPerDay * i.decisionsPerPr;
  const before = side(i.prsPerDay, decisionsPerDay, i.tokensPerDecision, i.generationTokensPerPr, i.claudeRatePerM, i.claudeRatePerM, i.workingDaysPerMonth);
  const after  = side(i.prsPerDay, decisionsPerDay, i.tokensPerDecision, i.generationTokensPerPr, i.jevRatePerM,    i.claudeRatePerM, i.workingDaysPerMonth);
  const secondsSavedPerPr = i.decisionsPerPr * (i.claudeSecondsPerDecision - i.jevSecondsPerDecision);
  return {
    before,
    after,
    savingPerDay: before.totalPerDay - after.totalPerDay,
    savingPerMonth: before.totalPerMonth - after.totalPerMonth,
    secondsSavedPerPr,
    hoursSavedPerDay: secondsSavedPerPr * i.prsPerDay / 3600,
  };
}
