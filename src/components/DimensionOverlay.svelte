<script lang="ts">
  export let buttonLabel = "Explain dimensions";
  export let title = "Dimension explainer";
  export let summary = "";
  export let equations: string[] = [];
  export let items: string[] = [];
  export let note = "";

  let open = false;
</script>

<div class="dimension-overlay">
  <button type="button" class="shape-help" on:click={() => (open = true)}>
    <span class="shape-icon" aria-hidden="true">[ ]</span>
    <span>
      <span class="shape-help-kicker">Shape Guide</span>
      <span class="shape-help-label">{buttonLabel}</span>
    </span>
  </button>

  {#if open}
    <div class="overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div class="dialog">
        <div class="dialog-head">
          <div class="dialog-mark" aria-hidden="true">[]</div>
          <div>
            <p class="label">{title}</p>
            {#if summary}<p class="mini">{summary}</p>{/if}
          </div>
        </div>

        {#if equations.length}
          <div class="block equations">
            <p class="block-title">Matrix path</p>
            {#each equations as eq}
              <p><code>{eq}</code></p>
            {/each}
          </div>
        {/if}

        {#if items.length}
          <div class="block concepts">
            <p class="block-title">What the dimensions mean</p>
            {#each items as item}
              <p>{item}</p>
            {/each}
          </div>
        {/if}

        {#if note}<p class="mini">{note}</p>{/if}

        <div class="actions">
          <button type="button" on:click={() => (open = false)}>Close</button>
        </div>
      </div>
      <button class="backdrop" type="button" aria-label="Close overlay" on:click={() => (open = false)}></button>
    </div>
  {/if}
</div>

<style>
  .shape-help {
    border: 1.5px solid rgba(var(--chapter-accent-rgb, 21, 106, 130), 0.3);
    background:
      radial-gradient(circle at 0% 0%, rgba(var(--chapter-accent-rgb, 21, 106, 130), 0.12), transparent 54%),
      linear-gradient(155deg, rgba(255, 255, 255, 0.98), rgba(244, 248, 250, 0.94));
    border-radius: 12px;
    padding: 0.58rem 0.78rem;
    font-size: 0.78rem;
    color: var(--text-secondary);
    display: inline-flex;
    align-items: center;
    gap: 0.54rem;
    text-align: left;
    margin-top: 0.25rem;
    box-shadow: 0 3px 10px rgba(15, 23, 42, 0.08);
    transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
  }
  .shape-help:hover,
  .shape-help:focus-visible {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
    border-color: rgba(21, 106, 130, 0.35);
    outline: none;
  }
  .shape-icon {
    width: 2rem;
    height: 2rem;
    border-radius: 9px;
    display: grid;
    place-items: center;
    background: rgba(var(--chapter-accent-rgb, 21, 106, 130), 0.12);
    color: var(--chapter-accent, #156a82);
    font-family: "IBM Plex Mono", "SFMono-Regular", monospace;
    font-size: 0.76rem;
    font-weight: 700;
  }
  .shape-help-kicker,
  .shape-help-label {
    display: block;
  }
  .shape-help-kicker {
    font-size: 0.66rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--chapter-accent, #156a82);
    font-weight: 700;
  }
  .shape-help-label {
    margin-top: 0.06rem;
  }
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 60;
    display: grid;
    place-items: center;
    padding: 1rem;
  }
  .backdrop {
    position: absolute;
    inset: 0;
    border: 0;
    background: rgba(15, 23, 42, 0.42);
    backdrop-filter: blur(6px);
  }
  .dialog {
    position: relative;
    z-index: 1;
    width: min(760px, 96vw);
    border: 1px solid rgba(var(--chapter-accent-rgb, 21, 106, 130), 0.26);
    border-radius: 18px;
    background:
      radial-gradient(circle at 100% 0%, rgba(var(--chapter-accent-rgb, 21, 106, 130), 0.13), transparent 42%),
      rgba(255, 255, 255, 0.98);
    padding: 1rem;
    display: grid;
    gap: 0.72rem;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.24);
  }
  .dialog-head {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.7rem;
    align-items: start;
  }
  .dialog-mark {
    width: 2.65rem;
    height: 2.65rem;
    border-radius: 12px;
    display: grid;
    place-items: center;
    background: rgba(var(--chapter-accent-rgb, 21, 106, 130), 0.12);
    color: var(--chapter-accent, #156a82);
    font-family: "IBM Plex Mono", "SFMono-Regular", monospace;
    font-weight: 700;
  }
  .label {
    margin: 0;
    font-size: 0.72rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--chapter-accent, var(--text-muted));
    font-weight: 700;
  }
  .mini {
    margin: 0;
    font-size: 0.84rem;
    line-height: 1.58;
    color: var(--text-secondary);
  }
  .block {
    border: 1px solid rgba(var(--chapter-accent-rgb, 21, 106, 130), 0.18);
    border-radius: 12px;
    background: rgba(248, 250, 252, 0.72);
    padding: 0.62rem 0.7rem;
    display: grid;
    gap: 0.25rem;
  }
  .block-title {
    margin: 0 0 0.08rem !important;
    color: var(--chapter-accent, #156a82) !important;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.68rem !important;
    font-weight: 700;
  }
  .equations {
    background:
      linear-gradient(90deg, rgba(var(--chapter-accent-rgb, 21, 106, 130), 0.08), transparent),
      rgba(248, 250, 252, 0.74);
  }
  .block p {
    margin: 0;
    font-size: 0.82rem;
    color: var(--text-secondary);
  }
  code { font-family: "IBM Plex Mono", "SFMono-Regular", monospace; }
  .actions { display: flex; justify-content: flex-end; }
  .actions button {
    border: 1px solid var(--border-subtle);
    background: rgba(255, 255, 255, 0.94);
    border-radius: 999px;
    padding: 0.28rem 0.72rem;
    font-size: 0.78rem;
  }
</style>
