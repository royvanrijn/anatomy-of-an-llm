<script lang="ts">
  import DimensionOverlay from "../DimensionOverlay.svelte";

  const pairBases = [1, 2, 4, 8];
  const sentenceTokens = [
    { text: "The", pos: 0, pairPos: 4 },
    { text: "small", pos: 1, pairPos: 2 },
    { text: "dog", pos: 2, pairPos: 3 },
    { text: "chased", pos: 3, pairPos: 2 },
    { text: "the", pos: 4, pairPos: 0 },
    { text: "ball", pos: 5, pairPos: 3 }
  ];
  const tokenBundles = [
    { a: -155, b: -28, c: 82, la: 18, lb: 28, lc: 16 },
    { a: -122, b: 18, c: 141, la: 16, lb: 24, lc: 20 },
    { a: -171, b: -64, c: 44, la: 21, lb: 26, lc: 15 },
    { a: -96, b: 74, c: 168, la: 15, lb: 22, lc: 19 },
    { a: -138, b: -8, c: 118, la: 17, lb: 25, lc: 16 },
    { a: -66, b: 132, c: 24, la: 16, lb: 23, lc: 18 }
  ];
  let selectedSentenceIndex = 0;

  // One toy Q/K pair before rotation.
  const qBase = { x: 0.82, y: 0.34 };
  const kBase = { x: 0.58, y: 0.76 };

  function theta(pos: number, pair: number) {
    return pos / pairBases[pair];
  }

  function rotate(vec: { x: number; y: number }, angle: number) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return {
      x: vec.x * c - vec.y * s,
      y: vec.x * s + vec.y * c
    };
  }

  function dot(a: { x: number; y: number }, b: { x: number; y: number }) {
    return a.x * b.x + a.y * b.y;
  }

  function fmt(v: number) {
    return (v >= 0 ? "+" : "") + v.toFixed(3);
  }

  $: selectedSentenceToken = sentenceTokens[selectedSentenceIndex] ?? sentenceTokens[0];
  $: m = selectedSentenceToken.pos;
  $: n = selectedSentenceToken.pairPos;
  $: pairIndex = selectedSentenceIndex % pairBases.length;
  $: qRot = rotate(qBase, theta(m, pairIndex));
  $: kRot = rotate(kBase, theta(n, pairIndex));
  $: dotBefore = dot(qBase, kBase);
  $: dotAfter = dot(qRot, kRot);
  $: rel = m - n;
  $: delta = theta(m, pairIndex) - theta(n, pairIndex);

  function unitArrowPath(angle: number, length = 20) {
    const rad = (angle * Math.PI) / 180;
    const x = Math.cos(rad) * length;
    const y = Math.sin(rad) * length;
    return `M 0 0 L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }

  $: baseAngle = 0;
  $: rotatedAngles = sentenceTokens.map((_, i) => (i - selectedSentenceIndex) * 16);
</script>

<section class="rope">
  <div class="intro-copy">
    <p><strong>Problem.</strong> Attention sees tokens, but it also needs word order. <code>dog bites man</code> and <code>man bites dog</code> contain the same words, but positions change meaning.</p>
    <p><strong>Naive idea.</strong> One option is to add a position vector to each token. RoPE does something different.</p>
    <p><strong>RoPE idea.</strong> RoPE makes attention position-aware by rotating <code>Q</code> and <code>K</code> vectors according to token position before their dot product is computed. It does not rotate <code>V</code>.</p>
  </div>

  <section class="card scenario">
    <p class="label">Word Order Matters</p>
    <p class="mini"><code>dog bites man</code> <strong>is not the same as</strong> <code>man bites dog</code></p>
    <p class="mini">Same tokens, different positions. RoPE makes <code>Q·K</code> sensitive to that position change.</p>
  </section>

  <section class="card sentence-map">
    <p class="label">Same Token, Different Position</p>
    <p class="mini">Example sentence: <code>The small dog chased the ball.</code></p>
    <p class="mini">In this visual, clicking a word temporarily treats that word as relative index <code>0</code>. RoPE is relative in this sense: if you look from a different token, the position offsets change, so the rotations you compare change too.</p>
    <div class="token-strip" role="group" aria-label="Click a token to drive RoPE rotation example">
      {#each sentenceTokens as token, i}
        <button
          type="button"
          class="pill token-btn"
          class:active={i === selectedSentenceIndex}
          on:click={() => (selectedSentenceIndex = i)}
        >
          {token.text}
        </button>
      {/each}
    </div>
    <div class="position-strip" aria-hidden="true">
      {#each sentenceTokens as _, i}
        {@const relPos = i - selectedSentenceIndex}
        <span class:active={relPos === 0}>[position: {relPos > 0 ? `+${relPos}` : `${relPos}`}]</span>
      {/each}
    </div>
    <div class="vector-rows" aria-hidden="true">
      <p class="mini row-label">Before RoPE: Q/K vectors have content, but no position rotation yet:</p>
      <div class="vector-row">
        {#each sentenceTokens as _, i}
          {@const bundle = tokenBundles[i]}
          <svg class="mini-vec" viewBox="-44 -44 88 88">
            <circle cx="0" cy="0" r="1.8" fill="rgba(100,116,139,0.55)" />
            <path d={unitArrowPath(bundle.a, bundle.la)} class="vec-line base-a" />
            <path d={unitArrowPath(bundle.b, bundle.lb)} class="vec-line base-b" />
            <path d={unitArrowPath(bundle.c, bundle.lc)} class="vec-line base-c" />
          </svg>
        {/each}
      </div>

      <p class="mini row-label">After RoPE: selected token is the 0° reference; others rotate by relative offset:</p>
      <div class="vector-row">
        {#each sentenceTokens as _, i}
          {@const bundle = tokenBundles[i]}
          <svg class="mini-vec" viewBox="-44 -44 88 88">
            <circle cx="0" cy="0" r="1.8" fill="rgba(100,116,139,0.55)" />
            <path d={unitArrowPath(bundle.a, bundle.la)} class="vec-line dashed-base soft" />
            <path d={unitArrowPath(bundle.b, bundle.lb)} class="vec-line dashed-base" />
            <path d={unitArrowPath(bundle.c, bundle.lc)} class="vec-line dashed-base soft" />

            <path d={unitArrowPath(rotatedAngles[i] + bundle.a, bundle.la)} class={`vec-line rotated-line soft ${i === selectedSentenceIndex ? "active" : ""}`} />
            <path d={unitArrowPath(rotatedAngles[i] + bundle.b, bundle.lb)} class={`vec-line rotated-line ${i === selectedSentenceIndex ? "active" : ""}`} />
            <path d={unitArrowPath(rotatedAngles[i] + bundle.c, bundle.lc)} class={`vec-line rotated-line soft ${i === selectedSentenceIndex ? "active" : ""}`} />
          </svg>
        {/each}
      </div>
    </div>
    <p class="mini">Click any token to make it the reference frame. That token stays unrotated while all other tokens rotate relative to it.</p>
  </section>

  <div class="narrative-copy">
    <p class="explainer-title">Relative offset insight</p>
    <p>
      The selected token <code>{selectedSentenceToken.text}</code> is the anchor. Other tokens rotate by their position
      difference to this anchor. In the dot product, the important angle is <code>theta_m - theta_n</code>, so
      compatibility depends on relative offset <code>m - n</code>.
    </p>
    <p>
      In this toy pair, <code>dot(before rotation) = {fmt(dotBefore)}</code> and
      <code>dot(after RoPE rotation) = {fmt(dotAfter)}</code>. As positions change, relative angle changes, and the
      query-key dot product changes too.
    </p>
    <p class="explainer-title">Multi-frequency pairs</p>
    <p>
      Real vectors have many dimension pairs. Different pairs rotate at different speeds: fast pairs capture nearby
      offsets, while slow pairs preserve longer-range position patterns.
    </p>
    <p class="explainer-title">Connect back to attention</p>
    <p>
      RoPE changes the score matrix before softmax. It does not directly decide attention by itself; it changes which
      <code>Q/K</code> pairs are compatible at different relative positions. RoPE gives attention a position-dependent
      bias, and the model still has to learn how to use it.
    </p>
    <DimensionOverlay
      buttonLabel="Explain RoPE dimensions"
      title="RoPE Shape + Pair Logic"
      summary="RoPE is applied to Q and K after projection, pair-by-pair across dimensions."
      equations={[
        "Q = XWq, K = XWk",
        "split each row into 2D pairs: (q_0,q_1), (q_2,q_3), ...",
        "rotate each pair by theta(pos, pair)",
        "attention scores use rotated Q and K"
      ]}
      items={[
        "d_head must be even so we can form 2D pairs",
        "different pairs use different frequencies",
        "positions change angles, angles change Q·K compatibility"
      ]}
      note="In real models, all pairs rotate in parallel for every token in the sequence."
    />
  </div>
</section>

<style>
  .rope { display: grid; gap: 0.9rem; }
  .intro-copy { display: grid; gap: 0.45rem; }
  .intro-copy p { margin: 0; line-height: 1.62; color: var(--text-secondary); }
  .narrative-copy { display: grid; gap: 0.42rem; }
  .narrative-copy p { margin: 0; line-height: 1.62; color: var(--text-secondary); }
  .narrative-copy .explainer-title {
    margin: 0.18rem 0 0;
    font-size: 0.82rem;
    font-weight: bold;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #155e75;
  }

  .card { border: 1px solid var(--border-subtle); border-radius: 12px; background: rgba(255,255,255,0.62); padding: 0.75rem; display: grid; gap: 0.45rem; }
  .label { margin: 0; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-muted); }
  .mini { margin: 0; font-size: 0.84rem; line-height: 1.58; color: var(--text-secondary); }
  code { font-family: "IBM Plex Mono", "SFMono-Regular", monospace; }


  .sentence-map { gap: 0.5rem; }
  .token-strip {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 0.42rem;
  }
  .pill {
    border: 1px solid rgba(100, 116, 139, 0.28);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.88);
    color: #334155;
    font-size: 0.82rem;
    padding: 0.28rem 0.54rem;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    min-height: 2rem;
  }
  .token-btn {
    cursor: pointer;
  }
  .token-btn.active {
    border-color: rgba(21, 106, 130, 0.58);
    background: rgba(21, 106, 130, 0.14);
    color: #0f172a;
  }
  .vector-rows {
    display: grid;
    gap: 0.18rem;
    margin-top: 0.1rem;
  }
  .position-strip {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 0.42rem;
    margin-top: -0.05rem;
  }
  .position-strip span {
    text-align: center;
    font-family: "IBM Plex Mono", "SFMono-Regular", monospace;
    font-size: 0.8rem;
    color: #64748b;
  }
  .position-strip span.active {
    color: #b45309;
    font-weight: 600;
  }
  .row-label {
    font-size: 0.74rem;
    color: #64748b;
  }
  .vector-row {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 0.2rem;
  }
  .mini-vec {
    width: 100%;
    height: 184px;
    display: block;
  }
  .vec-line {
    fill: none;
    stroke-linecap: round;
    stroke-width: 2.4;
  }
  .base-a {
    stroke: rgba(14, 116, 144, 0.78);
  }
  .base-b {
    stroke: rgba(71, 85, 105, 0.84);
  }
  .base-c {
    stroke: rgba(30, 64, 175, 0.72);
  }
  .dashed-base {
    stroke: rgba(100, 116, 139, 0.58);
    stroke-dasharray: 3 2;
  }
  .soft {
    opacity: 0.72;
  }
  .rotated-line {
    stroke: rgba(51, 65, 85, 0.88);
  }
  .rotated-line.active {
    stroke: rgba(217, 119, 6, 0.95);
    stroke-width: 3;
  }

  @media (max-width: 980px) {
    .token-strip,
    .position-strip,
    .vector-row { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }

  @media (max-width: 640px) {
    .card {
      padding: 0.56rem;
    }

    .token-strip,
    .position-strip,
    .vector-row {
      grid-template-columns: repeat(6, minmax(2.85rem, 1fr));
      gap: 0.22rem;
    }

    .pill {
      min-height: 42px;
      padding: 0.22rem 0.28rem;
      font-size: 0.72rem;
    }

    .position-strip span {
      font-size: 0.68rem;
    }

    .mini-vec {
      height: 92px;
    }
  }
</style>
