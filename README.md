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
