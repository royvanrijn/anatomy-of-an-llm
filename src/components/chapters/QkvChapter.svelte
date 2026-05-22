<script lang="ts">
  import { onDestroy, onMount, tick } from "svelte";
  type TokenNode = {
    id: string;
    text: string;
    valueHint: string;
  };

  type Scenario = {
    id: string;
    label: string;
    prompt: string;
    tokens: TokenNode[];
    boosts: Record<string, Record<string, number>>;
  };

  const scenarioOneTokens: TokenNode[] = [
    { id: "a1", text: "A", valueHint: "article" },
    { id: "blue", text: "blue", valueHint: "car attribute" },
    { id: "car", text: "car", valueHint: "vehicle entity" },
    { id: "crashed", text: "crashed", valueHint: "collision event" },
    { id: "into", text: "into", valueHint: "relation" },
    { id: "a2", text: "a", valueHint: "article" },
    { id: "concrete", text: "concrete", valueHint: "wall attribute" },
    { id: "wall", text: "wall", valueHint: "barrier entity" },
    { id: "comma", text: ",", valueHint: "punctuation" },
    { id: "it", text: "it", valueHint: "pronoun reference" },
    { id: "was", text: "was", valueHint: "auxiliary" },
    { id: "speeding", text: "speeding", valueHint: "motion property" },
    { id: "period", text: ".", valueHint: "punctuation" }
  ];

  const scenarioTwoTokens: TokenNode[] = [
    { id: "a1", text: "A", valueHint: "article" },
    { id: "red", text: "red", valueHint: "truck attribute" },
    { id: "truck", text: "truck", valueHint: "vehicle entity" },
    { id: "slammed", text: "slammed", valueHint: "collision event" },
    { id: "into", text: "into", valueHint: "relation" },
    { id: "a2", text: "a", valueHint: "article" },
    { id: "steel", text: "steel", valueHint: "bridge attribute" },
    { id: "bridge", text: "bridge", valueHint: "structure entity" },
    { id: "comma", text: ",", valueHint: "punctuation" },
    { id: "it", text: "it", valueHint: "pronoun reference" },
    { id: "was", text: "was", valueHint: "auxiliary" },
    { id: "speeding", text: "speeding", valueHint: "motion property" },
    { id: "period", text: ".", valueHint: "punctuation" }
  ];

  const scenarios: Scenario[] = [
    {
      id: "car-wall",
      label: "car vs wall",
      prompt: "A blue car crashed into a concrete wall, it was speeding.",
      tokens: scenarioOneTokens,
      boosts: {
        a1: { blue: 4.2, car: 3.8 },
        blue: { car: 6.6, crashed: 1.5 },
        car: { blue: 2.2, crashed: 3.2, it: 1.3, speeding: 1.7 },
        crashed: { car: 3.0, wall: 1.8, into: 1.6 },
        into: { crashed: 1.4, wall: 2.0, concrete: 1.2 },
        a2: { concrete: 3.0, wall: 3.6 },
        concrete: { wall: 6.2, crashed: 1.0 },
        wall: { concrete: 4.0, crashed: 1.9, it: 1.0 },
        comma: { it: 2.6, car: 1.2, speeding: 1.0 },
        it: { car: 5.2, speeding: 3.9, crashed: 1.2 },
        was: { it: 4.4, speeding: 3.1, car: 1.4 },
        speeding: { car: 3.4, it: 2.6, crashed: 2.1 },
        period: { speeding: 1.3, it: 0.8 }
      }
    },
    {
      id: "truck-bridge",
      label: "truck vs bridge",
      prompt: "A red truck slammed into a steel bridge, it was speeding.",
      tokens: scenarioTwoTokens,
      boosts: {
        a1: { red: 4.2, truck: 3.8 },
        red: { truck: 6.6, slammed: 1.5 },
        truck: { red: 2.2, slammed: 3.2, it: 1.3, speeding: 1.7 },
        slammed: { truck: 3.0, bridge: 1.8, into: 1.6 },
        into: { slammed: 1.4, bridge: 2.0, steel: 1.2 },
        a2: { steel: 3.0, bridge: 3.6 },
        steel: { bridge: 6.2, slammed: 1.0 },
        bridge: { steel: 4.0, slammed: 1.9, it: 1.0 },
        comma: { it: 2.6, truck: 1.2, speeding: 1.0 },
        it: { truck: 5.2, speeding: 3.9, slammed: 1.2 },
        was: { it: 4.4, speeding: 3.1, truck: 1.4 },
        speeding: { truck: 3.4, it: 2.6, slammed: 2.1 },
        period: { speeding: 1.3, it: 0.8 }
      }
    }
  ];

  let scenarioId = scenarios[0].id;
  let selectedIndex = -1;
  let tokenRowEl: HTMLDivElement | null = null;
  let tokenCenters: number[] = [];
  let rowWidth = 1000;
  let resizeObserver: ResizeObserver | null = null;
  let rafId = 0;

  $: scenario = scenarios.find((s) => s.id === scenarioId) ?? scenarios[0];
  $: weightRows = buildWeightRows(scenario.tokens, scenario.boosts);
  $: hasSelection = selectedIndex >= 0;
  $: selectedToken = hasSelection ? scenario.tokens[selectedIndex] : null;
  $: selectedWeights = hasSelection ? getWeightsForIndex(selectedIndex) : [];
  $: keyRows = buildKeyRows(scenario.tokens, selectedIndex, selectedWeights);
  $: bestKeyIndex = keyRows.length ? keyRows[0].index : -1;
  $: maxKeyWeight = keyRows.length ? keyRows[0].weight : 1;
  $: arcEdges = buildArcEdges(scenario.tokens.length, selectedIndex, selectedWeights, bestKeyIndex, maxKeyWeight, tokenCenters);
  $: pieSlices = buildPieSlices(keyRows);
  $: pieGradient = buildPieGradient(pieSlices);
  $: mixBreakdown = keyRows.slice(0, 4).map((row) => ({
    token: row.token.text,
    hint: row.token.valueHint,
    weight: row.weight
  }));

  function buildWeightRows(tokens: TokenNode[], boosts: Record<string, Record<string, number>>) {
    const rowsByQuery: number[][] = [];
    for (let q = 0; q < tokens.length; q++) {
      rowsByQuery.push(buildNormalizedRow(q, tokens, boosts));
    }
    return rowsByQuery;
  }

  function buildNormalizedRow(queryIndex: number, tokens: TokenNode[], boosts: Record<string, Record<string, number>>) {
    if (queryIndex < 0 || queryIndex >= tokens.length) return [];
    const query = tokens[queryIndex];
    const row: number[] = [];
    for (let k = 0; k < tokens.length; k++) {
      const key = tokens[k];
      const distance = Math.abs(queryIndex - k);
      const base = 0.18 / (distance + 1);
      const semanticBoost = boosts?.[query.id]?.[key.id] ?? 0;
      const selfPenalty = queryIndex === k ? 0.02 : 0;
      const punctuationPenalty = (key.id === "comma" || key.id === "period") ? 0.03 : 0;
      row.push(Math.max(0.0001, base + semanticBoost - selfPenalty - punctuationPenalty));
    }
    const sum = row.reduce((a, b) => a + b, 0) || 1;
    return row.map((value) => value / sum);
  }

  function getWeightsForIndex(index: number) {
    const cached = weightRows[index];
    if (cached && cached.length === scenario.tokens.length) return cached;
    return buildNormalizedRow(index, scenario.tokens, scenario.boosts);
  }

  function buildKeyRows(tokens: TokenNode[], selected: number, weights: number[]) {
    if (selected < 0 || !weights.length) return [];
    const rows = tokens
      .map((token, index) => ({ token, index, weight: index === selected ? 0 : (weights[index] || 0) }))
      .filter((row) => row.index !== selected)
      .sort((a, b) => {
        if (b.weight !== a.weight) return b.weight - a.weight;
        return a.index - b.index;
      });
    return rows;
  }

  function buildPieSlices(rows: Array<{ token: TokenNode; index: number; weight: number }>) {
    const top = rows.slice(0, 5);
    const topSum = top.reduce((sum, row) => sum + row.weight, 0);
    const rest = Math.max(0, 1 - topSum);
    const entries = [...top];
    if (rest > 0.0001) {
      entries.push({ token: { id: "other", text: "other", valueHint: "remaining context" }, index: -1, weight: rest });
    }

    let acc = 0;
    return entries.map((entry, i) => {
      const start = acc;
      const end = acc + entry.weight;
      acc = end;
      return {
        ...entry,
        start,
        end,
        color: i === 0 ? "#d97706" : i === 1 ? "#475569" : i === 2 ? "#64748b" : i === 3 ? "#94a3b8" : i === 4 ? "#cbd5e1" : "#e2e8f0"
      };
    });
  }

  function buildPieGradient(slices: Array<{ start: number; end: number; color: string }>) {
    if (!slices.length) return "conic-gradient(#e2e8f0 0% 100%)";
    const segments = slices.map((s) => `${s.color} ${(s.start * 100).toFixed(3)}% ${(s.end * 100).toFixed(3)}%`).join(", ");
    return `conic-gradient(${segments})`;
  }

  function arrowWidth(index: number) {
    if (!selectedWeights.length || selectedIndex < 0 || index === selectedIndex) return 0;
    const w = selectedWeights[index] || 0;
    if (w <= 0) return 1.25;
    // Make top key unmistakably widest.
    if (index === bestKeyIndex) return 15;
    return 1.5 + 8.5 * (w / Math.max(0.0001, maxKeyWeight));
  }

  function arrowOpacity(index: number) {
    if (!selectedWeights.length || selectedIndex < 0 || index === selectedIndex) return 0;
    const w = selectedWeights[index] || 0;
    return 0.18 + 0.72 * (w / Math.max(0.0001, maxKeyWeight));
  }

  const ARC_CANVAS_WIDTH = 1000;
  const ARC_CANVAS_HEIGHT = 100;
  const ARC_BASELINE_Y = 88;

  function tokenCenterX(index: number, count: number, centers: number[]) {
    if (centers.length === count && rowWidth > 0) {
      const scale = ARC_CANVAS_WIDTH / rowWidth;
      return centers[index] * scale;
    }
    const step = ARC_CANVAS_WIDTH / Math.max(1, count);
    return step * index + step / 2;
  }

  function arcPath(from: number, to: number, tokenCount: number, centers: number[]) {
    const x1 = tokenCenterX(from, tokenCount, centers);
    const x2 = tokenCenterX(to, tokenCount, centers);
    const midpoint = (x1 + x2) / 2;
    const distance = Math.abs(x2 - x1);
    const sideBias = (to - from) * 2.2;
    const height = Math.max(38, 88 - Math.min(52, distance * 0.1) + Math.abs(sideBias) * 0.5);
    return `M ${x1} ${ARC_BASELINE_Y} Q ${midpoint} ${ARC_BASELINE_Y - height} ${x2} ${ARC_BASELINE_Y}`;
  }

  function buildArcEdges(
    tokenCount: number,
    selected: number,
    weights: number[],
    bestIndex: number,
    maxWeight: number,
    centers: number[]
  ) {
    if (selected < 0 || selected >= tokenCount || tokenCount <= 1) return [];

    const edges: Array<{
      index: number;
      weight: number;
      path: string;
      width: number;
      opacity: number;
      isBest: boolean;
    }> = [];

    for (let index = 0; index < tokenCount; index++) {
      if (index === selected) continue;
      const weight = weights[index] || 0;
      const width = index === bestIndex ? 10 : (weight <= 0 ? 1.1 : 1.2 + 5.6 * (weight / Math.max(0.0001, maxWeight)));
      const opacity = 0.3 + 0.5 * (weight / Math.max(0.0001, maxWeight));
      edges.push({
        index,
        weight,
        path: arcPath(selected, index, tokenCount, centers),
        width,
        opacity,
        isBest: index === bestIndex
      });
    }

    // draw weaker links first; strongest last so it is visually on top
    edges.sort((a, b) => {
      if (a.weight !== b.weight) return a.weight - b.weight;
      return a.index - b.index;
    });
    return edges;
  }

  function pickScenario(id: string) {
    scenarioId = id;
    selectedIndex = -1;
    scheduleMeasure();
  }

  function pickToken(index: number) {
    selectedIndex = index;
    scheduleMeasure();
  }

  async function measureTokenCenters() {
    await tick();
    if (!tokenRowEl) return;
    const buttons = Array.from(tokenRowEl.querySelectorAll<HTMLButtonElement>("button.token"));
    if (!buttons.length) return;
    const rowRect = tokenRowEl.getBoundingClientRect();
    rowWidth = Math.max(1, rowRect.width);
    tokenCenters = buttons.map((button) => {
      const rect = button.getBoundingClientRect();
      return rect.left - rowRect.left + rect.width / 2;
    });
  }

  function scheduleMeasure() {
    if (typeof window === "undefined") return;
    if (rafId) window.cancelAnimationFrame(rafId);
    rafId = window.requestAnimationFrame(() => {
      void measureTokenCenters();
    });
  }

  onMount(() => {
    scheduleMeasure();
    if (typeof ResizeObserver !== "undefined" && tokenRowEl) {
      resizeObserver = new ResizeObserver(() => scheduleMeasure());
      resizeObserver.observe(tokenRowEl);
    }
    const onResize = () => scheduleMeasure();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  });

  onDestroy(() => {
    if (rafId && typeof window !== "undefined") window.cancelAnimationFrame(rafId);
    if (resizeObserver) resizeObserver.disconnect();
  });

  $: if (tokenRowEl) {
    scenarioId;
    selectedIndex;
    scheduleMeasure();
  }
</script>

<section class="qkv">
  <div class="intro-copy">
    <p>Right now we only have tokens. But sentences encode extra meaning through relationships between nearby words and references.</p>
    <p>Select one token to inspect which key tokens it matches with (arrows), then how those weights mix into one updated value representation.</p>
  </div>

  <section class="card scenario-card">
    <p class="label">Context Scenario</p>
    <div class="scenario-pills" role="group" aria-label="Scenario toggle">
      {#each scenarios as item}
        <button type="button" class:active={item.id === scenarioId} on:click={() => pickScenario(item.id)}>{item.label}</button>
      {/each}
    </div>
    <p class="sentence">{scenario.prompt}</p>
  </section>

  <section class="card sentence-card">
    <p class="label">Sentence Tokens</p>

    {#if hasSelection}
      <div class="arc-wrap" aria-hidden="true">
        <svg
          class="arc-svg"
          viewBox={`0 0 ${ARC_CANVAS_WIDTH} ${ARC_CANVAS_HEIGHT}`}
          preserveAspectRatio="none"
          role="presentation"
        >
          {#each arcEdges as edge}
            <path
              d={edge.path}
              class={`arc ${edge.isBest ? "best" : ""}`}
              stroke-width={edge.width}
              opacity={edge.opacity}
              vector-effect="non-scaling-stroke"
            />
          {/each}
        </svg>
      </div>
    {/if}

    <div class="token-row" bind:this={tokenRowEl} role="group" aria-label="Sentence tokens">
      {#each scenario.tokens as token, index}
        <button type="button" class="token" class:selected={index === selectedIndex} class:best={hasSelection && index === bestKeyIndex} on:click={() => pickToken(index)}>
          {token.text}
        </button>
      {/each}
    </div>

    {#if hasSelection}
      <p class="mini hint">
        Selected query: <code>{selectedToken?.text}</code>. Strongest key target:
        <code>{scenario.tokens[bestKeyIndex].text}</code> ({((selectedWeights[bestKeyIndex] || 0) * 100).toFixed(1)}%).
      </p>
    {:else}
      <p class="mini hint">Pick any token to compute attention links and value mixing.</p>
    {/if}
  </section>

  {#if hasSelection}
    <section class="card weight-list">
      <p class="label">Query -> Key Weights</p>
      <p class="mini"><code>{selectedToken?.text}</code> maps to:</p>
      <div class="weight-grid">
        <div class="pie-block">
          <div class="pie-donut" style={`background:${pieGradient};`} aria-label="Attention share pie chart">
            <div class="pie-hole">
              <span class="pie-center">{selectedToken?.text}</span>
              <span class="pie-sub">query</span>
            </div>
          </div>
        </div>
        <div class="pie-legend">
          {#each pieSlices as slice}
            <div class="legend-row">
              <span class="legend-dot" style={`background:${slice.color};`} aria-hidden="true"></span>
              <span>{slice.token.text}</span>
              <code>{(slice.weight * 100).toFixed(1)}%</code>
            </div>
          {/each}
        </div>
      </div>
    </section>

    <section class="card value-mix">
      <p class="label">How Value Mixing Works</p>
      <p class="mini">
        The model now computes an updated representation for the selected token:
        <code>V_new = Σ attention_weight(i) × V_i</code>.
      </p>
      <div class="mix-equation" role="list" aria-label="Top value contributions">
        {#each mixBreakdown as item, i}
          <span class="eq-term" role="listitem">{(item.weight * 100).toFixed(1)}% × {item.token}({item.hint})</span>
          {#if i < mixBreakdown.length - 1}<span class="eq-plus">+</span>{/if}
        {/each}
      </div>
      <p class="mini">
        Conceptually: the token is rewritten with context. For example, pronoun-like tokens can pull heavily from nearby entity tokens.
      </p>
    </section>
  {/if}
</section>

<style>
  .qkv { display: grid; gap: 0.9rem; }
  .intro-copy { display: grid; gap: 0.5rem; }
  .intro-copy p { margin: 0; color: var(--text-secondary); line-height: 1.62; }

  .card { border: 1px solid var(--border-subtle); border-radius: 12px; background: rgba(255, 255, 255, 0.62); padding: 0.72rem; display: grid; gap: 0.48rem; }
  .label { margin: 0; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-muted); }
  .mini { margin: 0; font-size: 0.84rem; color: var(--text-secondary); line-height: 1.58; }
  code { font-family: "IBM Plex Mono", "SFMono-Regular", monospace; }

  .scenario-pills { display: flex; flex-wrap: wrap; gap: 0.4rem; }
  .scenario-pills button, .token, .reset {
    border: 1px solid var(--border-subtle);
    background: rgba(255, 255, 255, 0.85);
    color: var(--text-secondary);
    border-radius: 999px;
    padding: 0.25rem 0.62rem;
    font-size: 0.8rem;
    transition: border-color 160ms ease, background-color 160ms ease, color 160ms ease;
  }
  .scenario-pills button.active, .token.selected { background: rgba(21, 106, 130, 0.16); border-color: rgba(21, 106, 130, 0.62); color: #0f172a; }

  .sentence { margin: 0; font-size: 0.98rem; color: var(--text-primary); font-weight: 500; }

  .token-row { display: flex; flex-wrap: wrap; gap: 0.42rem; position: relative; z-index: 2; margin-top: 0.15rem; }
  .token {
    position: relative;
    min-height: 1.9rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    white-space: nowrap;
    font-weight: 500;
    padding-inline: 0.72rem;
  }
  .token.best { border-color: rgba(217, 119, 6, 0.62); background: rgba(217, 119, 6, 0.12); color: #7c2d12; }

  .arc-wrap {
    margin-top: 0.35rem;
    margin-bottom: 0.6rem;
    border-bottom: 1px dashed rgba(100, 116, 139, 0.34);
    padding-bottom: 0.2rem;
    overflow: hidden;
    min-height: 96px;
  }
  .arc-svg { display: block; width: 100%; height: 96px; }
  .arc { fill: none; stroke: rgba(51, 65, 85, 0.78); stroke-linecap: round; }
  .arc.best { stroke: rgba(217, 119, 6, 0.95); }

  .hint { margin-top: 0.08rem; }
  .weight-grid {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 0.9rem;
    align-items: start;
  }

  .pie-block {
    border: 1px solid rgba(100, 116, 139, 0.25);
    border-radius: 12px;
    padding: 0.35rem;
    background: rgba(248, 250, 252, 0.86);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .pie-donut {
    width: 180px;
    height: 180px;
    border-radius: 50%;
    display: grid;
    place-items: center;
  }

  .pie-hole {
    width: 93px;
    height: 93px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.96);
    display: grid;
    place-items: center;
    align-content: center;
    gap: 0.06rem;
  }

  .pie-center {
    font-size: 0.58rem;
    color: #334155;
    font-family: "IBM Plex Sans", "Avenir Next", "Segoe UI", sans-serif;
    font-weight: 600;
    line-height: 1;
  }

  .pie-sub {
    font-size: 0.49rem;
    color: #64748b;
    font-family: "IBM Plex Sans", "Avenir Next", "Segoe UI", sans-serif;
    line-height: 1;
  }

  .pie-legend { display: grid; gap: 0.35rem; align-content: start; }
  .legend-row {
    display: grid;
    grid-template-columns: 12px 1fr auto;
    gap: 0.45rem;
    align-items: center;
    padding: 0.14rem 0.2rem;
    border-radius: 8px;
    background: rgba(248, 250, 252, 0.72);
  }
  .legend-dot { width: 10px; height: 10px; border-radius: 999px; }

  .mix-equation {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.32rem;
    border: 1px solid rgba(100, 116, 139, 0.28);
    border-radius: 10px;
    padding: 0.42rem 0.52rem;
    background: rgba(248, 250, 252, 0.84);
  }
  .eq-term {
    border-radius: 999px;
    border: 1px solid rgba(100, 116, 139, 0.28);
    background: rgba(255, 255, 255, 0.95);
    padding: 0.16rem 0.46rem;
    font-size: 0.75rem;
    color: var(--text-secondary);
  }
  .eq-plus { color: var(--text-muted); font-size: 0.75rem; }

  .chapter-note {
    border: 1px dashed rgba(100, 116, 139, 0.35);
    border-radius: 10px;
    padding: 0.42rem 0.58rem;
    background: rgba(255, 255, 255, 0.58);
  }

  @media (max-width: 980px) {
    .weight-grid { grid-template-columns: 1fr; }
    .arc-wrap { margin-bottom: 0.4rem; }
  }
</style>
