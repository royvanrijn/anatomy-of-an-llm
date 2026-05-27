<script lang="ts">
  import FlowPath from "../FlowPath.svelte";

  const maxContext = 1_000_000;
  const maxGenerated = 1_000;
  const minContext = 256;
  const minGenerated = 1;

  let contextScale = 45;
  let generatedScale = 60;

  const baseCostUnit = 1;

  function expValue(min: number, max: number, scale: number) {
    const t = Math.min(1, Math.max(0, scale / 100));
    return Math.round(min * Math.pow(max / min, t));
  }

  $: contextLength = expValue(minContext, maxContext, contextScale);
  $: generatedTokens = expValue(minGenerated, maxGenerated, generatedScale);

  $: uncachedOps = Array.from({ length: generatedTokens }, (_, i) => contextLength + i + 1).reduce((a, b) => a + b, 0);
  $: cachedOps = (contextLength + 1) + Math.max(0, generatedTokens - 1) * baseCostUnit;
  $: computeRatio = uncachedOps / Math.max(cachedOps, 1);

  $: kvPerTokenMb = 0.0032; // illustrative only
  $: kvMemoryMb = (contextLength + generatedTokens) * kvPerTokenMb;

  $: maxOps = Math.max(uncachedOps, cachedOps);

  function pct(value: number, total: number) {
    return `${Math.max(3, (value / Math.max(total, 1)) * 100)}%`;
  }

  function fmt(n: number) {
    return n.toLocaleString("en-US");
  }
</script>

<section class="kv-cache">
  <div class="intro">
    <p>
      Decoding is autoregressive: each new token is generated after all previous tokens. KV cache changes the cost by
      reusing key/value tensors from earlier steps instead of recomputing them every time.
    </p>
  </div>

  <section class="card controls">
    <p class="label">Decode setup</p>
    <label>Prompt/context length
      <input type="range" min="0" max="100" step="1" bind:value={contextScale} />
      <span>{fmt(contextLength)} tokens</span>
    </label>
    <label>Generated tokens
      <input type="range" min="0" max="100" step="1" bind:value={generatedScale} />
      <span>{fmt(generatedTokens)} tokens</span>
    </label>

  </section>

  <section class="card pipeline">
    <p class="label">Autoregressive decode loop</p>

    <div class="gain-callout">
      <p>Compute reduction from caching</p>
      <strong>{computeRatio.toFixed(1)}x</strong>
      <span>less repeated attention work in this toy estimate</span>
    </div>

    <div class="compare">
      <article>
        <p class="sub">Without cache</p>
        <p class="mini">At each step, recompute attention keys/values for the full seen sequence.</p>
        <div class="bar"><span style={`width:${pct(uncachedOps, maxOps)}`}></span></div>
        <p class="mini">Relative compute: <code>{fmt(uncachedOps)}</code></p>
        <p class="mini">Memory behavior: lower KV storage, higher repeated compute.</p>
      </article>
      <article>
        <p class="sub">With cache</p>
        <p class="mini">Reuse stored K/V from previous tokens; compute only for the new token each step.</p>
        <div class="bar cache"><span style={`width:${pct(cachedOps, maxOps)}`}></span></div>
        <p class="mini">Relative compute: <code>{fmt(cachedOps)}</code></p>
        <p class="mini">Estimated KV memory: <code>{kvMemoryMb.toFixed(1)} MB</code> for <code>{fmt(contextLength + generatedTokens)}</code> seen tokens.</p>
      </article>
    </div>

    <div class="summary-grid">
      <div>
        <p class="k">Without cache</p>
        <p class="v">{fmt(uncachedOps)}</p>
      </div>
      <div>
        <p class="k">With cache</p>
        <p class="v">{fmt(cachedOps)}</p>
      </div>
      <div>
        <p class="k">KV memory</p>
        <p class="v">{kvMemoryMb.toFixed(1)} MB</p>
      </div>
    </div>
  </section>
  <p class="mini note">
    These values are illustrative relative estimates. Exact memory and speed depend on architecture, precision,
    head counts, and runtime implementation.
  </p>
</section>

<style>
  .kv-cache { display: grid; gap: 0.9rem; }
  .intro p { margin: 0; color: var(--text-secondary); line-height: 1.62; }

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
  label { display: grid; gap: 0.2rem; font-size: 0.82rem; color: var(--text-secondary); }
  label span { font-size: 0.8rem; color: #64748b; font-family: "IBM Plex Mono", "SFMono-Regular", monospace; }

  .compare { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.55rem; }
  .compare article { border: 1px solid rgba(100,116,139,0.24); border-radius: 10px; padding: 0.55rem; background: rgba(255,255,255,0.74); display: grid; gap: 0.32rem; }
  .sub { margin: 0; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; }

  .bar { height: 10px; border-radius: 999px; background: rgba(148,163,184,0.2); overflow: hidden; }
  .bar span { display: block; height: 100%; background: rgba(217, 119, 6, 0.82); }
  .bar.cache span { background: rgba(21, 106, 130, 0.85); }

  .summary strong { color: #0f172a; }
  .gain-callout {
    border: 1px solid rgba(21, 106, 130, 0.22);
    border-radius: 14px;
    background:
      radial-gradient(circle at 10% 0%, rgba(21, 106, 130, 0.1), transparent 38%),
      linear-gradient(135deg, rgba(246, 251, 252, 0.92), rgba(255, 255, 255, 0.76));
    padding: 0.66rem 0.78rem;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.12rem 0.85rem;
    align-items: center;
  }
  .gain-callout p,
  .gain-callout span {
    margin: 0;
  }
  .gain-callout p {
    color: rgba(21, 94, 117, 0.82);
    font-size: 0.74rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-weight: 700;
  }
  .gain-callout strong {
    grid-row: span 2;
    color: rgba(21, 106, 130, 0.76);
    font-size: clamp(1.9rem, 5.4vw, 3.35rem);
    line-height: 0.95;
    font-family: "Fraunces", "Iowan Old Style", "Georgia", serif;
    font-weight: 600;
  }
  .gain-callout span {
    color: var(--text-secondary);
    font-size: 0.86rem;
  }
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.45rem;
  }
  .summary-grid > div {
    border: 1px solid rgba(21, 106, 130, 0.16);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.68);
    padding: 0.48rem 0.55rem;
  }
  .k {
    margin: 0;
    color: #64748b;
    font-size: 0.68rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .v {
    margin: 0.12rem 0 0;
    color: #0f172a;
    font-family: "IBM Plex Mono", "SFMono-Regular", monospace;
    font-size: 1rem;
  }

  .note { font-size: 0.78rem; color: #64748b; }

  code { font-family: "IBM Plex Mono", "SFMono-Regular", monospace; }

  @media (max-width: 900px) {
    .compare { grid-template-columns: 1fr; }
    .summary-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 640px) {
    .card,
    .compare article {
      padding: 0.56rem;
    }

    .gain-callout {
      grid-template-columns: 1fr;
    }

    .gain-callout strong {
      grid-row: auto;
    }
  }
</style>
