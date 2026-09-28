# Jevvy Field Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the single-page static site that adapts the Jev + Claude Code field guide and source article into an interactive explainer, deployed on GitHub Pages.

**Architecture:** One `index.html` with inline SVG diagrams, five small stylesheets, and ES modules loaded without a build step. Every interaction is split into a pure-logic module (unit-tested with `node:test`) and a DOM module exporting `init(root)`. Visual work is verified in the built-in browser at three widths, then finished with impeccable's critique, polish, and audit passes.

**Tech Stack:** HTML, CSS (OKLCH tokens), vanilla ES modules, Node 22 `node:test`, Python 3 `http.server` for local preview, Google Fonts (Anton, Courier Prime, Literata), GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-28-jevvy-field-guide-design.md` (read it first; this plan argues from it). Local source material is in `reference/` (gitignored): three infographics and `article.md`.

## Global Constraints

- Implement in this checkout (`/Users/murat.baturay/Code/Worktree`) on `main`. Do not create a separate git worktree or branch: `reference/` is gitignored and exists only here, and GitHub Pages deploys from `main`.
- No build step, no bundler, no framework, no runtime dependencies. `package.json` has `"type": "module"` and zero `dependencies`/`devDependencies`.
- All asset paths relative (no leading `/`) so the site works under `https://muratbaturay.github.io/jevvy/`.
- Colours only via the OKLCH tokens in `css/tokens.css`. Never `#000` or `#fff`. `--signal` (red) appears only in collision, REFUTED, missing-evidence, and invalid-input states.
- Fonts: Anton (display), Courier Prime (mono), Literata (depth-layer prose). No other families. IBM Plex, Inter, Space Mono and the rest of impeccable's reflex-reject list are banned.
- Light theme only. Declare `color-scheme: light`. No dark-mode media query.
- All copy in our own words. Verbatim carry-overs are limited to the concept labels in spec §2.4. Every figure is a range or is labelled "from the article", "derived from the article", "our estimate", or "TypeSafe's own figure".
- The ledger never displays an "x cheaper" multiplier.
- Animations use `transform` and `opacity` only, 200–400 ms, once per element. Under `prefers-reduced-motion: reduce`, every animation is skipped and demos render their end state with a static step list.
- Every interactive control is a native element (button, radio, range, checkbox, select, number input) with a visible focus ring (`outline: 2px solid var(--ink); outline-offset: 2px`) and a polite `aria-live` narration line.
- Lighthouse (Chrome, mobile profile) release bar: performance ≥ 95, accessibility 100, best practices ≥ 95.
- Commit after every task with a message ending in `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (or the model actually running). Do not push unless GitHub access has been fixed (spec §10 / Task 14).
- The impeccable gates are already satisfied for this project: `PRODUCT.md` and `DESIGN.md` exist at the root; the confirmed shape brief is spec §8; the image-generation gate is skipped because this harness has no native image generation (the three infographics in `reference/` are the approved visual direction). Do not run `$impeccable teach` or `$impeccable shape` again. This plan *is* the craft loop, decomposed: each visual task ends with a browser inspection, and Task 13 runs critique, polish, and audit.

## Review Focus

Inputs the spec implies but no obvious test covers, most likely to bite first. Each has a pinned test in the owning task.

1. **Ledger with huge or fractional inputs** (e.g. 1e9 tokens, 0.5 PRs): outputs must stay finite, formatted, and never `Infinity`/`NaN`. → Task 2 test "handles large and fractional inputs".
2. **Ledger where Jev is slower than Claude** (user types 10 s for Jev): seconds saved goes negative and must display honestly as a negative number, not clamp to zero. → Task 2 test "reports negative savings honestly".
3. **Router threshold exactly equal to the probability** (slider at 0.94 for question 1): `>=` means it passes; floating-point slider values like `0.7100000001` must not flip the result unexpectedly. → Task 3 test "boundary equality passes" and "threshold is rounded to two decimals".
4. **Replay pressed while the worktree demo is mid-run**: pending timeouts must be cancelled, otherwise two runs overlap and stamps land twice. → Task 10 step "cancel pending timers on replay" plus a browser check.
5. **Verify pressed before Return evidence** in the proof demo: the button must be disabled until evidence has been returned, and re-disabled when the scenario changes. → Task 11 browser check plus `verify()` test "empty evidence is INCOMPLETE".

---

## File Structure

```
index.html                  all content; regions marked with <!-- region:NAME --> comments
css/tokens.css              colour, type, spacing, motion tokens (Task 1)
css/base.css                reset, fonts, paper grain, layout primitives, focus, skip link (Task 1)
css/guide.css               bars, cards, panels, stickies, chips, buttons, stamps, margin nav, diagrams (Tasks 6–11)
css/depth.css               depth layer: inserted pages, Literata prose, ledger (Tasks 8–9)
css/print.css               print stylesheet (Task 12)
js/registry.js              register(selector, init) and initAll() (Task 1)
js/main.js                  imports registry and every feature module, runs initAll() on DOMContentLoaded (Task 1, extended later)
js/nav.js                   margin nav, scroll-spy, line numbers, hash → depth layer (Task 6)
js/reveal.js                IntersectionObserver reveals with reduced-motion guard (Task 6)
js/depth.js                 open/close the depth layer, focus management (Task 8)
js/ledger-logic.js          DEFAULTS, sanitize(), computeLedger() (Task 2)
js/ledger.js                ledger DOM (Task 9)
js/router-logic.js          QUESTIONS, DEFAULT_THRESHOLD, route() (Task 3)
js/router-demo.js           routed-request DOM/animation (Task 7)
js/proof-logic.js           SLOTS, SCENARIOS, missingSlots(), verify(), narrate() (Task 4)
js/proof-demo.js            proof-contract DOM/animation (Task 11)
js/worktree-logic.js        COLUMNS, simulate(), tally() (Task 5)
js/worktree-demo.js         worktree DOM/animation (Task 10)
tests/ledger-logic.test.js
tests/router-logic.test.js
tests/proof-logic.test.js
tests/worktree-logic.test.js
tests/smoke.test.js         package.json sanity (Task 1)
.claude/launch.json         "jevvy" preview config (Task 1)
package.json, .nojekyll, README.md
```

---

### Task 1: Scaffold, tokens, base styles, page skeleton

**Files:**
- Create: `package.json`, `.nojekyll`, `.claude/launch.json`, `tests/smoke.test.js`, `css/tokens.css`, `css/base.css`, `css/guide.css` (empty header only), `css/depth.css` (empty header only), `css/print.css` (empty header only), `js/registry.js`, `js/main.js`, `index.html`

**Interfaces:**
- Produces: `index.html` region markers `<!-- region:top -->`, `<!-- region:control-plane -->`, `<!-- region:go-deeper -->`, `<!-- region:worktree-method -->`, `<!-- region:proof-contract -->`, `<!-- region:receipt -->` that later tasks replace wholesale; CSS custom properties listed in tokens.css; `js/main.js` pattern `initAll()`.

- [ ] **Step 1: Write the smoke test**

`tests/smoke.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('package.json is an ES module with no dependencies', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.type, 'module');
  assert.equal(pkg.dependencies, undefined);
  assert.equal(pkg.devDependencies, undefined);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test tests/`
Expected: FAIL (package.json not found).

- [ ] **Step 3: Create package.json, .nojekyll, launch config**

`package.json`:
```json
{
  "name": "jevvy",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "The Jev + Claude Code field guide, as an interactive web page.",
  "scripts": {
    "test": "node --test tests/",
    "dev": "python3 -m http.server 4173 --bind 127.0.0.1"
  }
}
```

`.nojekyll`: empty file (`touch .nojekyll`).

`.claude/launch.json`:
```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "jevvy",
      "runtimeExecutable": "python3",
      "runtimeArgs": ["-m", "http.server", "4173", "--bind", "127.0.0.1"],
      "port": 4173
    }
  ]
}
```

- [ ] **Step 4: Run the smoke test**

Run: `npm test`
Expected: 1 passing.

- [ ] **Step 5: Write css/tokens.css**

```css
/* Jevvy tokens. Colours in OKLCH only. Never #000 / #fff. */
:root {
  color-scheme: light;

  --paper:        oklch(96.5% 0.012 85);
  --paper-inset:  oklch(98%   0.008 85);
  --card:         oklch(99%   0.004 85);
  --ink:          oklch(20%   0.01  60);
  --ink-soft:     oklch(42%   0.01  60);
  --rule:         oklch(86%   0.01  85);
  --marker:       oklch(88%   0.17  95);
  --mint:         oklch(91%   0.06  190);
  --teal:         oklch(47%   0.10  195);
  --signal:       oklch(58%   0.19  28);
  --shadow-soft:  oklch(0% 0 0 / 0.12);

  --font-display: Anton, Impact, "Arial Narrow", sans-serif;
  --font-mono:    "Courier Prime", "Courier New", monospace;
  --font-serif:   Literata, Georgia, serif;

  --fs-display:  clamp(2.75rem, 8vw, 6.5rem);
  --fs-headline: clamp(1.5rem, 3.2vw, 2.5rem);
  --fs-title:    1rem;
  --fs-body:     0.95rem;
  --fs-label:    0.72rem;
  --fs-depth-h:  clamp(1.35rem, 2.4vw, 1.75rem);
  --fs-depth:    1.0625rem;
  --fs-receipt:  0.85rem;

  --sp-xs: 4px;  --sp-sm: 8px;  --sp-md: 16px;
  --sp-lg: 24px; --sp-xl: 40px; --sp-2xl: 64px;
  --sp-section: clamp(4rem, 10vw, 8rem);

  --radius-sm: 4px;
  --radius-md: 6px;

  --margin-w: 64px;
  --content-max: 1180px;
  --measure: 65ch;

  --ease: cubic-bezier(0.2, 0.8, 0.2, 1);
  --dur-fast: 200ms;
  --dur-mid: 300ms;
  --dur-slow: 400ms;

  --shadow-sticker: 2px 2px 0 var(--ink);
  --shadow-sticker-hover: 3px 3px 0 var(--ink);
  --shadow-sticky: 0 2px 6px var(--shadow-soft);
}
```

- [ ] **Step 6: Write css/base.css**

```css
/* Reset, fonts, paper, layout primitives. */
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: var(--fs-body);
  line-height: 1.5;
  min-height: 100vh;
  overflow-x: hidden;
}
/* Paper grain: one fixed layer, tiled SVG noise, 3.5% opacity. */
body::before {
  content: "";
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  opacity: 0.035;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.7 0'/></filter><rect width='240' height='240' filter='url(%23n)'/></svg>");
}
img, svg { max-width: 100%; height: auto; display: block; }
h1, h2, h3, h4, p, ul, ol, figure { margin: 0; }
ul, ol { padding: 0; list-style: none; }
button, input, select { font: inherit; color: inherit; }
a { color: inherit; text-decoration-thickness: 1px; text-underline-offset: 2px; }
:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
.visually-hidden {
  position: absolute !important; width: 1px; height: 1px; overflow: hidden;
  clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap;
}
.skip-link {
  position: absolute; left: var(--sp-md); top: -3rem; z-index: 100;
  background: var(--ink); color: var(--card); padding: var(--sp-sm) var(--sp-md);
  font-size: var(--fs-label); text-transform: uppercase; letter-spacing: 0.08em;
}
.skip-link:focus { top: var(--sp-md); }

/* Page frame: ruled margin + content column. */
.page { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr; }
.content { width: 100%; max-width: var(--content-max); margin-inline: auto; padding-inline: var(--sp-md); }
.region { padding-block: var(--sp-section); }
.region + .region { padding-top: 0; }

/* Type roles */
.display { font-family: var(--font-display); font-size: var(--fs-display); line-height: 0.92; text-transform: uppercase; letter-spacing: 0.01em; font-weight: 400; }
.headline { font-family: var(--font-display); font-size: var(--fs-headline); line-height: 1; text-transform: uppercase; letter-spacing: 0.02em; font-weight: 400; }
.title { font-weight: 700; font-size: var(--fs-title); line-height: 1.3; }
.label { font-weight: 700; font-size: var(--fs-label); text-transform: uppercase; letter-spacing: 0.08em; line-height: 1.2; }
.soft { color: var(--ink-soft); }

@media (min-width: 1100px) {
  .page { grid-template-columns: var(--margin-w) 1fr; }
  .content { padding-inline: var(--sp-lg); }
}
```

- [ ] **Step 7: Create empty guide.css and depth.css with a header comment each**

`css/guide.css`: `/* Field-guide look: bars, cards, panels, stickies, chips, buttons, stamps, nav, diagrams. */`
`css/depth.css`: `/* Depth layer: inserted typed pages, Literata prose, ledger. */`

- [ ] **Step 8: Write js/registry.js and js/main.js**

The registry is a separate module so that feature modules can import
`register` without a circular import back into `main.js` (a circular import
would hit the temporal dead zone on `inits` and throw).

`js/registry.js`:
```js
// Registry of [selector, init] pairs. Feature modules call register() at load.
const inits = [];

export function register(selector, init) {
  inits.push([selector, init]);
}

export function initAll(root = document) {
  for (const [selector, init] of inits) {
    root.querySelectorAll(selector).forEach((el) => init(el));
  }
}
```

`js/main.js`:
```js
// Entry point. Later tasks add one import line per feature module here,
// in this order: reveal, nav, depth, router-demo, ledger, worktree-demo, proof-demo.
import { initAll } from './registry.js';

document.addEventListener('DOMContentLoaded', () => initAll());
```

- [ ] **Step 9: Write index.html skeleton**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Jevvy · The Jev + Claude Code Field Guide</title>
  <meta name="description" content="A field guide to splitting judgment from execution in Claude Code agents, with Jev answering the bounded questions. Adapted, interactive, fact-checked.">
  <meta name="color-scheme" content="light">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;1,7..72,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/guide.css">
  <link rel="stylesheet" href="css/depth.css">
  <link rel="stylesheet" href="css/print.css" media="print">
  <script type="module" src="js/main.js"></script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="page">
    <!-- region:nav -->
    <nav class="margin" aria-label="Chapters"></nav>
    <!-- /region:nav -->
    <main id="main" class="content">
      <!-- region:top -->
      <header id="top" class="region hero"><h1 class="display">Jevvy</h1></header>
      <!-- /region:top -->
      <!-- region:control-plane -->
      <section id="control-plane" class="region chapter" aria-labelledby="h-control-plane"><h2 id="h-control-plane" class="headline">01 · The Control Plane</h2></section>
      <!-- /region:control-plane -->
      <!-- region:go-deeper -->
      <section id="go-deeper" class="region depth" aria-labelledby="h-go-deeper"><h2 id="h-go-deeper" class="headline">Go deeper</h2></section>
      <!-- /region:go-deeper -->
      <!-- region:worktree-method -->
      <section id="worktree-method" class="region chapter" aria-labelledby="h-worktree-method"><h2 id="h-worktree-method" class="headline">02 · The Worktree Method</h2></section>
      <!-- /region:worktree-method -->
      <!-- region:proof-contract -->
      <section id="proof-contract" class="region chapter" aria-labelledby="h-proof-contract"><h2 id="h-proof-contract" class="headline">03 · The Proof Contract</h2></section>
      <!-- /region:proof-contract -->
      <!-- region:receipt -->
      <footer id="receipt" class="region receipt"><h2 class="label">Receipt</h2></footer>
      <!-- /region:receipt -->
    </main>
  </div>
</body>
</html>
```

`css/print.css` does not exist yet; create it now with just `/* Print stylesheet, filled in Task 12. */` so the link resolves.

- [ ] **Step 10: Preview and check**

Start the preview with the browser tool (`preview_start` name `jevvy`) and open `http://127.0.0.1:4173/`. Confirm: page renders in paper colour, the h1 is Anton, body is Courier Prime (check with `read_page` and a screenshot), no console errors, no horizontal scroll at 360 px width (`resize_window` preset mobile).

- [ ] **Step 11: Commit**

```bash
git add package.json .nojekyll .claude/launch.json tests/smoke.test.js css js index.html
git commit -m "feat: scaffold page skeleton, tokens and base styles"
```

---

### Task 2: Ledger logic (pure)

**Files:**
- Create: `js/ledger-logic.js`, `tests/ledger-logic.test.js`

**Interfaces:**
- Produces:
  - `DEFAULTS` object: `{ prsPerDay: 50, decisionsPerPr: 3, tokensPerDecision: 520, generationTokensPerPr: 3000, claudeRatePerM: 50, jevRatePerM: 0.042, claudeSecondsPerDecision: 4.3, jevSecondsPerDecision: 0.28, workingDaysPerMonth: 22 }`
  - `PROVENANCE` object mapping each key to `'article' | 'derived' | 'estimate'` with a `note` string.
  - `sanitize(value: unknown): number` → finite non-negative number, else 0.
  - `computeLedger(inputs: Partial<typeof DEFAULTS>): Ledger` where `Ledger = { before: Side, after: Side, savingPerDay, savingPerMonth, secondsSavedPerPr, hoursSavedPerDay }` and `Side = { classificationPerDay, generationPerDay, totalPerDay, totalPerMonth, classificationShare }`.

- [ ] **Step 1: Write the failing tests**

`tests/ledger-logic.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, PROVENANCE, sanitize, computeLedger } from '../js/ledger-logic.js';

const close = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} !~ ${b}`);

test('defaults reproduce the article arithmetic', () => {
  const l = computeLedger(DEFAULTS);
  close(l.before.classificationPerDay, 3.9);          // 50*3*520/1e6*50
  close(l.after.classificationPerDay, 0.003276);      // 50*3*520/1e6*0.042
  close(l.before.generationPerDay, 7.5);              // 50*3000/1e6*50
  close(l.after.generationPerDay, 7.5);               // unchanged by design
  close(l.before.classificationShare, 3.9 / 11.4);
  close(l.secondsSavedPerPr, 12.06);                  // 3*(4.3-0.28)
  close(l.hoursSavedPerDay, 12.06 * 50 / 3600);
  close(l.before.totalPerMonth, 11.4 * 22);
  close(l.savingPerDay, 3.9 - 0.003276);
});

test('generation column is identical on both sides', () => {
  const l = computeLedger({ ...DEFAULTS, generationTokensPerPr: 12345 });
  assert.equal(l.before.generationPerDay, l.after.generationPerDay);
});

test('zero inputs give zeros, never NaN', () => {
  const l = computeLedger({ prsPerDay: 0 });
  assert.equal(l.before.totalPerDay, 0);
  assert.equal(l.before.classificationShare, 0);
  assert.equal(l.hoursSavedPerDay, 0);
  for (const v of Object.values(l.before)) assert.ok(Number.isFinite(v));
});

test('handles large and fractional inputs', () => {
  const l = computeLedger({ ...DEFAULTS, tokensPerDecision: 1e9, prsPerDay: 0.5 });
  for (const side of [l.before, l.after]) for (const v of Object.values(side)) assert.ok(Number.isFinite(v));
  assert.ok(l.before.classificationPerDay > 0);
});

test('reports negative savings honestly when Jev is slower', () => {
  const l = computeLedger({ ...DEFAULTS, jevSecondsPerDecision: 10 });
  close(l.secondsSavedPerPr, 3 * (4.3 - 10));
  assert.ok(l.secondsSavedPerPr < 0);
});

test('sanitize maps junk to zero', () => {
  assert.equal(sanitize('abc'), 0);
  assert.equal(sanitize(-5), 0);
  assert.equal(sanitize(Infinity), 0);
  assert.equal(sanitize('12.5'), 12.5);
  assert.equal(sanitize(null), 0);
});

test('every default has a provenance label', () => {
  for (const key of Object.keys(DEFAULTS)) {
    assert.ok(['article', 'derived', 'estimate'].includes(PROVENANCE[key].kind), key);
    assert.ok(PROVENANCE[key].note.length > 0, key);
  }
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/ledger-logic.test.js`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement js/ledger-logic.js**

```js
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
  prsPerDay:               { kind: 'article',  note: 'from the article' },
  decisionsPerPr:          { kind: 'article',  note: 'from the article' },
  tokensPerDecision:       { kind: 'derived',  note: 'derived: 1,550 tokens across 3 decisions' },
  generationTokensPerPr:   { kind: 'estimate', note: 'our estimate: review ~1,400 plus a fix of similar size' },
  claudeRatePerM:          { kind: 'article',  note: "from the article: its output-weighted assumption, not a published price" },
  jevRatePerM:             { kind: 'article',  note: "from the article: TypeSafe's published input price, output free" },
  claudeSecondsPerDecision:{ kind: 'derived',  note: 'derived: ~13 s across 3 decisions' },
  jevSecondsPerDecision:   { kind: 'derived',  note: 'derived: mean of 0.30, 0.25 and 0.28 s' },
  workingDaysPerMonth:     { kind: 'estimate', note: 'our estimate' },
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
```

Note: `sanitize` clamps negatives to 0 for *inputs*; the negative-saving test passes because the subtraction happens after sanitizing, with jev = 10 > claude = 4.3.

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: all passing (smoke + 7 ledger tests).

- [ ] **Step 5: Commit**

```bash
git add js/ledger-logic.js tests/ledger-logic.test.js
git commit -m "feat: ledger math with provenance labels"
```

---

### Task 3: Router logic (pure)

**Files:**
- Create: `js/router-logic.js`, `tests/router-logic.test.js`

**Interfaces:**
- Produces:
  - `QUESTIONS`: array of `{ id, label, kind: 'bounded'|'judgment', type?: 'boolean'|'categorical', answer?: string, probability?: number }`.
  - `DEFAULT_THRESHOLD = 0.87`.
  - `normalizeThreshold(value: unknown): number` → rounded to 2 dp, clamped to [0.5, 0.99], `DEFAULT_THRESHOLD` if not finite.
  - `route(question, threshold): { path: 'direct'|'jev'|'fallback', reason: string }`.

- [ ] **Step 1: Write the failing tests**

`tests/router-logic.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS, DEFAULT_THRESHOLD, normalizeThreshold, route } from '../js/router-logic.js';

const q = (id) => QUESTIONS.find((x) => x.id === id);

test('three scripted questions exist with the spec values', () => {
  assert.equal(QUESTIONS.length, 3);
  assert.equal(q('tests').probability, 0.94);
  assert.equal(q('agent').probability, 0.71);
  assert.equal(q('persuasive').kind, 'judgment');
  assert.equal(DEFAULT_THRESHOLD, 0.87);
});

test('bounded question above threshold goes through Jev', () => {
  const r = route(q('tests'), 0.87);
  assert.equal(r.path, 'jev');
  assert.match(r.reason, /0\.94/);
});

test('bounded question below threshold falls back to Claude', () => {
  const r = route(q('agent'), 0.87);
  assert.equal(r.path, 'fallback');
  assert.match(r.reason, /below/i);
});

test('judgment question never reaches Jev', () => {
  const r = route(q('persuasive'), 0.5);
  assert.equal(r.path, 'direct');
  assert.match(r.reason, /straight to Claude/i);
});

test('boundary equality passes', () => {
  assert.equal(route(q('tests'), 0.94).path, 'jev');
  assert.equal(route(q('agent'), 0.71).path, 'jev');
  assert.equal(route(q('tests'), 0.95).path, 'fallback');
});

test('threshold is rounded to two decimals and clamped', () => {
  assert.equal(normalizeThreshold(0.7100000001), 0.71);
  assert.equal(normalizeThreshold('0.9'), 0.9);
  assert.equal(normalizeThreshold(2), 0.99);
  assert.equal(normalizeThreshold(-1), 0.5);
  assert.equal(normalizeThreshold('x'), DEFAULT_THRESHOLD);
  assert.equal(route(q('agent'), 0.7100000001).path, 'jev');
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/router-logic.test.js` → FAIL, module not found.

- [ ] **Step 3: Implement js/router-logic.js**

```js
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
```

- [ ] **Step 4: Run tests** → `npm test`, all passing.

- [ ] **Step 5: Commit**

```bash
git add js/router-logic.js tests/router-logic.test.js
git commit -m "feat: router decision logic for the routed-request demo"
```

---

### Task 4: Proof logic (pure)

**Files:**
- Create: `js/proof-logic.js`, `tests/proof-logic.test.js`

**Interfaces:**
- Produces:
  - `SLOTS = ['artifact','diff','tests','limits','receipt']`
  - `SCENARIOS`: object keyed `complete | missing-tests | mismatch | dead-receipt`, each `{ label, evidence: Record<slot, boolean>, matchesGoal: boolean, receiptResolves: boolean }`.
  - `missingSlots(evidence): string[]`
  - `verify({ evidence, matchesGoal, receiptResolves }): 'INCOMPLETE'|'UNKNOWN'|'REFUTED'|'VERIFIED'`
  - `repair(scenario): scenario` (all evidence true, other fields unchanged)
  - `narrate(result, missing): string`

- [ ] **Step 1: Write the failing tests**

`tests/proof-logic.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SLOTS, SCENARIOS, missingSlots, verify, repair, narrate } from '../js/proof-logic.js';

test('five slots in contract order', () => {
  assert.deepEqual(SLOTS, ['artifact', 'diff', 'tests', 'limits', 'receipt']);
});

test('scenarios map to the four outcomes', () => {
  assert.equal(verify(SCENARIOS.complete), 'VERIFIED');
  assert.equal(verify(SCENARIOS['missing-tests']), 'INCOMPLETE');
  assert.equal(verify(SCENARIOS.mismatch), 'REFUTED');
  assert.equal(verify(SCENARIOS['dead-receipt']), 'UNKNOWN');
});

test('empty evidence is INCOMPLETE', () => {
  assert.equal(verify({ evidence: {}, matchesGoal: true, receiptResolves: true }), 'INCOMPLETE');
  assert.deepEqual(missingSlots({}), SLOTS);
});

test('incompleteness wins over everything else', () => {
  assert.equal(verify({ evidence: { artifact: true }, matchesGoal: false, receiptResolves: false }), 'INCOMPLETE');
});

test('an unresolvable receipt is UNKNOWN even if the goal would mismatch', () => {
  const ev = Object.fromEntries(SLOTS.map((s) => [s, true]));
  assert.equal(verify({ evidence: ev, matchesGoal: false, receiptResolves: false }), 'UNKNOWN');
});

test('repair fills the missing slot and keeps the rest', () => {
  const fixed = repair(SCENARIOS['missing-tests']);
  assert.equal(verify(fixed), 'VERIFIED');
  assert.deepEqual(missingSlots(fixed.evidence), []);
  assert.equal(SCENARIOS['missing-tests'].evidence.tests, false, 'original untouched');
});

test('narration names the missing slots', () => {
  assert.match(narrate('INCOMPLETE', ['tests']), /tests/);
  assert.match(narrate('VERIFIED', []), /merge/i);
  assert.match(narrate('REFUTED', []), /revise/i);
  assert.match(narrate('UNKNOWN', []), /reproduce/i);
});
```

- [ ] **Step 2: Run to verify failure** → `node --test tests/proof-logic.test.js`, FAIL.

- [ ] **Step 3: Implement js/proof-logic.js**

```js
// Pure verifier logic for the chapter 3 demo. No DOM. See spec §6.3.
export const SLOTS = Object.freeze(['artifact', 'diff', 'tests', 'limits', 'receipt']);

const all = (except = []) => Object.fromEntries(SLOTS.map((s) => [s, !except.includes(s)]));

export const SCENARIOS = Object.freeze({
  'complete':      { label: 'Complete and correct',       evidence: all(),          matchesGoal: true,  receiptResolves: true },
  'missing-tests': { label: 'Missing tests',              evidence: all(['tests']), matchesGoal: true,  receiptResolves: true },
  'mismatch':      { label: "Doesn't match the goal",     evidence: all(),          matchesGoal: false, receiptResolves: true },
  'dead-receipt':  { label: "Receipt doesn't resolve",    evidence: all(),          matchesGoal: true,  receiptResolves: false },
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
    case 'INCOMPLETE': return `${missing.join(', ')} missing. Not done: return for repair.`;
    case 'REFUTED':    return "Evidence is complete, but the artifact doesn't do what the goal asked. Revise.";
    case 'UNKNOWN':    return "The receipt doesn't resolve, so the review can't reproduce the result. Revise, and fix the receipt.";
    default:           return '';
  }
}
```

- [ ] **Step 4: Run tests** → `npm test`, all passing.

- [ ] **Step 5: Commit**

```bash
git add js/proof-logic.js tests/proof-logic.test.js
git commit -m "feat: proof-contract verifier logic"
```

---

### Task 5: Worktree simulation logic (pure)

**Files:**
- Create: `js/worktree-logic.js`, `tests/worktree-logic.test.js`

**Interfaces:**
- Produces:
  - `COLUMNS`: `[{ id:'A', name:'API', owns:[...], fillMs:2400 }, { id:'B', name:'UI', owns:[...], fillMs:3100 }, { id:'C', name:'Tests', owns:[...], fillMs:1800 }, { id:'D', name:'Docs', owns:[...], fillMs:2700 }]`
  - `SHARED_PATH = 'styles/'`, `MERGE_GAP_MS = 300`, `COLLISION_AT_FRACTION = 0.6`, `REWORK_RESET_FRACTION = 0.3`, `CONFLICT_PAUSE_MS = 1800`
  - `simulate({ isolated: boolean }): { events: Event[], totals: { collisions, reworks, releaseAt } }` where `Event = { t: number, kind: 'start'|'done'|'review'|'collision'|'rework'|'resume'|'merge'|'release', column?: string, columns?: string[], detail?: string, remainingMs?: number }` sorted by `t` (stable).
  - `tally(totals, isolatedReleaseAt): string`

- [ ] **Step 1: Write the failing tests**

`tests/worktree-logic.test.js`:
```js
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
```

- [ ] **Step 2: Run to verify failure** → FAIL, module not found.

- [ ] **Step 3: Implement js/worktree-logic.js**

```js
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
```

- [ ] **Step 4: Run tests** → `npm test`, all passing.

- [ ] **Step 5: Commit**

```bash
git add js/worktree-logic.js tests/worktree-logic.test.js
git commit -m "feat: worktree merge simulation timeline"
```

---

### Task 6: Masthead, hero, margin navigation, reveals

**Files:**
- Modify: `index.html` (replace `<!-- region:nav -->…<!-- /region:nav -->` and `<!-- region:top -->…<!-- /region:top -->`)
- Modify: `css/guide.css` (append), `js/main.js` (append imports)
- Create: `js/nav.js`, `js/reveal.js`

**Interfaces:**
- Consumes: `register()` from `js/main.js`.
- Produces: `data-reveal` attribute convention (elements get `.is-visible`), `.bar`, `.card`, `.panel`, `.sticky`, `.chip`, `.btn`, `.stamp` classes used by every later task; `openDepth` custom event `jevvy:open-depth` dispatched on `document` by nav when the DEEPER marker or the hash targets the depth layer (Task 8 listens).

Before styling, read `~/.agents/skills/impeccable/reference/typography.md` and `spatial-design.md` once (skim; they inform the choices below, do not change the tokens).

- [ ] **Step 1: Replace the nav region in index.html**

```html
<!-- region:nav -->
<nav class="margin" aria-label="Chapters">
  <ol class="margin__numbers" aria-hidden="true" data-line-numbers></ol>
  <ul class="margin__markers">
    <li><a href="#control-plane" data-marker="control-plane"><span class="label">01</span><span class="margin__name">Control plane</span></a></li>
    <li><a href="#go-deeper" data-marker="go-deeper" data-opens-depth><span class="label">Deeper</span><span class="margin__name">Go deeper</span></a></li>
    <li><a href="#worktree-method" data-marker="worktree-method"><span class="label">02</span><span class="margin__name">Worktree method</span></a></li>
    <li><a href="#proof-contract" data-marker="proof-contract"><span class="label">03</span><span class="margin__name">Proof contract</span></a></li>
    <li><a href="#receipt" data-marker="receipt"><span class="label">Receipt</span><span class="margin__name">Receipt</span></a></li>
  </ul>
</nav>
<!-- /region:nav -->
```

- [ ] **Step 2: Replace the top region in index.html**

```html
<!-- region:top -->
<header id="top" class="region hero">
  <p class="hero__running label">
    <span>Jev + Claude Code · Agent field guide · adapted</span>
    <span>Murat Baturay · 2026</span>
  </p>
  <h1 class="display hero__title" data-reveal>Stop paying a writer to answer yes or no.</h1>
  <p class="hero__deck" data-reveal style="--i:1">A field guide to splitting judgment from execution in Claude Code agents, with Jev answering the bounded questions.</p>
  <aside class="sticky hero__credit" data-reveal style="--i:2" aria-label="Credit">
    Adapted from the <a href="https://x.com/cyrilxbt" rel="noopener">Agent Field Guide by @cyrilxbt</a> and a source article on the Jev + Claude Code stack (<span data-article-link>link pending</span>). Rebuilt, reworded, and fact-checked, September 2026.
  </aside>
  <ul class="hero__chips" data-reveal style="--i:3">
    <li><a class="chip" href="#control-plane">01 Control plane</a></li>
    <li><a class="chip" href="#worktree-method">02 Worktree method</a></li>
    <li><a class="chip" href="#proof-contract">03 Proof contract</a></li>
  </ul>
</header>
<!-- /region:top -->
```

- [ ] **Step 3: Append primitives and hero/nav styles to css/guide.css**

```css
/* ---------- Primitives ---------- */
.bar {
  display: flex; align-items: center; justify-content: space-between; gap: var(--sp-md);
  background: var(--ink); color: var(--card);
  padding: 12px 24px; border-radius: var(--radius-md);
}
.bar--teal { background: var(--teal); }
.bar__note { font-size: var(--fs-label); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.85; }

.card {
  background: var(--card); color: var(--ink);
  border: 1px solid var(--ink); border-radius: var(--radius-md);
  box-shadow: var(--shadow-sticker);
  padding: 16px 20px;
  transition: transform var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease);
}
.card:hover { transform: translate(-1px, -1px); box-shadow: var(--shadow-sticker-hover); }
.card__title { display: block; font-weight: 700; margin-bottom: var(--sp-xs); }
.card__body { font-size: var(--fs-body); }

.panel { border: 1px solid var(--ink); border-radius: var(--radius-md); padding: 20px; }
.panel--mint { background: var(--mint); }
.panel--marker { background: var(--marker); }
.panel__title { font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: var(--sp-md); }

.sticky {
  display: inline-block; background: var(--marker); color: var(--ink);
  padding: 16px 18px; max-width: 34ch; box-shadow: var(--shadow-sticky);
  transform: rotate(var(--tilt, -1.5deg));
  font-size: var(--fs-body);
}
.sticky a { color: inherit; }

.chip {
  display: inline-block; padding: 6px 10px; border: 1px solid var(--ink); border-radius: var(--radius-sm);
  background: var(--card); font-size: var(--fs-label); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
  text-decoration: none; transition: background var(--dur-fast) var(--ease);
}
.chip:hover { background: var(--mint); }

.btn {
  display: inline-block; cursor: pointer; padding: 12px 20px; border: 1px solid var(--ink); border-radius: var(--radius-sm);
  background: var(--ink); color: var(--card); font-size: var(--fs-label); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
  transition: background var(--dur-fast) var(--ease);
}
.btn:hover { background: var(--teal); }
.btn:disabled { cursor: not-allowed; background: var(--card); color: var(--ink-soft); border-color: var(--rule); }
.btn--ghost { background: var(--card); color: var(--ink); }
.btn--ghost:hover { background: var(--marker); color: var(--ink); }

.stamp {
  display: inline-block; padding: 4px 10px; border: 2px solid var(--stamp-color, var(--ink)); color: var(--stamp-color, var(--ink));
  border-radius: var(--radius-sm); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; font-size: var(--fs-label);
  transform: rotate(var(--tilt, -4deg)); mix-blend-mode: multiply;
}
.stamp--signal { --stamp-color: var(--signal); }
.stamp--soft { --stamp-color: var(--ink-soft); }
.stamp--marker { --stamp-color: oklch(62% 0.14 90); }
.stamp.is-landing { animation: stamp-land var(--dur-mid) var(--ease) both; }
@keyframes stamp-land { from { transform: rotate(var(--tilt, -4deg)) scale(1.15); opacity: 0; } to { transform: rotate(var(--tilt, -4deg)) scale(1); opacity: 1; } }

.narration { min-height: 1.5em; margin-top: var(--sp-md); font-size: var(--fs-body); }
.narration::before { content: "→ "; color: var(--ink-soft); }

/* ---------- Reveal ---------- */
[data-reveal] { opacity: 0; transform: translateY(8px); transition: opacity var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease); transition-delay: calc(var(--i, 0) * 40ms); }
[data-reveal].is-visible { opacity: 1; transform: none; }
.sticky[data-reveal] { transform: rotate(-6deg); transition-duration: var(--dur-mid); }
.sticky[data-reveal].is-visible { transform: rotate(var(--tilt, -1.5deg)); }
@media (prefers-reduced-motion: reduce) {
  [data-reveal], .sticky[data-reveal] { opacity: 1; transform: rotate(var(--tilt, 0deg)); transition: none; }
  .stamp.is-landing { animation: none; }
  .card { transition: none; }
}

/* ---------- Margin navigation ---------- */
.margin { position: sticky; top: 0; z-index: 20; background: var(--paper); }
.margin__numbers { display: none; }
.margin__markers { display: flex; gap: var(--sp-xs); padding: var(--sp-sm) var(--sp-md); border-bottom: 1px solid var(--rule); overflow-x: auto; }
.margin__markers a {
  display: inline-flex; align-items: center; min-height: 44px; padding: 0 10px;
  text-decoration: none; color: var(--ink-soft); white-space: nowrap;
}
.margin__markers a[aria-current="true"] { background: var(--marker); color: var(--ink); }
.margin__name { display: none; }
@media (min-width: 700px) { .margin__name { display: inline; margin-left: var(--sp-sm); font-size: var(--fs-label); text-transform: uppercase; letter-spacing: 0.08em; } }
@media (min-width: 1100px) {
  .margin { top: 0; height: 100vh; border-right: 1px solid var(--rule); padding-top: var(--sp-xl);
    background-image: repeating-linear-gradient(to bottom, transparent 0 calc(2rem - 1px), var(--rule) calc(2rem - 1px) 2rem); }
  .margin__numbers { display: block; position: absolute; inset: var(--sp-xl) 0 0 0; padding-left: 10px; color: var(--rule); font-size: var(--fs-label); line-height: 2rem; font-weight: 700; }
  .margin__markers { position: absolute; top: var(--sp-xl); left: 0; right: 0; flex-direction: column; gap: 2rem; padding: 0; border: 0; overflow: visible; }
  .margin__markers a { min-height: 2rem; padding: 0 10px; background: var(--paper); }
  .margin__name { display: none; }
}

/* ---------- Hero ---------- */
.hero { display: grid; gap: var(--sp-lg); padding-top: var(--sp-xl); }
.hero__running { display: flex; justify-content: space-between; gap: var(--sp-md); flex-wrap: wrap; color: var(--ink-soft); padding-bottom: var(--sp-sm); border-bottom: 1px solid var(--rule); }
.hero__title { max-width: 14ch; }
.hero__deck { max-width: 52ch; font-size: 1.05rem; }
.hero__credit { --tilt: 1.5deg; justify-self: start; }
.hero__chips { display: flex; flex-wrap: wrap; gap: var(--sp-sm); }
@media (min-width: 900px) {
  .hero { grid-template-columns: 1fr auto; align-items: start; }
  .hero__running, .hero__chips { grid-column: 1 / -1; }
  .hero__credit { grid-column: 2; grid-row: 2 / 4; align-self: center; --tilt: 2deg; }
}
```

- [ ] **Step 4: Write js/reveal.js**

```js
// Reveal-on-scroll, once per element, off under reduced motion.
import { register } from './registry.js';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initReveal(root = document) {
  const els = root.querySelectorAll('[data-reveal]');
  if (reduced() || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-visible')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
  }, { threshold: 0.2 });
  els.forEach((el) => io.observe(el));
}

register('body', () => initReveal(document));
```

- [ ] **Step 5: Write js/nav.js**

```js
// Ruled margin: line numbers, scroll-spy, hash → depth layer.
import { register } from './registry.js';

const LINE_PX = 32;
export const OPEN_DEPTH_EVENT = 'jevvy:open-depth';

export function initNav(nav) {
  const markers = [...nav.querySelectorAll('[data-marker]')];
  const sections = markers.map((a) => document.getElementById(a.dataset.marker)).filter(Boolean);
  const numbers = nav.querySelector('[data-line-numbers]');

  // Line numbers: a column sized to the viewport, offset by scroll position.
  function renderNumbers() {
    if (!numbers || getComputedStyle(numbers).display === 'none') return;
    const count = Math.ceil(window.innerHeight / LINE_PX) + 1;
    const start = Math.floor(window.scrollY / LINE_PX);
    const frag = [];
    for (let i = 0; i < count; i++) frag.push(`<li>${String(start + i + 1).padStart(2, '0')}</li>`);
    numbers.innerHTML = frag.join('');
  }
  let ticking = false;
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { renderNumbers(); ticking = false; }); } }, { passive: true });
  window.addEventListener('resize', renderNumbers);
  renderNumbers();

  // Scroll-spy: the section whose top is closest above the 40% line wins.
  function spy() {
    const line = window.innerHeight * 0.4;
    let current = sections[0];
    for (const s of sections) if (s.getBoundingClientRect().top <= line) current = s;
    markers.forEach((a) => a.dataset.marker === current?.id ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'));
  }
  window.addEventListener('scroll', spy, { passive: true });
  spy();

  // DEEPER marker and hash both open the depth layer before scrolling.
  nav.querySelectorAll('[data-opens-depth]').forEach((a) => a.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent(OPEN_DEPTH_EVENT));
  }));
  function checkHash() { if (location.hash === '#go-deeper') document.dispatchEvent(new CustomEvent(OPEN_DEPTH_EVENT)); }
  window.addEventListener('hashchange', checkHash);
  checkHash();
}

register('nav.margin', initNav);
```

- [ ] **Step 6: Wire modules in js/main.js**

Add these two lines at the top of `js/main.js`, after the registry import:
```js
import './reveal.js';
import './nav.js';
```
Feature modules import `register` from `./registry.js`, never from `./main.js`. Verify in the browser console that there are no module errors.

- [ ] **Step 7: Browser check**

Open `http://127.0.0.1:4173/`. Verify with screenshots at desktop and `resize_window` mobile:
- Hero: headline wraps at about 14 characters per line, sticky note tilted, chips render.
- At ≥1100 px: ruled margin with line numbers on the left; numbers change as you scroll (`javascript_tool`: `window.scrollTo(0, 800)` then read the first `li`).
- At mobile: sticky top bar with five markers, no horizontal scroll (`document.documentElement.scrollWidth <= window.innerWidth`).
- `aria-current` moves to the chapter in view (scroll to `#worktree-method`, then `find` "aria-current").
- No console errors.

- [ ] **Step 8: Commit**

```bash
git add index.html css/guide.css js/main.js js/nav.js js/reveal.js
git commit -m "feat: hero, ruled margin navigation and scroll reveals"
```

---

### Task 7: Chapter 01 content and the routed-request demo

**Files:**
- Modify: `index.html` (replace region `control-plane`), `css/guide.css` (append), `js/main.js` (import)
- Create: `js/router-demo.js`

**Interfaces:**
- Consumes: `QUESTIONS`, `DEFAULT_THRESHOLD`, `normalizeThreshold`, `route` from `js/router-logic.js`; `register` from `js/main.js`; `.card/.panel/.bar/.btn/.stamp/.narration` from Task 6.
- Produces: `[data-demo="router"]` root; a `button[data-open-depth]` that Task 8's depth module listens to via the `jevvy:open-depth` event.

Read `~/.agents/skills/impeccable/reference/interaction-design.md` and `motion-design.md` before Step 3.

- [ ] **Step 1: Replace the control-plane region in index.html**

```html
<!-- region:control-plane -->
<section id="control-plane" class="region chapter" aria-labelledby="h-control-plane">
  <div class="bar chapter__bar" data-reveal>
    <h2 id="h-control-plane" class="headline">01 · The Control Plane</h2>
    <span class="bar__note">Separate judgment from execution</span>
  </div>
  <p class="chapter__sub" data-reveal style="--i:1">One loop, two jobs. Decide cheap. Generate when it counts.</p>

  <h3 class="label chapter__h3" data-reveal>Two layers, one gate</h3>
  <div class="layers" data-reveal style="--i:1">
    <div class="panel panel--mint layer">
      <p class="panel__title">Decision layer · Jev</p>
      <ul class="layer__cards">
        <li class="card"><span class="card__title">Answers bounded questions</span><span class="card__body">Yes or no. One of five. A score from 0 to 1. Questions with an answer space you wrote down in advance.</span></li>
        <li class="card"><span class="card__title">Returns a typed answer with a probability</span><span class="card__body">Not a paragraph that happens to contain a verdict. A value your code can branch on, and a number saying how sure.</span></li>
        <li class="card"><span class="card__title">Flags low confidence</span><span class="card__body">Under your threshold it says so instead of bluffing. That is what calibration is for.</span></li>
        <li class="card"><span class="card__title">Never writes text</span><span class="card__body">No prose, no summaries, no explanations. If the job is to write, it is not this layer's job.</span></li>
      </ul>
    </div>
    <div class="gate" role="group" aria-label="Policy gate">
      <p class="gate__title headline">Policy<br>gate</p>
      <ul class="gate__rules label">
        <li>Threshold per decision type</li>
        <li>Allowed tools and scope</li>
        <li>Below threshold: fall back to Claude</li>
      </ul>
    </div>
    <div class="panel panel--marker layer">
      <p class="panel__title">Execution layer · Claude Code</p>
      <ul class="layer__cards">
        <li class="card"><span class="card__title">Reads the repository</span><span class="card__body">Finds the files, understands the code, builds the context the decision was made from.</span></li>
        <li class="card"><span class="card__title">Generates the review, the fix, the doc</span><span class="card__body">Unbounded output is what a language model is for. This part never moves.</span></li>
        <li class="card"><span class="card__title">Runs tools and tests</span><span class="card__body">Executes commands, linters, and test suites, and captures what came back.</span></li>
        <li class="card"><span class="card__title">Returns the changed artifact</span><span class="card__body">A diff, an updated file, a report. Something a verifier can inspect.</span></li>
      </ul>
    </div>
  </div>

  <h3 class="label chapter__h3" data-reveal>From request to verified result</h3>
  <figure class="demo" data-demo="router" data-reveal style="--i:1">
    <svg class="flow" viewBox="0 0 1000 220" role="img" aria-labelledby="flow-title flow-desc">
      <title id="flow-title">Request flow through Jev, the policy gate, and Claude Code</title>
      <desc id="flow-desc">Five stations left to right: goal and evidence, Jev answers, policy gate, Claude Code acts, result verified. Below the gate, a detour to Claude reasoning for low-confidence answers.</desc>
      <g class="flow__lines" fill="none" stroke="currentColor" stroke-width="2">
        <path data-line="s1" d="M180 70 H260"/>
        <path data-line="s2" d="M420 70 H500"/>
        <path data-line="s3" d="M600 70 H680"/>
        <path data-line="s4" d="M840 70 H920"/>
        <path data-line="skip" d="M180 70 C 300 20, 380 20, 500 70" stroke-dasharray="6 6" opacity="0.5"/>
        <path data-line="detour1" d="M550 110 V150 H420" stroke-dasharray="6 6"/>
        <path data-line="detour2" d="M420 150 H680 V110" stroke-dasharray="6 6"/>
      </g>
      <g class="flow__stations">
        <g data-station="goal"><rect x="20" y="40" width="160" height="60" rx="6"/><text x="100" y="66">Goal + evidence</text><text x="100" y="86" class="flow__small">what you want, what you have</text></g>
        <g data-station="jev"><rect x="260" y="40" width="160" height="60" rx="6"/><text x="340" y="66">Jev answers</text><text x="340" y="86" class="flow__small" data-answer-chip>typed + probability</text></g>
        <g data-station="gate"><rect x="500" y="40" width="100" height="60" rx="6"/><text x="550" y="66">Policy</text><text x="550" y="86">gate</text></g>
        <g data-station="claude"><rect x="680" y="40" width="160" height="60" rx="6"/><text x="760" y="66">Claude Code acts</text><text x="760" y="86" class="flow__small">reads, edits, runs</text></g>
        <g data-station="verified"><rect x="920" y="40" width="60" height="60" rx="6"/><text x="950" y="75">✓</text></g>
        <g data-station="reason"><rect x="300" y="130" width="120" height="40" rx="6"/><text x="360" y="155">Claude reasons</text></g>
      </g>
      <circle class="flow__token" data-token r="8" cx="100" cy="70"/>
    </svg>
    <form class="demo__controls" data-controls>
      <fieldset class="demo__field">
        <legend class="label">Pick a question</legend>
        <ul class="demo__radios" data-questions></ul>
      </fieldset>
      <div class="demo__field">
        <label class="label" for="router-threshold">Confidence threshold <output data-threshold-out for="router-threshold">0.87</output></label>
        <input id="router-threshold" type="range" min="0.5" max="0.99" step="0.01" value="0.87" data-threshold>
        <p class="soft" data-threshold-note hidden>Not used: judgment calls skip Jev.</p>
      </div>
      <button type="submit" class="btn">Run</button>
    </form>
    <figcaption class="narration" data-narration aria-live="polite">Pick a question and press Run.</figcaption>
  </figure>

  <div class="rule-strip" data-reveal>
    <p class="headline rule-strip__line">The classifier answers. The gate authorizes. The tool executes.</p>
    <ul class="rule-strip__labels label">
      <li>Jev answers what you asked</li>
      <li>The gate decides what's allowed</li>
      <li>Claude Code does it within bounds</li>
    </ul>
  </div>

  <aside class="sticky chapter__deeper" data-reveal style="--tilt:-1deg">
    <p>Why this split is worth 20 to 200x on the right loop, and nothing on the wrong one.</p>
    <button type="button" class="btn" data-open-depth aria-controls="go-deeper" aria-expanded="false">Go deeper</button>
  </aside>
</section>
<!-- /region:control-plane -->
```

- [ ] **Step 2: Append chapter and demo styles to css/guide.css**

```css
/* ---------- Chapters ---------- */
.chapter { display: grid; gap: var(--sp-lg); }
.chapter__bar { margin-bottom: var(--sp-sm); }
.chapter__sub { font-size: 1.05rem; max-width: 60ch; }
.chapter__h3 { color: var(--ink-soft); margin-top: var(--sp-md); }
.chapter__deeper { justify-self: start; display: grid; gap: var(--sp-md); }

.layers { display: grid; gap: var(--sp-md); }
.layer__cards { display: grid; gap: var(--sp-sm); }
.gate { background: var(--ink); color: var(--card); border-radius: var(--radius-md); padding: var(--sp-lg); display: grid; gap: var(--sp-md); align-content: center; text-align: center; }
.gate__title { font-size: var(--fs-headline); }
.gate__rules { display: grid; gap: var(--sp-sm); opacity: 0.9; }
@media (min-width: 1100px) { .layers { grid-template-columns: 1fr 160px 1fr; } }

.rule-strip { border: 1px solid var(--ink); border-radius: var(--radius-md); padding: var(--sp-lg); background: var(--card); display: grid; gap: var(--sp-md); }
.rule-strip__line { font-size: clamp(1.25rem, 2.6vw, 2rem); }
.rule-strip__labels { display: grid; gap: var(--sp-sm); color: var(--ink-soft); }
@media (min-width: 700px) { .rule-strip__labels { grid-template-columns: repeat(3, 1fr); } }

/* ---------- Demo frame ---------- */
.demo { display: grid; gap: var(--sp-md); border: 1px solid var(--ink); border-radius: var(--radius-md); padding: var(--sp-lg); background: var(--card); box-shadow: var(--shadow-sticker); }
.demo__controls { display: grid; gap: var(--sp-md); align-items: end; }
.demo__field { display: grid; gap: var(--sp-sm); border: 0; padding: 0; margin: 0; min-width: 0; }
.demo__radios { display: grid; gap: var(--sp-xs); }
.demo__radios label { display: flex; gap: var(--sp-sm); align-items: center; min-height: 32px; }
.demo input[type="range"] { width: 100%; accent-color: var(--ink); }
.demo input[type="number"] { width: 100%; padding: 8px 10px; border: 1px solid var(--ink); border-radius: var(--radius-sm); background: var(--card); }
.demo select { padding: 8px 10px; border: 1px solid var(--ink); border-radius: var(--radius-sm); background: var(--card); }
@media (min-width: 700px) { .demo__controls { grid-template-columns: 1fr 1fr auto; } }

/* ---------- Router flow ---------- */
.flow { width: 100%; color: var(--ink); }
.flow rect { fill: var(--card); stroke: var(--ink); stroke-width: 2; }
.flow text { fill: var(--ink); font-family: var(--font-mono); font-size: 14px; text-anchor: middle; }
.flow .flow__small { font-size: 11px; fill: var(--ink-soft); }
.flow [data-station="jev"] rect { fill: var(--mint); }
.flow [data-station="claude"] rect { fill: var(--marker); }
.flow [data-station="gate"] rect { fill: var(--ink); }
.flow [data-station="gate"] text { fill: var(--card); }
.flow [data-station="gate"].is-allowed rect { fill: var(--mint); }
.flow [data-station="gate"].is-allowed text, .flow [data-station="gate"].is-fallback text { fill: var(--ink); }
.flow [data-station="gate"].is-fallback rect { fill: var(--marker); }
.flow [data-station].is-dim { opacity: 0.35; }
.flow [data-line] { stroke-dasharray: 400; stroke-dashoffset: 400; }
/* Dashed lines reveal by opacity, not by dash offset, so they keep their dashes. */
.flow [data-line="skip"], .flow [data-line^="detour"] { stroke-dasharray: 6 6; stroke-dashoffset: 0; opacity: 0; }
.flow [data-line].is-drawn { stroke-dashoffset: 0; opacity: 1; transition: stroke-dashoffset var(--dur-slow) var(--ease), opacity var(--dur-fast); }
.flow__token { fill: var(--ink); transition: cx var(--dur-slow) var(--ease), cy var(--dur-slow) var(--ease), opacity var(--dur-fast); }
@media (prefers-reduced-motion: reduce) { .flow [data-line], .flow__token { transition: none; } .flow [data-line] { stroke-dashoffset: 0; } }
```

- [ ] **Step 3: Write js/router-demo.js**

```js
// Routed-request demo. DOM only; decisions come from router-logic.js.
import { register } from './registry.js';
import { QUESTIONS, DEFAULT_THRESHOLD, normalizeThreshold, route } from './router-logic.js';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms) => new Promise((r) => setTimeout(r, reduced() ? 0 : ms));

const STATION_X = { goal: 100, jev: 340, gate: 550, claude: 760, verified: 950, reason: 360 };
const STATION_Y = { goal: 70, jev: 70, gate: 70, claude: 70, verified: 70, reason: 150 };

export function initRouterDemo(root) {
  const svg = root.querySelector('svg');
  const token = svg.querySelector('[data-token]');
  const gate = svg.querySelector('[data-station="gate"]');
  const jevStation = svg.querySelector('[data-station="jev"]');
  const answerChip = svg.querySelector('[data-answer-chip]');
  const lines = Object.fromEntries([...svg.querySelectorAll('[data-line]')].map((l) => [l.dataset.line, l]));
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
    answerChip.textContent = 'typed + probability';
    move('goal');
  }
  function move(station) { token.setAttribute('cx', STATION_X[station]); token.setAttribute('cy', STATION_Y[station]); }
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
      jevStation.classList.add('is-dim');
      if (!(await step('skip', 'gate', id))) return;
      gate.classList.add('is-allowed');
      if (!(await step('s3', 'claude', id))) return;
      if (!(await step('s4', 'verified', id))) return;
    } else {
      if (!(await step('s1', 'jev', id))) return;
      answerChip.textContent = `${q.answer} · ${q.probability.toFixed(2)}`;
      if (!(await step('s2', 'gate', id))) return;
      if (result.path === 'jev') {
        gate.classList.add('is-allowed');
        if (!(await step('s3', 'claude', id))) return;
      } else {
        gate.classList.add('is-fallback');
        if (!(await step('detour1', 'reason', id))) return;
        if (!(await step('detour2', 'claude', id))) return;
      }
      if (!(await step('s4', 'verified', id))) return;
    }
    narration.textContent = result.reason;
  }
}

register('[data-demo="router"]', initRouterDemo);
```

Add `import './router-demo.js';` to the top of `js/main.js`.

- [ ] **Step 4: Browser check**

- Default (question 1, 0.87): token moves goal → Jev (chip reads "no · 0.94") → gate turns mint → Claude Code → ✓; narration matches `route().reason`.
- Select question 2: gate turns yellow, token detours through "Claude reasons"; drag the slider to 0.70 and the run flips to the mint path.
- Select question 3: Jev station dims, slider disabled with the note, token takes the dashed skip line.
- Keyboard: Tab reaches radios, slider, Run; arrow keys on the slider re-run; the narration is read by a screen reader (check `aria-live` in `read_page`).
- Reduced motion (`resize_window` has no motion toggle; emulate by running `matchMedia` override is not possible, so temporarily set `--dur-slow: 0ms` in devtools or trust the `wait()` guard and verify it in Task 13 with the OS setting).
- Mobile width: the SVG scales; text remains legible (zoom screenshot).

- [ ] **Step 5: Commit**

```bash
git add index.html css/guide.css js/main.js js/router-demo.js
git commit -m "feat: chapter 01 content and routed-request demo"
```

---

### Task 8: Depth layer shell and prose (parts 1–7 and 9)

**Files:**
- Modify: `index.html` (replace region `go-deeper`), `css/depth.css` (write), `js/main.js` (import)
- Create: `js/depth.js`

**Interfaces:**
- Consumes: `OPEN_DEPTH_EVENT` from `js/nav.js`; `button[data-open-depth]` from Task 7.
- Produces: `#go-deeper` with `.depth__panel[data-depth-panel]`, a `[data-ledger]` placeholder `<div>` inside part 08 that Task 9 fills, `openDepth()`/`closeDepth()` exported.

Read `~/.agents/skills/impeccable/reference/typography.md` (long-form measure) and `ux-writing.md`.

- [ ] **Step 1: Replace the go-deeper region in index.html**

```html
<!-- region:go-deeper -->
<section id="go-deeper" class="region depth" aria-labelledby="h-go-deeper">
  <div class="depth__panel" data-depth-panel>
    <div class="depth__inner" inert>
      <header class="depth__head">
        <p class="label soft">Go deeper · inserted pages</p>
        <h2 id="h-go-deeper" class="depth__title" tabindex="-1">Why the split pays, and where it doesn't</h2>
        <p class="depth__lede">The three chapters are the pattern. These pages are the argument behind chapter 01, condensed from the source article and checked against what TypeSafe has published.</p>
      </header>

      <article class="depth__part" id="deeper-01">
        <p class="label depth__num">Part 01</p>
        <h3>Two jobs, one tool</h3>
        <p>Every agent you build with Claude Code does two different jobs with the same model. The first is generation: write the function, draft the reply, summarise the thread. The output space is unbounded, so it needs a language model. The second is decision: did the tests pass, should this merge, is this ticket urgent. The output space is bounded and typed. Yes or no. One of five. A number between 0 and 1.</p>
        <p>Today both jobs go through the generative model. Ask Claude whether a diff passes review and it writes a paragraph that happens to end in a verdict. You pay generation prices and generation latency for what is structurally a classification.</p>
        <p>Jev, from TypeSafe AI, was built for the second job only. You hand it state (a diff, a log, a transcript) and a list of typed questions. It returns an answer to each, with a calibrated probability, in one round trip. It generates nothing. TypeSafe calls the training method RLCD, reinforcement learning for calibrated decisions: the objective is to be right and to know how sure to be, rather than to sound right.</p>
        <dl class="figures">
          <div><dt>Latency per call</dt><dd>70 to 500 ms, against 3 to 329 s for chat models reasoning their way to the same classification</dd></div>
          <div><dt>Price</dt><dd>$0.042 per million input tokens; output tokens free, because there are none</dd></div>
          <div><dt>Provenance</dt><dd>TypeSafe's own figures, not independently verified; access is waitlist-only as of September 2026</dd></div>
        </dl>
      </article>

      <article class="depth__part" id="deeper-02">
        <p class="label depth__num">Part 02</p>
        <h3>Where the multiplier comes from</h3>
        <p>The 20 to 200x figure is not one Jev call racing one Claude call. It comes from decision density. Inside a real loop most model calls are checks: did that step succeed, is this the right file, does the output satisfy the constraint, retry or escalate. The source article's author counted 31 bounded checks in a single session that fixed a 340-line auth module. Each one went through the full model, which reasoned in prose and then concluded, for a question with two or three valid answers.</p>
        <p>Move those 31 checks to a classifier and you have not made one call faster. You have removed 31 generation calls and replaced them with 31 calls that return in under half a second for a fraction of a cent. The gain compounds at every decision point. A loop that is mostly generation, such as writing a long document, gets almost nothing, because there is nothing to offload.</p>
      </article>

      <article class="depth__part" id="deeper-03">
        <p class="label depth__num">Part 03</p>
        <h3>Three steps to wire it in</h3>
        <h4>1. Audit the decision points</h4>
        <p>Take a real transcript, not an imagined one, and mark every place the model was asked a bounded question. Five lines per point:</p>
        <pre class="code" aria-label="Decision point audit template"><span class="code__tag">template</span>Location:      where in the loop
Question:      as asked, verbatim
Answer space:  bounded or unbounded
Current cost:  tokens, seconds
Candidate:     yes or no</pre>
        <p>In loops with a review or validation step, expect 25 to 40% of calls to be decisions in a generation costume.</p>
        <h4>2. Define the typed schema</h4>
        <p>Give Jev the context and a list of typed questions. Every question is scored in the same round trip, so three questions cost one call, not three.</p>
        <pre class="code" aria-label="Illustrative schema"><span class="code__tag">illustrative</span>context:   &lt;raw test output&gt;
questions:
  - id: tests_pass        type: boolean
  - id: failure_kind      type: one-of [flake, related, environment, none]
  - id: confidence        type: score 0..1</pre>
        <h4>3. Route inside the loop</h4>
        <p>At each decision point, insert a router instead of a call to the generative model.</p>
        <pre class="code" aria-label="Illustrative router"><span class="code__tag">illustrative</span>decide(question, context):
  if question is a judgment call:   return claude.decide(context)
  answer = jev.ask(context, question.schema)
  if answer.probability &gt;= threshold[question.id]:
      return answer.value
  return claude.decide(context)      # fall back below threshold</pre>
        <p>The fallback line matters more than it looks. Part 07 is about it.</p>
      </article>

      <article class="depth__part" id="deeper-04">
        <p class="label depth__num">Part 04</p>
        <h3>A worked loop: review, decide, fix, rerun</h3>
        <p>An agent reviews a pull request, decides whether it needs changes, fixes it, reruns the tests, and decides what to do next. Figures are the source article's estimates for one PR.</p>
        <table class="ledger-table">
          <caption class="visually-hidden">Before and after moving the three decisions to Jev</caption>
          <thead><tr><th scope="col">Step</th><th scope="col">Before</th><th scope="col">After</th></tr></thead>
          <tbody>
            <tr><th scope="row">1 · Review the diff</th><td data-col="Before">Claude generates, ~1,400 tokens, ~11 s</td><td data-col="After">unchanged</td></tr>
            <tr><th scope="row">2 · Verdict: approve, change, escalate</th><td data-col="Before">Claude generates, ~600 tokens, ~5 s</td><td data-col="After">Jev, ~0.3 s</td></tr>
            <tr><th scope="row">3 · Write the fix</th><td data-col="Before">Claude generates</td><td data-col="After">unchanged</td></tr>
            <tr><th scope="row">4 · Did the tests pass, and is it my change?</th><td data-col="Before">Claude generates, ~500 tokens, ~4 s</td><td data-col="After">Jev, ~0.25 s</td></tr>
            <tr><th scope="row">5 · Merge, retry, or flag a human</th><td data-col="Before">Claude generates, ~450 tokens, ~4 s</td><td data-col="After">Jev, ~0.28 s</td></tr>
            <tr class="ledger-table__total"><th scope="row">Decision overhead per PR</th><td data-col="Before">~1,550 tokens, ~13 s</td><td data-col="After">~0.8 s, input tokens only</td></tr>
          </tbody>
        </table>
        <p>The review and the fix stayed on Claude. Only the classification weight moved. On a team pushing 40 to 60 PRs a day through a loop like this, that is the difference between an agent that feels slow in CI and one that answers before you have switched tabs.</p>
      </article>

      <article class="depth__part" id="deeper-05">
        <p class="label depth__num">Part 05</p>
        <h3>Where the ceiling is real</h3>
        <p>The top of the range shows up in one narrow band: high frequency, low ambiguity, tightly bounded decisions, run at volume.</p>
        <ul class="bands">
          <li><strong>Triage queues.</strong> Urgent, standard, or spam, thousands of times a day.</li>
          <li><strong>CI gating.</strong> Pass, fail, or flaky, on every commit across a large repository.</li>
          <li><strong>Policy filters.</strong> Does this output break a fixed rule, checked before every generation ships.</li>
          <li><strong>Handoff routing.</strong> Which of five specialist agents takes this task, at the top of every workflow.</li>
        </ul>
        <p>In each, the schema barely changes and a wrong answer is cheap enough that a threshold plus a fallback catches the edge cases. Outside that band, expect the bottom of the range.</p>
      </article>

      <article class="depth__part" id="deeper-06">
        <p class="label depth__num">Part 06</p>
        <h3>Where forcing it backfires</h3>
        <p>Jev cannot hallucinate free text, because it never writes any. It can absolutely pick the wrong option inside a valid schema. If your categories overlap or your context is thin, it still returns a confident, clean-looking answer, because that is what it is built to do. A broken schema does not raise an error. It produces a wrong answer that looks exactly like a right one.</p>
        <p>The source article's author learned this on a content pipeline: four categories along the lines of "high priority", "urgent", "needs review", and "flag" that were not mutually exclusive. The answers were fast, cheap, confident, and internally inconsistent about a third of the time. Fixing the schema cost about six hours of relabelling.</p>
        <p>Do not route these to a classifier:</p>
        <ul class="bands">
          <li><strong>Judgment calls.</strong> Is this writing good, is this argument persuasive. No fixed schema captures it.</li>
          <li><strong>Low-volume, high-stakes decisions.</strong> Five times a month does not repay the setup.</li>
          <li><strong>Anything generative.</strong> A classifier bent into a writer is a worse writer.</li>
          <li><strong>Schemas still changing weekly.</strong> Categories you are still discovering are not ready to offload.</li>
        </ul>
      </article>

      <article class="depth__part" id="deeper-07">
        <p class="label depth__num">Part 07</p>
        <h3>Verification when the failure looks clean</h3>
        <p>Because the failure mode is a confident wrong answer rather than an obvious one, the verification layer cannot rely on the output looking wrong. Two mechanisms do the work.</p>
        <p><strong>A threshold per decision type, not one global number.</strong> A merge-or-flag decision and a spam-or-not decision have different acceptable error rates. Set each threshold by measuring disagreement against Claude on a sample, not by picking a round number. The source article uses 0.87 as an example for one decision; it is an example, not a rule.</p>
        <p><strong>A shadow check on high-stakes decisions.</strong> Even above threshold, send a small share (the article uses 5%) through Claude in parallel, logged rather than blocking, and record disagreements. That is how schema drift shows up as a log line instead of a downstream failure.</p>
        <pre class="code" aria-label="Illustrative tuned router"><span class="code__tag">illustrative</span>decide(question, context):
  answer = jev.ask(context, question.schema)
  if answer.probability &lt; threshold[question.id]:
      return claude.decide(context)
  if question.id in HIGH_STAKES and random() &lt; 0.05:
      shadow = claude.decide(context)          # not blocking
      log_if_different(answer.value, shadow)
  return answer.value</pre>
        <p>Chapter 03 says the same thing in one line: confidence is not proof.</p>
      </article>

      <article class="depth__part depth__part--ledger" id="deeper-08">
        <p class="label depth__num">Part 08</p>
        <h3>The cost ledger</h3>
        <p>The saving is not the whole bill. It is the classification tax you were paying without knowing it was separable. Start from the article's assumptions, then type in your own numbers.</p>
        <div data-ledger></div>
      </article>

      <article class="depth__part" id="deeper-09">
        <p class="label depth__num">Part 09</p>
        <h3>Five mistakes, and the actual skill</h3>
        <ol class="mistakes">
          <li><strong>Routing generation to a classifier because it is cheap.</strong> It will answer. The answer will be bad.</li>
          <li><strong>One global threshold.</strong> A misrouted ticket and a merged bad PR are not the same risk.</li>
          <li><strong>Skipping the schema audit.</strong> Overlapping categories do not error; they drift.</li>
          <li><strong>Never sampling for drift.</strong> Sure and correct diverge as inputs shift. Without a shadow check, you find out from a failure.</li>
          <li><strong>Treating 200x as a target.</strong> It describes one band of work. Bending your architecture toward the number means bending it away from your problem.</li>
        </ol>
        <p>None of this makes Jev smarter than Claude Code, and none of it replaces Claude Code. The skill is decomposition: look at a loop you already built and ask, honestly, which parts generate and which parts are classification in a generation costume. The teams getting real multipliers did the audit first and moved only that.</p>
        <p class="depth__next"><a href="#worktree-method">Next: isolate the work before you parallelize it. → Chapter 02</a></p>
      </article>

      <footer class="depth__foot">
        <button type="button" class="btn btn--ghost" data-close-depth>Close these pages</button>
      </footer>
    </div>
  </div>
</section>
<!-- /region:go-deeper -->
```

- [ ] **Step 2: Write css/depth.css**

```css
/* Depth layer: inserted typed pages, Literata prose, ledger. */
.depth { padding-block: 0; }
.depth__panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows var(--dur-slow) var(--ease); }
.depth.is-open .depth__panel { grid-template-rows: 1fr; }
.depth__inner { min-height: 0; overflow: hidden; }
.depth.is-open .depth__inner { overflow: visible; }
.depth__inner > * { margin-inline: auto; max-width: var(--measure); }
.depth__inner {
  background: var(--paper-inset); border-block: 1px solid var(--ink);
  padding: 0 var(--sp-md);
  font-family: var(--font-serif); font-size: var(--fs-depth); line-height: 1.65;
  font-variation-settings: "opsz" 14;
}
.depth.is-open .depth__inner { padding-block: var(--sp-2xl); }
.depth__head { display: grid; gap: var(--sp-md); margin-bottom: var(--sp-2xl); }
.depth__title { font-family: var(--font-serif); font-weight: 600; font-size: clamp(1.75rem, 3.5vw, 2.5rem); line-height: 1.15; font-variation-settings: "opsz" 72; }
.depth__lede { font-size: 1.15rem; }
.depth__part { display: grid; gap: var(--sp-md); padding-block: var(--sp-xl); border-top: 1px solid var(--rule); }
.depth__num { font-family: var(--font-mono); color: var(--ink-soft); }
.depth__part h3 { font-weight: 600; font-size: var(--fs-depth-h); line-height: 1.2; font-variation-settings: "opsz" 36; }
.depth__part h4 { font-family: var(--font-mono); font-size: var(--fs-title); font-weight: 700; margin-top: var(--sp-sm); }
.depth__part a { color: var(--teal); }
.depth__part strong { font-weight: 600; }
.depth__next { font-family: var(--font-mono); font-weight: 700; }
.depth__foot { padding-top: var(--sp-xl); }

.code {
  position: relative; margin: 0; padding: var(--sp-lg) var(--sp-md) var(--sp-md); overflow-x: auto;
  border: 1px solid var(--ink); border-radius: var(--radius-md); background: var(--card);
  font-family: var(--font-mono); font-size: 0.9rem; line-height: 1.5; white-space: pre;
}
.code__tag { position: absolute; top: 6px; right: 10px; font-size: var(--fs-label); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-soft); }

.figures { display: grid; gap: var(--sp-sm); font-family: var(--font-mono); font-size: var(--fs-body); }
.figures div { display: grid; grid-template-columns: 10em 1fr; gap: var(--sp-md); padding: var(--sp-sm) 0; border-top: 1px dashed var(--rule); }
.figures dt { font-weight: 700; }
.figures dd { margin: 0; }
@media (max-width: 480px) { .figures div { grid-template-columns: 1fr; gap: var(--sp-xs); } }

.bands, .mistakes { display: grid; gap: var(--sp-sm); padding-left: 0; }
.mistakes { counter-reset: m; }
.mistakes li { counter-increment: m; padding-left: 2.5em; position: relative; }
.mistakes li::before { content: counter(m, decimal-leading-zero); position: absolute; left: 0; font-family: var(--font-mono); font-weight: 700; color: var(--ink-soft); }
.bands li { padding-left: 1.2em; position: relative; }
.bands li::before { content: "—"; position: absolute; left: 0; color: var(--ink-soft); }

.ledger-table { width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: var(--fs-body); }
.ledger-table th, .ledger-table td { text-align: left; padding: var(--sp-sm) var(--sp-sm); border-top: 1px dashed var(--rule); vertical-align: top; }
.ledger-table thead th { border-top: 0; border-bottom: 1px solid var(--ink); text-transform: uppercase; font-size: var(--fs-label); letter-spacing: 0.08em; }
.ledger-table__total th, .ledger-table__total td { border-top: 1px solid var(--ink); font-weight: 700; }
@media (max-width: 600px) {
  .ledger-table thead { display: none; }
  .ledger-table tr { display: grid; gap: 2px; padding-block: var(--sp-sm); border-top: 1px dashed var(--rule); }
  .ledger-table th, .ledger-table td { border: 0; padding: 0; }
  .ledger-table td::before { content: attr(data-col) ": "; color: var(--ink-soft); }
}
@media (prefers-reduced-motion: reduce) { .depth__panel { transition: none; } }
```

The `data-col` attributes on the table cells in Step 1 feed the narrow-width labels above.

- [ ] **Step 3: Write js/depth.js**

```js
// Open/close the depth layer; keep it out of the tab order when closed.
import { register } from './registry.js';
import { OPEN_DEPTH_EVENT } from './nav.js';

export function initDepth(section) {
  const inner = section.querySelector('.depth__inner');
  const heading = section.querySelector('#h-go-deeper');
  const openers = document.querySelectorAll('[data-open-depth]');
  const closer = section.querySelector('[data-close-depth]');

  function setOpen(open, { focus = true } = {}) {
    section.classList.toggle('is-open', open);
    if (open) inner.removeAttribute('inert'); else inner.setAttribute('inert', '');
    openers.forEach((b) => b.setAttribute('aria-expanded', String(open)));
    if (open && focus) heading.focus({ preventScroll: true });
    if (!open && focus) openers[0]?.focus();
  }
  openers.forEach((b) => b.addEventListener('click', () => { setOpen(true); section.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
  closer.addEventListener('click', () => setOpen(false));
  document.addEventListener(OPEN_DEPTH_EVENT, () => setOpen(true, { focus: false }));
  if (location.hash === '#go-deeper') setOpen(true, { focus: false });
  return { open: () => setOpen(true), close: () => setOpen(false) };
}

register('#go-deeper', initDepth);
```

Add `import './depth.js';` to the top of `js/main.js`. Because `depth.js` imports from `nav.js` (for the event name) and both register on load, import order in `main.js` must be `nav.js` before `depth.js`.

- [ ] **Step 4: Browser check**

- Closed by default; the "Go deeper" button reports `aria-expanded="false"`; `read_page` shows the inner content as inert (not in interactive filter).
- Click "Go deeper": panel expands (grid rows animate), focus lands on the heading, prose is Literata at a ~65ch measure, no yellow anywhere inside.
- Navigate to `http://127.0.0.1:4173/#go-deeper` fresh: opens expanded. Also, from the top of the page, click the DEEPER margin marker: opens and scrolls.
- "Close these pages" collapses it and returns focus to the chapter 1 button.
- Find-in-page: with the layer open, `find` "decision density" locates text.
- Mobile width: table rows stack with Before/After labels, code blocks scroll horizontally without widening the page.

- [ ] **Step 5: Commit**

```bash
git add index.html css/depth.css js/main.js js/depth.js
git commit -m "feat: depth layer with adapted article, open/close and hash handling"
```

---

### Task 9: Cost ledger UI (depth part 08)

**Files:**
- Create: `js/ledger.js`
- Modify: `css/depth.css` (append), `js/main.js` (import)

**Interfaces:**
- Consumes: `DEFAULTS`, `PROVENANCE`, `computeLedger`, `sanitize` from `js/ledger-logic.js`; the `[data-ledger]` placeholder from Task 8.

- [ ] **Step 1: Write js/ledger.js**

```js
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
const pct = (n) => `${(n * 100).toFixed(0)}%`;
const secs = (n) => `${n.toFixed(1)} s`;
const hours = (n) => `${n.toFixed(2)} h`;

export function initLedger(root) {
  root.innerHTML = `
    <form class="ledger__form" data-form>
      <p class="label soft">Assumptions · edit any of them</p>
      <div class="ledger__inputs">
        ${FIELDS.map(([key, label, unit]) => `
          <div class="ledger__input">
            <label for="ledger-${key}">${label} <span class="soft">(${unit})</span></label>
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
```

Add `import './ledger.js';` to `js/main.js`.

- [ ] **Step 2: Append ledger styles to css/depth.css**

```css
/* ---------- Ledger ---------- */
[data-ledger] { display: grid; gap: var(--sp-lg); font-family: var(--font-mono); font-size: var(--fs-body); max-width: none; }
.ledger__form { display: grid; gap: var(--sp-md); border: 1px solid var(--ink); border-radius: var(--radius-md); padding: var(--sp-lg); background: var(--card); }
.ledger__inputs { display: grid; gap: var(--sp-md); grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
.ledger__input { display: grid; gap: var(--sp-xs); }
.ledger__input input { width: 100%; padding: 8px 10px; border: 1px solid var(--ink); border-radius: var(--radius-sm); background: var(--card); }
.ledger__input input[aria-invalid="true"] { border-color: var(--signal); }
.ledger__prov { font-size: var(--fs-label); text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-soft); }
.ledger__prov--estimate::before { content: "≈ "; }
.ledger__error { color: var(--signal); }
.ledger__sides { display: grid; gap: var(--sp-md); }
.ledger__side { border: 1px solid var(--ink); border-radius: var(--radius-md); padding: var(--sp-lg); background: var(--card); box-shadow: var(--shadow-sticker); }
.ledger__side h4 { margin-bottom: var(--sp-md); font-family: var(--font-mono); text-transform: uppercase; font-size: var(--fs-label); letter-spacing: 0.08em; }
.ledger__side dl, .ledger__totals { display: grid; gap: var(--sp-xs); }
.ledger__side dl div, .ledger__totals div { display: flex; justify-content: space-between; gap: var(--sp-md); padding: 6px 0; border-top: 1px dashed var(--rule); }
.ledger__side dd, .ledger__totals dd { margin: 0; font-weight: 700; font-variant-numeric: tabular-nums; }
.ledger__row--total dt, .ledger__row--total dd { color: var(--teal); }
.ledger__totals { border: 1px solid var(--ink); border-radius: var(--radius-md); padding: var(--sp-md) var(--sp-lg); background: var(--mint); }
.ledger__note { font-size: var(--fs-body); }
@media (min-width: 700px) { .ledger__sides { grid-template-columns: 1fr 1fr; } }
```

Also relax the measure for the ledger part: append `.depth__part--ledger { max-width: min(100%, 960px); }` so the two columns fit.

- [ ] **Step 3: Browser check**

- Defaults show Before classification $3.90, After $0.0033, generation $7.50 on both sides, share 34% / 0%, seconds saved 12.1 s.
- Type `abc` into PRs per day: the field turns red-bordered with the error line; outputs recompute with zero.
- Type 10 into Jev seconds: "Seconds saved per PR" shows `-17.1 s`.
- Reset restores all defaults.
- Mobile: inputs in one column, sides stacked, no overflow.
- Tab order: inputs then reset; screen-reader description reads the provenance note (`aria-describedby`).

- [ ] **Step 4: Commit**

```bash
git add js/ledger.js css/depth.css js/main.js
git commit -m "feat: interactive cost ledger with provenance labels"
```

---

### Task 10: Chapter 02 content and the worktree merge demo

**Files:**
- Modify: `index.html` (replace region `worktree-method`), `css/guide.css` (append), `js/main.js` (import)
- Create: `js/worktree-demo.js`

**Interfaces:**
- Consumes: `COLUMNS`, `SHARED_PATH`, `simulate`, `tally` from `js/worktree-logic.js`; primitives from Task 6.

- [ ] **Step 1: Replace the worktree-method region in index.html**

```html
<!-- region:worktree-method -->
<section id="worktree-method" class="region chapter" aria-labelledby="h-worktree-method">
  <div class="bar chapter__bar" data-reveal>
    <h2 id="h-worktree-method" class="headline">02 · The Worktree Method</h2>
    <span class="bar__note">Same codebase · parallel progress · no collisions</span>
  </div>
  <p class="chapter__sub" data-reveal style="--i:1">Four agents, four branches, no shared files. Speed comes from isolation, not headcount.</p>

  <h3 class="label chapter__h3" data-reveal>Isolate the work before you parallelize it</h3>
  <figure class="demo worktree" data-demo="worktree" data-reveal style="--i:1">
    <div class="worktree__repo bar"><span class="headline">Main repository</span><span class="bar__note">single source of truth</span></div>
    <ul class="worktree__columns" data-columns></ul>
    <div class="worktree__queue">
      <div class="panel panel--marker worktree__merge"><p class="panel__title">Verified merge queue</p><ol class="worktree__merged label" data-merged aria-label="Merged in order"></ol></div>
      <div class="bar worktree__release"><span class="headline">One clean release</span><span class="stamp" data-release-stamp hidden>1 clean release</span></div>
    </div>
    <div class="demo__controls worktree__controls">
      <label class="worktree__toggle"><input type="checkbox" data-isolation-toggle> Without isolation</label>
      <p class="label" data-tally aria-live="polite"></p>
      <button type="button" class="btn" data-replay>Replay</button>
    </div>
    <figcaption class="narration" data-narration aria-live="polite">Four worktrees fill in parallel. Watch the merge queue.</figcaption>
    <ol class="worktree__log label" data-log hidden></ol>
  </figure>

  <h3 class="label chapter__h3" data-reveal>The no-collision rules</h3>
  <ol class="rules" data-reveal style="--i:1">
    <li class="card"><span class="label soft">01</span><span class="card__title">One owner per file</span><span class="card__body">Each file has exactly one responsible worktree. If two tasks need the same file, they are one task.</span></li>
    <li class="card"><span class="label soft">02</span><span class="card__title">One branch per task</span><span class="card__body">Small scope, clear intent. A branch that does two things merges twice as slowly.</span></li>
    <li class="card"><span class="label soft">03</span><span class="card__title">Test before handoff</span><span class="card__body">Run the local checks and fix what they find before asking anyone to review.</span></li>
    <li class="card"><span class="label soft">04</span><span class="card__title">Merge verified diffs only</span><span class="card__body">Only changes that passed review and checks enter the queue. The queue is linear on purpose.</span></li>
  </ol>

  <div class="panel panel--mint warning" data-reveal>
    <p class="headline warning__line">Parallelism without isolation creates rework.</p>
    <p>Collapsed workspaces, conflicting edits, and untested changes slow everyone down.</p>
  </div>
  <div class="bar" data-reveal><span class="headline">More agents only help when the work is isolated.</span></div>
</section>
<!-- /region:worktree-method -->
```

- [ ] **Step 2: Append worktree styles to css/guide.css**

```css
/* ---------- Worktree ---------- */
.worktree { gap: var(--sp-lg); }
.worktree__columns { display: grid; gap: var(--sp-md); grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
.wt { display: grid; gap: var(--sp-sm); border: 1px solid var(--ink); border-radius: var(--radius-md); padding: var(--sp-md); }
.wt--mint { background: var(--mint); } .wt--marker { background: var(--marker); }
.wt__name { font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
.wt__files { font-size: var(--fs-body); }
.wt__files span { display: inline-block; margin-right: 6px; }
.wt__files .is-shared { color: var(--signal); font-weight: 700; text-decoration: underline; }
.wt__track { height: 10px; border: 1px solid var(--ink); border-radius: 999px; background: var(--card); overflow: hidden; }
.wt__fill { height: 100%; width: 0; background: var(--ink); transition: width 0ms linear; }
.wt__status { display: flex; justify-content: space-between; align-items: center; min-height: 28px; font-size: var(--fs-label); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
.wt.is-collided { outline: 2px solid var(--signal); outline-offset: 2px; }
.wt__badge { color: var(--signal); }
.worktree__queue { display: grid; gap: var(--sp-md); }
.worktree__merged { display: flex; flex-wrap: wrap; gap: var(--sp-sm); min-height: 28px; }
.worktree__merged li { padding: 4px 8px; border: 1px solid var(--ink); border-radius: var(--radius-sm); background: var(--card); }
.worktree__release { position: relative; }
.worktree__release .stamp { --stamp-color: var(--card); --tilt: -3deg; }
.worktree__controls { grid-template-columns: 1fr; }
.worktree__toggle { display: flex; gap: var(--sp-sm); align-items: center; min-height: 44px; }
.worktree__toggle input { width: 20px; height: 20px; accent-color: var(--ink); }
.worktree__log { display: grid; gap: 2px; color: var(--ink-soft); }
@media (min-width: 700px) { .worktree__queue { grid-template-columns: 2fr 1fr; } .worktree__controls { grid-template-columns: auto 1fr auto; } }

.rules { display: grid; gap: var(--sp-md); grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
.rules .card { display: grid; gap: var(--sp-xs); }
.warning { display: grid; gap: var(--sp-sm); }
.warning__line { font-size: clamp(1.25rem, 2.6vw, 2rem); }
```

- [ ] **Step 3: Write js/worktree-demo.js**

```js
// Worktree merge demo. Timeline from worktree-logic.js; this file only plays it.
import { register } from './registry.js';
import { COLUMNS, SHARED_PATH, REWORK_RESET_FRACTION, simulate, tally } from './worktree-logic.js';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const TONES = ['mint', 'marker', 'mint', 'marker'];
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
  const isolatedRelease = simulate({ isolated: true }).totals.releaseAt;

  function renderColumns(isolated) {
    list.innerHTML = COLUMNS.map((c, i) => {
      const owns = isolated || c.id !== 'C' ? c.owns : [...c.owns, SHARED_PATH];
      return `
      <li class="wt wt--${TONES[i]}" data-col="${c.id}">
        <p class="wt__name">Worktree ${c.id} · ${c.name}</p>
        <p class="wt__files"><span class="label soft">owned files</span><br>${owns.map((f) => `<span class="${!isolated && f === SHARED_PATH ? 'is-shared' : ''}">${f}</span>`).join('')}</p>
        <p class="wt__files"><span class="label soft">done when</span><br>${DONE[c.id]}</p>
        <p class="wt__files"><span class="label soft">local checks</span><br>${CHECKS[c.id]}</p>
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
    requestAnimationFrame(() => { fill.style.width = `${pct}%`; bar.setAttribute('aria-valuenow', String(pct)); });
  }
  const status = (col, text) => (list.querySelector(`[data-col="${col}"] [data-status]`).textContent = text);
  function stamp(col, text, cls = '') {
    const slot = list.querySelector(`[data-col="${col}"] [data-stamp-slot]`);
    slot.innerHTML = `<span class="stamp is-landing ${cls}" style="--tilt:-3deg">${text}</span>`;
  }

  function apply(e) {
    const c = COLUMNS.find((x) => x.id === e.column);
    switch (e.kind) {
      case 'start': status(e.column, 'working'); setFill(e.column, 100, c.fillMs); break;
      case 'collision':
        e.columns.forEach((id) => { list.querySelector(`[data-col="${id}"]`).classList.add('is-collided'); status(id, `collision on ${e.detail}`); });
        narration.textContent = `B and C both edited ${e.detail}. The queue pauses.`; break;
      case 'rework': setFill(e.column, REWORK_RESET_FRACTION * 100, 0); status(e.column, 'rework'); break;
      case 'resume': list.querySelector(`[data-col="${e.column}"]`).classList.remove('is-collided'); status(e.column, 'working again'); setFill(e.column, 100, e.remainingMs); break;
      case 'done': status(e.column, 'done'); break;
      case 'review': stamp(e.column, 'diff review ✓'); break;
      case 'merge': merged.insertAdjacentHTML('beforeend', `<li>${e.column}</li>`); status(e.column, 'merged'); break;
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
    tallyEl.textContent = '';
    const { events, totals } = simulate({ isolated });
    log.innerHTML = events.map((e) => `<li>${(e.t / 1000).toFixed(2)} s · ${e.kind}${e.column ? ' ' + e.column : ''}${e.columns ? ' ' + e.columns.join('+') : ''}${e.detail ? ' · ' + e.detail : ''}</li>`).join('');
    const finish = () => { tallyEl.textContent = tally(totals, isolatedRelease); narration.textContent = isolated ? 'Every worktree merged in the order it finished. No file was touched twice.' : 'One shared file cost a collision, a rework loop, and a late release.'; };
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
  const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) { io.disconnect(); run(); } }, { threshold: 0.3 });
  renderColumns(true);
  io.observe(root);
}

register('[data-demo="worktree"]', initWorktreeDemo);
```

Add `import './worktree-demo.js';` to `js/main.js`.

- [ ] **Step 4: Cancel pending timers on replay (Review Focus 4)**

`run()` already calls `cancel()` first. Verify: click Replay twice quickly; the merged list must end with exactly four entries and one release stamp. If it doubles, `cancel()` is not clearing all timers (check that `later` pushes every timeout, including `finish`).

- [ ] **Step 5: Browser check**

- Scroll to chapter 2: the run starts once; bars fill at different speeds; stamps land; merged list reads C, A, D, B; release stamp lands; tally "0 collisions · 0 rework · release on time".
- Check "Without isolation": `styles/` shows red in both B and C, collision outlines appear, C drops to 30% then resumes, tally "2 collisions · 1 rework loop · release delayed by 1.9 s".
- Replay twice quickly: still four merges, one stamp.
- Keyboard: checkbox and Replay reachable; tally announced.
- Mobile: columns stack; the queue sits below; nothing overflows.

- [ ] **Step 6: Commit**

```bash
git add index.html css/guide.css js/main.js js/worktree-demo.js
git commit -m "feat: chapter 02 content and worktree merge demo"
```

---

### Task 11: Chapter 03 content and the proof-contract demo

**Files:**
- Modify: `index.html` (replace region `proof-contract`), `css/guide.css` (append), `js/main.js` (import)
- Create: `js/proof-demo.js`

**Interfaces:**
- Consumes: `SLOTS`, `SCENARIOS`, `missingSlots`, `verify`, `repair`, `narrate` from `js/proof-logic.js`.

- [ ] **Step 1: Replace the proof-contract region in index.html**

```html
<!-- region:proof-contract -->
<section id="proof-contract" class="region chapter" aria-labelledby="h-proof-contract">
  <div class="bar bar--teal chapter__bar" data-reveal>
    <h2 id="h-proof-contract" class="headline">03 · The Proof Contract</h2>
    <span class="bar__note">No evidence, no done</span>
  </div>
  <p class="chapter__sub" data-reveal style="--i:1">Done is a claim. Evidence is what makes it true.</p>

  <h3 class="label chapter__h3" data-reveal>Every task returns five things</h3>
  <div class="five" data-reveal style="--i:1">
    <ol class="five__list">
      <li class="five__row"><span class="five__num five__num--mint">01</span><span class="card"><span class="card__title">Artifact</span><span class="card__body">The concrete output: the file, the answer, the change.</span></span></li>
      <li class="five__row"><span class="five__num five__num--marker">02</span><span class="card"><span class="card__title">Diff</span><span class="card__body">Exactly what changed: additions, deletions, modifications, nothing implied.</span></span></li>
      <li class="five__row"><span class="five__num five__num--mint">03</span><span class="card"><span class="card__title">Tests</span><span class="card__body">What ran and how it went: commands, results, pass or fail.</span></span></li>
      <li class="five__row"><span class="five__num five__num--marker">04</span><span class="card"><span class="card__title">Limits</span><span class="card__body">What was not verified: known gaps, assumptions, the untested path.</span></span></li>
      <li class="five__row"><span class="five__num five__num--mint">05</span><span class="card"><span class="card__title">Receipt</span><span class="card__body">How to reproduce and inspect: paths, URLs, log ids, run ids.</span></span></li>
    </ol>
    <ul class="five__side">
      <li class="card"><span class="card__title">Evidence makes reviewers independent</span><span class="card__body">A claim needs the claimant. Evidence lets anyone check without extra context.</span></li>
      <li class="card"><span class="card__title">Same standard for every agent</span><span class="card__body">Five items, every time. Reviews stay fast because they stay identical.</span></li>
      <li class="card"><span class="card__title">Missing evidence means incomplete</span><span class="card__body">If any item is missing or unclear, the task is not done. Send it back.</span></li>
    </ul>
  </div>

  <h3 class="label chapter__h3" data-reveal>Gate the result with independent verification</h3>
  <figure class="demo proof" data-demo="proof" data-reveal style="--i:1">
    <div class="proof__worker card">
      <p class="card__title">Worker says done</p>
      <label class="label" for="proof-scenario">Scenario</label>
      <select id="proof-scenario" data-scenario></select>
      <div class="proof__buttons">
        <button type="button" class="btn" data-return>Return evidence</button>
        <button type="button" class="btn" data-verify disabled>Verify</button>
        <button type="button" class="btn btn--ghost" data-repair hidden>Repair</button>
      </div>
    </div>
    <ol class="proof__slots" data-slots aria-label="Evidence returned"></ol>
    <div class="proof__flow">
      <div class="proof__node" data-node="complete"><span class="label">Evidence complete?</span></div>
      <div class="proof__node proof__node--review" data-node="review"><span class="label">Independent review</span><span class="proof__stamp" data-stamp-slot></span></div>
      <div class="proof__node" data-node="match"><span class="label">Matches the goal?</span></div>
      <div class="proof__node proof__node--accept bar" data-node="accept"><span class="headline">Accept + merge</span></div>
      <div class="proof__loop panel panel--marker" data-node="repair"><span class="label">Return for repair</span></div>
      <div class="proof__loop panel panel--marker" data-node="revise"><span class="label">Revise</span></div>
    </div>
    <figcaption class="narration" data-narration aria-live="polite">Pick a scenario, return the evidence, then verify.</figcaption>
  </figure>

  <div class="verifier" data-reveal>
    <div class="card verifier__prompt">
      <p class="label soft">The verifier prompt</p>
      <p>Compare the artifact with the goal.<br>Check the evidence.<br>Answer VERIFIED, REFUTED, or UNKNOWN.</p>
    </div>
    <div class="panel panel--marker verifier__warn">
      <p class="headline">Confidence is not proof.</p>
      <p>A calibrated probability says how sure the classifier is, not whether it is right. That is why chapter 01's router keeps a shadow check.</p>
    </div>
  </div>
  <div class="bar bar--teal" data-reveal><span class="headline">Trust the receipt, not the claim.</span></div>
</section>
<!-- /region:proof-contract -->
```

- [ ] **Step 2: Append proof styles to css/guide.css**

```css
/* ---------- Five things ---------- */
.five { display: grid; gap: var(--sp-lg); }
.five__list { display: grid; gap: var(--sp-sm); }
.five__row { display: grid; grid-template-columns: 56px 1fr; gap: var(--sp-sm); align-items: stretch; }
.five__num { display: grid; place-items: center; border: 1px solid var(--ink); border-radius: var(--radius-md); font-family: var(--font-display); font-size: 1.5rem; }
.five__num--mint { background: var(--mint); } .five__num--marker { background: var(--marker); }
.five__row .card { display: grid; }
.five__side { display: grid; gap: var(--sp-sm); align-content: start; }
@media (min-width: 900px) { .five { grid-template-columns: 3fr 2fr; } }

/* ---------- Proof demo ---------- */
.proof { gap: var(--sp-lg); }
.proof__worker { display: grid; gap: var(--sp-sm); }
.proof__buttons { display: flex; flex-wrap: wrap; gap: var(--sp-sm); }
.proof__slots { display: grid; gap: var(--sp-sm); grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); }
.proof__slot { display: grid; gap: 2px; padding: var(--sp-sm); border: 1px solid var(--ink); border-radius: var(--radius-sm); background: var(--card); font-size: var(--fs-label); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; min-height: 56px; opacity: 0.5; transition: opacity var(--dur-fast) var(--ease); }
.proof__slot.is-filled { opacity: 1; background: var(--mint); }
.proof__slot.is-missing { opacity: 1; border-style: dashed; border-color: var(--signal); color: var(--signal); }
.proof__slot.is-dead { opacity: 1; border-color: var(--ink-soft); color: var(--ink-soft); text-decoration: line-through; }
.proof__flow { display: grid; gap: var(--sp-sm); grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); align-items: stretch; }
.proof__node { display: grid; place-items: center; gap: var(--sp-xs); min-height: 72px; padding: var(--sp-sm); border: 1px solid var(--ink); border-radius: var(--radius-md); background: var(--card); text-align: center; }
.proof__node--review { background: var(--mint); }
.proof__node--accept { justify-items: center; }
.proof__loop { text-align: center; opacity: 0.4; }
.proof__flow .is-lit { box-shadow: var(--shadow-sticker); opacity: 1; }
.proof__flow .is-off { opacity: 0.35; }
.proof__stamp { min-height: 28px; }
@media (min-width: 900px) { .proof { grid-template-columns: 260px 1fr; } .proof__slots, .proof__flow, .proof .narration { grid-column: 2; } .proof__worker { grid-row: 1 / 4; } }

.verifier { display: grid; gap: var(--sp-md); }
.verifier__prompt p:last-child { font-weight: 700; }
.verifier__warn { display: grid; gap: var(--sp-sm); }
@media (min-width: 900px) { .verifier { grid-template-columns: 1fr 1fr; } }
```

- [ ] **Step 3: Write js/proof-demo.js**

```js
// Proof-contract demo. Outcomes from proof-logic.js.
import { register } from './registry.js';
import { SLOTS, SCENARIOS, missingSlots, verify, repair, narrate } from './proof-logic.js';

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
  const btnReturn = root.querySelector('[data-return]');
  const btnVerify = root.querySelector('[data-verify]');
  const btnRepair = root.querySelector('[data-repair]');
  const narration = root.querySelector('[data-narration]');

  select.innerHTML = Object.entries(SCENARIOS).map(([k, s]) => `<option value="${k}">${s.label}</option>`).join('');
  let scenario = SCENARIOS[select.value];
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
    btnVerify.disabled = true;
    btnRepair.hidden = true;
    returned = false;
    renderSlots();
  }
  function returnEvidence() {
    resetFlow();
    const missing = missingSlots(scenario.evidence);
    SLOTS.forEach((s, i) => later(() => {
      const li = slots.querySelector(`[data-slot="${s}"]`);
      const state = li.querySelector('[data-slot-state]');
      if (missing.includes(s)) { li.classList.add('is-missing'); state.textContent = 'missing'; }
      else if (s === 'receipt' && !scenario.receiptResolves) { li.classList.add('is-dead'); state.textContent = 'dead link'; }
      else { li.classList.add('is-filled'); state.textContent = '✓'; }
    }, 120 * i));
    later(() => { returned = true; btnVerify.disabled = false; narration.textContent = missing.length ? `Evidence returned with ${missing.join(', ')} missing. Verify to see what happens.` : 'All five items returned. Verify.'; }, 120 * SLOTS.length);
  }
  function doVerify() {
    if (!returned) return;
    const result = verify(scenario);
    const missing = missingSlots(scenario.evidence);
    nodes.forEach((n) => n.classList.toggle('is-off', !LIT[result].includes(n.dataset.node)));
    LIT[result].forEach((id, i) => later(() => nodes.find((n) => n.dataset.node === id).classList.add('is-lit'), 160 * i));
    if (result !== 'INCOMPLETE') later(() => { stampSlot.innerHTML = `<span class="stamp is-landing ${STAMP_CLASS[result]}">${result}</span>`; }, 160 * 2);
    later(() => { narration.textContent = narrate(result, missing); btnRepair.hidden = result !== 'INCOMPLETE'; btnVerify.disabled = true; }, 160 * LIT[result].length);
  }
  select.addEventListener('change', () => { scenario = SCENARIOS[select.value]; resetFlow(); narration.textContent = 'Return the evidence, then verify.'; });
  btnReturn.addEventListener('click', returnEvidence);
  btnVerify.addEventListener('click', doVerify);
  btnRepair.addEventListener('click', () => { scenario = repair(scenario); returnEvidence(); narration.textContent = 'Tests added. Evidence returned again; verify.'; });
  resetFlow();
}

register('[data-demo="proof"]', initProofDemo);
```

Add `import './proof-demo.js';` to `js/main.js`.

- [ ] **Step 4: Browser check (includes Review Focus 5)**

- Verify is disabled on load and after changing the scenario; enabled only after "Return evidence" finishes.
- Complete: five slots fill mint, path lights complete → review → match → accept, stamp VERIFIED, narration mentions merge.
- Missing tests: tests slot dashed red, path lights complete → return for repair, Repair button appears; Repair refills and Verify then yields VERIFIED.
- Doesn't match: REFUTED stamp in red, Revise lit.
- Receipt doesn't resolve: receipt slot struck through, UNKNOWN stamp, Revise lit, narration mentions reproduce.
- Keyboard: select, three buttons reachable; narration announced.
- Mobile: worker card on top, slots in two or three columns, flow nodes wrap.

- [ ] **Step 5: Commit**

```bash
git add index.html css/guide.css js/main.js js/proof-demo.js
git commit -m "feat: chapter 03 content and proof-contract demo"
```

---

### Task 12: Receipt footer, print stylesheet, README

**Files:**
- Modify: `index.html` (replace region `receipt`), `css/guide.css` (append)
- Create/replace: `css/print.css`, `README.md`

- [ ] **Step 1: Replace the receipt region in index.html**

```html
<!-- region:receipt -->
<footer id="receipt" class="region receipt" aria-labelledby="h-receipt">
  <div class="receipt__paper" data-reveal>
    <h2 id="h-receipt" class="receipt__title">Jevvy · field guide receipt</h2>
    <dl class="receipt__lines">
      <div><dt>Artifact</dt><dd>This page. One HTML file, no build step.</dd></div>
      <div><dt>Diff</dt><dd>Adapted from the <a href="https://x.com/cyrilxbt" rel="noopener">Agent Field Guide by @cyrilxbt</a>, three pages, and the source article "The Jev + Claude Code Stack" (<span data-article-link>link pending</span>, author unnamed). Rewritten, restructured, and corrected: Jev's role, ranges instead of headline multipliers, anecdotes attributed.</dd></div>
      <div><dt>Tests</dt><dd>Unit tests for the ledger math, the router, the verifier, and the merge timeline. Lighthouse: accessibility 100, performance 95 or better. Checked at three widths, with reduced motion on and off.</dd></div>
      <div><dt>Limits</dt><dd>Speed and cost figures are TypeSafe's own internal evaluations, not independently verified. Jev access is waitlist-only as of September 2026. Ledger defaults are the article's assumptions; edit them.</dd></div>
      <div><dt>Receipt</dt><dd><a href="https://github.com/muratbaturay/jevvy" rel="noopener">github.com/muratbaturay/jevvy</a><br>Printed: <time data-printed datetime="2026-09-28">28 September 2026</time></dd></div>
      <div><dt>Sources</dt><dd>
        <a href="https://typesafe.ai/blog/introducing-system-one-models-and-jev" rel="noopener">TypeSafe AI blog</a> ·
        <a href="https://www.latent.space/p/jev" rel="noopener">Latent Space</a> ·
        <a href="https://www.oreilly.com/radar/will-typesafes-jev-change-how-we-build-ai-applications/" rel="noopener">O'Reilly Radar</a> ·
        <a href="https://www.datacamp.com/blog/system-one-models-jev" rel="noopener">DataCamp</a> ·
        <a href="https://www.firecrawl.dev/blog/what-is-jev" rel="noopener">Firecrawl</a> ·
        <a href="https://www.mindstudio.ai/blog/typesafe-jev-rlcd-vs-rlhf" rel="noopener">MindStudio</a>
      </dd></div>
    </dl>
    <p class="receipt__foot">Built by Murat Baturay. Not affiliated with TypeSafe AI or Anthropic.</p>
  </div>
</footer>
<!-- /region:receipt -->
```

- [ ] **Step 2: Append receipt styles to css/guide.css**

```css
/* ---------- Receipt ---------- */
.receipt { display: grid; justify-items: center; }
.receipt__paper {
  width: min(100%, 420px); background: var(--card); color: var(--ink);
  padding: var(--sp-xl) var(--sp-lg) var(--sp-2xl); font-size: var(--fs-receipt); line-height: 1.45;
  border: 1px solid var(--ink); border-top: 0; position: relative;
  /* perforated top edge */
  --tooth: 12px;
  clip-path: polygon(0 var(--tooth), 4% 0, 8% var(--tooth), 12% 0, 16% var(--tooth), 20% 0, 24% var(--tooth), 28% 0, 32% var(--tooth), 36% 0, 40% var(--tooth), 44% 0, 48% var(--tooth), 52% 0, 56% var(--tooth), 60% 0, 64% var(--tooth), 68% 0, 72% var(--tooth), 76% 0, 80% var(--tooth), 84% 0, 88% var(--tooth), 92% 0, 96% var(--tooth), 100% 0, 100% 100%, 0 100%);
  padding-top: calc(var(--sp-xl) + var(--tooth));
  text-align: center;
}
.receipt__title { font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; font-size: var(--fs-body); padding-bottom: var(--sp-md); border-bottom: 1px dashed var(--ink); }
.receipt__lines { display: grid; gap: var(--sp-md); text-align: left; padding-block: var(--sp-md); }
.receipt__lines div { display: grid; grid-template-columns: 7em 1fr; gap: var(--sp-sm); }
.receipt__lines dt { font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; font-size: var(--fs-label); }
.receipt__lines dd { margin: 0; }
.receipt__foot { padding-top: var(--sp-md); border-top: 1px dashed var(--ink); color: var(--ink-soft); }
@media (max-width: 400px) { .receipt__lines div { grid-template-columns: 1fr; } }
```

- [ ] **Step 3: Write css/print.css**

```css
/* Print: open the depth layer, drop motion and chrome. */
body::before, .margin, .skip-link, .demo__controls, .worktree__controls, .proof__buttons, [data-reset], [data-close-depth], [data-open-depth] { display: none !important; }
.page { display: block; }
[data-reveal] { opacity: 1 !important; transform: none !important; }
.depth__panel { grid-template-rows: 1fr !important; }
.depth__inner { overflow: visible !important; padding-block: 2rem !important; }
.depth__inner[inert] { visibility: visible; }
.card, .panel, .bar { box-shadow: none; break-inside: avoid; }
.bar, .gate { background: transparent !important; color: var(--ink) !important; border: 1px solid var(--ink); }
.bar .headline, .gate * { color: var(--ink) !important; }
a[href^="http"]::after { content: " (" attr(href) ")"; font-size: 0.8em; color: var(--ink-soft); }
```

- [ ] **Step 4: Write README.md**

```markdown
# Jevvy

The Jev + Claude Code field guide, as an interactive web page. Adapted with
credit from the *Agent Field Guide* by [@cyrilxbt](https://x.com/cyrilxbt)
and a source article on the Jev + Claude Code stack. Built by Murat Baturay.

Live: https://muratbaturay.github.io/jevvy/

## Run locally

```bash
npm run dev
```

Then open http://127.0.0.1:4173/. No build step, no dependencies.

## Test

```bash
npm test
```

Unit tests cover the pure logic behind the four interactions: the cost
ledger, the router, the proof-contract verifier, and the worktree timeline.

## Manual checks before a release

- Three widths: 360, 900, 1400 px. No horizontal scroll.
- Reduced motion on and off (macOS: System Settings → Accessibility → Display → Reduce motion).
- Keyboard-only pass through all four demos; narration is announced.
- Lighthouse, mobile profile: accessibility 100, performance ≥ 95, best practices ≥ 95.
- Depth layer opens from the chapter 1 button, the DEEPER margin marker, and `#go-deeper`.

## Design docs

- Spec: `docs/superpowers/specs/2026-09-28-jevvy-field-guide-design.md`
- Plan: `docs/superpowers/plans/2026-09-28-jevvy-field-guide.md`
- `PRODUCT.md`, `DESIGN.md`: impeccable context.

## Credits and limits

Speed and cost figures for Jev are TypeSafe AI's own internal evaluations
and have not been independently verified. This site is not affiliated with
TypeSafe AI or Anthropic.
```

- [ ] **Step 5: Browser check**

- Receipt renders as a narrow perforated slip, centred, dashed rules, links work.
- Print preview (`javascript_tool`: `window.print()` cannot be captured; instead emulate with `matchMedia('print')` unavailable; verify by loading `css/print.css` temporarily without the `media` attribute, screenshot, then restore).
- Mobile: receipt fills the width with the label column stacked under 400 px.

- [ ] **Step 6: Commit**

```bash
git add index.html css/guide.css css/print.css README.md
git commit -m "feat: receipt footer, print stylesheet and README"
```

---

### Task 13: Quality pass: accessibility, reduced motion, responsive, Lighthouse, impeccable

**Files:**
- Modify: any of `index.html`, `css/*.css`, `js/*.js` as findings require; `DESIGN.md` (refresh)

- [ ] **Step 1: Run the full test suite**

Run: `npm test` → all passing. If not, fix before continuing.

- [ ] **Step 2: Reduced-motion pass**

Enable Reduce Motion in macOS (System Settings → Accessibility → Display) or, in the browser tool, emulate via `resize_window` is not possible; so use `javascript_tool` to confirm the guard: `window.matchMedia('(prefers-reduced-motion: reduce)').matches`. With the OS setting on, reload and confirm: no reveal transitions, router token jumps between stations, worktree renders its end state with the static log visible, proof slots fill instantly, depth layer opens without animation. Turn the setting back off.

- [ ] **Step 3: Keyboard and screen-reader structure**

`read_page` with `filter: 'interactive'`: every control has an accessible name; margin links show `aria-current` on one item; depth-layer content is absent when closed and present when open. Heading order via `find` "h2": exactly five h2s (chapters, depth, receipt) under one h1. Tab from the top through all four demos without a trap.

- [ ] **Step 4: Contrast check**

`javascript_tool`: sample computed colours for `.panel--marker .card__body`, `.bar .headline`, `.bar--teal .headline`, `.ledger__row--total dd`, `.stamp--marker` and compute contrast against their backgrounds (use `getComputedStyle` and a WCAG luminance formula inline). All body text must reach 4.5:1; large display text on teal must reach 3:1 and, per DESIGN.md, card-white on teal at 14px+ must reach 4.5:1. Adjust `--teal` lightness downward (not chroma) if it falls short; update `css/tokens.css` and `DESIGN.md` together.

- [ ] **Step 5: Responsive pass**

Screenshots at 360, 700, 900, 1100, 1400 px. Check: no horizontal scroll (`document.documentElement.scrollWidth <= innerWidth`), four/two/one worktree columns, three-column layers only at ≥1100, margin numbers only at ≥1100, ledger sides side by side at ≥700, hero credit on the right at ≥900.

- [ ] **Step 6: Lighthouse**

Run Lighthouse in the built-in browser (or `npx lighthouse http://127.0.0.1:4173 --preset=mobile --quiet --chrome-flags="--headless"` if Chrome is installed) and record the four scores. Fix until accessibility is 100 and performance ≥ 95. Common fixes: add `width`/`height` to the SVGs' parent for CLS, `font-display: swap` is already set, ensure no render-blocking beyond the two stylesheets.

- [ ] **Step 7: impeccable critique, polish, audit**

Run, in order, with the spec's §8 brief as the confirmed brief:
1. `$impeccable critique` on the whole page. Address every P0/P1 finding; note P2/P3 you decline with a reason.
2. `$impeccable polish`: alignment, spacing rhythm, consistency of card padding and bar heights, stamp angles.
3. `$impeccable audit`: technical checks; fix P0/P1.
Then refresh the design tokens: `$impeccable document` in scan mode, overwriting the seed `DESIGN.md` (keep the six headers, remove the `<!-- SEED -->` marker). When it asks for qualitative language, reuse the seed's answers rather than asking Murat: North Star "The Field Manual That Moves", the colour names already in DESIGN.md, elevation "flat print with one trick", component feel "stuck-on stickers and rubber stamps".

- [ ] **Step 8: Final content read-through**

Read every visible string against spec §4: no verbatim sentences from `reference/`, every number a range or labelled, "the source article's author" for anecdotes, no unqualified "200x". Fix in `index.html`.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: accessibility, responsive and design quality pass"
```

---

### Task 14: Push, enable Pages, verify live

**Files:**
- Modify: `index.html` (printed date, article link if provided)

- [ ] **Step 1: Confirm GitHub access**

Run `gh auth status`. The repo `muratbaturay/jevvy` must show write access for the active account. If it does not, stop and tell Murat which of the three fixes (collaborator, `gh auth login`, push from their shell) is needed. Do not work around it.

- [ ] **Step 2: Push**

```bash
git push -u origin main
```

- [ ] **Step 3: Enable Pages (Murat, manual)**

Repository Settings → Pages → Source "Deploy from a branch" → Branch `main`, folder `/ (root)` → Save. Wait for the first deploy (usually under two minutes; `gh api repos/muratbaturay/jevvy/pages` shows the status).

- [ ] **Step 4: Verify live**

Open https://muratbaturay.github.io/jevvy/ in the browser tool. Confirm fonts load, all four demos run, `#go-deeper` opens the depth layer, no console errors, no 404s in `read_network_requests`.

- [ ] **Step 5: Set the printed date, verify the credit link, set the article link**

Update the `<time data-printed>` element to the deploy date. Open `https://x.com/cyrilxbt` in the browser tool and confirm it is the account that published the Agent Field Guide; if it is not, ask Murat for the correct profile URL and update both credit links (hero sticky and receipt). If Murat has supplied the source-article URL, replace both `<span data-article-link>link pending</span>` occurrences with `<a href="…" rel="noopener">source article</a>`. Commit and push:

```bash
git add index.html
git commit -m "chore: set printed date and source link"
git push
```

---

## Self-review notes (done at planning time)

- **Spec coverage:** §3 regions → Tasks 6, 7, 8, 10, 11, 12. §4 content rules → copy in Tasks 7, 8, 10, 11, 12 and the read-through in Task 13. §5 tokens/type/motion/responsive → Tasks 1, 6, 13. §6 interactions → Tasks 2–5 (logic) and 7, 9, 10, 11 (DOM). §7 files/tests/a11y/perf/deploy → Tasks 1, 13, 14. §8 brief gates → Global Constraints. §10 open items → Task 14.
- **Placeholders:** the only "pending" string is the source-article link, which the spec itself designates as pending until Murat supplies it.
- **Type consistency:** `route(question, threshold)` used identically in Task 3 and 7; `simulate({isolated})` and `tally(totals, isolatedReleaseAt)` in Tasks 5 and 10; `verify(scenario)`, `repair`, `narrate(result, missing)` in Tasks 4 and 11; `computeLedger(inputs)` in Tasks 2 and 9; `register(selector, init)` from Task 1 in every DOM module; `OPEN_DEPTH_EVENT` from Task 6 in Task 8.
- **Review Focus:** items 1–3 have unit tests in Tasks 2 and 3; items 4 and 5 have browser steps in Tasks 10 and 11 plus the `verify()` empty-evidence unit test in Task 4.
