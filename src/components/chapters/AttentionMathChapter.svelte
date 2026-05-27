<script lang="ts">
  import DimensionOverlay from "../DimensionOverlay.svelte";
  import { dot, matMul, softmax } from "../../utils/qkv";
  type HeadProfile = { id: string; label: string; description: string; bias: number[][] };

  const tokens = ["The", "blue", "car", "hit", "the", "wall"];
  const d = 3;

  const X = [
    [0.8, 0.2, 0.1],
    [0.2, 0.9, 0.4],
    [0.3, 1.1, 0.7],
    [1.0, 0.3, 0.8],
    [0.7, 0.2, 0.1],
    [0.4, 0.8, 0.9]
  ];

  const Wq = [
    [0.7, -0.2, 0.1],
    [0.1, 0.8, 0.3],
    [0.2, 0.1, 0.9]
  ];

  const Wk = [
    [0.6, 0.2, 0.1],
    [0.2, 0.7, 0.2],
    [0.1, 0.3, 0.8]
  ];

  const Wv = [
    [0.8, 0.1, 0.2],
    [0.2, 0.9, 0.2],
    [0.1, 0.3, 0.7]
  ];

  let selected = 1;
  let selectedHeadId = "adj-noun";

  const qScale = Math.sqrt(d);

  function zeroBias() {
    return Array.from({ length: tokens.length }, () => Array.from({ length: tokens.length }, () => 0));
  }

  function withPairs(pairs: Array<[number, number, number]>) {
    const out = zeroBias();
    for (const [q, k, v] of pairs) out[q][k] = v;
    return out;
  }

  const heads: HeadProfile[] = [
    {
      id: "adj-noun",
      label: "Head 1: adjective -> noun linker",
      description: "Emphasizes modifiers routing to the noun they describe (for example blue -> car).",
      bias: withPairs([
        [1, 2, 1.45],
        [1, 5, -0.55],
        [1, 1, -0.2],
        [2, 1, 0.5],
        [5, 5, 0.4]
      ])
    },
    {
      id: "action-linker",
      label: "Head 2: action linker",
      description: "Emphasizes event routing (for example hit attends strongly to car and wall).",
      bias: withPairs([
        [3, 2, 0.95],
        [3, 5, 0.85],
        [3, 3, -0.35],
        [2, 3, 0.45],
        [5, 3, 0.45]
      ])
    },
    {
      id: "reference",
      label: "Head 3: reference resolver",
      description: "Emphasizes reference-style routing (in longer examples, pronouns often route to entities).",
      bias: withPairs([
        [4, 2, 1.0],
        [4, 5, 0.4],
        [0, 0, 0.25],
        [2, 2, 0.2]
      ])
    }
  ];

  function fmt(v: number) {
    return (v >= 0 ? "+" : "") + v.toFixed(3);
  }

  function pct(v: number) {
    return `${(v * 100).toFixed(1)}%`;
  }

  function heat(value: number, min: number, max: number) {
    const t = (value - min) / Math.max(1e-9, max - min);
    const alpha = 0.08 + t * 0.65;
    return `rgba(21, 106, 130, ${alpha.toFixed(3)})`;
  }

  $: selectedHead = heads.find((h) => h.id === selectedHeadId) ?? heads[0];

  $: Q = matMul(X, Wq);
  $: K = matMul(X, Wk);
  $: V = matMul(X, Wv);
  $: rawScores = Q.map((qRow) => K.map((kRow) => dot(qRow, kRow) / qScale));
  $: scores = rawScores.map((row, r) => row.map((value, c) => value + selectedHead.bias[r][c]));
  $: weights = scores.map((row) => softmax(row));
  $: outputs = matMul(weights, V);

  $: selectedToken = tokens[selected];
  $: selectedEmbedding = X[selected];
  $: selectedQ = Q[selected];
  $: selectedScoreRow = scores[selected];
  $: selectedWeightRow = weights[selected];
  $: selectedOutput = outputs[selected];
  $: strongestIndex = selectedWeightRow.indexOf(Math.max(...selectedWeightRow));
  $: selectedWeightSum = selectedWeightRow.reduce((acc, v) => acc + v, 0);

  $: scoreMin = Math.min(...scores.flat());
  $: scoreMax = Math.max(...scores.flat());
</script>

<section class="attn-math">
  <div class="intro">
    <p>
        We also introduce <strong>multi-head attention</strong> here.
        In modern Transformer models each block doesn't just have a single attention head, but multiple.
        Different heads can learn different routing patterns, then their outputs are combined.
    </p>
  </div>

  <div class="intro-copy">
    <p>Each token creates three learned views of itself:</p>
    <p><code>Q</code> - the question this token asks.</p>
    <p><code>K</code> - what this token advertises about itself.</p>
    <p><code>V</code> - the information this token contributes.</p>
    <p>For one selected query token, we compare its <code>Q</code> vector with every <code>K</code> vector.</p>
    <p>Only after softmax do these scores become attention weights. Those weights decide how much of each V vector is mixed into this token’s next representation.</p>
  </div>

  <section class="card shapes">
    <p class="label">Tensor Shapes</p>
    <p class="mini">We start with token vectors, project them into <code>Q</code>, <code>K</code>, and <code>V</code>, compute query-key compatibility scores, then convert those scores into attention weights and mix values.</p>
    <p class="mini pipeline"><code>Q = XWq</code> -> <code>K = XWk</code> -> <code>V = XWv</code> -> <code>scores = QK^T / sqrt(d_k)</code> -> <code>weights = softmax(scores)</code> -> <code>output = weights·V</code></p>
    <p class="mini">This example uses unmasked self-attention, so every token can attend to every token. A GPT-style causal decoder would mask future tokens.</p>
    <DimensionOverlay
      buttonLabel="Explain dimensions in this example"
      title="How These Dimensions Work"
      summary="In this toy chapter we use 6 tokens and a head width of 3 values per token."
      equations={[
        "X (6x3) · Wq (3x3) = Q (6x3)",
        "X (6x3) · Wk (3x3) = K (6x3)",
        "X (6x3) · Wv (3x3) = V (6x3)",
        "Q (6x3) · K^T (3x6) = scores (6x6)",
        "softmax(scores) = weights (6x6)",
        "weights (6x6) · V (6x3) = output (6x3)"
      ]}
      items={[
        "6 = sequence length (number of tokens in this sentence)",
        "3 = head dimension in this toy example",
        "6x6 score matrix = for each query token, one score per key token"
      ]}
      note="In real models, sequence length and head dimension are much larger, but the matrix logic is exactly the same."
    />
  </section>

  <section class="card controls">
    <p class="label">Which token is asking a question?</p>
    <div class="token-row" role="group" aria-label="Query token selector">
      {#each tokens as token, i}
        <button type="button" class="token" class:selected={selected === i} on:click={() => (selected = i)}>{token}</button>
      {/each}
    </div>
    <p class="mini">Selected token: <code>{selectedToken}</code></p>
    <p class="mini">Its query asks: "Which other tokens help me understand <code>{selectedToken}</code>?"</p>

    <div class="head-picker" role="group" aria-label="Attention head personality">
      {#each heads as head}
        <button type="button" class:active={selectedHeadId === head.id} on:click={() => (selectedHeadId = head.id)}>{head.label}</button>
      {/each}
    </div>
    <p class="mini">{selectedHead.description}</p>
  </section>

  <section class="card qkv-mini">
    <article>
      <p class="label">Q View</p>
      <p class="mini"><code>{selectedToken}</code> embedding <code>[{selectedEmbedding.map(fmt).join(", ")}]</code></p>
      <p class="mini">↓ multiply by <code>Wq</code></p>
      <p class="mini"><code>Q_{selectedToken} = [{selectedQ.map(fmt).join(", ")}]</code></p>
    </article>
    <article>
      <p class="label">K View</p>
      <p class="mini">Each token embedding times <code>Wk</code> gives its advertised key vector.</p>
      <p class="mini"><code>K_The</code>, <code>K_blue</code>, <code>K_car</code>, <code>K_hit</code>, <code>K_the</code>, <code>K_wall</code></p>
    </article>
    <article>
      <p class="label">V View</p>
      <p class="mini">Each token embedding times <code>Wv</code> gives value content to mix if attended.</p>
      <p class="mini"><code>V_The</code>, <code>V_blue</code>, <code>V_car</code>, <code>V_hit</code>, <code>V_the</code>, <code>V_wall</code></p>
    </article>
  </section>

  <section class="card matrix-card">
    <p class="label">Raw Query-Key Scores (Not Attention Yet)</p>
    <div class="matrix-wrap">
      <table class="matrix" aria-label="Raw query-key score matrix">
        <thead>
          <tr>
            <th>Q \ K</th>
            {#each tokens as token}
              <th>{token}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each scores as row, r}
            <tr class:selected-row={r === selected} class:faded-row={r !== selected}>
              <th>{tokens[r]}</th>
              {#each row as cell, c}
                <td
                  class:selected-cell={r === selected}
                  class:strongest-cell={r === selected && c === strongestIndex}
                  style={`background:${heat(cell, scoreMin, scoreMax)};`}
                >
                  {fmt(cell)}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>

  <section class="card flow-grid">
    <article>
      <p class="label">Step 1 · Selected Query Dot Keys</p>
      <div class="equation-list">
        {#each selectedScoreRow as score, i}
          <p><code>{selectedToken}</code> query · <code>{tokens[i]}</code> key = <code>{fmt(score)}</code></p>
        {/each}
      </div>
    </article>
    <article>
      <p class="label">Step 2 · Softmax To Attention Weights</p>
      <p class="mini"><code>softmax([{selectedScoreRow.map(fmt).join(", ")}])</code></p>
      <div class="weight-list">
        {#each selectedWeightRow as w, i}
          <div class="weight-row" class:best={i === strongestIndex}>
            <span>{tokens[i]}</span>
            <div class="bar"><span style={`width:${Math.max(4, w * 100)}%`}></span></div>
            <code>{pct(w)}</code>
          </div>
        {/each}
      </div>
      <p class="mini">Row sum: <code>{selectedWeightRow.map((v) => (v * 100).toFixed(1)).join(" + ")} = {(selectedWeightSum * 100).toFixed(1)}%</code></p>
    </article>
    <article>
      <p class="label">Step 3 · Weighted Value Mix</p>
      <p class="mini">Attention decides which value vectors get mixed into this token's next representation.</p>
      <p class="mini"><code>output[{selected}] = sum_i weights[{selected},i] * V[i]</code></p>
      <p class="mini"><code>head_output_{selectedToken} = [{selectedOutput.map(fmt).join(", ")}]</code></p>
      <p class="mini">Highest attention target: <code>{tokens[strongestIndex]}</code> ({pct(selectedWeightRow[strongestIndex])}).</p>
    </article>
  </section>
</section>

<style>
  .attn-math { display: grid; gap: 0.9rem; }
  .intro-copy { display: grid; gap: 0.45rem; }
  .intro-copy p { margin: 0; line-height: 1.62; color: var(--text-secondary); }

  .card { border: 1px solid var(--border-subtle); border-radius: 12px; background: rgba(255, 255, 255, 0.62); padding: 0.75rem; display: grid; gap: 0.45rem; }
  .label { margin: 0; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-muted); }
  .mini { margin: 0; font-size: 0.84rem; line-height: 1.58; color: var(--text-secondary); }
  code { font-family: "IBM Plex Mono", "SFMono-Regular", monospace; }
  .pipeline { line-height: 1.9; }

  .token-row, .head-picker { display: flex; flex-wrap: wrap; gap: 0.4rem; }
  .token, .head-picker button {
    border: 1px solid var(--border-subtle);
    background: rgba(255,255,255,0.86);
    color: var(--text-secondary);
    border-radius: 999px;
    padding: 0.36rem 0.82rem;
    font-size: 0.9rem;
  }
  .token.selected, .head-picker button.active {
    background: rgba(21, 106, 130, 0.14);
    border-color: rgba(21, 106, 130, 0.58);
    color: #0f172a;
  }

  .qkv-mini { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.6rem; }
  .qkv-mini article { border: 1px solid rgba(100,116,139,0.22); border-radius: 10px; padding: 0.52rem; background: rgba(255,255,255,0.7); display: grid; gap: 0.28rem; }

  .matrix-wrap { overflow: auto; }
  .matrix { border-collapse: collapse; width: 100%; min-width: 640px; }
  .matrix th, .matrix td { border: 1px solid rgba(100,116,139,0.28); padding: 0.36rem 0.42rem; text-align: center; font-size: 0.75rem; }
  .matrix th { background: rgba(248,250,252,0.84); color: var(--text-secondary); font-weight: 600; }
  .matrix tr.selected-row > th { color: #0f172a; background: rgba(21,106,130,0.14); }
  .matrix tr.faded-row { opacity: 0.28; }
  .matrix td.selected-cell { outline: 1px solid rgba(21,106,130,0.42); }
  .matrix td.strongest-cell {
    outline: 2px solid rgba(217, 119, 6, 0.78);
    outline-offset: -2px;
    box-shadow: inset 0 0 0 999px rgba(255, 247, 237, 0.24);
    font-weight: 700;
  }

  .flow-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); display: grid; gap: 0.65rem; }
  .flow-grid article { border: 1px solid rgba(100,116,139,0.22); border-radius: 10px; padding: 0.52rem; background: rgba(255,255,255,0.7); display: grid; gap: 0.35rem; }

  .equation-list { display: grid; gap: 0.2rem; }
  .equation-list p { margin: 0; font-size: 0.8rem; color: var(--text-secondary); }

  .weight-list { display: grid; gap: 0.28rem; }
  .weight-row { display: grid; grid-template-columns: 64px 1fr auto; gap: 0.4rem; align-items: center; }
  .weight-row .bar { height: 9px; background: rgba(203,213,225,0.55); border-radius: 999px; overflow: hidden; }
  .weight-row .bar span { display: block; height: 100%; background: rgba(21,106,130,0.72); }
  .weight-row.best {
    border-radius: 8px;
    background: rgba(217,119,6,0.08);
    padding: 0.12rem 0.18rem;
    margin-inline: -0.18rem;
  }
  .weight-row.best .bar span { background: rgba(217,119,6,0.85); }


  @media (max-width: 980px) {
    .qkv-mini, .flow-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 640px) {
    .card {
      padding: 0.56rem;
    }

    .head-picker {
      display: grid;
      grid-template-columns: 1fr;
    }

    .token,
    .head-picker button {
      min-height: 42px;
      padding-inline: 0.64rem;
    }

    .matrix {
      min-width: 520px;
    }

    .matrix th,
    .matrix td {
      padding: 0.3rem 0.32rem;
      font-size: 0.68rem;
    }

    .weight-row {
      grid-template-columns: 3.6rem minmax(0, 1fr) 3rem;
      gap: 0.32rem;
    }
  }
</style>
