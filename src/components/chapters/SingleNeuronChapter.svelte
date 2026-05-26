<script lang="ts">
  import { ACTIVATIONS, type ActivationId, applyActivation } from "../../utils/activations";

  let x1 = 0.7;
  let x2 = -0.25;
  let x3 = 0.45;
  let w1 = 1.1;
  let w2 = -0.85;
  let w3 = 0.55;
  let activation: ActivationId = "gelu";

  const curveMin = -4;
  const curveMax = 4;
  const curveStep = 0.08;
  const chartWidth = 520;
  const chartHeight = 220;
  const chartPad = 26;

  $: z = w1 * x1 + w2 * x2 + w3 * x3;
  $: output = applyActivation(activation, z);
  $: activeMeta = ACTIVATIONS.find((item) => item.id === activation) ?? ACTIVATIONS[0];
  $: glow = Math.max(0.12, Math.min(1, (output + 2) / 4));

  function getCurvePoints(id: ActivationId) {
    const points: { x: number; y: number }[] = [];
    for (let value = curveMin; value <= curveMax; value += curveStep) {
      points.push({ x: value, y: applyActivation(id, value) });
    }
    return points;
  }

  function scaleX(x: number) {
    const t = (x - curveMin) / (curveMax - curveMin);
    return chartPad + t * (chartWidth - chartPad * 2);
  }

  function scaleY(y: number, yMin: number, yMax: number) {
    const clamped = yMax === yMin ? 0.5 : (y - yMin) / (yMax - yMin);
    return chartHeight - chartPad - clamped * (chartHeight - chartPad * 2);
  }

  function toPath(points: { x: number; y: number }[], yMin: number, yMax: number) {
    return points
      .map((point, idx) => `${idx === 0 ? "M" : "L"} ${scaleX(point.x).toFixed(2)} ${scaleY(point.y, yMin, yMax).toFixed(2)}`)
      .join(" ");
  }

  $: curvePoints = getCurvePoints(activation);
  $: curveYValues = curvePoints.map((point) => point.y);
  $: yMin = Math.min(...curveYValues, output);
  $: yMax = Math.max(...curveYValues, output);
  $: curvePath = toPath(curvePoints, yMin, yMax);
  $: markerX = scaleX(Math.max(curveMin, Math.min(curveMax, z)));
  $: markerY = scaleY(output, yMin, yMax);
  $: zeroX = scaleX(0);
  $: zeroY = scaleY(0, yMin, yMax);
  $: firingThreshold = activation === "sigmoid" ? 0.5 : 0;
  $: isFiring = output > firingThreshold;
</script>

<section class="neuron-chapter">
  <div class="intro">
    <p>
      A neuron takes inputs, applies weights, and then runs the result through an activation function.
      This non-linear step is what lets networks model richer patterns.
    </p>
  </div>

  <div class="equations">
    <p><code>z = w1*x1 + w2*x2 + w3*x3</code></p>
    <p><code>output = activation(z)</code></p>
  </div>

  <section class="neuron-map">
    <p class="label">Neuron diagram</p>
    <svg viewBox="0 0 620 200" role="img" aria-label="Three inputs with weighted edges into one neuron and one output">
      <line x1="117.5" y1="52.7" x2="289.0" y2="90.5" class="edge" />
      <line x1="118.0" y1="100.0" x2="288.0" y2="100.0" class="edge" />
      <line x1="117.5" y1="147.3" x2="289.0" y2="109.5" class="edge" />
      <text x="182" y="64" class="edge-label">w1={w1.toFixed(2)}</text>
      <text x="182" y="96" class="edge-label">w2={w2.toFixed(2)}</text>
      <text x="182" y="146" class="edge-label">w3={w3.toFixed(2)}</text>

      <circle cx="96" cy="48" r="22" class="input-node" />
      <circle cx="96" cy="100" r="22" class="input-node" />
      <circle cx="96" cy="152" r="22" class="input-node" />
      <text x="96" y="44" text-anchor="middle" class="node-title">x1</text>
      <text x="96" y="59" text-anchor="middle" class="node-value">{x1.toFixed(2)}</text>
      <text x="96" y="96" text-anchor="middle" class="node-title">x2</text>
      <text x="96" y="111" text-anchor="middle" class="node-value">{x2.toFixed(2)}</text>
      <text x="96" y="148" text-anchor="middle" class="node-title">x3</text>
      <text x="96" y="163" text-anchor="middle" class="node-value">{x3.toFixed(2)}</text>

      <circle cx="332" cy="100" r="44" class="neuron-node" style={`fill-opacity:${(0.26 + glow * 0.38).toFixed(3)};`} />
      <text x="332" y="95" text-anchor="middle" class="neuron-title">Σ</text>
      <text x="332" y="112" text-anchor="middle" class="neuron-sub">z={z.toFixed(2)}</text>

      <line x1="376" y1="100" x2="488" y2="100" class="edge" />
      <text x="408" y="86" class="edge-label">{activeMeta.label}</text>

      <circle cx="520" cy="100" r="32" class={`output-node ${isFiring ? "fire-on" : "fire-off"}`} />
      <text x="520" y="95" text-anchor="middle" class="node-title">out</text>
      <text x="520" y="110" text-anchor="middle" class="node-value">{output.toFixed(2)}</text>
    </svg>
  </section>

  <div class="controls-grid">
    <section class="control-panel">
      <p class="label">Inputs</p>
      <label>x1 <input type="range" min="-2" max="2" step="0.01" bind:value={x1} /> <span>{x1.toFixed(2)}</span></label>
      <label>x2 <input type="range" min="-2" max="2" step="0.01" bind:value={x2} /> <span>{x2.toFixed(2)}</span></label>
      <label>x3 <input type="range" min="-2" max="2" step="0.01" bind:value={x3} /> <span>{x3.toFixed(2)}</span></label>
    </section>

    <section class="control-panel">
      <p class="label">Weights</p>
      <label>w1 <input type="range" min="-2" max="2" step="0.01" bind:value={w1} /> <span>{w1.toFixed(2)}</span></label>
      <label>w2 <input type="range" min="-2" max="2" step="0.01" bind:value={w2} /> <span>{w2.toFixed(2)}</span></label>
      <label>w3 <input type="range" min="-2" max="2" step="0.01" bind:value={w3} /> <span>{w3.toFixed(2)}</span></label>
    </section>

    <section class="control-panel">
      <p class="label">Activation</p>
      <select bind:value={activation}>
        {#each ACTIVATIONS as item}
          <option value={item.id}>{item.label}</option>
        {/each}
      </select>
      <p class="activation-note">{activeMeta.description}</p>
      <div class="neuron-glow" style={`--glow:${glow};`}>
        <span>Neuron output</span>
        <strong>{output.toFixed(4)}</strong>
      </div>
    </section>
  </div>

  <section class="curve-card">
    <p class="label">Activation curve</p>
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="Activation function curve with current marker">
      <line x1={chartPad} y1={chartHeight - chartPad} x2={chartWidth - chartPad} y2={chartHeight - chartPad} class="axis" />
      <line x1={chartPad} y1={chartPad} x2={chartPad} y2={chartHeight - chartPad} class="axis" />
      <line x1={zeroX} y1={chartPad} x2={zeroX} y2={chartHeight - chartPad} class="zero-axis" />
      <line x1={chartPad} y1={zeroY} x2={chartWidth - chartPad} y2={zeroY} class="zero-axis" />
      <path d={curvePath} class="curve" />
      <circle cx={markerX} cy={markerY} r="5.5" class={`marker ${isFiring ? "on" : "off"}`} />
      <text x={zeroX + 6} y={chartHeight - 10} class="axis-label">x = 0</text>
      <text x={chartPad + 6} y={zeroY - 6} class="axis-label">y = 0</text>
    </svg>
    <p class="curve-caption">
      Marker position updates live as the weighted input <code>z</code> changes.
    </p>
  </section>
</section>

<style>
  .neuron-chapter {
    display: grid;
    gap: 0.95rem;
  }
  .intro p {
    margin: 0;
    font-size: 1rem;
    color: var(--text-secondary);
    line-height: 1.6;
  }
  .equations {
    border: 1px solid var(--border-subtle);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.66);
    padding: 0.75rem 0.9rem;
  }
  .equations p {
    margin: 0;
    font-size: 1rem;
  }
  .controls-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.6rem;
  }
  .control-panel {
    border: 1px solid var(--border-subtle);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.6);
    padding: 0.68rem;
    display: grid;
    gap: 0.45rem;
    align-content: start;
  }
  .label {
    margin: 0;
    font-size: 0.72rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--text-muted);
  }
  label {
    display: grid;
    grid-template-columns: 1.4rem 1fr auto;
    gap: 0.45rem;
    align-items: center;
    font-size: 0.82rem;
    color: var(--text-secondary);
  }
  select {
    border: 1px solid var(--border-subtle);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.9);
    color: var(--text-primary);
    padding: 0.45rem 0.5rem;
    font-size: 0.85rem;
  }
  .activation-note {
    margin: 0;
    font-size: 0.86rem;
    line-height: 1.5;
    color: var(--text-secondary);
  }
  .neuron-glow {
    border-radius: 12px;
    border: 1px solid rgba(251, 146, 60, 0.3);
    padding: 0.6rem;
    display: grid;
    gap: 0.22rem;
    background: radial-gradient(circle at 50% 35%, rgba(251, 146, 60, calc(0.08 + var(--glow) * 0.25)), rgba(255, 255, 255, 0.88));
  }
  .neuron-glow span {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
  }
  .neuron-glow strong {
    font-size: 1.1rem;
    color: #9a3412;
  }
  .curve-card {
    border: 1px solid var(--border-subtle);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.62);
    padding: 0.7rem;
    display: grid;
    gap: 0.42rem;
  }
  .curve-card svg {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 8px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(248, 246, 239, 0.9));
  }
  .axis {
    stroke: rgba(63, 63, 70, 0.35);
    stroke-width: 1;
  }
  .zero-axis {
    stroke: rgba(14, 116, 144, 0.35);
    stroke-width: 1.2;
    stroke-dasharray: 3 4;
  }
  .axis-label {
    font-size: 10px;
    fill: #475569;
    font-family: "IBM Plex Mono", "SFMono-Regular", monospace;
  }
  .curve {
    fill: none;
    stroke: #0f766e;
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .marker {
    stroke: #f8fafc;
    stroke-width: 1.4;
  }
  .marker.on {
    fill: #16a34a;
  }
  .marker.off {
    fill: #dc2626;
  }
  .curve-caption {
    margin: 0;
    font-size: 0.84rem;
    color: var(--text-secondary);
  }
  code {
    font-family: "IBM Plex Mono", "SFMono-Regular", monospace;
    font-size: 0.94em;
  }
  .neuron-map {
    border: 1px solid var(--border-subtle);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.62);
    padding: 0.7rem;
    display: grid;
    gap: 0.5rem;
  }
  .neuron-map svg {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 8px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(248, 246, 239, 0.9));
  }
  .edge {
    stroke: #64748b;
    stroke-width: 1.6;
    stroke-linecap: round;
  }
  .edge-label {
    font-size: 11px;
    fill: #475569;
    font-family: "IBM Plex Mono", "SFMono-Regular", monospace;
  }
  .input-node {
    fill: rgba(21, 106, 130, 0.08);
    stroke: rgba(21, 106, 130, 0.42);
    stroke-width: 1.2;
  }
  .neuron-node {
    fill: rgba(251, 146, 60, 0.6);
    stroke: rgba(251, 146, 60, 0.48);
    stroke-width: 1.4;
  }
  .output-node {
    stroke-width: 1.3;
  }
  .output-node.fire-on {
    fill: rgba(34, 197, 94, 0.13);
    stroke: rgba(34, 197, 94, 0.48);
  }
  .output-node.fire-off {
    fill: rgba(239, 68, 68, 0.1);
    stroke: rgba(239, 68, 68, 0.45);
  }
  .node-title {
    font-size: 11px;
    fill: #334155;
    font-weight: 600;
  }
  .node-value {
    font-size: 11px;
    fill: #1f2937;
    font-family: "IBM Plex Mono", "SFMono-Regular", monospace;
  }
  .neuron-title {
    font-size: 12px;
    fill: #9a3412;
    font-weight: 700;
  }
  .neuron-sub {
    font-size: 10.5px;
    fill: #7c2d12;
    font-family: "IBM Plex Mono", "SFMono-Regular", monospace;
  }
  @media (max-width: 980px) {
    .controls-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .equations,
    .control-panel,
    .curve-card,
    .neuron-map {
      padding: 0.56rem;
    }

    label {
      grid-template-columns: 1.2rem minmax(0, 1fr) 3rem;
      gap: 0.35rem;
    }

    .neuron-map svg {
      min-height: 170px;
    }
  }
</style>
