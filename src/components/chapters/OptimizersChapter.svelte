<script lang="ts">
  import FlowPath from "../FlowPath.svelte";
  import { runOptimizers, type OptimizerRun } from "../../utils/optimizers";

  let startX = 1.6;
  let startY = 1.1;
  let lr = 0.11;
  let steps = 18;
  let dragging = false;
  let showDragHint = true;
  let svgEl: SVGSVGElement | null = null;

  const momentum = 0.88;
  const beta1 = 0.9;
  const beta2 = 0.999;
  const eps = 1e-8;
  const flowSteps = [
    { label: "01", title: "Same gradients" },
    { label: "02", title: "Different update rules" },
    { label: "03", title: "Different trajectories" }
  ];

  $: stepsCount = Number(steps);
  $: runs = runOptimizers({
    steps: stepsCount,
    start: { x: startX, y: startY },
    lr,
    momentum,
    beta1,
    beta2,
    eps
  });

  function sx(x: number) {
    return 30 + ((x + 2.2) / 4.4) * 320;
  }

  function sy(y: number) {
    return 22 + ((2.2 - y) / 4.4) * 180;
  }

  function pathUntil(run: OptimizerRun, step: number) {
    const pts = run.points.slice(0, step + 1);
    return pts.map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(" ");
  }

  function fmt(v: number) {
    return v.toFixed(4);
  }

  function clamp(v: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, v));
  }

  function pxToModelX(px: number) {
    return ((px - 30) / 320) * 4.4 - 2.2;
  }

  function pxToModelY(py: number) {
    return 2.2 - ((py - 22) / 180) * 4.4;
  }

  function clientToSvgPoint(evt: PointerEvent) {
    if (!svgEl) return null;
    const rect = svgEl.getBoundingClientRect();
    const x = ((evt.clientX - rect.left) / rect.width) * 380;
    const y = ((evt.clientY - rect.top) / rect.height) * 220;
    return { x, y };
  }

  function updateStartFromPointer(evt: PointerEvent) {
    const p = clientToSvgPoint(evt);
    if (!p) return;
    startX = clamp(pxToModelX(p.x), -2, 2);
    startY = clamp(pxToModelY(p.y), -2, 2);
  }

  function onSvgPointerDown(evt: PointerEvent) {
    dragging = true;
    showDragHint = false;
    svgEl?.setPointerCapture?.(evt.pointerId);
    updateStartFromPointer(evt);
  }

  function onSvgPointerMove(evt: PointerEvent) {
    if (!dragging) return;
    updateStartFromPointer(evt);
  }

  function onSvgPointerUp() {
    dragging = false;
  }

  function onLrInput(evt: Event) {
    lr = Number((evt.currentTarget as HTMLInputElement).value);
  }

  function onStepsInput(evt: Event) {
    steps = Number((evt.currentTarget as HTMLInputElement).value);
  }

</script>

<section class="optimizers">
  <div class="intro">
    <p>
      Backprop gives gradients. Optimizers decide how to turn those gradients into actual parameter updates.
    </p>
    <FlowPath steps={flowSteps} ariaLabel="Optimizer update path" />
  </div>

  <section class="card">
    <p class="label">Optimizer trajectories on one toy loss surface</p>
    <div class="panel">
      <div class="viz-col">
        <svg
          bind:this={svgEl}
          viewBox="0 0 380 220"
          role="img"
          aria-label="optimizer path comparison"
          on:pointerdown={onSvgPointerDown}
          on:pointermove={onSvgPointerMove}
          on:pointerup={onSvgPointerUp}
          on:pointercancel={onSvgPointerUp}
          on:lostpointercapture={onSvgPointerUp}
        >
          <ellipse cx="190" cy="112" rx="154" ry="82" class="contour" />
          <ellipse cx="190" cy="112" rx="114" ry="60" class="contour" />
          <ellipse cx="190" cy="112" rx="78" ry="42" class="contour" />
          <ellipse cx="190" cy="112" rx="48" ry="26" class="contour" />
          <circle cx="190" cy="112" r="3.2" class="minimum" />

          <path d={pathUntil(runs[0], stepsCount)} class="sgd" />
          <path d={pathUntil(runs[1], stepsCount)} class="mom" />
          <path d={pathUntil(runs[2], stepsCount)} class="adam" />

          {#each runs as run}
            {@const p = run.points[stepsCount]}
            <circle
              cx={sx(p.x)}
              cy={sy(p.y)}
              r="3"
              class={`end-dot ${run.name === "SGD" ? "sgd-dot" : run.name === "Momentum" ? "mom-dot" : "adam-dot"}`}
            />
          {/each}

          <g class="start-handle">
            <circle cx={sx(startX)} cy={sy(startY)} r="6.5" class={`start-dot ${dragging ? "dragging" : ""}`} />
            <circle cx={sx(startX)} cy={sy(startY)} r="12" class={`start-ring ${showDragHint ? "hint" : ""}`} />
          </g>

          <text x="190" y="102" text-anchor="middle" class="axis min-label">min</text>
        </svg>
      </div>
      <div class="stats-col">
        {#each runs as run}
          <section class={`card stat ${run.name.toLowerCase()}`}>
            <p class="label">{run.name}</p>
            <p class="mini">loss start: <code>{fmt(run.losses[0])}</code></p>
            <p class="mini">loss end: <code>{fmt(run.losses[stepsCount])}</code></p>
            <p class="mini">delta: <code>{fmt(run.losses[stepsCount] - run.losses[0])}</code></p>
          </section>
        {/each}
      </div>
    </div>
    <div class="inline-controls">
      <label>Learning rate
        <input type="range" min="0.02" max="0.3" step="0.005" bind:value={lr} on:input={onLrInput} />
        <span>{lr.toFixed(3)}</span>
      </label>
      <label>Steps
        <input type="range" min="3" max="30" step="1" bind:value={steps} on:input={onStepsInput} />
        <span>{steps}</span>
      </label>
    </div>
    <p class="mini">All optimizers see the same gradients. Their update rules differ, so their paths differ.</p>
  </section>
</section>

<style>
  .optimizers { display:grid; gap:.9rem; }
  .intro p { margin:0; color:var(--text-secondary); line-height:1.6; }
  .inline-controls {
    display:grid;
    grid-template-columns: repeat(2,minmax(0,1fr));
    gap:.45rem;
    border:1px solid var(--border-subtle);
    border-radius:10px;
    background:rgba(255,255,255,.55);
    padding:.48rem .5rem;
  }
  label { display:grid; gap:.2rem; font-size:.74rem; color:var(--text-secondary); }
  .panel {
    display:grid;
    grid-template-columns: minmax(0, 1.75fr) minmax(150px, 1fr);
    gap:.5rem;
    align-items: start;
  }
  .stats-col { display:grid; gap:.4rem; }
  .card {
    border:1px solid var(--border-subtle);
    border-radius:12px;
    background:rgba(255,255,255,.62);
    padding:.48rem;
    display:grid;
    gap:.35rem;
  }
  .label { margin:0; font-size:.72rem; letter-spacing:.05em; text-transform:uppercase; color:var(--text-muted); }
  .optimizers > .card > .label {
    font-size: .64rem;
    letter-spacing: .04em;
    font-weight: 500;
    margin-bottom: .1rem;
  }
  .mini { margin:0; font-size:.82rem; color:var(--text-secondary); line-height:1.5; }
  svg { width: 100%; height: auto; border:1px solid rgba(100,116,139,.2); border-radius:9px; background:rgba(248,250,252,.85); cursor: grab; }
  .contour { fill:none; stroke: rgba(100,116,139,.25); stroke-width:1.2; }
  .minimum { fill: rgba(217,119,6,.78); }
  .start-handle { cursor: grab; }
  .start-handle:active { cursor: grabbing; }
  .start-dot { fill: rgba(15, 23, 42, 0.9); stroke: rgba(255,255,255,.9); stroke-width: 1.1; }
  .start-dot.dragging { fill: rgba(14,116,144,.9); }
  .start-ring { fill: none; stroke: rgba(15,23,42,.2); stroke-width: 1; }
  .start-ring.hint { animation: ringFade 1.6s ease-in-out infinite; }
  .end-dot { stroke: none; }
  .sgd-dot { fill: rgba(3,105,161,.95); }
  .mom-dot { fill: rgba(190,24,93,.95); }
  .adam-dot { fill: rgba(5,150,105,.95); }
  .sgd { fill:none; stroke: rgba(3,105,161,.85); stroke-width:1.6; }
  .mom { fill:none; stroke: rgba(190,24,93,.85); stroke-width:1.6; }
  .adam { fill:none; stroke: rgba(5,150,105,.85); stroke-width:1.6; }
  .axis {
    font-size: .7rem;
    fill: #64748b;
    user-select: none;
    -webkit-user-select: none;
    pointer-events: none;
  }
  .min-label { fill: rgba(217,119,6,.9); font-weight: 600; }
  .stat code { font-family: "IBM Plex Mono", "SFMono-Regular", monospace; }
  .stat.sgd { border-color: rgba(3,105,161,.5); }
  .stat.momentum { border-color: rgba(190,24,93,.5); }
  .stat.adam { border-color: rgba(5,150,105,.5); }
  @keyframes ringFade {
    0% { stroke-opacity: .38; }
    50% { stroke-opacity: .1; }
    100% { stroke-opacity: .38; }
  }
  @media (max-width: 980px) {
    .panel { grid-template-columns: 1fr; }
    .inline-controls { grid-template-columns: 1fr; }
  }

  @media (max-width: 640px) {
    .inline-controls,
    .card {
      padding: 0.56rem;
    }

    svg {
      min-height: 250px;
      touch-action: none;
    }
  }
</style>
