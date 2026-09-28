# Product

## Register

brand

## Users

Two audiences, one page.

- **Portfolio viewers.** Designers, engineers, and hiring or client contacts
  who land on the page from Murat Baturay's profile. They skim in two minutes,
  judge craft first, and decide whether to read further. State of mind:
  curious, evaluating.
- **Slalom colleagues learning the pattern.** Consultants and engineers who
  build agents with Claude Code and want to understand decision-versus-
  generation routing, worktree isolation, and the proof contract well enough
  to apply and explain them. They read top to bottom once, then return to the
  cost ledger with their own numbers. State of mind: focused, a little
  skeptical of "200x" claims, short on time.

The job to be done: understand a pattern in ten minutes, believe it because
the numbers are honest, and be able to show it to a teammate.

## Product Purpose

A single-page static explainer that adapts a three-page printed-style
infographic series (the "Jev + Claude Code · Agent Field Guide" by @cyrilxbt)
and a long-form source article into one interactive web page, hosted on
GitHub Pages. It exists to demonstrate craft (the showcase) and to teach the
pattern (the explainer) without pretending the two conflict. Success: a
visitor asks "how was this made?"; a colleague runs the decision-point audit
on their own agent transcript after reading.

Full design: `docs/superpowers/specs/2026-09-28-jevvy-field-guide-design.md`.

## Brand Personality

Typewritten, stamped, matter-of-fact.

Voice: short sentences, plain claims, ranges instead of headline multipliers,
a little wry. The page sounds like a field manual written by someone who has
shipped the thing and knows where it breaks. It never sells. Emotional goal:
the calm confidence of a well-organised printed reference that turns out to
move when you touch it.

## Anti-references

- A generic AI landing page: centred hero, three icon cards, gradient blobs,
  glassmorphism, purple-on-dark. If a visitor could say "AI made that" without
  hesitation, it has failed.
- Kitsch skeuomorphism: photographic paper textures, coffee stains, torn-edge
  PNGs, drop shadows with blur everywhere. The paper is a cue, not a costume.
- A second website stapled on: a dark "dashboard" band for the article that
  reads as a different product. The depth layer is quieter, not different.
- Marketing-deck tone: "revolutionary", "supercharge", unqualified "200x".
- Template card grids with the same rounded icon above every heading.

## Design Principles

1. **Practice what the guide preaches.** The page returns its own artifact,
   diff, tests, limits, and receipt. Honesty is part of the design, not a
   disclaimer.
2. **Print that moves, not a website that decorates.** Motion mimics stamps,
   peels, and ink; it arrives once and then stays still. Nothing loops for
   attention.
3. **One idea per fold.** Each chapter block teaches one thing; each
   interaction teaches exactly one thing and says so in a single sentence.
4. **Depth is opt-in.** The three chapters stand alone for a skimmer; the
   article layer is there for the colleague who wants it, and it looks
   different enough that they know they've gone deeper.
5. **Ranges, sources, and attributions.** Every number is a range or is
   labelled as an example or assumption; every borrowed idea is credited.

## Accessibility & Inclusion

- WCAG 2.2 AA throughout; Lighthouse accessibility 100 is the release bar.
- Every interaction operable by keyboard with native controls and a polite
  live region for outcomes; no meaning carried by colour alone.
- `prefers-reduced-motion` fully honoured: static end states and step lists
  replace animation.
- Readable measure (65ch) and 1.65 line height on long-form text; minimum
  44px tap targets on narrow widths; no horizontal scroll from 320px up.
- Light theme only by design; sufficient contrast on every coloured surface,
  verified in the browser.
