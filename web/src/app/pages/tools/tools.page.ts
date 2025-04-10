import { Component, computed, signal, ViewChild, ViewChildren } from "@angular/core";
import { LanguageSwitcherComponent } from "../../components/language-switch.component";
import { MatToolbarModule } from "@angular/material/toolbar";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatIconModule } from "@angular/material/icon";
import { SerialService } from "../../services/serial.service";
import { MatButtonModule } from "@angular/material/button";
import { SideNavTogglerComponent } from "../../components/sidenav/sidenav-toggler.component";
import { SerialConnectButton } from "../../components/serial-connect-button.component";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatListModule } from "@angular/material/list";
import { BaseChartDirective } from "ng2-charts";
import { ChartData, ChartOptions, Point } from "chart.js";
import { min } from "rxjs";

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(() => resolve(), ms));

@Component({
  templateUrl: "./tools.page.html",
  imports: [
    LanguageSwitcherComponent,
    MatToolbarModule,
    TranslocoDirective,
    MatIconModule,
    MatButtonModule,
    SideNavTogglerComponent,
    SerialConnectButton,
    MatSidenavModule,
    MatListModule,
    BaseChartDirective,
  ],
})
export class ToolsPage {
  constructor(public serial: SerialService) {}

  @ViewChildren(BaseChartDirective) charts?: BaseChartDirective[];

  highlight_min = signal(0);
  highlight_max = signal(0);

  chart1_data = computed<ChartData<"line">>(() => {
    const log = this.serial.logData();

    return {
      labels: log.map((l, idx) => idx),
      datasets: [
        {
          label: "Target Velocity",
          data: log.map((l) => (l ?? {}).target_velocity_ms),
          borderColor: "#dab36bCC",
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
        },
        {
          label: "Velocity",
          data: log.map((l) => (l ?? {}).velocity_ms),
          borderColor: "#00FFFF",
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
        },
      ],
    };
  });

  chart2_data = computed<ChartData<"line">>(() => {
    const log = this.serial.logData();

    return {
      labels: log.map((l, idx) => idx),
      datasets: [
        {
          label: "Target Angular Velocity",
          data: log.map((l) => (l ?? {}).target_rad_s),
          borderColor: "#dab36bcc",
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
        },
        {
          label: "Angular Velocity",
          data: log.map((l) => (l ?? {}).angular_speed_rad_s),
          borderColor: "#00FFFF",
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
        },
      ],
    };
  });

  chart3_data = computed<ChartData<"line">>(() => {
    const log = this.serial.logData();

    return {
      labels: log.map((l, idx) => idx),
      datasets: [
        {
          label: "PWM Left",
          data: log.map((l) => (l ?? {}).pwm_left),
          borderColor: "#00FFFF",
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
        },
        {
          label: "PWM Right",
          data: log.map((l) => (l ?? {}).pwm_right),
          borderColor: "#dab36b",
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
        },
      ],
    };
  });

  chart4_data = computed<ChartData<"line">>(() => {
    const log = this.serial.logData();

    return {
      labels: log.map((l, idx) => idx),
      datasets: [
        {
          label: "Battery",
          data: log.map((l) => (l ?? {}).battery),
          borderColor: "#00FFFF",
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
        },
      ],
    };
  });

  chart5_data = computed<ChartData<"line">>(() => {
    const log = this.serial.logData();

    return {
      labels: log.map((l, idx) => idx),
      datasets: [
        {
          label: "Line offset",
          data: log.map((l) => (l ?? {}).line_offset),
          borderColor: "#00FFFF",
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
        },
      ],
    };
  });

  options = computed<ChartOptions<"line">>(() => ({
    scales: {
      x: {
        type: "linear",
        position: "bottom",
      },
      y: {
        type: "linear",
        position: "left",
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      zoom: {
        limits: {
          x: { min: "original", max: "original" },
        },
        pan: {
          enabled: true,
          mode: "x",
          modifierKey: "ctrl",
          onPanComplete: ({ chart }) => {
            const scale = chart.getZoomedScaleBounds();

            for (const c of this.charts ?? []) {
              if (c.chart === chart || c.type === "scatter") {
                continue;
              }

              c.chart?.zoomScale("x", scale["x"]!, "default");
            }

            this.highlight_min.set(scale["x"]?.min ?? 0);
            this.highlight_max.set(scale["x"]?.max ?? 0);
          },
        },
        zoom: {
          wheel: {
            enabled: false,
          },
          drag: {
            enabled: true,
          },
          mode: "x",
          onZoomComplete: async ({ chart }) => {
            const scale = chart.getZoomedScaleBounds();

            for (const c of this.charts ?? []) {
              if (c.chart === chart || c.type === "scatter") {
                continue;
              }
              c.chart?.zoomScale("x", scale["x"]!, "default");
            }

            this.highlight_min.set(scale["x"]?.min ?? 0);
            this.highlight_max.set(scale["x"]?.max ?? 0);
          },
        },
      },
      title: {
        display: true,
        position: "bottom",
      },
    },
    transitions: {
      zoom: {
        animation: {
          duration: 100,
        },
      },
    },
  }));

  track_data = computed<ChartData<"scatter", Point[]>["datasets"]>(() => {
    const log = this.serial.logData();
    const points = log.map((l) => ({
      x: (l ?? {}).pos_x,
      y: (l ?? {}).pos_y,
    }));

    const hmin = this.highlight_min();
    const hmax = this.highlight_max();

    const velocities = log.filter((l) => l).map((l) => l.velocity_ms);
    const min_spd = 0.5;
    const max_spd = Math.max(...velocities);

    return [
      {
        label: "Track",
        data: points,
        backgroundColor: (p) => {
          const speed = log[p.dataIndex]?.velocity_ms;
          const perc = (speed - min_spd) / (max_spd - min_spd);
          const h = (1.0 - perc) * 240;
          const alpha = (p.dataIndex >= hmin && p.dataIndex <= hmax) || hmax === 0 ? "100%" : "10%";
          return `hsla(${h}, 100%, 50%, ${alpha})`;
        },
        pointRadius: 2,
      },
    ];
  });

  track_options = computed<ChartOptions<"scatter">>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: { enabled: false },
    },
    animation: false,
  }));

  async readLog() {
    // const request = await fetch("/test.txt");
    // const data = await request.text();
    // for (const d of data.split("\n")) {
    //   this.serial.parse(d);
    // }
  }

  resetZoom() {
    for (const c of this.charts ?? []) {
      c.chart?.resetZoom();
    }
    this.highlight_min.set(0);
    this.highlight_max.set(0);
  }
}
