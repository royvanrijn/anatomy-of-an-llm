<script lang="ts">
  type Mode = {
    id: "fp32" | "fp16" | "int8" | "int4";
    label: string;
    bits: number;
    note: string;
    quality: string;
  };

  const matrix = [
    [0.18371234, -1.20491236, 0.00712091, 2.91823411, -0.55291337],
    [0.44204588, -0.99123817, 1.33100214, -0.22345518, 0.07620133],
    [3.12019843, -2.01444274, 0.55193302, -0.04721129, 1.77231055],
    [-0.80911403, 2.20133044, -1.48320182, 0.19441726, -0.00990127],
    [0.61544281, -0.33611945, 1.00993218, -2.44211706, 0.43120572]
  ];

  const modes: Mode[] = [
    {
      id: "fp32",
      label: "FP32",
      bits: 32,
      note: "Maximum precision, largest memory footprint.",
      quality: "Reference quality"
    },
    {
      id: "fp16",
      label: "FP16",
      bits: 16,
      note: "High fidelity, large memory footprint.",
      quality: "Best quality in this demo"
    },
    {
      id: "int8",
      label: "INT8",
      bits: 8,
      note: "Strong quality-size balance for many local deployments.",
      quality: "Slight accuracy drop"
    },
    {
      id: "int4",
      label: "INT4",
      bits: 4,
      note: "Much smaller and faster to fit locally, but more approximation.",
      quality: "Noticeable quality drop risk"
    }
  ];

  const paramCount = 8_000_000_000;
  let selectedModeId: Mode["id"] = "fp32";

  $: selectedMode = modes.find((m) => m.id === selectedModeId) ?? modes[0];

  function quantizeValue(value: number, bits: number) {
    if (bits === 32) return value;
    if (bits === 16) {
      // Approximate FP16 precision by rounding mantissa-like detail.
      return Number(value.toPrecision(4));
    }
    const qMax = Math.pow(2, bits - 1) - 1;
    const qMin = -Math.pow(2, bits - 1);
    const scale = 3.5 / qMax; // illustrative symmetric scale
    const q = Math.max(qMin, Math.min(qMax, Math.round(value / scale)));
    return q * scale;
  }

  $: quantized = matrix.map((row) => row.map((v) => quantizeValue(v, selectedMode.bits)));

  function fmt(v: number) {
    const decimals = selectedMode.id === "fp32" ? 8 : selectedMode.id === "fp16" ? 5 : 4;
    return `${v >= 0 ? "+" : ""}${v.toFixed(decimals)}`;
  }

  function modelSizeGb(bits: number) {
    const bytes = (paramCount * bits) / 8;
    return bytes / 1_000_000_000;
  }

  $: fp16Size = modelSizeGb(16);
  $: fp32Size = modelSizeGb(32);
  $: selectedSize = modelSizeGb(selectedMode.bits);
  $: saved = fp32Size - selectedSize;
  $: reductionPct = (saved / fp32Size) * 100;

  $: flat = quantized.flat();
  $: uniqueCount = new Set(flat.map((v) => v.toFixed(10))).size;
  $: qMin = Math.min(...flat);
  $: qMax = Math.max(...flat);

  function quantInfo(bits: number) {
    if (bits >= 16) return "Stored directly as floating-point values.";
    const levels = Math.pow(2, bits);
    return `${levels} representable integer levels per value (before dequantization).`;
  }
</script>

<section class="quantization">
  <div class="intro">
    <p>
      Quantization stores model weights with fewer bits. The goal is to reduce memory and make local inference more
      practical, while accepting a small quality trade-off.
    </p>
  </div>

  <section class="card controls">
    <p class="label">Quantization selector</p>
    <div class="modes" role="group" aria-label="Quantization mode selector">
      {#each modes as mode}
        <button type="button" class:active={selectedModeId === mode.id} on:click={() => (selectedModeId = mode.id)}>
          {mode.label}
        </button>
      {/each}
    </div>
    <p class="mini"><strong>{selectedMode.label}:</strong> {selectedMode.note}</p>
    <p class="mini"><strong>Bits per value:</strong> <code>{selectedMode.bits}</code> bits</p>
    <p class="mini">{quantInfo(selectedMode.bits)}</p>
  </section>

  <section class="card matrices">
    <p class="label">Weight Matrix ({selectedMode.label})</p>
    <article class="single-matrix">
      <p class="sub">Quantized values at selected precision</p>
      <table>
        <tbody>
          {#each quantized as row}
            <tr>{#each row as v}<td>{fmt(v)}</td>{/each}</tr>
          {/each}
        </tbody>
      </table>
      <div class="stats">
        <p class="mini"><strong>Unique values in this 5×5 matrix:</strong> <code>{uniqueCount}</code></p>
        <p class="mini"><strong>Value range:</strong> <code>{fmt(qMin)}</code> to <code>{fmt(qMax)}</code></p>
      </div>
    </article>
  </section>

  <section class="card size">
    <p class="label">8B Model Size (Guestimate)</p>
    <div class="size-grid">
      <div>
        <p class="k">FP32 baseline</p>
        <p class="v">{fp32Size.toFixed(1)} GB</p>
      </div>
      <div>
        <p class="k">{selectedMode.label} estimate</p>
        <p class="v">{selectedSize.toFixed(1)} GB</p>
      </div>
      <div>
        <p class="k">Saved</p>
        <p class="v">{saved.toFixed(1)} GB</p>
      </div>
      <div>
        <p class="k">Reduction</p>
        <p class="v">{reductionPct.toFixed(0)}%</p>
      </div>
    </div>
    <p class="mini">
      Tradeoff: lower precision can slightly reduce accuracy or response quality, but it is often the key enabler for
      running strong models locally on consumer hardware.
    </p>
    <p class="mini">
      Why numbers still look like floats in INT8/INT4: the model stores compact integers, then runtime kernels
      dequantize them back to approximate floating-point values during compute.
    </p>
    <p class="mini">
      This chapter uses simplified estimates and symmetric quantization for intuition; real runtimes also include
      metadata, activation precision choices, and kernel-specific optimizations.
    </p>
  </section>
</section>

<style>
  .quantization { display: grid; gap: 0.9rem; }
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
  .sub { margin: 0; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; }

  .modes { display: flex; gap: 0.4rem; }
  .modes button {
    border: 1px solid var(--border-subtle);
    background: rgba(255,255,255,0.9);
    border-radius: 999px;
    padding: 0.32rem 0.7rem;
    font-size: 0.8rem;
    color: var(--text-secondary);
  }
  .modes button.active {
    border-color: rgba(21, 106, 130, 0.55);
    background: rgba(21, 106, 130, 0.14);
    color: #1f2937;
  }

  .single-matrix {
    border: 1px solid rgba(100,116,139,0.24);
    border-radius: 10px;
    background: rgba(255,255,255,0.74);
    padding: 0.65rem;
    display: grid;
    gap: 0.45rem;
  }

  table { width: 100%; border-collapse: collapse; }
  td {
    border: 1px solid rgba(148,163,184,0.28);
    padding: 0.28rem 0.38rem;
    text-align: right;
    font-size: 0.9rem;
    font-family: "IBM Plex Mono", "SFMono-Regular", monospace;
    color: #1f2937;
    background: rgba(248,250,252,0.72);
  }
  .stats {
    border-top: 1px solid rgba(148,163,184,0.24);
    margin-top: 0.15rem;
    padding-top: 0.35rem;
    display: grid;
    gap: 0.2rem;
  }

  .size-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.45rem; }
  .size-grid > div { border: 1px solid rgba(100,116,139,0.24); border-radius: 10px; background: rgba(255,255,255,0.74); padding: 0.46rem; }
  .k { margin: 0; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; }
  .v { margin: 0.16rem 0 0; font-size: 1rem; color: #0f172a; font-family: "IBM Plex Mono", "SFMono-Regular", monospace; }

  @media (max-width: 900px) {
    .size-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  @media (max-width: 640px) {
    .card,
    .single-matrix {
      padding: 0.56rem;
    }

    .modes {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .modes button {
      min-height: 42px;
      padding-inline: 0.48rem;
    }

    td {
      padding: 0.24rem 0.22rem;
      font-size: 0.68rem;
    }

    .size-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
