# AGENTS.md

## Project

“The Anatomy of an LLM” is a static interactive scrolling explainer about how modern LLMs work.

Primary audience: software developers who know some AI basics and want a deep, visual, step-by-step understanding.

The site should feel like a polished interactive science explainer, not a dashboard, blog post, or slide deck.

See:
- `docs/product-vision.md`
- `docs/curriculum.md`
- `docs/visual-style.md`
- `docs/data-correctness.md`

## Hard constraints

- The final site must deploy as static files.
- No backend for core functionality.
- No runtime API calls for explanations.
- No live OpenAI/Hugging Face/model calls.
- Expensive/model-specific data must be generated offline into static JSON.
- Generated data must be deterministic.
- Toy data must be clearly labeled.
- Real GPT tokenization must use build-time `tiktoken`; do not guess token IDs.

## Preferred stack

- Astro
- Svelte interactive islands
- TypeScript
- SVG-first visuals
- Canvas only where useful
- D3 only for scales/layout/math helpers
- KaTeX for formulas
- Python for offline data generation

React may be used only if the existing codebase already chose React.

## Visual/component rules

Reuse shared primitives. Do not build each chapter as a one-off widget.

Required primitives:
- `TokenPill`
- `VectorBars`
- `MatrixGrid`
- `NetworkGraph`
- `ProbabilityBars`
- `FormulaCard`
- `ChapterShell`
- `StickyVisual`
- `SliderControl`
- `StepperControls`

Visuals must teach, not decorate. Avoid generic AI-glow/cyberpunk effects.

Use the style guide in `docs/visual-style.md`.

## Data correctness

See `docs/data-correctness.md`.

Important:
- Real tokenization: use `tiktoken` offline.
- Toy attention/embedding/training data: label clearly.
- RoPE: describe as rotating Q/K vector pairs using position-dependent frequencies.
- Avoid exact frontier-model claims unless sourced.

## Implementation workflow

Work in milestones.

1. Shell and style
2. Shared primitives
3. First chapters: tokenization, embeddings, neuron, tiny network
4. Output and learning: logits, backprop, optimizers
5. Attention: Q/K/V, attention math, multi-head, RoPE
6. Architecture/deployment concepts: transformer block, training phases, post-training, KV cache, quantization

For large tasks:
- create or update a plan in `plans/`
- work one milestone at a time
- keep diffs focused
- update the plan after each milestone
- list changed files, tests run, and open questions
- stop after the requested milestone

## Commands

Use the actual package manager.

Common commands:

```bash
npm install
npm run dev
npm run build
npm run preview
npm run generate:data
```

If Python scripts are used:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Testing checklist

Before a chapter is done:

* static build works
* no runtime API calls
* meaningful default view without interaction
* at least one meaningful interaction
* shared primitives reused where possible
* toy values labeled as toy
* tensor shapes shown where relevant
* mobile layout works
* reduced motion is respected
* reset state exists
* explanation is concise

## Git rules

Commit:

* source code
* small deterministic generated JSON
* scripts
* docs

Do not commit:

* `node_modules`
* `.astro`
* `.svelte-kit`
* `dist`
* `.env`
* virtualenvs
* caches

## Out of scope

Do not add unless explicitly requested:

* RAG
* agents
* tools
* prompt injection
* hallucination
* live LLM calls
* user accounts
* backend
* database
* analytics
* auth
* payments
