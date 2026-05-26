export type TrainingPhase = {
  id: string;
  label: string;
  startStep: number;
  endStep: number;
  train: string;
  val: string;
  note: string;
};

export const trainingPhases: TrainingPhase[] = [
  {
    id: "fit",
    label: "Phase 1: Fit training data",
    startStep: 0,
    endStep: 280,
    train: "Training loss falls quickly.",
    val: "Validation improves a bit, then slows.",
    note: "Model memorizes useful local patterns first."
  },
  {
    id: "plateau",
    label: "Phase 2: Generalization plateau",
    startStep: 280,
    endStep: 560,
    train: "Training loss keeps dropping.",
    val: "Validation barely moves.",
    note: "Looks like overfitting, but training continues."
  },
  {
    id: "grok",
    label: "Phase 3: Delayed generalization",
    startStep: 560,
    endStep: 800,
    train: "Training loss still improves.",
    val: "Validation suddenly drops later.",
    note: "This delayed improvement pattern is often described as grokking."
  }
];

export function trainingPoint(step: number) {
  const trainBase = 2.3 - 1.95 * (1 - Math.exp(-step / 255));
  const train = Math.max(
    0.35,
    trainBase + 0.06 * Math.sin(step / 38) + 0.03 * Math.cos(step / 17)
  );

  const valBase = 2.35 - 0.95 * (1 - Math.exp(-step / 230));
  const delayedGeneralization = step > 520 ? 0.62 * (1 - Math.exp(-(step - 520) / 130)) : 0;
  const val = Math.max(
    0.75,
    valBase - delayedGeneralization + 0.09 * Math.sin(step / 46 + 0.7) + 0.04 * Math.cos(step / 23)
  );

  return { step, train, val };
}

export function trainingCurve() {
  return Array.from({ length: 81 }, (_, i) => trainingPoint(i * 10));
}

export function selectedTrainingPhase(markerStep: number) {
  if (markerStep < 280) return trainingPhases[0];
  if (markerStep < 560) return trainingPhases[1];
  return trainingPhases[2];
}

export function nearestTrainingPoint(markerStep: number) {
  return trainingCurve().reduce(
    (best, p) => (Math.abs(p.step - markerStep) < Math.abs(best.step - markerStep) ? p : best),
    trainingPoint(0)
  );
}
