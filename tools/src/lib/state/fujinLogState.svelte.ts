import { log } from "./logsState.svelte";
import { robotLog, type RobotLogRecord } from "./robotLogState.svelte";

export type FujinLogMode = "control" | "sensor";

export interface LogMetrics {
  samples: number;
  durationMs: number;
  maxVel: number;
  maxAngVel: number;
  minBatt: number;
}

const HEADER_KEY_MAP: Record<string, string> = {
  t: "time",
  time: "time",
  "time(ms)": "time",
  vel: "lin_vel_act",
  actuallinearvel: "lin_vel_act",
  lin_vel_act: "lin_vel_act",
  tgtvel: "lin_vel_tgt",
  targetlinearvel: "lin_vel_tgt",
  lin_vel_tgt: "lin_vel_tgt",
  angvel: "ang_vel_act",
  actualangularvel: "ang_vel_act",
  ang_vel_act: "ang_vel_act",
  tgtangvel: "ang_vel_tgt",
  targetangularvel: "ang_vel_tgt",
  ang_vel_tgt: "ang_vel_tgt",
  pwm_l: "pwm_left",
  pwml: "pwm_left",
  pwm_left: "pwm_left",
  pwm_r: "pwm_right",
  pwmr: "pwm_right",
  pwm_right: "pwm_right",
  imudiff: "imu_diff",
  imu_diff: "imu_diff",
  posx: "pos_x",
  "posx(m)": "pos_x",
  pos_x: "pos_x",
  posy: "pos_y",
  "posy(m)": "pos_y",
  pos_y: "pos_y",
  angle: "angle",
  "angle(rad)": "angle",
  dist: "dist",
  sensl: "sens_l",
  "sensl(mm)": "sens_l",
  sens_l: "sens_l",
  sensfl: "sens_fl",
  "sensfl(mm)": "sens_fl",
  sens_fl: "sens_fl",
  sensfr: "sens_fr",
  "sensfr(mm)": "sens_fr",
  sens_fr: "sens_fr",
  sensr: "sens_r",
  "sensr(mm)": "sens_r",
  sens_r: "sens_r",
  velp: "vel_p",
  vel_p: "vel_p",
  veli: "vel_i",
  vel_i: "vel_i",
  angp: "ang_p",
  ang_p: "ang_p",
  angi: "ang_i",
  ang_i: "ang_i",
  rotff: "rotation_ff",
  rotationff: "rotation_ff",
  rotation_ff: "rotation_ff",
  linff: "linear_ff",
  linearff: "linear_ff",
  linear_ff: "linear_ff",
  batt_mv: "battery",
  "battery(mv)": "battery",
  battery: "battery",
  batt: "battery",
};

const CONTROL_ONLY_KEYS = new Set(["vel_p", "ang_p", "rotation_ff"]);
const SENSOR_ONLY_KEYS = new Set(["sens_l", "sens_fl", "pos_x"]);

const FALLBACK_LAYOUTS: Record<number, Array<{ mode: FujinLogMode; keys: string[] }>> = {
  16: [
    {
      mode: "sensor",
      keys: [
        "time",
        "lin_vel_act",
        "lin_vel_tgt",
        "ang_vel_act",
        "ang_vel_tgt",
        "pwm_left",
        "pwm_right",
        "imu_diff",
        "pos_x",
        "pos_y",
        "angle",
        "dist",
        "sens_l",
        "sens_fl",
        "sens_fr",
        "sens_r",
      ],
    },
  ],
  15: [
    {
      mode: "control",
      keys: [
        "time",
        "lin_vel_act",
        "lin_vel_tgt",
        "ang_vel_act",
        "ang_vel_tgt",
        "pwm_left",
        "pwm_right",
        "imu_diff",
        "vel_p",
        "vel_i",
        "ang_p",
        "ang_i",
        "rotation_ff",
        "linear_ff",
        "battery",
      ],
    },
  ],
  14: [
    {
      mode: "control",
      keys: [
        "time",
        "lin_vel_act",
        "lin_vel_tgt",
        "ang_vel_act",
        "ang_vel_tgt",
        "pwm_left",
        "pwm_right",
        "imu_diff",
        "vel_p",
        "vel_i",
        "ang_p",
        "ang_i",
        "rotation_ff",
        "linear_ff",
      ],
    },
  ],
  13: [
    {
      mode: "sensor",
      keys: [
        "time",
        "lin_vel_act",
        "lin_vel_tgt",
        "ang_vel_act",
        "ang_vel_tgt",
        "pwm_left",
        "pwm_right",
        "imu_diff",
        "battery",
        "pos_x",
        "pos_y",
        "angle",
        "dist",
      ],
    },
    {
      mode: "control",
      keys: [
        "time",
        "lin_vel_act",
        "lin_vel_tgt",
        "ang_vel_act",
        "ang_vel_tgt",
        "pwm_left",
        "pwm_right",
        "imu_diff",
        "vel_p",
        "vel_i",
        "ang_p",
        "ang_i",
        "rotation_ff",
      ],
    },
  ],
};

function normalizeToken(token: string): string | null {
  const clean = token.split("(")[0].trim().toLowerCase();
  if (HEADER_KEY_MAP[clean]) return HEADER_KEY_MAP[clean];
  const cleanNopunct = token.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  return HEADER_KEY_MAP[cleanNopunct] || null;
}

function parseHeaderLine(line: string, expectedCount: number): string[] | null {
  const keys = line
    .split(";")
    .map((p) => normalizeToken(p))
    .filter((k): k is string => Boolean(k));
  if (keys.length === expectedCount) {
    return keys;
  }
  return null;
}

export interface ParsedFujinLog {
  fileName: string;
  mode: FujinLogMode;
  series: Record<string, number[]>;
  metrics: LogMetrics;
}

let activeLog = $state<ParsedFujinLog | null>(null);

function parseLogContent(content: string, fileName = "log.txt"): ParsedFujinLog | null {
  const rawLines = content.split(/\r?\n/).map((l) => l.trim()).filter((l) => Boolean(l));
  if (rawLines.length === 0) return null;

  const headerLines: string[] = [];
  const dataLines: string[] = [];
  let inParamBlock = false;

  for (const line of rawLines) {
    if (line.startsWith("general_params = {") || line.startsWith("movement_params = {")) {
      inParamBlock = true;
      continue;
    }
    if (inParamBlock) {
      if (line.startsWith("};") || line === "}") {
        inParamBlock = false;
      }
      continue;
    }

    const parts = line.split(";").map((p) => p.trim()).filter((p) => p.length > 0);
    if (parts.length >= 8 && parts.every((p) => !isNaN(Number(p)))) {
      dataLines.push(line);
    } else {
      headerLines.push(line);
    }
  }

  if (dataLines.length === 0) return null;

  const colsCount = dataLines[0].split(";").map((p) => p.trim()).filter((p) => p.length > 0).length;

  let resolvedKeys: string[] | null = null;
  for (let i = headerLines.length - 1; i >= 0; i--) {
    const parsed = parseHeaderLine(headerLines[i], colsCount);
    if (parsed) {
      resolvedKeys = parsed;
      break;
    }
  }

  if (!resolvedKeys) {
    const layoutCandidates = FALLBACK_LAYOUTS[colsCount];
    if (layoutCandidates && layoutCandidates.length > 0) {
      if (layoutCandidates.length === 1) {
        resolvedKeys = layoutCandidates[0].keys;
      } else {
        const looksPositional = headerLines.some(
          (h) => h.toLowerCase().includes("pos") || h.toLowerCase().includes("dist")
        );
        resolvedKeys = looksPositional ? layoutCandidates[0].keys : layoutCandidates[1].keys;
      }
    }
  }

  if (!resolvedKeys || resolvedKeys.length !== colsCount) {
    log.error(`Unknown column layout (${colsCount} cols) in ${fileName}`);
    return null;
  }

  // Detect mode
  const keySet = new Set(resolvedKeys);
  let mode: FujinLogMode = "control";
  for (const k of SENSOR_ONLY_KEYS) {
    if (keySet.has(k)) {
      mode = "sensor";
      break;
    }
  }
  if (mode !== "sensor") {
    for (const k of CONTROL_ONLY_KEYS) {
      if (keySet.has(k)) {
        mode = "control";
        break;
      }
    }
  }

  const series: Record<string, number[]> = {};
  for (const key of resolvedKeys) {
    series[key] = [];
  }

  for (const line of dataLines) {
    const parts = line.split(";").map((p) => p.trim()).filter((p) => p.length > 0);
    if (parts.length < colsCount) continue;
    for (let c = 0; c < colsCount; c++) {
      const val = parseFloat(parts[c]);
      series[resolvedKeys[c]].push(isNaN(val) ? 0 : val);
    }
  }

  const timeArr = series["time"] || [];
  if (timeArr.length === 0) return null;

  const velArr = series["lin_vel_act"] || [];
  const angArr = series["ang_vel_act"] || [];
  const battArr = series["battery"] || [];

  const metrics: LogMetrics = {
    samples: timeArr.length,
    durationMs: timeArr.length > 0 ? timeArr[timeArr.length - 1] - timeArr[0] : 0,
    maxVel: velArr.length > 0 ? Math.max(...velArr) : 0,
    maxAngVel: angArr.length > 0 ? Math.max(...angArr.map((v) => Math.abs(v))) : 0,
    minBatt: battArr.length > 0 ? Math.min(...battArr) : 0,
  };

  // Convert to RobotLogRecord for Maze dots overlay
  const hasPos = series["pos_x"] && series["pos_y"] && series["pos_x"].length === timeArr.length;
  if (hasPos) {
    const posXArr = series["pos_x"];
    const posYArr = series["pos_y"];
    const distArr = series["dist"] || [];
    const angleArr = series["angle"] || [];

    // Check if posX/posY are in meters (< 10) or mm
    const maxVal = Math.max(...posXArr.map((x) => Math.abs(x)), ...posYArr.map((y) => Math.abs(y)));
    const scaleToMm = maxVal < 10.0 ? 1000.0 : 1.0;

    // Check if angle is in degrees or radians
    const maxAbsAngle = angleArr.length > 0 ? Math.max(...angleArr.map((a) => Math.abs(a))) : 0;
    const angleToRad = maxAbsAngle > 7.0 ? Math.PI / 180.0 : 1.0;

    // Robot starts against the South wall of cell (0, 0), facing North
    // Center of cell (0, 0) is (0, 0) in relative mm.
    // Back wall offset is ~17.5 mm below cell center.
    let segStartX = 0.0;
    let segStartY = -17.5;
    let segStartHeading = Math.PI / 2.0; // 90 deg = North (+Y)

    let prevDist = (distArr[0] ?? 0) * scaleToMm;
    let prevPx = (posXArr[0] ?? 0) * scaleToMm;
    let currentHeading = segStartHeading;

    const robotRecords: RobotLogRecord[] = [];

    for (let idx = 0; idx < timeArr.length; idx++) {
      const rawDist = (distArr[idx] ?? 0) * scaleToMm;
      const rawPx = (posXArr[idx] ?? 0) * scaleToMm;
      const rawPy = (posYArr[idx] ?? 0) * scaleToMm;
      const rawAng = angleArr[idx] ?? 0;

      // Detect cell movement reset
      const isReset = idx > 0 && (rawDist < prevDist - 15.0 || rawPx < prevPx - 15.0);
      if (isReset && robotRecords.length > 0) {
        const last = robotRecords[idx - 1];
        segStartX = last.PosX;
        segStartY = last.PosY;
        segStartHeading = currentHeading;
      }

      // Handle encoder logger saturation for position_mm_x (> 245 mm)
      let localX = rawPx;
      if (localX >= 245.0 && rawDist > localX) {
        localX = rawDist;
      }
      const localY = rawPy;

      const sampleAngRad = rawAng * angleToRad;
      currentHeading = segStartHeading + sampleAngRad;

      // Transform local displacement to continuous global coordinates (relative to cell 0,0 center)
      const globalX = segStartX + localX * Math.cos(segStartHeading) - localY * Math.sin(segStartHeading);
      const globalY = segStartY + localX * Math.sin(segStartHeading) + localY * Math.cos(segStartHeading);

      robotRecords.push({
        t: timeArr[idx],
        Vel: series["lin_vel_act"]?.[idx] ?? 0,
        TgtVel: series["lin_vel_tgt"]?.[idx] ?? 0,
        AngVel: series["ang_vel_act"]?.[idx] ?? 0,
        TgtAngVel: series["ang_vel_tgt"]?.[idx] ?? 0,
        PWM_L: series["pwm_left"]?.[idx] ?? 0,
        PWM_R: series["pwm_right"]?.[idx] ?? 0,
        Batt_mV: series["battery"]?.[idx] ?? 0,
        PosX: globalX,
        PosY: globalY,
        Angle: rawAng,
        Dist: rawDist,
      });

      prevDist = rawDist;
      prevPx = rawPx;
    }

    robotLog.load(robotRecords);
  } else {
    robotLog.clear();
  }

  return {
    fileName,
    mode,
    series,
    metrics,
  };
}

export const fujinLog = {
  get active() {
    return activeLog;
  },

  get hasData() {
    return activeLog !== null && (activeLog.series["time"]?.length ?? 0) > 0;
  },

  get mode(): FujinLogMode {
    return activeLog?.mode ?? "control";
  },

  get fileName(): string {
    return activeLog?.fileName ?? "";
  },

  get metrics(): LogMetrics | null {
    return activeLog?.metrics ?? null;
  },

  get series(): Record<string, number[]> {
    return activeLog?.series ?? {};
  },

  loadText(content: string, fileName = "log.txt"): boolean {
    const parsed = parseLogContent(content, fileName);
    if (!parsed) {
      log.error(`Failed to parse Fujin log: ${fileName}`);
      return false;
    }
    activeLog = parsed;
    log.info(`Fujin log loaded: ${fileName} (${parsed.mode.toUpperCase()} mode, ${parsed.metrics.samples} samples)`);
    return true;
  },

  async loadFile(file: File): Promise<boolean> {
    const text = await file.text();
    return this.loadText(text, file.name);
  },

  async loadFromVault(name: string): Promise<boolean> {
    try {
      const res = await fetch(`/logs/fujin/${name}.txt`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      return this.loadText(text, `${name}.txt`);
    } catch (err: any) {
      log.error(`Failed to load vault log: ${name}`);
      console.error(err);
      return false;
    }
  },

  clear() {
    activeLog = null;
    robotLog.clear();
    log.info("Fujin log cleared");
  },
};
