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
      Before text can enter a language model, it has to be rewritten as numbers.
    </p>
    <p>
      Tokenization is the step that does this. It splits text into small reusable pieces called <strong>tokens</strong>.
      A token can be a whole word, part of a word, punctuation, a number, or even a space plus the start of the next word.
    </p>
    <p>
      Each token has an entry in the tokenizer's vocabulary and is replaced by its corresponding integer ID. From that
      point on, the model is no longer working with characters directly. It sees an ordered list of token IDs.
    </p>
  </div>

  <div class="reasoning">
    <p class="reasoning-title">Why not just use words?</p>
    <p>
      Whole words are too rigid. New names, typos, code, inflections, compound words, and multilingual text would
      constantly produce words the model has never seen before.
    </p>
  </div>
  <div class="reasoning">
    <p class="reasoning-title">Why not just use letters or bytes?</p>
    <p>
      That solves the "unknown word" problem, but makes every input much longer. More pieces means more work for the model
      and less context fits in the same window. Subword tokens are the reasonable compromise: common text stays compact, while unusual text can still be built from smaller pieces.
    </p>
  </div>
  <p class="encoding-note">
    Below you can experiment with OpenAI's <code>{data.encoding}</code> tokenizer. Try switching sentences and watch where the
    boundaries land.
  </p>
  <p class="encoding-note">
    Later in this explainer, when the model predicts the <i>next</i> token, it predicts over this same vocabulary.
  </p>
  <p class="tech-note">
    Technical note: the examples below are generated with
    <a href="https://github.com/openai/tiktoken" target="_blank" rel="noreferrer"><code>tiktoken</code></a>
    using the <code>{data.encoding}</code> encoding.
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

  .explainer a {
    color: #155e75;
    text-decoration: none;
    border-bottom: 1px dotted rgba(21, 94, 117, 0.45);
  }

  .explainer a:hover,
  .explainer a:focus-visible {
    color: #0f4f61;
    border-bottom-color: rgba(15, 79, 97, 0.72);
    outline: none;
  }

  .encoding-note {
    margin: 0;
    font-size: 1rem;
    color: var(--text-secondary);
    line-height: 1.6;
  }

  .tech-note {
    margin: -0.45rem 0 0;
    font-size: 0.72rem;
    color: rgba(82, 82, 91, 0.82);
    line-height: 1.4;
  }

  .tech-note a {
    color: #155e75;
    text-decoration: none;
    border-bottom: 1px dotted rgba(21, 94, 117, 0.42);
  }

  .tech-note a:hover,
  .tech-note a:focus-visible {
    color: #0f4f61;
    border-bottom-color: rgba(15, 79, 97, 0.7);
    outline: none;
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

  .reasoning p:not(.reasoning-title) {
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
