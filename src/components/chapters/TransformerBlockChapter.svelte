<script lang="ts">
  type BlockPart = {
    id: string;
    label: string;
    short: string;
    chapterId: string;
    chapterLabel: string;
    inShape: string;
    outShape: string;
    details: string[];
    equation: string;
  };

  const llamaDims = {
    sequence: 8,
    dModel: 4096,
    layers: 32,
    qHeads: 32,
    kvHeads: 8,
    dHead: 128,
    dFf: 14336,
    norm: "RMSNorm",
    pos: "RoPE",
    mlp: "SwiGLU",
    attention: "causal + grouped-query attention"
  };

  const refLabel = "Modern Llama-style decoder block dimensions";

  const parts: BlockPart[] = [
    {
      id: "tok",
      label: "Token + Positional Input",
      short: "Input vectors entering this block.",
      chapterId: "c2",
      chapterLabel: "Vector Embedding",
      inShape: "[8 x 4096]",
      outShape: "[8 x 4096]",
      details: [
        "Each row is one token representation in the current layer.",
        "RoPE-style position effects are applied inside attention on Q/K, not by changing V directly."
      ],
      equation: "X in R^(sequence x d_model)"
    },
    {
      id: "ln1",
      label: "Pre-Attention Norm",
      short: "Stabilizes scale before attention with RMSNorm.",
      chapterId: "c3",
      chapterLabel: "Neuron Activation",
      inShape: "[8 x 4096]",
      outShape: "[8 x 4096]",
      details: [
        "Normalization keeps per-token activations in a stable range.",
        "Shape is unchanged: only values are rescaled."
      ],
      equation: "X1 = RMSNorm(X)"
    },
    {
      id: "attn",
      label: "Causal Multi-Head Attention + RoPE",
      short: "Route information between tokens with causal GQA + RoPE.",
      chapterId: "c9",
      chapterLabel: "Multi-Headed Attention",
      inShape: "[8 x 4096]",
      outShape: "[8 x 4096]",
      details: [
        "Project into Q/K/V with grouped-query attention.",
        "Q uses 32 heads x 128 dims, while K/V use 8 heads x 128 dims.",
        "Each head computes scores, softmax weights, then weighted V mixes.",
        "Query-head outputs are concatenated back to 4096 dims."
      ],
      equation: "Attn(X)=Concat(32 query heads)W_o"
    },
    {
      id: "res1",
      label: "Residual Add",
      short: "Preserves original signal path.",
      chapterId: "c4",
      chapterLabel: "Feed Forward Neural Network",
      inShape: "[8 x 4096] + [8 x 4096]",
      outShape: "[8 x 4096]",
      details: [
        "The skip path lets the block learn adjustments instead of replacing everything.",
        "This also helps gradient flow through deep stacks."
      ],
      equation: "X2 = X + Attn(Norm(X))"
    },
    {
      id: "ln2",
      label: "Pre-MLP Norm",
      short: "Stabilizes before feed-forward with RMSNorm.",
      chapterId: "c3",
      chapterLabel: "Neuron Activation",
      inShape: "[8 x 4096]",
      outShape: "[8 x 4096]",
      details: [
        "A second normalization precedes the MLP sublayer.",
        "Again: same shape, different normalized values."
      ],
      equation: "X3 = RMSNorm(X2)"
    },
    {
      id: "mlp",
      label: "Feed-Forward MLP",
      short: "Per-token nonlinear transform with SwiGLU.",
      chapterId: "c4",
      chapterLabel: "Feed Forward Neural Network",
      inShape: "[8 x 4096]",
      outShape: "[8 x 4096]",
      details: [
        "Expand width then project back: 4096 -> 14336 -> 4096.",
        "Applied independently to each token row."
      ],
      equation: "MLP(X)=W_down(SwiGLU(W_gate X, W_up X))"
    },
    {
      id: "res2",
      label: "Residual Add",
      short: "Final block output.",
      chapterId: "c6",
      chapterLabel: "Backpropagation",
      inShape: "[8 x 4096] + [8 x 4096]",
      outShape: "[8 x 4096]",
      details: [
        "Second skip connection closes the transformer block.",
        "This output is fed into the next block in the stack."
      ],
      equation: "Y = X2 + MLP(Norm(X2))"
    }
  ];

  let selectedPartId = "tok";
  $: selectedPart = parts.find((part) => part.id === selectedPartId) ?? parts[0];
</script>

<section class="transformer-block">
  <div class="intro-copy">
    <p>
      This chapter combines what we learned into one full transformer block: normalization, multi-headed attention,
      residual paths, and a feed-forward network.
    </p>
    <p>
      Let's look at an actual example of how all these elements are combined to build one Transformer block in a
      modern decoder-only model.
    </p>
    <p>
      Click any block part to inspect its role, input/output dimensions, and jump back to the chapter where that part
      was introduced in detail.
    </p>
  </div>

  <section class="card meta">
    <p class="label">Modern Decoder Block Dimensions</p>
    <p class="mini">Reference style: <code>{refLabel}</code></p>
    <div class="dims-table-wrap" role="region" aria-label="Modern decoder block dimensions">
      <table class="dims-table">
        <tbody>
          <tr><th>Sequence length shown</th><td>{llamaDims.sequence}</td></tr>
          <tr><th>Model width (<code>d_model</code>)</th><td>{llamaDims.dModel}</td></tr>
          <tr><th>Layers</th><td>{llamaDims.layers}</td></tr>
          <tr><th>Query heads</th><td>{llamaDims.qHeads}</td></tr>
          <tr><th>KV heads</th><td>{llamaDims.kvHeads}</td></tr>
          <tr><th>Head width (<code>d_head</code>)</th><td>{llamaDims.dHead}</td></tr>
          <tr><th>Q shape per token</th><td>{llamaDims.qHeads} x {llamaDims.dHead}</td></tr>
          <tr><th>K/V shape per token</th><td>{llamaDims.kvHeads} x {llamaDims.dHead}</td></tr>
          <tr><th>Concat attention output</th><td>{llamaDims.dModel}</td></tr>
          <tr><th>FFN hidden width</th><td>{llamaDims.dFf}</td></tr>
          <tr><th>Norm</th><td>{llamaDims.norm}</td></tr>
          <tr><th>Position encoding</th><td>{llamaDims.pos}</td></tr>
          <tr><th>MLP</th><td>{llamaDims.mlp}</td></tr>
          <tr class="wide"><th>Attention</th><td>{llamaDims.attention}</td></tr>
          <tr class="wide"><th>Block input/output shape</th><td>[{llamaDims.sequence} x {llamaDims.dModel}]</td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="card block-layout">
    <div class="block-visual">
      <svg viewBox="0 0 420 760" role="img" aria-label="transformer block diagram">
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="rgba(71,85,105,0.8)" />
        </marker>
      </defs>

      <g class="part part-embedding" class:selected={selectedPartId === "tok"} on:click={() => (selectedPartId = "tok")}>
        <rect x="110" y="30" width="200" height="58" rx="12" />
        <text x="210" y="65" text-anchor="middle">Input X</text>
      </g>

      <line x1="210" y1="88" x2="210" y2="122" marker-end="url(#arrow)" />

      <g class="part part-neuron" class:selected={selectedPartId === "ln1"} on:click={() => (selectedPartId = "ln1")}>
        <rect x="125" y="122" width="170" height="56" rx="12" />
        <text x="210" y="156" text-anchor="middle">RMSNorm 1</text>
      </g>

      <line x1="210" y1="178" x2="210" y2="214" marker-end="url(#arrow)" />

      <g class="part part-attention" class:selected={selectedPartId === "attn"} on:click={() => (selectedPartId = "attn")}>
        <rect x="85" y="214" width="250" height="86" rx="12" />
        <text x="210" y="248" text-anchor="middle">Causal GQA + RoPE</text>
        <text x="210" y="272" text-anchor="middle" class="sub">Q/K/V -> scores -> mix</text>
      </g>

      <line x1="210" y1="300" x2="210" y2="344" marker-end="url(#arrow)" />

      <g class="part part-residual" class:selected={selectedPartId === "res1"} on:click={() => (selectedPartId = "res1")}>
        <rect x="135" y="344" width="150" height="56" rx="12" />
        <text x="210" y="378" text-anchor="middle">+ Residual</text>
      </g>

      <line x1="310" y1="59" x2="355" y2="59" />
      <line x1="355" y1="59" x2="355" y2="372" />
      <line x1="355" y1="372" x2="285" y2="372" marker-end="url(#arrow)" />
      <text x="360" y="224" class="sub">skip</text>

      <line x1="210" y1="400" x2="210" y2="438" marker-end="url(#arrow)" />

      <g class="part part-neuron" class:selected={selectedPartId === "ln2"} on:click={() => (selectedPartId = "ln2")}>
        <rect x="125" y="438" width="170" height="56" rx="12" />
        <text x="210" y="472" text-anchor="middle">RMSNorm 2</text>
      </g>

      <line x1="210" y1="494" x2="210" y2="530" marker-end="url(#arrow)" />

      <g class="part part-ffn" class:selected={selectedPartId === "mlp"} on:click={() => (selectedPartId = "mlp")}>
        <rect x="90" y="530" width="240" height="82" rx="12" />
        <text x="210" y="562" text-anchor="middle">SwiGLU MLP</text>
        <text x="210" y="586" text-anchor="middle" class="sub">4096 -> 14336 -> 4096</text>
      </g>

      <line x1="210" y1="612" x2="210" y2="654" marker-end="url(#arrow)" />

      <g class="part part-training" class:selected={selectedPartId === "res2"} on:click={() => (selectedPartId = "res2")}>
        <rect x="135" y="654" width="150" height="56" rx="12" />
        <text x="210" y="688" text-anchor="middle">+ Residual</text>
      </g>

      <line x1="285" y1="372" x2="355" y2="372" />
      <line x1="355" y1="372" x2="355" y2="682" />
      <line x1="355" y1="682" x2="285" y2="682" marker-end="url(#arrow)" />
      <text x="360" y="536" class="sub">skip</text>

      <line x1="210" y1="710" x2="210" y2="742" marker-end="url(#arrow)" />
      <text x="222" y="748" class="output">Y</text>
      </svg>

    </div>
    <aside class="inspector-panel">
      <section class="card inspector">
        <p class="label">Selected Part</p>
        <h3>{selectedPart.label}</h3>
        <p class="mini">{selectedPart.short}</p>

        <p class="mini">
          Learn more in
          <a href={`#${selectedPart.chapterId}`}>{selectedPart.chapterLabel}</a>.
        </p>
        {#if selectedPart.id === "attn"}
          <p class="mini">
            Positional behavior here comes from <a href="#c10">RoPE</a>, applied on Q/K before score computation.
          </p>
        {/if}
        {#if selectedPart.id === "mlp"}
          <p class="mini">
            This MLP uses <code>SwiGLU</code>, which builds on the activation ideas from
            <a href="#c3">Neuron Activation</a>.
          </p>
        {/if}

        <div class="io-grid">
          <div>
            <p class="io-label">Input shape</p>
            <code>{selectedPart.inShape}</code>
          </div>
          <div>
            <p class="io-label">Output shape</p>
            <code>{selectedPart.outShape}</code>
          </div>
        </div>

        <div class="detail-list">
          {#each selectedPart.details as detail}
            <p>{detail}</p>
          {/each}
        </div>

        {#if selectedPart.id === "attn"}
          <div class="shape-note">
            <p class="mini"><code>Input shape: [{llamaDims.sequence} x {llamaDims.dModel}]</code></p>
            <p class="mini"><code>Output shape: [{llamaDims.sequence} x {llamaDims.dModel}]</code></p>
            <p class="mini"><code>Q: {llamaDims.sequence} x {llamaDims.qHeads} x {llamaDims.dHead}</code></p>
            <p class="mini"><code>K: {llamaDims.sequence} x {llamaDims.kvHeads} x {llamaDims.dHead}</code></p>
            <p class="mini"><code>V: {llamaDims.sequence} x {llamaDims.kvHeads} x {llamaDims.dHead}</code></p>
            <p class="mini">
              Because this uses grouped-query attention, several query heads share the same K/V head.
              After attention, the 32 query-head outputs are concatenated back to 4096 dims.
            </p>
          </div>
        {/if}

        <p class="mini"><code>{selectedPart.equation}</code></p>
      </section>
    </aside>
  </section>

  <section class="card stack-card">
    <p class="label">How This Scales In A Full Model</p>
    <p class="mini">
      One block is rarely used alone. Decoder-only Transformers repeat this block many times before the final output
      projection over the vocabulary. In a Llama-8B-style setup, this is typically around <code>32</code> stacked
      blocks (layers).
    </p>
    <svg viewBox="0 0 900 140" role="img" aria-label="stacked transformer blocks pipeline">
      <defs>
        <marker id="arrowStack" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="rgba(71,85,105,0.8)" />
        </marker>
      </defs>
      <rect x="20" y="45" width="130" height="50" rx="10" class="stack-node" />
      <text x="85" y="75" text-anchor="middle">Input Tokens</text>
      <line x1="150" y1="70" x2="215" y2="70" marker-end="url(#arrowStack)" />

      <rect x="215" y="35" width="150" height="70" rx="10" class="stack-block" />
      <text x="290" y="67" text-anchor="middle">Transformer</text>
      <text x="290" y="86" text-anchor="middle" class="stack-sub">Block 1</text>
      <line x1="365" y1="70" x2="422" y2="70" marker-end="url(#arrowStack)" />

      <rect x="422" y="35" width="150" height="70" rx="10" class="stack-block" />
      <text x="497" y="67" text-anchor="middle">Transformer</text>
      <text x="497" y="86" text-anchor="middle" class="stack-sub">Block 2</text>
      <line x1="572" y1="70" x2="622" y2="70" marker-end="url(#arrowStack)" />

      <rect x="622" y="35" width="90" height="70" rx="10" class="stack-block" />
      <text x="667" y="77" text-anchor="middle">...</text>
      <line x1="712" y1="70" x2="770" y2="70" marker-end="url(#arrowStack)" />

      <rect x="770" y="45" width="110" height="50" rx="10" class="stack-node" />
      <text x="825" y="75" text-anchor="middle">Logits</text>
    </svg>
  </section>
</section>

<style>
  .transformer-block { display: grid; gap: 0.9rem; }
  .intro-copy { display: grid; gap: 0.4rem; }
  .intro-copy p { margin: 0; color: var(--text-secondary); line-height: 1.62; }

  .card {
    border: 1px solid var(--border-subtle);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.62);
    padding: 0.78rem;
    display: grid;
    gap: 0.5rem;
  }
  .dims-table-wrap {
    border: 1px solid rgba(148, 163, 184, 0.22);
    border-radius: 10px;
    background: rgba(248, 250, 252, 0.58);
    overflow-x: auto;
    padding: 0.42rem;
  }
  .dims-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 0.76rem;
  }
  .dims-table tbody {
    display: grid;
    grid-template-columns: repeat(3, minmax(10.5rem, 1fr));
    gap: 0.38rem;
  }
  .dims-table tr {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: baseline;
    gap: 0.45rem;
    min-height: 2.1rem;
    padding: 0.34rem 0.48rem;
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.72);
  }
  .dims-table tr.wide {
    grid-column: span 3;
  }
  .dims-table th,
  .dims-table td {
    padding: 0;
    border: 0;
  }
  .dims-table th {
    text-align: left;
    font-weight: 600;
    color: #475569;
    background: transparent;
    line-height: 1.25;
  }
  .dims-table td {
    text-align: right;
    font-family: "IBM Plex Mono", "SFMono-Regular", monospace;
    color: #1e293b;
    font-size: 0.72rem;
    letter-spacing: 0.01em;
    line-height: 1.25;
    white-space: nowrap;
  }
  .dims-table tr.wide td {
    white-space: normal;
  }

  .label { margin: 0; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-muted); }
  .mini { margin: 0; font-size: 0.84rem; line-height: 1.56; color: var(--text-secondary); }
  code { font-family: "IBM Plex Mono", "SFMono-Regular", monospace; }

  .block-layout {
    grid-template-columns: minmax(320px, 420px) minmax(280px, 1fr);
    align-items: start;
    gap: 0.85rem;
  }

  .block-visual svg {
    width: min(100%, 360px);
    height: auto;
    border: 1px solid rgba(100, 116, 139, 0.22);
    border-radius: 14px;
    background: linear-gradient(170deg, rgba(255,255,255,0.9), rgba(248,250,252,0.72));
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.75);
    margin-inline: auto;
    display: block;
  }

  svg g { cursor: pointer; }
  svg .part rect {
    fill: color-mix(in srgb, var(--part-color) 12%, white);
    stroke: color-mix(in srgb, var(--part-color) 54%, #64748b);
    stroke-width: 1.1;
    transition: fill 140ms ease, stroke-color 140ms ease, filter 140ms ease, transform 140ms ease;
  }
  svg .part:hover rect {
    fill: color-mix(in srgb, var(--part-color) 18%, white);
    filter: drop-shadow(0 4px 7px color-mix(in srgb, var(--part-color) 22%, transparent));
  }
  svg .part.selected rect {
    fill: color-mix(in srgb, var(--part-color) 24%, white);
    stroke: color-mix(in srgb, var(--part-color) 86%, #0f172a);
    stroke-width: 1.5;
    filter: drop-shadow(0 2px 6px color-mix(in srgb, var(--part-color) 28%, transparent));
  }
  .part-embedding { --part-color: #0e7490; }
  .part-neuron { --part-color: #b45309; }
  .part-attention { --part-color: #156a82; }
  .part-residual { --part-color: #64748b; }
  .part-ffn { --part-color: #1f7a63; }
  .part-training { --part-color: #be185d; }
  svg text { font-size: 13px; fill: #334155; font-weight: 600; }
  svg text.sub { font-size: 12px; font-weight: 500; fill: #64748b; }
  svg text.output { font-size: 13px; fill: #0f172a; font-weight: 700; }
  svg line { stroke: rgba(71, 85, 105, 0.7); stroke-width: 1.35; fill: none; }

  .inspector h3 {
    margin: 0;
    font-family: "Fraunces", "Iowan Old Style", "Georgia", serif;
    font-weight: 500;
    font-size: 1.28rem;
    color: #0f172a;
  }

  .inspector a {
    color: #155e75;
    text-decoration: none;
    border-bottom: 1px dotted rgba(21, 94, 117, 0.45);
  }

  .inspector-panel {
    position: sticky;
    top: 5.2rem;
  }

  .inspector {
    background: linear-gradient(160deg, rgba(255, 255, 255, 0.96), rgba(241, 248, 251, 0.72));
    border-color: rgba(21, 106, 130, 0.24);
  }

  .io-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.6rem; }
  .io-grid > div { border: 1px solid rgba(100,116,139,0.24); border-radius: 10px; padding: 0.48rem 0.56rem; background: rgba(248,250,252,0.76); }
  .io-label { margin: 0 0 0.2rem 0; font-size: 0.7rem; letter-spacing: 0.04em; text-transform: uppercase; color: #64748b; }

  .detail-list { display: grid; gap: 0.25rem; }
  .detail-list p { margin: 0; font-size: 0.84rem; color: var(--text-secondary); line-height: 1.5; }
  .stack-card svg {
    width: 100%;
    height: auto;
    border: 1px solid rgba(100, 116, 139, 0.2);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.74);
    padding: 0.3rem;
  }
  .stack-card text { fill: #334155; font-size: 13px; font-weight: 600; }
  .stack-card text.stack-sub { fill: #64748b; font-size: 12px; font-weight: 500; }
  .stack-card rect.stack-node { fill: rgba(241, 245, 249, 0.86); stroke: rgba(100, 116, 139, 0.5); }
  .stack-card rect.stack-block { fill: rgba(21, 106, 130, 0.12); stroke: rgba(21, 106, 130, 0.58); }
  .stack-card rect.stack-ellipsis { fill: rgba(248, 250, 252, 0.9); stroke: rgba(100, 116, 139, 0.42); }
  .stack-card line { stroke: rgba(71, 85, 105, 0.74); stroke-width: 1.5; }

  @media (max-width: 900px) {
    .dims-table tbody {
      grid-template-columns: repeat(2, minmax(9rem, 1fr));
    }

    .dims-table tr.wide {
      grid-column: span 2;
    }

    .block-layout {
      grid-template-columns: 1fr;
    }

    .inspector-panel {
      position: static;
      top: auto;
    }

    .io-grid { grid-template-columns: 1fr; }
    .block-visual svg { min-height: 300px; }
  }

  @media (max-width: 560px) {
    .dims-table tbody {
      grid-template-columns: 1fr;
    }

    .dims-table tr.wide {
      grid-column: auto;
    }
  }

  @media (max-width: 640px) {
    .card,
    .dims-table-wrap {
      padding: 0.56rem;
    }

    .block-visual svg {
      min-height: 360px;
    }

    svg g {
      touch-action: manipulation;
    }

    .stack-card {
      overflow-x: auto;
    }

    .stack-card svg {
      min-width: 560px;
    }
  }
</style>
