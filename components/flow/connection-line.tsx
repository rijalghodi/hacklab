import { ConnectionLineComponentProps, getSmoothStepPath } from "@xyflow/react";
import React from "react";

export function ConnectionLine({ fromX, fromY, toX, toY, fromPosition, toPosition }: ConnectionLineComponentProps) {
  const [d] = getSmoothStepPath({
    sourceX: fromX,
    sourceY: fromY,
    targetX: toX,
    targetY: toY,
    sourcePosition: fromPosition,
    targetPosition: toPosition,
    offset: 10,
    borderRadius: 10,
  });

  return <path fill="none" strokeWidth={1.5} d={d} stroke="var(--xy-connectionline-stroke-default)" />;
}
