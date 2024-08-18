import { Component, computed, ElementRef, signal, ViewChild } from "@angular/core";

import { TrackService } from "../../../services/track.service";
import { BaseChartDirective } from "ng2-charts";
import { ChartData, ChartOptions, Point } from "chart.js";

@Component({
  selector: "track-editor",
  templateUrl: "./track-editor.component.html",
  standalone: true,
  imports: [BaseChartDirective],
})
export class TrackEditorComponent {
  @ViewChild("container") chartContainer!: ElementRef;
  @ViewChild("childContainer") childContainer!: ElementRef;

  width = signal(500);

  limits = computed<[number, number]>(() => {
    const points = this.trackService.track().flatMap(({ x, y }) => [x, y]);
    return [Math.min(...points) - 5, Math.max(...points) + 5];
  });

  data = computed<ChartData<"scatter", Point[]>["datasets"]>(() => {
    const points = this.trackService.track();
    const markers = this.trackService.markers();

    return [
      {
        label: "Points",
        data: points,
        backgroundColor: "cyan",
        pointRadius: 2,
      },
      {
        label: "Markers",
        data: markers,
        backgroundColor: "red",
        pointStyle: "rect",
        pointRadius: 5,
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
          stepSize: 10,
        },
      },
      y: {
        min: this.limits()[0],
        max: this.limits()[1],
        grid: {
          color: "#FFFFFF30",
        },
        ticks: {
          stepSize: 10,
        },
      },
    },
  }));

  constructor(private trackService: TrackService) {}

  ngAfterViewInit() {
    this.width.set(this.childContainer.nativeElement.offsetHeight);
  }
}
