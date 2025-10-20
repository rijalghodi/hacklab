import { Handle, Position } from "@xyflow/react";
import React from "react";

import { cn } from "@/lib/utils";

const PORT_HEIGHT = 7;
const PORT_WIDTH = 7;

export interface PortHandleProps {
  /** The port ID */
  id: string | null;
  /** The port name to display on hover */
  name: string;
  /** Whether the port is active (has a value) */
  active?: boolean;
  /** The type of handle - source or target */
  type: "source" | "target";
  /** The position of the handle */
  position: Position;
  /** Additional CSS classes */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Custom transform for positioning */
  //   transform?: string;
  /** Whether to show the label */
  showLabel?: boolean;
}

export function PortHandle({
  id,
  name,
  active = false,
  type,
  position,
  className = "group",
  style,
  showLabel = false,
  //   transform,
}: PortHandleProps) {
  const baseStyle: React.CSSProperties = {
    height: PORT_HEIGHT,
    width: PORT_WIDTH,
    borderRadius: 100,
    border: "none",
    cursor: "pointer",
    position: "absolute",
    ...style,
  };

  // Determine tooltip position based on handle position
  const getTooltipStyle = () => {
    switch (position) {
      case Position.Left:
        return "right-full -translate-x-0.5 top-1/2 -translate-y-1/2";
      case Position.Right:
        return "left-full translate-x-0.5 top-1/2 -translate-y-1/2";
      case Position.Top:
        return "bottom-full -translate-y-0.5 left-1/2 -translate-x-1/2";
      case Position.Bottom:
        return "top-full translate-y-0.5 left-1/2 -translate-x-1/2";
      default:
        return "left-full translate-x-0.5 top-1/2 -translate-y-1/2";
    }
  };

  return (
    <Handle
      data-active={active}
      id={id}
      type={type}
      position={position}
      className={cn("group relative", className)}
      style={{
        ...baseStyle,
        // transform,
      }}
    >
      <div
        className={cn(
          "opacity-0 group-hover:opacity-100 text-[8px] absolute bg-background text-foreground shadow-lg border border-border px-1 py-[1px] rounded-xs font-semibold whitespace-nowrap z-10",
          getTooltipStyle(),
        )}
        style={{ wordBreak: "keep-all", whiteSpace: "nowrap" }}
      >
        {name}
      </div>
      {showLabel && <div className={cn("absolute text-[7px] whitespace-nowrap", getTooltipStyle())}>{id}</div>}
    </Handle>
  );
}
