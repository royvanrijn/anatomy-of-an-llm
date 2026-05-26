import { describe, expect, it } from "vitest";
import { modelSizeGb, quantizeMatrix, quantizeValue, quantizedStats } from "../src/utils/quantization";

describe("quantization fixture", () => {
  it("keeps FP32 values unchanged and rounds FP16-like values", () => {
    expect(quantizeValue(0.18371234, 32)).toBe(0.18371234);
    expect(quantizeValue(0.18371234, 16)).toBe(0.1837);
  });

  it("snaps INT4 values to the simplified symmetric grid", () => {
    expect(quantizeValue(2.91823411, 4)).toBeCloseTo(3.0, 10);
    expect(quantizeValue(-2.01444274, 4)).toBeCloseTo(-2.0, 10);
    expect(quantizeValue(0.00712091, 4)).toBeCloseTo(0, 10);
  });

  it("produces deterministic matrix stats for INT4", () => {
    const stats = quantizedStats(4);
    expect(stats.quantized).toHaveLength(5);
    expect(stats.quantized[0]).toHaveLength(5);
    expect(stats.uniqueCount).toBe(11);
    expect(stats.min).toBeCloseTo(-2.5, 10);
    expect(stats.max).toBeCloseTo(3.0, 10);
  });

  it("computes model-size estimates from parameter count and bit width", () => {
    const params = 8_000_000_000;
    expect(modelSizeGb(params, 32)).toBe(32);
    expect(modelSizeGb(params, 16)).toBe(16);
    expect(modelSizeGb(params, 4)).toBe(4);
  });

  it("preserves the source matrix shape for all displayed modes", () => {
    for (const bits of [32, 16, 8, 4]) {
      const matrix = quantizeMatrix(bits);
      expect(matrix).toHaveLength(5);
      expect(matrix.every((row) => row.length === 5)).toBe(true);
    }
  });
});
