import { log } from "../state/logsState.svelte";
import type { MazeState } from "../state/mazeState.svelte";

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
  const lines = mazeString.trim().split("\n");
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
    return "#76c0b3";
  }

  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));

  let r: number, g: number, b: number;
  if (t < 0.5) {
    const p = t * 2;
    r = Math.round(118 + (229 - 118) * p);
    g = Math.round(192 + (185 - 192) * p);
    b = Math.round(179 + (116 - 179) * p);
  } else {
    const p = (t - 0.5) * 2;
    r = Math.round(229 + (168 - 229) * p);
    g = Math.round(185 + (174 - 185) * p);
    b = Math.round(116 + (232 - 116) * p);
  }

  return `rgb(${r},${g},${b})`;
}

export function generateRandomMaze(): MazeState {
  const horizontalWalls = Array(GRID_SIZE + 1)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(true));

  const verticalWalls = Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE + 1).fill(true));

  // 1. Center 4 squares (rows 7, 8, cols 7, 8)
  // Interior walls open
  horizontalWalls[8][7] = false;
  horizontalWalls[8][8] = false;
  verticalWalls[7][8] = false;
  verticalWalls[8][8] = false;

  const centerPerimeterWalls: Array<{ type: "h" | "v"; r: number; c: number }> = [
    { type: "h", r: 7, c: 7 },
    { type: "h", r: 7, c: 8 },
    { type: "h", r: 9, c: 7 },
    { type: "h", r: 9, c: 8 },
    { type: "v", r: 7, c: 7 },
    { type: "v", r: 8, c: 7 },
    { type: "v", r: 7, c: 9 },
    { type: "v", r: 8, c: 9 },
  ];

  // Pick exactly 1 entrance
  const entranceIdx = Math.floor(Math.random() * centerPerimeterWalls.length);
  const entrance = centerPerimeterWalls[entranceIdx];
  if (entrance.type === "h") {
    horizontalWalls[entrance.r][entrance.c] = false;
  } else {
    verticalWalls[entrance.r][entrance.c] = false;
  }

  // 2. Start cell (r=15, c=0):
  // Right wall present: v[15][1] = true
  verticalWalls[15][1] = true;
  // Front wall absent: h[15][0] = false
  horizontalWalls[15][0] = false;

  // 3. DFS Maze generation (Spanning Tree)
  const visited = Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(false));

  visited[7][7] = true;
  visited[7][8] = true;
  visited[8][7] = true;
  visited[8][8] = true;
  visited[15][0] = true;

  visited[14][0] = true;
  const stack: [number, number][] = [[14, 0]];

  while (stack.length > 0) {
    const [r, c] = stack[stack.length - 1];

    const neighbors: Array<{ r: number; c: number; wallType: "h" | "v"; wr: number; wc: number }> = [];
    if (r > 0 && !visited[r - 1][c]) {
      neighbors.push({ r: r - 1, c, wallType: "h", wr: r, wc: c });
    }
    if (r < GRID_SIZE - 1 && !visited[r + 1][c]) {
      neighbors.push({ r: r + 1, c, wallType: "h", wr: r + 1, wc: c });
    }
    if (c > 0 && !visited[r][c - 1]) {
      neighbors.push({ r, c: c - 1, wallType: "v", wr: r, wc: c });
    }
    if (c < GRID_SIZE - 1 && !visited[r][c + 1]) {
      neighbors.push({ r, c: c + 1, wallType: "v", wr: r, wc: c + 1 });
    }

    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      if (next.wallType === "h") {
        horizontalWalls[next.wr][next.wc] = false;
      } else {
        verticalWalls[next.wr][next.wc] = false;
      }
      visited[next.r][next.c] = true;
      stack.push([next.r, next.c]);
    } else {
      stack.pop();
    }
  }

  // 4. Add controlled loops
  const isCenterPerimeter = (type: "h" | "v", r: number, c: number) => {
    return centerPerimeterWalls.some((w) => w.type === type && w.r === r && w.c === c);
  };

  const countWallsAtPost = (pr: number, pc: number) => {
    let count = 0;
    if (pr > 0 && pc <= GRID_SIZE && verticalWalls[pr - 1]?.[pc]) count++;
    if (pr < GRID_SIZE && pc <= GRID_SIZE && verticalWalls[pr]?.[pc]) count++;
    if (pr <= GRID_SIZE && pc > 0 && horizontalWalls[pr]?.[pc - 1]) count++;
    if (pr <= GRID_SIZE && pc < GRID_SIZE && horizontalWalls[pr]?.[pc]) count++;
    return count;
  };

  const candidates: Array<{ type: "h" | "v"; r: number; c: number }> = [];
  for (let r = 1; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (horizontalWalls[r][c] && !isCenterPerimeter("h", r, c)) {
        candidates.push({ type: "h", r, c });
      }
    }
  }
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 1; c < GRID_SIZE; c++) {
      if (verticalWalls[r][c] && !(r === 15 && c === 1) && !isCenterPerimeter("v", r, c)) {
        candidates.push({ type: "v", r, c });
      }
    }
  }

  candidates.sort(() => Math.random() - 0.5);
  let loopsAdded = 0;
  const targetLoops = 18;

  for (const cand of candidates) {
    if (loopsAdded >= targetLoops) break;

    if (cand.type === "h") {
      if (countWallsAtPost(cand.r, cand.c) > 1 && countWallsAtPost(cand.r, cand.c + 1) > 1) {
        horizontalWalls[cand.r][cand.c] = false;
        loopsAdded++;
      }
    } else {
      if (countWallsAtPost(cand.r, cand.c) > 1 && countWallsAtPost(cand.r + 1, cand.c) > 1) {
        verticalWalls[cand.r][cand.c] = false;
        loopsAdded++;
      }
    }
  }

  return {
    horizontalWalls,
    verticalWalls,
    robot: { x: 0, y: GRID_SIZE - 1, angle: 0 },
    editLocked: false,
  };
}
