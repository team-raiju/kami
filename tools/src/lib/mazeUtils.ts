import type { MazeState } from "./mazeStore.svelte";

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

// Converte a string MMS de volta para o estado do labirinto (matrizes)
export function stringToMazeState(mazeString: string): MazeState {
  const lines = mazeString.split("\n");
  const horizontalWalls: boolean[][] = [];
  const verticalWalls: boolean[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i % 2 === 0) {
      // Linha horizontal
      const row = i / 2;
      horizontalWalls[row] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        horizontalWalls[row][c] = line.charAt(c * 4 + 1) === "-";
      }
    } else {
      // Linha vertical
      const row = (i - 1) / 2;
      verticalWalls[row] = [];
      for (let c = 0; c < GRID_SIZE + 1; c++) {
        verticalWalls[row][c] = line.charAt(c * 4) === "|";
      }
    }
  }

  return { horizontalWalls, verticalWalls };
}
