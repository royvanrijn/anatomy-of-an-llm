<script lang="ts">
  import FlowPath from "../FlowPath.svelte";
  import {
    applyTopK,
    argmaxIndex,
    sampleIndex,
    softmaxWithTemperature,
    type SamplingMode
  } from "../../utils/sampling";

  const vocab = [" calm", " inside", " outside", " cold", " angry", ".", ","];
  const flowSteps = [
    { label: "01", title: "Hidden" },
    { label: "02", title: "Vocab projection" },
    { label: "03", title: "Logits" },
    { label: "04", title: "Softmax(T)" },
    { label: "05", title: "Probabilities" },
    { label: "06", title: "Sampled token" }
  ];
  const hidden = [0.82, -0.35, 0.41, 0.18];
  const projection = [
    [0.62, -0.31, 0.44, 0.09],
    [0.48, 0.15, -0.11, 0.27],
    [0.29, -0.06, 0.33, 0.51],
    [-0.21, 0.72, -0.14, 0.16],
    [-0.55, 0.34, -0.62, -0.08],
    [0.12, 0.49, 0.05, -0.03],
    [0.08, 0.17, -0.22, 0.31]
  ];

  let temperature = 1;
  let mode: SamplingMode = "sampling";
  let topK = 0;
  let run10: { token: string; idx: number }[] = [];

  $: logits = projection.map((row) => hidden.reduce((acc, h, i) => acc + h * row[i], 0));
  $: baseProbs = softmaxWithTemperature(logits, temperature);
  $: probs = applyTopK(baseProbs, topK);
  $: bestIdx = argmaxIndex(probs);
  $: if (mode === "greedy" && topK !== 0) topK = 0;

  function doGenerate() {
    run10 = [];
    for (let i = 0; i < 10; i++) {
      const idx = mode === "greedy" ? argmaxIndex(probs) : sampleIndex(probs, Math.random());
      run10.push({ token: vocab[idx], idx });
    }
  }

  function pct(v: number) {
    return `${(v * 100).toFixed(1)}%`;
  }
</script>

<section class="logits-sampling">
  <div class="intro">
    <p>
      A model converts the final hidden vector into one score per vocabulary token. Those raw scores are logits.
      Softmax turns them into probabilities, and sampling chooses the next token.
    </p>
    <FlowPath steps={flowSteps} ariaLabel="Logits to sampled token path" />
  </div>

  <div class="controls">
    <label>Temperature
      <input type="range" min="0.2" max="2" step="0.05" bind:value={temperature} />
      <span>{temperature.toFixed(2)}</span>
    </label>
    <label>Mode
      <select bind:value={mode}>
        <option value="sampling">Sampling</option>
        <option value="greedy">Greedy</option>
      </select>
    </label>
    <label>Top-k (optional)
      <select bind:value={topK} disabled={mode === "greedy"}>
        <option value={0}>off</option>
        <option value={3}>3</option>
        <option value={5}>5</option>
      </select>
    </label>
    <div class="btns">
      <button type="button" on:click={doGenerate}>Generate</button>
    </div>
  </div>

  <div class="cards">
    <section class="card">
      <p class="label">Logits</p>
      {#each vocab as token, i}
        <div class="row">
          <span class="tok">{token}</span>
          <div class="bar-wrap"><div class="bar logit" style={`width:${Math.max(6, Math.abs(logits[i]) * 46)}px;`} /></div>
          <code>{logits[i].toFixed(2)}</code>
        </div>
      {/each}
    </section>

    <section class="card">
      <p class="label">Probabilities (after softmax)</p>
      {#each vocab as token, i}
        <div class="row">
          <span class="tok">{token}</span>
          <div class="bar-wrap"><div class={`bar prob ${i === bestIdx ? "best" : ""}`} style={`width:${Math.max(6, probs[i] * 260)}px;`} /></div>
          <code>{pct(probs[i])}</code>
        </div>
      {/each}
    </section>
  </div>

  <section class="card">
    <p class="label">Sampled output</p>
    <p class="mini">Generated sequence (10 tokens): {#if run10.length === 0}<code>(click generate)</code>{:else}{#each run10 as item}<code>{item.token}</code>{/each}{/if}</p>
  </section>
</section>

<style>
  .logits-sampling { display:grid; gap:.9rem; }
  .intro p { margin:0; color:var(--text-secondary); line-height:1.6; }
  .controls {
    display:grid;
    grid-template-columns: repeat(4,minmax(0,1fr));
    gap:.55rem;
    border:1px solid var(--border-subtle);
    border-radius:12px;
    background:rgba(255,255,255,.6);
    padding:.65rem;
  }
  label { display:grid; gap:.25rem; font-size:.78rem; color:var(--text-secondary); }
  .btns { display:flex; gap:.4rem; align-items:end; }
  button {
    border:1px solid var(--border-subtle);
    border-radius:8px;
    background:rgba(255,255,255,.9);
    padding:.35rem .52rem;
    font-size:.76rem;
  }
  .cards { display:grid; grid-template-columns: 1fr 1fr; gap:.65rem; }
  .card {
    border:1px solid var(--border-subtle);
    border-radius:12px;
    background:rgba(255,255,255,.62);
    padding:.65rem;
    display:grid;
    gap:.4rem;
  }
  .label { margin:0; font-size:.72rem; letter-spacing:.05em; text-transform:uppercase; color:var(--text-muted); }
  .row { display:grid; grid-template-columns: 72px 1fr auto; gap:.45rem; align-items:center; }
  .tok { font-size:.82rem; color:var(--text-secondary); font-family:"IBM Plex Mono","SFMono-Regular",monospace; }
  .bar-wrap { height:14px; display:flex; align-items:center; }
  .bar { height:10px; border-radius:99px; }
  .bar.logit { background:rgba(71,85,105,.52); }
  .bar.prob { background:rgba(14,116,144,.42); }
  .bar.prob.best { background:rgba(217,119,6,.58); }
  .mini { margin:0; font-size:.84rem; color:var(--text-secondary); line-height:1.6; }
  code { font-family:"IBM Plex Mono","SFMono-Regular",monospace; }
  @media (max-width: 980px) {
    .controls { grid-template-columns: 1fr; }
    .cards { grid-template-columns: 1fr; }
  }

  @media (max-width: 640px) {
    .controls,
    .card {
      padding: 0.56rem;
    }

    .btns {
      align-items: stretch;
    }

    .btns button {
      width: 100%;
    }

    .row {
      grid-template-columns: 4.1rem minmax(0, 1fr) 3.1rem;
      gap: 0.32rem;
    }

  }
</style>
