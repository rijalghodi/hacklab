"use client";

import { Edge, type Node, type NodeProps, Position, useEdges, useReactFlow } from "@xyflow/react";
import React, { useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";

import { CircuitSimple } from "@/lib/circuit-simple";
import { CircuitChip, PortType, Wire } from "@/lib/types/chips";
import { cn, getBgBorderTextColor } from "@/lib/utils";
import { useChips } from "@/hooks";

import { PortHandle } from "./port-handle";

// UI constants for chip rendering
const PORT_SPACING = 10;
const MIN_CHIP_HEIGHT = 20;
const MIN_CHIP_WIDTH = 50;
const PORT_OFFSET_MULTIPLIER = 0.5;
const CENTER_INDEX_OFFSET = 0.5;

/**
 * Simple chip node component using pure functional circuit evaluation
 * This component renders a circuit chip and handles signal propagation
 * using synchronous evaluation instead of subscriptions
 */
export function ChipNodeSimple(props: NodeProps<Node<CircuitChip>> & { showLabel?: boolean }) {
  const { data, selected, showLabel = true } = props;
  const { getChip } = useChips();

  const { updateNodeData } = useReactFlow<Node<CircuitChip>, Edge<Wire>>();
  const edges = useEdges<Edge<Wire>>();

  // Get incoming edges (wires connected to this chip's input ports)
  const sourceEdges = useMemo(() => {
    const incomingEdges = edges.filter((edge) => edge.target === data.id);
    const portEdgeMap: Record<string, Wire | undefined> = {};

    for (const edge of incomingEdges) {
      const portId = edge.targetHandle as string;
      if (!portId) continue;
      const prev = portEdgeMap[portId] as Wire;
      if (!prev || !prev.value) {
        portEdgeMap[portId] = edge.data;
      }
    }
    return Object.values(portEdgeMap);
  }, [edges, data.id]);

  // Get the chip definition
  const circuitChip = useMemo(() => getChip(data.chipType), [data.chipType]);

  // Build the circuit instance using useMemo (only when chip definition changes)
  const circuitInstance: CircuitSimple | null = useMemo(() => {
    if (!circuitChip) {
      toast.error(`No chip definition for '${data.chipType}'`);
      return null;
    }

    // return null;

    try {
      return new CircuitSimple(circuitChip);
    } catch (error: unknown) {
      toast.error(`Failed to build circuit: ${error instanceof Error ? error.message : "Unknown error"}`);
      return null;
    }
  }, [circuitChip, data.name]);

  // Separate input and output ports
  const { inputPorts, outputPorts } = useMemo(() => {
    const ports = data?.ports || [];
    return {
      inputPorts: ports.filter((port) => port.type === PortType.IN),
      outputPorts: ports.filter((port) => port.type === PortType.OUT),
    };
  }, [data?.ports]);

  // Effect: When source edges change, evaluate circuit and update outputs
  useEffect(() => {
    try {
      if (!circuitInstance || !data?.ports) return;

      // Collect input values from incoming edges
      const inputValues: Record<string, boolean> = {};

      // Initialize all input ports with their current values
      inputPorts.forEach((port) => {
        inputValues[port.id] = port.value || false;
      });

      // Update input values from incoming edges
      for (const source of sourceEdges) {
        if (!source?.targetPortId) continue;

        const port = data.ports.find((port) => port.id === source.targetPortId);
        if (port?.type !== PortType.IN) continue;

        const edgeValue = source.value ?? false;
        inputValues[port.id] = edgeValue;
      }

      // Evaluate the circuit with current inputs
      const outputValues = circuitInstance.evaluate(inputValues);

      // Check if any output values have changed
      let hasChanges = false;
      const updatedPorts = data.ports.map((port) => {
        if (port.type === PortType.OUT && outputValues[port.id] !== undefined) {
          const newValue = outputValues[port.id];
          if (port.value !== newValue) {
            hasChanges = true;
            return { ...port, value: newValue };
          }
        }
        return port;
      });

      // Update node data if there are changes
      if (hasChanges) {
        updateNodeData(data.id, {
          ports: updatedPorts,
        });
      }
    } catch (error: unknown) {
      toast.error(`Failed to evaluate circuit: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }, [circuitInstance, sourceEdges, data.ports, data.id, inputPorts, outputPorts, updateNodeData]);

  // Calculate chip height based on number of ports
  const chipHeight = useMemo(() => {
    const maxPorts = Math.max(inputPorts.length, outputPorts.length);
    return Math.max(MIN_CHIP_HEIGHT, (maxPorts + PORT_OFFSET_MULTIPLIER) * PORT_SPACING);
  }, [inputPorts.length, outputPorts.length]);

  // Calculate port position offset
  const portOffset = useCallback((index: number, totalPorts: number) => {
    const centerIndex = totalPorts / 2 - CENTER_INDEX_OFFSET;
    return (index - centerIndex) * PORT_SPACING;
  }, []);

  // Don't render if circuit failed to build
  if (!circuitInstance) return null;

  // Render the chip UI
  return (
    <div
      className={cn("relative rounded-sm py-0.5 px-2 font-mono box-border", selected && "ring-ring/20 ring-4")}
      style={{
        minHeight: chipHeight,
        minWidth: MIN_CHIP_WIDTH,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        ...getBgBorderTextColor(circuitChip?.color),
      }}
    >
      {/* Chip name */}
      <div className="text-sm font-semibold break-all">{data.name}</div>
      {showLabel && (
        <div className="text-[8px] absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">{data.id}</div>
      )}

      {/* Input ports (left side) */}
      {inputPorts.map((port, index) => (
        <PortHandle
          key={port.id}
          id={port.id}
          name={port.name ?? port.type}
          active={port.value}
          type="target"
          position={Position.Left}
          showLabel={showLabel}
          style={{
            top: "50%",
            left: 0,
            transform: `translateX(-100%) translateY(calc(-50% + ${portOffset(index, inputPorts.length)}px))`,
          }}
        />
      ))}

      {/* Output ports (right side) */}
      {outputPorts.map((port, index) => (
        <PortHandle
          key={port.id}
          id={port.id}
          name={port.name ?? port.type}
          active={port.value}
          type="source"
          position={Position.Right}
          showLabel={showLabel}
          style={{
            top: "50%",
            right: 0,
            transform: `translateX(100%) translateY(calc(-50% + ${portOffset(index, outputPorts.length)}px))`,
          }}
        />
      ))}
    </div>
  );
}
