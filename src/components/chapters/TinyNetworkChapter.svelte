<script lang="ts">
  import { applyActivation, type ActivationId } from "../../utils/activations";

  let activation: ActivationId = "relu";
  let x1 = 0.8;
  let x2 = -0.3;

  const W1 = [
    [0.7, -0.4, 0.2],
    [0.1, 0.9, -0.6]
  ];

  const W2 = [
    [0.5, -0.7],
    [0.2, 0.6],
    [-0.4, 0.3]
  ];

  $: X = [x1, x2];
  $: Z1 = [0, 1, 2].map((col) => X[0] * W1[0][col] + X[1] * W1[1][col]);
  $: A1 = Z1.map((v) => applyActivation(activation, v));
  $: Z2 = [0, 1].map((col) => A1[0] * W2[0][col] + A1[1] * W2[1][col] + A1[2] * W2[2][col]);
  $: A2 = Z2.map((v) => applyActivation(activation, v));
  $: C1 = [
    [X[0] * W1[0][0], X[0] * W1[0][1], X[0] * W1[0][2]],
    [X[1] * W1[1][0], X[1] * W1[1][1], X[1] * W1[1][2]]
  ];
  $: C2 = [
    [A1[0] * W2[0][0], A1[0] * W2[0][1]],
    [A1[1] * W2[1][0], A1[1] * W2[1][1]],
    [A1[2] * W2[2][0], A1[2] * W2[2][1]]
  ];

  let hoveredEdge = "";
  let hoveredNode = "";
  let hoveredMatrix = "";
  $: hoveredHiddenIndex = hoveredNode.startsWith("h-") ? Number(hoveredNode.split("-")[1]) : -1;
  $: hoveredOutputIndex = hoveredNode.startsWith("o-") ? Number(hoveredNode.split("-")[1]) : -1;
  function edgeKey(fromLayer: number, fromNode: number, toNode: number) {
    return `${fromLayer}-${fromNode}-${toNode}`;
  }
  function nodeKey(layer: "x" | "h" | "o", idx: number) {
    return `${layer}-${idx}`;
  }

  function f(v: number) {
    return (v >= 0 ? "+" : "") + v.toFixed(2);
  }
  function n(v: number) {
    return v.toFixed(2);
  }
  function isActive(v: number) {
    if (activation === "relu") return v > 0;
    if (activation === "sigmoid") return v > 0.5;
    return v > 0;
  }
</script>

<section class="dense-chapter">
  <div class="intro">
    <p>
      Instead of training a full network here, we focus on one forward pass. A dense layer simply means every node
      in one layer connects to every node in the next layer.
    </p>
    <p>
      The same math from one neuron is now done in parallel using matrices:
      <code>X(1x2) · W1(2x3) = Z1(1x3)</code>,
      then <code>A1 = activation(Z1)</code>,
      then <code>A1(1x3) · W2(3x2) = Z2(1x2)</code>.
    </p>
    <p>
      Matrix multiplication is just many weighted sums at once. Each output column is one neuron, and each row in
      the input contributes through its matching weight row.
    </p>
  </div>

  <div class="layout">
    <section class="card full diagram-card">
      <p class="label">Fully connected view</p>
      <div class={`floating-inspector ${hoveredMatrix ? "visible" : ""}`}>
        {#if hoveredMatrix === "X"}
          <p class="mini"><code>X</code> input row (1x2)</p>
          <table class="calc-table"><tbody><tr>
            <td class={hoveredNode === nodeKey("x", 0) ? "hot" : ""}>{f(X[0])}</td>
            <td class={hoveredNode === nodeKey("x", 1) ? "hot" : ""}>{f(X[1])}</td>
          </tr></tbody></table>
        {:else if hoveredMatrix === "W1"}
          <p class="mini"><code>W1</code> (2x3), input -> hidden</p>
          <table class="calc-table"><tbody>
            {#each [0, 1] as r}
              <tr>
                {#each [0, 1, 2] as c}
                  {@const key = edgeKey(0, r, c)}
                  <td class={hoveredEdge === key ? "hot" : ""}>{f(W1[r][c])}</td>
                {/each}
              </tr>
            {/each}
          </tbody></table>
        {:else if hoveredMatrix === "A1"}
          <p class="mini"><code>A1</code> hidden activations (1x3)</p>
          <table class="calc-table"><tbody><tr>
            {#each [0, 1, 2] as i}
              <td class={hoveredNode === nodeKey("h", i) ? "hot" : ""}>{f(A1[i])}</td>
            {/each}
          </tr></tbody></table>
          {#if hoveredHiddenIndex >= 0}
            <p class="mini">
              <code>
                h{hoveredHiddenIndex + 1}: ({n(X[0])} * {n(W1[0][hoveredHiddenIndex])}) + ({n(X[1])} * {n(W1[1][hoveredHiddenIndex])})
                = {n(Z1[hoveredHiddenIndex])}
              </code>
            </p>
            <p class="mini"><code>{activation}({n(Z1[hoveredHiddenIndex])}) = {n(A1[hoveredHiddenIndex])}</code></p>
          {/if}
        {:else if hoveredMatrix === "W2"}
          <p class="mini"><code>W2</code> (3x2), hidden -> output</p>
          <table class="calc-table"><tbody>
            {#each [0, 1, 2] as r}
              <tr>
                {#each [0, 1] as c}
                  {@const key = edgeKey(1, r, c)}
                  <td class={hoveredEdge === key ? "hot" : ""}>{f(W2[r][c])}</td>
                {/each}
              </tr>
            {/each}
          </tbody></table>
        {:else if hoveredMatrix === "A2"}
          <p class="mini"><code>A2</code> final output row (1x2)</p>
          <table class="calc-table"><tbody><tr>
            <td class={hoveredNode === nodeKey("o", 0) ? "hot" : ""}>{f(A2[0])}</td>
            <td class={hoveredNode === nodeKey("o", 1) ? "hot" : ""}>{f(A2[1])}</td>
          </tr></tbody></table>
          {#if hoveredOutputIndex >= 0}
            <p class="mini">
              <code>
                o{hoveredOutputIndex + 1}: ({n(A1[0])} * {n(W2[0][hoveredOutputIndex])}) + ({n(A1[1])} * {n(W2[1][hoveredOutputIndex])})
                + ({n(A1[2])} * {n(W2[2][hoveredOutputIndex])}) = {n(Z2[hoveredOutputIndex])}
              </code>
            </p>
            <p class="mini"><code>{activation}({n(Z2[hoveredOutputIndex])}) = {n(A2[hoveredOutputIndex])}</code></p>
          {/if}
        {/if}
      </div>
      <svg viewBox="0 0 390 220" role="img" aria-label="input hidden output dense layer graph">
        <text x="55" y="18" text-anchor="middle" class={`col-label ${hoveredMatrix === "X" ? "active" : ""}`} on:mouseenter={() => (hoveredMatrix = "X")} on:mouseleave={() => (hoveredMatrix = "")}>X</text>
        <text x="122" y="18" text-anchor="middle" class={`col-label ${hoveredMatrix === "W1" ? "active" : ""}`} on:mouseenter={() => (hoveredMatrix = "W1")} on:mouseleave={() => (hoveredMatrix = "")}>W1</text>
        <text x="195" y="18" text-anchor="middle" class={`col-label ${hoveredMatrix === "A1" ? "active" : ""}`} on:mouseenter={() => (hoveredMatrix = "A1")} on:mouseleave={() => (hoveredMatrix = "")}>A1</text>
        <text x="265" y="18" text-anchor="middle" class={`col-label ${hoveredMatrix === "W2" ? "active" : ""}`} on:mouseenter={() => (hoveredMatrix = "W2")} on:mouseleave={() => (hoveredMatrix = "")}>W2</text>
        <text x="335" y="18" text-anchor="middle" class={`col-label ${hoveredMatrix === "A2" ? "active" : ""}`} on:mouseenter={() => (hoveredMatrix = "A2")} on:mouseleave={() => (hoveredMatrix = "")}>A2</text>

        {#each [0, 1] as i}
          {@const nkey = nodeKey("x", i)}
          <circle
            cx="55"
            cy={70 + i * 80}
            r="13"
            class={`node input ${hoveredNode === nkey ? "node-hot" : ""}`}
            on:mouseenter={() => { hoveredNode = nkey; hoveredEdge = ""; hoveredMatrix = "X"; }}
            on:mouseleave={() => { hoveredNode = ""; hoveredMatrix = ""; }}
          />
          <text x="55" y={74 + i * 80} text-anchor="middle" class="node-val" on:mouseenter={() => { hoveredNode = nkey; hoveredEdge = ""; hoveredMatrix = "X"; }} on:mouseleave={() => { hoveredNode = ""; hoveredMatrix = ""; }}>x{i + 1}</text>
        {/each}

        {#each [0, 1, 2] as j}
          {@const nkey = nodeKey("h", j)}
          <circle
            cx="195"
            cy={45 + j * 60}
            r="13"
            class={`node hidden ${isActive(A1[j]) ? "fire-on" : "fire-off"} ${hoveredNode === nkey ? "node-hot" : ""}`}
            on:mouseenter={() => { hoveredNode = nkey; hoveredEdge = ""; hoveredMatrix = "A1"; }}
            on:mouseleave={() => { hoveredNode = ""; hoveredMatrix = ""; }}
          />
          <text x="195" y={49 + j * 60} text-anchor="middle" class="node-val" on:mouseenter={() => { hoveredNode = nkey; hoveredEdge = ""; hoveredMatrix = "A1"; }} on:mouseleave={() => { hoveredNode = ""; hoveredMatrix = ""; }}>h{j + 1}</text>
        {/each}

        {#each [0, 1] as k}
          {@const nkey = nodeKey("o", k)}
          <circle
            cx="335"
            cy={90 + k * 50}
            r="13"
            class={`node output ${isActive(A2[k]) ? "fire-on" : "fire-off"} ${hoveredNode === nkey ? "node-hot" : ""}`}
            on:mouseenter={() => { hoveredNode = nkey; hoveredEdge = ""; hoveredMatrix = "A2"; }}
            on:mouseleave={() => { hoveredNode = ""; hoveredMatrix = ""; }}
          />
          <text x="335" y={94 + k * 50} text-anchor="middle" class="node-val" on:mouseenter={() => { hoveredNode = nkey; hoveredEdge = ""; hoveredMatrix = "A2"; }} on:mouseleave={() => { hoveredNode = ""; hoveredMatrix = ""; }}>o{k + 1}</text>
        {/each}

        {#each [0, 1] as i}
          {#each [0, 1, 2] as j}
            {@const key = edgeKey(0, i, j)}
            <line
              x1="68"
              y1={70 + i * 80}
              x2="182"
              y2={45 + j * 60}
              class={`edge ${hoveredEdge === key ? "hot" : ""}`}
              on:mouseenter={() => { hoveredEdge = key; hoveredNode = ""; hoveredMatrix = "W1"; }}
              on:mouseleave={() => { hoveredEdge = ""; hoveredMatrix = ""; }}
            />
          {/each}
        {/each}
        {#each [0, 1, 2] as j}
          {#each [0, 1] as k}
            {@const key = edgeKey(1, j, k)}
            <line
              x1="208"
              y1={45 + j * 60}
              x2="322"
              y2={90 + k * 50}
              class={`edge ${hoveredEdge === key ? "hot" : ""}`}
              on:mouseenter={() => { hoveredEdge = key; hoveredNode = ""; hoveredMatrix = "W2"; }}
              on:mouseleave={() => { hoveredEdge = ""; hoveredMatrix = ""; }}
            />
          {/each}
        {/each}
      </svg>
      <p class="mini">Hover the top labels to inspect matrices. Green border means firing, red means suppressed.</p>
    </section>

    <div class="controls">
      <label>x1
        <input type="range" min="-2" max="2" step="0.01" bind:value={x1} />
        <span>{x1.toFixed(2)}</span>
      </label>
      <label>x2
        <input type="range" min="-2" max="2" step="0.01" bind:value={x2} />
        <span>{x2.toFixed(2)}</span>
      </label>
      <label>Activation
        <select bind:value={activation}>
          <option value="relu">ReLU</option>
          <option value="tanh">tanh</option>
          <option value="sigmoid">sigmoid</option>
          <option value="gelu">GELU</option>
          <option value="silu">SiLU</option>
          <option value="linear">linear</option>
        </select>
      </label>
    </div>

    <section class="card full inspector-fallback">
      <p class="label">Matrix inspector</p>
      {#if hoveredMatrix === "X"}
        <p class="mini"><code>X</code> is the current input row vector (shape 1x2).</p>
        <table class="calc-table"><tbody><tr><td>{f(X[0])}</td><td>{f(X[1])}</td></tr></tbody></table>
      {:else if hoveredMatrix === "W1"}
        <p class="mini"><code>W1</code> maps input -> hidden (shape 2x3).</p>
        <table class="calc-table"><tbody>{#each W1 as row}<tr>{#each row as v}<td>{f(v)}</td>{/each}</tr>{/each}</tbody></table>
        <p class="mini">Multiply <code>X · W1</code>: each hidden unit gets two weighted terms.</p>
        <p class="mini"><code>h1: {f(X[0])}*{f(W1[0][0])} + {f(X[1])}*{f(W1[1][0])} = {f(Z1[0])}</code></p>
      {:else if hoveredMatrix === "A1"}
        <p class="mini"><code>A1</code> is hidden activation output (shape 1x3).</p>
        <table class="calc-table"><tbody><tr>{#each A1 as v}<td>{f(v)}</td>{/each}</tr></tbody></table>
        <p class="mini">This row becomes the input to the next matrix multiplication.</p>
      {:else if hoveredMatrix === "W2"}
        <p class="mini"><code>W2</code> maps hidden -> output (shape 3x2). Each column is one output neuron.</p>
        <table class="calc-table"><tbody>{#each W2 as row}<tr>{#each row as v}<td>{f(v)}</td>{/each}</tr>{/each}</tbody></table>
      {:else if hoveredMatrix === "A2"}
        <p class="mini"><code>A2</code> is the final output row (shape 1x2).</p>
        <table class="calc-table"><tbody><tr>{#each A2 as v}<td>{f(v)}</td>{/each}</tr></tbody></table>
      {:else}
        <p class="mini">Hover one of the top labels (<code>X</code>, <code>W1</code>, <code>A1</code>, <code>W2</code>, <code>A2</code>) to inspect that matrix and the multiplication step.</p>
      {/if}
    </section>
  </div>

  <section class="card explain">
    <p class="label">How multiplication maps to connections</p>
    <p class="mini">
      Column <code>j</code> in <code>W1</code> contains weights feeding hidden neuron <code>j</code>. Row <code>i</code>
      corresponds to input feature <code>i</code>. So each hidden pre-activation is:
      <code>z1_j = x1*w1_1j + x2*w1_2j</code>.
    </p>
    <p class="mini">
      The second layer repeats that pattern with <code>A1</code> as input:
      <code>z2_k = a1_1*w2_1k + a1_2*w2_2k + a1_3*w2_3k</code>.
      This is exactly the graph computation, just vectorized.
    </p>
    <p class="mini">
      In matrix form, we avoid writing each neuron separately:
      <code>[x1 x2] · W1 = [z1_1 z1_2 z1_3]</code>,
      then activation applies element-wise to produce <code>A1</code>.
      That <code>A1</code> row is then multiplied by <code>W2</code> to produce both output neurons at once.
    </p>
    <p class="mini">
      Example from the current sliders:
      <code>z1_1 = {f(X[0])}*{f(W1[0][0])} + {f(X[1])}*{f(W1[1][0])} = {f(Z1[0])}</code>.
      If activation suppresses this value (for example ReLU on negative values), that path contributes less or zero to the next layer.
    </p>
  </section>
</section>

<style>
  .dense-chapter { display: grid; gap: .9rem; }
  .intro p { margin: 0; font-size: 1rem; line-height: 1.6; color: var(--text-secondary); }
  code { font-family: "IBM Plex Mono", "SFMono-Regular", monospace; }
  .controls { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap:.6rem; border:1px solid var(--border-subtle); border-radius:12px; background:rgba(255,255,255,.58); padding:.65rem; }
  label { display:grid; gap:.25rem; font-size:.78rem; color:var(--text-secondary); }
  .layout { display:grid; grid-template-columns: 1fr; gap:.65rem; }
  .card.full { width: 100%; }
  .diagram-card svg {
    width: min(100%, 760px);
    margin: 0 auto;
    display: block;
  }
  .diagram-card {
    position: relative;
  }
  .floating-inspector {
    position: absolute;
    top: 2rem;
    left: 50%;
    width: min(470px, calc(100% - 1.3rem));
    border: 1px solid var(--border-subtle);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 12px 30px rgba(39, 39, 42, 0.16);
    padding: 0.5rem;
    opacity: 0;
    pointer-events: none;
    transform: translate(-50%, -4px);
    transition: opacity 120ms ease, transform 120ms ease;
    z-index: 8;
  }
  .floating-inspector.visible {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  .card { border:1px solid var(--border-subtle); border-radius:12px; background:rgba(255,255,255,.62); padding:.65rem; display:grid; gap:.42rem; align-content:start; }
  .label { margin:0; font-size:.72rem; letter-spacing:.05em; text-transform:uppercase; color:var(--text-muted); }
  .mini { margin:0; font-size:.83rem; line-height:1.55; color:var(--text-secondary); }
  .node { stroke-width:1.2; }
  .node.input { fill: rgba(14,116,144,.1); stroke: rgba(14,116,144,.45); }
  .node.hidden { fill: rgba(217,119,6,.1); stroke: rgba(217,119,6,.45); }
  .node.output { fill: rgba(124,58,237,.1); stroke: rgba(124,58,237,.45); }
  .node.fire-on { stroke: #16a34a; stroke-width: 2.2; }
  .node.fire-off { stroke: #dc2626; stroke-width: 2.2; }
  .node.node-hot { filter: drop-shadow(0 0 2px rgba(14,116,144,.5)); stroke: #0e7490; stroke-width: 2.6; }
  .node-val { font-size: 10px; fill: #1f2937; font-family: "IBM Plex Mono", "SFMono-Regular", monospace; }
  .node-val { pointer-events: all; cursor: default; }
  .col-label {
    font-size: 10px;
    fill: #475569;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    pointer-events: all;
    cursor: default;
  }
  .edge { stroke: rgba(71,85,105,.45); stroke-width: 1.2; }
  .edge.hot { stroke: #0e7490; stroke-width: 2.2; }
  .col-label.active {
    fill: #0e7490;
    font-weight: 700;
  }
  .calc-table {
    width: 100%;
    border-collapse: collapse;
  }
  .calc-table td {
    border: 1px solid rgba(39,39,42,.14);
    border-radius: 8px;
    padding: 0.35rem 0.4rem;
    font-size: 0.74rem;
    line-height: 1.35;
    vertical-align: top;
    background: rgba(255,255,255,.78);
  }
  .calc-table {
    margin-bottom: 0.45rem;
  }
  .calc-table td.hot {
    background: rgba(14, 116, 144, 0.2);
    border-color: rgba(14, 116, 144, 0.58);
    box-shadow: inset 0 0 0 1px rgba(14, 116, 144, 0.32);
  }
  .calc-table td strong {
    color: #1f2937;
    font-family: "IBM Plex Mono", "SFMono-Regular", monospace;
    font-size: 0.78rem;
  }
  @media (max-width: 980px) {
    .controls { grid-template-columns: 1fr; }
    .floating-inspector {
      display: none;
    }
  }
  .inspector-fallback {
    display: none;
  }
  @media (max-width: 980px) {
    .inspector-fallback {
      display: grid;
    }
  }
</style>
