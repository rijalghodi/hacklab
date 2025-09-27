import React from "react";
import { ConnectionLineComponentProps, getSmoothStepPath, Position, useConnection } from "@xyflow/react";

export function ConnectionLine({ fromX, fromY, toX, toY, fromPosition, toPosition }: ConnectionLineComponentProps) {
  const { fromHandle } = useConnection();

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
