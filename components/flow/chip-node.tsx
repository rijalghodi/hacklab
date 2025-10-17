"use client";

import { Edge, type Node, type NodeProps, Position, useEdges, useReactFlow } from "@xyflow/react";
import React, { useCallback, useEffect, useMemo, useRef } from "react";

import { buildCircuit } from "@/lib/circuitBuilder";
import { CircuitChip, PortType, Wire } from "@/lib/types/chips";
import { cn, getBgBorderTextColor } from "@/lib/utils";
import { useChips } from "@/hooks";

import { PortHandle } from "./port-handle";

const PORT_SPACING = 12;
const MIN_CHIP_HEIGHT = 24;
const MIN_CHIP_WIDTH = 50;
const PORT_OFFSET_MULTIPLIER = 0.5; // Used in chipHeight calculation
const CENTER_INDEX_OFFSET = 0.5; // Used in portOffset calculation

export function ChipNode(props: NodeProps<Node<CircuitChip>>) {
  const { data, selected } = props;
  const { getChip } = useChips();

  const { updateNodeData } = useReactFlow<Node<CircuitChip>, Edge<Wire>>();

  const edges = useEdges<Edge<Wire>>();
  const subscriptionsRef = useRef<any[]>([]);

  const sourceEdges = useMemo(() => {
    // Group edges by targetPortId, then choose one per the rules:
    // - If multiple edges for a port, pick the one with value true, otherwise the last.
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

  const CHIP_DEFINITION = getChip(data.name);

  // Build circuit once
  const circuitInstance = useMemo(() => {
    if (!CHIP_DEFINITION) return null;
    return buildCircuit(CHIP_DEFINITION);
  }, [CHIP_DEFINITION]);

  const inputPorts = useMemo(() => data?.ports?.filter((port) => port.type === PortType.IN) || [], [data?.ports]);
  const outputPorts = useMemo(() => data?.ports?.filter((port) => port.type === PortType.OUT) || [], [data?.ports]);

  // Handle edge value changes and update input ports
  useEffect(() => {
    if (!circuitInstance || !data?.ports) return;

    // Update input ports with edge values
    for (const source of sourceEdges) {
      if (!source?.targetPortId) continue;

      const port = data.ports.find((port) => port.id === source.targetPortId);
      if (port?.type !== PortType.IN) continue;

      const edgeValue = source.value ?? false;
      const subj = circuitInstance.inputs[port.id];

      if (subj) {
        subj.next(edgeValue);
      }
    }

    // Clean up existing subscriptions
    subscriptionsRef.current.forEach((sub) => sub?.unsubscribe());
    subscriptionsRef.current = [];

    // Subscribe to output port changes
    const subscriptions = outputPorts
      .map((port) => {
        const outputSubject = circuitInstance.outputs[port.id];
        if (!outputSubject) return null;

        return outputSubject.subscribe((value) => {
          // Only update if value actually changed
          if (port.value !== value) {
            updateNodeData(data.id, {
              ports: data.ports?.map((p) => (p.id === port.id ? { ...p, value } : p)),
            });
          }
        });
      })
      .filter(Boolean);

    // Store subscriptions in ref for cleanup
    subscriptionsRef.current = subscriptions;

    return () => {
      subscriptionsRef.current.forEach((sub) => sub?.unsubscribe());
      subscriptionsRef.current = [];
    };
  }, [circuitInstance, data.id, edges.length]);

  const chipHeight = useMemo(() => {
    const maxPorts = Math.max(inputPorts.length, outputPorts.length);
    return Math.max(MIN_CHIP_HEIGHT, (maxPorts + PORT_OFFSET_MULTIPLIER) * PORT_SPACING);
  }, [inputPorts.length, outputPorts.length]);

  const portOffset = useCallback((index: number, totalPorts: number) => {
    const centerIndex = totalPorts / 2 - CENTER_INDEX_OFFSET;
    return (index - centerIndex) * PORT_SPACING;
  }, []);

  return (
    <div
      className={cn("relative rounded-sm p-2 font-mono box-border", selected && "ring-ring/20 ring-4")}
      style={{
        height: chipHeight,
        maxHeight: chipHeight,
        minWidth: MIN_CHIP_WIDTH,
        ...getBgBorderTextColor(CHIP_DEFINITION?.color),
      }}
    >
      <div className="text-xs font-semibold w-full h-full text-center flex items-center justify-center">
        {data.name}
      </div>

      {/* Input ports */}
      {inputPorts.map((port, index) => (
        <PortHandle
          key={port.id}
          id={port.id}
          name={port.name}
          active={port.value}
          type="target"
          position={Position.Left}
          style={{
            top: "50%",
            left: 0,
            transform: `translateX(-100%) translateY(calc(-50% + ${portOffset(index, inputPorts.length)}px))`,
          }}
        />
      ))}

      {/* Output ports */}
      {outputPorts.map((port, index) => (
        <PortHandle
          key={port.id}
          id={port.id}
          name={port.name}
          active={port.value}
          type="source"
          position={Position.Right}
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
