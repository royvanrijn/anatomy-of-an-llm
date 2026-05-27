<script lang="ts">
  export type FlowStep = {
    label?: string;
    title: string;
    note?: string;
  };

  export let steps: FlowStep[] = [];
  export let ariaLabel = "Process flow";

  $: columns = steps
    .map((_, index) => (index === steps.length - 1 ? "minmax(0, 1fr)" : "minmax(0, 1fr) 2.1rem"))
    .join(" ");
</script>

<div class="flow-path" role="list" aria-label={ariaLabel} style={`grid-template-columns: ${columns};`}>
  {#each steps as step, index}
    <div class="flow-card" role="listitem">
      <span class="flow-index">{step.label ?? String(index + 1).padStart(2, "0")}</span>
      <strong>{step.title}</strong>
      {#if step.note}
        <span class="flow-note">{step.note}</span>
      {/if}
    </div>
    {#if index < steps.length - 1}
      <div class="flow-arrow" aria-hidden="true">→</div>
    {/if}
  {/each}
</div>

<style>
  .flow-path {
    margin: 0;
    padding: 0.82rem;
    border: 1px solid rgba(var(--chapter-accent-rgb, 21, 106, 130), 0.22);
    border-radius: 18px;
    background:
      radial-gradient(circle at 0% 50%, rgba(var(--chapter-accent-rgb, 21, 106, 130), 0.12), transparent 34%),
      linear-gradient(
        90deg,
        rgba(var(--chapter-accent-rgb, 21, 106, 130), 0.1),
        rgba(255, 255, 255, 0.62) 42%,
        rgba(var(--chapter-accent-rgb, 21, 106, 130), 0.06)
      ),
      rgba(255, 255, 255, 0.52);
    display: grid;
    gap: 0;
    align-items: center;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.78);
  }

  .flow-card {
    min-height: 4.9rem;
    border: 1px solid rgba(var(--chapter-accent-rgb, 21, 106, 130), 0.19);
    border-radius: 15px;
    background:
      linear-gradient(160deg, rgba(255, 255, 255, 0.92), rgba(var(--chapter-accent-rgb, 21, 106, 130), 0.06));
    padding: 0.56rem 0.62rem;
    display: grid;
    gap: 0.16rem;
    align-content: start;
    box-shadow: 0 7px 18px rgba(15, 23, 42, 0.06);
  }

  .flow-arrow {
    width: 1.35rem;
    height: 1.35rem;
    justify-self: center;
    display: grid;
    place-items: center;
    border: 1px solid rgba(var(--chapter-accent-rgb, 21, 106, 130), 0.32);
    border-radius: 999px;
    background: rgba(248, 252, 253, 0.96);
    color: rgba(var(--chapter-accent-rgb, 21, 106, 130), 0.82);
    font-family: "IBM Plex Mono", "SFMono-Regular", monospace;
    font-size: 0.76rem;
    font-weight: 700;
    line-height: 1;
    box-shadow: 0 2px 7px rgba(15, 23, 42, 0.08);
  }

  .flow-index {
    font-family: "IBM Plex Mono", "SFMono-Regular", monospace;
    color: var(--chapter-accent, #155e75);
    font-size: 0.66rem;
    font-weight: 700;
  }

  .flow-card strong {
    color: #0f172a;
    font-size: 0.92rem;
    line-height: 1.24;
  }

  .flow-note {
    color: var(--text-secondary);
    font-size: 0.84rem;
    line-height: 1.38;
  }

  @media (max-width: 640px) {
    .flow-path {
      grid-template-columns: 1fr !important;
      gap: 0.42rem;
    }

    .flow-card {
      min-height: auto;
    }

    .flow-arrow {
      transform: rotate(90deg);
    }
  }
</style>
