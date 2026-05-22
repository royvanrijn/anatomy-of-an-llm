import { describe, expect, it } from "vitest";
import { runOptimizers, toyGrad, toyLoss } from "../src/utils/optimizers";

describe("optimizers utils", () => {
  it("toy gradient at origin is zero", () => {
    const g = toyGrad({ x: 0, y: 0 });
    expect(g.x).toBeCloseTo(0, 10);
    expect(g.y).toBeCloseTo(0, 10);
  });

  it("toy loss is non-negative for sample point", () => {
    expect(toyLoss({ x: 1.1, y: -0.6 })).toBeGreaterThan(0);
  });

  it("all optimizers return steps+1 points", () => {
    const steps = 12;
    const runs = runOptimizers({
      steps,
      start: { x: 1.6, y: 1.1 },
      lr: 0.11,
      momentum: 0.88,
      beta1: 0.9,
      beta2: 0.999,
      eps: 1e-8
    });
    for (const run of runs) {
      expect(run.points.length).toBe(steps + 1);
      expect(run.losses.length).toBe(steps + 1);
    }
  });
});
