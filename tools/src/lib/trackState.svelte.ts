import { log } from "./logsState.svelte";

export interface TrackPoint {
  x: number;
  y: number;
}

export interface TrackState {
  points: TrackPoint[];
}

function createInitialTrackState(): TrackState {
  return {
    points: [],
  };
}

let state = $state<TrackState>(createInitialTrackState());

function load(coordinates: string) {
  const lines = coordinates.trim().split(/[\r\n]+/);
  const points: TrackPoint[] = [];

  for (const line of lines) {
    const [xStr, yStr] = line.split(",");
    const x = parseFloat(xStr);
    const y = parseFloat(yStr);

    if (isNaN(x) || isNaN(y)) {
      log.error("Invalid coordinate in track file");
      return;
    }

    points.push({ x, y });
  }

  state.points = points;
  log.info(`Track loaded: ${points.length} points`);
}

export const track = {
  get state() {
    return state;
  },

  load,
};
