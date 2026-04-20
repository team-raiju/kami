<script lang="ts">
  import { onMount } from "svelte";
  import Konva from "konva";
  import { track } from "$lib/state/trackState.svelte";

  let container: HTMLDivElement;
  let stage: Konva.Stage;
  let layer: Konva.Layer;

  const MIN_SCALE = 0.1;
  const MAX_SCALE = 10;

  function redrawTrack() {
    if (!layer) {
      return;
    }

    layer.destroyChildren();

    const points = track.state.points;
    if (points.length === 0) {
      layer.batchDraw();
      return;
    }

    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const trackWidth = maxX - minX;
    const trackHeight = maxY - minY;
    const padding = 20;

    const stageWidth = container.clientWidth;
    const stageHeight = container.clientHeight;
    const availableSize = Math.min(stageWidth, stageHeight) - padding * 2;
    const scale = availableSize / Math.max(trackWidth, trackHeight, 1);

    const centerX = (stageWidth - trackWidth * scale) / 2;
    const centerY = (stageHeight - trackHeight * scale) / 2;

    const trackGroup = new Konva.Group({
      x: centerX - minX * scale,
      y: centerY + maxY * scale,
      scaleX: scale,
      scaleY: -scale,
    });

    trackGroup.add(
      ...points.map(
        (p, i) =>
          new Konva.Circle({
            x: p.x,
            y: p.y,
            radius: 1.5 / scale,
            fill: i === 0 ? "#22c55e" : i === points.length - 1 ? "#ef4444" : "#64748b",
          }),
      ),
    );

    const crossSize = 30 / scale;
    const crossColor = "rgba(255,255,255,0.3)";
    const hLine = new Konva.Line({
      points: [-crossSize, 0, crossSize, 0],
      stroke: crossColor,
      strokeWidth: 1 / scale,
    });
    const vLine = new Konva.Line({
      points: [0, -crossSize, 0, crossSize],
      stroke: crossColor,
      strokeWidth: 1 / scale,
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
      shortcutGroup.add(
        ...shortcutPoints.map(
          (p) =>
            new Konva.Circle({
              x: p.x,
              y: p.y,
              radius: 2 / scale,
              fill: "#c4b5fd",
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
          radius: 3,
          stroke: "#ef4444",
          strokeWidth: 2,
        });
        layer.add(marker);
      }
    }

    layer.batchDraw();
  }

  onMount(() => {
    if (!container) return;

    stage = new Konva.Stage({
      container: container,
      width: container.clientWidth,
      height: container.clientHeight,
    });

    layer = new Konva.Layer();
    stage.add(layer);

    stage.on("wheel", (e) => {
      e.evt.preventDefault();
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
      isDragging = true;
      const pos = stage.getPointerPosition();
      if (pos) {
        dragStart = { x: pos.x - stage.x(), y: pos.y - stage.y() };
      }
    });
    stage.on("mouseup", () => {
      isDragging = false;
    });
    stage.on("mousemove", (e) => {
      if (!isDragging) {
        return;
      }

      const pos = stage.getPointerPosition();

      if (!pos) {
        return;
      }

      stage.position({
        x: pos.x - dragStart.x,
        y: pos.y - dragStart.y,
      });
    });

    $effect.pre(() => {
      const _ = track.state.points;
      const __ = track.state.shortcutPoints;
      const ___ = track.state.selectedPointIndex;
      redrawTrack();
    });
  });
</script>

<div class="grow" bind:this={container}></div>
