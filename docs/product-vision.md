# Product vision

# Project: The Anatomy of an LLM

This project is a static, interactive scrolling explainer about the internals of modern Large Language Models.

The goal is to teach developers how LLMs work from the ground up:

- text tokenization
- token IDs
- embedding vectors
- neurons and activation functions
- feed-forward neural networks and matrix math
- logits, softmax, temperature, and sampling
- loss, gradients, and backpropagation
- optimizers
- Q/K/V intuition
- multi-head attention math
- RoPE positional encoding
- Transformer blocks
- training phases and grokking
- pre-training, instruction tuning, preference tuning
- context windows and KV cache
- quantization

The site should feel like a polished interactive science explainer, not a dashboard, not a blog post, and not a slide deck.

Primary audience: software developers who know some AI basics but want a deep, visual, step-by-step understanding.

---

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
```

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
    04-neural-network/
    05-logits-sampling/
    06-backprop/
    07-optimizers/
    08-qkv-intuition/
    09-multi-head-attention/
    10-rope/
    11-transformer-block/
    12-training-phases/
    13-post-training/
    14-kv-cache/
    15-quantization/

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

---

# Definition of done

The first complete version should be:

* fully static
* visually coherent
* responsive
