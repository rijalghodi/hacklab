import {
  BaseEdge,
  Edge,
  type EdgeProps,
  getSmoothStepPath,
  type Node,
  useNodes,
  useReactFlow,
  useViewport,
} from "@xyflow/react";
import React, { useCallback, useEffect, useRef, useState } from "react";

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
  const [isDrawing, setIsDrawing] = useState(false);
  const [stopPoints, setStopPoints] = useState<{ x: number; y: number }[]>([]);
  const [currentMousePos, setCurrentMousePos] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { updateEdgeData } = useReactFlow<Node<CircuitChip>, Edge<Wire>>();
  const nodes = useNodes<Node<CircuitChip>>();

  const { zoom } = useViewport();

  const node = nodes.find((node) => node.id === source);
  const VALUE = node?.data.ports?.find((port) => port.id === sourceHandleId)?.value;

  // Handle mouse move for tracking
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDrawing || !svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left) / zoom;
      const y = (event.clientY - rect.top) / zoom;

      setCurrentMousePos({ x, y });
    },
    [isDrawing, zoom],
  );

  // Handle click to add stop points
  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (!isDrawing || !svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left) / zoom;
      const y = (event.clientY - rect.top) / zoom;

      setStopPoints((prev) => [...prev, { x, y }]);
    },
    [isDrawing, zoom],
  );

  // Handle double click to finish drawing
  const handleDoubleClick = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      setCurrentMousePos(null);
    }
  }, [isDrawing]);

  // Start drawing mode
  const startDrawing = useCallback(() => {
    setIsDrawing(true);
    setStopPoints([]);
    setCurrentMousePos(null);
  }, []);

  // Generate path for step line
  const generateStepPath = useCallback(() => {
    if (!isDrawing && stopPoints.length === 0) {
      // Use default smooth step path when not drawing
      return getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        borderRadius: 10,
        sourcePosition: sourcePosition,
        targetPosition: targetPosition,
        offset: 10,
      })[0];
    }

    // Build custom step path
    const points = [
      { x: sourceX, y: sourceY },
      ...stopPoints,
      ...(currentMousePos ? [currentMousePos] : []),
      { x: targetX, y: targetY },
    ];

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];

      // Create step line (no radius)
      if (i === points.length - 1) {
        // Last segment to target
        path += ` L ${curr.x} ${curr.y}`;
      } else {
        // Intermediate segments
        const midX = (prev.x + curr.x) / 2;
        path += ` L ${midX} ${prev.y}`;
        path += ` L ${midX} ${curr.y}`;
        path += ` L ${curr.x} ${curr.y}`;
      }
    }

    return path;
  }, [sourceX, sourceY, targetX, targetY, stopPoints, currentMousePos, isDrawing, sourcePosition, targetPosition]);

  // Render stop point circles
  const renderStopPoints = () => {
    return stopPoints.map((point, index) => (
      <circle
        key={`stop-${index}`}
        cx={point.x}
        cy={point.y}
        r={4}
        fill={getActiveColor(data?.color)}
        stroke={getBorderColor(data?.color)}
        strokeWidth={1}
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          // Remove stop point on click
          setStopPoints((prev) => prev.filter((_, i) => i !== index));
        }}
      />
    ));
  };

  // Render current mouse position indicator
  const renderMouseIndicator = () => {
    if (!isDrawing || !currentMousePos) return null;

    return (
      <circle
        cx={currentMousePos.x}
        cy={currentMousePos.y}
        r={3}
        fill="rgba(255, 255, 255, 0.5)"
        stroke={getActiveColor(data?.color)}
        strokeWidth={2}
        className="pointer-events-none"
      />
    );
  };

  useEffect(() => {
    if (!data?.id) {
      return;
    }
    updateEdgeData(data?.id, { value: VALUE });
  }, [VALUE]);

  useEffect(() => {
    if (isDrawing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("click", handleClick);
      document.addEventListener("dblclick", handleDoubleClick);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("click", handleClick);
        document.removeEventListener("dblclick", handleDoubleClick);
      };
    }
  }, [isDrawing, handleMouseMove, handleClick, handleDoubleClick]);

  const path = generateStepPath();

  return (
    <g>
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
          strokeDasharray: isDrawing ? "5,5" : "none",
        }}
        onClick={startDrawing}
        className="cursor-crosshair"
      />

      {/* Stop points */}
      {renderStopPoints()}

      {/* Mouse position indicator */}
      {renderMouseIndicator()}

      {/* Drawing instructions */}
      {isDrawing && (
        <text
          x={sourceX + 10}
          y={sourceY - 10}
          fontSize={12}
          fill={getActiveColor(data?.color)}
          className="pointer-events-none"
        >
          Click to add stop points, double-click to finish
        </text>
      )}
    </g>
  );
}
