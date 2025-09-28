import { Handle, type NodeProps, Position } from "@xyflow/react";
import React from "react";

import { cn } from "@/lib/utils";

const PORT_HEIGHT = 4;
const PORT_WIDTH = 6;
const PORT_SPACING = 10;
const MIN_CHIP_HEIGHT = 40;

export function InputNode(props: NodeProps) {
  const { data, selected } = props;

  // Type assertion for data
  const inputData = data as {
    name: string;
    // ports: Array<{
    //   id: string;
    //   name: string;
    //   type: "input" | "output";
    // }>;
  };

  return (
    <div
      className={cn(
        "relative rounded-full bg-card p-2 shadow-sm transition-shadow hover:shadow-md border-2 border-ring box-border",
        selected && "border-muted-foreground",
      )}
      style={{ height: 40, maxHeight: 40 }}
    >
      {/* <div className="text-sm font-semibold text-foreground w-full h-full text-center flex items-center justify-center">
        {inputData.name}
      </div> */}
      {/* Input ports */}

      <Handle
        key="in"
        id="in"
        type="source"
        position={Position.Right}
        className="!bg-ring !hover:bg-primary"
        style={{
          height: PORT_HEIGHT,
          width: PORT_WIDTH,
          borderRadius: 2,
          border: "none",
        }}
      />
    </div>
  );
}
