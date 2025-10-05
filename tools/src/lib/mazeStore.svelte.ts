const GRID_SIZE = 16;

export interface MazeState {
  horizontalWalls: boolean[][];
  verticalWalls: boolean[][];
}

function createInitialMazeState(): MazeState {
  const horizontalWalls = Array(GRID_SIZE + 1)
    .fill(null)
    .map((_, r) =>
      Array(GRID_SIZE)
        .fill(null)
        .map(() => r === 0 || r === GRID_SIZE),
    );

  const verticalWalls = Array(GRID_SIZE)
    .fill(null)
    .map(() =>
      Array(GRID_SIZE + 1)
        .fill(null)
        .map((_, c) => c === 0 || c === GRID_SIZE),
    );

  return { horizontalWalls, verticalWalls };
}

let state = $state<MazeState>(createInitialMazeState());

export const maze = {
  get value() {
    return state;
  },

  set(newState: MazeState) {
    state = newState;
  },

  toggleWall(type: "horizontal" | "vertical", r: number, c: number) {
    if (type === "horizontal") {
      state.horizontalWalls[r][c] = !state.horizontalWalls[r][c];
    } else {
      state.verticalWalls[r][c] = !state.verticalWalls[r][c];
    }
  },
};
