export const POSITION_STEP = 1000;
const MIN_GAP = 0.000001;

export function positionAt(positions: number[], index: number): number | null {
  if (positions.length === 0) return POSITION_STEP;

  if (index <= 0) return (positions[0] ?? 0) - POSITION_STEP;

  if (index >= positions.length) {
    return (positions[positions.length - 1] ?? 0) + POSITION_STEP;
  }

  const before = positions[index - 1] ?? 0;
  const after = positions[index] ?? before + POSITION_STEP;
  if (after - before < MIN_GAP) return null;
  return (before + after) / 2;
}
