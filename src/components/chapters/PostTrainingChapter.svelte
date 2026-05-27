<script lang="ts">
  type Stage = {
    id: "base" | "instr" | "pref";
    label: string;
    short: string;
    objective: string;
    data: string;
    output: string;
  };

  const prompt = "Explain why the sky is blue.";

  const stages: Stage[] = [
    {
      id: "base",
      label: "1. Base model (after pre-training)",
      short: "Learns broad world patterns from next-token prediction.",
      objective: "Predict next token over large text/code corpora.",
      data: "Web, books, code, and other broad unlabeled text.",
      output:
        "Sunlight passes through the atmosphere and shorter blue wavelengths scatter more than longer wavelengths. This process is called Rayleigh scattering and makes the sky appear blue from most viewing angles."
    },
    {
      id: "instr",
      label: "2. Instruction tuning", 
      short: "Learns to follow user intent and format answers directly.",
      objective: "Supervised fine-tuning on prompt-response instruction pairs.",
      data: "Human-written and synthetic instruction demonstrations.",
      output:
        "The sky looks blue because molecules in Earth’s atmosphere scatter blue light more strongly than red light. When sunlight enters the atmosphere, blue wavelengths are redirected in many directions, so we see blue from across the sky."
    },
    {
      id: "pref",
      label: "3. Preference tuning",
      short: "Learns which responses are more helpful, safe, and clear.",
      objective: "Optimize toward preferred outputs using ranked comparisons.",
      data: "Human or policy-driven preference judgments over candidate replies.",
      output:
        "Great question. The sky appears blue mainly because of Rayleigh scattering: tiny molecules in the atmosphere scatter short blue wavelengths more than longer red wavelengths. At sunrise and sunset, light travels farther through air, so much of the blue is scattered away before reaching you, which is why skies look warmer then."
    }
  ];

  let selectedStageId: Stage["id"] = "base";
  $: selectedStage = stages.find((s) => s.id === selectedStageId) ?? stages[0];
</script>

<section class="post-training">
  <div class="intro">
    <p>
      Pre-training creates broad capability; post-training shapes behavior. The same underlying model can respond very
      differently depending on which training stage it has gone through.
    </p>
    <p>
      In practice, we can think of this as: pre-training learns <em>knowledge and patterns</em>, while post-training
      learns <em>assistant behavior</em>.
    </p>
  </div>

  <section class="card capability-vs-behavior">
    <p class="label">Capability vs Behavior</p>
    <div class="split">
      <article>
        <p class="head">Pre-training</p>
        <p class="mini">world knowledge, language, code, reasoning patterns</p>
      </article>
      <article>
        <p class="head">Post-training</p>
        <p class="mini">follows instructions, refuses unsafe requests, formats answers, asks clarifying questions, uses a helpful tone</p>
      </article>
    </div>
  </section>

  <section class="card pipeline">
    <p class="label">Three-stage pipeline</p>
    <div class="nodes" role="group" aria-label="Post-training stage selector">
      {#each stages as stage, i}
        <div class="stage-wrap">
          <button type="button" class:active={selectedStageId === stage.id} on:click={() => (selectedStageId = stage.id)}>
            <span>{stage.label}</span>
            <small>{stage.short}</small>
          </button>
        </div>
        {#if i < stages.length - 1}
          <span class="arrow">→</span>
        {/if}
      {/each}
    </div>

    <div class="selected-stage-panel">
        <h3>{selectedStage.label}</h3>
        <p class="mini"><strong>Objective:</strong> {selectedStage.objective}</p>
        <p class="mini"><strong>Signal:</strong> {selectedStage.data}</p>
        <p class="mini">
          Key message: pre-training gives broad latent capability, while instruction and preference tuning mostly steer
          behavior, format, and alignment.
        </p>
        <p class="mini">
          Alignment and safety are not one switch; they are reinforced through multiple post-training signals,
          evaluations, and policy constraints.
        </p>
    </div>
    <div class="selected-stage-panel">
        <p class="prompt"><span>Example prompt:</span></p>
        <p class="prompt"><code>{prompt}</code></p>
        <article class="selected-response">
          <p class="output"><code>{selectedStage.output}</code></p>
        </article>
    </div>
  </section>


  <section class="rlhf-context">
    <p>
      Not every model is trained with RLHF-style preference optimization. Some models stop at supervised instruction
      tuning, while others add direct preference objectives.
    </p>
    <p>
      The goal is to make outputs more helpful, safer, and better aligned with human expectations when multiple answers
      are all technically plausible.
    </p>
    <p>
      In short: pre-training teaches what the model <em>can</em> say, while preference tuning helps steer what it
      <em>should</em> say in assistant contexts.
    </p>
  </section>

  <section class="card rlhf-flow">
    <p class="label">How RLHF-Style Preference Tuning Works</p>
    <div class="flow">
      <div>
        <p class="step">Step 1 · Candidate answers</p>
        <p class="mini">For one prompt, generate multiple candidate responses from the current model.</p>
      </div>
      <div>
        <p class="step">Step 2 · Pairwise ranking</p>
        <p class="mini">
          Human raters (or policy-based systems) choose which answer is better in pairs.
          Example: <code>A &gt; B</code> for helpfulness and safety.
        </p>
      </div>
      <div>
        <p class="step">Step 3 · Preference objective</p>
        <p class="mini">
          Train a preference signal from those comparisons, then optimize the model so preferred responses become more likely.
        </p>
      </div>
    </div>
    <div class="pairwise">
      <p class="pair-title">Mini pairwise example</p>
      <p class="mini"><strong>Prompt:</strong> <code>How can I recover a deleted file?</code></p>
      <p class="mini"><strong>Answer A:</strong> Gives clear, cautious, platform-specific recovery steps.</p>
      <p class="mini"><strong>Answer B:</strong> Vague and omits safety checks.</p>
      <p class="mini"><strong>Ranking:</strong> <code>A &gt; B</code> (more useful and safer).</p>
    </div>
  </section>
</section>

<style>
  .post-training { display: grid; gap: 0.9rem; }
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
  .split { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.55rem; }
  .split article { border: 1px solid rgba(100, 116, 139, 0.22); border-radius: 10px; padding: 0.5rem; background: rgba(255,255,255,0.7); }
  .head { margin: 0 0 0.2rem 0; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; color: #475569; }

  .nodes {
    display: grid;
    grid-template-columns: minmax(190px, 1fr) auto minmax(190px, 1fr) auto minmax(190px, 1fr);
    align-items: center;
    gap: 0.5rem;
  }

  .stage-wrap { min-width: 0; }

  .nodes button {
    border: 1px solid rgba(148, 163, 184, 0.34);
    border-radius: 12px;
    background: linear-gradient(165deg, rgba(255,255,255,0.95), rgba(248,250,252,0.86));
    padding: 0.58rem 0.68rem;
    display: grid;
    text-align: left;
    gap: 0.26rem;
    width: 100%;
    color: var(--text-secondary);
    transition: border-color 130ms ease, background-color 130ms ease, box-shadow 130ms ease, transform 130ms ease;
    box-shadow: 0 1px 0 rgba(255,255,255,0.65), 0 2px 8px rgba(15,23,42,0.05);
  }

  .nodes button span { font-size: 0.82rem; font-weight: 600; color: #1f2937; }
  .nodes button small { font-size: 0.74rem; color: #64748b; line-height: 1.35; }

  .nodes button.active {
    border-color: rgba(21, 106, 130, 0.62);
    background: linear-gradient(165deg, rgba(235, 248, 252, 0.96), rgba(223, 242, 249, 0.86));
    box-shadow: 0 0 0 1px rgba(21, 106, 130, 0.14), 0 6px 14px rgba(21, 106, 130, 0.16);
  }
  .nodes button:hover {
    transform: translateY(-1px);
    border-color: rgba(21, 106, 130, 0.42);
    box-shadow: 0 0 0 1px rgba(21, 106, 130, 0.08), 0 5px 12px rgba(21, 106, 130, 0.12);
  }
  .nodes button { cursor: pointer; }

  .arrow {
    color: #8aa4b2;
    font-size: 1.06rem;
    font-weight: 600;
    text-align: center;
    user-select: none;
  }

  .selected-stage-panel {
    margin-top: 0.28rem;
    border: 1px solid rgba(21, 106, 130, 0.28);
    border-radius: 12px;
    background: linear-gradient(160deg, rgba(241, 248, 251, 0.82), rgba(255, 255, 255, 0.78));
    padding: 0.65rem 0.72rem;
    display: grid;
    gap: 0.26rem;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.66);
  }
  .selected-stage-panel h3 {
    margin: 0 0 0.06rem 0;
    font-family: "Fraunces", "Iowan Old Style", "Georgia", serif;
    font-size: 1.02rem;
    font-weight: 500;
    color: #0f172a;
  }

  .flow { display: grid; gap: 0.45rem; }
  .flow > div { border: 1px solid rgba(100,116,139,0.2); border-radius: 10px; background: rgba(255,255,255,0.74); padding: 0.46rem 0.52rem; }
  .step { margin: 0 0 0.16rem 0; font-size: 0.77rem; letter-spacing: 0.04em; text-transform: uppercase; color: #64748b; }
  .pairwise { border: 1px solid rgba(21,106,130,0.26); border-radius: 10px; background: rgba(241, 248, 251, 0.8); padding: 0.5rem; display: grid; gap: 0.22rem; }
  .pair-title { margin: 0; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em; color: #155e75; }

  .prompt {
    margin: 0;
    font-size: 0.86rem;
    color: var(--text-secondary);
    line-height: 1.55;
  }
  .prompt span { text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.7rem; color: var(--text-muted); margin-right: 0.35rem; }
  code { font-family: "IBM Plex Mono", "SFMono-Regular", monospace; }

  .selected-response {
    border: 1px solid rgba(100, 116, 139, 0.24);
    border-radius: 10px;
    background: rgba(255,255,255,0.72);
    padding: 0.65rem;
    display: grid;
    gap: 0.4rem;
    min-height: 100px;
    transition: border-color 120ms ease, background-color 120ms ease;
    position: relative;
  }


  .stage-title { margin: 0; font-size: 0.82rem; color: #1f2937; font-weight: 600; }
  .meta { margin: 0; font-size: 0.77rem; color: #475569; line-height: 1.45; }
  .output { margin: 0; font-size: 0.82rem; color: var(--text-secondary); line-height: 1.56; }

  .takeaway h4 {
    margin: 0;
    font-family: "Fraunces", "Iowan Old Style", "Georgia", serif;
    font-size: 1.18rem;
    font-weight: 500;
    color: #111827;
  }

  @media (max-width: 980px) {
    .split { grid-template-columns: 1fr; }
    .nodes {
      grid-template-columns: 1fr;
      gap: 0.4rem;
    }
    .arrow {
      transform: rotate(90deg);
      font-size: 0.95rem;
      line-height: 1;
    }
  }

  @media (max-width: 640px) {
    .card,
    .split article,
    .selected-stage-panel,
    .selected-response {
      padding: 0.56rem;
    }

    .nodes button {
      min-height: 58px;
      padding: 0.5rem 0.56rem;
    }
  }
</style>
