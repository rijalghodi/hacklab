import { BaseEdge, type EdgeProps, getSmoothStepPath } from "@xyflow/react";
import React from "react";

export function WireEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerStart,
  markerEnd,
  interactionWidth,
  label,
  labelStyle,
  ...props
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    borderRadius: 10,
    sourcePosition: sourcePosition,
    targetPosition: targetPosition,
    offset: 10,
  });

  return (
    <BaseEdge
      path={edgePath}
      markerStart={markerStart}
      markerEnd={markerEnd}
      interactionWidth={interactionWidth}
      label={label}
      labelStyle={labelStyle}
      style={{ strokeWidth: 2 }}
      // {...props}
    />
  );
}
