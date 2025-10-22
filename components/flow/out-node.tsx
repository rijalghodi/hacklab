import { type Edge, type Node, type NodeProps, Position, useEdges } from "@xyflow/react";
import React from "react";

import { outChip } from "@/lib/constants/chips";
import { CircuitChip, type Wire } from "@/lib/types/chips";
import { cn, getActiveColor, getBgColor } from "@/lib/utils";

import { PortHandle } from "./port-handle";

export function OutNode(props: NodeProps<Node<CircuitChip>> & { showLabel?: boolean }) {
  const { data, selected, showLabel = true } = props;

  const COLOR = data.color || outChip?.color;

  const edges = useEdges<Edge<Wire>>();
  const edge = edges.filter((edge) => edge.target === data.id);
  const VALUE = edge.some((edge) => edge.data?.value);

  return (
    <div className={cn("relative font-mono rounded-xs", selected && "bg-ring/20 ring-ring/20 ring-3")}>
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="20" viewBox="0 0 32 20">
        <line
          x1="0"
          y1="10"
          x2="4"
          y2="10"
          stroke={VALUE ? getActiveColor(COLOR) : getBgColor(COLOR)}
          strokeWidth="2"
        />
        <circle cx="14" cy="10" r="10" fill={VALUE ? getActiveColor(COLOR) : getBgColor(COLOR)} strokeWidth="1" />
        <rect x="27" y="0" width="5" height="20" strokeWidth="1" className="fill-ring/50 hover:fill-ring" />
      </svg>

      {/* Input port */}
      <PortHandle
        // id={data.ports?.[0]?.id || ""}
        id={data.id}
        // id={null}
        name={data.name}
        active={VALUE}
        type="target"
        position={Position.Left}
        showLabel={showLabel}
        style={{
          left: 0,
          top: "50%",
          transform: "translateX(-100%) translateY(-50%)",
        }}
      />
    </div>
  );
}
