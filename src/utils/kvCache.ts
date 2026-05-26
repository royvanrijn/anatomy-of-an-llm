export function expScaleValue(min: number, max: number, scale: number) {
  const t = Math.min(1, Math.max(0, scale / 100));
  return Math.round(min * Math.pow(max / min, t));
}

export function kvCacheEstimate({
  contextScale,
  generatedScale,
  minContext = 256,
  maxContext = 1_000_000,
  minGenerated = 1,
  maxGenerated = 1_000,
  baseCostUnit = 1,
  kvPerTokenMb = 0.0032
}: {
  contextScale: number;
  generatedScale: number;
  minContext?: number;
  maxContext?: number;
  minGenerated?: number;
  maxGenerated?: number;
  baseCostUnit?: number;
  kvPerTokenMb?: number;
}) {
  const contextLength = expScaleValue(minContext, maxContext, contextScale);
  const generatedTokens = expScaleValue(minGenerated, maxGenerated, generatedScale);
  const uncachedOps = Array.from(
    { length: generatedTokens },
    (_, i) => contextLength + i + 1
  ).reduce((a, b) => a + b, 0);
  const cachedOps = contextLength + 1 + Math.max(0, generatedTokens - 1) * baseCostUnit;
  const kvMemoryMb = (contextLength + generatedTokens) * kvPerTokenMb;

  return {
    contextLength,
    generatedTokens,
    uncachedOps,
    cachedOps,
    computeRatio: uncachedOps / Math.max(cachedOps, 1),
    kvMemoryMb
  };
}
