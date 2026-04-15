<script lang="ts">
  import { onMount } from "svelte";
  import Konva from "konva";
  import { track } from "$lib/trackState.svelte";

  let container: HTMLDivElement;
  let stage: Konva.Stage;
  let layer: Konva.Layer;

  const MIN_SCALE = 0.1;
  const MAX_SCALE = 10;

  function redrawTrack() {
    if (!layer) return;

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

    const linePoints: number[] = [];
    points.forEach((p) => {
      linePoints.push(p.x, p.y);
    });

    const pathLine = new Konva.Line({
      points: linePoints,
      stroke: "#f59e0b",
      strokeWidth: 2 / scale,
      lineCap: "round",
      lineJoin: "round",
    });
    trackGroup.add(pathLine);

    points.forEach((p, i) => {
      const dot = new Konva.Circle({
        x: p.x,
        y: p.y,
        radius: 4 / scale,
        fill: i === 0 ? "#22c55e" : i === points.length - 1 ? "#ef4444" : "#f59e0b",
      });
      trackGroup.add(dot);
    });

    layer.add(trackGroup);
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
    stage.on("mousedown", () => {
      isDragging = true;
    });
    stage.on("mouseup", () => {
      isDragging = false;
    });
    stage.on("mousemove", (e) => {
      if (!isDragging) return;
      const pos = stage.getPointerPosition();
      if (!pos) return;
      stage.position(pos);
    });

    $effect.pre(() => {
      const _ = track.state.points;
      redrawTrack();
    });
  });
</script>

<div class="grow" bind:this={container}></div>
