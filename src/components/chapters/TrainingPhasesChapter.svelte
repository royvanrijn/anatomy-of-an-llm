<script lang="ts">
  type Phase = {
    id: string;
    label: string;
    startStep: number;
    endStep: number;
    train: string;
    val: string;
    note: string;
  };

  const points = Array.from({ length: 81 }, (_, i) => {
    const step = i * 10;
    const trainBase = 2.3 - 1.95 * (1 - Math.exp(-step / 255));
    const train = Math.max(
      0.35,
      trainBase + 0.06 * Math.sin(step / 38) + 0.03 * Math.cos(step / 17)
    );

    const valBase = 2.35 - 0.95 * (1 - Math.exp(-step / 230));
    const delayedGeneralization = step > 520 ? 0.62 * (1 - Math.exp(-(step - 520) / 130)) : 0;
    const val = Math.max(
      0.75,
      valBase - delayedGeneralization + 0.09 * Math.sin(step / 46 + 0.7) + 0.04 * Math.cos(step / 23)
    );

    return { step, train, val };
  });

  const phases: Phase[] = [
    {
      id: "fit",
      label: "Phase 1: Fit training data",
      startStep: 0,
      endStep: 280,
      train: "Training loss falls quickly.",
      val: "Validation improves a bit, then slows.",
      note: "Model memorizes useful local patterns first."
    },
    {
      id: "plateau",
      label: "Phase 2: Generalization plateau",
      startStep: 280,
      endStep: 560,
      train: "Training loss keeps dropping.",
      val: "Validation barely moves.",
      note: "Looks like overfitting, but training continues."
    },
    {
      id: "grok",
      label: "Phase 3: Delayed generalization",
      startStep: 560,
      endStep: 800,
      train: "Training loss still improves.",
      val: "Validation suddenly drops later.",
      note: "This delayed improvement pattern is often described as grokking."
    }
  ];

  let markerStep = 40;

  $: nearest = points.reduce(
    (best, p) => (Math.abs(p.step - markerStep) < Math.abs(best.step - markerStep) ? p : best),
    points[0]
  );
  $: selectedPhase =
    markerStep < 280 ? phases[0] :
    markerStep < 560 ? phases[1] :
    phases[2];

  const minLoss = 0.25;
  const maxLoss = 2.5;
  const x0 = 40;
  const y0 = 230;
  const width = 720;
  const height = 190;

  function x(step: number) {
    return x0 + (step / 800) * width;
  }

  function y(loss: number) {
    const t = (loss - minLoss) / (maxLoss - minLoss);
    return y0 - t * height;
  }

  function pathFor(key: "train" | "val") {
    return points
      .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.step).toFixed(1)},${y(p[key]).toFixed(1)}`)
      .join(" ");
  }

  function partialPathFor(key: "train" | "val", upToStep: number) {
    const visible = points.filter((p) => p.step <= upToStep);
    if (visible.length === 0) return "";
    if (visible.length === 1) {
      const p = visible[0];
      return `M${x(p.step).toFixed(1)},${y(p[key]).toFixed(1)}`;
    }
    return visible
      .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.step).toFixed(1)},${y(p[key]).toFixed(1)}`)
      .join(" ");
  }

  function phaseBand(phase: Phase) {
    const left = x(phase.startStep);
    const right = x(phase.endStep);
    return { left, width: right - left };
  }

  function noise(i: number) {
    const t = markerStep / 120 + i * 0.9;
    return Math.sin(t) * 0.45 + Math.cos(t * 0.63) * 0.25;
  }
</script>

<section class="training-phases">
  <div class="intro">
    <p>
      Training is often staged, not perfectly smooth: fast fitting first, slower consolidation, and sometimes delayed
      generalization.
    </p>
    <p>This chart is an illustrative curve, not a claim about one exact production run.</p>
  </div>

  <section class="card chart-card">
    <p class="label">Toy training curve (loss vs optimization steps)</p>
    <svg viewBox="0 0 820 280" role="img" aria-label="training and validation loss phases">
      <rect x="0" y="0" width="820" height="280" rx="10" fill="rgba(255,255,255,0.82)" />

      <line x1={x0} y1={y0} x2={x0 + width} y2={y0} class="axis" />
      <line x1={x0} y1={y0 - height} x2={x0} y2={y0} class="axis" />

      {#each phases as phase}
        {@const band = phaseBand(phase)}
        <rect x={band.left} y={y0 - height} width={band.width} height={height} class="phase-band" class:selected={phase.id === selectedPhase.id} />
      {/each}

      <path d={partialPathFor("train", markerStep)} class="train" />
      <path d={partialPathFor("val", markerStep)} class="val" />

      {#each points as p, i}
        {#if p.step <= markerStep}
          <circle cx={x(p.step)} cy={y(p.train + noise(i) * 0.12)} r="2.1" class="noise-point" />
        {/if}
      {/each}

      <line x1={x(nearest.step)} y1={y0 - height} x2={x(nearest.step)} y2={y0} class="marker" />
      <circle cx={x(nearest.step)} cy={y(nearest.train)} r="4.5" class="train-point" />
      <circle cx={x(nearest.step)} cy={y(nearest.val)} r="4.5" class="val-point" />

      <text x="760" y="252" class="axis-label">steps</text>
      <text x="12" y="46" class="axis-label">loss</text>
    </svg>

    <label class="slider">Step marker
      <input type="range" min="0" max="800" step="10" bind:value={markerStep} />
    </label>

    <div class="legend">
      <span><i class="train-dot"></i> Train loss</span>
      <span><i class="val-dot"></i> Validation loss</span>
    </div>
  </section>

  <section class="card phase-summary">
    <p class="label">Auto-detected phase summary</p>
    <h3>{selectedPhase.label}</h3>
    <p class="mini"><strong>Train:</strong> {selectedPhase.train}</p>
    <p class="mini"><strong>Validation:</strong> {selectedPhase.val}</p>
    <p class="mini">{selectedPhase.note}</p>
  </section>

  <div class="narrative-copy">
    <p class="explainer-title">What is being learned in this phase</p>
    <p>
      In large-scale pre-training, the model is mostly learning broad structure:
      world knowledge, language regularities, code patterns, and reasoning traces from text continuation.
    </p>
    <p>
      This is why early improvements can look mostly statistical, while later improvements reflect better internal
      representations. The model is not yet being optimized for assistant behavior such as refusal style or helpful tone.
    </p>
    <p class="explainer-title">Where alignment and safety enter</p>
    <p>
      Alignment behavior is primarily shaped after pre-training. Post-training adds objectives such as following
      instructions, refusing unsafe requests, formatting answers clearly, asking clarifying questions, and staying helpful.
    </p>
    <p>
      So this chapter is mostly about capability learning dynamics; the next chapter focuses on behavior shaping.
    </p>
  </div>
</section>

<style>
  .training-phases { display: grid; gap: 0.9rem; }
  .intro { display: grid; gap: 0.4rem; }
  .intro p { margin: 0; color: var(--text-secondary); line-height: 1.62; }
  .narrative-copy { display: grid; gap: 0.4rem; }
  .narrative-copy p { margin: 0; color: var(--text-secondary); line-height: 1.62; }
  .narrative-copy .explainer-title {
    margin: 0.18rem 0 0;
    font-size: 0.82rem;
    font-weight: bold;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #155e75;
  }

  .card {
    border: 1px solid var(--border-subtle);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.62);
    padding: 0.78rem;
    display: grid;
    gap: 0.5rem;
  }

  .label { margin: 0; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-muted); }
  .mini { margin: 0; font-size: 0.84rem; line-height: 1.56; color: var(--text-secondary); }

  .chart-card svg {
    width: 100%;
    height: auto;
    border: 1px solid rgba(100, 116, 139, 0.24);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.72);
  }

  .axis { stroke: rgba(71, 85, 105, 0.6); stroke-width: 1.3; }
  .axis-label { fill: #64748b; font-size: 12px; }

  .phase-band { fill: rgba(148, 163, 184, 0.08); }
  .phase-band.selected { fill: rgba(21, 106, 130, 0.14); }

  .train, .val { fill: none; stroke-width: 3; }
  .train { stroke: rgba(37, 99, 235, 0.9); }
  .val { stroke: rgba(217, 119, 6, 0.9); }

  .marker { stroke: rgba(51, 65, 85, 0.5); stroke-width: 1.2; stroke-dasharray: 4 4; }
  .train-point { fill: rgba(37, 99, 235, 0.95); }
  .val-point { fill: rgba(217, 119, 6, 0.95); }
  .noise-point {
    fill: rgba(37, 99, 235, 0.32);
    animation: drift 900ms ease-in-out infinite alternate;
  }

  .slider {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.82rem;
    color: var(--text-secondary);
  }
  .slider input { flex: 1; }
  .legend { display: flex; gap: 0.85rem; font-size: 0.78rem; color: var(--text-muted); }
  .legend span { display: inline-flex; align-items: center; gap: 0.3rem; }
  .legend i { width: 8px; height: 8px; border-radius: 999px; display: inline-block; }
  .legend .train-dot { background: rgba(37, 99, 235, 0.95); }
  .legend .val-dot { background: rgba(217, 119, 6, 0.95); }

  .phase-summary h3 {
    margin: 0;
    font-family: "Fraunces", "Iowan Old Style", "Georgia", serif;
    font-size: 1.18rem;
    font-weight: 500;
    color: #111827;
  }

  code { font-family: "IBM Plex Mono", "SFMono-Regular", monospace; }

  @keyframes drift {
    from { transform: translateY(-1px); opacity: 0.3; }
    to { transform: translateY(1px); opacity: 0.55; }
  }

  @media (max-width: 640px) {
    .card {
      padding: 0.56rem;
    }

    .chart-card svg {
      min-height: 180px;
    }

    .slider {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 0.42rem;
    }

    .legend {
      flex-wrap: wrap;
      gap: 0.45rem;
    }
  }
</style>
