<script lang="ts">
  import { onMount } from "svelte";
  import uPlot from "uplot";
  import "uplot/dist/uPlot.min.css";
  import { fujinLog } from "$lib/state/fujinLogState.svelte";

  let containerEl: HTMLDivElement;
  let chartContainers: HTMLDivElement[] = [];
  let uplots: uPlot[] = [];
  let resizeObserver: ResizeObserver | null = null;

  // Synchronized cursor across charts
  const cursorSync = uPlot.sync("fujin-telemetry");

  interface PanelDef {
    title: string;
    unit: string;
    keys: string[];
    labels: string[];
    colors: string[];
    dashes?: number[][];
  }

  function getPanels(mode: "control" | "sensor"): PanelDef[] {
    const commonTop: PanelDef[] = [
      {
        title: "Linear Velocity",
        unit: "m/s",
        keys: ["lin_vel_act", "lin_vel_tgt"],
        labels: ["Actual", "Target"],
        colors: ["#76c0b3", "#e5b974"],
        dashes: [undefined as any, [5, 5]],
      },
      {
        title: "Angular Velocity",
        unit: "rad/s",
        keys: ["ang_vel_act", "ang_vel_tgt"],
        labels: ["Actual", "Target"],
        colors: ["#a8aee8", "#f08da0"],
        dashes: [undefined as any, [5, 5]],
      },
      {
        title: "PWM Signals",
        unit: "Duty (0-1000)",
        keys: ["pwm_left", "pwm_right"],
        labels: ["Left", "Right"],
        colors: ["#76c0b3", "#68b5a7"],
      },
    ];

    if (mode === "control") {
      return [
        ...commonTop,
        {
          title: "Velocity PID Terms",
          unit: "Value",
          keys: ["vel_p", "vel_i"],
          labels: ["P Term", "I Term"],
          colors: ["#76c0b3", "#a8aee8"],
        },
        {
          title: "Angular PID Terms",
          unit: "Value",
          keys: ["ang_p", "ang_i"],
          labels: ["P Term", "I Term"],
          colors: ["#a8aee8", "#f08da0"],
        },
        {
          title: "Feedforward / Battery",
          unit: "FF / mV",
          keys: ["rotation_ff", "linear_ff", "battery"],
          labels: ["Rotation FF", "Linear FF", "Battery (mV)"],
          colors: ["#f08da0", "#e5b974", "#68b5a7"],
        },
      ];
    } else {
      return [
        ...commonTop,
        {
          title: "Odometry & Distance",
          unit: "Distance / Angle",
          keys: ["dist", "angle"],
          labels: ["Distance (mm)", "Angle (deg)"],
          colors: ["#76c0b3", "#a8aee8"],
        },
        {
          title: "IR Sensor Distances",
          unit: "mm",
          keys: ["sens_l", "sens_fl", "sens_fr", "sens_r"],
          labels: ["Sens Left", "Sens Front-L", "Sens Front-R", "Sens Right"],
          colors: ["#76c0b3", "#e5b974", "#f08da0", "#a8aee8"],
        },
        {
          title: "Battery & Variance",
          unit: "mV / Diff",
          keys: ["battery", "imu_diff"],
          labels: ["Battery (mV)", "IMU Diff"],
          colors: ["#68b5a7", "#849caa"],
        },
      ];
    }
  }

  function destroyCharts() {
    for (const u of uplots) {
      try {
        u.destroy();
      } catch (e) {}
    }
    uplots = [];
  }

  function getCardDimensions() {
    if (!containerEl) return { plotWidth: 300, plotHeight: 180 };
    const containerWidth = containerEl.clientWidth || 600;
    const containerHeight = containerEl.clientHeight || 600;

    const cols = 2;
    const rows = 3;
    const gap = 8;
    const pad = 16; // 8px padding * 2

    const availableWidth = Math.max(100, containerWidth - pad - gap * (cols - 1));
    const availableHeight = Math.max(100, containerHeight - pad - gap * (rows - 1));

    const cardWidth = Math.floor(availableWidth / cols);
    const cardHeight = Math.floor(availableHeight / rows);

    // Subtract card borders/padding (8px) and title (18px) + legend (20px) + margins (10px)
    const plotWidth = Math.max(60, cardWidth - 10);
    const plotHeight = Math.max(40, cardHeight - 50);

    return { plotWidth, plotHeight };
  }

  function handleResize() {
    if (!containerEl || uplots.length === 0) return;
    const { plotWidth, plotHeight } = getCardDimensions();
    for (const u of uplots) {
      try {
        u.setSize({ width: plotWidth, height: plotHeight });
      } catch (err) {}
    }
  }

  function buildCharts() {
    destroyCharts();
    if (!fujinLog.hasData || !containerEl) return;

    const time = fujinLog.series["time"];
    if (!time || time.length === 0) return;

    const panels = getPanels(fujinLog.mode);
    const { plotWidth, plotHeight } = getCardDimensions();

    panels.forEach((panel, pIdx) => {
      const el = chartContainers[pIdx];
      if (!el) return;

      const seriesOpts: uPlot.Series[] = [
        {
          label: "Time",
          value: (_u, v) => (v == null ? "-" : `${v.toFixed(0)} ms`),
        },
      ];

      const uplotData: (number[] | Float64Array)[] = [time];

      panel.keys.forEach((key, kIdx) => {
        const dataArr = fujinLog.series[key];
        if (dataArr && dataArr.length === time.length) {
          uplotData.push(dataArr);
          seriesOpts.push({
            label: panel.labels[kIdx] || key,
            stroke: panel.colors[kIdx] || "#f59e0b",
            width: 1.5,
            dash: panel.dashes?.[kIdx],
            value: (_u, v) => (v == null ? "-" : v.toFixed(2)),
          });
        }
      });

      if (uplotData.length <= 1) {
        return;
      }

      const opts: uPlot.Options = {
        title: panel.title,
        width: plotWidth,
        height: plotHeight,
        legend: {
          show: true,
          live: true,
        },
        cursor: {
          sync: {
            key: cursorSync.key,
          },
          drag: {
            setScale: false,
          },
        },
        scales: {
          x: {
            time: false,
          },
        },
        axes: [
          {
            stroke: "#4b5d69",
            grid: { stroke: "#141f29", width: 1 },
            ticks: { stroke: "#1e2d3b", width: 1 },
            font: "9px monospace",
            size: 20,
            gap: 2,
          },
          {
            stroke: "#4b5d69",
            grid: { stroke: "#141f29", width: 1 },
            ticks: { stroke: "#1e2d3b", width: 1 },
            font: "9px monospace",
            size: 36,
            gap: 2,
          },
        ],
        series: seriesOpts,
      };

      try {
        const u = new uPlot(opts, uplotData as any, el);
        uplots.push(u);
      } catch (err) {
        console.error("Failed to build uPlot:", err);
      }
    });
  }

  $effect(() => {
    // Rebuild when active log changes
    const _d = fujinLog.active;
    if (containerEl) {
      setTimeout(buildCharts, 20);
    }
  });

  onMount(() => {
    buildCharts();

    if (containerEl && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(containerEl);
    }

    const onWindowResize = () => handleResize();
    window.addEventListener("resize", onWindowResize);

    return () => {
      window.removeEventListener("resize", onWindowResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      destroyCharts();
    };
  });
</script>

<div
  bind:this={containerEl}
  class="grid grid-cols-2 grid-rows-3 gap-2 p-2 w-full h-full min-h-0 min-w-0 overflow-hidden bg-canvas select-none"
>
  {#if fujinLog.hasData}
    {#each getPanels(fujinLog.mode) as panel, i}
      <div
        bind:this={chartContainers[i]}
        class="relative flex flex-col items-center justify-between rounded border border-border-default bg-surface-box/90 p-1 min-h-0 min-w-0 overflow-hidden"
      ></div>
    {/each}
  {:else}
    <div class="col-span-2 row-span-3 flex flex-col items-center justify-center gap-3 text-content-muted">
      <span class="icon-[material-symbols--show-chart] text-5xl text-iris/30"></span>
      <span class="text-sm font-bold text-content-secondary uppercase tracking-wider">No Telemetry Charts</span>
      <p class="text-xs text-content-muted max-w-sm text-center">
        Go to the <strong class="text-iris font-semibold">Log Inspector</strong> tab in Controls and upload a log file or pick one from the Vault to visualize robot telemetry.
      </p>
    </div>
  {/if}
</div>

<style>
  :global(.uplot) {
    font-family: monospace !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    width: 100% !important;
    height: 100% !important;
    overflow: hidden !important;
  }
  :global(.u-title) {
    font-size: 10px !important;
    font-weight: bold !important;
    color: #a8aee8 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em !important;
    height: 18px !important;
    line-height: 18px !important;
    margin: 0 !important;
    padding: 0 !important;
    flex-shrink: 0 !important;
    text-align: center !important;
    overflow: hidden !important;
    white-space: nowrap !important;
    text-overflow: ellipsis !important;
    max-width: 100% !important;
  }
  :global(.u-wrap) {
    flex-shrink: 0 !important;
  }
  :global(.u-legend) {
    font-size: 9px !important;
    color: #849caa !important;
    height: 20px !important;
    line-height: 20px !important;
    margin: 0 !important;
    padding: 0 4px !important;
    flex-shrink: 0 !important;
    overflow: hidden !important;
    white-space: nowrap !important;
    text-overflow: ellipsis !important;
    max-width: 100% !important;
    text-align: center !important;
  }
  :global(.u-legend .u-series th) {
    color: #4b5d69 !important;
    font-weight: normal !important;
    padding: 0 2px !important;
  }
  :global(.u-legend .u-series td) {
    padding: 0 2px !important;
  }
  :global(.u-legend .u-marker) {
    width: 6px !important;
    height: 6px !important;
    margin-right: 2px !important;
  }
</style>
