import { BaseEdge, Edge, type EdgeProps, getSmoothStepPath, useReactFlow } from "@xyflow/react";
import React from "react";

import { StatefulWire } from "@/lib/types/flow";
import { getActiveColor, getBorderColor } from "@/lib/utils";

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
  selected,
  data,
}: EdgeProps<Edge<StatefulWire>>) {
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

  const edgeON = data?.value;
  const { updateEdgeData } = useReactFlow();

  return (
    <BaseEdge
      path={edgePath}
      markerStart={markerStart}
      markerEnd={markerEnd}
      interactionWidth={interactionWidth}
      label={label}
      labelStyle={labelStyle}
      style={{
        strokeWidth: selected ? 3 : 2,
        stroke: edgeON ? getActiveColor(data?.color) : getBorderColor(data?.color),
      }}
    />
  );
}
