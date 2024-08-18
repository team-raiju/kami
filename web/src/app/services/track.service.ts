import { Injectable, signal } from "@angular/core";

export interface Point {
  x: number;
  y: number;
}

@Injectable({ providedIn: "root" })
export class TrackService {
  track = signal<Point[]>([]);
  markers = signal<Point[]>([]);

  deCasteljau = (points: Point[], position = 0.5) => {
    let a: Point | undefined;
    let b: Point | undefined;
    let midpoints: Point[] = [];

    while (points.length > 1) {
      const num = points.length - 1;
      for (let i = 0; i < num; ++i) {
        a = points[i];
        b = points[i + 1];
        midpoints.push({ x: a.x + (b.x - a.x) * position, y: a.y + (b.y - a.y) * position });
      }
      points = midpoints;
      midpoints = [];
    }

    return Object.assign(points[0], { in: a, out: b });
  };
}
