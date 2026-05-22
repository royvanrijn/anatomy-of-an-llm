# Implementation Progress Tracker

This file is the execution source of truth for building "The Anatomy of an LLM" end-to-end.

Use it to:
- track milestone progress and chapter readiness
- enforce automated quality gates
- require human-in-the-loop checkpoints at critical points
- keep implementation and documentation aligned

Related docs:
- `AGENTS.md`
- `docs/product-vision.md`
- `docs/curriculum.md`
- `docs/visual-style.md`
- `docs/data-correctness.md`

---

## How To Use This Tracker

Update this file in every milestone PR:
- move task statuses
- add dates and owner initials where useful
- record what passed/failed in quality gates
- log any assumptions changed at human checkpoints

Status legend:
- `[ ]` not started
- `[-]` in progress
- `[x]` done
- `[!]` blocked

---

## Global Quality Gates

These gates apply to every milestone and every chapter before marking done.

### Automated Gates (must pass)

- [x] `npm run build` succeeds (static output works)
- [x] `npm run generate:data` succeeds (deterministic data generation)
- [x] no runtime API calls for explanations (static-first compliance)
- [ ] lint/type checks pass (if present in project scripts)
- [ ] smoke tests pass (if present in project scripts)
- [x] generated JSON files are deterministic across repeated runs for touched datasets

### Human Checkpoints (must be reviewed and signed off)

- [ ] Concept correctness review (math/explanations/data labels)
- [ ] Pedagogy review (clarity, cognitive flow, concise explanation)
- [ ] Writing flow review (concept first, then why, then implementation details)
- [ ] Visual design review (style guide compliance, consistency, signal-over-decoration)
- [ ] Interaction UX review (default meaningful state, controls intuitive, reset exists)
- [ ] Accessibility review (keyboard reachability, reduced motion, mobile readability)

Sign-off template per checkpoint:
- Reviewer:
- Date:
- Notes:
- Decision: approve / changes requested

---

## Milestone Overview

1. Shell and style
2. Shared primitives
3. First chapters: tokenization, embeddings, neuron, neural network
4. Output and learning: logits, backprop, optimizers
5. Attention: Q/K/V, attention math, multi-head, RoPE
6. Architecture/deployment concepts: transformer block, training phases, post-training, KV cache, quantization

---

## Milestone 1 - Shell And Style

Goal: foundation layout, scroll narrative shell, chapter framing, style tokens.

### Tasks

- [x] Create chapter page shell and section structure
- [x] Implement shared theme tokens from `docs/visual-style.md`
- [x] Implement chapter progress/navigation scaffold
- [x] Implement `ChapterShell` primitive
- [x] Implement `StickyVisual` primitive
- [x] Add reduced-motion baseline behavior
- [x] Add mobile-first responsive layout rules

### Automated Gates

- [x] build passes
- [x] static build has no runtime explanation API dependencies
- [x] baseline visual smoke checks pass

### Human Checkpoints

- [x] Assumptions checkpoint: chapter flow and narrative pacing
- [x] Visual checkpoint: overall look matches "interactive science explainer"
- [x] UX checkpoint: default state is meaningful without interaction

---

## Milestone 2 - Shared Primitives

Goal: reusable, coherent component kit for all chapters.

### Required Primitives

- [x] `TokenPill`
- [x] `VectorBars`
- [x] `MatrixGrid`
- [x] `NetworkGraph`
- [x] `ProbabilityBars`
- [x] `FormulaCard`
- [x] `SliderControl`
- [x] `StepperControls`

### Tasks

- [x] Define shared props/interfaces in TypeScript
- [x] Implement consistent visual states (default/hover/active/disabled)
- [x] Add accessibility semantics and keyboard behavior where applicable
- [x] Add deterministic demo fixtures for each primitive
- [x] Create primitive gallery/test page for manual verification

### Automated Gates

- [x] build passes
- [x] component-level smoke checks pass
- [x] fixture rendering checks pass (if test harness exists)

### Human Checkpoints

- [x] Design consistency checkpoint across all primitives
- [ ] Interaction quality checkpoint (controls feel predictable)
- [ ] Accessibility checkpoint with keyboard-only walkthrough

---

## Milestone 3 - First Chapters (1-4)

### Chapter 1 - Real GPT Tokenization

- [x] Offline data generator uses `tiktoken` + `o200k_base`
- [x] Show sentence, token boundaries, visible whitespace, token pieces, token IDs, token count
- [x] Add sentence dropdown and ID/whitespace toggles
- [x] Label toy tokenization clearly if free-text mode exists (no free-text mode in current implementation)

Automated:
- [x] tokenization dataset generated deterministically
- [x] chapter build/render checks pass

Human:
- [x] correctness checkpoint: token IDs verified against generated data
- [x] pedagogy checkpoint: tokenizer behavior is obvious at a glance

### Chapter 2 - Token IDs To Embedding Vectors

- [x] Show token ID -> embedding row -> vector flow
- [x] Show long vector bars
- [x] Add 2D/3D projection toggle with clear "simplified projection" label
- [x] Link selected token from Chapter 1 where possible (same sentence set and token-level selector)

Automated:
- [x] embedding fixtures generated and loaded statically
- [x] chapter build/render checks pass

Human:
- [ ] assumption checkpoint: projection messaging is not misleading
- [ ] visual checkpoint: real vector vs projection distinction is clear

### Chapter 3 - Single Neuron And Activations

- [x] Implement formula and live output updates
- [x] Add sliders for inputs/weights/bias
- [x] Add activation selector: linear/sigmoid/tanh/ReLU/GELU/SiLU
- [x] Show marker on activation curve and short per-activation explanation

Automated:
- [x] deterministic activation calculation tests pass
- [x] chapter build/render checks pass

Human:
- [ ] correctness checkpoint: activation formulas and behavior reviewed
- [ ] pedagogy checkpoint: pros/cons text is concise and accurate

### Chapter 4 - Tiny Neural Network (Graph + Matrix Math)

- [x] Build 3-pane layout (dataset / graph / matrix math)
- [ ] Add datasets: circle/spiral/xor/two blobs
- [x] Add controls: architecture and activation for forward-pass exploration
- [x] Implement hover linking between graph edges and matrix cells
- [x] Show node activations and synchronized `X·W+b` / `activation(Z)=A` views
- [x] Scope changed: chapter now focuses on dense layer forward pass instead of online toy training

Automated:
- [x] deterministic forward-pass values (fixed weights/biases) render statically
- [x] interaction smoke checks pass

Human:
- [ ] assumptions checkpoint: training behavior explanation is not over-claiming
- [ ] UX checkpoint: hover-linking is understandable and not visually noisy

---

## Milestone 4 - Output And Learning (5-7)

### Chapter 5 - Logits, Softmax, Temperature, Sampling

- [x] Show hidden vector -> logits -> softmax -> probabilities -> sampled token
- [x] Include tiny fixed vocab demo
- [x] Add temperature slider, sample button, 20-sample run, greedy/sampling toggle
- [x] Optional: top-k/top-p/seed controls

Automated:
- [x] softmax/temperature numeric checks pass
- [x] sampling determinism checks pass for fixed seed paths

Human:
- [ ] correctness checkpoint: temperature interpretation validated
- [ ] pedagogy checkpoint: logits vs probabilities confusion eliminated

### Chapter 6 - Loss, Gradients, Backpropagation

- [x] Build forward pass + wrong prediction + target + loss view
- [x] Visualize gradient flow backward through layers
- [x] Add stepper for forward/backward/update phases
- [x] Show tensor shapes where relevant

Automated:
- [x] gradient sanity tests pass on toy network
- [x] deterministic update-step fixtures pass

Human:
- [ ] correctness checkpoint: signs/magnitudes intuition reviewed
- [ ] UX checkpoint: phase stepping is easy to follow

### Chapter 7 - Optimizers

- [x] Implement optimizer comparison (SGD, momentum, Adam-style conceptual views)
- [x] Show how updates differ on same toy loss landscape
- [x] Keep explicit toy-data labeling

Automated:
- [x] optimizer update-rule tests pass
- [x] deterministic trajectory fixtures pass

Human:
- [ ] assumptions checkpoint: optimizer claims stay conceptual and accurate
- [ ] visual checkpoint: differences are clearly legible

---

## Milestone 5 - Attention (8-11)

### Chapter 8 - Q/K/V Intuition

- [x] Explain token projection into Q, K, V vectors
- [x] Show why query-key similarity selects value mixing
- [x] Use small sequence and dimensions with shape callouts

Automated:
- [x] deterministic Q/K/V toy fixture checks pass

Human:
- [ ] correctness checkpoint: intuition matches later math chapter

### Chapter 9 - Attention Matrix Math

- [ ] Implement score matrix `QK^T / sqrt(d_k)`
- [ ] Show softmax over rows and weighted value mixing
- [ ] Animate/step through matrix construction

Automated:
- [ ] attention matrix math tests pass
- [ ] shape validation tests pass

Human:
- [ ] pedagogy checkpoint: row-wise softmax behavior clearly understood

### Chapter 10 - Multi-Head Attention

- [ ] Show head splitting, per-head attention, concatenation, output projection
- [ ] Visualize different heads focusing differently

Automated:
- [ ] multi-head shape and concat tests pass

Human:
- [ ] assumptions checkpoint: per-head behavior described as illustrative/toy where needed

### Chapter 11 - RoPE Positional Encoding

- [ ] Implement conceptual RoPE correctly (Q/K rotation, dim pairs, position frequencies)
- [ ] Show relative-position effect on dot products
- [ ] Explicitly avoid "just add position embeddings" framing

Automated:
- [ ] RoPE toy rotation math tests pass

Human:
- [ ] correctness checkpoint: RoPE explanation reviewed against `docs/data-correctness.md`

---

## Milestone 6 - Architecture And Deployment Concepts (12-16)

### Chapter 12 - Full Transformer Block And Modern Scale

- [ ] Compose attention + MLP + residuals + norms into one block flow
- [ ] Add "toy scale vs real scale" cards without unsourced exact frontier claims

Automated:
- [ ] chapter build/render checks pass

Human:
- [ ] assumptions checkpoint: scaling statements are sourced/qualitative only

### Chapter 13 - Training Phases And Grokking

- [ ] Show phase progression conceptually (fit, generalize, delayed jumps)
- [ ] Keep numerical examples clearly labeled as toy

Automated:
- [ ] deterministic phase curve fixtures pass

Human:
- [ ] pedagogy checkpoint: grokking caveats are explicit

### Chapter 14 - Pretraining, Instruction Tuning, Preference Tuning

- [ ] Explain each stage and how objectives differ
- [ ] Show data/behavior shift at each stage conceptually

Automated:
- [ ] chapter build/render checks pass

Human:
- [ ] assumptions checkpoint: terminology and sequencing are accurate and non-hyped

### Chapter 15 - Context Window And KV Cache

- [ ] Explain token window limits and truncation behavior
- [ ] Show decode loop with and without KV cache
- [ ] Visualize compute reuse conceptually

Automated:
- [ ] deterministic decode-step fixtures pass

Human:
- [ ] correctness checkpoint: cache behavior and limitations validated

### Chapter 16 - Quantization

- [ ] Show high-precision to low-bit mapping
- [ ] Visualize value snapping and accuracy/efficiency trade-offs
- [ ] Label toy quantization examples clearly

Automated:
- [ ] quantization mapping tests pass
- [ ] deterministic fixtures pass

Human:
- [ ] assumptions checkpoint: trade-off explanations are balanced and accurate

---

## Cross-Chapter Integration Tasks

- [ ] Ensure chapter-to-chapter state handoff where pedagogically useful
- [ ] Standardize chapter intro/outro and recap pattern
- [ ] Ensure every chapter has reset control
- [ ] Ensure every chapter has meaningful default state
- [ ] Ensure every chapter shows tensor shapes where relevant
- [ ] Ensure toy-vs-real labeling is present everywhere needed
- [ ] Verify mobile layout and reduced-motion behavior for all chapters

Automated:
- [ ] full-site static build passes
- [ ] full-site smoke tests pass

Human:
- [ ] end-to-end narrative walkthrough checkpoint
- [ ] visual coherence checkpoint across all chapters

---

## Documentation Maintenance Cadence

Per PR:
- [ ] update this file (`plans/progress.md`)
- [ ] update any changed assumptions in relevant docs
- [ ] list changed files, tests run, open questions in PR description

Per milestone completion:
- [ ] add milestone summary note below
- [ ] record unresolved risks and follow-up tasks

### Milestone Summary Log

#### Milestone 1 Summary
- Date: 2026-05-21
- Owner: Roy + Codex
- Completed: Astro/Svelte project bootstrap, base layout, theme tokens, chapter nav scaffold, `ChapterShell`, `StickyVisual`, responsive and reduced-motion baseline, deterministic data-generation stub.
- Automated gates: `npm run build` passed, `npm run generate:data` passed, deterministic hash verified over repeated runs, no runtime explanation APIs introduced.
- Human checkpoint outcomes: Pending.
- Open risks: visual polish validation and narrative pacing still need human review before marking Milestone 1 fully complete.

#### Milestone 2 Summary
- Date:
- Owner:
- Completed:
- Automated gates:
- Human checkpoint outcomes:
- Open risks:

#### Milestone 3 Summary
- Date:
- Owner:
- Completed:
- Automated gates:
- Human checkpoint outcomes:
- Open risks:

#### Milestone 4 Summary
- Date:
- Owner:
- Completed:
- Automated gates:
- Human checkpoint outcomes:
- Open risks:

#### Milestone 5 Summary
- Date:
- Owner:
- Completed:
- Automated gates:
- Human checkpoint outcomes:
- Open risks:

#### Milestone 6 Summary
- Date:
- Owner:
- Completed:
- Automated gates:
- Human checkpoint outcomes:
- Open risks:
