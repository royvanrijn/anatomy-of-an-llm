import { describe, expect, it } from "vitest";
import { nearestTrainingPoint, selectedTrainingPhase, trainingCurve } from "../src/utils/trainingPhases";

describe("training phase fixture", () => {
  it("generates the deterministic toy curve", () => {
    const points = trainingCurve();
    expect(points).toHaveLength(81);
    expect(points[0]).toMatchObject({ step: 0 });
    expect(points[0].train).toBeCloseTo(2.33, 4);
    expect(points[0].val).toBeCloseTo(2.4480, 4);
    expect(points.at(-1).step).toBe(800);
  });

  it("selects the expected phase boundaries", () => {
    expect(selectedTrainingPhase(40).id).toBe("fit");
    expect(selectedTrainingPhase(280).id).toBe("plateau");
    expect(selectedTrainingPhase(560).id).toBe("grok");
  });

  it("shows delayed validation improvement in the later phase", () => {
    const points = trainingCurve();
    const at520 = points.find((point) => point.step === 520);
    const at800 = points.find((point) => point.step === 800);
    expect(at800.val).toBeLessThan(at520.val);
    expect(at800.train).toBeLessThan(at520.train);
  });

  it("snaps slider position to nearest fixture step", () => {
    expect(nearestTrainingPoint(557).step).toBe(560);
  });
});
