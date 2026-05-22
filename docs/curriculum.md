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
