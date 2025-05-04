import { Component, computed, ElementRef, HostListener, signal, ViewChild } from "@angular/core";

import { TrackService } from "../../../services/track.service";
import { BaseChartDirective } from "ng2-charts";
import { ChartData, ChartOptions, Point } from "chart.js";

@Component({
  selector: "track-editor",
  templateUrl: "./track-editor.component.html",
  imports: [BaseChartDirective],
})
export class TrackEditorComponent {
  @ViewChild("container") chartContainer!: ElementRef;
  @ViewChild("childContainer") childContainer!: ElementRef;

  width = signal(0);
  height = signal(0);

  limits = computed<[number, number, number, number]>(() => {
    const xs = this.trackService.track().map((p) => p.x);
    const ys = this.trackService.track().map((p) => p.y);

    const [minx, maxx] = [Math.min(...xs), Math.max(...xs)];
    const [miny, maxy] = [Math.min(...ys), Math.max(...ys)];

    const [dx, dy] = [maxx - minx, maxy - miny];

    const ratio = this.width() / this.height();
    const track_ratio = dx / dy;

    if (track_ratio < ratio) {
      const dX = (this.width() * dy) / this.height();
      const maxg = minx + dX + 5;
      const md = (maxg - maxx) / 2;

      return [minx - 5 - md, maxg - md, miny - 5, maxy + 5];
    }

    const dY = (this.height() * dx) / this.width();
    const maxg = miny + dY + 5;
    const md = (maxg - maxy) / 2;

    return [minx - 5, maxx + 5, miny - 5 - md, maxg - md];
  });

  data = computed<ChartData<"scatter", Point[]>["datasets"]>(() => {
    const points = this.trackService.track();
    const markers = this.trackService.markers();

    return [
      {
        label: "Points",
        data: points,
        backgroundColor: "#00FFFFCC",
        pointRadius: 2,
      },
      {
        label: "Markers",
        data: markers,
        backgroundColor: "red",
        // pointStyle: "rect",
        pointRadius: 2.2,
      },
    ];
  });

  options = computed<ChartOptions<"scatter">>(() => ({
    aspectRatio: 1,
    animation: {
      duration: 0,
    },
    plugins: {
      tooltip: { enabled: false },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        min: this.limits()[0],
        max: this.limits()[1],
        grid: {
          color: "#FFFFFF30",
        },
        ticks: {
          stepSize: 15,
        },
      },
      y: {
        min: this.limits()[2],
        max: this.limits()[3],
        grid: {
          color: "#FFFFFF30",
        },
        ticks: {
          stepSize: 15,
        },
      },
    },
  }));

  constructor(private trackService: TrackService) {}

  ngAfterViewInit() {
    this.width.set(this.childContainer.nativeElement.offsetWidth);
    this.height.set(this.childContainer.nativeElement.offsetHeight);
  }

  @HostListener("window:resize")
  resize() {
    this.width.set(this.childContainer.nativeElement.offsetWidth);
    this.height.set(this.childContainer.nativeElement.offsetHeight);
  }
}
