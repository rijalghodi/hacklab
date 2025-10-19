import { BaseEdge, Edge, EdgeLabelRenderer, EdgeProps } from "@xyflow/react";
import React from "react";

import "./positionable-edge.css";

import { getMultiStepPath } from "@/lib/get-multi-step-path";
import { logger } from "@/lib/logger";

type PositionableEdgeData = {
  positionHandlers: { x: number; y: number; active?: boolean }[];
};

export function EditableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
  selected,
}: EdgeProps<Edge<PositionableEdgeData>>) {
  const [edgePath, _, _a, _b, _c, centerPoints, points] = getMultiStepPath({
    sourceX: sourceX,
    sourceY: sourceY,
    // sourcePosition,
    targetX: targetX,
    targetY: targetY,
    // targetPosition,
  });

  logger.debug({ group: "EditableEdge", message: `Center points: ${JSON.stringify(centerPoints)}` });
  logger.debug({ group: "EditableEdge", message: `Points: ${JSON.stringify(points)}` });
  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeWidth: selected ? 3 : 2,
        }}
      />
      {centerPoints.map((point, index) => (
        <EdgeLabelRenderer key={`edge${id}_centerPoint${index}`}>
          <div
            className="centerPoint"
            style={{
              transform: `translate(-50%, -50%)`,
              position: "absolute",
              top: point.y,
              left: point.x,
              backgroundColor: "red",
              width: 4,
              height: 4,
              borderRadius: 5,
            }}
          ></div>
        </EdgeLabelRenderer>
      ))}
      {points.map((point, index) => (
        <EdgeLabelRenderer key={`edge${id}_point${index}`}>
          <div
            className="point"
            style={{
              transform: `translate(-50%, -50%)`,
              position: "absolute",
              top: point.y,
              left: point.x,
              backgroundColor: "blue",
              width: 4,
              height: 4,
              borderRadius: 5,
            }}
          ></div>
        </EdgeLabelRenderer>
      ))}
    </>
  );
}
