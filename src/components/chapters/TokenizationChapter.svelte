<script lang="ts">
  type TokenItem = {
    id: number;
    piece: string;
    pieceVisible: string;
  };

  type TokenExample = {
    id: string;
    label: string;
    text: string;
    tokenCount: number;
    tokens: TokenItem[];
  };

  export let data: {
    source: string;
    encoding: string;
    examples: TokenExample[];
  };

  const normalizedExamples: TokenExample[] = Array.isArray(data?.examples) ? data.examples : [];
  let selectedId = normalizedExamples[0]?.id ?? "";
  let showTokenIds = true;
  let showWhitespaceMarkers = true;

  $: selectedExample =
    normalizedExamples.find((example) => example.id === selectedId) ?? normalizedExamples[0];
  $: selectedTokens = Array.isArray(selectedExample?.tokens) ? selectedExample.tokens : [];
  $: renderedPieces = selectedTokens.map((token) =>
    showWhitespaceMarkers ? token.pieceVisible : token.piece
  );
</script>

<section class="tokenization-chapter">
  <div class="explainer">
    <p class="explainer-title">Slicing up the text</p>
    <p>
      Tokenization is the rule for doing that rewrite. It splits the sentence into <strong>tokens</strong>: small reusable
      pieces such as words, word parts, punctuation, or a leading space plus a word part.
    </p>
    <p>
      Each token is then looked up in a vocabulary and replaced by an integer ID. From that point on, the model no longer works
      with the original characters. It works with the ordered list of IDs.
    </p>
  </div>

  <div class="reasoning">
    <p class="reasoning-title">Why tokens instead of words or letters?</p>
    <p>
      Whole words are too brittle: names, code fragments, typos, inflections, and multilingual text quickly create words the
      model has never seen. Characters or bytes avoid that problem, but they make every input much longer. Subword tokens sit
      between those extremes: common text stays compact, while unusual strings can still be assembled from smaller pieces.
    </p>
  </div>
  <p class="encoding-note">
    The examples below use <code>{data.encoding}</code>. Switch sentences and notice where the boundaries land: sometimes a
    token is a whole word, sometimes it is a word fragment, and sometimes it includes the space before a word.
  </p>

  <section class="playground">
    <div class="controls">
      <label>
        Example sentence
        <select bind:value={selectedId}>
          {#each normalizedExamples as example}
            <option value={example.id}>{example.label}</option>
          {/each}
        </select>
      </label>
    </div>

    <div class="raw-sentence">
      <p class="label">Raw sentence</p>
      <p>{selectedExample?.text ?? "No example data loaded."}</p>
    </div>

    <div class="summary">
      <p><strong>{selectedExample?.text?.length ?? 0}</strong> characters</p>
      <p><strong>{selectedExample?.tokenCount ?? 0}</strong> tokens</p>
      <p><strong>{selectedTokens.length > 0 ? Math.round((selectedExample?.text?.length ?? 0) / selectedTokens.length) : 0}</strong> chars/token on average</p>
    </div>

    <div class="tokens">
      <p class="label">Tokenized result</p>
      <div class="token-list">
        {#each selectedTokens as token, idx}
          <article class="token-card">
            <p class="piece">{renderedPieces[idx]}</p>
            {#if showTokenIds}
              <p class="token-id">#{token.id}</p>
            {/if}
          </article>
        {/each}
      </div>
      <div class="token-toggles">
        <label class="checkbox">
          <input type="checkbox" bind:checked={showTokenIds} />
          Show token IDs
        </label>
        <label class="checkbox">
          <input type="checkbox" bind:checked={showWhitespaceMarkers} />
          Show whitespace markers
        </label>
      </div>
    </div>
  </section>
</section>

<style>
  .tokenization-chapter {
    display: grid;
    gap: 1rem;
  }

  .explainer {
    display: grid;
    gap: 0.5rem;
  }

  .explainer-title {
    margin: 0;
    font-size: 0.82rem;
    font-weight: bold;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #155e75;
  }

  .explainer p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 1rem;
    line-height: 1.6;
  }

  .encoding-note {
    margin: 0;
    font-size: 1rem;
    color: var(--text-secondary);
    line-height: 1.6;
  }

  .reasoning {
    border-left: 3px solid rgba(21, 106, 130, 0.34);
    padding-left: 0.85rem;
    display: grid;
    gap: 0.28rem;
  }

  .reasoning-title {
    margin: 0;
    font-size: 0.76rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #52525b;
  }

  .reasoning p:last-child {
    margin: 0;
    font-size: 0.9rem;
    color: #4b5563;
    font-style: italic;
    line-height: 1.6;
  }

  .controls {
    display: grid;
    gap: 0.55rem;
    grid-template-columns: 1fr;
  }

  .playground {
    border: 1px solid var(--border-subtle);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.48);
    padding: 0.85rem;
    display: grid;
    gap: 0.85rem;
  }

  label {
    font-size: 0.78rem;
    color: var(--text-secondary);
    display: grid;
    gap: 0.3rem;
  }

  select {
    border: 1px solid var(--border-subtle);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.9);
    color: var(--text-primary);
    padding: 0.38rem 0.45rem;
    font-size: 0.8rem;
  }

  .checkbox {
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 0.4rem;
  }

  .summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.45rem;
  }

  .summary p {
    margin: 0;
    border: 1px solid rgba(39, 39, 42, 0.1);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.58);
    padding: 0.42rem 0.5rem;
    font-size: 0.76rem;
    color: var(--text-secondary);
  }

  code {
    font-family: "IBM Plex Mono", "SFMono-Regular", monospace;
  }

  .raw-sentence,
  .tokens {
    border: 1px solid rgba(39, 39, 42, 0.12);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.68);
    padding: 0.62rem 0.72rem;
  }

  .label {
    margin: 0 0 0.45rem;
    font-size: 0.72rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .raw-sentence p:last-child {
    margin: 0;
    font-size: 1rem;
    color: var(--text-primary);
    line-height: 1.6;
  }

  .token-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
  }

  .legend {
    margin: -0.1rem 0 0.45rem;
    font-size: 0.72rem;
    color: var(--text-muted);
  }

  .token-toggles {
    display: flex;
    flex-wrap: wrap;
    gap: 0.85rem;
    margin: 1rem 0 0.25rem;
  }

  .token-card {
    margin: 0;
    padding: 0.35rem 0.5rem;
    border-radius: 10px;
    border: 1px solid rgba(14, 165, 198, 0.25);
    background: rgba(14, 165, 198, 0.1);
    display: grid;
    gap: 0.2rem;
  }

  .piece {
    margin: 0;
    font-family: "IBM Plex Mono", "SFMono-Regular", monospace;
    font-size: 0.78rem;
    color: #0f172a;
  }

  .token-id {
    margin: 0;
    font-family: "IBM Plex Mono", "SFMono-Regular", monospace;
    font-size: 0.68rem;
    color: #155e75;
  }

  @media (max-width: 900px) {
    .controls {
      grid-template-columns: 1fr;
    }

    .summary {
      grid-template-columns: 1fr;
    }
  }
</style>
