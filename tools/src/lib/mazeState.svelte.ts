import { log } from "./logsState.svelte";

const GRID_SIZE = 16;

export interface RobotState {
  x: number;
  y: number;
  angle: number;
}

export interface MazeState {
  horizontalWalls: boolean[][];
  verticalWalls: boolean[][];
  robot: RobotState;
  editLocked: boolean;
}

export interface WallFlashState {
  r: number;
  c: number;
  type: "horizontal" | "vertical";
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

  return {
    horizontalWalls,
    verticalWalls,
    robot: { x: 0, y: GRID_SIZE - 1, angle: 0 },
    editLocked: false,
  };
}

let state = $state<MazeState>(createInitialMazeState());
let wallToFlash = $state<WallFlashState | null>(null);

// Funções de controle do robô
function forward() {
  const { x, y, angle } = state.robot;
  let hitWall: WallFlashState | null = null;

  switch (angle) {
    case 0:
      if (state.horizontalWalls[y][x]) {
        hitWall = { r: y, c: x, type: "horizontal" };
      } else {
        state.robot.y--;
      }
      break;
    case 90:
      if (state.verticalWalls[y][x + 1]) {
        hitWall = { r: y, c: x + 1, type: "vertical" };
      } else {
        state.robot.x++;
      }
      break;
    case 180:
      if (state.horizontalWalls[y + 1][x]) {
        hitWall = { r: y + 1, c: x, type: "horizontal" };
      } else {
        state.robot.y++;
      }
      break;
    case 270:
      if (state.verticalWalls[y][x]) {
        hitWall = { r: y, c: x, type: "vertical" };
      } else {
        state.robot.x--;
      }
      break;
  }

  if (hitWall) {
    wallToFlash = hitWall;
    log.error(`Tried to move into wall (${hitWall.r},${hitWall.c},${hitWall.type[0]})`);

    setTimeout(() => (wallToFlash = null), 400);
  }
}

function turn(degrees: number) {
  const validTurns = [-180, -90, 90, 180];
  if (!validTurns.includes(degrees)) {
    throw new Error(`Invalid rotation angle`);
  }

  state.robot.angle = (state.robot.angle + degrees + 360) % 360;
}

export const maze = {
  get state() {
    return state;
  },

  get wallToFlash() {
    return wallToFlash;
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

  forward,
  turn,
};
