import { describe, expect, it } from "vitest";
import { length2d, ropeQBase, ropeTheta, ropeToyState, rotate2d } from "../src/utils/rope";

describe("RoPE toy rotation", () => {
  it("rotating a 2D pair preserves vector length", () => {
    const rotated = rotate2d(ropeQBase, ropeTheta(5, 2));
    expect(length2d(rotated)).toBeCloseTo(length2d(ropeQBase), 10);
  });

  it("uses relative Q/K angle delta for the selected token", () => {
    const state = ropeToyState(2);
    expect(state.selectedToken.text).toBe("dog");
    expect(state.relativeOffset).toBe(-1);
    expect(state.delta).toBeCloseTo(-0.25, 10);
  });

  it("changes QK compatibility after position rotation", () => {
    const state = ropeToyState(5);
    expect(state.dotBefore).toBeCloseTo(0.734, 4);
    expect(state.dotAfter).toBeCloseTo(0.75505, 4);
  });
});
