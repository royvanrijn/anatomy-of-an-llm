# Chapter writing style

## Goal

Chapters should read like a clear science explainer, not implementation notes.

Readers should understand:
- what this concept is
- why it exists
- what problem it solves
- what tradeoff it introduces

before seeing detailed controls, formulas, or encoder names.

---

## Required chapter opening pattern

Every chapter should start in this order:

1. **Concept in plain language (1-2 short paragraphs)**
2. **Why this step exists** in the LLM pipeline
3. **Why not alternatives?** (common "why not X?" question)
4. **Then** show controls, data details, and model-specific naming

---

## Language rules

- Avoid dropping implementation details in the first line (for example `o200k_base`, `QK^T`, or layer names).
- Keep chapter subtitles human-readable and concept-first.
- Introduce technical labels only after the conceptual framing is established.
- Prefer short sentences and concrete examples.

Bad:
- "How raw text becomes tokens and token IDs using o200k_base."

Better:
- "How language is split into model-readable pieces."

Then later:
- "This chapter uses the `o200k_base` encoding for examples."

---

## Intro rules (site-level)

Before Chapter 1, include an introduction block that:
- explains what this website is for
- explains how to read/navigate it
- sets expectation: from input text to next-token prediction

This intro is not a chapter and should not appear in chapter navigation.

---

## Definition of done (writing)

Before marking a chapter done, verify:
- a first-time reader can answer "what is this?" after the first screen
- a first-time reader can answer "why do we need this?" before controls
- chapter header/subtitle do not depend on unexplained jargon
- implementation details are present, but not front-loaded
