export type SamplingMode = "greedy" | "sampling";

export function softmaxWithTemperature(logits: number[], temperature: number): number[] {
  const temp = Math.max(0.05, temperature);
  const scaled = logits.map((v) => v / temp);
  const maxLogit = Math.max(...scaled);
  const exp = scaled.map((v) => Math.exp(v - maxLogit));
  const sum = exp.reduce((a, b) => a + b, 0);
  return exp.map((v) => v / sum);
}

export function argmaxIndex(values: number[]): number {
  let idx = 0;
  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[idx]) idx = i;
  }
  return idx;
}

export function applyTopK(probs: number[], k: number): number[] {
  if (k <= 0 || k >= probs.length) return [...probs];
  const ranked = probs
    .map((p, i) => ({ p, i }))
    .sort((a, b) => b.p - a.p)
    .slice(0, k);
  const kept = new Set(ranked.map((x) => x.i));
  const masked = probs.map((p, i) => (kept.has(i) ? p : 0));
  const s = masked.reduce((a, b) => a + b, 0);
  return masked.map((p) => (s > 0 ? p / s : 0));
}

export function makeRng(seed: number) {
  let state = (seed >>> 0) || 1;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function sampleIndex(probs: number[], rnd: number): number {
  let acc = 0;
  for (let i = 0; i < probs.length; i++) {
    acc += probs[i];
    if (rnd <= acc) return i;
  }
  return probs.length - 1;
}
