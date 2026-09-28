// Worktree merge demo. Timeline from worktree-logic.js; this file only plays it.
import { register } from './registry.js';
import { COLUMNS, SHARED_PATH, REWORK_RESET_FRACTION, simulate, tally } from './worktree-logic.js';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const DONE = { A: 'endpoints implemented and documented', B: 'key screens complete and responsive', C: 'coverage for new functionality', D: 'guides and changelog updated' };
const CHECKS = { A: 'unit tests and lint', B: 'typecheck and build', C: 'test suite', D: 'build docs, check links' };

export function initWorktreeDemo(root) {
  const list = root.querySelector('[data-columns]');
  const merged = root.querySelector('[data-merged]');
  const releaseStamp = root.querySelector('[data-release-stamp]');
  const toggle = root.querySelector('[data-isolation-toggle]');
  const tallyEl = root.querySelector('[data-tally]');
  const narration = root.querySelector('[data-narration]');
  const log = root.querySelector('[data-log]');
  const replay = root.querySelector('[data-replay]');
  const isolatedRun = simulate({ isolated: true });
  const isolatedRelease = isolatedRun.totals.releaseAt;

  function renderColumns(isolated) {
    list.innerHTML = COLUMNS.map((c, i) => {
      const owns = isolated || c.id !== 'C' ? c.owns : [...c.owns, SHARED_PATH];
      return `
      <li class="wt" data-col="${c.id}">
        <p class="wt__name">Worktree ${c.id} · ${c.name}</p>
        <p class="wt__marks" data-mark-slot></p>
        <p class="wt__files"><span class="label soft">owned files</span><br>${owns.map((f) => `<span class="${!isolated && f === SHARED_PATH ? 'is-shared' : ''}">${f}</span>`).join('')}</p>
        <p class="wt__files wt__extra"><span class="label soft">done when</span><br>${DONE[c.id]}</p>
        <p class="wt__files wt__extra"><span class="label soft">local checks</span><br>${CHECKS[c.id]}</p>
        <div class="wt__track" role="progressbar" aria-label="Worktree ${c.id} progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="wt__fill"></div></div>
        <p class="wt__status"><span data-status>waiting</span><span data-stamp-slot></span></p>
      </li>`;
    }).join('');
  }

  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  function cancel() { timers.forEach(clearTimeout); timers = []; }

  function setFill(col, pct, ms) {
    const fill = list.querySelector(`[data-col="${col}"] .wt__fill`);
    const bar = fill.parentElement;
    fill.style.transitionDuration = `${ms}ms`;
    requestAnimationFrame(() => { fill.style.width = `${pct}%`; });
    if (ms === 0) bar.setAttribute('aria-valuenow', String(pct));
  }
  const status = (col, text) => (list.querySelector(`[data-col="${col}"] [data-status]`).textContent = text);
  function stamp(col, text, cls = '') {
    const slot = list.querySelector(`[data-col="${col}"] [data-stamp-slot]`);
    slot.innerHTML = `<span class="stamp is-landing ${cls}" style="--tilt:-3deg">${text}</span>`;
  }
  function mark(col, text) {
    list.querySelector(`[data-col="${col}"] [data-mark-slot]`).insertAdjacentHTML('beforeend', `<span class="stamp is-landing stamp--signal" style="--tilt:2deg">${text}</span>`);
  }

  function apply(e) {
    const c = COLUMNS.find((x) => x.id === e.column);
    switch (e.kind) {
      case 'start': status(e.column, 'working'); setFill(e.column, 100, c.fillMs); break;
      case 'collision':
        e.columns.forEach((id) => { list.querySelector(`[data-col="${id}"]`).classList.add('is-collided', 'was-collided'); status(id, `collision on ${e.detail}`); mark(id, 'collided'); });
        narration.textContent = `B and C both edited ${e.detail}. The queue pauses.`; break;
      case 'rework': setFill(e.column, REWORK_RESET_FRACTION * 100, 0); status(e.column, 'rework'); break;
      case 'resume':
        // The conflict is resolved for both sides once the reworked column resumes.
        list.querySelectorAll('.is-collided').forEach((el) => el.classList.remove('is-collided'));
        mark(e.column, 'reworked'); status(e.column, 'working again'); setFill(e.column, 100, e.remainingMs); break;
      case 'done': status(e.column, 'done'); list.querySelector(`[data-col="${e.column}"] .wt__track`).setAttribute('aria-valuenow', '100'); break;
      case 'review': stamp(e.column, 'diff review ✓'); break;
      case 'merge': merged.insertAdjacentHTML('beforeend', `<li>${e.column}</li>`); status(e.column, 'merged'); list.querySelector(`[data-col="${e.column}"]`).classList.add('is-merged'); break;
      case 'release': releaseStamp.hidden = false; releaseStamp.classList.add('is-landing'); break;
    }
  }

  function run() {
    cancel();
    const isolated = !toggle.checked;
    renderColumns(isolated);
    merged.innerHTML = '';
    releaseStamp.hidden = true; releaseStamp.classList.remove('is-landing');
    narration.textContent = isolated ? 'Four worktrees fill in parallel. Watch the merge queue.' : 'Same run, but B and C share a file.';
    tallyEl.innerHTML = '';
    const { events, totals } = simulate({ isolated });
    log.innerHTML = events.map((e) => `<li>${(e.t / 1000).toFixed(2)} s · ${e.kind}${e.column ? ' ' + e.column : ''}${e.columns ? ' ' + e.columns.join('+') : ''}${e.detail ? ' · ' + e.detail : ''}</li>`).join('');
    const delay = ((totals.releaseAt - isolatedRelease) / 1000).toFixed(1);
    releaseStamp.textContent = isolated ? '1 clean release' : `released late · +${delay} s`;
    releaseStamp.classList.toggle('stamp--signal', !isolated);
    const finish = () => {
      tallyEl.innerHTML = isolated
        ? `<span><strong>This run:</strong> ${tally(totals, isolatedRelease)}</span>`
        : `<span><strong>This run:</strong> ${tally(totals, isolatedRelease)}</span><span class="soft"><strong>Isolated run:</strong> ${tally(isolatedRun.totals, isolatedRelease)}</span>`;
      narration.textContent = isolated ? 'Every worktree merged in the order it finished. No file was touched twice.' : 'One shared file cost a collision across two worktrees, a rework loop, and a late release.';
    };
    if (reduced()) {
      events.forEach((e) => { if (e.kind !== 'start') apply(e); });
      COLUMNS.forEach((c) => setFill(c.id, 100, 0));
      log.hidden = false; finish(); return;
    }
    log.hidden = true;
    events.forEach((e) => later(() => apply(e), e.t));
    later(finish, totals.releaseAt + 50);
  }

  replay.addEventListener('click', run);
  toggle.addEventListener('change', run);
  // Start once when scrolled into view, then only on demand.
  const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) { io.disconnect(); run(); } }, { threshold: 0.1 });
  renderColumns(true);
  io.observe(root);
}

register('[data-demo="worktree"]', initWorktreeDemo);
