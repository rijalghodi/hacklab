import {
  Edge,
  EdgeProps,
  getSmoothStepPath,
  useReactFlow,
} from "@xyflow/react";
import React from "react";

import "./positionable-edge.css";

import ClickableBaseEdge from "./clickable-base-edge";

type PositionableEdgeData = {
  positionHandlers: { x: number; y: number; active?: number }[];
  // type: "straight" | "smoothstep";
};

export default function PositionableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps<Edge<PositionableEdgeData>>) {
  const reactFlowInstance = useReactFlow();
  const positionHandlers = data?.positionHandlers ?? [];
  // const type = data?.type ?? "smoothstep";
  const edgeSegmentsCount = positionHandlers.length + 1;
  let edgeSegmentsArray = [];

  // let pathFunction;
  // console.log(type);
  // switch (type) {
  //   case "straight":
  //     pathFunction = getStraightPath;
  //     break;
  //   case "smoothstep":
  //     pathFunction = getSmoothStepPath;
  //     break;
  //   default:
  //     pathFunction = getBezierPath;
  // }

  // calculate the origin and destination of all the segments
  for (let i = 0; i < edgeSegmentsCount; i++) {
    let segmentSourceX, segmentSourceY, segmentTargetX, segmentTargetY;

    if (i === 0) {
      segmentSourceX = sourceX;
      segmentSourceY = sourceY;
    } else {
      const handler = positionHandlers[i - 1];
      segmentSourceX = handler.x;
      segmentSourceY = handler.y;
    }

    if (i === edgeSegmentsCount - 1) {
      segmentTargetX = targetX;
      segmentTargetY = targetY;
    } else {
      const handler = positionHandlers[i];
      segmentTargetX = handler.x;
      segmentTargetY = handler.y;
    }

    const [edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX: segmentSourceX,
      sourceY: segmentSourceY,
      sourcePosition,
      targetX: segmentTargetX,
      targetY: segmentTargetY,
      targetPosition,
    });
    edgeSegmentsArray.push({ edgePath, labelX, labelY });
  }

  return (
    <>
      {edgeSegmentsArray.map(({ edgePath }, index) => (
        <ClickableBaseEdge
          onClick={(event) => {
            const position = reactFlowInstance.screenToFlowPosition({
              x: event.clientX,
              y: event.clientY,
            });

            reactFlowInstance.setEdges((edges) => {
              const edgeIndex = edges.findIndex((edge) => edge.id === id);

              console.log("edges[edgeIndex]", edges[edgeIndex]);

              // Defensive: Ensure edgeIndex is valid, edge is defined, and positionHandlers is an array
              if (
                edgeIndex !== -1 &&
                edges[edgeIndex] &&
                edges[edgeIndex].data &&
                Array.isArray((edges[edgeIndex].data as PositionableEdgeData).positionHandlers)
              ) {
                // Type assertion for safety, to inform TS that positionHandlers is the right type
                (edges[edgeIndex].data as PositionableEdgeData).positionHandlers?.splice(index, 0, {
                  x: position.x,
                  y: position.y,
                });
              }
              return edges;
            });
          }}
          key={`edge${id}_segment${index}`}
          path={edgePath}
          markerEnd={markerEnd}
          style={style}
        />
      ))}

      {/* {positionHandlers.map(({ x, y, active }, handlerIndex) => (
        <EdgeLabelRenderer key={`edge${id}_handler${handlerIndex}`}>
          <div
            className="nopan positionHandlerContainer"
            style={{
              transform: `translate(-50%, -50%) translate(${x}px,${y}px)`,
            }}
          >
            <div
              className={`positionHandlerEventContainer ${active} ${`${active ?? -1}` !== "-1" ? "active" : ""}`}
              data-active={active ?? -1}
              // mouse move is used to move the handler when its been mousedowned on
              onMouseMove={(event) => {
                const target = event.target as HTMLElement;
                let activeEdge = parseInt(target.dataset.active ?? "-1");
                if (activeEdge === -1) {
                  return;
                }
                const position = reactFlowInstance.screenToFlowPosition({
                  x: event.clientX,
                  y: event.clientY,
                });
                reactFlowInstance.setEdges((edges) => {
                  edges[activeEdge].id = Math.random().toString();
                  const edgeData = edges[activeEdge].data as PositionableEdgeData;
                  if (edgeData?.positionHandlers) {
                    edgeData.positionHandlers[handlerIndex] = {
                      x: position.x,
                      y: position.y,
                      active: activeEdge,
                    };
                  }
                  return edges;
                });
              }}
              // mouse up is used to release all the handlers
              onMouseUp={() => {
                reactFlowInstance.setEdges((edges) => {
                  // const edgeIndex = edges.findIndex((edge) => edge.id === id);
                  for (let i = 0; i < edges.length; i++) {
                    const edgeData = edges[i].data as PositionableEdgeData;
                    if (edgeData?.positionHandlers) {
                      const handlersLength = edgeData.positionHandlers.length;
                      for (let j = 0; j < handlersLength; j++) {
                        edgeData.positionHandlers[j].active = -1;
                      }
                    }
                  }

                  return edges;
                });
              }}
            >
              <button
                className="positionHandler"
                data-active={active ?? -1}
                // mouse down is used to activate the handler
                onMouseDown={() => {
                  reactFlowInstance.setEdges((edges) => {
                    const edgeIndex = edges.findIndex((edge) => edge.id === id);
                    const edgeData = edges[edgeIndex]?.data as PositionableEdgeData;
                    if (edgeData?.positionHandlers) {
                      edgeData.positionHandlers[handlerIndex].active = edgeIndex;
                    }
                    return edges;
                  });
                }}
                onClick={(event) => {
                  event.stopPropagation();
                }}
                // right click is used to delete the handler
                onContextMenu={(event) => {
                  event.preventDefault();
                  reactFlowInstance.setEdges((edges) => {
                    const edgeIndex = edges.findIndex((edge) => edge.id === id);
                    edges[edgeIndex].id = Math.random().toString();
                    const edgeData = edges[edgeIndex]?.data as PositionableEdgeData;
                    if (edgeData?.positionHandlers) {
                      edgeData.positionHandlers.splice(handlerIndex, 1);
                    }
                    return edges;
                  });
                }}
              ></button>
            </div>
          </div>
        </EdgeLabelRenderer>
      ))} */}
    </>
  );
}
