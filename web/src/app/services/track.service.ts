import { Injectable, linkedSignal } from "@angular/core";
import { SerialService } from "./serial.service";

export interface Point {
  x: number;
  y: number;
}

@Injectable({ providedIn: "root" })
export class TrackService {
  track = linkedSignal<Point[]>(() => this.serialService.trackData());
  markers = linkedSignal<Point[]>(() => this.serialService.markersData().map((m) => m.pos));

  constructor(private serialService: SerialService) {}

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
