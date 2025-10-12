import { type XYPosition } from "@xyflow/react";

export interface GetMultiStepPathParams {
  /** The `x` position of the source handle. */
  sourceX: number;
  /** The `y` position of the source handle. */
  sourceY: number;
  /** The `x` position of the target handle. */
  targetX: number;
  /** The `y` position of the target handle. */
  targetY: number;
  /** @default 5 */
  borderRadius?: number;
  /** @default 20 */
  offset?: number;
  /**
   * Controls where the bend occurs along the path.
   * 0 = at source, 1 = at target, 0.5 = midpoint
   * @default 0.5
   */
  stepPosition?: number;
}

const distance = (a: XYPosition, b: XYPosition) => Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));

/*
 * Simplified function for horizontal-only connections (left to right)
 */
function getPoints({
  source,
  target,
  offset,
  stepPosition,
}: {
  source: XYPosition;
  target: XYPosition;
  offset: number;
  stepPosition: number;
}): [XYPosition[], number, number, number, number] {
  // For horizontal connections, we always go from left to right
  const sourceGapped: XYPosition = { x: source.x + offset, y: source.y };
  const targetGapped: XYPosition = { x: target.x - offset, y: target.y };

  // Calculate the center point where the path will bend
  const centerX = sourceGapped.x + (targetGapped.x - sourceGapped.x) * stepPosition;
  const centerY = (sourceGapped.y + targetGapped.y) / 2;

  // Create the path points: source -> gap -> center -> gap -> target
  const points: XYPosition[] = [
    { x: centerX, y: sourceGapped.y },
    { x: centerX, y: targetGapped.y },
  ];

  const pathPoints = [source, sourceGapped, ...points, targetGapped, target];

  // Calculate label position and offsets
  const labelX = centerX;
  const labelY = centerY;
  const offsetX = Math.abs(source.x - labelX);
  const offsetY = Math.abs(source.y - labelY);

  return [pathPoints, labelX, labelY, offsetX, offsetY];
}

function getBend(a: XYPosition, b: XYPosition, c: XYPosition, size: number): string {
  const bendSize = Math.min(distance(a, b) / 2, distance(b, c) / 2, size);
  const { x, y } = b;

  // no bend
  if ((a.x === x && x === c.x) || (a.y === y && y === c.y)) {
    return `L${x} ${y}`;
  }

  // first segment is horizontal
  if (a.y === y) {
    const xDir = a.x < c.x ? -1 : 1;
    const yDir = a.y < c.y ? 1 : -1;
    return `L ${x + bendSize * xDir},${y}Q ${x},${y} ${x},${y + bendSize * yDir}`;
  }

  const xDir = a.x < c.x ? 1 : -1;
  const yDir = a.y < c.y ? -1 : 1;
  return `L ${x},${y + bendSize * yDir}Q ${x},${y} ${x + bendSize * xDir},${y}`;
}

/**
 * The `getMultiStepPath` util returns everything you need to render a horizontal stepped path
 * between two nodes (left to right only). The `borderRadius` property can be used to choose how rounded
 * the corners of those steps are.
 * @public
 * @returns A path string you can use in an SVG, the `labelX` and `labelY` position (center of path)
 * and `offsetX`, `offsetY` between source handle and label.
 *
 * - `path`: the path to use in an SVG `<path>` element.
 * - `labelX`: the `x` position you can use to render a label for this edge.
 * - `labelY`: the `y` position you can use to render a label for this edge.
 * - `offsetX`: the absolute difference between the source `x` position and the `x` position of the
 * middle of this path.
 * - `offsetY`: the absolute difference between the source `y` position and the `y` position of the
 * middle of this path.
 * - `centerPoints`: array of center points for each segment.
 * - `points`: array of all path points.
 * @example
 * ```js
 *  const source = { x: 0, y: 20 };
 *  const target = { x: 150, y: 100 };
 *
 *  const [path, labelX, labelY, offsetX, offsetY, centerPoints, points] = getMultiStepPath({
 *    sourceX: source.x,
 *    sourceY: source.y,
 *    targetX: target.x,
 *    targetY: target.y,
 *  });
 * ```
 * @remarks This function returns a tuple (aka a fixed-size array) to make it easier to work with multiple edge paths at once.
 */
export function getMultiStepPath({
  sourceX,
  sourceY,
  targetX,
  targetY,
  borderRadius = 5,
  offset = 20,
  stepPosition = 0.5,
}: GetMultiStepPathParams): [
  path: string,
  labelX: number,
  labelY: number,
  offsetX: number,
  offsetY: number,
  centerPoints: XYPosition[],
  points: XYPosition[],
] {
  const [points, labelX, labelY, offsetX, offsetY] = getPoints({
    source: { x: sourceX, y: sourceY },
    target: { x: targetX, y: targetY },
    offset,
    stepPosition,
  });

  const centerPoints: XYPosition[] = [];

  for (let i = 1; i < points.length - 2; i++) {
    const xCenter = (points[i].x + points[i + 1].x) / 2;
    const yCenter = (points[i].y + points[i + 1].y) / 2;
    centerPoints.push({ x: xCenter, y: yCenter });
  }

  const path = points.reduce<string>((res, p, i) => {
    let segment = "";

    if (i > 0 && i < points.length - 2) {
      segment = getBend(points[i - 1], p, points[i + 1], borderRadius);
    } else {
      segment = `${i === 0 ? "M" : "L"}${p.x} ${p.y}`;
    }

    res += segment;

    return res;
  }, "");

  return [path, labelX, labelY, offsetX, offsetY, centerPoints, points];
}
