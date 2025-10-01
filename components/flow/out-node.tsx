import { Handle, type Node, type NodeProps, Position, useEdges } from "@xyflow/react";
import React from "react";

import { NodeType, StatefulChip } from "@/lib/types/flow";
import { cn, getActiveColor, getBgColor, getBorderColor } from "@/lib/utils";

import { useChips } from "./flow-store";

const PORT_HEIGHT = 7;
const PORT_WIDTH = 7;

export function OutNode(props: NodeProps<Node<StatefulChip>>) {
  const { data, selected } = props;
  const getChip = useChips((state) => state.getChip);

  const CHIP_DEFINITION = getChip(NodeType.OUT);
  const COLOR = data.color || CHIP_DEFINITION?.color;

  const edges = useEdges();
  const edge = edges.filter((edge) => edge.target === data.id);
  const VALUE = edge.some((edge) => edge.data?.value);

  return (
    <div className={cn("relative font-mono rounded-sm", selected && "outline-ring outline-1")}>
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="24" viewBox="0 0 28 24">
        <circle
          cx="16"
          cy="12"
          r="10"
          fill={VALUE ? getActiveColor(COLOR) : getBgColor(COLOR)}
          stroke={getBorderColor(COLOR)}
          strokeWidth="1"
        />
        <line x1="0" y1="12" x2="6" y2="12" stroke={getBorderColor(COLOR)} strokeWidth="2" />
      </svg>

      {/* Input ports */}
      <Handle
        data-active={VALUE}
        id={data.ports?.[0]?.id}
        type="target"
        position={Position.Left}
        style={{
          height: PORT_HEIGHT,
          width: PORT_WIDTH,
          borderRadius: 100,
          border: "none",
          // backgroundColor: VALUE ? "orange" : undefined,
        }}
      />
    </div>
  );
}
