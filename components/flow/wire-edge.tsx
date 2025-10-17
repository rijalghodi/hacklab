"use client";

import {
  BaseEdge,
  Edge,
  type EdgeProps,
  getSmoothStepPath,
  type Node,
  useNodesData,
  useReactFlow,
} from "@xyflow/react";
import React, { useEffect } from "react";

import { CircuitChip, type Wire } from "@/lib/types/chips";
import { getActiveColor, getBorderColor } from "@/lib/utils";

// Custom step line component for interactive wire drawing
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
  source,
  sourceHandleId,
  data,
}: EdgeProps<Edge<Wire>>) {
  const { updateEdgeData } = useReactFlow<Node<CircuitChip>, Edge<Wire>>();
  const node = useNodesData<Node<CircuitChip>>(source);

  // const node = getNode(source);
  console.log("123 wire node", node);
  const VALUE = node?.data?.ports?.find((port) => port.id === sourceHandleId)?.value;

  console.log("123 VALUE", VALUE);

  useEffect(() => {
    console.log("123 useEffect VALUE", VALUE);
    if (!data?.id) {
      return;
    }
    updateEdgeData(data?.id, { value: VALUE });
  }, [VALUE]);

  const [path] = getSmoothStepPath({
    sourceX: sourceX,
    sourceY: sourceY,
    sourcePosition: sourcePosition,
    targetX: targetX,
    targetY: targetY,
    targetPosition: targetPosition,
    offset: 5,
    borderRadius: 5,
  });

  return (
    <BaseEdge
      path={path}
      markerStart={markerStart}
      markerEnd={markerEnd}
      interactionWidth={interactionWidth}
      label={label}
      labelStyle={labelStyle}
      style={{
        strokeWidth: selected ? 3 : 2,
        stroke: VALUE ? getActiveColor(data?.color) : getBorderColor(data?.color),
        strokeDasharray: "none",
      }}
      className="cursor-crosshair"
    />
  );
}
