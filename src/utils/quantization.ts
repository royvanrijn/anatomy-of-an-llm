export type QuantMode = {
  id: "fp32" | "fp16" | "int8" | "int4";
  label: string;
  bits: number;
};

export const quantizationMatrix = [
  [0.18371234, -1.20491236, 0.00712091, 2.91823411, -0.55291337],
  [0.44204588, -0.99123817, 1.33100214, -0.22345518, 0.07620133],
  [3.12019843, -2.01444274, 0.55193302, -0.04721129, 1.77231055],
  [-0.80911403, 2.20133044, -1.48320182, 0.19441726, -0.00990127],
  [0.61544281, -0.33611945, 1.00993218, -2.44211706, 0.43120572]
];

export function quantizeValue(value: number, bits: number) {
  if (bits === 32) return value;
  if (bits === 16) return Number(value.toPrecision(4));
  const qMax = Math.pow(2, bits - 1) - 1;
  const qMin = -Math.pow(2, bits - 1);
  const scale = 3.5 / qMax;
  const q = Math.max(qMin, Math.min(qMax, Math.round(value / scale)));
  return q * scale;
}

export function quantizeMatrix(bits: number, matrix = quantizationMatrix) {
  return matrix.map((row) => row.map((value) => quantizeValue(value, bits)));
}

export function modelSizeGb(paramCount: number, bits: number) {
  return (paramCount * bits) / 8 / 1_000_000_000;
}

export function quantizedStats(bits: number, matrix = quantizationMatrix) {
  const quantized = quantizeMatrix(bits, matrix);
  const flat = quantized.flat();
  return {
    quantized,
    uniqueCount: new Set(flat.map((value) => value.toFixed(10))).size,
    min: Math.min(...flat),
    max: Math.max(...flat)
  };
}
