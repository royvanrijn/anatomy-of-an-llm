# Visual style

## Visual style guide

## Overall feeling

The site should feel:

```text
clear
playful
technical
calm
inviting
high signal
not corporate
not cyberpunk
not childish
```

Reference vibe:

```text
interactive science museum
Bret Victor-style explainer
Observable notebook polish
TensorFlow Playground clarity
modern developer tool UI
```

---

## Color palette and visual mood

The site should feel like a beautiful, interactive “cosmic science textbook”: dark, calm, precise, playful, and premium. Avoid a generic neon cyberpunk look. The colors should help explain concepts, not just decorate the page.

### Overall visual direction

Use a deep navy / near-black foundation with soft glowing accents. The background should feel spacious and slightly cosmic, like looking into a dark observatory screen or scientific instrument panel.

The UI should use mostly dark neutral colors, with bright colors reserved for important visual explanations: active tokens, attention lines, vector points, neuron activations, training errors, probability branches, and chapter highlights.

The rough color balance should be:

- 80% dark navy / slate neutrals
- 10% soft tinted surfaces
- 7% accent strokes, labels, outlines, and highlights
- 3% full-bright “wow” moments

Do not make every card, heading, or diagram equally colorful. The color should guide attention.

### Background colors

Primary background:

- deep near-black navy: `#070A13`
- main page navy: `#0B1020`
- elevated section navy: `#111827`

The background may use very subtle radial gradients, especially in hero sections and chapter transitions. These gradients should be low-opacity and atmospheric, not loud.

Good background feeling:

- deep space
- dark glass
- scientific dashboard
- calm night-mode reading experience

Avoid:

- pure black
- flat gray
- overly saturated blue backgrounds
- heavy cyberpunk purple everywhere

### Surface cards

Cards and panels should be slightly lighter than the background, with soft borders and subtle glass-like lighting.

Recommended surface colors:

- base card: `#151E2E`
- raised card: `#1D293D`
- active / hover card: `#273449`

Cards should usually have a subtle border using translucent white. They may have a very soft internal gradient from slightly lighter at the top to darker at the bottom.

The look should be tactile but not skeuomorphic.

### Text colors

Text should be high contrast and readable, but not harsh.

Recommended text colors:

- primary text: `#F8FAFC`
- secondary text: `#CBD5E1`
- muted text: `#94A3B8`
- very muted labels: `#64748B`

Use primary text only for important headings and body text. Use secondary and muted colors for explanations, labels, helper text, axis labels, and inactive states.

Never use pure white for large areas of text unless necessary.

### Brand identity colors

The main identity of the project should be a cyan-to-violet gradient.

Brand colors:

- cyan: `#22D3EE`
- violet: `#A78BFA`
- emerald: `#34D399`

Use the cyan-to-violet gradient for:

- hero title emphasis
- primary progress indicator
- active chapter marker
- logo or wordmark accents
- primary call-to-action
- occasional chapter transition glow

The emerald color should be used sparingly as a third “success / structure / system” accent.

### Concept colors

Each major LLM concept should have a stable color identity across the entire site. Once a color is assigned to a concept, use it consistently in diagrams, labels, navigation, highlights, particles, and animations.

Use these concept colors:

Tokens:

- color: cyan
- hex: `#22D3EE`
- feeling: crisp, discrete, code-like, small units

Embeddings:

- color: violet
- hex: `#A78BFA`
- feeling: abstract, spatial, latent, high-dimensional

Neurons:

- color: warm orange
- hex: `#FDBA74`
- feeling: activation, energy, threshold, firing

Training:

- color: rose / coral
- hex: `#FB7185`
- feeling: error, correction, pressure, gradient descent

Attention:

- color: yellow
- hex: `#FACC15`
- feeling: spotlight, focus, relevance, looking back

Transformer:

- color: emerald
- hex: `#34D399`
- feeling: architecture, composition, system, flow

Sampling:

- color: sky blue
- hex: `#38BDF8`
- feeling: branching choices, probability, possibility

Quantization:

- color: pink
- hex: `#F472B6`
- feeling: compression, bit-level transformation, lossy precision

### Soft concept tints

Every concept color should also have a soft translucent version used for backgrounds, chips, glows, filled regions, and inactive diagram areas.

These soft tints should feel like colored light on dark glass. They should usually be around 8–14% opacity.

Examples:

- tokens soft: cyan at low opacity
- embeddings soft: violet at low opacity
- neurons soft: orange at low opacity
- training soft: rose at low opacity
- attention soft: yellow at low opacity
- transformer soft: emerald at low opacity
- sampling soft: sky blue at low opacity
- quantization soft: pink at low opacity

Use full-strength colors only for the active or selected state. Use soft tints for context.

### Gradients

Gradients should be used carefully and deliberately.

Recommended gradients:

Tokens to embeddings:

- cyan to violet
- use when showing token IDs becoming vectors

Attention to transformer:

- yellow to emerald
- use when showing attention becoming part of the full architecture

Training to sampling:

- rose to sky blue
- use when showing learned model behavior becoming generation

Brand gradient:

- cyan to violet
- use for identity-level elements

Gradients should not be used on every button or card. They should mark important conceptual transitions.

### Glow and light

Use glow as an explanatory device.

Good glow usage:

- active token
- selected vector point
- current neuron firing
- active attention connection
- currently flowing data path
- loss curve highlight
- generated token choice

Bad glow usage:

- every card
- every heading
- every border
- large blurry neon blobs everywhere

Glows should be soft and low-opacity. The site should feel elegant, not like a nightclub.

### Color semantics

Colors should mean something.

Cyan means tokens and discrete text chunks.

Violet means embedding space and abstract representation.

Orange means neurons and activation.

Rose means training, loss, correction, and error.

Yellow means attention and focus.

Emerald means transformer structure and successful information flow.

Sky blue means sampling and probabilistic branching.

Pink means quantization and compression.

Do not randomly swap these colors between chapters.

### Accessibility

Maintain strong contrast for all readable text.

Do not rely on color alone to explain meaning. Important distinctions should also use shape, labels, position, motion, or icons.

For example:

- tokens can be small rounded pills
- embeddings can be points in space
- neurons can be circles or nodes
- attention can be beams or weighted lines
- training can use curves and arrows
- sampling can use branching paths
- quantization can use stepped/blocky visuals

Colored text on dark backgrounds should be tested for readability. Yellow and orange especially should not be used for large paragraphs.

### General taste rules

Prefer:

- deep navy backgrounds
- soft glassy cards
- subtle borders
- atmospheric gradients
- restrained glow
- consistent concept colors
- smooth motion
- clear visual hierarchy

Avoid:

- rainbow overload
- random neon colors
- pure black backgrounds
- pure white text everywhere
- saturated gradients on every element
- low-contrast muted text
- making decorative color compete with educational diagrams

The final result should feel fun and inviting, but still serious enough that a developer, student, or conference audience would trust it.

Use these consistently.

Do not randomly recolor each visual.

---

## Typography

Use:

```text
body: Inter, system-ui, sans-serif
code/math: JetBrains Mono, ui-monospace
```

Type scale:

```text
hero title: 56–72px desktop
chapter title: 36–48px
section heading: 24–28px
body: 17–19px
small labels: 12–14px
formula/code: 14–16px
```

Line height:

```text
body: 1.55
labels: 1.25
```

---

## Layout

Desktop:

```text
max content width: 1200–1400px
left text column: 38–42%
right visual column: 58–62%
visual panel sticky within chapter
```

Mobile:

```text
stack text and visual
avoid complex sticky behavior
keep controls reachable
```

Spacing:

```text
chapter vertical padding: 120–180px
between explanation blocks: 32–48px
card padding: 20–32px
```

---

## Cards and surfaces

Use:

```text
border-radius: 20–28px
border: 1px solid rgba(255,255,255,0.08)
background: subtle gradient or glass surface
box-shadow: soft, minimal
```

Avoid strong shadows, glossy reflections, and noisy backgrounds.

---

## Motion

Use smooth educational motion.

Preferred:

```text
duration: 250–700ms
easing: cubic-bezier(0.22, 1, 0.36, 1)
```

Respect:

```text
prefers-reduced-motion
```

For reduced motion, replace long animations with direct state changes.

---

## Interaction style

Use:

```text
sliders
segmented controls
small toggles
hover cards
step buttons
play/pause buttons
reset buttons
```

Every interactive component should have a reset state.

Controls should update visuals immediately.

---

## Math style

Formulas should be close to the visuals they explain.

Variables in formulas should be hover-linked to visuals.

Example:

```text
scores = QKᵀ / √d
```

Hovering `Q` should highlight:

* the Q matrix
* the selected query vector
* relevant labels

Hovering `K` should highlight:

* the K matrix
* key vectors

---

## Accessibility requirements

Required:

* keyboard focus states
* controls must be keyboard usable
* no color-only meaning
* sufficient contrast
* text alternatives for key visuals
* reduced-motion support
* responsive layout
* readable mobile fallback

Use semantic HTML for headings and sections.

---

## Performance requirements

The site should remain fast.

Requirements:

* static build
* lazy-load interactive islands below the fold
* avoid loading all chapter JS at once
* keep generated JSON small
* avoid unnecessary WebGL
* use SVG for most diagrams
* use Canvas only for the NN playground or heavy fields
* keep animation loops paused when offscreen

Do not use a heavy charting library unless truly needed.

Preferred:

```text
custom SVG components
D3 only for scales/layout/math helpers
```

---

---

## Copywriting rules

Write for developers.

Style:

* concise
* concrete
* direct
* no hype
* no long academic paragraphs
* no unexplained acronyms
* examples before formulas
* formulas after intuition

Preferred pattern:

```text
One idea.
One visual.
One control.
One takeaway.
```

Each chapter should have a short “remember this” note.

Example:

```text
Remember: attention routes information between tokens; the MLP transforms information inside each token position.
```

---
