export const ropePairBases = [1, 2, 4, 8];
export const ropeQBase = { x: 0.82, y: 0.34 };
export const ropeKBase = { x: 0.58, y: 0.76 };

export const ropeSentenceTokens = [
  { text: "The", pos: 0, pairPos: 4 },
  { text: "small", pos: 1, pairPos: 2 },
  { text: "dog", pos: 2, pairPos: 3 },
  { text: "chased", pos: 3, pairPos: 2 },
  { text: "the", pos: 4, pairPos: 0 },
  { text: "ball", pos: 5, pairPos: 3 }
];

export function ropeTheta(pos: number, pair: number) {
  return pos / ropePairBases[pair];
}

export function rotate2d(vec: { x: number; y: number }, angle: number) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return {
    x: vec.x * c - vec.y * s,
    y: vec.x * s + vec.y * c
  };
}

export function dot2d(a: { x: number; y: number }, b: { x: number; y: number }) {
  return a.x * b.x + a.y * b.y;
}

export function length2d(vec: { x: number; y: number }) {
  return Math.hypot(vec.x, vec.y);
}

export function ropeToyState(selectedSentenceIndex: number) {
  const selectedToken = ropeSentenceTokens[selectedSentenceIndex] ?? ropeSentenceTokens[0];
  const m = selectedToken.pos;
  const n = selectedToken.pairPos;
  const pairIndex = selectedSentenceIndex % ropePairBases.length;
  const qRot = rotate2d(ropeQBase, ropeTheta(m, pairIndex));
  const kRot = rotate2d(ropeKBase, ropeTheta(n, pairIndex));
  return {
    selectedToken,
    m,
    n,
    pairIndex,
    relativeOffset: m - n,
    delta: ropeTheta(m, pairIndex) - ropeTheta(n, pairIndex),
    qRot,
    kRot,
    dotBefore: dot2d(ropeQBase, ropeKBase),
    dotAfter: dot2d(qRot, kRot)
  };
}
