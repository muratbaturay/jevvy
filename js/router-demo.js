// Routed-request demo. DOM only; decisions come from router-logic.js.
// The SVG flow is the wide-width rendering; the .flow-list mirrors the same
// state as a vertical list on narrow widths (CSS decides which one shows).
import { register } from './registry.js';
import { QUESTIONS, DEFAULT_THRESHOLD, normalizeThreshold, route } from './router-logic.js';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms) => new Promise((r) => setTimeout(r, reduced() ? 0 : ms));

// Token rests on the entry edge of each station so it never covers a label.
const STATION_X = { goal: 180, jev: 262, gate: 502, claude: 682, verified: 922, reason: 287 };
const STATION_Y = { goal: 70, jev: 70, gate: 70, claude: 70, verified: 70, reason: 150 };
const ROOT_STATES = ['is-path-fallback', 'is-jev-dim', 'is-gate-allowed', 'is-gate-fallback'];

export function initRouterDemo(root) {
  const svg = root.querySelector('svg');
  const token = svg.querySelector('[data-token]');
  const gate = svg.querySelector('[data-station="gate"]');
  const jevStation = svg.querySelector('[data-station="jev"]');
  const answerChips = root.querySelectorAll('[data-answer-chip]');
  const lines = Object.fromEntries([...svg.querySelectorAll('[data-line]')].map((l) => [l.dataset.line, l]));
  const listItems = [...root.querySelectorAll('.flow-list [data-station]')];
  const form = root.querySelector('[data-controls]');
  const list = root.querySelector('[data-questions]');
  const slider = root.querySelector('[data-threshold]');
  const out = root.querySelector('[data-threshold-out]');
  const note = root.querySelector('[data-threshold-note]');
  const narration = root.querySelector('[data-narration]');

  list.innerHTML = QUESTIONS.map((q, i) => `
    <li><label><input type="radio" name="router-q" value="${q.id}" ${i === 0 ? 'checked' : ''}> ${q.label}</label></li>`).join('');

  slider.value = DEFAULT_THRESHOLD;
  const current = () => QUESTIONS.find((q) => q.id === form.elements['router-q'].value);
  const sync = () => { out.textContent = normalizeThreshold(slider.value).toFixed(2); const j = current().kind === 'judgment'; slider.disabled = j; note.hidden = !j; };
  slider.addEventListener('input', sync);
  list.addEventListener('change', () => { sync(); run(); });
  slider.addEventListener('change', run);
  form.addEventListener('submit', (e) => { e.preventDefault(); run(); });
  sync();

  let runId = 0;
  function reset() {
    Object.values(lines).forEach((l) => l.classList.remove('is-drawn'));
    gate.classList.remove('is-allowed', 'is-fallback');
    jevStation.classList.remove('is-dim');
    root.classList.remove(...ROOT_STATES);
    listItems.forEach((li) => li.classList.remove('is-at', 'is-visited'));
    answerChips.forEach((c) => (c.textContent = 'typed + probability'));
    move('goal');
  }
  function move(station) {
    token.setAttribute('cx', STATION_X[station]); token.setAttribute('cy', STATION_Y[station]);
    listItems.forEach((li) => { li.classList.toggle('is-at', li.dataset.station === station); if (li.dataset.station === station) li.classList.add('is-visited'); });
  }
  function setGate(state) { gate.classList.add(`is-${state}`); root.classList.add(`is-gate-${state}`); }
  async function step(line, station, id) { lines[line].classList.add('is-drawn'); await wait(120); if (id !== runId) return false; move(station); await wait(420); return id === runId; }

  async function run() {
    const id = ++runId;
    const q = current();
    const result = route(q, slider.value);
    reset();
    narration.textContent = 'Running…';
    await wait(200);
    if (id !== runId) return;
    if (result.path === 'direct') {
      jevStation.classList.add('is-dim'); root.classList.add('is-jev-dim');
      if (!(await step('skip', 'gate', id))) return;
      setGate('allowed');
      if (!(await step('s3', 'claude', id))) return;
      if (!(await step('s4', 'verified', id))) return;
    } else {
      if (!(await step('s1', 'jev', id))) return;
      answerChips.forEach((c) => (c.textContent = `${q.answer} · ${q.probability.toFixed(2)}`));
      if (!(await step('s2', 'gate', id))) return;
      if (result.path === 'jev') {
        setGate('allowed');
        if (!(await step('s3', 'claude', id))) return;
      } else {
        setGate('fallback'); root.classList.add('is-path-fallback');
        if (!(await step('detour1', 'reason', id))) return;
        if (!(await step('detour2', 'claude', id))) return;
      }
      if (!(await step('s4', 'verified', id))) return;
    }
    narration.textContent = result.reason;
  }
}

register('[data-demo="router"]', initRouterDemo);
