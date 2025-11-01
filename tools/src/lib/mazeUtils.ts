import { log } from "./logsState.svelte";
import type { MazeState } from "./mazeState.svelte";

const GRID_SIZE = 16;

export function mazeStateToString(state: MazeState): string {
  let output = "";
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      output += "o" + (state.horizontalWalls[r][c] ? "---" : "   ");
    }
    output += "o\n";

    for (let c = 0; c < GRID_SIZE; c++) {
      output += (state.verticalWalls[r][c] ? "|" : " ") + "   ";
    }
    output += (state.verticalWalls[r][GRID_SIZE] ? "|" : " ") + "\n";
  }

  for (let c = 0; c < GRID_SIZE; c++) {
    output += "o" + (state.horizontalWalls[GRID_SIZE][c] ? "---" : "   ");
  }
  output += "o";

  return output;
}

export function stringToMazeState(mazeString: string): MazeState {
  const lines = mazeString.split("\n");
  const horizontalWalls: boolean[][] = [];
  const verticalWalls: boolean[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i % 2 === 0) {
      const row = i / 2;
      horizontalWalls[row] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        horizontalWalls[row][c] = line.charAt(c * 4 + 1) === "-";
      }
    } else {
      const row = (i - 1) / 2;
      verticalWalls[row] = [];
      for (let c = 0; c < GRID_SIZE + 1; c++) {
        verticalWalls[row][c] = line.charAt(c * 4) === "|";
      }
    }
  }

  if (horizontalWalls.length !== GRID_SIZE + 1 || verticalWalls.length !== GRID_SIZE) {
    log.error("Invalid maze dimensions");
    throw Error();
  }

  return { horizontalWalls, verticalWalls, robot: { x: 0, y: GRID_SIZE - 1, angle: 0 }, editLocked: true };
}

export function getHeatmapColor(value: number, min: number, max: number): string {
  if (min === max) {
    return "#00ff00";
  }

  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));

  let r, g, b;
  if (t < 0.5) {
    const p = t * 2;
    r = 0;
    g = Math.round(255 * p);
    b = Math.round(255 * (1 - p));
  } else {
    const p = (t - 0.5) * 2;
    r = Math.round(255 * p);
    g = Math.round(255 * (1 - p));
    b = 0;
  }

  return `rgb(${r},${g},${b})`;
}
