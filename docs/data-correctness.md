# Data correctness

## Data correctness rules

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
