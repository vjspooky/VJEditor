export function getSnapPoint(
  targetTime: number,
  points: number[],
  threshold = 0.2
): number {
  let closest = targetTime;
  let minDiff = threshold;

  for (const point of points) {
    const diff = Math.abs(targetTime - point);
    if (diff < minDiff) {
      minDiff = diff;
      closest = point;
    }
  }

  return closest;
}
