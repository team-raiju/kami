<script lang="ts">
  import { onMount } from "svelte";
  import Konva from "konva";
  import { track } from "$lib/state/trackState.svelte";

  let container: HTMLDivElement;
  let stage: Konva.Stage | null = null;
  let layer: Konva.Layer | null = null;

  const MIN_SCALE = 0.1;
  const MAX_SCALE = 10;

  function redrawTrack() {
    if (!layer || !stage || !container) {
      return;
    }

    layer.destroyChildren();

    const points = track.state.points;
    if (points.length === 0) {
      layer.batchDraw();
      return;
    }

    const stageWidth = container.clientWidth || stage.width();
    const stageHeight = container.clientHeight || stage.height();

    // Guard against 0 or unmeasured container
    if (stageWidth <= 40 || stageHeight <= 40) {
      return;
    }

    if (stage.width() !== stageWidth || stage.height() !== stageHeight) {
      stage.width(stageWidth);
      stage.height(stageHeight);
    }

    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const trackWidth = Math.max(0.001, maxX - minX);
    const trackHeight = Math.max(0.001, maxY - minY);
    const padding = 20;

    const availableSize = Math.max(10, Math.min(stageWidth, stageHeight) - padding * 2);
    const scale = Math.max(0.0001, availableSize / Math.max(trackWidth, trackHeight, 1));

    const centerX = (stageWidth - trackWidth * scale) / 2;
    const centerY = (stageHeight - trackHeight * scale) / 2;

    const trackGroup = new Konva.Group({
      x: centerX - minX * scale,
      y: centerY + maxY * scale,
      scaleX: scale,
      scaleY: -scale,
    });

    const pointRadius = Math.max(0.1, 1.5 / scale);
    trackGroup.add(
      ...points.map(
        (p, i) =>
          new Konva.Circle({
            x: p.x,
            y: p.y,
            radius: pointRadius,
            fill: i === 0 ? "#76c0b3" : i === points.length - 1 ? "#f08da0" : "#4b5d69",
          }),
      ),
    );

    const crossSize = Math.max(1, 30 / scale);
    const crossColor = "rgba(168, 174, 232, 0.25)";
    const hLine = new Konva.Line({
      points: [-crossSize, 0, crossSize, 0],
      stroke: crossColor,
      strokeWidth: Math.max(0.1, 1 / scale),
    });
    const vLine = new Konva.Line({
      points: [0, -crossSize, 0, crossSize],
      stroke: crossColor,
      strokeWidth: Math.max(0.1, 1 / scale),
    });
    trackGroup.add(hLine);
    trackGroup.add(vLine);
    layer.add(trackGroup);

    const shortcutPoints = track.state.shortcutPoints;
    if (shortcutPoints.length > 0) {
      const shortcutGroup = new Konva.Group({
        x: centerX - minX * scale,
        y: centerY + maxY * scale,
        scaleX: scale,
        scaleY: -scale,
      });
      const scRadius = Math.max(0.1, 2 / scale);
      shortcutGroup.add(
        ...shortcutPoints.map(
          (p) =>
            new Konva.Circle({
              x: p.x,
              y: p.y,
              radius: scRadius,
              fill: "#a8aee8",
            }),
        ),
      );
      layer.add(shortcutGroup);
    }

    const selectedIdx = track.state.selectedPointIndex;
    if (selectedIdx >= 0 && selectedIdx < points.length) {
      const selectedPoint = points[selectedIdx];
      if (selectedPoint) {
        const marker = new Konva.Circle({
          x: centerX - minX * scale + selectedPoint.x * scale,
          y: centerY + maxY * scale - selectedPoint.y * scale,
          radius: 3.5,
          stroke: "#f08da0",
          strokeWidth: 2,
        });
        layer.add(marker);
      }
    }

    layer.batchDraw();
  }

  $effect(() => {
    const _ = track.state.points;
    const __ = track.state.shortcutPoints;
    const ___ = track.state.selectedPointIndex;
    if (stage && layer) {
      redrawTrack();
    }
  });

  onMount(() => {
    if (!container) return;

    const initialWidth = Math.max(50, container.clientWidth || 600);
    const initialHeight = Math.max(50, container.clientHeight || 600);

    stage = new Konva.Stage({
      container: container,
      width: initialWidth,
      height: initialHeight,
    });

    layer = new Konva.Layer();
    stage.add(layer);

    stage.on("wheel", (e) => {
      e.evt.preventDefault();
      if (!stage) return;
      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const newScale = direction > 0 ? oldScale * 1.1 : oldScale / 1.1;
      const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));

      stage.scale({ x: clampedScale, y: clampedScale });
      stage.position({
        x: pointer.x - mousePointTo.x * clampedScale,
        y: pointer.y - mousePointTo.y * clampedScale,
      });
    });

    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    stage.on("mousedown", () => {
      if (!stage) return;
      isDragging = true;
      const pos = stage.getPointerPosition();
      if (pos) {
        dragStart = { x: pos.x - stage.x(), y: pos.y - stage.y() };
      }
    });
    stage.on("mouseup", () => {
      isDragging = false;
    });
    stage.on("mousemove", () => {
      if (!isDragging || !stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      stage.position({
        x: pos.x - dragStart.x,
        y: pos.y - dragStart.y,
      });
    });

    let resizeObserver: ResizeObserver | null = null;
    const handleResize = () => {
      if (stage && container && container.clientWidth > 40 && container.clientHeight > 40) {
        stage.width(container.clientWidth);
        stage.height(container.clientHeight);
        redrawTrack();
      }
    };

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(container);
    }
    window.addEventListener("resize", handleResize);

    redrawTrack();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (stage) {
        stage.destroy();
      }
    };
  });
</script>

<div class="h-full w-full self-stretch min-h-0 min-w-0" bind:this={container}></div>
