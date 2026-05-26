import { describe, expect, it } from "vitest";
import { expScaleValue, kvCacheEstimate } from "../src/utils/kvCache";

describe("KV cache estimate", () => {
  it("maps slider scales exponentially and deterministically", () => {
    expect(expScaleValue(256, 1_000_000, 0)).toBe(256);
    expect(expScaleValue(256, 1_000_000, 100)).toBe(1_000_000);
    expect(expScaleValue(1, 1_000, 60)).toBe(63);
  });

  it("makes cached decode cheaper than recomputing the full history", () => {
    const estimate = kvCacheEstimate({ contextScale: 45, generatedScale: 60 });
    expect(estimate.contextLength).toBe(10_581);
    expect(estimate.generatedTokens).toBe(63);
    expect(estimate.uncachedOps).toBe(668_619);
    expect(estimate.cachedOps).toBe(10_644);
    expect(estimate.computeRatio).toBeCloseTo(62.8165, 4);
  });

  it("increases KV memory with seen tokens", () => {
    const short = kvCacheEstimate({ contextScale: 10, generatedScale: 10 });
    const long = kvCacheEstimate({ contextScale: 90, generatedScale: 90 });
    expect(long.kvMemoryMb).toBeGreaterThan(short.kvMemoryMb);
  });
});
