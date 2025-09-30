"use client";

import { Edge, Handle, type Node, type NodeProps, Position, useEdges, useReactFlow } from "@xyflow/react";
import React, { useCallback, useEffect, useMemo } from "react";

import { ChipName, NodeType, StatefulChip, StatefulWire } from "@/lib/types/flow";
import { cn, getBgBorderStyle } from "@/lib/utils";

import { useChips, useFlowStore } from "./flow-store";

const PORT_HEIGHT = 7;
const PORT_WIDTH = 7;
const PORT_SPACING = 12;
const MIN_CHIP_HEIGHT = 24;
const MIN_CHIP_WIDTH = 50;

export function ChipNode(props: NodeProps<Node<StatefulChip>>) {
  console.log("--------------CHIP NODE--------------");
  const { data, selected } = props;
  const { getChip } = useChips();
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

  const edgeValues = Object.fromEntries(sourceEdges.map((edge) => [edge.targetHandle, edge.data?.value]));

  console.log("EDGE VALUES", edgeValues);

  const newInputPortValues: Record<string, boolean> = useMemo(() => {
    return edgeValues;
  }, [edgeValues]);

  console.log("NEW INPUT PORT VALUES", newInputPortValues);

  const computeOutputChips = useCallback(
    (chipName: string, inputValues?: Record<string, boolean>): Record<string, boolean> | undefined | null => {
      // TODO: use computeOutputChip to compute output chips loop
      return null;
    },
    [getChip],
  );

  const computeOutputChip = useCallback(
    (chipName: string, outputPortName: string, inputValues?: Record<string, boolean>): boolean | undefined | null => {
      console.log("---------------------COMPUTE OUTPUT CHIP---------------------");
      console.log("chipName", chipName, "inputValues", inputValues);
      const CHIP_DEFINITION = getChip(chipName);

      if (!CHIP_DEFINITION) {
        return null;
      }

      if (CHIP_DEFINITION.type === NodeType.IN) {
        return inputValues?.[outputPortName];
      }

      if (CHIP_DEFINITION.type === NodeType.OUT) {
        return null;
      }

      if (CHIP_DEFINITION.type === NodeType.CHIP) {
        if (chipName === "FOO") {
          console.log("------- NAND CHIP ---------");
          const a = inputValues?.a;
          const b = inputValues?.b;

          return !(a && b);
        } else {
          console.log("------- NOT BASIC CHIP ---------");
          console.log("CHIP_DEFINITION", CHIP_DEFINITION);
          if (!CHIP_DEFINITION.nodes) {
            return null;
          }

          // ==== Compute input values ====
          // const inputNodes = CHIP_DEFINITION.nodes.filter((node) => node.type === NodeType.IN);

          const outputNode = CHIP_DEFINITION.nodes.find(
            (node) => node.type === NodeType.OUT && node.name === outputPortName,
          );

          if (!outputNode) {
            return null;
          }

          const lastEdges = CHIP_DEFINITION.edges?.filter((edge) => edge.targetId === outputNode.id);
          console.log("lastEdges", lastEdges);
          if (!lastEdges) {
            return null;
          }

          for (const lastEdge of lastEdges) {
            const lastNode = CHIP_DEFINITION.nodes?.find((node) => node.id === lastEdge.sourceId);
            const outputPortName = lastEdge.sourcePortId;

            console.log("lastNode", lastNode);
            if (!lastNode) {
              continue;
            }

            if (!outputPortName) {
              continue;
            }

            // const lastNodeInput = lastNode.?.find((node) => node.id === beforeEdge.sourcePortId);

            const lastNodeOutput = computeOutputChip(lastNode.name, outputPortName, inputValues);
            console.log("lastNodeOutput", lastNodeOutput);

            // update
            if (!lastNodeOutput) {
              return null;
            }

            // outputValues = prevNodeOutputs;
          }
        }

        // return outputNodeOutputs;
      }
    },

    // return null;

    [getChip],
  );

  useEffect(() => {
    // compute output ports
    const outputPortValues = computeOutputChip(data.name, newInputPortValues);

    const newPortValues = { ...newInputPortValues, ...outputPortValues };

    console.log("NEW PORT VALUES", newPortValues);

    // Only update if values have actually changed to avoid infinite loop
    const portsToUpdate = data.ports?.map((port) => ({ ...port, value: newPortValues?.[port.name] }));
    const hasChanged = data.ports?.some((port, idx) => port.value !== portsToUpdate?.[idx]?.value);

    if (hasChanged) {
      updateNodeData(data.id, {
        ports: portsToUpdate,
      });
    }
    // Only rerun when newInputPortValues or data.ports change
  }, [JSON.stringify(newInputPortValues), data.ports, data.id, computeOutputChip]);

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
            // backgroundColor: port.value ? "red" : undefined,
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
            transform: `translateX(100%) translateY(calc(-50% + ${portOffset(index, outputPorts?.length || 0)}px))`,
            height: PORT_HEIGHT,
            width: PORT_WIDTH,
            borderRadius: 100,
            border: "none",
            // backgroundColor: port.value ? "red" : undefined,
          }}
        />
      ))}
    </div>
  );
}
