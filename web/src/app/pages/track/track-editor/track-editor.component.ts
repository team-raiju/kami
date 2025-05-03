import { Component, computed, ElementRef, signal, ViewChild } from "@angular/core";

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

  width = signal(500);

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
        grid: {
          color: "#FFFFFF30",
        },
        ticks: {
          //@ts-ignore
          count: (ctx) => {
            const {
              scale: { maxWidth },
            } = ctx;

            return maxWidth / 10;
          },
        },
      },
      y: {
        grid: {
          color: "#FFFFFF30",
        },
        ticks: {
          //@ts-ignore
          count: (ctx) => {
            const {
              scale: { maxHeight },
            } = ctx;

            return maxHeight / 10;
          },
        },
      },
    },
  }));

  constructor(private trackService: TrackService) {}

  ngAfterViewInit() {
    this.width.set(this.childContainer.nativeElement.offsetHeight);
  }
}
