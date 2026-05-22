import { describe, expect, it } from "vitest";
import { applyTopK, argmaxIndex, makeRng, sampleIndex, softmaxWithTemperature } from "../src/utils/sampling";

describe("sampling utils", () => {
  it("softmax returns normalized probabilities", () => {
    const probs = softmaxWithTemperature([1.2, 0.3, -0.4], 1);
    const sum = probs.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 10);
  });

  it("lower temperature sharpens the top probability", () => {
    const cool = softmaxWithTemperature([2, 1, 0], 0.4);
    const warm = softmaxWithTemperature([2, 1, 0], 1.6);
    expect(cool[0]).toBeGreaterThan(warm[0]);
  });

  it("top-k masks and renormalizes", () => {
    const masked = applyTopK([0.5, 0.3, 0.2], 2);
    expect(masked[2]).toBe(0);
    expect(masked[0] + masked[1]).toBeCloseTo(1, 10);
  });

  it("sampling with same seed is deterministic", () => {
    const probs = [0.1, 0.2, 0.7];
    const a = makeRng(42);
    const b = makeRng(42);
    const drawsA = [sampleIndex(probs, a()), sampleIndex(probs, a()), sampleIndex(probs, a())];
    const drawsB = [sampleIndex(probs, b()), sampleIndex(probs, b()), sampleIndex(probs, b())];
    expect(drawsA).toEqual(drawsB);
  });

  it("argmax picks the highest value index", () => {
    expect(argmaxIndex([0.1, 0.9, 0.2])).toBe(1);
  });
});
