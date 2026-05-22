import { describe, expect, it } from "vitest";
import { dot, matMul, qkvFixture, softmax, weightedSum } from "../src/utils/qkv";

describe("qkv utils", () => {
  it("fixture shapes are consistent", () => {
    const fx = qkvFixture();
    expect(fx.tokens.length).toBe(3);
    expect(fx.X.length).toBe(3);
    expect(fx.X[0].length).toBe(4);
    expect(fx.Wq.length).toBe(4);
    expect(fx.Wq[0].length).toBe(3);
  });

  it("softmax returns probabilities summing to 1", () => {
    const probs = softmax([0.5, 1.2, -0.3]);
    const total = probs.reduce((sum, value) => sum + value, 0);
    expect(total).toBeCloseTo(1, 10);
    expect(Math.max(...probs)).toBe(probs[1]);
  });

  it("qkv pipeline output is deterministic for focused token", () => {
    const fx = qkvFixture();
    const Q = matMul(fx.X, fx.Wq);
    const K = matMul(fx.X, fx.Wk);
    const V = matMul(fx.X, fx.Wv);

    const focus = 1;
    const q = Q[focus];
    const scores = K.map((k) => dot(q, k) / Math.sqrt(K[0].length));
    const probs = softmax(scores);
    const mixed = weightedSum(probs, V);

    expect(scores[0]).toBeCloseTo(0.1151, 4);
    expect(scores[1]).toBeCloseTo(0.2455, 4);
    expect(scores[2]).toBeCloseTo(0.2424, 4);
    expect(probs[0]).toBeCloseTo(0.3053, 4);
    expect(probs[1]).toBeCloseTo(0.3479, 4);
    expect(probs[2]).toBeCloseTo(0.3468, 4);
    expect(mixed[0]).toBeCloseTo(0.3944, 4);
    expect(mixed[1]).toBeCloseTo(0.4342, 4);
    expect(mixed[2]).toBeCloseTo(0.5194, 4);
  });
});
