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
    <span class="shape-help-kicker">Need A Shape Guide?</span>
    <span>{buttonLabel}</span>
  </button>

  {#if open}
    <div class="overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div class="dialog">
        <p class="label">{title}</p>
        {#if summary}<p class="mini">{summary}</p>{/if}

        {#if equations.length}
          <div class="block">
            {#each equations as eq}
              <p><code>{eq}</code></p>
            {/each}
          </div>
        {/if}

        {#if items.length}
          <div class="block">
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
    border: 1.5px solid rgba(100, 116, 139, 0.36);
    background: linear-gradient(155deg, rgba(255, 255, 255, 0.98), rgba(244, 248, 250, 0.94));
    border-radius: 12px;
    padding: 0.58rem 0.78rem;
    font-size: 0.78rem;
    color: var(--text-secondary);
    display: inline-grid;
    gap: 0.18rem;
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
  .shape-help-kicker {
    font-size: 0.66rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #64748b;
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
    background: rgba(15, 23, 42, 0.35);
  }
  .dialog {
    position: relative;
    z-index: 1;
    width: min(760px, 96vw);
    border: 1px solid var(--border-subtle);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.98);
    padding: 0.9rem;
    display: grid;
    gap: 0.6rem;
  }
  .label {
    margin: 0;
    font-size: 0.72rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--text-muted);
  }
  .mini {
    margin: 0;
    font-size: 0.84rem;
    line-height: 1.58;
    color: var(--text-secondary);
  }
  .block {
    border: 1px solid rgba(100, 116, 139, 0.24);
    border-radius: 10px;
    background: rgba(248, 250, 252, 0.72);
    padding: 0.5rem 0.6rem;
    display: grid;
    gap: 0.25rem;
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
