import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { get_encoding } from "tiktoken";

const TOKENIZATION_EXAMPLES = [
  {
    id: "brain",
    label: "Classic cognition quote (long sentence)",
    text: "If the human brain were so simple that we could understand it, we would be so simple that we couldn't."
  },
  {
    id: "llm",
    label: "Technical LLM description",
    text: "Large language models predict the next token by repeatedly transforming context into probabilities."
  },
  {
    id: "unicode",
    label: "Unicode, accents, and punctuation mix",
    text: "Tokenization handles emoji 🙂, accents café, and punctuation: commas, dashes, and quotes."
  }
];

const encoding = get_encoding("o200k_base");
const VECTOR_DIM = 24;

function withVisibleWhitespace(piece) {
  return piece
    .replaceAll(" ", "·")
    .replaceAll("\n", "↵\n")
    .replaceAll("\t", "⇥");
}

function tokenizeExample(example) {
  const tokenIds = encoding.encode(example.text);
  const tokens = Array.from(tokenIds, (id) => {
    const bytes = encoding.decode([id]);
    const piece = new TextDecoder().decode(bytes);
    return {
      id,
      piece,
      pieceVisible: withVisibleWhitespace(piece)
    };
  });

  return {
    ...example,
    tokenCount: tokenIds.length,
    tokens
  };
}

const tokenizationPayload = {
  source: "Real tokenization using o200k_base.",
  generatedAt: "deterministic-build",
  encoding: "o200k_base",
  examples: TOKENIZATION_EXAMPLES.map(tokenizeExample)
};

function deterministicUnit(tokenId, dimIndex) {
  const x = Math.sin((tokenId + 1) * (dimIndex + 3) * 12.9898) * 43758.5453;
  const fract = x - Math.floor(x);
  return fract * 2 - 1;
}

function buildEmbeddingRow(tokenId) {
  const vector = Array.from({ length: VECTOR_DIM }, (_, i) =>
    Number(deterministicUnit(tokenId, i).toFixed(4))
  );
  const projection2d = {
    x: Number((vector[0] * 0.7 + vector[3] * 0.3).toFixed(4)),
    y: Number((vector[1] * 0.65 - vector[5] * 0.35).toFixed(4))
  };

  return {
    tokenId,
    rowIndex: tokenId,
    vector,
    projection2d
  };
}

const uniqueTokenIds = Array.from(
  new Set(
    tokenizationPayload.examples.flatMap((example) => example.tokens.map((token) => token.id))
  )
).sort((a, b) => a - b);

const embeddingsPayload = {
  source: "Deterministic toy embedding vectors keyed by real tokenizer IDs.",
  generatedAt: "deterministic-build",
  encoding: "o200k_base",
  dimension: VECTOR_DIM,
  note: "Simplified vectors for explanation; not from a production model checkpoint.",
  rows: uniqueTokenIds.map(buildEmbeddingRow)
};

const tokenizationOutputDir = new URL("../src/data/generated/", import.meta.url);
const tokenizationOutputFile = new URL("tokenization-o200k-base.json", tokenizationOutputDir);
const embeddingsOutputFile = new URL("embeddings-o200k-base.json", tokenizationOutputDir);
await mkdir(tokenizationOutputDir, { recursive: true });
await writeFile(tokenizationOutputFile, `${JSON.stringify(tokenizationPayload, null, 2)}\n`, "utf-8");
await writeFile(embeddingsOutputFile, `${JSON.stringify(embeddingsPayload, null, 2)}\n`, "utf-8");

const metaOutputDir = new URL("../public/data/meta/", import.meta.url);
const metaOutputFile = new URL("build-info.json", metaOutputDir);
const metaPayload = {
  generatedAt: "deterministic-build",
  version: 2,
  datasets: ["tokenization-o200k-base.json", "embeddings-o200k-base.json"]
};
await mkdir(metaOutputDir, { recursive: true });
await writeFile(metaOutputFile, `${JSON.stringify(metaPayload, null, 2)}\n`, "utf-8");

encoding.free();

const digest = createHash("sha256").update(JSON.stringify(tokenizationPayload)).digest("hex");
const embeddingDigest = createHash("sha256").update(JSON.stringify(embeddingsPayload)).digest("hex");
console.log(`Generated ${tokenizationOutputFile.pathname} (${digest.slice(0, 12)})`);
console.log(`Generated ${embeddingsOutputFile.pathname} (${embeddingDigest.slice(0, 12)})`);
