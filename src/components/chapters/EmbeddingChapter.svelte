<script lang="ts">
  import DimensionOverlay from "../DimensionOverlay.svelte";
  type TokenItem = {
    id: number;
    piece: string;
    pieceVisible: string;
  };

  type TokenExample = {
    id: string;
    label: string;
    text: string;
    tokens: TokenItem[];
  };

  type EmbeddingRow = {
    tokenId: number;
    rowIndex: number;
    vector: number[];
    projection2d: { x: number; y: number };
  };
  type Point = { x: number; y: number };

  export let tokenizationData: {
    encoding: string;
    examples: TokenExample[];
  };

  export let embeddingData: {
    dimension: number;
    note: string;
    rows: EmbeddingRow[];
  };

  let selectedExampleId = tokenizationData.examples[0]?.id ?? "";
  let selectedTokenIndex = 0;
  let relationPreset = 0;
  const PREVIEW_DIMS = embeddingData.dimension;
  const relationPresets = [
    {
      leftA: "puppy",
      leftB: "dog",
      rightA: "kitten",
      rightB: "cat",
      p1: { x: 72, y: 104 },
      p2: { x: 154, y: 62 },
      p3: { x: 202, y: 99 },
      p4: { x: 286, y: 55 }
    },
    {
      leftA: "spark",
      leftB: "flame",
      rightA: "drop",
      rightB: "wave",
      p1: { x: 70, y: 66 },
      p2: { x: 168, y: 58 },
      p3: { x: 206, y: 87 },
      p4: { x: 302, y: 78 }
    },
    {
      leftA: "rookie",
      leftB: "veteran",
      rightA: "draft",
      rightB: "editor",
      p1: { x: 82, y: 52 },
      p2: { x: 166, y: 99 },
      p3: { x: 214, y: 47 },
      p4: { x: 295, y: 97 }
    }
  ];

  function shortenSegment(start: Point, end: Point, radius = 7) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    return {
      x1: start.x + ux * radius,
      y1: start.y + uy * radius,
      x2: end.x - ux * radius,
      y2: end.y - uy * radius
    };
  }

  $: selectedExample =
    tokenizationData.examples.find((example) => example.id === selectedExampleId) ??
    tokenizationData.examples[0];
  $: selectedTokens = Array.isArray(selectedExample?.tokens) ? selectedExample.tokens : [];
  $: selectedToken = selectedTokens[Math.min(selectedTokenIndex, Math.max(0, selectedTokens.length - 1))];
  $: selectedRow = embeddingData.rows.find((row) => row.tokenId === selectedToken?.id);
  $: vectorPreview = selectedRow?.vector.slice(0, PREVIEW_DIMS) ?? [];
  $: activeRelation = relationPresets[relationPreset] ?? relationPresets[0];
  $: relationA = shortenSegment(activeRelation.p1, activeRelation.p2, 7.2);
  $: relationB = shortenSegment(activeRelation.p3, activeRelation.p4, 7.2);
</script>

<section class="embedding-chapter">
  <div class="explainer">
    <p class="title">From token ID to vector</p>
    <p>
      After tokenization, each token ID is used as an index into an embedding table. The selected row is a
      high-dimensional vector that becomes the model's starting representation for that token.
    </p>
    <p class="note">
      For readability, this chapter uses a toy embedding width of {embeddingData.dimension} dimensions. Real model widths are
      usually much larger, common production widths include 768, 1024, 1536, 3072, and even higher.
    </p>
    <p class="note">
      An embedded vector is just a list of floating point numbers:
      <span class="inline-token">dog</span> = 
      <span class="inline-template">[0.7292, -0.3786, 0.1065, 0.3674, 0.1902, -0.7881, ... ]</span>
    </p>
    <DimensionOverlay
      buttonLabel="Explain vector dimensions"
      title="Embedding Dimensions In This Chapter"
      summary="We map each token ID to one embedding row vector."
      equations={[
        "v_token = EmbeddingTable[token_id]",
        "EmbeddingTable shape: vocab_size x d_model",
        "Toy chapter: d_model = 24"
      ]}
      items={[
        "vocab_size = number of token IDs in the tokenizer vocabulary",
        "24 = d_model in this toy example (24 floating-point values per token)",
        "One selected token ID retrieves exactly one row: a 1x24 embedding vector",
        "All tokens share the same embedding table; only the row index changes"
      ]}
      note="Real models often use much larger d_model widths; the lookup rule is unchanged."
    />
  </div>

  <section class="controls">
    <label>
      Example sentence
      <select bind:value={selectedExampleId} on:change={() => (selectedTokenIndex = 0)}>
        {#each tokenizationData.examples as example}
          <option value={example.id}>{example.label}</option>
        {/each}
      </select>
    </label>
    <label>
      Token in sentence
      <select bind:value={selectedTokenIndex}>
        {#each selectedTokens as token, idx}
          <option value={idx}>{token.pieceVisible || token.piece} (#{token.id})</option>
        {/each}
      </select>
    </label>
  </section>

  <div class="mapping">
    <div class="chip">{selectedToken?.pieceVisible || selectedToken?.piece || "token piece"}</div>
    <span class="arrow">-></span>
    <div class="chip">token ID #{selectedToken?.id ?? 0}</div>
    <span class="arrow">-></span>
    <div class="chip">embedding row {selectedRow?.rowIndex ?? 0}</div>
  </div>

  <section class="vector-values">
    <p class="label">Embedding values ({PREVIEW_DIMS} dimensions)</p>
    <p class="small-note">
      This explainer shows all {PREVIEW_DIMS} values from the toy vector.
    </p>
    <div class="value-grid">
      {#each vectorPreview as value}
        <div class="value-cell">
          <code>{value}</code>
        </div>
      {/each}
    </div>
      <p class="small-note">
      The same token ID always maps to the same embedding vector.
    </p>
  </section>

  <div class="explainer">
    <p class="note">
      In real models, these embedding values are learned during training. Tokens that appear in similar contexts are gradually
      moved to useful regions of vector space, so the vectors end up encoding patterns the model can build on.
    </p>
    <p class="note">
      Tokens that often play similar roles get nudged in similar directions. For example, the tokens
      <span class="inline-token">cat</span>, <span class="inline-token">dog</span>, and
      <span class="inline-token">rabbit</span> often appear in sentence templates like
      <span class="inline-template">"The ___ is sleeping"</span>,
      <span class="inline-template">"I fed the ___"</span>, or
      <span class="inline-template">"The ___ ran away"</span>. Because they appear in similar contexts, their vectors may end
      up close together.
    </p>
    <p class="note">
      But <span class="inline-token">cat</span> and <span class="inline-token">car</span> usually appear in very different
      contexts, so their vectors tend to end up farther apart.
    </p>
    <p class="note">
        The embedding space is not hand-designed. Nobody tells the model “put animals over here” or “put verbs over there”. Those patterns emerge because moving the vectors that way helps the model predict text better.
    </p>
  </div>

  <section class="analogy">
    <p class="label">2D analogy intuition</p>
    <p class="small-note">
      Distances between embedding vectors often similar if they have a similar relationship.
    </p>
    <div class="relation-switch" role="group" aria-label="Relation preset">
      {#each relationPresets as preset, idx}
        <button
          type="button"
          class:active={idx === relationPreset}
          on:click={() => (relationPreset = idx)}
        >
          {preset.leftA} -> {preset.leftB}
        </button>
      {/each}
    </div>
    <div class="plane">
      <svg viewBox="0 0 360 140" role="img" aria-label="2D relation offset analogy">
        <defs>
          <marker id="arrowhead" markerWidth="5" markerHeight="5" refX="4.3" refY="2.5" orient="auto">
            <polygon points="0 0, 5 2.5, 0 5" fill="#9ca3af" />
          </marker>
        </defs>

        <line
          x1={relationA.x1}
          y1={relationA.y1}
          x2={relationA.x2}
          y2={relationA.y2}
          stroke="#9ca3af"
          stroke-width="1.7"
          stroke-dasharray="3 3"
          stroke-linecap="round"
          marker-end="url(#arrowhead)"
          class="relation-line"
        />
        <line
          x1={relationB.x1}
          y1={relationB.y1}
          x2={relationB.x2}
          y2={relationB.y2}
          stroke="#9ca3af"
          stroke-width="1.7"
          stroke-dasharray="3 3"
          stroke-linecap="round"
          marker-end="url(#arrowhead)"
          class="relation-line"
        />

        <circle
          cx={activeRelation.p1.x}
          cy={activeRelation.p1.y}
          r="5.6"
          fill="#64748b"
          stroke="#475569"
          stroke-width="0.9"
          class="relation-node"
        />
        <circle
          cx={activeRelation.p2.x}
          cy={activeRelation.p2.y}
          r="5.6"
          fill="#64748b"
          stroke="#475569"
          stroke-width="0.9"
          class="relation-node"
        />
        <circle
          cx={activeRelation.p3.x}
          cy={activeRelation.p3.y}
          r="5.6"
          fill="#64748b"
          stroke="#475569"
          stroke-width="0.9"
          class="relation-node"
        />
        <circle
          cx={activeRelation.p4.x}
          cy={activeRelation.p4.y}
          r="5.6"
          fill="#64748b"
          stroke="#475569"
          stroke-width="0.9"
          class="relation-node"
        />

        <text x={activeRelation.p1.x - 23} y={activeRelation.p1.y + 16}>{activeRelation.leftA}</text>
        <text x={activeRelation.p2.x - 7} y={activeRelation.p2.y - 10}>{activeRelation.leftB}</text>
        <text x={activeRelation.p3.x - 24} y={activeRelation.p3.y + 16}>{activeRelation.rightA}</text>
        <text x={activeRelation.p4.x - 8} y={activeRelation.p4.y - 10}>{activeRelation.rightB}</text>
      </svg>
    </div>
  </section>
</section>

<style>
  .embedding-chapter {
    display: grid;
    gap: 0.95rem;
  }

  .explainer {
    display: grid;
    gap: 0.45rem;
  }

  .title {
    margin: 0;
    font-size: 0.86rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #155e75;
  }

  .explainer p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 1rem;
    line-height: 1.6;
  }

  .note {
    color: #4b5563;
    font-size: 1rem;
  }

  .controls {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.55rem;
    align-items: end;
  }

  label {
    font-size: 0.78rem;
    color: var(--text-secondary);
    display: grid;
    gap: 0.3rem;
  }

  select {
    border: 1px solid var(--border-subtle);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.94);
    color: var(--text-primary);
    padding: 0.38rem 0.45rem;
    font-size: 0.8rem;
  }

  .mapping {
    border: 1px solid rgba(39, 39, 42, 0.12);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.7);
    padding: 0.62rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    align-items: center;
  }

  .chip {
    border: 1px solid rgba(39, 39, 42, 0.14);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.85);
    padding: 0.28rem 0.55rem;
    font-size: 0.76rem;
    color: #374151;
  }

  .arrow {
    color: #64748b;
    font-size: 0.84rem;
  }

  .vector-values {
    border: 1px solid rgba(39, 39, 42, 0.12);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.62);
    padding: 0.72rem;
  }

  .label {
    margin: 0 0 0.45rem;
    font-size: 0.72rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .value-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 0.4rem;
    margin-top: 0.45rem;
    margin-bottom: 0.55rem;
  }

  .value-cell {
    display: grid;
    gap: 0.18rem;
    border: 1px solid rgba(39, 39, 42, 0.12);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.78);
    padding: 0.4rem 0.45rem;
  }

  code {
    font-family: "IBM Plex Mono", "SFMono-Regular", monospace;
    font-size: 0.76rem;
    color: #1f2937;
  }

  .small-note {
    margin: 0.2rem 0 0;
    font-size: 0.78rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .inline-token {
    display: inline-block;
    border: 1px solid rgba(14, 165, 198, 0.28);
    border-radius: 999px;
    background: rgba(14, 165, 198, 0.1);
    color: #0f5b70;
    padding: 0.08rem 0.42rem;
    font-family: "IBM Plex Mono", "SFMono-Regular", monospace;
    font-size: 0.84em;
    line-height: 1.2;
    vertical-align: baseline;
  }

  .inline-template {
    display: inline-block;
    border: 1px solid rgba(109, 91, 208, 0.24);
    border-radius: 7px;
    background: rgba(109, 91, 208, 0.09);
    color: #4b3fa8;
    padding: 0.08rem 0.35rem;
    font-family: "IBM Plex Mono", "SFMono-Regular", monospace;
    font-size: 0.82em;
    line-height: 1.2;
    vertical-align: baseline;
  }

  .analogy {
    border: 1px solid rgba(39, 39, 42, 0.12);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.62);
    padding: 0.72rem;
  }

  .relation-switch {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.45rem;
  }

  .relation-switch button {
    border: 1px solid rgba(39, 39, 42, 0.14);
    background: rgba(255, 255, 255, 0.78);
    color: #4b5563;
    border-radius: 999px;
    padding: 0.25rem 0.56rem;
    font-size: 0.72rem;
    cursor: pointer;
  }

  .relation-switch button.active {
    border-color: rgba(109, 91, 208, 0.4);
    background: rgba(109, 91, 208, 0.14);
    color: #4338ca;
  }

  .plane {
    margin-top: 0.55rem;
    border: 1px dashed rgba(39, 39, 42, 0.18);
    border-radius: 10px;
    background:
      radial-gradient(circle at 20% 20%, rgba(14, 165, 198, 0.08), transparent 45%),
      radial-gradient(circle at 82% 24%, rgba(109, 91, 208, 0.08), transparent 45%),
      rgba(255, 255, 255, 0.74);
    padding: 0.35rem;
  }

  svg {
    width: 100%;
    height: auto;
    display: block;
  }

  .relation-line,
  .relation-node {
    transition: all 340ms ease;
  }

  text {
    font-family: "IBM Plex Sans", "Avenir Next", "Segoe UI", sans-serif;
    font-size: 10px;
    fill: #374151;
  }

  @media (max-width: 900px) {
    .controls {
      grid-template-columns: 1fr;
    }

    .value-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
</style>
