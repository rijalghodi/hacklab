import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";
import React, { useCallback, useMemo } from "react";

import { builtInChips } from "@/lib/constants/chips";
import { Chip, PortName } from "@/lib/types/flow";
import { cn, getBgBorderStyle } from "@/lib/utils";

import { useSavedChips } from "./flow-store";

const PORT_HEIGHT = 7;
const PORT_WIDTH = 7;
const PORT_SPACING = 12;
const MIN_CHIP_HEIGHT = 24;
const MIN_CHIP_WIDTH = 50;

export function ChipNode(props: NodeProps<Node<Chip>>) {
  const { data, selected } = props;
  const { savedChips } = useSavedChips();
  const allChips = [...builtInChips, ...savedChips];

  // Type assertion for data
  const chipData = data;

  // const color = foo;
  const currentChip = allChips.find((chip) => chip.name === chipData.name);

  const inputPorts = chipData.ports?.filter((port) => port.name === PortName.IN);
  const outputPorts = chipData.ports?.filter((port) => port.name === PortName.OUT);
  const maxPorts = Math.max(inputPorts?.length || 0, outputPorts?.length || 0);

  const chipHeight = useMemo(() => {
    return Math.max(MIN_CHIP_HEIGHT, (maxPorts + 0.5) * PORT_SPACING);
  }, [chipData.ports]);

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
      className={cn("relative rounded-xs p-2 font-mono box-border", selected && "outline-ring outline-1")}
      style={{
        height: chipHeight,
        maxHeight: chipHeight,
        minWidth: MIN_CHIP_WIDTH,
        ...getBgBorderStyle(currentChip?.color),
      }}
    >
      <div className="text-xs font-semibold text-foreground w-full h-full text-center flex items-center justify-center">
        {chipData.name}
      </div>

      {/* Input ports */}
      {inputPorts?.map((port, index) => (
        <Handle
          key={port.id}
          id={port.id}
          type="target"
          position={Position.Left}
          style={{
            top: "50%",
            left: 0,
            transform: `translateX(-50%) translateY(calc(-50% + ${portOffset(index, inputPorts?.length || 0)}px))`,
            height: PORT_HEIGHT,
            width: PORT_WIDTH,
            borderRadius: 100,
            border: "none",
          }}
        />
      ))}

      {/* Output ports */}
      {outputPorts?.map((port, index) => (
        <Handle
          key={port.id}
          id={port.id}
          type="source"
          position={Position.Right}
          style={{
            top: "50%",
            right: 0,
            transform: `translateX(50%) translateY(calc(-50% + ${portOffset(index, outputPorts?.length || 0)}px))`,
            height: PORT_HEIGHT,
            width: PORT_WIDTH,
            borderRadius: 100,
            border: "none",
          }}
        />
      ))}
    </div>
  );
}
