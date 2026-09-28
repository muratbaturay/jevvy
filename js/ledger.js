// Cost ledger UI. All math in ledger-logic.js.
import { register } from './registry.js';
import { DEFAULTS, PROVENANCE, computeLedger } from './ledger-logic.js';

const FIELDS = [
  ['prsPerDay', 'PRs per day', 'count'],
  ['decisionsPerPr', 'Decisions per PR', 'count'],
  ['tokensPerDecision', 'Tokens per decision', 'tokens'],
  ['generationTokensPerPr', 'Generation tokens per PR', 'tokens'],
  ['claudeRatePerM', 'Claude blended rate', '$ / M tokens'],
  ['jevRatePerM', 'Jev input rate', '$ / M tokens'],
  ['claudeSecondsPerDecision', 'Claude seconds per decision', 's'],
  ['jevSecondsPerDecision', 'Jev seconds per decision', 's'],
  ['workingDaysPerMonth', 'Working days per month', 'days'],
];
const KIND_LABEL = { article: 'from the article', derived: 'derived', estimate: 'our estimate' };

const money = (n) => (Math.abs(n) >= 0.01 || n === 0 ? `$${n.toFixed(2)}` : `$${n.toFixed(4)}`);
const pct = (n) => (n > 0 && n < 0.001 ? '<0.1%' : `${(n * 100).toFixed(0)}%`);
const secs = (n) => `${n.toFixed(1)} s`;
const hours = (n) => `${n.toFixed(2)} h`;

export function initLedger(root) {
  root.innerHTML = `
    <form class="ledger__form" data-form>
      <p class="label soft">Assumptions · edit any of them</p>
      <div class="ledger__inputs">
        ${FIELDS.map(([key, label, unit]) => `
          <div class="ledger__input">
            <label for="ledger-${key}">${label} <span class="soft ledger__unit">(${unit})</span></label>
            <input id="ledger-${key}" name="${key}" type="number" inputmode="decimal" min="0" step="any" value="${DEFAULTS[key]}" aria-describedby="ledger-${key}-prov">
            <small id="ledger-${key}-prov" class="ledger__prov ledger__prov--${PROVENANCE[key].kind}" title="${PROVENANCE[key].note}">${KIND_LABEL[PROVENANCE[key].kind]}</small>
            <small class="ledger__error" data-error-for="${key}" hidden>Enter a number of zero or more.</small>
          </div>`).join('')}
      </div>
      <button type="button" class="btn btn--ghost" data-reset>Reset to article defaults</button>
    </form>
    <div class="ledger__sides">
      <section class="ledger__side" aria-labelledby="ledger-before-h">
        <h4 id="ledger-before-h">Before · decisions through Claude</h4>
        <dl data-side="before"></dl>
      </section>
      <section class="ledger__side" aria-labelledby="ledger-after-h">
        <h4 id="ledger-after-h">After · decisions through Jev</h4>
        <dl data-side="after"></dl>
      </section>
    </div>
    <dl class="ledger__totals" data-totals aria-live="polite"></dl>
    <p class="soft ledger__note">Generation cost is identical on both sides on purpose: the review and the fix never move. No multiplier is shown, because it would depend entirely on the rate you typed.</p>`;

  const form = root.querySelector('[data-form]');
  const sides = { before: root.querySelector('[data-side="before"]'), after: root.querySelector('[data-side="after"]') };
  const totals = root.querySelector('[data-totals]');

  function readInputs() {
    const out = {};
    for (const [key] of FIELDS) {
      const input = form.elements[key];
      const err = root.querySelector(`[data-error-for="${key}"]`);
      const raw = input.value.trim();
      const bad = raw === '' || !Number.isFinite(Number(raw)) || Number(raw) < 0;
      input.setAttribute('aria-invalid', String(bad));
      err.hidden = !bad;
      out[key] = bad ? 0 : Number(raw);
    }
    return out;
  }
  function rows(side) {
    return `
      <div><dt>Classification per day</dt><dd>${money(side.classificationPerDay)}</dd></div>
      <div><dt>Generation per day</dt><dd>${money(side.generationPerDay)}</dd></div>
      <div class="ledger__row--total"><dt>Total per day</dt><dd>${money(side.totalPerDay)}</dd></div>
      <div><dt>Total per month</dt><dd>${money(side.totalPerMonth)}</dd></div>
      <div><dt>Classification share</dt><dd>${pct(side.classificationShare)}</dd></div>`;
  }
  function render() {
    const l = computeLedger(readInputs());
    sides.before.innerHTML = rows(l.before);
    sides.after.innerHTML = rows(l.after);
    totals.innerHTML = `
      <div><dt>Saved per day</dt><dd>${money(l.savingPerDay)}</dd></div>
      <div><dt>Saved per month</dt><dd>${money(l.savingPerMonth)}</dd></div>
      <div><dt>Seconds saved per PR</dt><dd>${secs(l.secondsSavedPerPr)}</dd></div>
      <div><dt>Hours saved per day</dt><dd>${hours(l.hoursSavedPerDay)}</dd></div>`;
  }
  form.addEventListener('input', render);
  form.addEventListener('submit', (e) => e.preventDefault());
  root.querySelector('[data-reset]').addEventListener('click', () => { for (const [key] of FIELDS) form.elements[key].value = DEFAULTS[key]; render(); });
  render();
}

register('[data-ledger]', initLedger);
