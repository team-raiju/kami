<script lang="ts">
  import { onMount } from "svelte";
  import Konva from "konva";
  import { maze } from "$lib/mazeStore.svelte"; // 1. Importar o novo 'maze'

  const GRID_SIZE = 16;
  let konvaContainer: HTMLDivElement;
  let layer: Konva.Layer;

  // 2. A reatividade agora é automática!
  // Svelte 5 detecta que 'maze.value' é usado na função 'redrawMaze'
  // e vai re-executá-la sempre que o estado mudar.
  // Não precisamos mais do bloco '$:'

  function redrawMaze() {
    if (!layer) return;
    layer.destroyChildren();

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

    // Renderiza as paredes horizontais
    for (let r = 0; r < GRID_SIZE + 1; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const isBoundary = r === 0 || r === GRID_SIZE;
        const wall = new Konva.Line({
          points: [c * CELL_SIZE, r * CELL_SIZE, (c + 1) * CELL_SIZE, r * CELL_SIZE],
          hitStrokeWidth: 12,
        });
        // Acessamos sem o '$'
        updateWallLook(wall, maze.value.horizontalWalls[r][c]);
        mazeGroup.add(wall);

        if (!isBoundary) {
          wall.on("click", () => {
            // 3. Usamos nossa nova função para modificar o estado
            maze.toggleWall("horizontal", r, c);
          });
          wall.on("mouseenter", () => {
            stage.container().style.cursor = "pointer";
            if (!maze.value.horizontalWalls[r][c]) {
              wall.stroke("#c4b5fd");
              wall.strokeWidth(4);
              wall.opacity(0.6);
            }
          });
          wall.on("mouseleave", () => {
            stage.container().style.cursor = "default";
            if (!maze.value.horizontalWalls[r][c]) {
              updateWallLook(wall, false);
            }
          });
        }
      }
    }

    // Renderiza as paredes verticais
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE + 1; c++) {
        const isBoundary = c === 0 || c === GRID_SIZE;
        const wall = new Konva.Line({
          points: [c * CELL_SIZE, r * CELL_SIZE, c * CELL_SIZE, (r + 1) * CELL_SIZE],
          hitStrokeWidth: 12,
        });
        updateWallLook(wall, maze.value.verticalWalls[r][c]);
        mazeGroup.add(wall);
        if (!isBoundary) {
          wall.on("click", () => {
            maze.toggleWall("vertical", r, c);
          });
          wall.on("mouseenter", () => {
            stage.container().style.cursor = "pointer";
            if (!maze.value.verticalWalls[r][c]) {
              wall.stroke("#c4b5fd");
              wall.strokeWidth(4);
              wall.opacity(0.6);
            }
          });
          wall.on("mouseleave", () => {
            stage.container().style.cursor = "default";
            if (!maze.value.verticalWalls[r][c]) {
              updateWallLook(wall, false);
            }
          });
        }
      }
    }
  }

  // No onMount, precisamos de uma forma de vincular a reatividade
  onMount(() => {
    if (!konvaContainer) return;
    const stage = new Konva.Stage({
      container: konvaContainer,
      width: konvaContainer.clientWidth,
      height: konvaContainer.clientHeight,
    });
    layer = new Konva.Layer();
    stage.add(layer);

    // $effect.pre garante que a re-renderização aconteça de forma otimizada
    $effect.pre(() => {
      // Acessar maze.value aqui "assina" para as mudanças
      const _ = maze.value;
      redrawMaze();
    });
  });
</script>

<div class="flex h-full w-full flex-col border border-gray-500/25 font-mono text-purple-500">
  <div class="flex flex-row items-center bg-purple-500/10">
    <span class="inline-block bg-purple-500 px-2 py-1 text-xs font-bold text-black uppercase">Maze</span>
  </div>
  <div class="grow" bind:this={konvaContainer}></div>
</div>
