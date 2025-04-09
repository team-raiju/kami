import { Component, computed, ViewChild, ViewChildren } from "@angular/core";
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
import { ChartData, ChartOptions } from "chart.js";

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
              c.chart?.zoomScale("x", scale["x"]!, "default");
              c.update();
            }
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
              if (c.chart === chart) {
                continue;
              }
              c.chart?.zoomScale("x", scale["x"]!, "default");
            }
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
  }
}
