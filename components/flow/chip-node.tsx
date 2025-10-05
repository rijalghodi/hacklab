"use client";

import { Edge, Handle, type Node, type NodeProps, Position, useEdges, useReactFlow } from "@xyflow/react";
import React, { useCallback, useEffect, useMemo } from "react";

import { computeOutputChip } from "@/lib/flow-helper";
import { NodeType, StatefulChip, StatefulWire } from "@/lib/types/flow";
import { cn, getBgBorderStyle } from "@/lib/utils";

import { useChips } from "./flow-store";

const PORT_HEIGHT = 7;
const PORT_WIDTH = 7;
const PORT_SPACING = 12;
const MIN_CHIP_HEIGHT = 24;
const MIN_CHIP_WIDTH = 50;

export function ChipNode(props: NodeProps<Node<StatefulChip>>) {
  const { data, selected } = props;
  const { getChip, allChips } = useChips();
  const DEFINITIONS = allChips();

  const { updateNodeData } = useReactFlow<Node<StatefulChip>, Edge<StatefulWire>>();
  const edges = useEdges();

  const CHIP_DEFINITION = getChip(data.name);
  const inputPorts = data.ports?.filter((port) => port.type === NodeType.IN);
  const outputPorts = data.ports?.filter((port) => port.type === NodeType.OUT);
  const maxPorts = Math.max(inputPorts?.length || 0, outputPorts?.length || 0);

  const sourceEdges = edges.filter((edge) => edge.target === data.id);

  const inputValues = Object.fromEntries(
    sourceEdges.map((edge) => {
      const portName = CHIP_DEFINITION?.nodes?.find((node) => node.id === edge.targetHandle)?.name;
      return [portName, edge.data?.value];
    }),
  );

  useEffect(() => {
    const outputValues = computeOutputChip(data.name, inputValues, DEFINITIONS);
    const newPortValues = { ...inputValues, ...outputValues };

    if (data.ports === undefined) {
      return;
    }

    const newPorts = data.ports?.map((port) => {
      if (newPortValues[port.name] === undefined) {
        return port;
      }
      return {
        ...port,
        value: outputValues[port.name],
      };
    });

    updateNodeData(data.id, {
      ports: newPorts,
    });
  }, [data.name, JSON.stringify(inputValues), computeOutputChip]);

  const chipHeight = useMemo(() => {
    return Math.max(MIN_CHIP_HEIGHT, (maxPorts + 0.5) * PORT_SPACING);
  }, [maxPorts]);

  const portOffset = useCallback((index: number, totalPorts: number) => {
    const centerIndex = totalPorts / 2 - 0.5;
    return (index - centerIndex) * PORT_SPACING;
  }, []);

  return (
    <div
      className={cn("relative rounded-xs p-2 font-mono box-border", selected && "outline-ring outline-1")}
      style={{
        height: chipHeight,
        maxHeight: chipHeight,
        minWidth: MIN_CHIP_WIDTH,
        ...getBgBorderStyle(CHIP_DEFINITION?.color),
      }}
    >
      <div className="text-xs font-semibold text-foreground w-full h-full text-center flex items-center justify-center">
        {data.name}
      </div>

      {/* Input ports */}
      {inputPorts?.map((port, index) => (
        <Handle
          data-active={port.value}
          key={port.id}
          id={port.id}
          type="target"
          position={Position.Left}
          style={{
            top: "50%",
            left: 0,
            transform: `translateX(-100%) translateY(calc(-50% + ${portOffset(index, inputPorts?.length || 0)}px))`,
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
          data-active={port.value}
          key={port.id}
          id={port.id}
          type="source"
          position={Position.Right}
          style={{
            top: "50%",
            right: 0,
            transform: `translateX(100%) translateY(calc(-50% + ${portOffset(index, outputPorts?.length || 0)}px))`,
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
