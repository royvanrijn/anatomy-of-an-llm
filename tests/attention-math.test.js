import { describe, expect, it } from "vitest";
import { attentionFixture, matrixShape } from "../src/utils/attentionMath";

describe("attention math fixture", () => {
  it("keeps Q/K/V, score, weight, and output shapes consistent", () => {
    const fx = attentionFixture("adj-noun");
    expect(matrixShape(fx.x)).toEqual([6, 3]);
    expect(matrixShape(fx.q)).toEqual([6, 3]);
    expect(matrixShape(fx.k)).toEqual([6, 3]);
    expect(matrixShape(fx.v)).toEqual([6, 3]);
    expect(matrixShape(fx.scores)).toEqual([6, 6]);
    expect(matrixShape(fx.weights)).toEqual([6, 6]);
    expect(matrixShape(fx.outputs)).toEqual([6, 3]);
  });

  it("applies row-wise softmax for every query token", () => {
    const fx = attentionFixture("adj-noun");
    for (const row of fx.weights) {
      expect(row.reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 10);
      expect(row.every((value) => value > 0 && value < 1)).toBe(true);
    }
  });

  it("routes the adjective head from blue toward car", () => {
    const fx = attentionFixture("adj-noun");
    const blueIndex = fx.tokens.indexOf("blue");
    const strongest = fx.weights[blueIndex].indexOf(Math.max(...fx.weights[blueIndex]));
    expect(fx.tokens[strongest]).toBe("car");
    expect(fx.weights[blueIndex][strongest]).toBeCloseTo(0.56435, 4);
  });

  it("changes routing when switching to the action-linker head", () => {
    const fx = attentionFixture("action-linker");
    const hitIndex = fx.tokens.indexOf("hit");
    const carIndex = fx.tokens.indexOf("car");
    const wallIndex = fx.tokens.indexOf("wall");
    expect(fx.weights[hitIndex][carIndex]).toBeGreaterThan(0.31);
    expect(fx.weights[hitIndex][wallIndex]).toBeGreaterThan(0.29);
    expect(fx.weights[hitIndex][hitIndex]).toBeLessThan(0.11);
  });
});
