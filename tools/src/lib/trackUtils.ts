import type { TrackPoint } from "./trackState.svelte";

export function movingAverage(points: TrackPoint[], k: number = 10): TrackPoint[] {
  const halfK = Math.floor(k / 2);
  const result: TrackPoint[] = [];

  for (let i = 0; i < points.length; i++) {
    if (i < halfK || i >= points.length - halfK) {
      result.push({ ...points[i] });
      continue;
    }

    let sumX = 0;
    let sumY = 0;
    for (let j = i - halfK; j < i + halfK; j++) {
      sumX += points[j].x;
      sumY += points[j].y;
    }

    result.push({
      x: sumX / k,
      y: sumY / k,
    });
  }

  return result;
}
