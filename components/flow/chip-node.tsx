"use client";

import { Edge, Handle, type Node, type NodeProps, Position, useEdges, useReactFlow } from "@xyflow/react";
import React, { useCallback, useEffect, useMemo } from "react";

import { buildCircuit } from "@/lib/circuitBuilder";
import { CircuitChip, PortType, Wire } from "@/lib/types/chips";
import { cn, getBgBorderStyle } from "@/lib/utils";

import { useChips } from "./flow-store";

const PORT_HEIGHT = 7;
const PORT_WIDTH = 7;
const PORT_SPACING = 12;
const MIN_CHIP_HEIGHT = 24;
const MIN_CHIP_WIDTH = 50;

export function ChipNode(props: NodeProps<Node<CircuitChip>>) {
  const { data, selected } = props;
  const { getChip } = useChips();

  const edges = useEdges<Edge<Wire>>();

  const { updateNodeData } = useReactFlow<Node<CircuitChip>, Edge<Wire>>();

  // Group edges by targetPortId, then choose one per the rules:
  // - If multiple edges for a port, pick the one with value true, otherwise the last.
  const portEdgeMap = useMemo(() => {
    const incomingEdges = edges.filter((edge) => edge.target === data.id);
    const map: Record<string, Wire | undefined> = {};
    for (const edge of incomingEdges) {
      const portId = edge.targetHandle as string;
      if (!portId) continue;
      const prev = map[portId] as Wire;
      if (!prev || !prev.value) {
        map[portId] = edge.data;
      }
    }
    return map;
  }, [edges, data.id]);

  const sourceEdges = useMemo(() => Object.values(portEdgeMap), [portEdgeMap]);

  const CHIP_DEFINITION = getChip(data.name);

  // Build circuit once
  const circuitInstance = useMemo(() => {
    if (!CHIP_DEFINITION) return null;
    return buildCircuit(CHIP_DEFINITION);
  }, [CHIP_DEFINITION]);

  const inputPorts = useMemo(() => data?.ports?.filter((port) => port.type === PortType.IN) || [], [data?.ports]);
  const outputPorts = useMemo(() => data?.ports?.filter((port) => port.type === PortType.OUT) || [], [data?.ports]);
  const maxPorts = useMemo(
    () => Math.max(inputPorts.length, outputPorts.length),
    [inputPorts.length, outputPorts.length],
  );

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

      // Update port value in node data
      updateNodeData(data.id, {
        ports: data.ports.map((p) => (p.id === port.id ? { ...p, value: edgeValue } : p)),
      });
    }

    // Subscribe to output port changes
    const subscriptions = outputPorts
      .map((port) => {
        const outputSubject = circuitInstance.outputs[port.id];
        if (!outputSubject) return null;

        return outputSubject.subscribe((value) => {
          updateNodeData(data.id, {
            ports: data.ports.map((p) => (p.id === port.id ? { ...p, value } : p)),
          });
        });
      })
      .filter(Boolean);

    return () => {
      subscriptions.forEach((sub) => sub?.unsubscribe());
    };
  }, [circuitInstance, JSON.stringify(sourceEdges)]);

  const chipHeight = useMemo(() => {
    return Math.max(MIN_CHIP_HEIGHT, (maxPorts + 0.5) * PORT_SPACING);
  }, [maxPorts]);

  const portOffset = useCallback((index: number, totalPorts: number) => {
    const centerIndex = totalPorts / 2 - 0.5;
    return (index - centerIndex) * PORT_SPACING;
  }, []);

  // Memoize handle styles to prevent unnecessary re-renders
  const inputHandleStyles = useMemo(
    () =>
      inputPorts.map((port, index) => ({
        key: port.id,
        style: {
          top: "50%",
          left: 0,
          transform: `translateX(-100%) translateY(calc(-50% + ${portOffset(index, inputPorts.length)}px))`,
          height: PORT_HEIGHT,
          width: PORT_WIDTH,
          borderRadius: 100,
          border: "none",
          cursor: "default",
        },
      })),
    [inputPorts, portOffset],
  );

  const outputHandleStyles = useMemo(
    () =>
      outputPorts.map((port, index) => ({
        key: port.id,
        style: {
          top: "50%",
          right: 0,
          transform: `translateX(100%) translateY(calc(-50% + ${portOffset(index, outputPorts.length)}px))`,
          height: PORT_HEIGHT,
          width: PORT_WIDTH,
          borderRadius: 100,
          border: "none",
        },
      })),
    [outputPorts, portOffset],
  );

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
      {inputHandleStyles.map((handle, index) => (
        <Handle
          data-active={inputPorts[index]?.value}
          key={handle.key}
          id={handle.key}
          type="target"
          position={Position.Left}
          style={handle.style}
        />
      ))}

      {/* Output ports */}
      {outputHandleStyles.map((handle, index) => (
        <Handle
          data-active={outputPorts[index]?.value}
          key={handle.key}
          id={handle.key}
          type="source"
          position={Position.Right}
          style={handle.style}
        />
      ))}
    </div>
  );
}
