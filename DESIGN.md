---
name: Jevvy Field Guide
description: A printed field manual on ruled newsprint that moves when you touch it.
colors:
  paper: "oklch(96.5% 0.012 85)"
  paper-inset: "oklch(98% 0.008 85)"
  card: "oklch(99% 0.004 85)"
  ink: "oklch(20% 0.01 60)"
  ink-soft: "oklch(42% 0.01 60)"
  rule: "oklch(86% 0.01 85)"
  marker: "oklch(88% 0.17 95)"
  mint: "oklch(91% 0.06 190)"
  teal: "oklch(47% 0.10 195)"
  signal: "oklch(58% 0.19 28)"
typography:
  display:
    fontFamily: "Anton, Impact, 'Arial Narrow', sans-serif"
    fontSize: "clamp(2.75rem, 8vw, 6.5rem)"
    fontWeight: 400
    lineHeight: 0.92
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Anton, Impact, 'Arial Narrow', sans-serif"
    fontSize: "clamp(1.5rem, 3.2vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.02em"
  title:
    fontFamily: "'Courier Prime', 'Courier New', monospace"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "'Courier Prime', 'Courier New', monospace"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.5
  body-depth:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "'Courier Prime', 'Courier New', monospace"
    fontSize: "0.72rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  none: "0px"
  sm: "4px"
  md: "6px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  2xl: "64px"
  section: "clamp(4rem, 10vw, 8rem)"
components:
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "16px 20px"
  panel-mint:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "20px"
  panel-marker:
    backgroundColor: "{colors.marker}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "20px"
  bar-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.card}"
    typography: "{typography.headline}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  bar-teal:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.card}"
    typography: "{typography.headline}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  sticky:
    backgroundColor: "{colors.marker}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "16px 18px"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.card}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.card}"
  button-ghost:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
  input-number:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "8px 10px"
  nav-marker:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "4px 0"
  nav-marker-active:
    backgroundColor: "{colors.marker}"
    textColor: "{colors.ink}"
---

<!-- SEED -->
<!-- Seeded from the design spec on 2026-09-28, before any code exists.
     Re-run `$impeccable document` in scan mode once index.html and css/ are
     built so the tokens reflect the real stylesheet. -->

# Design System: Jevvy Field Guide

## 1. Overview

**Creative North Star: "The Field Manual That Moves"**

A printed reference on warm, ruled newsprint: heavy condensed headlines in
black bars, typewritten card copy, marker-yellow and mint panels, rubber
stamps. It looks like something you could hold, and then a stamp lands, a
sticky note peels in, and a request travels along a drawn line. Motion is
print behaviour, not web decoration: it happens once and stays put.

The system has two densities. The three chapters are dense, gridded, and
full-palette, like the infographic pages that inspired them. The "Go deeper"
layer is a set of inserted typed pages: lighter paper, no yellow, a reading
serif at a 65-character measure. A reader feels the shift without a change of
site.

It rejects, by name from PRODUCT.md: the generic AI landing page (centred
hero, icon cards, gradients, glass, purple-on-dark); kitsch skeuomorphism
(photo textures, stains, torn edges, blurred shadows everywhere); a dark
dashboard band stapled onto the article; marketing tone; template card grids.

**Key Characteristics:**
- Warm paper, warm ink; never pure black or white.
- Full palette in the chapters with fixed roles per colour; restrained in the
  depth layer.
- Hard offset shadows on cards, one soft shadow reserved for sticky notes.
- Three typefaces with distinct jobs: Anton, Courier Prime, Literata.
- A ruled left margin that is real navigation.
- Light theme only, by decision.

## 2. Colors: The Newsprint Palette

Warm paper and ink with three working colours and one alarm colour.

### Primary
- **Marker Yellow** (`oklch(88% 0.17 95)`): the execution layer, sticky notes,
  the proof-contract's even-numbered tiles, the active margin marker, the
  gate's "fall back" state. Always carries ink text.
- **Mint** (`oklch(91% 0.06 190)`): the decision layer, chapter 2 and 3
  panels, the gate's "allowed" state, the warning strip. Always carries ink
  text.

### Secondary
- **Deep Teal** (`oklch(47% 0.10 195)`): chapter 3 title and section bars,
  links in the depth layer, primary button hover. Carries card-white text at
  14px and above only.

### Tertiary
- **Signal Red** (`oklch(58% 0.19 28)`): collisions, REFUTED, a missing
  evidence slot, an invalid ledger input. Nowhere else.

### Neutral
- **Paper** (`oklch(96.5% 0.012 85)`): page background.
- **Paper Inset** (`oklch(98% 0.008 85)`): depth-layer background.
- **Card** (`oklch(99% 0.004 85)`): card faces and text on dark bars.
- **Ink** (`oklch(20% 0.01 60)`): text, bars, borders, hard shadows.
- **Ink Soft** (`oklch(42% 0.01 60)`): captions, secondary text, inactive
  markers.
- **Rule** (`oklch(86% 0.01 85)`): ruled lines, dividers, ledger rules.

### Named Rules
**The Fixed Roles Rule.** Yellow means execution, sticky, or "fall back".
Mint means decision or "allowed". Teal means chapter 3 or a link. Red means a
failure state. A colour never takes another colour's job.

**The Ink-on-Colour Rule.** Text on yellow or mint is always ink. Text on ink
or teal is always card-white and at least 14px.

## 3. Typography

**Display Font:** Anton (with Impact, Arial Narrow)
**Body Font:** Courier Prime (with Courier New) in the chapters; Literata
(with Georgia) in the depth layer
**Label/Mono Font:** Courier Prime

**Character:** A poster headline over a typewritten manual. Anton shouts in
black bars; Courier Prime does the patient explaining; Literata takes over
only when the reader has chosen to read for ten minutes.

### Hierarchy
- **Display** (400, `clamp(2.75rem, 8vw, 6.5rem)`, 0.92): the hero headline
  only. Uppercase.
- **Headline** (400, `clamp(1.5rem, 3.2vw, 2.5rem)`, 1.0): chapter title bars,
  section bars, closing bars. Uppercase.
- **Title** (700, 1rem, 1.3): card titles, ledger column heads, stamps.
- **Body** (400, 0.95rem, 1.5): chapter card copy, control labels, receipt.
- **Body, depth** (Literata 400, 1.0625rem, 1.65): depth-layer paragraphs at
  a 65ch measure; headings Literata 600 `clamp(1.35rem, 2.4vw, 1.75rem)`.
- **Label** (700, 0.72rem, 0.08em, uppercase): running head, margin markers,
  chip labels, "illustrative" tags.

### Named Rules
**The Two-Voices Rule.** Anton and Courier Prime are the chapters' entire
type. Literata appears only inside the depth layer and only for prose.
Nothing is centred except the receipt.

## 4. Elevation

Flat print with one trick. Cards sit on the paper with a 1px ink border and
a hard 2px offset shadow, like a stuck-on sticker. Nothing blurs except the
sticky note. Depth otherwise comes from paper tone (the depth layer is
lighter) and from bars sitting "on top" of the grid.

### Shadow Vocabulary
- **Sticker** (`box-shadow: 2px 2px 0 oklch(20% 0.01 60)`): all cards at
  rest; on hover the card moves 1px up-left and the offset grows to 3px.
- **Sticky** (`box-shadow: 0 2px 6px oklch(0% 0 0 / 0.12)`): sticky notes
  only.

### Named Rules
**The No-Blur Rule.** One blurred shadow exists and it belongs to the sticky
note. Everything else is a hard offset or nothing.

## 5. Components

### Buttons
- **Shape:** near-square (4px radius), 1px ink border.
- **Primary:** ink fill, card-white label text, uppercase mono, 12px by 20px.
- **Hover / Focus:** fill shifts to deep teal; focus adds a 2px ink outline
  with 2px offset. Transition 150 ms on background only.
- **Ghost:** card fill, ink text, same border; hover fills marker yellow.

### Chips
- **Style:** mono label, ink border, card fill, 4px radius, 6px by 10px.
- **State:** the hero chapter chips are links; hover fills mint.

### Cards / Containers
- **Corner Style:** 6px.
- **Background:** card-white for cards; mint or marker for coloured panels.
- **Shadow Strategy:** Sticker on cards; none on coloured panels.
- **Border:** 1px ink.
- **Internal Padding:** 16px by 20px (cards), 20px (panels).

### Inputs / Fields
- **Style:** 1px ink stroke, card fill, 4px radius, mono text, unit shown
  after the field in ink-soft.
- **Focus:** 2px ink outline, 2px offset; no glow.
- **Error / Disabled:** invalid fields get a signal-red border and a one-line
  mono message below; disabled controls drop to ink-soft text and a rule-
  coloured border.

### Navigation
- Ruled margin at 64px with mono line numbers in rule colour and five
  markers in ink-soft; the active marker gets a marker-yellow highlight and
  ink text. Medium widths hide the numbers; narrow widths use a sticky top
  bar with the five markers as short labels, 44px tall.

### Stamp (signature component)
A rotated, uppercase mono word in a 2px border of its own colour (ink for
review stamps and VERIFIED, signal red for REFUTED, ink-soft for UNKNOWN,
marker for INCOMPLETE), `mix-blend-mode: multiply`, landing with a 250 ms
scale-in. It is the page's one recurring "moving print" motif.

### Sticky note (signature component)
Marker-yellow square, no border, rotated between -2 and 2 degrees, Sticky
shadow, peels in on reveal. Used for the credit and the "Go deeper" prompt.

## 6. Do's and Don'ts

### Do:
- **Do** define every colour as an OKLCH token in `css/tokens.css` and tint
  neutrals toward hue 60 to 85.
- **Do** keep text on yellow and mint as ink, and text on ink and teal as
  card-white at 14px or larger.
- **Do** use hard 2px offset shadows on cards and reserve the one blurred
  shadow for sticky notes.
- **Do** animate with transform and opacity only, once per element, 200 to
  400 ms, and render static end states under reduced motion.
- **Do** keep the depth layer free of yellow and set its prose in Literata at
  65ch.
- **Do** make the margin markers real links with `aria-current`.

### Don't:
- **Don't** build a generic AI landing page: no centred hero, no three icon
  cards, no gradient blobs, no glassmorphism, no purple-on-dark.
- **Don't** use photographic paper textures, coffee stains, torn-edge images,
  or blurred drop shadows everywhere; the grain is a single tiled SVG noise
  at 3 to 4% opacity.
- **Don't** add a dark dashboard band for the article; the depth layer is
  quieter paper, not a different product.
- **Don't** show an unqualified "200x" or compute a "x cheaper" multiplier
  in the ledger.
- **Don't** put the same rounded icon above every heading or fall back to a
  template card grid.
- **Don't** use `#000` or `#fff`, centre the headlines, or add a dark theme.
