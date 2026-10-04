import { maze } from "./mazeState.svelte";
import { log } from "./logsState.svelte";
import { generateTrajectory } from "../utils/trajectoryUtils";

const GRID_SIZE = 16;

export const MOVEMENT_NAMES: Record<number, string> = {
  0: "START",
  1: "FORWARD",
  2: "DIAGONAL",
  3: "TURN_RIGHT_45",
  4: "TURN_LEFT_45",
  5: "TURN_RIGHT_90",
  6: "TURN_LEFT_90",
  7: "TURN_RIGHT_135",
  8: "TURN_LEFT_135",
  9: "TURN_RIGHT_180",
  10: "TURN_LEFT_180",
  11: "TURN_RIGHT_45_FROM_45",
  12: "TURN_LEFT_45_FROM_45",
  13: "TURN_RIGHT_90_FROM_45",
  14: "TURN_LEFT_90_FROM_45",
  15: "TURN_RIGHT_135_FROM_45",
  16: "TURN_LEFT_135_FROM_45",
  17: "TURN_AROUND",
  18: "TURN_RIGHT_90_SEARCH",
  19: "TURN_LEFT_90_SEARCH",
  20: "TURN_AROUND_INPLACE",
  21: "STOP",
};

export type SpeedPreset = "slow" | "medium" | "fast" | "super";

export const SPEED_PRESET_MAP: Record<SpeedPreset, number> = {
  slow: 3,
  medium: 4,
  fast: 5,
  super: 6,
};

export const SPEED_PRESET_LABELS: Record<SpeedPreset, { name: string; speed: string; desc: string }> = {
  slow: { name: "Slow", speed: "3.0 m/s", desc: "Conservative speed with low turn velocity (0.5 m/s)" },
  medium: { name: "Medium", speed: "3.0 m/s", desc: "Moderate speed with medium turn velocity (1.0 m/s)" },
  fast: { name: "Fast", speed: "3.5 m/s", desc: "High competition speed with fast turns (1.3-1.5 m/s)" },
  super: { name: "Super", speed: "4.5 m/s", desc: "Maximum aggressive speed with 2.5 m/s turns" },
};

export type MovementCategory = "forward" | "diagonal" | "turn90" | "turn180" | "turn45" | "control";

export function getMovementCategory(type: number): MovementCategory {
  if (type === 1) return "forward";
  if (type === 2) return "diagonal";
  if (type === 5 || type === 6 || type === 18 || type === 19) return "turn90";
  if (type === 9 || type === 10 || type === 17 || type === 20) return "turn180";
  if (type === 3 || type === 4 || (type >= 7 && type <= 8) || (type >= 11 && type <= 16)) return "turn45";
  return "control";
}

export function getMovementColor(type: number): string {
  const cat = getMovementCategory(type);
  switch (cat) {
    case "forward":
      return "#76c0b3"; // Seafoam
    case "diagonal":
      return "#a8aee8"; // Dusk Iris
    case "turn90":
      return "#e5b974"; // Soft Amber
    case "turn180":
      return "#f08da0"; // Flamingo
    case "turn45":
      return "#68b5a7"; // Glacial
    case "control":
    default:
      return "#849caa"; // Content Secondary
  }
}

export interface PathMovement {
  type: number;
  name: string;
  count: number;
  wpStart: number;
  wpEnd: number;
  endAngleDeg: number;
  color: string;
  category: MovementCategory;
}

export interface Waypoint {
  x: number;
  y: number;
  movementIdx: number;
}

export interface TurnBreakdown {
  turns90: number;
  turns180: number;
  turns45: number;
  diagonals: number;
  forwards: number;
}

export interface ModeSummary {
  movements: PathMovement[];
  waypoints: Waypoint[];
  distanceMm: number;
  estimatedTimeS: number;
  turnBreakdown: TurnBreakdown;
}

export interface AlgorithmResult {
  name: string;
  type: "time_based" | "classic";
  steps: number;
  movements: PathMovement[];
  waypoints: Waypoint[];
  distanceMm: number;
  estimatedTimeS: number;
  turnBreakdown: TurnBreakdown;
}

let wasmLoaded = $state(false);
let wasmFileName = $state<string | null>(null);
let wasmInstance: WebAssembly.Instance | null = null;

let algorithmType = $state<"classic" | "time_based">("time_based");
let speedPreset = $state<SpeedPreset>("fast");
let movementMode = $state<"normal" | "smooth" | "diagonals">("diagonals");

let showDistances = $state(true);
let showHeatmap = $state(true);
let showPath = $state(true);
let compareAlgorithms = $state(false);

export type GoalTarget =
  | { type: "center" }
  | { type: "single"; x: number; y: number }
  | { type: "junction"; x: number; y: number };

export type HoverGoalTarget =
  | { type: "single"; x: number; y: number }
  | { type: "junction"; x: number; y: number; cx: number; cy: number };

export type GoalInput =
  | GoalTarget
  | HoverGoalTarget
  | { x: number; y: number }
  | null;

let startPos = $state<{ x: number; y: number }>({ x: 0, y: 0 });
let goalTarget = $state<GoalTarget>({ type: "center" });
let isPickingGoal = $state(false);
let hoverTarget = $state<HoverGoalTarget | null>(null);

function setGoal(target: GoalInput) {
  if (!target || (typeof target === "object" && "type" in target && target.type === "center")) {
    goalTarget = { type: "center" };
    log.info("Target goal reset to Center (4 cells)");
  } else if (typeof target === "object" && "type" in target && target.type === "junction") {
    if (target.x === 8 && target.y === 8) {
      goalTarget = { type: "center" };
      log.info("Target goal set to Center (4 cells)");
    } else {
      goalTarget = { type: "junction", x: target.x, y: target.y };
      log.info(`Target goal set to 4-cell junction at (${target.x}, ${target.y})`);
    }
  } else {
    const x = "x" in target ? target.x : 7;
    const y = "y" in target ? target.y : 7;
    goalTarget = { type: "single", x, y };
    log.info(`Target goal set to (${x}, ${y})`);
  }
  recompute();
}

let distances = $state<number[][]>(
  Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(255)),
);

let movements = $state<PathMovement[]>([]);
let waypoints = $state<Waypoint[]>([]);
let estimatedTimeS = $state(0.0);
let totalDistanceMm = $state(0.0);
let pathStepCount = $state(0);
let turnBreakdown = $state<TurnBreakdown>({
  turns90: 0,
  turns180: 0,
  turns45: 0,
  diagonals: 0,
  forwards: 0,
});

let comparisonData = $state<{
  timeBased: AlgorithmResult | null;
  classic: AlgorithmResult | null;
}>({
  timeBased: null,
  classic: null,
});

// Selection State
let selectedMovementIndex = $state<number | null>(null);

async function loadWasmBuffer(buffer: ArrayBuffer, name = "fujin_algorithms.wasm") {
  try {
    const { instance } = await WebAssembly.instantiate(buffer);
    wasmInstance = instance;
    const exports = wasmInstance.exports as any;
    if (exports._initialize) {
      exports._initialize();
    }
    wasmLoaded = true;
    wasmFileName = name;
    log.info(`Algorithm WASM loaded successfully: ${name}`);
    recompute();
  } catch (err: any) {
    log.error(`Failed to load WASM module: ${err.message || err}`);
    console.error(err);
  }
}

async function loadWasmFile(file: File) {
  const buffer = await file.arrayBuffer();
  await loadWasmBuffer(buffer, file.name);
}

function recompute() {
  if (!wasmInstance || !wasmLoaded) {
    return;
  }

  const exports = wasmInstance.exports as any;
  if (!exports.wasm_set_walls_from_arrays) {
    return;
  }

  // 1. Serialize horizontal & vertical walls to Uint8Array
  const hWalls = new Uint8Array(17 * 16);
  const vWalls = new Uint8Array(16 * 17);

  const { horizontalWalls, verticalWalls } = maze.state;

  for (let r = 0; r < 17; r++) {
    for (let c = 0; c < 16; c++) {
      hWalls[r * 16 + c] = horizontalWalls[r]?.[c] ? 1 : 0;
    }
  }

  for (let r = 0; r < 16; r++) {
    for (let c = 0; c < 17; c++) {
      vWalls[r * 17 + c] = verticalWalls[r]?.[c] ? 1 : 0;
    }
  }

  // 2. Write to WASM memory buffer
  const mem = new Uint8Array(exports.memory.buffer);
  const hOff = 2048;
  const vOff = 2048 + 17 * 16;
  mem.set(hWalls, hOff);
  mem.set(vWalls, vOff);

  exports.wasm_set_walls_from_arrays(hOff, vOff);

  // 3. Prepare goals and run distance flood fill
  let targetGoals: Array<{ x: number; y: number }>;
  if (goalTarget.type === "junction") {
    const { x, y } = goalTarget;
    targetGoals = [
      { x: x - 1, y: y - 1 },
      { x: x - 1, y: y },
      { x: x, y: y - 1 },
      { x: x, y: y },
    ];
  } else if (goalTarget.type === "single") {
    targetGoals = [{ x: goalTarget.x, y: goalTarget.y }];
  } else {
    targetGoals = [
      { x: 7, y: 7 },
      { x: 7, y: 8 },
      { x: 8, y: 7 },
      { x: 8, y: 8 },
    ];
  }

  const goalsOffset = 1024;
  const goalsView = new Int32Array(exports.memory.buffer, goalsOffset, targetGoals.length * 2);
  for (let i = 0; i < targetGoals.length; i++) {
    goalsView[i * 2] = targetGoals[i].x;
    goalsView[i * 2 + 1] = targetGoals[i].y;
  }

  exports.wasm_run_flood_fill(goalsOffset, targetGoals.length, 0);

  // Read distances into 2D array [r][c] (where r = 15 - y, c = x)
  const newDistances: number[][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    newDistances[r] = [];
    const y = 15 - r;
    for (let c = 0; c < GRID_SIZE; c++) {
      const x = c;
      newDistances[r][c] = exports.wasm_get_cell_distance(x, y);
    }
  }
  distances = newDistances;

  // 4. Helper to extract movements and waypoints for a computed path
  const modeIdx = movementMode === "normal" ? 0 : movementMode === "smooth" ? 1 : 2;

  function extractPathData(
    estTime: number,
    steps: number,
    name: string,
    type: "time_based" | "classic",
  ): AlgorithmResult {
    const moveCount = exports.wasm_compute_movements(startPos.x, startPos.y, modeIdx);

    const pathDirs: number[] = [];
    for (let i = 0; i < steps; i++) {
      pathDirs.push(exports.wasm_get_path_dir(i));
    }

    const rawMoves: Array<{ type: number; count: number }> = [];
    for (let i = 0; i < moveCount; i++) {
      rawMoves.push({
        type: exports.wasm_get_movement_type(i),
        count: exports.wasm_get_movement_count(i),
      });
    }

    const traj = generateTrajectory(startPos, pathDirs, rawMoves);

    const moves: PathMovement[] = [];
    let t90 = 0;
    let t180 = 0;
    let t45 = 0;
    let diag = 0;
    let fwd = 0;

    for (let i = 0; i < rawMoves.length; i++) {
      const typeCode = rawMoves[i].type;
      const count = rawMoves[i].count;
      const mMeta = traj.movementMeta[i] || { wpStart: 0, wpEnd: 0, endAngleDeg: 0 };
      const category = getMovementCategory(typeCode);
      const color = getMovementColor(typeCode);

      moves.push({
        type: typeCode,
        name: MOVEMENT_NAMES[typeCode] || `UNKNOWN(${typeCode})`,
        count,
        wpStart: mMeta.wpStart,
        wpEnd: mMeta.wpEnd,
        endAngleDeg: mMeta.endAngleDeg,
        color,
        category,
      });

      if (category === "forward") fwd += count;
      else if (category === "diagonal") diag += count;
      else if (category === "turn90") t90 += count;
      else if (category === "turn180") t180 += count;
      else if (category === "turn45") t45 += count;
    }

    return {
      name,
      type,
      steps,
      movements: moves,
      waypoints: traj.waypoints,
      distanceMm: traj.totalDistanceMm,
      estimatedTimeS: estTime,
      turnBreakdown: { turns90: t90, turns180: t180, turns45: t45, diagonals: diag, forwards: fwd },
    };
  }

  // 5. Run both algorithms so they can be compared directly
  const speedMode = SPEED_PRESET_MAP[speedPreset] ?? 5;

  // 5a. Time-Based Flood Fill
  const timeSteps = exports.wasm_run_time_flood_fill(startPos.x, startPos.y, goalsOffset, targetGoals.length, speedMode);
  const timeEstTime = exports.wasm_get_estimated_time_s();
  const timeResult = extractPathData(timeEstTime, timeSteps, "Time-Based", "time_based");

  // 5b. Classic BFS Flood Fill
  const classicSteps = exports.wasm_trace_classic_path(startPos.x, startPos.y, goalsOffset, targetGoals.length, speedMode);
  const classicEstTime = exports.wasm_get_estimated_time_s();
  const classicResult = extractPathData(classicEstTime, classicSteps, "Classic BFS", "classic");

  comparisonData = {
    timeBased: timeResult,
    classic: classicResult,
  };

  // 6. Set active display data based on algorithmType
  const active = algorithmType === "classic" ? classicResult : timeResult;
  movements = active.movements;
  waypoints = active.waypoints;
  totalDistanceMm = active.distanceMm;
  estimatedTimeS = active.estimatedTimeS;
  pathStepCount = active.steps;
  turnBreakdown = active.turnBreakdown;

  // Adjust selection if out of bounds
  if (selectedMovementIndex !== null && selectedMovementIndex >= movements.length) {
    selectedMovementIndex = null;
  }
}

export const algorithm = {
  get wasmLoaded() {
    return wasmLoaded;
  },
  get wasmFileName() {
    return wasmFileName;
  },
  get algorithmType() {
    return algorithmType;
  },
  set algorithmType(val) {
    algorithmType = val;
    recompute();
  },
  get speedPreset() {
    return speedPreset;
  },
  set speedPreset(val: SpeedPreset) {
    speedPreset = val;
    recompute();
  },
  get movementMode() {
    return movementMode;
  },
  set movementMode(val) {
    movementMode = val;
    recompute();
  },
  get showDistances() {
    return showDistances;
  },
  set showDistances(val) {
    showDistances = val;
  },
  get showHeatmap() {
    return showHeatmap;
  },
  set showHeatmap(val) {
    showHeatmap = val;
  },
  get showPath() {
    return showPath;
  },
  set showPath(val) {
    showPath = val;
  },
  get compareAlgorithms() {
    return compareAlgorithms;
  },
  set compareAlgorithms(val) {
    compareAlgorithms = val;
  },
  get compareAllModes() {
    return compareAlgorithms;
  },
  set compareAllModes(val) {
    compareAlgorithms = val;
  },
  get startPos() {
    return startPos;
  },
  set startPos(val) {
    startPos = val;
    recompute();
  },
  get goalTarget() {
    return goalTarget;
  },
  set goalTarget(val: GoalTarget) {
    setGoal(val);
  },
  get goalPos() {
    if (goalTarget.type === "single") {
      return { x: goalTarget.x, y: goalTarget.y };
    }
    return null;
  },
  set goalPos(val: { x: number; y: number } | null) {
    setGoal(val ? { type: "single", x: val.x, y: val.y } : null);
  },
  get distances() {
    return distances;
  },
  get movements() {
    return movements;
  },
  get waypoints() {
    return waypoints;
  },
  get estimatedTimeS() {
    return estimatedTimeS;
  },
  get totalDistanceMm() {
    return totalDistanceMm;
  },
  get pathStepCount() {
    return pathStepCount;
  },
  get turnBreakdown() {
    return turnBreakdown;
  },
  get comparisonData() {
    return comparisonData;
  },

  // Selection
  get selectedMovementIndex() {
    return selectedMovementIndex;
  },
  set selectedMovementIndex(val) {
    selectedMovementIndex = val;
  },

  // Goal Picking
  get isPickingGoal() {
    return isPickingGoal;
  },
  set isPickingGoal(val: boolean) {
    isPickingGoal = val;
  },
  get hoverTarget() {
    return hoverTarget;
  },
  set hoverTarget(val: HoverGoalTarget | null) {
    hoverTarget = val;
  },
  get hoverCell() {
    if (hoverTarget?.type === "single") {
      return { x: hoverTarget.x, y: hoverTarget.y };
    }
    return null;
  },
  setGoal,

  // Methods
  loadWasmFile,
  loadWasmBuffer,
  recompute,
};
