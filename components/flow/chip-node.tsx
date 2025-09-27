import { Handle, type NodeProps, Position, type Node } from "@xyflow/react";
import React, { useCallback, useMemo } from "react";

import { cn } from "@/lib/utils";
import { Chip } from "@/lib/types/flow";
import tinyColor from "color";

const PORT_HEIGHT = 8;
const PORT_WIDTH = 8;
const PORT_SPACING = 10;
const MIN_CHIP_HEIGHT = 40;

export function ChipNode(props: NodeProps<Node<Chip>>) {
  const { data, selected } = props;

  // Type assertion for data
  const chipData = data;

  const inputPorts = chipData.ports.filter((port) => port.type === "input");
  const outputPorts = chipData.ports.filter((port) => port.type === "output");
  const maxPorts = Math.max(inputPorts.length, outputPorts.length);

  const chipHeight = useMemo(() => {
    return Math.max(MIN_CHIP_HEIGHT, (maxPorts + 2) * PORT_SPACING);
  }, [chipData.ports]);

  const portTop = useCallback(
    (index: number, totalPorts: number) => {
      const center = chipHeight / 2;
      const centerOffset = (totalPorts - 1) / 2; // works for both odd and even
      console.log({
        center,
        centerOffset,
        index,
        totalPorts,
      });
      return center + (index - centerOffset) * PORT_SPACING;
    },
    [chipHeight],
  );

  const portOffset = useCallback((index: number, totalPorts: number) => {
    const isOdd = totalPorts % 2 === 1;
    const centerIndex = totalPorts / 2 - 0.5;

    if (isOdd) {
      return (index - centerIndex) * PORT_SPACING;
    } else {
      return (index - centerIndex) * PORT_SPACING;
    }
  }, []);

  return (
    <div
      className={cn("relative rounded-md p-2 border-2 font-mono", selected && "outline-ring/20 outline-3")}
      style={{
        height: chipHeight,
        maxHeight: chipHeight,
        backgroundColor: chipData.color || "var(--color-card)",
        // borderColor: chipData.color ? tinyColor(chipData.color).darken(0.1).toHexString() : "var(--color-border)",
      }}
    >
      <div className="text-sm font-semibold text-foreground w-full h-full text-center flex items-center justify-center">
        {chipData.name} {chipData.color}
      </div>
      {/* Input ports */}
      {inputPorts.map((port, index) => (
        <Handle
          key={port.id}
          id={port.id}
          type="target"
          position={Position.Left}
          className="hover:bg-red-500"
          style={{
            top: "50%",
            left: 0,
            transform: `translateX(-100%) translateY(calc(-50% + ${portOffset(index, inputPorts.length)}px))`,
            height: PORT_HEIGHT,
            width: PORT_WIDTH,
            borderRadius: 2,
            border: "none",
          }}
        />
      ))}

      {/* Output ports */}
      {outputPorts.map((port, index) => (
        <Handle
          key={port.id}
          id={port.id}
          type="source"
          position={Position.Right}
          // className="!bg-ring !hover:bg-primary"
          // style={{
          //   top: "50%",
          //   right: 0,
          //   transform: `translateX(100%) translateY(calc(-50% + ${portOffset(index, outputPorts.length)}px))`,
          //   height: PORT_HEIGHT,
          //   width: PORT_WIDTH,
          //   borderRadius: 2,
          //   border: "none",
          // }}
        >
          {port.name}
        </Handle>
      ))}
    </div>
  );
}
