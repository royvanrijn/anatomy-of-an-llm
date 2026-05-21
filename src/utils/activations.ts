export type ActivationId = "linear" | "sigmoid" | "tanh" | "relu" | "gelu" | "silu";

export type ActivationMeta = {
  id: ActivationId;
  label: string;
  description: string;
};

const SQRT_2 = Math.sqrt(2);
const SQRT_2_OVER_PI = Math.sqrt(2 / Math.PI);

export const ACTIVATIONS: ActivationMeta[] = [
  {
    id: "linear",
    label: "linear",
    description:
      "Pass-through: output equals input. Useful for final regression layers, but too limited for hidden layers because it adds no non-linearity."
  },
  {
    id: "sigmoid",
    label: "sigmoid",
    description:
      "Squashes values to (0, 1), which is useful for probabilities. It can saturate at both ends, causing very small gradients in deeper networks."
  },
  {
    id: "tanh",
    label: "tanh",
    description:
      "Maps values to (-1, 1) and is zero-centered. It still saturates for large magnitudes, so gradients can shrink."
  },
  {
    id: "relu",
    label: "ReLU",
    description:
      "Keeps positives, clips negatives to zero. It is simple and fast, but some neurons can get stuck outputting zero on the negative side."
  },
  {
    id: "gelu",
    label: "GELU",
    description:
      "Smoothly gates values by magnitude instead of hard clipping. Common in transformer blocks; a bit heavier to compute than ReLU."
  },
  {
    id: "silu",
    label: "SiLU / Swish",
    description:
      "Computes x * sigmoid(x), creating a smooth self-gating curve. Often strong in practice, but slightly costlier than simpler activations."
  }
];

export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function gelu(x: number): number {
  return 0.5 * x * (1 + Math.tanh(SQRT_2_OVER_PI * (x + 0.044715 * x * x * x)));
}

export function applyActivation(id: ActivationId, x: number): number {
  switch (id) {
    case "linear":
      return x;
    case "sigmoid":
      return sigmoid(x);
    case "tanh":
      return Math.tanh(x);
    case "relu":
      return Math.max(0, x);
    case "gelu":
      return gelu(x);
    case "silu":
      return x * sigmoid(x);
    default:
      return x;
  }
}

export function erfApprox(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * absX);
  const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX));
  return sign * y;
}

export function normalCdf(x: number): number {
  return 0.5 * (1 + erfApprox(x / SQRT_2));
}
