# Visual style

## Intent

The site should feel like a polished scrollytelling explainer:
- clean
- modern
- editorial
- technical but human
- high signal and calm

Avoid:
- neon/cyberpunk visual language
- dashboard-heavy UI
- over-styled gradients or glowing effects

---

## Current default direction (v2)

Name: **Light Organic Editorial**

This is now the default attempt for implementation.

### Visual character

- light paper-like background, not pure white
- soft card edges and subtle texture gradients
- serif-forward display headings with clean sans body text
- restrained accent usage for meaning, not decoration
- generous vertical rhythm for scrollytelling

### Core palette

- page background: `#FBFAF5`
- deep section tint: `#F3F0E6`
- base surface: `#FFFDF7`
- active surface: `#F4EFE2`
- primary text: `#171717`
- secondary text: `#3F3F46`
- muted text: `#71717A`
- border: `rgba(39,39,42,0.14)`

### Accent palette

- tokens: `#0EA5C6`
- embeddings: `#6D5BD0`
- neurons: `#D97706`
- training: `#E11D48`
- attention: `#CA8A04`
- transformer: `#0F766E`
- sampling: `#0284C7`
- quantization: `#BE185D`

Use accents mostly for:
- active traces
- selected states
- chapter highlights
- semantic concept mappings

Do not use accents as large background fills by default.

### Typography

- display/headlines: `"Fraunces", "Iowan Old Style", "Georgia", serif`
- UI/body: `"IBM Plex Sans", "Avenir Next", "Segoe UI", sans-serif`
- eyebrow text may use the body/UI family in uppercase with letter spacing

Rules:
- no gradient text on primary heading
- avoid very bold headline weights for long text
- keep line lengths readable (55-75 chars for body)

---

## Two alternative style options

These are valid future variants if we decide to pivot.

### Option A: Neutral Studio

- brighter neutral background with almost monochrome UI
- accents only inside diagrams
- tighter card radii and minimal shadows
- stronger typographic hierarchy, less color hierarchy

### Option B: Night Paper

- warm dark ink background (`#17191D`) with parchment-tinted cards
- muted highlights, no neon
- same serif/sans pairing as default
- lower contrast than pure black dark mode

---

## Scrollytelling layout rules

- sections should feel like narrative beats, not app panels
- each chapter section targets ~1 viewport height minimum
- sticky visual region supports reading + visual focus side by side
- navigation should jump to real section anchors
- default section state must be meaningful before interaction

---

## Motion and interaction rules

- motion explains state changes; it is never decorative filler
- transitions should be subtle and short
- reduced-motion mode must disable non-essential transitions
- sticky + scroll behavior must stay smooth on mobile and desktop

---

## Component styling rules

Shared primitives must feel from one design system:

- consistent border + radius + shadow tokens
- consistent text scale and spacing ramps
- concept colors map consistently across chapters
- selected, hover, and disabled states remain readable in light mode

### Dimension explainer pattern

For chapters with matrix/vector shape load, use the shared `DimensionOverlay` pattern:

- CTA style: small card-like button with kicker text (`Need A Shape Guide?`)
- Placement: near the equation block or directly under the relevant visual guidance text
- Content structure:
  - one-sentence summary
  - shape equations line-by-line
  - explicit legend for what each number means
  - short note distinguishing toy sizes vs real models
- Keep copy practical and concrete; avoid unexplained symbols.

---

## Human review checklist for style

Before approving a chapter style pass:

- Does this feel editorial/scrollytelling rather than dashboard-like?
- Is the hierarchy readable without interaction?
- Is the main heading clean and confident, not flashy?
- Are accents sparse and semantic?
- Does mobile keep clarity and breathing room?
- Does reduced motion still preserve comprehension?
