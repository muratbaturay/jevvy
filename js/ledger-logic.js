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

export function sanitize(value) {
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

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
