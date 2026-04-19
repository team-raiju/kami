import { log } from "$lib/state/logsState.svelte";
import type { TrackPoint } from "../state/trackState.svelte";

export function movingAverage(points: TrackPoint[], k: number = 10): TrackPoint[] {
  const halfK = Math.floor(k / 2);
  const result: TrackPoint[] = [];

  for (let i = 0; i < points.length; i++) {
    if (i < halfK || i >= points.length - halfK) {
      result.push({ ...points[i] });
      continue;
    }

    let sumX = 0;
    let sumY = 0;
    for (let j = i - halfK; j < i + halfK; j++) {
      sumX += points[j].x;
      sumY += points[j].y;
    }

    result.push({
      x: sumX / k,
      y: sumY / k,
    });
  }

  return result;
}

export type PathConfig = {
  window_large: number; // Points to average on straight/gentle curves
  window_small: number; // Points to average on sharp corners
  sharp_angle_th: number; // Angle difference threshold to trigger 'window_small'
  angle_lookahead: number; // Number of points to look ahead/behind to calculate sharpness
  corner_padding: number; // How many points before/after a corner to keep using 'window_small'
};

const ROBOT_CONFIG = {
  acc_straight: 15.0, // Max acceleration on straight lines (m/s^2)
  vmax_straight: 6.0, // Top speed on straight lines (m/s)
  acc_turn: 10.0, // Max acceleration during turns/lane changes (m/s^2)
  vmax_turn: 3.0, // Top speed during turns/lane changes (m/s)
  vturn: 1.0, // Base target velocity for entering corners (m/s)

  // Physics & Limits
  cf: 10.0, // Cornering Force factor (tire grip/friction limit indicator)
  curv_lim: 10.0, // Maximum allowed curvature

  // Geometry & Tolerances
  margin: 0.05, // Safety margin / robot footprint width from the path (meters)
  ang_th: Math.PI / 180.0, // Angle threshold for detecting straight lines (1 degree in radians)
  dl: 0.01, // Resolution/discretization step length for drawing paths (meters)
};

export function getAngle(waypoints: TrackPoint[], index: number, offset: number = 5): number {
  if (index - offset < 0) {
    return getAngle(waypoints, offset, offset);
  } else if (index + offset >= waypoints.length) {
    return getAngle(waypoints, waypoints.length - offset - 1, offset);
  }

  const directionX = waypoints[index + offset].x - waypoints[index - offset].x;
  const directionY = waypoints[index + offset].y - waypoints[index - offset].y;
  return Math.atan2(directionY, directionX);
}

export function smoothPath(originalWaypoints: TrackPoint[], config: PathConfig): TrackPoint[] {
  const lookahead = config.angle_lookahead;
  const smoothedRoute: TrackPoint[] = [...originalWaypoints];
  const dynamicWindowSizes: number[] = [];

  for (let i = 0; i < originalWaypoints.length; i++) {
    let angleDiff = getAngle(originalWaypoints, i + lookahead) - getAngle(originalWaypoints, i - lookahead);
    while (angleDiff > Math.PI) {
      angleDiff -= 2.0 * Math.PI;
    }
    while (angleDiff < -Math.PI) {
      angleDiff += 2.0 * Math.PI;
    }

    if (Math.abs(angleDiff) > config.sharp_angle_th) {
      dynamicWindowSizes.push(config.window_small);
    } else {
      dynamicWindowSizes.push(config.window_large);
    }
  }

  let paddingCounter = 0;
  for (let i = 0; i < originalWaypoints.length; i++) {
    if (dynamicWindowSizes[i] === config.window_small) {
      paddingCounter = config.corner_padding;
    }
    if (paddingCounter > 0) {
      dynamicWindowSizes[i] = config.window_small;
      paddingCounter--;
    }
  }

  paddingCounter = 0;
  for (let i = 0; i < originalWaypoints.length; i++) {
    const idxRev = originalWaypoints.length - 1 - i;
    if (dynamicWindowSizes[idxRev] === config.window_small) {
      paddingCounter = config.corner_padding;
    }
    if (paddingCounter > 0) {
      dynamicWindowSizes[idxRev] = config.window_small;
      paddingCounter--;
    }
  }

  for (let i = 2; i < originalWaypoints.length; i++) {
    const limit = Math.floor(0.5 * (dynamicWindowSizes[i - 2] + dynamicWindowSizes[i - 1])) + 1;
    dynamicWindowSizes[i] = Math.min(dynamicWindowSizes[i], limit);
  }

  for (let i = 2; i < originalWaypoints.length; i++) {
    const idxRev = originalWaypoints.length - 1 - i;
    const limit = Math.floor(0.5 * (dynamicWindowSizes[idxRev + 2] + dynamicWindowSizes[idxRev + 1])) + 1;
    dynamicWindowSizes[idxRev] = Math.min(dynamicWindowSizes[idxRev], limit);
  }

  for (let i = 0; i < originalWaypoints.length; i++) {
    const halfWindow = Math.min(dynamicWindowSizes[i], i, originalWaypoints.length - 1 - i);
    const startIdx = Math.max(0, i - halfWindow);
    const endIdx = Math.min(originalWaypoints.length, i + halfWindow + 1);

    let sumX = 0;
    let sumY = 0;
    let count = 0;
    for (let j = startIdx; j < endIdx; j++) {
      sumX += originalWaypoints[j].x;
      sumY += originalWaypoints[j].y;
      count++;
    }

    smoothedRoute[i] = {
      x: sumX / count,
      y: sumY / count,
    };
  }

  return smoothedRoute;
}

export function arithDiv(value: number, divisor: number): number {
  if (value >= 0.0) {
    return Math.floor(value / divisor);
  } else {
    return Math.ceil(value / divisor);
  }
}

export function courseAngle(waypoints: TrackPoint[], index: number, lookaheadOffset: number = 5): number {
  if (index < lookaheadOffset) {
    return courseAngle(waypoints, lookaheadOffset, lookaheadOffset);
  } else if (index > waypoints.length - lookaheadOffset - 1) {
    return courseAngle(waypoints, waypoints.length - 1 - lookaheadOffset, lookaheadOffset);
  }

  const actualOffset = Math.min(lookaheadOffset, index, waypoints.length - index - 1);
  const deltaX = waypoints[index + actualOffset].x - waypoints[index - actualOffset].x;
  const deltaY = waypoints[index + actualOffset].y - waypoints[index - actualOffset].y;
  return Math.atan2(deltaY, deltaX);
}

export function costStraight(length: number, acceleration: number, maxVelocity: number, turnVelocity: number): number {
  const thresholdLength = (maxVelocity * maxVelocity - turnVelocity * turnVelocity) / acceleration;
  if (length < thresholdLength) {
    return (2.0 * (Math.sqrt(turnVelocity * turnVelocity + length * acceleration) - turnVelocity)) / acceleration;
  } else {
    return (length + ((maxVelocity - turnVelocity) * (maxVelocity - turnVelocity)) / acceleration) / maxVelocity;
  }
}

export function costLanechange(
  distLongitudinal: number,
  distLateral: number,
  acceleration: number,
  maxVelocity: number,
  turnVelocity: number,
  corneringForce: number,
): number {
  distLateral = Math.abs(distLateral);
  const curvature = (4 * distLateral) / (distLongitudinal * distLongitudinal + distLateral * distLateral);

  let arcLength: number;
  if (curvature > 1.0) {
    const angle = Math.atan2(0.5 * distLongitudinal * curvature, 1.0 - 0.5 * distLateral * curvature);
    arcLength = (2.0 * angle) / curvature;
  } else {
    arcLength = distLongitudinal + (distLateral * distLateral) / distLongitudinal;
  }

  if (Math.abs(curvature) > 0.01) {
    maxVelocity = Math.min(maxVelocity, Math.sqrt(corneringForce / Math.abs(curvature)));
  }

  const thresholdLength = (maxVelocity * maxVelocity - turnVelocity * turnVelocity) / acceleration;

  if (arcLength < 0.05) {
    return arcLength / turnVelocity;
  } else if (arcLength < thresholdLength) {
    return (2.0 * (Math.sqrt(turnVelocity * turnVelocity + arcLength * acceleration) - turnVelocity)) / acceleration;
  } else {
    return (arcLength + ((maxVelocity - turnVelocity) * (maxVelocity - turnVelocity)) / acceleration) / maxVelocity;
  }
}

export function costTurn(
  arcLength: number,
  curvature: number,
  acceleration: number,
  maxVelocity: number,
  turnVelocity: number,
  corneringForce: number,
): number {
  maxVelocity = Math.min(maxVelocity, Math.sqrt(corneringForce / Math.abs(curvature)));
  const thresholdLength = (maxVelocity * maxVelocity - turnVelocity * turnVelocity) / acceleration;

  if (arcLength < 0.05) {
    return arcLength / turnVelocity;
  } else if (arcLength < thresholdLength) {
    return (2.0 * (Math.sqrt(turnVelocity * turnVelocity + arcLength * acceleration) - turnVelocity)) / acceleration;
  } else {
    return (arcLength + ((maxVelocity - turnVelocity) * (maxVelocity - turnVelocity)) / acceleration) / maxVelocity;
  }
}

interface NodeKey {
  idx: number;
  layer: number;
}

interface Edge {
  cost: number;
  target: NodeKey;
  source: NodeKey;
}

function getAdjacent(
  currentIdx: number,
  currentLayer: number,
  nodes: TrackPoint[][],
  config: typeof ROBOT_CONFIG,
  maxNumAdjacent: number = 200,
): Edge[] {
  const adjacentList: Edge[] = [];
  const currentAngle = courseAngle(nodes[currentLayer], currentIdx);
  const p0 = nodes[currentLayer][currentIdx];

  if (currentIdx + 1 < nodes[0].length && currentLayer === 0) {
    adjacentList.push({
      cost: 2 * config.dl,
      target: { idx: currentIdx + 1, layer: 0 },
      source: { idx: currentIdx, layer: currentLayer },
    });
  }

  let lookaheadIdx = currentIdx + 1;
  let minCurvBound = -10.0;
  let maxCurvBound = 10.0;

  const tangentVec = { x: Math.cos(currentAngle), y: Math.sin(currentAngle) };
  const normalVecCurrent = { x: -Math.sin(currentAngle), y: Math.cos(currentAngle) };

  while (lookaheadIdx < nodes[0].length) {
    const targetAngleBase = courseAngle(nodes[0], lookaheadIdx);
    const targetNormalVec = { x: -Math.sin(targetAngleBase), y: Math.cos(targetAngleBase) };

    const ptLeft = {
      x: nodes[0][lookaheadIdx].x + config.margin * targetNormalVec.x,
      y: nodes[0][lookaheadIdx].y + config.margin * targetNormalVec.y,
    };
    const distLongitudinalL = tangentVec.x * (ptLeft.x - p0.x) + tangentVec.y * (ptLeft.y - p0.y);
    const distLateralL = normalVecCurrent.x * (ptLeft.x - p0.x) + normalVecCurrent.y * (ptLeft.y - p0.y);
    maxCurvBound = Math.min(maxCurvBound, (2 * distLateralL) / (distLongitudinalL * distLongitudinalL + distLateralL * distLateralL));

    const ptRight = {
      x: nodes[0][lookaheadIdx].x - config.margin * targetNormalVec.x,
      y: nodes[0][lookaheadIdx].y - config.margin * targetNormalVec.y,
    };
    const distLongitudinalR = tangentVec.x * (ptRight.x - p0.x) + tangentVec.y * (ptRight.y - p0.y);
    const distLateralR = normalVecCurrent.x * (ptRight.x - p0.x) + normalVecCurrent.y * (ptRight.y - p0.y);
    minCurvBound = Math.max(minCurvBound, (2 * distLateralR) / (distLongitudinalR * distLongitudinalR + distLateralR * distLateralR));

    if (minCurvBound >= maxCurvBound) {
      break;
    }

    for (let targetLayer = 0; targetLayer < nodes.length; targetLayer++) {
      const targetAngle = courseAngle(nodes[targetLayer], lookaheadIdx);
      const targetPt = nodes[targetLayer][lookaheadIdx];

      const distLongitudinal = tangentVec.x * (targetPt.x - p0.x) + tangentVec.y * (targetPt.y - p0.y);
      const distLateral = normalVecCurrent.x * (targetPt.x - p0.x) + normalVecCurrent.y * (targetPt.y - p0.y);

      const curvature = (2 * distLateral) / (distLongitudinal * distLongitudinal + distLateral * distLateral);
      const angularRadius = 2 * Math.atan2(Math.abs(distLateral), distLongitudinal);

      const predictedAngle = currentAngle + angularRadius * (curvature > 0 ? 1 : -1);
      const angleError = Math.abs(((targetAngle - predictedAngle + Math.PI) % (2 * Math.PI)) - Math.PI);

      if (angleError < config.ang_th && minCurvBound < curvature && curvature < maxCurvBound) {
        if (angularRadius < config.ang_th) {
          const chordLength = Math.sqrt(distLongitudinal * distLongitudinal + distLateral * distLateral);
          const cost = costStraight(chordLength, config.acc_straight, config.vmax_straight, config.vturn);
          adjacentList.push({
            cost,
            target: { idx: lookaheadIdx, layer: targetLayer },
            source: { idx: currentIdx, layer: currentLayer },
          });
        } else if (Math.abs(curvature) < config.curv_lim) {
          const arcLength = Math.sqrt(distLongitudinal * distLongitudinal + distLateral * distLateral);
          const cost = costTurn(arcLength, curvature, config.acc_turn, config.vmax_turn, config.vturn, config.cf);
          adjacentList.push({
            cost,
            target: { idx: lookaheadIdx, layer: targetLayer },
            source: { idx: currentIdx, layer: currentLayer },
          });
        }
      }
    }
    lookaheadIdx++;

    if (adjacentList.length > maxNumAdjacent) {
      adjacentList.shift();
    }
  }

  return adjacentList;
}

export function autoShortcut(rawWaypoints: TrackPoint[], pathConfig: PathConfig): TrackPoint[] {
  log.info("Calculating auto shortcut");
  const waypoints = rawWaypoints.map(({ x, y }) => ({ x: x / 1000, y: y / 1000 }));

  const smoothedWaypoints = smoothPath(waypoints, pathConfig);
  const nodes: TrackPoint[][] = [waypoints, smoothedWaypoints];
  const numNodes = nodes[0].length;

  const costMatrix: number[][] = Array(nodes.length)
    .fill(null)
    .map(() => Array(numNodes).fill(-1));
  const visitedMatrix: boolean[][] = Array(nodes.length)
    .fill(null)
    .map(() => Array(numNodes).fill(false));
  const parentMatrix: (NodeKey | null)[][] = Array(nodes.length)
    .fill(null)
    .map(() => Array(numNodes).fill(null));

  const priorityQueue: { cost: number; node: NodeKey }[] = [];

  costMatrix[0][0] = 0;
  priorityQueue.push({ cost: 0, node: { idx: 0, layer: 0 } });
  priorityQueue.sort((a, b) => a.cost - b.cost);

  let maxExploredIdx = 0;

  while (priorityQueue.length > 0) {
    priorityQueue.sort((a, b) => a.cost - b.cost);
    const current = priorityQueue.shift()!;
    const currentCost = current.cost;
    const currentNode = current.node;

    if (visitedMatrix[currentNode.layer][currentNode.idx]) {
      continue;
    }

    maxExploredIdx = Math.max(maxExploredIdx, currentNode.idx);
    visitedMatrix[currentNode.layer][currentNode.idx] = true;

    if (currentNode.idx === numNodes - 1 && currentNode.layer === 0) {
      break;
    }

    const adjacencyEdges = getAdjacent(currentNode.idx, currentNode.layer, nodes, ROBOT_CONFIG);

    for (const edge of adjacencyEdges) {
      const targetNode = edge.target;
      const edgeCost = edge.cost;

      if (costMatrix[targetNode.layer][targetNode.idx] < 0 || currentCost + edgeCost < costMatrix[targetNode.layer][targetNode.idx]) {
        costMatrix[targetNode.layer][targetNode.idx] = currentCost + edgeCost;
        parentMatrix[targetNode.layer][targetNode.idx] = currentNode;
        priorityQueue.push({ cost: currentCost + edgeCost, node: targetNode });
      }
    }
  }

  const pathChunks: TrackPoint[][] = [];
  let targetNode: NodeKey = { idx: numNodes - 1, layer: 0 };

  function npSinc(x: number): number {
    if (Math.abs(x) < 1e-6) return 1.0;
    return Math.sin(Math.PI * x) / (Math.PI * x);
  }

  while (true) {
    const parentNode = parentMatrix[targetNode.layer][targetNode.idx];
    if (!parentNode) break;

    const startIdx = parentNode.idx;
    const endIdx = targetNode.idx;
    const numPointsSkipped = endIdx - startIdx;

    const startLayer = parentNode.layer;
    const ptStart = nodes[startLayer][startIdx];
    const ptEnd = nodes[targetNode.layer][endIdx];

    const angleStart = courseAngle(nodes[startLayer], startIdx);
    const tangentVec = { x: Math.cos(angleStart), y: Math.sin(angleStart) };
    const normalVec = { x: -Math.sin(angleStart), y: Math.cos(angleStart) };

    const distLongitudinal = tangentVec.x * (ptEnd.x - ptStart.x) + tangentVec.y * (ptEnd.y - ptStart.y);
    const distLateral = normalVec.x * (ptEnd.x - ptStart.x) + normalVec.y * (ptEnd.y - ptStart.y);
    const denom = distLongitudinal * distLongitudinal + distLateral * distLateral;

    const curvature = denom !== 0.0 ? (2.0 * distLateral) / denom : 0.0;
    const angularRadius = 2.0 * Math.atan2(Math.abs(distLateral), distLongitudinal);
    const arcLength = angularRadius === 0.0 ? Math.sqrt(denom) : Math.sqrt(denom) / npSinc((0.5 * angularRadius) / Math.PI);

    const chunk: TrackPoint[] = [];

    for (let i = 0; i < numPointsSkipped; i++) {
      const s = (arcLength * i) / numPointsSkipped;
      if (angularRadius < ROBOT_CONFIG.ang_th) {
        const px = arcLength > 0.0 ? ptStart.x + (s / arcLength) * (ptEnd.x - ptStart.x) : ptStart.x;
        const py = arcLength > 0.0 ? ptStart.y + (s / arcLength) * (ptEnd.y - ptStart.y) : ptStart.y;
        chunk.push({ x: px, y: py });
      } else {
        if (s === 0.0) {
          chunk.push({ x: ptStart.x, y: ptStart.y });
        } else {
          const dt = s * npSinc((curvature * s) / Math.PI);
          const dn = s * npSinc((0.5 * curvature * s) / Math.PI) * Math.sin(0.5 * curvature * s);
          chunk.push({
            x: ptStart.x + dt * tangentVec.x + dn * normalVec.x,
            y: ptStart.y + dt * tangentVec.y + dn * normalVec.y,
          });
        }
      }
    }
    pathChunks.push(chunk);

    if (parentNode.idx === 0 && parentNode.layer === 0) {
      break;
    }
    targetNode = parentNode;
  }

  pathChunks.reverse();
  const finalPath = pathChunks.flat();
  finalPath.push(nodes[0][numNodes - 1]);

  // Back to mm
  return finalPath.map(({ x, y }) => ({ x: x * 1000, y: y * 1000 }));
}
