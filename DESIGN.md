# Design

The chosen direction: a cyanotype ground, a full-bleed "Hridyesh" wordmark, and the headline written on the sheet the painted hands are lifting, beside staggered project tiles.

## Visual Theme & Atmosphere

**Idea: all the way down.** Headline: *I design software all the way down.* Support: *Users feel every layer. So I design every layer.*

**Signature: take it apart.** Scrolling splits a product into flat sheets at depth (Surface, Client, API, Data), each showing one real decision, with data running down a trace between them.

**Scene:** a technical lead at 9pm on a laptop in a dim room, a dozen tabs open, skeptical, giving this forty seconds. A white page would glare and another near-black page would vanish among the other tabs, so the ground is a deep saturated blue.

**Color strategy:** Committed, with Drenched project chapters. One art-directed theme, no toggle.

## Color Palette & Roles

Define as tokens. Raw hex or px in `.tsx` fails lint. No pure `#000` or `#fff` anywhere in the interface. Mix tones with `color-mix(in oklab, ...)`: in oklch, the hue arc from paper to cyanotype runs through green.

### Brand

| Token | Value | Role |
|---|---|---|
| `--cyanotype` | `oklch(0.27 0.085 258)` | Main ground |
| `--paper` | `oklch(0.95 0.018 85)` | Type on cyanotype; ground for reading pages. 13.1:1 together |
| `--pencil-on-dark` | `oklch(0.74 0.15 32)` | Red pencil on cyanotype: margin notes, focus. 6.2:1 |
| `--pencil-on-light` | `oklch(0.50 0.18 29)` | Red pencil on any light ground. At least 5.6:1 |

### Project chapters

Each chapter is full-bleed in its own palette. Site chrome stays neutral.

| Project | Ground | Ink | Accent |
|---|---|---|---|
| Paperboxd | `#F2EDE1` | `#151513`, muted `#6A6456` | `#C0271C` for text (5.07:1); `#D23B26` only for large type and art (4.09:1) |
| stickynotes | `#f2f2f2`, sampled from `sticky-hands.jpg` so the painting has no visible edge | `#201f1d` | `#b68235` for art and large shapes only |
| thelocalcode | `#7f78c5` | `#151513` (4.70:1) | Red fails on this ground at every lightness: use ink for margin notes |
| thelocalcode finale | `#194d15` | `--paper` (8.6:1) | `oklch(0.78 0.13 32)` for margin notes (4.7:1) |
| puzzlecafe | `#e9c46a` | `#0b0d10` (11.7:1) | Ink for margin notes. Art: the gouache toy car held in a hand |

## Typography Rules

| Role | Family | Use |
|---|---|---|
| Display | Libre Caslon Condensed | Wordmark, statements, project names. Enormous and tight |
| Body | Atkinson Hyperlegible Next | Running text, nav, chips. Lines capped at 65 to 75ch |
| Margin | Caveat | Red-pencil notes only, a few words at a time |
| Figure | Atkinson Hyperlegible Mono | Only inside figures, where content really is code |

- Fluid sizes with `clamp()` and at least a 1.25 ratio between steps.
- The wordmark is "Hridyesh" alone, with no surname. It runs full-bleed: its size comes from the container width times `--fit-wordmark`, the string's measured width, so it fills the measure at every width and a scrollbar can't push it off the edge. Remeasure if the string or the face changes. The tail of the `y` hangs below the tight line box, so leave room or let art cover it on purpose.
- Libre Caslon Condensed is self-hosted from `app/fonts/`, because `next/font` doesn't list it.
- On cyanotype, add 0.05 to 0.1 to line-height: light type reads thinner.
- Copy has no em dashes. All copy lives in `lib/content.ts`.

## Component Stylings

- **Pill nav:** two pills split around the content, not a bar. Must fit inside a 390px viewport.
- **Tag chip:** pill on a media tile, for example `CASE STUDY · 6 MIN`. The one place small caps with tracking are allowed.
- **Media tile:** rounded image tile, staggered in size and offset. Never an identical grid.
- **Margin note:** Caveat in red pencil, slightly rotated, next to what it annotates.
- **Take-apart figure:** one data-driven component of SVG layers using `preserve-3d`; a `.signal` dash runs down the trace. The still version shows every layer at once.
- **Experience rows:** native `<details>`.
- **Ask:** inline chat in the page, never a modal. Labeled as an AI answering from this site's content.

## Layout Principles

- One dominant idea per fold. Each chapter has its own composition, so no two read alike.
- Generous gaps between chapters, tight groupings inside them. Vary rhythm with `clamp()`.
- Art bleeds off the frame edges; arms enter from the sides so narrow screens crop to the middle.

## Depth & Elevation

Depth comes from objects and paper, not from UI chrome. Flat sheets at real depth for the take-apart figure, soft painted shadows in the art. No glass, no blur, no decorative drop shadows on cards.

## Do's and Don'ts

**Do:** draw anything that zooms or comes apart as SVG. Ease out with exponential curves. Prefer CSS scroll timelines over script. Show recordings of real work, with a pause button and a still poster.

**Don't:** show a photo of the author, use gradient text, glass cards, custom cursors, three.js on the page, blueprint grids, side-stripe borders, identical card grids, hero metrics, a mono label above every section, or a client logo wall.

## Responsive Behavior

Check at 390, 768 and 1440px with no horizontal overflow. The wordmark and statements stay enormous on a phone and stack with the art; tiles stay staggered in two columns on a phone and one row on a tablet. Reduced motion, unsupported browsers and phones get still versions carrying the same content; `scripts/check.mjs` fails if pinned copy stops fitting its stage.

## Agent Prompt Guide

Read `PRODUCT.md` first. Every color comes from a token above. Before adding anything, ask whether it could appear on any other developer's portfolio; if so, make it specific to this work or remove it.
