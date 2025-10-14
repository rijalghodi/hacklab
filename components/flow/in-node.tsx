import { type Edge, type Node, type NodeProps, Position, useReactFlow } from "@xyflow/react";
import React from "react";

import { CircuitChip, type Wire } from "@/lib/types/chips";
import { cn, getActiveColor, getBgColor } from "@/lib/utils";

import { useChips } from "./flow-store";
import { PortHandle } from "./port-handle";

export function InNode(props: NodeProps<Node<CircuitChip>>) {
  const { data, selected } = props;
  const getChip = useChips((state) => state.getChip);

  const CHIP_DEFINITION = getChip("IN");
  const COLOR = data.color || CHIP_DEFINITION?.color;
  const VALUE = data?.ports?.[0]?.value;

  const { updateNodeData } = useReactFlow<Node<CircuitChip>, Edge<Wire>>();

  // handle click on port
  const handleClick = (e: React.MouseEvent<SVGCircleElement>) => {
    e.stopPropagation();

    if (!data.ports || data.ports.length === 0) {
      return;
    }

    updateNodeData(data.id, {
      ports: data.ports?.map((port) => ({ ...port, value: !VALUE })),
    });
  };

  return (
    <div className={cn("relative font-mono rounded-xs", selected && "bg-ring/20 ring-ring/20 ring-3")}>
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="20" viewBox="0 0 32 20">
        <rect x="0" y="0" width="5" height="20" strokeWidth="1" className="fill-ring/50 hover:fill-ring" />
        <circle
          cx="18"
          cy="10"
          r="10"
          fill={VALUE ? getActiveColor(COLOR) : getBgColor(COLOR)}
          strokeWidth="1"
          className="cursor-pointer"
          onClick={handleClick}
        />
        <line
          x1="28"
          y1="10"
          x2="32"
          y2="10"
          stroke={VALUE ? getActiveColor(COLOR) : getBgColor(COLOR)}
          strokeWidth="2"
        />
      </svg>

      {/* Output port */}
      <PortHandle
        id={data.ports?.[0]?.id || ""}
        // id={data.id}
        name={data.name}
        active={VALUE}
        type="source"
        position={Position.Right}
        style={{
          right: 0,
          top: "50%",
          transform: "translateX(100%) translateY(-50%)",
        }}
      />
    </div>
  );
}
