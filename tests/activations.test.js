import { describe, expect, it } from "vitest";
import { applyActivation } from "../src/utils/activations";

describe("activation helpers", () => {
  it("linear returns the input unchanged", () => {
    expect(applyActivation("linear", -1.25)).toBeCloseTo(-1.25, 10);
  });

  it("relu clamps negatives to zero", () => {
    expect(applyActivation("relu", -0.4)).toBe(0);
    expect(applyActivation("relu", 0.9)).toBeCloseTo(0.9, 10);
  });

  it("sigmoid stays in (0, 1)", () => {
    const lo = applyActivation("sigmoid", -5);
    const hi = applyActivation("sigmoid", 5);
    expect(lo).toBeGreaterThan(0);
    expect(lo).toBeLessThan(0.01);
    expect(hi).toBeLessThan(1);
    expect(hi).toBeGreaterThan(0.99);
  });

  it("silu equals x * sigmoid(x)", () => {
    const x = 1.4;
    const silu = applyActivation("silu", x);
    const sigmoid = applyActivation("sigmoid", x);
    expect(silu).toBeCloseTo(x * sigmoid, 10);
  });

  it("gelu softly gates negatives and keeps positives mostly intact", () => {
    const pos = applyActivation("gelu", 1.2);
    const neg = applyActivation("gelu", -1.2);
    expect(pos).toBeGreaterThan(0.9);
    expect(pos).toBeLessThan(1.2);
    expect(neg).toBeLessThan(0);
    expect(Math.abs(neg)).toBeLessThan(0.3);
  });
});
