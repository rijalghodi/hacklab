import { type Edge, Handle, type Node, type NodeProps, Position, useReactFlow } from "@xyflow/react";
import React from "react";

import { CircuitChip, type Wire } from "@/lib/types/chips";
import { cn, getActiveColor, getBgColor, getBorderColor } from "@/lib/utils";

import { useChips } from "./flow-store";

const PORT_HEIGHT = 7;
const PORT_WIDTH = 7;

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
    console.log("--------------IN NODE--------------");
    console.log("VALUE", VALUE);

    if (!data.ports || data.ports.length === 0) {
      return;
    }

    updateNodeData(data.id, {
      ports: data.ports?.map((port) => ({ ...port, value: !VALUE })),
    });
  };

  return (
    <div className={cn("relative font-mono rounded-sm", selected && "outline-ring outline-1")}>
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="24" viewBox="0 0 28 24">
        <circle
          cx="12"
          cy="12"
          r="10"
          fill={VALUE ? getActiveColor(COLOR) : getBgColor(COLOR)}
          stroke={getBorderColor(COLOR)}
          strokeWidth="1"
          className="cursor-pointer"
          onClick={handleClick}
        />
        <line
          x1="22"
          y1="12"
          x2="28"
          y2="12"
          stroke={VALUE ? getActiveColor(COLOR) : getBorderColor(COLOR)}
          strokeWidth="2"
        />
      </svg>

      {/* Input ports */}
      <Handle
        data-active={VALUE}
        id={data.ports?.[0]?.id}
        type="source"
        position={Position.Right}
        style={{
          height: PORT_HEIGHT,
          width: PORT_WIDTH,
          borderRadius: 100,
          border: "none",
        }}
      />
    </div>
  );
}
