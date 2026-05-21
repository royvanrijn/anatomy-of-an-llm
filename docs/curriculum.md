# Curriculum

## Final chapter order

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

## Chapter requirements

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
