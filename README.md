# The Anatomy of an LLM

Static, interactive scrollytelling explainer that opens up modern decoder-only language models step-by-step:

`text -> tokens -> vectors -> attention -> logits -> sampling -> learning -> deployment tradeoffs`

This project is aimed at software developers who want a practical mental model of LLM internals without hand-wavy black-box explanations.

## Current Status

- `BETA` (work in progress)
- Core scaffold, style system, and chapter navigation are implemented
- Chapters `01` through `15` are implemented with interactive visuals
- Content is still being iterated for pedagogy, polish, and correctness review

## What This Covers

1. Tokenization
2. Vector embeddings
3. Single-neuron activations
4. Feed-forward neural network matrix flow
5. Logits, softmax, and sampling
6. Backpropagation
7. Optimizers
8. Attention Q/K/V intuition
9. Multi-headed attention math
10. RoPE positional encoding
11. Transformer block composition
12. Training phases
13. Pre-training and post-training
14. Context window and KV cache
15. Quantization

## Tech Stack

- [Astro](https://astro.build/)
- [Svelte islands](https://docs.astro.build/en/guides/integrations-guide/svelte/)
- TypeScript
- SVG-first custom visuals
- Offline deterministic data generation with `tiktoken` for real tokenizer examples

## Project Constraints

- Static deploy only (no backend required for core functionality)
- No runtime model/API calls for explanations
- Deterministic generated datasets
- Toy data is explicitly labeled
- Real GPT tokenization is generated offline with `tiktoken` (`o200k_base`)

## Local Development

```bash
npm install
npm run generate:data
npm run dev
```

Open [http://localhost:4321](http://localhost:4321).

### Useful Commands

```bash
npm run dev
npm run build
npm run preview
npm run check
npm run test
npm run generate:data
```

## Repo Structure

```text
src/
  components/
    chapters/
  pages/
    index.astro
  data/
docs/
  curriculum.md
  product-vision.md
  visual-style.md
  data-correctness.md
plans/
  progress.md
scripts/
  generate-data.mjs
tests/
```

## Documentation

- Vision: [docs/product-vision.md](docs/product-vision.md)
- Curriculum/spec: [docs/curriculum.md](docs/curriculum.md)
- Style system: [docs/visual-style.md](docs/visual-style.md)
- Correctness rules: [docs/data-correctness.md](docs/data-correctness.md)
- Execution tracker: [plans/progress.md](plans/progress.md)
- GitHub Pages deployment: [docs/deployment-github-pages.md](docs/deployment-github-pages.md)

## Publish On GitHub Pages (for Reviewers)

Use the guide at [docs/deployment-github-pages.md](docs/deployment-github-pages.md).

Short version:

1. Push repo to GitHub.
2. Enable `Settings -> Pages -> Build and deployment -> GitHub Actions`.
3. Add the provided workflow file from the deployment guide.
4. Set `base` path correctly for project pages (or use a custom domain).
5. Push to `main`; GitHub will build and publish automatically.

## Known Caveats

- This is an educational explainer, not a production model implementation.
- Some chapters intentionally use toy dimensions/values for clarity.
- Visual and narrative polish is ongoing.

## Credits

Created by Roy van Rijn at OpenValue.  
Built with OpenAI Codex and supporting tools.

