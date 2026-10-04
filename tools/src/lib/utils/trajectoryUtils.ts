export interface Point {
  x: number;
  y: number;
}

export interface TrajectoryWaypoint {
  x: number;
  y: number;
  movementIdx: number;
}

export interface MovementMeta {
  wpStart: number;
  wpEnd: number;
  endAngleDeg: number;
}

export interface TrajectoryResult {
  waypoints: TrajectoryWaypoint[];
  movementMeta: MovementMeta[];
  totalDistanceMm: number;
}

// Direction definitions matching C++ types.hpp
// NORTH = 0, WEST = 1, SOUTH = 2, EAST = 3, STOP = 4
const DIR_DELTA: Record<number, Point> = {
  0: { x: 0, y: 1 },  // NORTH
  1: { x: -1, y: 0 }, // WEST
  2: { x: 0, y: -1 }, // SOUTH
  3: { x: 1, y: 0 },  // EAST
};

// Movement enum values matching C++ types.hpp
export const MovementEnum = {
  START: 0,
  FORWARD: 1,
  DIAGONAL: 2,
  TURN_RIGHT_45: 3,
  TURN_LEFT_45: 4,
  TURN_RIGHT_90: 5,
  TURN_LEFT_90: 6,
  TURN_RIGHT_135: 7,
  TURN_LEFT_135: 8,
  TURN_RIGHT_180: 9,
  TURN_LEFT_180: 10,
  TURN_RIGHT_45_FROM_45: 11,
  TURN_LEFT_45_FROM_45: 12,
  TURN_RIGHT_90_FROM_45: 13,
  TURN_LEFT_90_FROM_45: 14,
  TURN_RIGHT_135_FROM_45: 15,
  TURN_LEFT_135_FROM_45: 16,
  TURN_AROUND: 17,
  TURN_RIGHT_90_SEARCH: 18,
  TURN_LEFT_90_SEARCH: 19,
  TURN_AROUND_INPLACE: 20,
  STOP: 21,
} as const;

function add90Arc(
  wps: TrajectoryWaypoint[],
  Tin: Point,
  Tout: Point,
  Pcell: Point,
  mIdx: number,
  samples = 5
) {
  const Cpeg = {
    x: Tin.x + (Tout.x - Pcell.x),
    y: Tin.y + (Tout.y - Pcell.y),
  };
  const u = { x: Tin.x - Cpeg.x, y: Tin.y - Cpeg.y };
  const v = { x: Tout.x - Cpeg.x, y: Tout.y - Cpeg.y };

  for (let i = 1; i <= samples; i++) {
    const t = i / samples;
    const theta = t * (Math.PI * 0.5);
    const px = Cpeg.x + u.x * Math.cos(theta) + v.x * Math.sin(theta);
    const py = Cpeg.y + u.y * Math.cos(theta) + v.y * Math.sin(theta);
    wps.push({ x: px, y: py, movementIdx: mIdx });
  }
}

function add180Arc(
  wps: TrajectoryWaypoint[],
  Tin: Point,
  Tout: Point,
  Pcell1: Point,
  mIdx: number,
  samples = 6
) {
  const Cpeg = {
    x: (Tin.x + Tout.x) * 0.5,
    y: (Tin.y + Tout.y) * 0.5,
  };
  const u = { x: Tin.x - Cpeg.x, y: Tin.y - Cpeg.y };
  const dir = { x: Pcell1.x - Tin.x, y: Pcell1.y - Tin.y };
  const dirLen = Math.hypot(dir.x, dir.y);
  let w = { x: 0, y: 0 };
  if (dirLen > 0.001) {
    w = {
      x: (dir.x / dirLen) * 90.0,
      y: (dir.y / dirLen) * 90.0,
    };
  }

  for (let i = 1; i <= samples; i++) {
    const t = i / samples;
    const theta = t * Math.PI;
    const px = Cpeg.x + u.x * Math.cos(theta) + w.x * Math.sin(theta);
    const py = Cpeg.y + u.y * Math.cos(theta) + w.y * Math.sin(theta);
    wps.push({ x: px, y: py, movementIdx: mIdx });
  }
}

export function generateTrajectory(
  startPos: Point,
  pathDirs: number[],
  movements: Array<{ type: number; count: number }>
): TrajectoryResult {
  const wps: TrajectoryWaypoint[] = [];
  const meta: MovementMeta[] = [];

  // 1. Reconstruct cell sequence from startPos and pathDirs
  const pathCells: Point[] = [{ x: startPos.x, y: startPos.y }];
  let curr = { x: startPos.x, y: startPos.y };

  for (const d of pathDirs) {
    const delta = DIR_DELTA[d];
    if (!delta) break;
    curr = { x: curr.x + delta.x, y: curr.y + delta.y };
    pathCells.push(curr);
  }

  if (pathCells.length === 0) {
    return { waypoints: [], movementMeta: [], totalDistanceMm: 0 };
  }

  // 2. Cell centers P(k) in millimeters (each cell is 180mm x 180mm)
  const P = (k: number): Point => {
    const idx = Math.max(0, Math.min(pathCells.length - 1, k));
    return {
      x: pathCells[idx].x * 180.0 + 90.0,
      y: pathCells[idx].y * 180.0 + 90.0,
    };
  };

  // 3. Division midpoints T[k] between cell k and cell k+1
  const numT = Math.max(0, pathCells.length - 1);
  const T: Point[] = [];
  for (let k = 0; k < numT; k++) {
    const pk = P(k);
    const pk1 = P(k + 1);
    T.push({
      x: (pk.x + pk1.x) * 0.5,
      y: (pk.y + pk1.y) * 0.5,
    });
  }

  const getT = (k: number): Point => {
    if (numT <= 0) return P(0);
    if (k < 0) return T[0];
    if (k >= numT) return T[numT - 1];
    return T[k];
  };

  // Robot start point at cell center P(0)
  wps.push({ x: P(0).x, y: P(0).y, movementIdx: 0 });
  let curT = 0;

  // 4. Generate waypoints for each movement
  for (let mIdx = 0; mIdx < movements.length; mIdx++) {
    const { type: m, count } = movements[mIdx];
    const wpStart = Math.max(0, wps.length - 1);

    if (m === MovementEnum.START) {
      wps.push({ x: getT(0).x, y: getT(0).y, movementIdx: mIdx });
      curT = 0;
    } else if (m === MovementEnum.STOP) {
      const pGoal = P(pathCells.length - 1);
      wps.push({ x: pGoal.x, y: pGoal.y, movementIdx: mIdx });
    } else if (m === MovementEnum.FORWARD) {
      for (let i = 0; i < count; i++) {
        curT++;
        wps.push({ x: getT(curT).x, y: getT(curT).y, movementIdx: mIdx });
      }
    } else if (
      m === MovementEnum.TURN_RIGHT_90 ||
      m === MovementEnum.TURN_LEFT_90 ||
      m === MovementEnum.TURN_RIGHT_90_SEARCH ||
      m === MovementEnum.TURN_LEFT_90_SEARCH
    ) {
      const Tin = getT(curT);
      curT++;
      const Tout = getT(curT);
      const Pcell = P(curT);
      add90Arc(wps, Tin, Tout, Pcell, mIdx, 5);
    } else if (
      m === MovementEnum.TURN_RIGHT_180 ||
      m === MovementEnum.TURN_LEFT_180 ||
      m === MovementEnum.TURN_AROUND ||
      m === MovementEnum.TURN_AROUND_INPLACE
    ) {
      const Tin = getT(curT);
      const Pcell1 = P(curT + 1);
      curT += 2;
      const Tout = getT(curT);
      add180Arc(wps, Tin, Tout, Pcell1, mIdx, 6);
    } else if (m === MovementEnum.TURN_RIGHT_45 || m === MovementEnum.TURN_LEFT_45) {
      curT++;
      wps.push({ x: getT(curT).x, y: getT(curT).y, movementIdx: mIdx });
    } else if (m === MovementEnum.DIAGONAL) {
      for (let i = 0; i < count; i++) {
        curT++;
        wps.push({ x: getT(curT).x, y: getT(curT).y, movementIdx: mIdx });
      }
    } else if (
      m === MovementEnum.TURN_RIGHT_45_FROM_45 ||
      m === MovementEnum.TURN_LEFT_45_FROM_45
    ) {
      curT++;
      wps.push({ x: getT(curT).x, y: getT(curT).y, movementIdx: mIdx });
    } else if (
      m === MovementEnum.TURN_RIGHT_90_FROM_45 ||
      m === MovementEnum.TURN_LEFT_90_FROM_45
    ) {
      curT++;
      wps.push({ x: getT(curT).x, y: getT(curT).y, movementIdx: mIdx });
      curT++;
      wps.push({ x: getT(curT).x, y: getT(curT).y, movementIdx: mIdx });
    } else if (m === MovementEnum.TURN_RIGHT_135 || m === MovementEnum.TURN_LEFT_135) {
      curT++;
      wps.push({ x: getT(curT).x, y: getT(curT).y, movementIdx: mIdx });
      curT++;
      wps.push({ x: getT(curT).x, y: getT(curT).y, movementIdx: mIdx });
    } else if (
      m === MovementEnum.TURN_RIGHT_135_FROM_45 ||
      m === MovementEnum.TURN_LEFT_135_FROM_45
    ) {
      curT++;
      wps.push({ x: getT(curT).x, y: getT(curT).y, movementIdx: mIdx });
      curT++;
      wps.push({ x: getT(curT).x, y: getT(curT).y, movementIdx: mIdx });
    }

    const wpEnd = Math.max(wpStart, wps.length - 1);
    let endAngleDeg = 0;
    if (wps.length >= 2) {
      const p1 = wps[wps.length - 2];
      const p2 = wps[wps.length - 1];
      const rad = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      endAngleDeg = (rad * 180) / Math.PI;
    }

    meta.push({
      wpStart,
      wpEnd,
      endAngleDeg,
    });
  }

  // 5. Compute total distance
  let totalDistanceMm = 0;
  for (let i = 1; i < wps.length; i++) {
    totalDistanceMm += Math.hypot(wps[i].x - wps[i - 1].x, wps[i].y - wps[i - 1].y);
  }

  return {
    waypoints: wps,
    movementMeta: meta,
    totalDistanceMm,
  };
}
