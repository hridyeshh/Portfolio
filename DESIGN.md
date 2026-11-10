# Design

The chosen direction: one big sentence that says what I make, then seven coloured sheets that slide over each other, each with one 3D object pinned on it. Picked from a working prototype on 2026-11-07.

## Visual Theme & Atmosphere

**Lead with the real things, in plain words.** No thesis lines, riddles or notes that promise an action. One idea per screen.

**Signature:** objects whose parts really move with your scroll. A box opens, a pencil marks a line, a floppy boots a Mac, a car drives, wings flap with scroll speed, a keychain swings. Each is a toy built in code with painted textures, or the game's own model for the car.

**Depth:** every object casts a soft shadow on its sheet, and the big name sits under the object while the copy sits over it.

## Color Palette & Roles

Define as tokens. Raw hex or px in `.tsx` fails lint.

| Where | Ground | Ink |
|---|---|---|
| The Sentence | `--yellow` `#ffd93b` | `--black` `#141210` |
| The end, my bench | `--bench` `#2f5c4a` | `--paper` |
| Paperboxd | `#cc3620` (4.5:1 with its cream) | `#fdf6e8` |
| stickynotes | `#f2f2f2` | `#201f1d` |
| thelocalcode | `#7f78c5` | `#151513` |
| puzzlecafe | `#e9c46a` | `#0b0d10` |
| Desky | `#14231c`, so the screens glow | `#e8f3ea` |
| Butterfly clutcher | `#f4b6cf`, because the wings are lavender | `#1c1830` |
| Pixel keychain | `#a8d8f0` | `#0e2430` |
| Experience and case study reading | `--paper` `#f4f3ef` | `--black` |

Sheets set `--g` and `--i` through `.tone-<slug>`, and the skip button inverts them.

## Typography Rules

| Role | Family | Use |
|---|---|---|
| Display | Bricolage Grotesque | The Sentence, project names, plain lines |
| Body | Atkinson Hyperlegible Next | Paragraphs, nav, status |
| Hand | Caveat | Labels painted on objects, and short notes |
| Figure | Atkinson Hyperlegible Mono | Screens and figures, where content really is code |
| Spines | Libre Caslon Condensed | Book spines and take-apart figures only |

Copy has no em dashes. All copy lives in `lib/content.ts`.

## Component Stylings

- **Sentence:** each phrase carries a small die-cut sticker. A tap gives the page that project's colour, brings the sticker forward, then cuts to its sheet.
- **Sheet:** big name, a short paragraph in the open space, one plain line, status pill, links. Links appear only when live.
- **Skip button:** bottom right, for the journey only. Compact with a filling ring while scrolling, opens to "Skip to experience" half a second after you stop. Stays open under reduced motion.
- **Experience rows:** native `<details>`.
- **Ask:** the end is my bench. A green cutting mat (`--bench`, with a faint mat grid, the one place a grid is allowed), the seven stickers lying on it with a paper label each (name, and status in red hand). Picking one up asks about its project, and one line at Sentence size takes any other question. Inline, never a modal, labeled as an AI. It can look up my public GitHub.
- **Case study:** coloured band, then decisions with what was rejected and what it cost. The take-apart figure lives here, not on home.

## 3D and motion

- One renderer on one sticky canvas, loaded after the Sentence, paused off screen, pixel ratio capped.
- Native scrolling, never scroll-jacking. Objects move with their sheet at its edges, and pin in between.
- `three` is pinned to 0.147.0, because the lights and colours were tuned and approved there. Newer versions change both, so retune when bumping.
- Reduced motion, no WebGL, no JavaScript or a struggling device get painted stills with the same words.

## Do's and Don'ts

**Do:** show real recordings and real models. Keep objects in one toy-like painted style.

**Don't:** show a photo of the author, use tiles, gradient text, glass cards, custom cursors, blueprint grids, hero metrics or a client logo wall.

## Responsive Behavior

`scripts/check.mjs` covers 320, 390, 768, 1024 and 1440 wide: no sideways scroll, and each sheet's paragraph clear of its name and copy. On phones the paragraph sits under the name, and on very short phones it hides, with the plain line still showing.

## Agent Prompt Guide

Read `PRODUCT.md` first. Every color comes from a token. Before adding anything, ask whether it could appear on any other developer's portfolio; if so, make it specific to this work or remove it.
