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
  console.log("--------------CHIP NODE--------------");
  const { data, selected } = props;
  const { getChip, allChips } = useChips();
  const DEFINITIONS = allChips();

  const { updateNodeData } = useReactFlow<Node<StatefulChip>, Edge<StatefulWire>>();
  // const edges = useFlowStore((state) => state.edges);
  const edges = useEdges();

  console.log("EDGES", edges);

  const CHIP_DEFINITION = getChip(data.name);
  console.log("data.ports", data.ports);
  const inputPorts = data.ports?.filter((port) => port.type === NodeType.IN);
  console.log("inputPorts", inputPorts);
  const outputPorts = data.ports?.filter((port) => port.type === NodeType.OUT);
  console.log("outputPorts", outputPorts);
  const maxPorts = Math.max(inputPorts?.length || 0, outputPorts?.length || 0);

  const sourceEdges = edges.filter((edge) => edge.target === data.id);

  console.log("SOURCE EDGES", sourceEdges);

  const inputValues = Object.fromEntries(
    sourceEdges.map((edge) => {
      const portName = CHIP_DEFINITION?.nodes?.find((node) => node.id === edge.targetHandle)?.name;
      return [portName, edge.data?.value];
    }),
  );

  console.log("inputValues", inputValues);

  // const newInputPortValues: Record<string, boolean> = useMemo(() => {
  //   return inputValues;
  // }, [inputValues]);

  // console.log("NEW INPUT PORT VALUES", newInputPortValues);

  useEffect(() => {
    console.log("---------------------COMPUTE OUTPUT CHIP: USE EFFECT---------------------");
    const outputPortValues = computeOutputChip(data.name, inputValues, DEFINITIONS);
    console.log("OUTPUT PORT VALUES", outputPortValues);

    if (data.ports === undefined) {
      return;
    }

    const newOutputPorts = data.ports?.map((port) => {
      if (outputPortValues[port.name] === undefined) {
        return port;
      }
      return {
        ...port,
        value: outputPortValues[port.name],
      };
    });
    updateNodeData(data.id, {
      ports: newOutputPorts,
    });
  }, [data.name, JSON.stringify(inputValues), computeOutputChip]);

  const chipHeight = useMemo(() => {
    return Math.max(MIN_CHIP_HEIGHT, (maxPorts + 0.5) * PORT_SPACING);
  }, [CHIP_DEFINITION]);

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
        >
          {/* {port.value ? "true" : "false"} */}
        </Handle>
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
