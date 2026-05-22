export type Matrix = number[][];

export type ToyBackpropModel = {
  W1: Matrix; // 2x2
  W2: Matrix; // 2x2
  W3: Matrix; // 2x3
};

export type ForwardResult = {
  x: number[];
  z1: number[];
  a1: number[];
  z2: number[];
  a2: number[];
  logits: number[];
  probs: number[];
  prediction: number;
  target: number;
  loss: number;
};

export type BackwardResult = ForwardResult & {
  dLogits: number[];
  dW3: Matrix;
  da2: number[];
  dz2: number[];
  dW2: Matrix;
  da1: number[];
  dz1: number[];
  dW1: Matrix;
};

const EPS = 1e-9;

export function createInitialBackpropModel(): ToyBackpropModel {
  return {
    W1: [
      [0.62, -0.18],
      [-0.44, 0.71]
    ],
    W2: [
      [0.53, -0.36],
      [0.29, 0.58]
    ],
    W3: [
      [0.47, -0.22, 0.18],
      [-0.31, 0.41, 0.27]
    ]
  };
}

export function cloneModel(model: ToyBackpropModel): ToyBackpropModel {
  return {
    W1: model.W1.map((row) => [...row]),
    W2: model.W2.map((row) => [...row]),
    W3: model.W3.map((row) => [...row])
  };
}

function tanh(v: number): number {
  return Math.tanh(v);
}

function tanhPrimeFromActivation(a: number): number {
  return 1 - a * a;
}

function softmax(logits: number[]): number[] {
  const max = Math.max(...logits);
  const exps = logits.map((x) => Math.exp(x - max));
  const sum = exps.reduce((acc, v) => acc + v, 0);
  return exps.map((v) => v / sum);
}

function argmax(values: number[]): number {
  let idx = 0;
  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[idx]) idx = i;
  }
  return idx;
}

function matVec(x: number[], W: Matrix): number[] {
  const cols = W[0].length;
  const out = new Array<number>(cols).fill(0);
  for (let c = 0; c < cols; c++) {
    let sum = 0;
    for (let r = 0; r < x.length; r++) sum += x[r] * W[r][c];
    out[c] = sum;
  }
  return out;
}

function outer(a: number[], b: number[]): Matrix {
  return a.map((ar) => b.map((bc) => ar * bc));
}

function backpropToPrevLayer(W: Matrix, delta: number[]): number[] {
  const out = new Array<number>(W.length).fill(0);
  for (let r = 0; r < W.length; r++) {
    let sum = 0;
    for (let c = 0; c < W[0].length; c++) sum += W[r][c] * delta[c];
    out[r] = sum;
  }
  return out;
}

export function forwardPass(model: ToyBackpropModel, x: number[], target: number): ForwardResult {
  const z1 = matVec(x, model.W1);
  const a1 = z1.map(tanh);

  const z2 = matVec(a1, model.W2);
  const a2 = z2.map(tanh);

  const logits = matVec(a2, model.W3);
  const probs = softmax(logits);
  const loss = -Math.log(Math.max(EPS, probs[target]));

  return {
    x: [...x],
    z1,
    a1,
    z2,
    a2,
    logits,
    probs,
    prediction: argmax(probs),
    target,
    loss
  };
}

export function backwardPass(model: ToyBackpropModel, x: number[], target: number): BackwardResult {
  const fwd = forwardPass(model, x, target);

  const dLogits = [...fwd.probs];
  dLogits[target] -= 1;

  const dW3 = outer(fwd.a2, dLogits);

  const da2 = backpropToPrevLayer(model.W3, dLogits);
  const dz2 = da2.map((v, i) => v * tanhPrimeFromActivation(fwd.a2[i]));

  const dW2 = outer(fwd.a1, dz2);

  const da1 = backpropToPrevLayer(model.W2, dz2);
  const dz1 = da1.map((v, i) => v * tanhPrimeFromActivation(fwd.a1[i]));

  const dW1 = outer(fwd.x, dz1);

  return {
    ...fwd,
    dLogits,
    dW3,
    da2,
    dz2,
    dW2,
    da1,
    dz1,
    dW1
  };
}

export function applyGradientStep(model: ToyBackpropModel, grad: BackwardResult, learningRate: number): ToyBackpropModel {
  const next = cloneModel(model);

  for (let r = 0; r < next.W1.length; r++) {
    for (let c = 0; c < next.W1[0].length; c++) {
      next.W1[r][c] -= learningRate * grad.dW1[r][c];
    }
  }

  for (let r = 0; r < next.W2.length; r++) {
    for (let c = 0; c < next.W2[0].length; c++) {
      next.W2[r][c] -= learningRate * grad.dW2[r][c];
    }
  }

  for (let r = 0; r < next.W3.length; r++) {
    for (let c = 0; c < next.W3[0].length; c++) {
      next.W3[r][c] -= learningRate * grad.dW3[r][c];
    }
  }

  return next;
}
