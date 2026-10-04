<script lang="ts">
  import { onMount } from "svelte";
  import Konva from "konva";
  import { maze } from "$lib/state/mazeState.svelte";
  import { algorithm, type HoverGoalTarget } from "$lib/state/algorithmState.svelte";
  import { robotLog } from "$lib/state/robotLogState.svelte";
  import { getHeatmapColor } from "$lib/utils/mazeUtils";

  const GRID_SIZE = 16;

  let konvaContainer: HTMLDivElement;
  let stage: Konva.Stage | null = null;
  let layer: Konva.Layer | null = null;
  let mazeGroup: Konva.Group | null = null;
  let cellsGroup: Konva.Group | null = null;
  let heatmapGroup: Konva.Group | null = null;
  let goalGroup: Konva.Group | null = null;
  let pathGroup: Konva.Group | null = null;
  let cursorGroup: Konva.Group | null = null;
  let wallsGroup: Konva.Group | null = null;
  let robotLogGroup: Konva.Group | null = null;

  const wallShapes = new Map<string, Konva.Line>();
  let errorWall: { tween: Konva.Tween; shape: Konva.Line; originalStroke: string; originalWidth: number } | null = null;

  const updateWallLook = (wallObject: Konva.Line, isActive: boolean) => {
    if (isActive) {
      wallObject.stroke("#c4b5fd");
      wallObject.strokeWidth(3.5);
      wallObject.opacity(1);
    } else {
      wallObject.stroke("gray");
      wallObject.strokeWidth(1.5);
      wallObject.opacity(0.2);
    }
  };

  function getHeatmapBgColor(dist: number, maxDist: number): string {
    if (dist === 0) return "#10b981"; // emerald for goal
    const t = Math.min(1.0, dist / Math.max(1, maxDist));
    const hue = Math.round(180 - t * 110); // 180 (cyan) down to 70
    return `hsl(${hue}, 85%, 28%)`;
  }

  function getMetrics() {
    if (!stage) return { cellSize: 0 };
    const width = stage.width();
    const height = stage.height();
    const PADDING = 20;
    const availableSize = Math.min(width, height) - PADDING * 2;
    const cellSize = availableSize / GRID_SIZE;
    const mazeSize = availableSize;

    if (mazeGroup) {
      mazeGroup.x((width - mazeSize) / 2);
      mazeGroup.y((height - mazeSize) / 2);
    }

    return { cellSize };
  }

  function getTargetFromPointer(): HoverGoalTarget | null {
    if (!stage || !mazeGroup) return null;
    const ptr = stage.getPointerPosition();
    if (!ptr) return null;
    const mx = ptr.x - mazeGroup.x();
    const my = ptr.y - mazeGroup.y();
    const { cellSize } = getMetrics();
    if (cellSize <= 0) return null;

    const colFloat = mx / cellSize;
    const rowFloat = my / cellSize;

    if (colFloat < 0 || colFloat >= GRID_SIZE || rowFloat < 0 || rowFloat >= GRID_SIZE) {
      return null;
    }

    const nearestC = Math.round(colFloat);
    const nearestR = Math.round(rowFloat);

    // If near an interior junction (between cells 1..15 in c and r)
    if (nearestC >= 1 && nearestC <= 15 && nearestR >= 1 && nearestR <= 15) {
      const jxCanvas = nearestC * cellSize;
      const jyCanvas = nearestR * cellSize;
      const dist = Math.hypot(mx - jxCanvas, my - jyCanvas);
      if (dist <= cellSize * 0.30) {
        const jx = nearestC;
        const jy = 16 - nearestR;
        return {
          type: "junction",
          x: jx,
          y: jy,
          cx: jxCanvas,
          cy: jyCanvas,
        };
      }
    }

    const c = Math.floor(colFloat);
    const r = Math.floor(rowFloat);
    return {
      type: "single",
      x: c,
      y: 15 - r,
    };
  }

  function rebuildCells(cellSize: number) {
    if (!cellsGroup) return;
    cellsGroup.destroyChildren();

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const cellRect = new Konva.Rect({
          x: c * cellSize,
          y: r * cellSize,
          width: cellSize,
          height: cellSize,
          fill: "transparent",
        });

        cellRect.on("contextmenu", (e) => {
          e.evt.preventDefault();
          if (maze.state.editLocked) return;
          const target = getTargetFromPointer();
          if (target) {
            algorithm.setGoal(target);
            algorithm.isPickingGoal = false;
          }
        });

        cellRect.on("click", (e) => {
          if (e.evt.button === 2) return;
          if (maze.state.editLocked) return;
          if (algorithm.isPickingGoal) {
            const target = getTargetFromPointer();
            if (target) {
              algorithm.setGoal(target);
              algorithm.isPickingGoal = false;
            }
          }
        });

        cellsGroup.add(cellRect);
      }
    }
  }

  function rebuildWalls(cellSize: number) {
    if (!wallsGroup) return;
    wallsGroup.destroyChildren();
    wallShapes.clear();

    // Horizontal walls
    for (let r = 0; r < GRID_SIZE + 1; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const wall = new Konva.Line({
          points: [c * cellSize, r * cellSize, (c + 1) * cellSize, r * cellSize],
          hitStrokeWidth: 12,
        });
        wallShapes.set(`h-${r}-${c}`, wall);
        updateWallLook(wall, maze.state.horizontalWalls[r]?.[c] ?? false);
        wallsGroup.add(wall);

        if (r !== 0 && r !== GRID_SIZE) {
          wall.on("contextmenu", (e) => {
            e.evt.preventDefault();
            if (maze.state.editLocked) return;
            const target = getTargetFromPointer();
            if (target) {
              algorithm.setGoal(target);
              algorithm.isPickingGoal = false;
            }
          });
          wall.on("click", () => {
            if (maze.state.editLocked) return;
            if (algorithm.isPickingGoal) {
              const target = getTargetFromPointer();
              if (target) {
                algorithm.setGoal(target);
                algorithm.isPickingGoal = false;
              }
              return;
            }
            maze.toggleWall("horizontal", r, c);
          });
          wall.on("mouseenter", () => {
            if (maze.state.editLocked) return;
            if (algorithm.isPickingGoal) {
              if (stage) stage.container().style.cursor = "crosshair";
              return;
            }
            if (stage) stage.container().style.cursor = "pointer";
            if (!maze.state.horizontalWalls[r]?.[c]) {
              updateWallLook(wall, true);
              wall.opacity(0.6);
            }
          });
          wall.on("mouseleave", () => {
            if (stage && !algorithm.isPickingGoal) stage.container().style.cursor = "default";
            if (!maze.state.horizontalWalls[r]?.[c]) {
              updateWallLook(wall, false);
            }
          });
        }
      }
    }

    // Vertical walls
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE + 1; c++) {
        const wall = new Konva.Line({
          points: [c * cellSize, r * cellSize, c * cellSize, (r + 1) * cellSize],
          hitStrokeWidth: 12,
        });
        wallShapes.set(`v-${r}-${c}`, wall);
        updateWallLook(wall, maze.state.verticalWalls[r]?.[c] ?? false);
        wallsGroup.add(wall);

        if (c !== 0 && c !== GRID_SIZE) {
          wall.on("contextmenu", (e) => {
            e.evt.preventDefault();
            if (maze.state.editLocked) return;
            const target = getTargetFromPointer();
            if (target) {
              algorithm.setGoal(target);
              algorithm.isPickingGoal = false;
            }
          });
          wall.on("click", () => {
            if (maze.state.editLocked) return;
            if (algorithm.isPickingGoal) {
              const target = getTargetFromPointer();
              if (target) {
                algorithm.setGoal(target);
                algorithm.isPickingGoal = false;
              }
              return;
            }
            maze.toggleWall("vertical", r, c);
          });
          wall.on("mouseenter", () => {
            if (maze.state.editLocked) return;
            if (algorithm.isPickingGoal) {
              if (stage) stage.container().style.cursor = "crosshair";
              return;
            }
            if (stage) stage.container().style.cursor = "pointer";
            if (!maze.state.verticalWalls[r]?.[c]) {
              updateWallLook(wall, true);
              wall.opacity(0.6);
            }
          });
          wall.on("mouseleave", () => {
            if (stage && !algorithm.isPickingGoal) stage.container().style.cursor = "default";
            if (!maze.state.verticalWalls[r]?.[c]) {
              updateWallLook(wall, false);
            }
          });
        }
      }
    }
  }

  function updateWallLooks() {
    for (let r = 0; r < GRID_SIZE + 1; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const wall = wallShapes.get(`h-${r}-${c}`);
        if (wall) updateWallLook(wall, maze.state.horizontalWalls[r]?.[c] ?? false);
      }
    }
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE + 1; c++) {
        const wall = wallShapes.get(`v-${r}-${c}`);
        if (wall) updateWallLook(wall, maze.state.verticalWalls[r]?.[c] ?? false);
      }
    }
  }

  function updateHeatmapAndDistances(cellSize: number) {
    if (!heatmapGroup) return;
    heatmapGroup.destroyChildren();

    if (!algorithm.wasmLoaded) return;

    let maxDist = 1;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const d = algorithm.distances[r]?.[c];
        if (d !== undefined && d < 255 && d > maxDist) maxDist = d;
      }
    }

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const cellX = c * cellSize;
        const cellY = r * cellSize;
        const dist = algorithm.distances[r]?.[c] ?? 255;

        // Heatmap tile
        if (algorithm.showHeatmap && dist < 255) {
          const tile = new Konva.Rect({
            x: cellX + 1,
            y: cellY + 1,
            width: cellSize - 2,
            height: cellSize - 2,
            fill: getHeatmapBgColor(dist, maxDist),
            opacity: dist === 0 ? 0.55 : 0.35,
            listening: false,
          });
          heatmapGroup.add(tile);
        }

        // Distance number label
        if (algorithm.showDistances && dist < 255) {
          const label = new Konva.Text({
            x: cellX,
            y: cellY + cellSize * 0.35,
            width: cellSize,
            align: "center",
            text: dist.toString(),
            fontSize: Math.max(9, Math.round(cellSize * 0.28)),
            fontFamily: "monospace",
            fontStyle: dist === 0 ? "bold" : "normal",
            fill: dist === 0 ? "#34d399" : "#cbd5e1",
            opacity: dist === 0 ? 1.0 : 0.75,
            listening: false,
          });
          heatmapGroup.add(label);
        }
      }
    }
  }

  function updateGoal(_cellSize: number) {
    if (!goalGroup) return;
    goalGroup.destroyChildren();
  }

  function updatePath(cellSize: number) {
    if (!pathGroup) return;
    pathGroup.destroyChildren();

    if (!algorithm.wasmLoaded || !algorithm.showPath) return;

    const toCanvasX = (mmX: number) => (mmX / 180.0) * cellSize;
    const toCanvasY = (mmY: number) => 16 * cellSize - (mmY / 180.0) * cellSize;

    if (algorithm.compareAlgorithms && algorithm.comparisonData.timeBased && algorithm.comparisonData.classic) {
      // --- COMPARE ALGORITHMS OVERLAY (Time-Based vs Classic BFS) ---
      const algosToDraw = [
        {
          name: "Classic BFS",
          data: algorithm.comparisonData.classic,
          color: "#38bdf8",
          dash: [6, 4],
          width: 2.5,
          opacity: 0.85,
        },
        {
          name: "Time-Based",
          data: algorithm.comparisonData.timeBased,
          color: "#f59e0b",
          dash: undefined,
          width: 3.5,
          opacity: 0.95,
        },
      ];

      for (const item of algosToDraw) {
        if (!item.data || item.data.waypoints.length < 2) continue;
        const pts: number[] = [];
        for (const wp of item.data.waypoints) {
          pts.push(toCanvasX(wp.x), toCanvasY(wp.y));
        }
        const line = new Konva.Line({
          points: pts,
          stroke: item.color,
          strokeWidth: item.width,
          dash: item.dash,
          opacity: item.opacity,
          lineCap: "round",
          lineJoin: "round",
          listening: false,
        });
        pathGroup.add(line);
      }

      // Draw start and goal markers
      if (algorithm.waypoints.length > 0) {
        const firstWp = algorithm.waypoints[0];
        const lastWp = algorithm.waypoints[algorithm.waypoints.length - 1];
        const startMarker = new Konva.Circle({
          x: toCanvasX(firstWp.x),
          y: toCanvasY(firstWp.y),
          radius: 5,
          fill: "#22c55e",
          stroke: "#ffffff",
          strokeWidth: 1.5,
          listening: false,
        });
        pathGroup.add(startMarker);

        const goalMarker = new Konva.Circle({
          x: toCanvasX(lastWp.x),
          y: toCanvasY(lastWp.y),
          radius: 6,
          fill: "#f59e0b",
          stroke: "#ffffff",
          strokeWidth: 1.5,
          listening: false,
        });
        pathGroup.add(goalMarker);
      }
    } else if (algorithm.waypoints.length > 1) {
      // --- SINGLE MODE SEGMENTED & COLOR-CODED TRAJECTORY ---
      algorithm.movements.forEach((move, i) => {
        if (move.wpStart === move.wpEnd) return;

        const pts: number[] = [];
        for (let w = move.wpStart; w <= move.wpEnd; w++) {
          const wp = algorithm.waypoints[w];
          if (wp) {
            pts.push(toCanvasX(wp.x), toCanvasY(wp.y));
          }
        }
        if (pts.length < 4) return;

        const segmentLine = new Konva.Line({
          points: pts,
          stroke: move.color,
          strokeWidth: move.category === "diagonal" ? 4.5 : 3.5,
          lineCap: "round",
          lineJoin: "round",
          hitStrokeWidth: 14,
        });

        segmentLine.on("mouseenter", () => {
          if (stage) stage.container().style.cursor = "pointer";
          algorithm.selectedMovementIndex = i;
        });
        segmentLine.on("mouseleave", () => {
          if (stage) stage.container().style.cursor = "default";
          if (algorithm.selectedMovementIndex === i) {
            algorithm.selectedMovementIndex = null;
          }
        });
        segmentLine.on("click", () => {
          algorithm.selectedMovementIndex = algorithm.selectedMovementIndex === i ? null : i;
        });

        pathGroup!.add(segmentLine);
      });

      // Waypoint dots
      for (const wp of algorithm.waypoints) {
        const dot = new Konva.Circle({
          x: toCanvasX(wp.x),
          y: toCanvasY(wp.y),
          radius: 2.5,
          fill: "#ffffff",
          opacity: 0.6,
          listening: false,
        });
        pathGroup.add(dot);
      }

      // Start & Goal Markers
      const firstWp = algorithm.waypoints[0];
      const lastWp = algorithm.waypoints[algorithm.waypoints.length - 1];

      const startMarker = new Konva.Circle({
        x: toCanvasX(firstWp.x),
        y: toCanvasY(firstWp.y),
        radius: 5,
        fill: "#22c55e",
        stroke: "#ffffff",
        strokeWidth: 1.5,
        listening: false,
      });
      pathGroup.add(startMarker);

      const goalMarker = new Konva.Circle({
        x: toCanvasX(lastWp.x),
        y: toCanvasY(lastWp.y),
        radius: 6,
        fill: "#f59e0b",
        stroke: "#ffffff",
        strokeWidth: 1.5,
        listening: false,
      });
      pathGroup.add(goalMarker);
    }
  }

  function updateCursor(cellSize: number) {
    if (!cursorGroup) return;
    cursorGroup.destroyChildren();

    // Goal picking preview reticle
    if (algorithm.isPickingGoal && algorithm.hoverTarget) {
      if (algorithm.hoverTarget.type === "junction") {
        const { x: jx, y: jy } = algorithm.hoverTarget;
        const c = jx - 1;
        const r = 15 - jy;
        const cx = jx * cellSize;
        const cy = (16 - jy) * cellSize;

        const previewArea = new Konva.Rect({
          x: c * cellSize + 1.5,
          y: r * cellSize + 1.5,
          width: 2 * cellSize - 3,
          height: 2 * cellSize - 3,
          stroke: "#38bdf8",
          strokeWidth: 2,
          dash: [6, 4],
          fill: "#38bdf8",
          opacity: 0.2,
          cornerRadius: 4,
          listening: false,
        });
        cursorGroup.add(previewArea);

        const previewRing = new Konva.Circle({
          x: cx,
          y: cy,
          radius: Math.max(6, cellSize * 0.28),
          stroke: "#38bdf8",
          strokeWidth: 2,
          listening: false,
        });
        cursorGroup.add(previewRing);

        const previewDot = new Konva.Circle({
          x: cx,
          y: cy,
          radius: Math.max(2.5, cellSize * 0.10),
          fill: "#38bdf8",
          listening: false,
        });
        cursorGroup.add(previewDot);

        const armLen = Math.max(4, cellSize * 0.14);
        const rad = Math.max(6, cellSize * 0.28);
        const chH = new Konva.Line({
          points: [cx - rad - armLen, cy, cx + rad + armLen, cy],
          stroke: "#38bdf8",
          strokeWidth: 1.5,
          opacity: 0.8,
          listening: false,
        });
        const chV = new Konva.Line({
          points: [cx, cy - rad - armLen, cx, cy + rad + armLen],
          stroke: "#38bdf8",
          strokeWidth: 1.5,
          opacity: 0.8,
          listening: false,
        });
        cursorGroup.add(chH);
        cursorGroup.add(chV);

        const previewText = new Konva.Text({
          x: c * cellSize,
          y: cy + Math.max(8, cellSize * 0.35),
          width: 2 * cellSize,
          text: `Set 4-Cell (${jx},${jy})`,
          fontSize: Math.max(8, Math.round(cellSize * 0.20)),
          fontFamily: "monospace",
          fontStyle: "bold",
          fill: "#38bdf8",
          align: "center",
          listening: false,
        });
        cursorGroup.add(previewText);
      } else {
        const c = algorithm.hoverTarget.x;
        const r = 15 - algorithm.hoverTarget.y;
        const cx = (c + 0.5) * cellSize;
        const cy = (r + 0.5) * cellSize;

        const previewRect = new Konva.Rect({
          x: c * cellSize + 1.5,
          y: r * cellSize + 1.5,
          width: cellSize - 3,
          height: cellSize - 3,
          stroke: "#38bdf8",
          strokeWidth: 2,
          dash: [4, 2],
          fill: "#38bdf8",
          opacity: 0.25,
          cornerRadius: 3,
          listening: false,
        });
        cursorGroup.add(previewRect);

        const previewRing = new Konva.Circle({
          x: cx,
          y: cy,
          radius: Math.max(6, cellSize * 0.28),
          stroke: "#38bdf8",
          strokeWidth: 2,
          listening: false,
        });
        cursorGroup.add(previewRing);

        const previewDot = new Konva.Circle({
          x: cx,
          y: cy,
          radius: Math.max(2.5, cellSize * 0.10),
          fill: "#38bdf8",
          listening: false,
        });
        cursorGroup.add(previewDot);

        const armLen = Math.max(4, cellSize * 0.14);
        const rad = Math.max(6, cellSize * 0.28);
        const chH = new Konva.Line({
          points: [cx - rad - armLen, cy, cx + rad + armLen, cy],
          stroke: "#38bdf8",
          strokeWidth: 1.5,
          opacity: 0.8,
          listening: false,
        });
        const chV = new Konva.Line({
          points: [cx, cy - rad - armLen, cx, cy + rad + armLen],
          stroke: "#38bdf8",
          strokeWidth: 1.5,
          opacity: 0.8,
          listening: false,
        });
        cursorGroup.add(chH);
        cursorGroup.add(chV);

        const previewText = new Konva.Text({
          x: c * cellSize - cellSize * 0.5,
          y: cy + Math.max(7, cellSize * 0.32),
          width: cellSize * 2,
          text: `Set (${algorithm.hoverTarget.x},${algorithm.hoverTarget.y})`,
          fontSize: Math.max(8, Math.round(cellSize * 0.20)),
          fontFamily: "monospace",
          fontStyle: "bold",
          fill: "#38bdf8",
          align: "center",
          listening: false,
        });
        cursorGroup.add(previewText);
      }
    }

    if (!algorithm.wasmLoaded || !algorithm.showPath || algorithm.compareAlgorithms || algorithm.waypoints.length <= 1) {
      return;
    }

    if (algorithm.selectedMovementIndex === null) return;

    const toCanvasX = (mmX: number) => (mmX / 180.0) * cellSize;
    const toCanvasY = (mmY: number) => 16 * cellSize - (mmY / 180.0) * cellSize;

    // Draw glowing halo for selected movement
    const move = algorithm.movements[algorithm.selectedMovementIndex];
    if (move && move.wpStart !== move.wpEnd) {
      const pts: number[] = [];
      for (let w = move.wpStart; w <= move.wpEnd; w++) {
        const wp = algorithm.waypoints[w];
        if (wp) {
          pts.push(toCanvasX(wp.x), toCanvasY(wp.y));
        }
      }
      if (pts.length >= 4) {
        const halo = new Konva.Line({
          points: pts,
          stroke: "#ffffff",
          strokeWidth: 8,
          opacity: 0.7,
          lineCap: "round",
          lineJoin: "round",
          listening: false,
        });
        cursorGroup.add(halo);
      }
    }
  }

  function updateRobotLogs(cellSize: number) {
    if (!robotLogGroup) return;
    robotLogGroup.destroyChildren();

    if (robotLog.entries.length === 0) return;

    const velocities = robotLog.entries.map((e) => e.Vel);
    const minVel = Math.min(...velocities);
    const maxVel = Math.max(...velocities);

    const originX = cellSize / 2;
    const originY = (GRID_SIZE - 1) * cellSize + cellSize / 2;
    const mmToPxScale = cellSize / 180;

    robotLog.entries.forEach((record) => {
      const canvasX = originX + record.PosX * mmToPxScale;
      const canvasY = originY - record.PosY * mmToPxScale;

      const dot = new Konva.Circle({
        x: canvasX,
        y: canvasY,
        radius: 2,
        fill: getHeatmapColor(record.Vel, minVel, maxVel),
        listening: false,
      });
      robotLogGroup!.add(dot);
    });
  }

  function rebuildAll() {
    if (!stage || !layer) return;
    const { cellSize } = getMetrics();
    if (cellSize <= 0) return;

    rebuildCells(cellSize);
    rebuildWalls(cellSize);
    updateHeatmapAndDistances(cellSize);
    updateGoal(cellSize);
    updatePath(cellSize);
    updateCursor(cellSize);
    updateRobotLogs(cellSize);
    layer.batchDraw();
  }

  onMount(() => {
    if (!konvaContainer) return;

    stage = new Konva.Stage({
      container: konvaContainer,
      width: konvaContainer.clientWidth,
      height: konvaContainer.clientHeight,
    });
    layer = new Konva.Layer();
    stage.add(layer);

    mazeGroup = new Konva.Group();
    cellsGroup = new Konva.Group();
    heatmapGroup = new Konva.Group();
    goalGroup = new Konva.Group();
    pathGroup = new Konva.Group();
    cursorGroup = new Konva.Group();
    wallsGroup = new Konva.Group();
    robotLogGroup = new Konva.Group();

    // Add sub-groups in precise bottom-to-top rendering order
    mazeGroup.add(cellsGroup);
    mazeGroup.add(heatmapGroup);
    mazeGroup.add(goalGroup);
    mazeGroup.add(pathGroup);
    mazeGroup.add(cursorGroup);
    mazeGroup.add(wallsGroup);
    mazeGroup.add(robotLogGroup);
    layer.add(mazeGroup);

    rebuildAll();

    stage.on("mousemove", () => {
      if (maze.state.editLocked) {
        if (algorithm.hoverTarget !== null) algorithm.hoverTarget = null;
        return;
      }
      const target = getTargetFromPointer();
      algorithm.hoverTarget = target;
      if (stage && algorithm.isPickingGoal) {
        stage.container().style.cursor = target ? "crosshair" : "default";
      }
    });

    const handleMouseLeave = () => {
      algorithm.hoverTarget = null;
      if (stage && !algorithm.isPickingGoal) {
        stage.container().style.cursor = "default";
      }
    };
    konvaContainer.addEventListener("mouseleave", handleMouseLeave);

    const handleResize = () => {
      if (stage && konvaContainer) {
        stage.width(konvaContainer.clientWidth);
        stage.height(konvaContainer.clientHeight);
        rebuildAll();
      }
    };
    window.addEventListener("resize", handleResize);

    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    konvaContainer.addEventListener("contextmenu", preventContextMenu);

    // Wall flash error effect
    $effect(() => {
      const flashInfo = maze.wallToFlash;
      if (errorWall) {
        errorWall.tween.pause();
        errorWall.shape.stroke(errorWall.originalStroke);
        errorWall.shape.strokeWidth(errorWall.originalWidth);
        errorWall = null;
        return;
      }
      if (!flashInfo) return;

      const key = `${flashInfo.type[0]}-${flashInfo.r}-${flashInfo.c}`;
      const wallShape = wallShapes.get(key);
      if (wallShape) {
        const tween = new Konva.Tween({
          node: wallShape,
          duration: 0.1,
          stroke: "#ef4444",
          strokeWidth: 6,
          easing: Konva.Easings.EaseInOut,
        });
        tween.onFinish = () => tween.reverse();
        tween.onReset = () => tween.play();
        tween.play();

        errorWall = {
          tween,
          shape: wallShape,
          originalStroke: wallShape.stroke() as string,
          originalWidth: wallShape.strokeWidth(),
        };
      }
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      konvaContainer?.removeEventListener("contextmenu", preventContextMenu);
      konvaContainer?.removeEventListener("mouseleave", handleMouseLeave);
      if (stage) {
        stage.destroy();
        stage = null;
      }
    };
  });

  // 1. Reactive effect: maze walls updated
  $effect(() => {
    const _v = maze.version;
    if (stage && layer) {
      updateWallLooks();
      layer.batchDraw();
    }
  });

  // 2. Reactive effect: algorithm computation & display toggle updates (rebuilds heatmap, goal & paths)
  $effect(() => {
    const _w = algorithm.wasmLoaded;
    const _m = algorithm.movementMode;
    const _a = algorithm.algorithmType;
    const _d = algorithm.showDistances;
    const _hm = algorithm.showHeatmap;
    const _p = algorithm.showPath;
    const _cmp = algorithm.compareAllModes;
    const _wp = algorithm.waypoints;
    const _dist = algorithm.distances;
    const _goal = algorithm.goalTarget;

    if (stage && layer) {
      const { cellSize } = getMetrics();
      if (cellSize > 0) {
        updateHeatmapAndDistances(cellSize);
        updateGoal(cellSize);
        updatePath(cellSize);
        updateCursor(cellSize);
        layer.batchDraw();
      }
    }
  });

  // 3. Reactive effect: hover / selection / picking goal highlight
  $effect(() => {
    const _sel = algorithm.selectedMovementIndex;
    const _pick = algorithm.isPickingGoal;
    const _hover = algorithm.hoverTarget;

    if (stage) {
      stage.container().style.cursor = _pick ? "crosshair" : "default";
    }

    if (stage && layer) {
      const { cellSize } = getMetrics();
      if (cellSize > 0) {
        updateCursor(cellSize);
        layer.batchDraw();
      }
    }
  });

  // 4. Reactive effect: robot logs updated
  $effect(() => {
    const _entries = robotLog.entries;
    if (stage && layer) {
      const { cellSize } = getMetrics();
      if (cellSize > 0) {
        updateRobotLogs(cellSize);
        layer.batchDraw();
      }
    }
  });
</script>

<div class="grow h-full w-full" bind:this={konvaContainer}></div>
