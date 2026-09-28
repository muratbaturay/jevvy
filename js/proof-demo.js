// Proof-contract demo. Outcomes from proof-logic.js.
import { register } from './registry.js';
import { SLOTS, SCENARIOS, missingSlots, verify, repair, narrate, stepsFor } from './proof-logic.js';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const STAMP_CLASS = { VERIFIED: '', REFUTED: 'stamp--signal', UNKNOWN: 'stamp--soft', INCOMPLETE: 'stamp--marker' };
const LIT = {
  VERIFIED:   ['complete', 'review', 'match', 'accept'],
  INCOMPLETE: ['complete', 'repair'],
  REFUTED:    ['complete', 'review', 'match', 'revise'],
  UNKNOWN:    ['complete', 'review', 'revise'],
};

export function initProofDemo(root) {
  const select = root.querySelector('[data-scenario]');
  const slots = root.querySelector('[data-slots]');
  const nodes = [...root.querySelectorAll('[data-node]')];
  const stampSlot = root.querySelector('[data-stamp-slot]');
  const stampSlotComplete = root.querySelector('[data-stamp-slot-complete]');
  const btnReturn = root.querySelector('[data-return]');
  const btnVerify = root.querySelector('[data-verify]');
  const btnRepair = root.querySelector('[data-repair]');
  const narration = root.querySelector('[data-narration]');
  const steps = root.querySelector('[data-steps]');

  select.innerHTML = Object.entries(SCENARIOS).map(([k, s]) => `<option value="${k}">${s.label}</option>`).join('');
  // The selected scenario is re-read from the select each time; Repair only
  // patches it for the run that follows, so the original stays demonstrable.
  let repaired = false;
  const scenarioNow = () => (repaired ? repair(SCENARIOS[select.value]) : SCENARIOS[select.value]);
  let returned = false;
  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, reduced() ? 0 : ms));
  const cancel = () => { timers.forEach(clearTimeout); timers = []; };

  function renderSlots() {
    slots.innerHTML = SLOTS.map((s) => `<li class="proof__slot" data-slot="${s}"><span>${s}</span><span class="soft" data-slot-state>—</span></li>`).join('');
  }
  function resetFlow() {
    cancel();
    nodes.forEach((n) => n.classList.remove('is-lit', 'is-off'));
    stampSlot.innerHTML = '';
    stampSlotComplete.innerHTML = '';
    steps.innerHTML = '';
    btnVerify.disabled = true;
    btnRepair.hidden = true;
    returned = false;
    renderSlots();
  }
  function returnEvidence(message) {
    resetFlow();
    const scenario = scenarioNow();
    const missing = missingSlots(scenario.evidence);
    SLOTS.forEach((s, i) => later(() => {
      const li = slots.querySelector(`[data-slot="${s}"]`);
      const state = li.querySelector('[data-slot-state]');
      if (missing.includes(s)) { li.classList.add('is-missing'); state.textContent = 'missing'; }
      else if (s === 'receipt' && !scenario.receiptResolves) { li.classList.add('is-dead'); state.textContent = 'dead link'; }
      else { li.classList.add('is-filled'); state.textContent = '✓'; }
    }, 120 * i));
    later(() => { returned = true; btnVerify.disabled = false; narration.textContent = message ?? (missing.length ? `Evidence returned with ${missing.join(', ')} missing. Verify to see what happens.` : 'All five items returned. Verify.'); }, 120 * SLOTS.length);
  }
  function doVerify() {
    if (!returned) return;
    btnVerify.disabled = true;
    const scenario = scenarioNow();
    const result = verify(scenario);
    const missing = missingSlots(scenario.evidence);
    steps.innerHTML = stepsFor(result).map((s) => `<li>${s}</li>`).join('');
    nodes.forEach((n) => n.classList.toggle('is-off', !LIT[result].includes(n.dataset.node)));
    LIT[result].forEach((id, i) => later(() => nodes.find((n) => n.dataset.node === id).classList.add('is-lit'), 160 * i));
    const target = result === 'INCOMPLETE' ? stampSlotComplete : stampSlot;
    later(() => { target.innerHTML = `<span class="stamp is-landing ${STAMP_CLASS[result]}">${result}</span>`; }, 160 * (result === 'INCOMPLETE' ? 1 : 2));
    later(() => { narration.textContent = narrate(result, missing); btnRepair.hidden = result !== 'INCOMPLETE'; }, 160 * LIT[result].length);
  }
  select.addEventListener('change', () => { repaired = false; resetFlow(); narration.textContent = 'Return the evidence, then verify.'; });
  btnReturn.addEventListener('click', () => { repaired = false; returnEvidence(); });
  btnVerify.addEventListener('click', doVerify);
  btnRepair.addEventListener('click', () => { repaired = true; returnEvidence('Tests added. Evidence returned again; verify.'); });
  resetFlow();
}

register('[data-demo="proof"]', initProofDemo);
