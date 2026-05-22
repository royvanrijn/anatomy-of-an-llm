export type Point = { x: number; y: number };

export type OptimizerRun = {
  name: "SGD" | "Momentum" | "Adam";
  points: Point[];
  losses: number[];
};

export type OptimizerConfig = {
  steps: number;
  start: Point;
  lr: number;
  momentum: number;
  beta1: number;
  beta2: number;
  eps: number;
};

export function toyLoss(p: Point): number {
  return 0.55 * p.x * p.x + 1.2 * p.y * p.y + 0.25 * p.x * p.y;
}

export function toyGrad(p: Point): Point {
  return {
    x: 1.1 * p.x + 0.25 * p.y,
    y: 2.4 * p.y + 0.25 * p.x
  };
}

function stepSgd(p: Point, lr: number): Point {
  const g = toyGrad(p);
  return { x: p.x - lr * g.x, y: p.y - lr * g.y };
}

function stepMomentum(p: Point, lr: number, momentum: number, v: Point): { p: Point; v: Point } {
  const g = toyGrad(p);
  const nextV = {
    x: momentum * v.x + (1 - momentum) * g.x,
    y: momentum * v.y + (1 - momentum) * g.y
  };
  return {
    p: { x: p.x - lr * nextV.x, y: p.y - lr * nextV.y },
    v: nextV
  };
}

function stepAdam(
  p: Point,
  lr: number,
  beta1: number,
  beta2: number,
  eps: number,
  m: Point,
  v: Point,
  t: number
): { p: Point; m: Point; v: Point } {
  const g = toyGrad(p);
  const nextM = {
    x: beta1 * m.x + (1 - beta1) * g.x,
    y: beta1 * m.y + (1 - beta1) * g.y
  };
  const nextV = {
    x: beta2 * v.x + (1 - beta2) * g.x * g.x,
    y: beta2 * v.y + (1 - beta2) * g.y * g.y
  };

  const mHat = {
    x: nextM.x / (1 - Math.pow(beta1, t)),
    y: nextM.y / (1 - Math.pow(beta1, t))
  };
  const vHat = {
    x: nextV.x / (1 - Math.pow(beta2, t)),
    y: nextV.y / (1 - Math.pow(beta2, t))
  };

  return {
    p: {
      x: p.x - lr * mHat.x / (Math.sqrt(vHat.x) + eps),
      y: p.y - lr * mHat.y / (Math.sqrt(vHat.y) + eps)
    },
    m: nextM,
    v: nextV
  };
}

export function runOptimizers(config: OptimizerConfig): OptimizerRun[] {
  const { steps, start, lr, momentum, beta1, beta2, eps } = config;

  const sgdPoints: Point[] = [{ ...start }];
  const momPoints: Point[] = [{ ...start }];
  const adamPoints: Point[] = [{ ...start }];

  let sgd = { ...start };
  let mom = { ...start };
  let adam = { ...start };

  let momV: Point = { x: 0, y: 0 };
  let adamM: Point = { x: 0, y: 0 };
  let adamV: Point = { x: 0, y: 0 };

  for (let i = 1; i <= steps; i++) {
    sgd = stepSgd(sgd, lr);
    sgdPoints.push({ ...sgd });

    const momStep = stepMomentum(mom, lr, momentum, momV);
    mom = momStep.p;
    momV = momStep.v;
    momPoints.push({ ...mom });

    const adamStep = stepAdam(adam, lr, beta1, beta2, eps, adamM, adamV, i);
    adam = adamStep.p;
    adamM = adamStep.m;
    adamV = adamStep.v;
    adamPoints.push({ ...adam });
  }

  return [
    { name: "SGD", points: sgdPoints, losses: sgdPoints.map(toyLoss) },
    { name: "Momentum", points: momPoints, losses: momPoints.map(toyLoss) },
    { name: "Adam", points: adamPoints, losses: adamPoints.map(toyLoss) }
  ];
}
