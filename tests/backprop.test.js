import { describe, expect, it } from "vitest";
import {
  applyGradientStep,
  backwardPass,
  createInitialBackpropModel,
  forwardPass
} from "../src/utils/backprop";

describe("backprop utils", () => {
  it("softmax probabilities sum to 1", () => {
    const model = createInitialBackpropModel();
    const out = forwardPass(model, [0.7, -0.4], 2);
    const sum = out.probs.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 10);
  });

  it("cross-entropy gradient over logits sums close to zero", () => {
    const model = createInitialBackpropModel();
    const grad = backwardPass(model, [0.7, -0.4], 2);
    const s = grad.dLogits.reduce((a, b) => a + b, 0);
    expect(s).toBeCloseTo(0, 10);
  });

  it("one gradient step lowers loss for this toy example", () => {
    const model = createInitialBackpropModel();
    const before = forwardPass(model, [0.7, -0.4], 2);
    const grad = backwardPass(model, [0.7, -0.4], 2);
    const next = applyGradientStep(model, grad, 0.35);
    const after = forwardPass(next, [0.7, -0.4], 2);

    expect(after.loss).toBeLessThan(before.loss);
  });
});
