<script lang="ts">
  import FlowPath from "../FlowPath.svelte";
  import {
    applyGradientStep,
    backwardPass,
    createInitialBackpropModel,
    forwardPass,
    type BackwardResult,
    type ForwardResult,
    type Matrix
  } from "../../utils/backprop";

  const prompt = "Three, two, one...";
  const vocab = [" rock", " paper", " scissors"];
  const flowSteps = [
    { label: "01", title: "Select target" },
    { label: "02", title: "Forward snapshot" },
    { label: "03", title: "Calculate backward" },
    { label: "04", title: "Apply update" }
  ];
  const x = [0.7, -0.4];
  const xYs = [60, 120];
  const h1Ys = [50, 130];
  const h2Ys = [60, 120];
  const logitYs = [50, 90, 130];

  let model = createInitialBackpropModel();
  let target: number | "" = "";
  let learningRate = 0.35;
  let uiStep: "idle" | "predicted" | "backwardReady" | "updated" = "idle";

  let forwardSnapshot: ForwardResult | null = null;
  let backwardData: BackwardResult | null = null;
  let afterUpdate: ForwardResult | null = null;

  $: targetIndex = target === "" ? -1 : Number(target);
  $: hasTarget = target !== "" && Number.isInteger(targetIndex) && targetIndex >= 0 && targetIndex < vocab.length;

  $: targetForward = hasTarget ? forwardPass(model, x, targetIndex) : null;
  $: shownForward = afterUpdate ?? targetForward ?? forwardSnapshot;
  $: shownMaxProb = shownForward ? Math.max(...shownForward.probs) : 1;

  $: blame = backwardData
    ? {
        output: backwardData.dLogits.reduce((acc, v) => acc + Math.abs(v), 0),
        hidden2: backwardData.dz2.reduce((acc, v) => acc + Math.abs(v), 0),
        hidden1: backwardData.dz1.reduce((acc, v) => acc + Math.abs(v), 0)
      }
    : null;
  $: maxBlame = blame ? Math.max(blame.output, blame.hidden2, blame.hidden1, 1e-6) : 1;

  $: w1Max = backwardData ? Math.max(...backwardData.dW1.flat().map((v) => Math.abs(v)), 1e-6) : 1;
  $: w2Max = backwardData ? Math.max(...backwardData.dW2.flat().map((v) => Math.abs(v)), 1e-6) : 1;
  $: w3Max = backwardData ? Math.max(...backwardData.dW3.flat().map((v) => Math.abs(v)), 1e-6) : 1;
  $: predictedIdx = shownForward ? shownForward.prediction : -1;

  function onTargetPick(value: number) {
    target = value;
    afterUpdate = null;
    if (forwardSnapshot && Number.isInteger(value) && value >= 0 && value < vocab.length) {
      backwardData = backwardPass(model, x, value);
      uiStep = "backwardReady";
      return;
    }
    backwardData = null;
    uiStep = forwardSnapshot ? "predicted" : "idle";
  }

  function runForwardPrediction() {
    // Target is unknown at this stage; use a placeholder target only to reuse forward math.
    forwardSnapshot = forwardPass(model, x, 0);
    backwardData = null;
    afterUpdate = null;
    uiStep = "predicted";
  }

  function applyUpdate() {
    if (!hasTarget || !backwardData) return;
    model = applyGradientStep(model, backwardData, learningRate);
    afterUpdate = forwardPass(model, x, targetIndex);
    uiStep = "updated";
  }

  function resetModel() {
    model = createInitialBackpropModel();
    target = "";
    forwardSnapshot = null;
    backwardData = null;
    afterUpdate = null;
    uiStep = "idle";
  }

  function fmt(v: number) {
    return `${v >= 0 ? "+" : ""}${v.toFixed(3)}`;
  }

  function fmtPct(v: number) {
    return `${(v * 100).toFixed(1)}%`;
  }

  function sumAbs(matrix: Matrix): number {
    return matrix.flat().reduce((acc, v) => acc + Math.abs(v), 0);
  }

  $: isPredictStep = uiStep === "idle";
  $: isTargetStep = uiStep === "predicted" || uiStep === "updated";
  $: isUpdateStep = uiStep === "backwardReady";
</script>

<section class="backprop">
  <div class="intro">
    <p>
      We will train on one tiny example and reveal each step in order: forward prediction, backward gradients, then
      the weight update.
    </p>
    <FlowPath steps={flowSteps} ariaLabel="Backpropagation learning path" />
  </div>

  <section class="card training-card">
    <p class="label">Step 1 - Predict from input</p>
    <div class="prompt-line" role="group" aria-label="Prompt with target token selector">
      <span>{prompt}</span>
      <span class="prompt-blank">___</span>
    </div>

    <div class="controls-inline">
      <button type="button" class:next-action={isPredictStep} on:click={runForwardPrediction}>Run prediction</button>
      <button type="button" on:click={resetModel}>Reset</button>
      <label>Learning rate
        <input type="range" min="0.05" max="0.7" step="0.01" bind:value={learningRate} />
        <span>{learningRate.toFixed(2)}</span>
      </label>
    </div>
  </section>

  {#if forwardSnapshot}
    <section class="card wide">
      <p class="label">Step 2 - Forward pass snapshot</p>
      {#each vocab as token, i}
        <div class="row">
          <span class="tok">{token.trim().toLowerCase()}</span>
          <div class="bar-wrap"><div class={`bar ${i === shownForward.prediction ? "pred" : ""} ${i === targetIndex ? "target" : ""}`} style={`width:${Math.max(8, (shownForward.probs[i] / shownMaxProb) * 260)}px;`} /></div>
          <code>{fmtPct(shownForward.probs[i])}</code>
        </div>
      {/each}
      {#if hasTarget}
        <p class="mini">
          Predicted: <code>{vocab[shownForward.prediction].trim().toLowerCase()}</code>
          · Target:
          <code class={shownForward.prediction === targetIndex ? "pred-ok" : "pred-bad"}>
            {vocab[targetIndex].trim().toLowerCase()}
          </code>
          · Loss: <code>{shownForward.loss.toFixed(4)}</code>
        </p>
      {:else}
        <p class="mini">
          Predicted: <code>{vocab[shownForward.prediction].trim().toLowerCase()}</code>
          · Target: <code>(not set yet)</code>
        </p>
      {/if}
    </section>
  {/if}

  {#if forwardSnapshot}
    <section class="card wide">
      <p class="label">Step 3 - Tell the model the correct answer</p>
      <p class="mini">
        The model predicted <code>{vocab[forwardSnapshot.prediction].trim().toLowerCase()}</code>. Now choose the token from the input data so we can compute error and learn.
      </p>
      <div class="target-picker" role="group" aria-label="Actual next token">
        <span>Actual next token</span>
        <div class="target-buttons">
          {#each vocab as token, i}
            <button
              type="button"
              class="token-btn"
              class:next-action={isTargetStep}
              on:click={() => onTargetPick(i)}
            >
              {token.trim().toLowerCase()}
            </button>
          {/each}
        </div>
      </div>
    </section>
  {/if}

  {#if backwardData && blame}
    <section class="card wide">
      <p class="label">Step 4 - Backward pass (what should change)</p>
      <div class="flow-row">
        <span>Output error <code>δlogits</code></span>
        <div class="flow-bar"><div style={`width:${(blame.output / maxBlame) * 100}%`} /></div>
        <code>{blame.output.toFixed(3)}</code>
      </div>
      <div class="flow-row">
        <span>Hidden layer 2 <code>δz2</code></span>
        <div class="flow-bar"><div style={`width:${(blame.hidden2 / maxBlame) * 100}%`} /></div>
        <code>{blame.hidden2.toFixed(3)}</code>
      </div>
      <div class="flow-row">
        <span>Hidden layer 1 <code>δz1</code></span>
        <div class="flow-bar"><div style={`width:${(blame.hidden1 / maxBlame) * 100}%`} /></div>
        <code>{blame.hidden1.toFixed(3)}</code>
      </div>

      <div class="grad-grids">
        <div>
          <p class="mini"><code>dW3</code> (2x3)</p>
          <table><tbody>{#each backwardData.dW3 as row}<tr>{#each row as v}<td>{fmt(v)}</td>{/each}</tr>{/each}</tbody></table>
        </div>
        <div>
          <p class="mini"><code>dW2</code> (2x2)</p>
          <table><tbody>{#each backwardData.dW2 as row}<tr>{#each row as v}<td>{fmt(v)}</td>{/each}</tr>{/each}</tbody></table>
        </div>
        <div>
          <p class="mini"><code>dW1</code> (2x2)</p>
          <table><tbody>{#each backwardData.dW1 as row}<tr>{#each row as v}<td>{fmt(v)}</td>{/each}</tr>{/each}</tbody></table>
        </div>
      </div>

      <div class="step-actions bottom">
        <button
          type="button"
          class:next-action={isUpdateStep}
          on:click={applyUpdate}
          disabled={!backwardData || !!afterUpdate}
        >
          Apply update
        </button>
      </div>
    </section>
  {/if}

  {#if afterUpdate && backwardData}
    <section class="card wide">
      <p class="label">Step 5 - After update (how error propagates through layers)</p>
      <div class="cards explain-two">
        <section class="card sub">
          <svg viewBox="0 0 390 180" role="img" aria-label="fully connected network with backward error flow">
            {#each xYs as yIn, i}
              {#each h1Ys as yOut, j}
                <line x1="55" y1={yIn} x2="165" y2={yOut} class="fwd" />
                {#if backwardData}
                  <line
                    x1="158"
                    y1={yOut}
                    x2="62"
                    y2={yIn}
                    class="back"
                    style={`opacity:${0.12 + (Math.abs(backwardData.dW1[i][j]) / w1Max) * 0.88}`}
                  />
                {/if}
              {/each}
            {/each}

            {#each h1Ys as yIn, i}
              {#each h2Ys as yOut, j}
                <line x1="165" y1={yIn} x2="255" y2={yOut} class="fwd" />
                {#if backwardData}
                  <line
                    x1="248"
                    y1={yOut}
                    x2="172"
                    y2={yIn}
                    class="back"
                    style={`opacity:${0.12 + (Math.abs(backwardData.dW2[i][j]) / w2Max) * 0.88}`}
                  />
                {/if}
              {/each}
            {/each}

            {#each h2Ys as yIn, i}
              {#each logitYs as yOut, j}
                <line x1="255" y1={yIn} x2="335" y2={yOut} class="fwd" />
                {#if backwardData}
                  <line
                    x1="328"
                    y1={yOut}
                    x2="262"
                    y2={yIn}
                    class="back"
                    style={`opacity:${0.12 + (Math.abs(backwardData.dW3[i][j]) / w3Max) * 0.88}`}
                  />
                {/if}
              {/each}
            {/each}

            <circle cx="55" cy="60" r="10" class="node input" />
            <circle cx="55" cy="120" r="10" class="node input" />
            <circle cx="165" cy="50" r="10" class="node hidden" />
            <circle cx="165" cy="130" r="10" class="node hidden" />
            <circle cx="255" cy="60" r="10" class="node hidden2" />
            <circle cx="255" cy="120" r="10" class="node hidden2" />
            <circle cx="335" cy="50" r="10" class={`node output ${targetIndex === 0 ? "target" : ""} ${predictedIdx === 0 ? "pred" : ""}`} />
            <circle cx="335" cy="90" r="10" class={`node output ${targetIndex === 1 ? "target" : ""} ${predictedIdx === 1 ? "pred" : ""}`} />
            <circle cx="335" cy="130" r="10" class={`node output ${targetIndex === 2 ? "target" : ""} ${predictedIdx === 2 ? "pred" : ""}`} />

            <text x="55" y="24" text-anchor="middle" class="viz-label">x</text>
            <text x="165" y="24" text-anchor="middle" class="viz-label">h1</text>
            <text x="255" y="24" text-anchor="middle" class="viz-label">h2</text>
            <text x="335" y="24" text-anchor="middle" class="viz-label">logits</text>
          </svg>
          <p class="mini">Blue = all forward connections. Orange = backward error on all connections (stronger color means larger gradient).</p>
        </section>

        <section class="card sub">
          <p class="mini">The output error starts at logits, then is multiplied backward through each layer's local slope.</p>
          <p class="mini"><code>dW3[0,target] = a2[0] * δlogits[target] = {fmt(backwardData.a2[0])} * {fmt(backwardData.dLogits[targetIndex])} = {fmt(backwardData.dW3[0][targetIndex])}</code></p>
          <p class="mini"><code>δz2[0] = (Σ W3[0,j] * δlogits[j]) * tanh'(z2[0]) = {fmt(backwardData.dz2[0])}</code></p>
          <p class="mini"><code>dW2[0,0] = a1[0] * δz2[0] = {fmt(backwardData.a1[0])} * {fmt(backwardData.dz2[0])} = {fmt(backwardData.dW2[0][0])}</code></p>
          <p class="mini"><code>δz1[0] = (Σ W2[0,j] * δz2[j]) * tanh'(z1[0]) = {fmt(backwardData.dz1[0])}</code></p>
          <p class="mini"><code>dW1[0,0] = x[0] * δz1[0] = {fmt(backwardData.x[0])} * {fmt(backwardData.dz1[0])} = {fmt(backwardData.dW1[0][0])}</code></p>
          <p class="mini"><code>|dW3|₁ = {sumAbs(backwardData.dW3).toFixed(3)}</code> · <code>|dW2|₁ = {sumAbs(backwardData.dW2).toFixed(3)}</code> · <code>|dW1|₁ = {sumAbs(backwardData.dW1).toFixed(3)}</code></p>
        </section>
      </div>
    </section>
  {/if}
</section>

<style>
  .backprop { display:grid; gap:.9rem; }
  .intro p { margin:0; color:var(--text-secondary); line-height:1.6; }
  .card {
    border:1px solid var(--border-subtle);
    border-radius:12px;
    background:rgba(255,255,255,.62);
    padding:.65rem;
    display:grid;
    gap:.45rem;
  }
  .card.wide { width: 100%; }
  .card.sub { background: rgba(255,255,255,.78); }
  .label { margin:0; font-size:.72rem; letter-spacing:.05em; text-transform:uppercase; color:var(--text-muted); }
  .mini { margin:0; font-size:.84rem; color:var(--text-secondary); line-height:1.6; }

  .training-card { gap:.6rem; }
  .prompt-line {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.52rem 0.62rem;
    border: 1px solid rgba(100, 116, 139, 0.28);
    border-radius: 10px;
    background: rgba(248, 250, 252, 0.92);
    font-family: "Avenir Next", "Inter", "Segoe UI", sans-serif;
    font-size: 1rem;
    font-weight: 500;
    color: #111827;
    letter-spacing: 0.005em;
    width: fit-content;
  }
  .prompt-line select {
    min-width: 8.75rem;
    border: 1px solid rgba(100, 116, 139, 0.35);
    border-radius: 8px;
    padding: 0.26rem 0.46rem;
    background: rgba(255, 255, 255, 0.98);
    color: #111827;
    font-family: "IBM Plex Sans", "Avenir Next", "Segoe UI", sans-serif;
    font-size: 0.9rem;
  }
  .prompt-blank {
    color: #64748b;
    letter-spacing: 0.06em;
  }
  .target-picker {
    display: grid;
    gap: 0.3rem;
    font-size: 0.82rem;
    color: var(--text-secondary);
    width: fit-content;
  }
  .target-buttons {
    display: flex;
    gap: 0.45rem;
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  .token-btn {
    border: 1px solid rgba(100, 116, 139, 0.35);
    border-radius: 999px;
    padding: 0.35rem 0.75rem;
    background: rgba(255, 255, 255, 0.98);
    color: #0f172a;
    font-family: "IBM Plex Sans", "Avenir Next", "Segoe UI", sans-serif;
    font-size: 0.84rem;
    line-height: 1;
  }

  .controls-inline {
    display:flex;
    flex-wrap: wrap;
    gap:.45rem .65rem;
    align-items:end;
  }
  .controls-inline label {
    display:grid;
    gap:.2rem;
    font-size:.76rem;
    color:var(--text-secondary);
    margin-left: auto;
    min-width: 210px;
  }
  .backprop button {
    border:1px solid var(--border-subtle);
    border-radius:8px;
    background:rgba(255,255,255,.92);
    padding:.35rem .52rem;
    font-size:.76rem;
  }
  .step-actions {
    display: flex;
    justify-content: flex-start;
    margin-bottom: 0.25rem;
  }
  .step-actions.bottom {
    margin-top: 0.5rem;
    margin-bottom: 0;
  }

  .row { display:grid; grid-template-columns: 72px 1fr auto; gap:.45rem; align-items:center; }
  .tok { font-size:.82rem; color:var(--text-secondary); font-family:"IBM Plex Mono","SFMono-Regular",monospace; }
  .bar-wrap { height:14px; display:flex; align-items:center; }
  .bar { height:10px; border-radius:99px; background:rgba(71,85,105,.35); }
  .bar.pred { background:rgba(14,116,144,.5); }
  .bar.target { outline:1px solid rgba(217,119,6,.5); outline-offset:1px; }

  .flow-row {
    display:grid;
    grid-template-columns: 155px 1fr auto;
    align-items:center;
    gap:.5rem;
    font-size:.8rem;
    color:var(--text-secondary);
  }
  .flow-bar {
    height:10px;
    border-radius:99px;
    background:rgba(100,116,139,.18);
    overflow:hidden;
  }
  .flow-bar > div {
    height:100%;
    border-radius:99px;
    background:rgba(217,119,6,.55);
  }

  .grad-grids {
    display:grid;
    grid-template-columns: repeat(3, minmax(0,1fr));
    gap:.55rem;
    margin-top: .25rem;
  }

  .cards.explain-two {
    display:grid;
    grid-template-columns: 1.1fr 1fr;
    gap:.65rem;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    table-layout: fixed;
    font-family:"IBM Plex Mono","SFMono-Regular",monospace;
    font-size:.8rem;
  }
  td {
    border:1px solid rgba(100,116,139,.3);
    padding:.24rem .3rem;
    text-align:center;
    background:rgba(248,250,252,.8);
  }

  .fwd { stroke: rgba(71, 85, 105, 0.35); stroke-width: 2; }
  .back { stroke: rgba(217, 119, 6, 0.9); stroke-width: 2.4; stroke-dasharray: 4 4; }
  .node { stroke: rgba(51, 65, 85, 0.32); stroke-width: 1; fill: rgba(255, 255, 255, 0.95); }
  .node.input { fill: rgba(226, 232, 240, 0.9); }
  .node.hidden { fill: rgba(191, 219, 254, 0.65); }
  .node.hidden2 { fill: rgba(186, 230, 253, 0.66); }
  .node.output { fill: rgba(224, 242, 254, 0.74); }
  .node.output.target { stroke: rgba(217, 119, 6, 0.72); stroke-width: 1.4; }
  .node.output.pred { fill: rgba(125, 211, 252, 0.9); }
  .next-action {
    border-color: rgba(14, 116, 144, 0.7) !important;
    background: rgba(14, 116, 144, 0.1) !important;
    color: #0c4a6e;
    box-shadow: 0 0 0 2px rgba(14, 116, 144, 0.18);
  }
  .pred-ok { color: #047857; }
  .pred-bad { color: #b91c1c; }
  .viz-label {
    font-size: 0.72rem;
    fill: #475569;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  code { font-family:"IBM Plex Mono","SFMono-Regular",monospace; }

  @media (max-width: 980px) {
    .controls-inline { align-items: stretch; }
    .controls-inline label { margin-left: 0; min-width: 0; width: 100%; }
    .grad-grids { grid-template-columns: 1fr; }
    .cards.explain-two { grid-template-columns: 1fr; }
  }

  @media (max-width: 640px) {
    .card {
      padding: 0.56rem;
    }

    .prompt-line {
      display: flex;
      flex-wrap: wrap;
      width: 100%;
      font-size: 0.92rem;
    }

    .prompt-line select {
      flex: 1 1 10rem;
      min-width: 0;
    }

    .controls-inline > button,
    .step-actions button,
    .step-actions.bottom button {
      width: 100%;
    }

    .row {
      grid-template-columns: 4rem minmax(0, 1fr) 3rem;
      gap: 0.32rem;
    }

    .flow-row {
      grid-template-columns: minmax(5.7rem, 0.9fr) minmax(0, 1fr) 2.8rem;
      gap: 0.34rem;
    }

    table {
      font-size: 0.72rem;
    }
  }
</style>
