export type Matrix = number[][];

export type QkvFixture = {
  tokens: string[];
  X: Matrix;
  Wq: Matrix;
  Wk: Matrix;
  Wv: Matrix;
};

export function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export function matMul(A: Matrix, B: Matrix): Matrix {
  const rows = A.length;
  const cols = B[0].length;
  const out: Matrix = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let sum = 0;
      for (let k = 0; k < B.length; k++) sum += A[r][k] * B[k][c];
      out[r][c] = sum;
    }
  }
  return out;
}

export function softmax(values: number[]): number[] {
  const m = Math.max(...values);
  const exps = values.map((v) => Math.exp(v - m));
  const s = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => v / s);
}

export function weightedSum(weights: number[], values: Matrix): number[] {
  const d = values[0].length;
  const out = Array(d).fill(0);
  for (let i = 0; i < weights.length; i++) {
    for (let j = 0; j < d; j++) out[j] += weights[i] * values[i][j];
  }
  return out;
}

export function qkvFixture(): QkvFixture {
  return {
    tokens: ["the", "puppy", "sleeps"],
    X: [
      [0.9, 0.2, 0.1, 0.0],
      [0.3, 0.8, 0.2, 0.1],
      [0.1, 0.3, 0.9, 0.2]
    ],
    Wq: [
      [0.6, -0.2, 0.1],
      [0.1, 0.7, 0.2],
      [0.2, 0.1, 0.5],
      [0.0, 0.2, -0.1]
    ],
    Wk: [
      [0.5, -0.1, 0.0],
      [0.2, 0.6, 0.1],
      [0.1, 0.2, 0.6],
      [0.1, 0.1, -0.1]
    ],
    Wv: [
      [0.3, 0.1, 0.5],
      [0.4, 0.7, 0.1],
      [0.2, 0.2, 0.6],
      [0.1, 0.0, 0.2]
    ]
  };
}
