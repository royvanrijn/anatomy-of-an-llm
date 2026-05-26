import { dot, matMul, softmax } from "./qkv";

export type HeadId = "adj-noun" | "action-linker" | "reference";

export const attentionTokens = ["The", "blue", "car", "hit", "the", "wall"];

export const attentionX = [
  [0.8, 0.2, 0.1],
  [0.2, 0.9, 0.4],
  [0.3, 1.1, 0.7],
  [1.0, 0.3, 0.8],
  [0.7, 0.2, 0.1],
  [0.4, 0.8, 0.9]
];

export const attentionWq = [
  [0.7, -0.2, 0.1],
  [0.1, 0.8, 0.3],
  [0.2, 0.1, 0.9]
];

export const attentionWk = [
  [0.6, 0.2, 0.1],
  [0.2, 0.7, 0.2],
  [0.1, 0.3, 0.8]
];

export const attentionWv = [
  [0.8, 0.1, 0.2],
  [0.2, 0.9, 0.2],
  [0.1, 0.3, 0.7]
];

function zeroBias() {
  return Array.from({ length: attentionTokens.length }, () =>
    Array.from({ length: attentionTokens.length }, () => 0)
  );
}

function withPairs(pairs: Array<[number, number, number]>) {
  const out = zeroBias();
  for (const [q, k, value] of pairs) out[q][k] = value;
  return out;
}

export const attentionHeadBiases: Record<HeadId, number[][]> = {
  "adj-noun": withPairs([
    [1, 2, 1.45],
    [1, 5, -0.55],
    [1, 1, -0.2],
    [2, 1, 0.5],
    [5, 5, 0.4]
  ]),
  "action-linker": withPairs([
    [3, 2, 0.95],
    [3, 5, 0.85],
    [3, 3, -0.35],
    [2, 3, 0.45],
    [5, 3, 0.45]
  ]),
  reference: withPairs([
    [4, 2, 1.0],
    [4, 5, 0.4],
    [0, 0, 0.25],
    [2, 2, 0.2]
  ])
};

export function attentionFixture(headId: HeadId = "adj-noun") {
  const q = matMul(attentionX, attentionWq);
  const k = matMul(attentionX, attentionWk);
  const v = matMul(attentionX, attentionWv);
  const qScale = Math.sqrt(attentionX[0].length);
  const rawScores = q.map((qRow) => k.map((kRow) => dot(qRow, kRow) / qScale));
  const bias = attentionHeadBiases[headId];
  const scores = rawScores.map((row, r) => row.map((value, c) => value + bias[r][c]));
  const weights = scores.map((row) => softmax(row));
  const outputs = matMul(weights, v);
  return { tokens: attentionTokens, x: attentionX, q, k, v, scores, weights, outputs };
}

export function matrixShape(matrix: number[][]) {
  return [matrix.length, matrix[0]?.length ?? 0] as const;
}
