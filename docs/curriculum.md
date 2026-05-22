# Curriculum

## Final chapter order

Implement chapters in this order:

```text
1. Real GPT tokenization
2. Token IDs to embedding vectors
3. Single neuron and activations
4. Neural network: graph plus matrix math
5. Logits, softmax, temperature, and sampling
6. Loss, gradients, and backpropagation
7. Optimizers as update strategies
8. Q/K/V intuition
9. Attention matrix math
10. RoPE positional encoding
11. Full Transformer block and modern scale
12. Training phases and grokking
13. Pre-training, instruction tuning, preference tuning
14. Context window and KV cache
15. Quantization
```

Do not add RAG, agents, tools, prompt injection, or hallucination chapters unless explicitly requested later.

Those topics are out of scope for the first version.

---

## Chapter requirements

## Chapter 1 — Tokenization (implemented)

Purpose: explain why text must become token IDs before any model math.

Data/source:

* real tokenizer output generated offline with `tiktoken`
* encoding: `o200k_base`
* deterministic static JSON

Current interaction:

* example sentence dropdown
* toggle token IDs on/off
* toggle visible whitespace markers on/off
* tokenized result chips with boundaries and IDs

Current content focus:

* tokenization as conversion from text -> token pieces -> token IDs
* why not only words or only bytes
* tokenizer vocabulary is fixed, and downstream chapters consume token IDs

---

## Chapter 2 — Vector embeddings (implemented)

Purpose: show that token IDs are looked up into dense vectors.

Current interaction:

* select token from sentence context
* show embedding values directly as floating-point dimensions
* show a compact analogy view for vector relationships

Current content focus:

* embedding vectors are learned during training, not hand-coded
* this chapter uses a small toy width for readability
* real models use much wider vectors

---

## Chapter 3 — Single neuron and activations (implemented)

Purpose: explain weighted sums plus non-linearity.

Current interaction:

* input and weight controls
* activation-function selector
* live neuron diagram + activation curve marker

Current content focus:

* linear combination -> activation output
* why non-linearity is needed (stacked linear layers alone are insufficient)
* bias removed in this chapter for conceptual simplicity

---

## Chapter 4 — Neural Network (implemented)

Purpose: connect single neurons to matrix multiplication in a dense feed-forward network.

Current interaction:

* hover inputs, edges, hidden/output neurons, and matrix labels
* matrix inspector popover shows the relevant table/calculation in context
* bidirectional highlighting between graph elements and matrix cells

Current content focus:

* forward pass from input -> hidden -> output
* matrix shapes and per-connection contributions
* chapter scope is forward computation only (no live training loop here)

---

## Chapter 5 — Logits, softmax, temperature, and sampling (implemented)

Purpose: explain how hidden states become next-token probabilities and sampled output.

Pipeline shown:

```text
hidden -> vocab projection -> logits -> softmax(T) -> probabilities -> sampled token
```

Current interaction:

* temperature slider
* decoding mode toggle (greedy vs sampling)
* top-k selector (disabled automatically in greedy mode)
* `Generate` action producing 10-token continuations

Current content focus:

* output layer width corresponds to tokenizer vocabulary size
* temperature reshapes the distribution
* sampling is computed on-the-fly (no fixed seed UI)

---

## Chapter 6 — Loss, gradients, and backpropagation (implemented)

Purpose: show the learning cycle in guided steps.

Current flow:

1. run prediction from prompt context
2. reveal/provide actual next token
3. calculate backward gradients
4. apply update once

Current interaction:

* run prediction button
* three target-token buttons
* calculate backward button
* apply update button (disabled after use in current run)
* visual guidance indicates the next expected action

Current content focus:

* prediction first, then target revelation (to clarify learning signal)
* gradient “blame” flow through layers
* concise explanation of how updates propagate beyond the final layer

---

## Chapter 7 — Optimizers as update strategies (implemented)

Purpose: compare how optimizers follow different trajectories under the same gradients.

Current interaction:

* draggable start point on toy loss surface
* learning-rate and step controls
* overlaid trajectories for SGD, Momentum, and Adam
* compact optimizer summary blocks near the chart

Current content focus:

* all optimizers see the same gradient field
* stateful optimizers (momentum/Adam) move differently over time
* purely conceptual toy surface, clearly non-production

---

## Chapter 8 — Q/K/V intuition (implemented)

Purpose: prepare for full attention math by showing Q/K/V projections and mixing.

Current interaction:

* focus-token selector
* live Q, K, V projection tables
* similarity -> softmax weight bars
* weighted sum output vector for values

Current content focus:

* `Q = XWq`, `K = XWk`, `V = XWv` at toy scale
* query-key similarity produces attention weights
* values carry the mixed content forwarded onward

---

## Chapter 9 — Multi-Headed Attention (implemented)

Purpose: move from Q/K/V intuition to row-wise attention math and multi-head specialization.

Current content focus:

* `Q = XWq`, `K = XWk`, `V = XWv`
* `scores = QKᵀ / √d`, row-wise softmax, and `output = weights · V`
* raw scores are shown before softmax normalization
* multi-head behavior is introduced via head personality toggles

Current interaction:

* select which token is asking the query
* inspect selected row in the score matrix
* inspect softmax row that sums to ~100%
* compare head personalities for routing differences
* inspect weighted value mixing output for the selected token

---

## Chapter 10 — RoPE positional encoding (implemented)

Purpose: explain positional awareness via Q/K rotation and relative offsets.

Current interaction:

* choose sentence scenario
* click token pills to set the relative reference token (`position: 0`)
* inspect before/after vector bundles under token sequence
* inspect how neighboring tokens rotate relative to the selected token

Current content focus:

* RoPE rotates Q/K pairs, not V
* relative position (not absolute index alone) drives compatibility changes
* different pair frequencies encode short and long-range structure

---

## Chapter 11 — Full Transformer block and modern scale (implemented)

Purpose: combine prior chapters into one modern decoder-only block.

Current interaction:

* click block components in a vertical architecture diagram
* inspect per-component input/output shapes and equations
* follow callback links to earlier chapters (attention, RoPE, activations)
* inspect a second pipeline diagram showing repeated block stacking before logits

Current content focus:

* modern Llama-style decoder dimensions (`d_model=4096`, `q_heads=32`, `kv_heads=8`, `d_head=128`, `d_ff=14336`)
* grouped-query attention (`Q: 8×32×128`, `K/V: 8×8×128`)
* RMSNorm + causal attention + RoPE + SwiGLU MLP + residual paths
* repeated stack depth (for example ~32 layers in 8B-class setups)

---

## Chapter 12 — Training phases and grokking (in progress)

Purpose: show staged training behavior and delayed generalization at a conceptual level.

Current interaction:

* select phase (fit / plateau / delayed generalization)
* move optimization-step marker across a toy curve
* compare train vs validation loss trajectories at the marker step

Current content focus:

* training and validation can improve at different rates
* delayed validation improvement is presented as a toy grokking-style intuition
* explicit caveat that this is conceptual and not a universal training signature

---

## Chapter 13 — Pre-training, instruction tuning, preference tuning (implemented)

Purpose: show how post-training changes behavior while building on pretrained capability.

Current interaction:

* select one stage in a 3-step post-training pipeline
* inspect stage objective and training signal
* compare the same prompt output across base/instruction/preference stages

Current content focus:

* pre-training: broad capability via next-token learning on large corpora
* instruction tuning: better task-following and answer format
* preference tuning: more helpful and policy-aligned responses
* key message: capability base vs behavior shaping

---

## Chapter 14 — Context window and KV cache

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

## Chapter 15 — Quantization

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
