"use client";

import { Edge, Handle, type Node, type NodeProps, Position, useEdges, useReactFlow } from "@xyflow/react";
import React, { useCallback, useEffect, useMemo } from "react";

import { Chip, ChipName, CircuitModule, NodeType, StatefulChip, StatefulWire } from "@/lib/types/flow";
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

  const inputValues = Object.fromEntries(sourceEdges.map((edge) => [edge.targetHandle, edge.data?.value]));

  console.log("inputValues", inputValues);

  const newInputPortValues: Record<string, boolean> = useMemo(() => {
    return inputValues;
  }, [inputValues]);

  console.log("NEW INPUT PORT VALUES", newInputPortValues);

  // ==== Function ====
  const computeOutputChips = useCallback(
    (chipName: string, inputValues?: Record<string, boolean>): Record<string, boolean | undefined> | undefined => {
      const CHIP_DEFINITION = getChip(chipName);
      if (!CHIP_DEFINITION) {
        return;
      }

      const outputPortNames = CHIP_DEFINITION.nodes
        ?.filter((node) => node.type === NodeType.OUT)
        .map((node) => node.name);
      if (!outputPortNames) {
        return;
      }
      const outputPortValues = outputPortNames.map((outputPortName) =>
        computeOutputChip(chipName, outputPortName, inputValues),
      );
      if (!outputPortValues) {
        return;
      }
      return Object.fromEntries(
        outputPortNames.map((outputPortName, index) => [outputPortName, outputPortValues[index]]),
      );
    },
    [getChip],
  );

  // ==== Function ====
  const validateInputValues = useCallback(
    (CHIP_DEFINITION: CircuitModule, inputValues: Record<string, boolean>): boolean => {
      const inputPorts = CHIP_DEFINITION.nodes?.filter((node) => node.type === NodeType.IN);
      if (!inputPorts) {
        return false;
      }

      return inputPorts.every((inputPort) => inputValues[inputPort.id] !== undefined);
    },
    [],
  );

  // ==== Function ====

  const computeOutputChipInsideCircuitModule = useCallback(
    (chipName: string, outputPortName: string, previousChips?: Chip[]): boolean | undefined => {
      return;
    },
    [],
  );

  const computeOutputCircuitModule = useCallback(
    (chipName: string, outputPortName: string, inputValues?: Record<string, boolean>): boolean | undefined => {
      // In advance chip, the chip is become a module
      console.log("---------------------COMPUTE OUTPUT CIRCUIT MODULE---------------------");
      console.log("chipName", chipName, "outputPortName", outputPortName, "inputValues", inputValues);
      const CHIP_DEFINITION = getChip(chipName);
      console.log("CHIP_DEFINITION", CHIP_DEFINITION);

      if (!CHIP_DEFINITION) {
        throw new Error("computeOutputCircuitModule: chip definition not found");
      }

      // ===== Validate input values ====
      const isValid = validateInputValues(CHIP_DEFINITION, inputValues || {});
      if (!isValid) {
        throw new Error("computeOutputCircuitModule: invalid input values");
      }

      // ==== Compute input values ====
      const outputNode = CHIP_DEFINITION.nodes.find(
        (node) => node.type === NodeType.OUT && node.name === outputPortName,
      );

      if (!outputNode) {
        throw new Error("computeOutputCircuitModule: output node not found");
      }

      const lastEdges = CHIP_DEFINITION.edges?.filter((edge) => edge.targetId === outputNode.id);
      console.log("lastEdges", lastEdges);
      if (!lastEdges) {
        throw new Error("computeOutputCircuitModule: last edges not found");
      }

      const lastNodes = lastEdges.map((edge) => {
        const foundedNode = CHIP_DEFINITION.nodes?.find((node) => node.id === edge.sourceId);
        if (!foundedNode) {
          return;
        }
        if (!edge.sourcePortId) {
          return;
        }

        // find output port name
        const outputPort = CHIP_DEFINITION.nodes?.find((node) => node.id === edge.sourcePortId);

        if (!outputPort) {
          return;
        }

        const inputPorts = CHIP_DEFINITION.nodes?.filter((node) => node.type === NodeType.IN);
        if (!inputPorts) {
          return;
        }

        return {
          ...foundedNode,
          inputPorts,
          outputPort,
        };
      });

      console.log("lastNodes", lastNodes);

      for (const lastNode of lastNodes) {
        if (!lastNode) {
          continue;
        }
        // TODO: compute input values for lastNode

        // const lastNodeInputPorts = lastNode.inputPorts;

        // const lastNodeInputValues = lastNode.inputPorts.map((inputPort) => {});

        const outputValue = computeOutputChip(lastNode.name, lastNode.outputPort.name, inputValues);
        console.log("lastNode", lastNode.name + "-" + lastNode.id, "outputValue", outputValue);
        if (outputValue) {
          return true; // return true immediately
        }
      }
    },
    [getChip],
  );

  // ==== Function ====
  const computeOutputChip = useCallback(
    (chipName: string, outputPortName: string, inputValues?: Record<string, boolean>): boolean | undefined => {
      console.log("---------------------COMPUTE OUTPUT CHIP---------------------");
      console.log("chipName", chipName, "inputValues", inputValues);
      const CHIP_DEFINITION = getChip(chipName);
      console.log("CHIP_DEFINITION", CHIP_DEFINITION);

      if (!CHIP_DEFINITION) {
        return;
      }

      if (CHIP_DEFINITION.type === NodeType.IN) {
        return inputValues?.[outputPortName];
      }

      if (CHIP_DEFINITION.type === NodeType.OUT) {
        return;
      }

      if (chipName === ChipName.NAND) {
        console.log("------- NAND CHIP ---------");
        const a = inputValues?.a;
        const b = inputValues?.b;
        if (a === undefined || b === undefined) {
          return;
        }
        return !(a && b);
      } else {
        console.log("------- ADVANCED CHIP ---------");
        const outputValues = computeOutputCircuitModule(chipName, outputPortName, inputValues);
        if (!outputValues) {
          return;
        }

        return outputValues;
      }
    },
    [getChip],
  );

  // useEffect(() => {
  //   // compute output ports
  //   const outputPortValues = computeOutputChips(data.name, newInputPortValues);

  //   const newPortValues = { ...newInputPortValues, ...outputPortValues };

  //   console.log("NEW PORT VALUES", newPortValues);

  //   // Only update if values have actually changed to avoid infinite loop
  //   const portsToUpdate = data.ports?.map((port) => ({ ...port, value: newPortValues?.[port.name] }));
  //   const hasChanged = data.ports?.some((port, idx) => port.value !== portsToUpdate?.[idx]?.value);

  //   if (hasChanged) {
  //     updateNodeData(data.id, {
  //       ports: portsToUpdate,
  //     });
  //   }
  //   // Only rerun when newInputPortValues or data.ports change
  // }, [JSON.stringify(newInputPortValues), data.ports, data.id, computeOutputChip]);

  useEffect(() => {
    // compute output ports
    const outputPortValues = computeOutputChips(data.name, newInputPortValues);
    console.log("OUTPUT PORT VALUES", outputPortValues);
  }, [data.name, newInputPortValues, computeOutputChips]);

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
            backgroundColor: port.value ? "orange" : undefined,
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
            backgroundColor: port.value ? "orange" : undefined,
          }}
        />
      ))}
    </div>
  );
}
