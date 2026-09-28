# Jevvy: The Jev + Claude Code Field Guide, as a web page

Design spec. Written 2026-09-28 with Murat Baturay (Fable 5.1 planning session).
Implementation is planned for a separate Opus 5.5 session via the
implementation plan in `docs/superpowers/plans/`.

Repository: https://github.com/muratbaturay/jevvy (GitHub Pages from `main`, root).
Expected live URL: https://muratbaturay.github.io/jevvy/

---

## 1. What this is

A single-page static website that adapts a three-page printed-style infographic
series ("Jev + Claude Code · Agent Field Guide", made by @cyrilxbt) and a
long-form source article ("The Jev + Claude Code Stack") into one interactive
web page. It serves two audiences at once:

1. **Portfolio showcase.** A visitor judges it on craft: the field-guide look
   rebuilt as a real, animated page with four purpose-built interactions.
2. **Internal Slalom explainer.** A colleague learning the pattern reads it top
   to bottom and comes away able to explain decision-versus-generation routing,
   worktree isolation, and the proof contract, and to estimate the cost of
   classification in their own agent loop.

Success looks like: a portfolio viewer asks "how was this made?", and a
colleague can run the decision-point audit on their own agent transcript after
reading it.

## 2. Sources, alignment, and the corrections we make

### 2.1 The sources

- **Field guide page 1, The Control Plane.** Jev as decision layer, Claude Code
  as execution layer, a policy gate between them, the request-to-result flow,
  and the boundary rule ("the model recommends, the application authorizes, the
  tool executes").
- **Field guide page 2, The Worktree Method.** Four agents on four git
  worktrees, owned files, done conditions, local checks, diff review, a verified
  merge queue, one clean release, and four no-collision rules.
- **Field guide page 3, The Proof Contract.** Every task returns five things
  (artifact, diff, tests, limits, receipt); independent verification gates the
  result; the verifier prompt returns VERIFIED, REFUTED, or UNKNOWN; confidence
  is not proof.
- **The source article.** A deep dive on one topic: Claude Code does two jobs
  (generation and decision) with one tool; Jev is a classifier that answers
  bounded typed questions with calibrated probabilities; the multiplier comes
  from decision density; three build steps (audit, schema, router with
  confidence threshold and fallback); a worked PR-loop example; where the
  ceiling is real; where forcing it backfires; verification via per-decision
  thresholds and shadow sampling; cost modelling; common mistakes.

Local copies live in `reference/` (gitignored, not published: third-party
content). The receipt footer links to the originals instead.

### 2.2 How they relate

Aligned in thesis, not the same thing. All share one idea: separate judgment
from execution. Only page 1 maps directly onto the article. Page 3 is adjacent
(its "confidence is not proof" rule is the article's shadow-check argument in
different words, and its verifier prompt is itself a bounded categorical
question). Page 2 has no Jev content at all; it is a Claude Code parallelism
practice under the same brand.

### 2.3 Three deliberate corrections

1. **Jev's role.** Page 1 draws Jev upstream as a planner ("chooses the route").
   The article places Jev inline as a classifier called at decision points
   inside a Claude-driven loop, with Claude as the fallback when confidence is
   low, and says explicitly not to send judgment calls to it. The page follows
   the article. Chapter 1's decision layer is described as "answers bounded
   questions you defined", and the policy gate is where the confidence
   threshold and the allowed-tools check live.
2. **Honest numbers.** Speed and cost always appear as ranges (20 to 200x,
   40 to 400x). The depth layer and the receipt state that these are TypeSafe's
   own internal evaluations with no independent verification, and that Jev
   access is waitlist-only as of September 2026. The page never shows a
   headline multiplier computed from its own calculator.
3. **Anecdotes.** The article's first-person stories (31 decision points in a
   340-line auth module; a broken four-category schema that cost six hours)
   are kept as examples, attributed to "the source article's author", never
   told in first person.

### 2.4 Attribution decision

Adaptation with credit. The page is Murat's own build, inspired by the sources.
It reuses their structure and concepts in its own words. No infographic card
copy and no article paragraph is reproduced verbatim. Short concept labels
stay because they are the concepts: "policy gate", "verified merge queue",
"diff review", "owned files", "artifact / diff / tests / limits / receipt",
"VERIFIED / REFUTED / UNKNOWN", and the three chapter titles. Credit appears
twice: a sticky note in the hero and the "Diff" line of the receipt footer.

Facts verified on 2026-09-28 against public coverage (TypeSafe AI blog, Latent
Space, O'Reilly Radar, DataCamp, Firecrawl, MindStudio): Jev launched
2026-09-15 from TypeSafe AI, founded by Diogo Almeida; training method RLCD
(reinforcement learning for calibrated decisions); $0.042 per million input
tokens with free output; 70 to 500 ms latency; 20 to 200x faster and 40 to
400x cheaper claimed; $40M raise. Caveats from the same coverage: claims are
internal evaluations, weights and architecture unpublished, waitlist-only.

## 3. Page structure

One HTML document, six regions in this order. Region ids double as URL hashes
and margin-navigation targets.

| # | Region | id | Look |
|---|--------|----|------|
| 0 | Masthead and hero | `top` | field guide |
| 1 | Chapter 01: The Control Plane | `control-plane` | field guide |
| 1b | Go deeper (depth layer) | `go-deeper` | editorial |
| 2 | Chapter 02: The Worktree Method | `worktree-method` | field guide |
| 3 | Chapter 03: The Proof Contract | `proof-contract` | field guide |
| 4 | Receipt footer | `receipt` | printed receipt |

### 3.1 Masthead and hero

- Running head, mono, small: `JEV + CLAUDE CODE · AGENT FIELD GUIDE · ADAPTED`
  on the left, `MURAT BATURAY · 2026` on the right.
- Headline, display face, uppercase, our own line (not a lift from the
  sources): **STOP PAYING A WRITER TO ANSWER YES OR NO.**
- Deck, mono, one sentence: "A field guide to splitting judgment from
  execution in Claude Code agents, with Jev answering the bounded questions."
- Sticky note (marker yellow, slightly rotated), the credit: "Adapted from the
  Agent Field Guide by @cyrilxbt and a source article on the Jev + Claude Code
  stack. Rebuilt, reworded, and fact-checked, September 2026." The @cyrilxbt
  handle links to the original.
- Three chapter chips under the deck (01 Control plane, 02 Worktree method,
  03 Proof contract) that scroll to their chapters.

### 3.2 Ruled margin navigation

- **Wide layout (1100px and up):** the left margin is a real ruled margin with
  line numbers. Numbers advance with scroll position (one number per fixed
  scroll increment, purely decorative, `aria-hidden`). Five markers sit in the
  margin: `01`, `02`, `03`, `DEEPER`, `RECEIPT`. The marker for the region in
  view is highlighted (`aria-current="true"`). Markers are links.
- **Medium layout (700 to 1099px):** margin narrows to markers only; line
  numbers hidden.
- **Narrow layout (under 700px):** a slim sticky top bar with the same five
  markers as short labels.
- Clicking `DEEPER` opens the depth layer expanded before scrolling to it.
  Loading the page with `#go-deeper` in the URL also opens it expanded.

### 3.3 Chapter 01: The Control Plane

Title bar (ink black, display face): `01 · THE CONTROL PLANE`. Chapter
sub-headline, our words: "One loop, two jobs. Decide cheap. Generate when it
counts."

Content blocks, top to bottom:

1. **Two layers, one gate.** Two columns with a vertical black gate between.
   - Left (mint): *Decision layer, Jev.* Four cards: answers bounded questions
     you defined; returns a typed answer with a probability; flags low
     confidence instead of bluffing; never writes text.
   - Centre (ink): *Policy gate.* Confidence threshold per decision type;
     allowed tools and scope; fallback to Claude below threshold.
   - Right (marker yellow): *Execution layer, Claude Code.* Four cards: reads
     the repository; generates the review, the fix, the document; runs tools
     and tests; returns the changed artifact.
2. **From request to verified result.** The routed-request interaction
   (section 6.1). Five stations: Goal + evidence, Jev answers, Policy gate,
   Claude Code acts, Result verified.
3. **The boundary rule.** A single strip, mono: "The classifier answers. The
   gate authorizes. The tool executes." Three small labels beneath: Jev
   answers what you asked / the gate decides what's allowed / Claude Code does
   it within bounds.
4. **Go deeper prompt.** A yellow sticky at the chapter's foot: "Why this
   split is worth 20 to 200x on the right loop, and nothing on the wrong one."
   with a "Go deeper" button that expands the depth layer.

### 3.4 Go deeper: the depth layer

Collapsed by default. Expanded by the chapter 1 sticky button, the `DEEPER`
margin marker, or a `#go-deeper` URL hash. Uses `<details>`/`<summary>` or an
equivalent that keeps the content in the DOM and reachable by find-in-page
when open. Expansion animates `grid-template-rows`, not `height`.

Visually it reads as inserted typed pages: lighter paper, no yellow, serif
body at a 65-character measure, mono for figures and code, ink rules between
parts. Nine parts, each with a mono part number and a short serif heading:

1. **Two jobs, one tool.** Generation has an unbounded output space; decision
   has a bounded, typed one. Claude Code routes both through a generative
   model. Jev was built for the second job: state in, typed answers with
   calibrated probabilities out, nothing generated. RLCD in one sentence.
   Figures: 70 to 500 ms versus 3 to 329 s for chat-model classification;
   $0.042 per million input tokens, output free.
2. **Where the multiplier comes from.** Decision density, not a head-to-head
   race. The article's author counted 31 bounded checks in one 340-line
   refactor session. Remove 31 generation calls, replace with 31 classifier
   calls, and the gain compounds at every decision point. Generation-heavy
   loops get nothing.
3. **Three steps to wire it in.**
   - Audit decision points: a five-line template (location, question, answer
     space, current cost, candidate). Expect 25 to 40% of calls in loops with a
     review step to be decisions in a generation costume.
   - Define the typed schema: illustrative pseudocode showing context plus a
     list of questions with ids, types (boolean, categorical with options,
     score with range), and prompts; all scored in one round trip.
   - Route inside the loop: pseudocode for the router (bounded question goes
     to Jev; above threshold return the answer; below threshold fall back to
     Claude; unbounded work goes to Claude directly).
4. **A worked loop: review, decide, fix, rerun.** Before and after as a
   two-column mono ledger. Before: five steps, three of which are decisions
   costing roughly 1,550 tokens and 13 seconds per PR. After: the same three
   steps as Jev calls at roughly 0.3, 0.25, and 0.28 seconds; the two
   generation steps unchanged. The sentence that lands the point: the review
   and the fix stayed on Claude; only the classification weight moved.
5. **Where the ceiling is real.** Four bands: triage queues, CI gating,
   policy filters on every generation, multi-agent handoff routing. High
   frequency, low ambiguity, tightly bounded, run at volume.
6. **Where forcing it backfires.** Jev cannot hallucinate free text but can
   confidently pick the wrong option in a valid schema; a bad schema returns a
   clean wrong answer. The article's author's four overlapping categories
   example, attributed. Four "don't" cases: judgment calls, low-volume
   high-stakes decisions, anything generative, schemas still changing weekly.
7. **Verification when the failure looks clean.** Per-decision thresholds
   (0.87 is an example, not a rule), set by measuring disagreement against
   Claude on a sample. Shadow-check a small percentage (the article uses 5%)
   of high-stakes decisions through Claude, logged not blocking, to catch
   schema drift. Pseudocode for the tuned router.
8. **The cost ledger.** The calculator interaction (section 6.4), introduced
   by one paragraph: the saving is the classification tax, not the whole bill.
9. **Five mistakes, and the actual skill.** The five mistakes as a numbered
   mono list (routing generation to Jev; one global threshold; skipping the
   schema audit; never sampling for drift; treating 200x as a target). Closing
   paragraph: the skill is decomposition. Final line links onward: "Next:
   isolate the work before you parallelize it. → Chapter 02".

A "Close" control at the foot collapses the layer and returns focus to the
chapter 1 sticky button.

### 3.5 Chapter 02: The Worktree Method

Title bar: `02 · THE WORKTREE METHOD`. Sub-headline, our words: "Four agents,
four branches, no shared files. Speed comes from isolation, not headcount."

1. **Isolate the work before you parallelize it.** Diagram rebuilt as SVG and
   HTML: main repository at the top; four worktree columns (A API, B UI,
   C Tests, D Docs), each with owned files, an explicit done condition, and
   local checks; four diff-review boxes; the verified merge queue; one clean
   release. This block is the worktree-merge interaction (section 6.2).
2. **The no-collision rules.** Four numbered cards, mono: one owner per file;
   one branch per task; test before handoff; merge verified diffs only. Each
   card is two sentences in our words.
3. **Warning strip** (mint with a warning glyph): "Parallelism without
   isolation creates rework." Sub-line: collapsed workspaces and conflicting
   edits slow everyone down.
4. **Closing bar** (ink): "More agents only help when the work is isolated."

### 3.6 Chapter 03: The Proof Contract

Title bar: `03 · THE PROOF CONTRACT`. Sub-headline, our words: "Done is a
claim. Evidence is what makes it true."

1. **Every task returns five things.** Five rows, alternating mint and yellow
   number tiles: Artifact (the output), Diff (exactly what changed), Tests
   (what ran and how it went), Limits (what was not verified), Receipt (how to
   reproduce and inspect: paths, URLs, logs, ids). Three side cards: evidence
   enables independence; same standard for every agent; missing evidence
   means incomplete.
2. **Gate the result with independent verification.** The proof-contract
   interaction (section 6.3): worker says done, evidence complete?, independent
   review, matches the goal?, accept and merge, with the return-for-repair and
   revise loops.
3. **The verifier prompt.** A mono card with the three-line prompt in our
   words: compare the artifact with the goal; check the evidence; answer
   VERIFIED, REFUTED, or UNKNOWN. Beside it a yellow warning card: "Confidence
   is not proof." One sentence connecting back to chapter 1: a calibrated
   probability tells you how sure the classifier is, not whether it is right,
   which is why the shadow check exists.
4. **Closing bar** (ink): "Trust the receipt, not the claim."

### 3.7 Receipt footer

Styled as a printed till receipt: narrow column, mono, dashed rules, a
perforated top edge drawn in CSS. It applies the proof contract to the page
itself. Lines:

```
JEVVY · FIELD GUIDE RECEIPT
------------------------------------------
ARTIFACT   This page. One HTML file, no build.
DIFF       Adapted from: Agent Field Guide, 3 pages,
           by @cyrilxbt (link). Source article: "The Jev +
           Claude Code Stack" (link, author unnamed).
           Rewritten, restructured, corrected (Jev's role;
           ranges not headlines; anecdotes attributed).
TESTS      Unit tests: ledger math, router, verifier.
           Lighthouse: accessibility 100, performance ≥95.
           Checked at 3 widths, reduced motion on and off.
LIMITS     Speed and cost figures are TypeSafe's own
           internal evaluations, not independently
           verified. Jev access is waitlist-only as of
           September 2026. Calculator defaults are the
           article's assumptions; edit them.
RECEIPT    github.com/muratbaturay/jevvy (link)
           Printed: <deploy date>
SOURCES    TypeSafe AI blog · Latent Space · O'Reilly Radar
           · DataCamp · Firecrawl · MindStudio (links)
------------------------------------------
Built by Murat Baturay. Not affiliated with TypeSafe AI
or Anthropic.
```

The source-article link is an open item (section 10).

## 4. Content rules

- Everything in our own words. The only verbatim carry-overs are the concept
  labels listed in section 2.4.
- Length: the depth layer is roughly half the source article, about 1,300 to
  1,600 words. Chapter copy is terse: card bodies are one or two sentences.
- Voice: matter-of-fact, typed, a little wry. Sentences short. No marketing
  adjectives. Numbers appear as ranges with their source made clear.
- Every figure that came from the article or from TypeSafe is either a range
  or is labelled as an example or assumption. No figure is presented as
  independently measured.
- Code samples are illustrative pseudocode, rewritten, shown in the mono face
  inside a bordered paper block with a small "illustrative" label.
- Pronouns: the reader is "you". The article's author is "the source
  article's author". Murat is "I" only on the receipt.

## 5. Visual system

Register: brand (a portfolio and long-form explainer; the design is the
product). Aesthetic lane: a printed field manual on ruled newsprint. Named
anchors: the @cyrilxbt Agent Field Guide pages (composition, palette, black
bars and coloured cards); Field Notes memo books (ruled paper, kraft-and-ink
restraint, typewritten labels, the physical object); The Pudding's visual
essays (pacing: one idea per fold, interactions that teach one thing).

### 5.1 Color

Full palette on the chapters, restrained on the depth layer. All tokens in
OKLCH. Never pure black or white; every neutral is tinted warm.

| Token | Value | Role |
|-------|-------|------|
| `--paper` | `oklch(96.5% 0.012 85)` | page background |
| `--paper-inset` | `oklch(98% 0.008 85)` | depth-layer background, "inserted pages" |
| `--card` | `oklch(99% 0.004 85)` | card faces |
| `--ink` | `oklch(20% 0.01 60)` | text, bars, borders |
| `--ink-soft` | `oklch(42% 0.01 60)` | secondary text, captions |
| `--rule` | `oklch(86% 0.01 85)` | ruled lines, dividers |
| `--marker` | `oklch(88% 0.17 95)` | yellow: execution layer, stickies, tiles |
| `--mint` | `oklch(91% 0.06 190)` | teal-light: decision layer, panels |
| `--teal` | `oklch(47% 0.10 195)` | deep teal: chapter 3 bars, links in depth layer |
| `--signal` | `oklch(58% 0.19 28)` | red: collisions, REFUTED, missing evidence only |

Rules: text on `--marker` and `--mint` is always `--ink`. Text on `--teal` and
`--ink` is `--card`, at 14px or larger. `--signal` never appears outside the
three failure states. Paper grain is a tiled SVG noise applied through a
fixed, pointer-events-none pseudo-element at 3 to 4% opacity, never a photo
and never applied per card.

Light theme only. This is a decision: the paper metaphor is the design, and a
dark variant would be a second design. `color-scheme: light` is declared so
form controls match.

### 5.2 Typography

Three families, all from Google Fonts, loaded with `display=swap` and a
preconnect. None are on impeccable's reflex-reject list.

| Role | Face | Notes |
|------|------|-------|
| Display | Anton | headlines, title bars, closing bars, uppercase, line-height 0.92 |
| Mono | Courier Prime 400/700, italic 400 | all chapter copy, labels, margin numbers, code, receipt |
| Depth body | Literata 400/600, italic 400 (optical size axis on) | depth-layer paragraphs and headings |

Scale (fluid, ratio at least 1.25 between steps):

- Display: `clamp(2.75rem, 8vw, 6.5rem)`
- Chapter bar: `clamp(1.5rem, 3.2vw, 2.5rem)`
- Card title: mono 700, 1rem
- Chapter body: mono 400, 0.95rem, line-height 1.5
- Label: mono 700, 0.72rem, uppercase, tracking 0.08em
- Depth heading: Literata 600, `clamp(1.35rem, 2.4vw, 1.75rem)`
- Depth body: Literata 400, 1.0625rem, line-height 1.65, measure 65ch
- Receipt: mono 400, 0.85rem, line-height 1.45

Fallbacks: `Anton, Impact, "Arial Narrow", sans-serif`; `"Courier Prime",
"Courier New", monospace`; `Literata, Georgia, serif`.

### 5.3 Surfaces, borders, elevation

- Cards: `--card` face, 1px `--ink` border, radius 6px, hard offset shadow
  `2px 2px 0 var(--ink)`. No blur.
- Coloured panels (mint, marker): same border and radius, no shadow.
- Sticky notes: `--marker`, no border, rotated between -2 and 2 degrees, one
  soft shadow `0 2px 6px oklch(0% 0 0 / 0.12)` (the only blurred shadow on
  the page).
- Stamps (VERIFIED, REFUTED, UNKNOWN, diff review): 2px border in the stamp
  colour, uppercase mono 700, slight rotation, `mix-blend-mode: multiply`.
- Bars: `--ink` or `--teal` fill, `--card` text, radius 6px.
- Ruled paper: horizontal rules every 2rem in the margin only, not behind
  body content.

### 5.4 Spacing and layout

- Spacing scale: 4, 8, 16, 24, 40, 64px; section gap `clamp(4rem, 10vw, 8rem)`.
- Content column max width 1180px on wide, with the ruled margin 64px wide
  outside it. Depth layer measure 65ch centred within the column.
- Grid: chapter blocks use CSS grid; the worktree columns are
  `repeat(auto-fit, minmax(240px, 1fr))` so they go 4, 2, then 1 across.
- Left-aligned throughout. Headlines are not centred.

### 5.5 Motion

- Principle: things arrive the way print does. Stamps land (scale 1.15 to 1,
  opacity in, 250 ms), stickies peel in (rotate from -6 to their rest angle,
  300 ms), connector lines draw (`stroke-dashoffset`, 400 ms), cards slide up
  8px and fade (200 ms). Easing `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- Reveals trigger once per element through an IntersectionObserver at 20%
  visibility, staggered 40 ms within a block.
- Every animated element has a static end state. Under
  `prefers-reduced-motion: reduce`, all reveal animations are disabled and the
  four interactions render their final state immediately, with their step-by-
  step narration shown as a static list.
- No parallax, no scroll-jacking, no autoplay loops beyond the worktree demo's
  single run.

### 5.6 Responsive layouts

| Width | Margin nav | Worktrees | Two-layer block | Ledger |
|-------|-----------|-----------|-----------------|--------|
| ≥1100 | full ruled margin | 4 across | 3 columns | 2 columns |
| 700–1099 | markers only | 2 across | stacked, gate becomes a horizontal bar | 2 columns |
| <700 | sticky top bar | 1 across, queue below | stacked | 1 column, before then after |

Diagrams are inline SVG with `viewBox`, so they scale without reflow. Tap
targets are 44px minimum on narrow widths. No horizontal page scroll at any
width from 320px up.

## 6. The four interactions

All four are scripted: no network, no API. Each lives in its own JS module
with a single `init(root)` export, reads configuration from data attributes,
and shares no state with the others. Each has a pure-logic file with no DOM
access that is unit-tested. Each is fully keyboard operable and announces its
result through a polite live region.

### 6.1 Routed request (chapter 1)

**Teaches:** bounded questions go to Jev; low confidence falls back to Claude;
judgment calls never go to Jev.

**UI:** a five-station horizontal flow (vertical on narrow widths) drawn as
SVG with HTML labels: Goal + evidence → Jev answers → Policy gate → Claude Code
acts → Result verified. Beneath it, a control panel: a radio group of three
sample questions and a range slider for the confidence threshold (0.50 to
0.99, step 0.01, default 0.87) with its value shown as text. A "Run" button
starts the animation; changing a control re-runs it.

**Scripted data:**

| Question | Kind | Jev answer | Probability |
|----------|------|-----------|-------------|
| "Did the test suite pass?" | bounded, boolean | no | 0.94 |
| "Which of five specialist agents should take this ticket?" | bounded, categorical | billing-agent | 0.71 |
| "Is this argument persuasive?" | judgment, unbounded | (never asked) | n/a |

**Behaviour (pure function `route({kind, probability, threshold})`):**

- `kind === 'judgment'` → `{path: 'direct', reason: 'No fixed schema fits a judgment call. Straight to Claude.'}`. The token skips the Jev station (drawn greyed) and the slider is shown disabled with a note.
- bounded and `probability >= threshold` → `{path: 'jev'}`. Token stops at Jev, a typed answer chip appears ("no · 0.94"), passes the gate (gate turns mint, label "≥ threshold, allowed"), continues to Claude Code acts, then Result verified.
- bounded and `probability < threshold` → `{path: 'fallback'}`. Token reaches the gate, gate turns marker yellow with label "below threshold, fall back", and a dashed detour line routes it to a small "Claude reasons it out" node before Claude Code acts.

With the default threshold, question 1 passes and question 2 falls back;
lowering the slider to 0.71 or below flips question 2, raising it above 0.94
flips question 1. The narration line under the panel states what happened in
one sentence and is the live region.

### 6.2 Worktree merge (chapter 2)

**Teaches:** isolated worktrees progress in parallel and merge in order;
shared files cause collisions and rework.

**UI:** the chapter 2 diagram itself. Each worktree column has a progress
track. A control row holds a "Replay" button and a toggle "Without isolation"
(a real checkbox styled as a switch, default off).

**Scripted timeline, isolated run (total about 5 s):** columns fill at
different rates (A 2.4 s, B 3.1 s, C 1.8 s, D 2.7 s). When a column completes,
its diff-review box gets a stamp. The merge queue then merges in completion
order (C, A, D, B), each merge drawing a line into the queue with a 300 ms
gap, and the release box stamps "1 CLEAN RELEASE" at the end.

**Scripted timeline, without isolation:** B and C both list `styles/` in their
owned files (shown by highlighting the shared entry in `--signal`). At 60% of
B's fill, a collision marker appears on both columns; C's progress is thrown
back to 30% with a "rework" label; the queue pauses; C completes later; the
release stamp lands about 2 s later than the isolated run, and a tally under
the diagram reads "2 collisions · 1 rework loop · release delayed" versus
"0 collisions · 0 rework · release on time".

**Pure function:** `simulate({isolated})` returns an ordered list of events
`{t, kind, column, detail}`; the DOM module plays them with timeouts. Tests
cover event ordering, collision generation, and totals.

Reduced motion: the final state renders directly, with the event list shown
as a static numbered log.

### 6.3 Proof contract (chapter 3)

**Teaches:** a task is done only when evidence is complete and verified;
incomplete evidence goes back for repair; complete evidence can still be
refuted; unreproducible evidence is unknown.

**UI:** the gate diagram from section 3.6 as a flow with two decision
diamonds. Left, a "Worker says done" card with a scenario select (four
options) and two buttons: "Return evidence" and "Verify". A five-slot
evidence strip (artifact, diff, tests, limits, receipt).

**Scenarios and outcomes (pure function `verify(evidence) →
'INCOMPLETE' | 'VERIFIED' | 'REFUTED' | 'UNKNOWN'`):**

| Scenario | Evidence | Verify result | Flow |
|----------|----------|---------------|------|
| Complete and correct | all five present, matches goal, receipt resolves | VERIFIED | accept and merge |
| Missing tests | tests slot empty | INCOMPLETE | "return for repair" loop back to worker; Verify disabled until repaired |
| Doesn't match the goal | all five present, goal mismatch | REFUTED | "revise" loop |
| Receipt doesn't resolve | all five present, receipt marked dead | UNKNOWN | "revise" loop with note: cannot reproduce |

"Return evidence" fills the slots one by one (120 ms stagger); an empty slot
gets a `--signal` dashed outline. "Verify" stamps the result on the review
node and lights the matching path. A "Repair" button appears in the incomplete
case, fills the missing slot, and re-enables Verify.

Reduced motion: slots and stamps render without animation.

### 6.4 Cost ledger (depth layer, part 8)

**Teaches:** the saving is the classification tax; generation cost does not
move.

**UI:** a two-column mono ledger, "Before: decisions through Claude" and
"After: decisions through Jev", with an assumptions panel above it. All
inputs are real `<input type="number">` fields with labels and units, live
recompute on input, no submit. A "Reset to article defaults" link restores
defaults.

**Inputs and defaults.** Each input carries one of three provenance labels
in the assumptions panel: "from the article", "derived from the article", or
"our estimate". The labels are part of the UI, not just this table.

| Input | Default | Unit | Provenance |
|-------|---------|------|------------|
| PRs per day | 50 | count | from the article |
| Decisions per PR | 3 | count | from the article |
| Tokens per decision | 520 | tokens | derived: 1,550 tokens across 3 decisions |
| Generation tokens per PR (review + fix) | 3000 | tokens | our estimate: review ~1,400 plus a fix of similar size |
| Claude blended rate | 50 | $ per million tokens | from the article (its output-weighted assumption) |
| Jev input rate | 0.042 | $ per million tokens | from the article (TypeSafe's published price) |
| Claude seconds per decision | 4.3 | s | derived: ~13 s across 3 decisions |
| Jev seconds per decision | 0.28 | s | derived: mean of 0.30, 0.25, 0.28 s |
| Working days per month | 22 | days | our estimate |

The implementer must not replace the Claude rate default from memory. If a
current published rate is wanted, load the `claude-api` skill and cite it;
otherwise keep the article's assumption and its label.

**Outputs (pure function `computeLedger(inputs)`):**

- classification cost per day, before and after
- generation cost per day (identical in both columns, deliberately)
- total per day and per month, before and after
- classification share of spend, before and after (before ÷ total)
- seconds saved per PR; hours saved per day
- daily saving in dollars

Formulas: cost = count × tokens ÷ 1,000,000 × rate; classification before uses
the Claude rate, after uses the Jev rate; generation uses the Claude rate in
both; seconds saved per PR = decisions × (Claude seconds − Jev seconds).
Monetary outputs show two decimals, small values show four. The ledger shows
no "x cheaper" multiplier: the ratio would depend entirely on the rate
assumption and would overstate TypeSafe's own range.

Validation: non-numeric or negative input is treated as zero and the field
gets an `aria-invalid` state with a one-line message. Nothing throws.

Tests: defaults reproduce $3.90 per day before (the article's own arithmetic
gives $3.88, which it rounds up to "four to six dollars"), under one cent
after, a before-share near 34%, and about 12 seconds saved per PR; zero
inputs give zeros; the generation column is equal on both sides.

## 7. Technical architecture

### 7.1 Files

```
index.html              all content, inline SVG diagrams, module script tags
css/tokens.css          colour, type, spacing, motion tokens
css/base.css            reset, typography, paper, margin, layout primitives
css/guide.css           chapter look: bars, cards, stickies, stamps, diagrams
css/depth.css           depth-layer look: inserted pages, serif, ledger
css/print.css           print stylesheet: no animations, depth layer open
js/main.js              imports every module below and calls init() per section
js/nav.js               margin navigation, scroll-spy, hash handling
js/reveal.js            IntersectionObserver reveals, reduced-motion guard
js/router-demo.js       6.1 DOM/animation
js/router-logic.js      route() pure
js/worktree-demo.js     6.2 DOM/animation
js/worktree-logic.js    simulate() pure
js/proof-demo.js        6.3 DOM/animation
js/proof-logic.js       verify() pure
js/ledger.js            6.4 DOM
js/ledger-logic.js      computeLedger() pure
tests/*.test.js         node:test files for the four pure modules
package.json            "type": "module"; scripts: test, dev; no dependencies
.nojekyll               GitHub Pages serves files as-is
README.md               what it is, dev command, test command, credits
PRODUCT.md, DESIGN.md   impeccable context (seed; refresh after build)
reference/              gitignored local source material
docs/superpowers/       this spec and the implementation plan
```

No build step, no bundler, no framework, no runtime dependencies. All asset
paths are relative (no leading slash) so the site works under `/jevvy/`.

### 7.2 Module contract

Each `*-demo.js` and `ledger.js` exports `init(root)` where `root` is the
section element. `index.html` loads one `js/main.js` that imports each module
and calls `init` on `querySelector('[data-demo="…"]')` if present. Modules
read all copy and defaults from data attributes or the DOM, so content edits
happen in HTML. Pure-logic modules import nothing and touch no globals.

### 7.3 Accessibility

- Landmarks: `header`, `nav` (margin), `main`, one `section` per region with
  a heading, `footer` (receipt). Heading order h1 → h2 (chapters) → h3.
- Margin markers are links with `aria-current="true"` on the active one; the
  decorative line numbers are `aria-hidden`.
- Every interaction: native controls (radio, range, checkbox, select, button,
  number inputs), visible focus rings (2px `--ink` outline, 2px offset), a
  polite `aria-live` narration element, and no information conveyed by colour
  alone (stamps carry text; collisions carry a label).
- SVG diagrams have `role="img"` with `<title>` and `<desc>`, or are
  `aria-hidden` when an adjacent HTML list carries the same information.
- Contrast AA for all text, including ink on marker yellow and card-white on
  teal (verified in the browser, not assumed).
- `prefers-reduced-motion` honoured as described in 5.5.
- Skip link to `main`.

### 7.4 Performance

- Page weight under 600 KB excluding fonts; fonts subset to latin, three
  families, at most six files.
- No layout shift after fonts load: `font-display: swap` with metric-matched
  fallbacks via `size-adjust` where practical.
- Animations use transform and opacity only; the grain layer is a single fixed
  element.
- Release bar: Lighthouse in Chrome, mobile profile: performance ≥95,
  accessibility 100, best practices ≥95.

### 7.5 Testing

- `npm test` runs `node --test tests/` with zero dependencies, covering the
  four pure modules (see each interaction's test notes).
- Browser verification through impeccable's craft loop: screenshots at 360,
  900, and 1400 px; reduced motion on and off; keyboard-only pass through all
  four interactions; find-in-page reaches depth-layer text when expanded.
- A manual checklist in the README mirrors the receipt's TESTS line.

### 7.6 Deploy

- GitHub Pages, source `main`, folder `/` (root). Enable in repository
  settings (manual step for Murat; the plan includes it).
- Update the receipt's "Printed" date and confirm the live URL after the
  first deploy.

## 8. Impeccable design brief (confirmed)

Confirmed by Murat Baturay in conversation on 2026-09-28, section by section
(structure and content; visual system and interactions; technical
architecture). This section satisfies impeccable's shape gate for `$impeccable
craft`; the implementer should treat `shape=pass` and not re-interview.

**1. Feature summary.** A single-page static site adapting a three-page
printed field guide and a source article into an interactive explainer with
four scripted interactions, for portfolio viewers and Slalom colleagues.

**2. Primary user action.** Read chapter 1 and run the routed-request demo
until the split between bounded decisions and generation is obvious; then
open "Go deeper" and use the cost ledger with their own numbers.

**3. Design direction.** Color strategy: Full palette on chapters (paper,
ink, marker yellow, mint, deep teal each with a fixed role); Restrained on the
depth layer (ink on paper, teal links only). Scene sentence: a developer reads
this at a desk in daylight, on a laptop next to a printed memo book, wanting
to understand a pattern in ten minutes and to show it to a teammate
afterwards; the page is paper under daylight, so it is light. Anchors: the
@cyrilxbt Agent Field Guide pages; Field Notes memo books; The Pudding's
visual essays. Visual direction probes: skipped because this harness has no
native image generation; the three infographics in `reference/` are the
approved visual direction and the mock-fidelity inventory is section 5.

**4. Scope.** Production-ready fidelity; one page, whole surface; shipped-
quality interactions; polish until it ships.

**5. Layout strategy.** One idea per fold. A ruled margin carries navigation
so the content column stays clean. Each chapter opens with a black title bar,
puts its diagram (and interaction) in the centre, and closes with a bar.
Depth is opt-in and visually quieter. The receipt is narrow and last.

**6. Key states.** Depth layer collapsed and expanded (including from hash);
each interaction idle, running, finished, and reduced-motion static; ledger
with defaults, edited, invalid input, reset; margin nav with an active marker;
narrow-width top bar; print.

**7. Interaction model.** Scroll reveals once; four scripted interactions with
native controls, one live narration line each; margin links scroll smoothly
(instant under reduced motion); "Go deeper" expands in place and moves focus
to its heading.

**8. Content requirements.** All copy in section 3 and rules in section 4;
ledger labels and validation messages; narration sentences for each demo
outcome (router: three paths; worktree: two tallies; proof: four results);
alt and SVG descriptions; receipt lines; README.

**9. Recommended references.** impeccable: spatial-design.md, typography.md,
motion-design.md, interaction-design.md, color-and-contrast.md,
responsive-design.md, ux-writing.md, brand.md.

**10. Open questions.** See section 10.

## 9. Out of scope

- Any live call to Jev or Claude. Everything is scripted.
- A dark theme.
- Analytics, comments, forms that submit anywhere, cookies.
- A build pipeline, a framework, or CSS tooling.
- Reproducing the infographics as images on the page.
- Localisation.

## 10. Open items for Murat

1. The URL of the source article, for the receipt's DIFF line and the hero
   sticky. Until provided, the receipt says "source article (link pending)".
2. Enable GitHub Pages on the repository after the first push (Settings →
   Pages → Deploy from branch → main, root).
