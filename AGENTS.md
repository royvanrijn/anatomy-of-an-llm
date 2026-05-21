# AGENTS.md

## Project: The Anatomy of an LLM

This project is a static, interactive scrolling explainer about the internals of modern Large Language Models.

The goal is to teach developers how LLMs work from the ground up:

- text tokenization
- token IDs
- embedding vectors
- neurons and activation functions
- tiny neural networks and matrix math
- logits, softmax, temperature, and sampling
- loss, gradients, and backpropagation
- optimizers
- Q/K/V intuition
- attention matrix math
- multi-head attention
- RoPE positional encoding
- Transformer blocks
- training phases and grokking
- pretraining, instruction tuning, preference tuning
- context windows and KV cache
- quantization

The site should feel like a polished interactive science explainer, not a dashboard, not a blog post, and not a slide deck.

Primary audience: software developers who know some AI basics but want a deep, visual, step-by-step understanding.

---

# Core principles

## 1. Static-first

The final website must be deployable as static files.

No backend is allowed for core functionality.

Allowed:

- static HTML/CSS/JS
- static JSON files
- precomputed data generated before build
- browser-side interaction
- SVG/canvas animations

Not allowed:

- runtime API calls for core explanations
- server-side tokenization
- server-side model inference
- hidden backend dependencies
- live calls to OpenAI, Hugging Face, etc.

If data is expensive, model-specific, or tokenizer-specific, generate it offline into JSON.

---

## 2. Precompute data offline

Use scripts for deterministic generated data.

Preferred:

```text
scripts/
  generate-tokenization.py
  generate-embeddings.py
  generate-attention.py
  generate-backprop.py
  generate-quantization.py
````

Output should go into:

```text
public/data/
  tokenization/
  embeddings/
  nn/
  attention/
  training/
  quantization/
```

Generated JSON should be small, readable, deterministic, and committed to the repository unless it becomes too large.

For real GPT tokenization examples, use `tiktoken` offline during generation.

Do not fake real tokenization. If a demo uses toy tokenization, label it clearly as toy data.

---

## 3. Toy first, real scale second

Each hard concept should be explained using tiny numbers first.

Use examples such as:

```text
sequence length = 8
model dimension = 4 or 16
heads = 2
layers = 2
```

Then show how the same concept scales to real LLMs.

Do not try to simulate a real model in the browser.

---

## 4. Visuals must teach, not decorate

Animations should reveal structure.

Good animations:

* token boundaries appearing
* token IDs flipping into vectors
* vector bars changing
* matrix rows/columns highlighting
* attention weights flowing between tokens
* probability bars sharpening/flattering with temperature
* gradients flowing backward
* quantized values snapping to discrete levels

Avoid:

* decorative particles
* random floating blobs
* constant pulsing
* generic AI-glow backgrounds
* cyberpunk noise
* animations that do not explain anything

---

## 5. Reuse visual primitives

Do not build every chapter as a one-off custom widget.

Create reusable components first.

Required primitives:

```text
TokenPill
VectorBars
MatrixGrid
NetworkGraph
ProbabilityBars
FormulaCard
ChapterShell
StickyVisual
SliderControl
StepperControls
```

Every chapter should reuse these components where possible.

This is critical. The site should feel coherent.

---

# Recommended stack

Preferred stack:

```text
Astro
Svelte interactive islands
TypeScript
SVG-first custom visuals
Canvas only where useful
D3 for scales/math helpers, not full chart ownership
KaTeX for formulas
Python for offline data generation
Static JSON for generated data
```

React may be used instead of Svelte only if the existing codebase already chose React.

If using Astro:

* `.astro` files should handle page layout and mostly-static content.
* Svelte components should handle interactive visual islands.
* Keep islands isolated and lazy-load where possible.

---

# Project structure

Suggested structure:

```text
src/
  components/
    ChapterShell.astro
    StickyVisual.astro

    TokenPill.svelte
    VectorBars.svelte
    MatrixGrid.svelte
    NetworkGraph.svelte
    ProbabilityBars.svelte
    FormulaCard.svelte
    SliderControl.svelte
    StepperControls.svelte

  chapters/
    01-tokenization/
    02-embeddings/
    03-neuron/
    04-tiny-network/
    05-logits-sampling/
    06-backprop/
    07-optimizers/
    08-qkv-intuition/
    09-attention-math/
    10-multi-head/
    11-rope/
    12-transformer-block/
    13-training-phases/
    14-post-training/
    15-kv-cache/
    16-quantization/

  data/
    types.ts

  styles/
    global.css
    theme.css
    typography.css

public/
  data/
    tokenization/
    embeddings/
    nn/
    attention/
    training/
    quantization/

scripts/
  generate-tokenization.py
  generate-embeddings.py
  generate-attention.py
  generate-backprop.py
  generate-quantization.py
```

---

# Final chapter order

Implement chapters in this order:

```text
1. Real GPT tokenization
2. Token IDs to embedding vectors
3. Single neuron and activations
4. Tiny neural network: graph plus matrix math
5. Logits, softmax, temperature, and sampling
6. Loss, gradients, and backpropagation
7. Optimizers as update strategies
8. Q/K/V intuition
9. Attention matrix math
10. Multi-head attention
11. RoPE positional encoding
12. Full Transformer block and modern scale
13. Training phases and grokking
14. Pretraining, instruction tuning, preference tuning
15. Context window and KV cache
16. Quantization
```

Do not add RAG, agents, tools, prompt injection, or hallucination chapters unless explicitly requested later.

Those topics are out of scope for the first version.

---

# Chapter requirements

## Chapter 1 — Tokenization

Use a real GPT tokenizer example.

Primary sentence:

```text
If the human brain were so simple that we could understand it, we would be so simple that we couldn't.
```

Use build-time `tiktoken` with `o200k_base`.

Show:

* raw sentence
* token boundaries
* whitespace markers
* token pieces
* token IDs
* token count

Whitespace should be visible:

```text
" hyper" -> "·hyper"
```

Interaction:

* example sentence dropdown
* show/hide token IDs
* show/hide whitespace markers
* optional tokenizer comparison if data exists

Important:

If implementing free text input without a real browser tokenizer, clearly label it as toy tokenization.

---

## Chapter 2 — Vector embeddings

Show the real conceptual step:

```text
token ID
→ embedding table row
→ high-dimensional vector
```

First show a long vector as bars.

Then show a 2D or 3D projection only as intuition.

Clearly label the projection:

```text
Simplified 2D projection, not the real model space.
```

Interactions:

* select a token from Chapter 1
* highlight row in embedding matrix
* show vector bars
* toggle real-vector view / toy projection

---

## Chapter 3 — Single neuron and activations

Show:

```text
z = w₁x₁ + w₂x₂ + w₃x₃ + b
output = activation(z)
```

Controls:

* input sliders
* weight sliders
* bias slider
* activation dropdown

Activation options:

```text
linear
sigmoid
tanh
ReLU
GELU
SiLU / Swish
```

Visual behavior:

* neuron glows based on output
* marker moves across activation curve
* output updates live
* for each activation function, when selected, display a short description of how it works, what it tries to solve, what the problems are with it

---

## Chapter 4 — Tiny neural network: graph plus matrix math

This should resemble TensorFlow Playground, but with synchronized matrix math.

Layout:

```text
left: 2D classification plot
middle: network graph
right: matrix calculation
```

Datasets:

```text
circle
spiral
xor
two blobs
```

Controls:

* dataset selector
* hidden layer count
* neurons per layer
* activation
* learning rate
* train / pause / reset
* selected data point

Matrix view:

```text
X · W + b = Z
activation(Z) = A
```

Hover linking is required:

* hover graph edge -> highlight matrix cell
* hover matrix cell -> highlight graph edge
* hover node -> show activation value

---

## Chapter 5 — Logits, softmax, temperature, and sampling

Show the full path:

```text
final hidden vector
→ vocabulary projection
→ logits
→ softmax
→ probabilities
→ sampled next token
```

Use tiny vocabulary:

```text
" calm"
" inside"
" outside"
" cold"
" angry"
"."
","
```

Controls:

* temperature slider
* sample button
* generate 20 samples
* greedy / sampling toggle
* optional top-k and top-p controls
* optional seed selector

Show both logits and probabilities.

Temperature should visibly sharpen or flatten the probability bars.

---

## Chapter 6 — Loss, gradients, and backpropagation

Answer:

```text
The model predicted wrong. How do the weights change?
```

Use a tiny two-hidden-layer network.

Show:

* forward pass
* wrong prediction
* correct target token
* loss
* backward pass
* gradients
* weight update
* improved next prediction

Use “blame flowing backward” as the visual metaphor.

Show chain rule lightly:

```text
∂Loss/∂w = ∂Loss/∂output · ∂output/∂hidden · ∂hidden/∂w
```

Controls:

* choose correct target token
* run forward pass
* run backward pass
* learning rate slider
* apply update
* repeat one step

---

## Chapter 7 — Optimizers as update strategies

Do not make this a full optimizer theory chapter.

Main idea:

```text
Backprop gives gradients.
The optimizer decides how to turn gradients into weight updates.
```

Show a matrix update pipeline:

```text
W before
→ gradient matrix
→ optimizer-transformed update
→ W after
```

Optimizer options:

```text
SGD
SGD + momentum
Adam
AdamW
Muon-like matrix update, optional advanced mode
```

Controls:

* optimizer dropdown
* learning rate slider
* momentum slider
* weight decay slider
* one update / ten updates
* for each selected optimizer, display a short text describing how it works, why it was created, pros cons, etc

Make Adam visually show different step sizes per weight.

Make AdamW visually show separate weight decay.

Muon-like mode is advanced and optional.

---

## Chapter 8 — Q/K/V intuition

Explain Q/K/V before the attention math.

Use sentence:

```text
If the human brain were so simple that we could understand it, we would be so simple that we couldn't.
```

Metaphors:

```text
Query = what am I looking for?
Key = what do I advertise?
Value = what information do I offer?
```

Use three synchronized visual modes:

```text
conference badges
database lookup
spotlight mixer
```

For `it`:

```text
Query: “I need the thing being described.”
```

For `brain`:

```text
Key: “I am an object that can be simple.”
Value: semantic information about brains.
```

Interaction:

* select token
* switch metaphor
* hover token to show Q/K/V cards
* adjust attention score in toy mode

---

## Chapter 9 — Attention matrix math

Show:

```text
Q = XWq
K = XWk
V = XWv

scores = QKᵀ / √d
weights = softmax(scores)
output = weights · V
```

Panels:

```text
token row
Q/K dot product bars
attention heatmap
value mixing output vector
```

Controls:

* select token
* highlight selected row in attention matrix
* show dot products
* show softmax weights
* show weighted value sum
* toggle number view / heatmap view

Always show tensor shapes.

Toy example:

```text
X: 8 × 4
Q: 8 × 4
K: 8 × 4
V: 8 × 4
scores: 8 × 8
output: 8 × 4
```

---

## Chapter 10 — Multi-head attention

Show multiple attention heads in parallel.

Visual:

```text
Head 1 heatmap
Head 2 heatmap
Head 3 heatmap
Head 4 heatmap
```

Toy labels:

```text
Head 1: nearby words
Head 2: reference resolution
Head 3: punctuation/structure
Head 4: phrase continuation
```

Include caveat:

```text
Real heads are not always this cleanly interpretable.
```

Show:

```text
head outputs
→ concatenate
→ linear projection
→ combined output
```

Controls:

* select head
* toggle head visibility
* compare heatmaps
* show concatenation
* show output projection

---

## Chapter 11 — RoPE positional encoding

Explain correctly.

Start with:

```text
dog bites man
man bites dog
```

RoPE rotates query and key vectors based on token position.

Show:

* vector split into 2D pairs
* each pair rotates by position-dependent angle
* different pairs rotate at different frequencies

Controls:

* position slider
* dimension-pair selector
* show two token positions `m` and `n`
* show relative offset `m - n`
* toggle plain vectors / RoPE-rotated vectors

Key message:

```text
RoPE encodes position by rotating Q and K vectors, making attention sensitive to relative token positions.
```

Do not describe RoPE as simply adding a position vector.

---

## Chapter 12 — Full Transformer block and modern scale

Show full block:

```text
input token vectors
→ RMSNorm / LayerNorm
→ causal self-attention
→ residual add
→ RMSNorm / LayerNorm
→ MLP / SwiGLU
→ residual add
→ output token vectors
```

Interactions:

* click component to expand
* show what it does
* show tensor shape
* show rough parameter contribution
* show rough compute contribution

Include mini visuals:

Norm:

```text
messy vector -> normalized vector
```

Residual:

```text
x ───────────────┐
                 +
block(x) ────────┘
```

MLP:

```text
token vector
→ expand
→ activation/gate
→ compress
```

Scale cards:

```text
Toy demo:
layers = 2
d_model = 16
heads = 2

Small open model:
layers = dozens
d_model = thousands
parameters = billions

Frontier-scale model:
many more layers
very wide vectors
huge training corpus
massive compute
```

Avoid exact frontier model claims unless separately sourced.

---

## Chapter 13 — Training phases and grokking

Show a training curve with a slider.

Phases:

```text
1. random predictions
2. common surface patterns
3. syntax and local structure
4. useful internal representations
5. stronger capabilities
```

Grokking view:

```text
training accuracy rises early
validation accuracy stays low
then validation accuracy suddenly jumps
```

Controls:

* training-step slider
* normal learning / overfitting / grokking toggle
* train vs validation curve
* sample prediction at current step

Keep this visual and conceptual.

Do not overclaim grokking as the standard behavior of all LLM training.

---

## Chapter 14 — Pretraining, instruction tuning, preference tuning

Show three-stage pipeline:

```text
large text/code corpus
→ base model

instruction examples
→ instruction-tuned model

preference comparisons
→ assistant-style model
```

Use same prompt in three modes:

```text
Explain why the sky is blue.
```

Modes:

```text
base model: plausible continuation, not necessarily helpful
instruction-tuned: answers directly
preference-tuned: more helpful, careful, formatted
```

Key message:

```text
Pretraining creates broad capability. Post-training shapes behavior.
```

---

## Chapter 15 — Context window and KV cache

Show autoregressive generation:

```text
prompt tokens
→ predict next token
→ append token
→ repeat
```

KV cache visual:

Without cache:

```text
recompute keys and values for all previous tokens every step
```

With cache:

```text
store K/V from previous tokens
reuse them
compute only new token’s K/V
```

Controls:

* context length slider
* generated tokens slider
* KV cache on/off
* compute cost display
* memory cost display

Use relative bars, not exact model-specific claims.

---

## Chapter 16 — Quantization

Show FP32 matrix:

```text
[ 0.18374  -1.20491   0.00712 ]
[ 2.91822   0.44201  -0.99123 ]
```

Show INT8 matrix:

```text
[  8   -53    0 ]
[127    19  -43 ]

scale = 0.02298
```

Show reconstruction:

```text
int8 value × scale ≈ original value
```

Controls:

* FP32 / FP16 / BF16 / INT8 / INT4
* per-tensor scale / per-channel scale
* reconstructed values
* absolute error heatmap
* parameter count slider

Size calculator example:

```text
7B parameters:

FP32: 28 GB
FP16/BF16: 14 GB
INT8: 7 GB
INT4: 3.5 GB
```

Key message:

```text
Quantization stores weights with fewer bits. The challenge is preserving enough numerical structure.
```

---

# Visual style guide

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

# Accessibility requirements

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

# Performance requirements

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

# Data correctness rules

## Real vs toy data

Always label data source.

Examples:

```text
Real tokenization using o200k_base.
```

```text
Toy attention values for explanation.
```

Do not imply toy data came from a real model.

## Tokenization

If showing real GPT tokenization, use build-time `tiktoken`.

Do not manually guess token IDs.

## Model sizes

Avoid exact claims about frontier models unless sourced.

Use qualitative scale cards or configurable examples.

## RoPE

Must be implemented conceptually correctly:

* rotates Q and K vectors
* uses pairs of dimensions
* different frequencies per pair
* makes dot products depend on relative position

Do not say RoPE simply adds positional embeddings.

---

# Copywriting rules

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

# Implementation workflow

## Recommended build order

Build in milestones.

### Milestone 1 — shell and style

* project setup
* global theme
* responsive layout
* ChapterShell
* StickyVisual
* typography
* visual card style

### Milestone 2 — primitives

* TokenPill
* VectorBars
* MatrixGrid
* FormulaCard
* SliderControl
* StepperControls
* ProbabilityBars

### Milestone 3 — first chapters

Implement:

```text
1. Tokenization
2. Embeddings
3. Single neuron
4. Tiny matrix multiplication demo
```

Do not start attention until the visual language is stable.

### Milestone 4 — output and learning

Implement:

```text
5. Logits / softmax / temperature / sampling
6. Backpropagation
7. Optimizers
```

### Milestone 5 — attention

Implement:

```text
8. Q/K/V intuition
9. Attention matrix math
10. Multi-head attention
11. RoPE
```

### Milestone 6 — full architecture and deployment concepts

Implement:

```text
12. Transformer block
13. Training phases
14. Post-training
15. KV cache
16. Quantization
```

---

# Testing checklist

Before considering a chapter done:

* Does it work without touching controls?
* Does it have at least one meaningful interaction?
* Does it reuse shared primitives?
* Are toy values labeled as toy values?
* Are tensor shapes shown where relevant?
* Does it work on mobile?
* Does it respect reduced motion?
* Can the user reset the demo?
* Is the visual style consistent?
* Is the explanation concise?
* Are there no runtime API calls?
* Does the static build work?

---

# Commands

Use the project’s actual package manager.

If using npm:

```bash
npm install
npm run dev
npm run build
npm run preview
```

If Python scripts are used:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python scripts/generate-tokenization.py
python scripts/generate-embeddings.py
python scripts/generate-attention.py
python scripts/generate-backprop.py
python scripts/generate-quantization.py
```

Add package scripts where useful:

```json
{
  "scripts": {
    "generate:data": "python scripts/generate-tokenization.py && python scripts/generate-embeddings.py && python scripts/generate-attention.py && python scripts/generate-backprop.py && python scripts/generate-quantization.py",
    "dev": "astro dev",
    "build": "npm run generate:data && astro build",
    "preview": "astro preview"
  }
}
```

Adjust commands to match the chosen stack.

---

# Git rules

Commit:

* source code
* static content
* small deterministic generated JSON files
* build scripts
* documentation

Do not commit:

* `node_modules`
* `.astro`
* `.svelte-kit`
* `dist`
* `.env`
* Python virtual environments
* caches

Generated JSON should be committed if small and deterministic.

---

# Out of scope for now

Do not add these unless requested:

* RAG chapter
* tool-use chapter
* agent chapter
* prompt injection chapter
* hallucination chapter
* live LLM calls
* user accounts
* backend
* database
* analytics
* auth
* payments

---

# Definition of done

The first complete version should be:

* fully static
* visually coherent
* responsive
* accessible enough for public use
* deployable from `dist/`
* explain the full LLM path from text to quantized inference
* use real GPT tokenization examples
* use toy data clearly labeled for internals
* contain no hidden runtime backend assumptions

The user should be able to scroll through the site and understand the internal machinery of an LLM step by step.
