<script lang="ts">
  import { onMount } from "svelte";
  import Konva from "konva";
  import { maze } from "$lib/mazeState.svelte";
  import { robotLog } from "$lib/robotLogState.svelte";
  import { getHeatmapColor } from "$lib/mazeUtils";

  const GRID_SIZE = 16;

  let konvaContainer: HTMLDivElement;
  let layer: Konva.Layer;

  const wallShapes = new Map<string, Konva.Line>();
  let errorWall: { tween: Konva.Tween; shape: Konva.Line; originalStroke: string; originalWidth: number } | null = null;

  const updateWallLook = (wallObject: Konva.Line, isActive: boolean) => {
    if (isActive) {
      wallObject.stroke("#c4b5fd");
      wallObject.strokeWidth(4);
      wallObject.opacity(1);
    } else {
      wallObject.stroke("gray");
      wallObject.strokeWidth(2);
      wallObject.opacity(0.3);
    }
  };

  function redrawMaze() {
    if (!layer) {
      return;
    }

    layer.destroyChildren();
    wallShapes.clear();

    const stage = layer.getStage();
    const width = stage.width();
    const height = stage.height();

    const PADDING = 20;
    const availableSize = Math.min(width, height) - PADDING * 2;
    const CELL_SIZE = availableSize / GRID_SIZE;
    const MAZE_SIZE = availableSize;

    const mazeGroup = new Konva.Group({
      x: (width - MAZE_SIZE) / 2,
      y: (height - MAZE_SIZE) / 2,
    });
    layer.add(mazeGroup);

    // Horizontal walls
    for (let r = 0; r < GRID_SIZE + 1; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const wall = new Konva.Line({
          points: [c * CELL_SIZE, r * CELL_SIZE, (c + 1) * CELL_SIZE, r * CELL_SIZE],
          hitStrokeWidth: 12,
        });
        wallShapes.set(`h-${r}-${c}`, wall);
        updateWallLook(wall, maze.state.horizontalWalls[r][c]);
        mazeGroup.add(wall);

        if (r !== 0 && r !== GRID_SIZE && !maze.state.editLocked) {
          wall.on("click", () => {
            maze.toggleWall("horizontal", r, c);
          });
          wall.on("mouseenter", () => {
            stage.container().style.cursor = "pointer";
            if (!maze.state.horizontalWalls[r][c]) {
              updateWallLook(wall, true);
              wall.opacity(0.6);
            }
          });
          wall.on("mouseleave", () => {
            stage.container().style.cursor = "default";
            if (!maze.state.horizontalWalls[r][c]) {
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
          points: [c * CELL_SIZE, r * CELL_SIZE, c * CELL_SIZE, (r + 1) * CELL_SIZE],
          hitStrokeWidth: 12,
        });
        wallShapes.set(`v-${r}-${c}`, wall);
        updateWallLook(wall, maze.state.verticalWalls[r][c]);
        mazeGroup.add(wall);

        if (c !== 0 && c !== GRID_SIZE && !maze.state.editLocked) {
          wall.on("click", () => {
            maze.toggleWall("vertical", r, c);
          });
          wall.on("mouseenter", () => {
            stage.container().style.cursor = "pointer";
            if (!maze.state.verticalWalls[r][c]) {
              updateWallLook(wall, true);
              wall.opacity(0.6);
            }
          });
          wall.on("mouseleave", () => {
            stage.container().style.cursor = "default";
            if (!maze.state.verticalWalls[r][c]) {
              updateWallLook(wall, false);
            }
          });
        }
      }
    }

    const { robot } = maze.state;
    const robotSize = CELL_SIZE * 0.5;

    const robotGroup = new Konva.Group({
      x: robot.x * CELL_SIZE + CELL_SIZE / 2,
      y: robot.y * CELL_SIZE + CELL_SIZE / 2,
      rotation: robot.angle,
      offsetX: robotSize / 2,
      offsetY: robotSize / 2,
    });

    const body = new Konva.Rect({
      width: robotSize,
      height: robotSize,
      fill: "#f59e0b",
      cornerRadius: robotSize * 0.1,
    });

    const pointer = new Konva.Line({
      points: [robotSize / 2, 0, robotSize, robotSize * 0.4, 0, robotSize * 0.4],
      fill: "#fbbf24",
      closed: true,
    });

    robotGroup.add(body);
    robotGroup.add(pointer);
    mazeGroup.add(robotGroup);

    if (robotLog.entries.length > 0) {
      const pathGroup = new Konva.Group();

      const velocities = robotLog.entries.map((e) => e.Vel);
      const minVel = Math.min(...velocities);
      const maxVel = Math.max(...velocities);

      const originX = CELL_SIZE / 2;
      const originY = (GRID_SIZE - 1) * CELL_SIZE + CELL_SIZE / 2;

      const mmToPxScale = CELL_SIZE / 180;

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
        pathGroup.add(dot);
      });

      mazeGroup.add(pathGroup);
    }
  }

  onMount(() => {
    if (!konvaContainer) {
      return;
    }

    const stage = new Konva.Stage({
      container: konvaContainer,
      width: konvaContainer.clientWidth,
      height: konvaContainer.clientHeight,
    });
    layer = new Konva.Layer();
    stage.add(layer);

    $effect.pre(() => {
      const _ = maze.state;
      redrawMaze();
    });

    $effect(() => {
      const flashInfo = maze.wallToFlash;

      if (errorWall) {
        errorWall.tween.pause();
        errorWall.shape.stroke(errorWall.originalStroke);
        errorWall.shape.strokeWidth(errorWall.originalWidth);
        errorWall = null;
        return;
      }

      if (!flashInfo) {
        return;
      }

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
  });
</script>

<div class="flex h-full w-full flex-col border border-gray-500/25 font-mono text-purple-500">
  <div class="flex flex-row items-center bg-purple-500/10">
    <span class="inline-block bg-purple-500 px-2 py-1 text-xs font-bold text-black uppercase">Maze</span>
  </div>
  <div class="grow" bind:this={konvaContainer}></div>
</div>
