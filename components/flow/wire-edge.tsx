import {
  BaseEdge,
  Edge,
  type EdgeProps,
  getSmoothStepPath,
  useReactFlow,
  type Node,
  BaseEdgeProps,
  useNodeId,
  useNodes,
} from "@xyflow/react";
import React, { useEffect } from "react";

import { StatefulWire } from "@/lib/types/flow";
import { getActiveColor, getBorderColor } from "@/lib/utils";

import { StatefulChip } from "@/lib/types/flow";

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
}: EdgeProps<Edge<StatefulWire>>) {
  // console.log("--------------WIRE EDGE--------------");

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

  const { updateEdgeData } = useReactFlow<Node<StatefulChip>, Edge<StatefulWire>>();
  const nodes = useNodes<Node<StatefulChip>>();

  const node = nodes.find((node) => node.id === source);
  // const node = getNode(source);

  const VALUE = node?.data.ports?.find((port) => port.id === sourceHandleId)?.value;
  // console.log("VALUE", VALUE);

  useEffect(() => {
    if (!data?.id) {
      return;
    }
    updateEdgeData(data?.id, { value: VALUE });
  }, [VALUE]);

  // const VALUE = false;
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
        stroke: VALUE ? getActiveColor(data?.color) : getBorderColor(data?.color),
      }}
    />
  );
}
