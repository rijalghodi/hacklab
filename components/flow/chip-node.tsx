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

  const sourceEdges = Object.values(portEdgeMap);

  const CHIP_DEFINITION = getChip(data.name);

  // Build circuit once
  const circuitInstance = useMemo(() => {
    if (!CHIP_DEFINITION) return null;
    return buildCircuit(CHIP_DEFINITION);
  }, [CHIP_DEFINITION]);

  const inputPorts = data?.ports?.filter((port) => port.type === PortType.IN);
  const outputPorts = data?.ports?.filter((port) => port.type === PortType.OUT);
  const maxPorts = Math.max(inputPorts?.length || 0, outputPorts?.length || 0);

  // Handle edge value changes and update input ports
  useEffect(() => {
    if (!circuitInstance || !data?.ports) return;

    console.log("sourceEdges", sourceEdges);

    // const cleanedSources =

    for (const source of sourceEdges) {
      const port = data.ports.find((port) => port.id === source?.targetPortId);
      console.log("port", port);
      console.log("source", source);
      if (port?.type !== PortType.IN) continue;

      const edgeValue = source?.value ?? false;
      const nextVal = edgeValue;

      console.log("nextVal", nextVal, "port.id", port.id);

      const subj = circuitInstance.inputs[port.id];
      if (subj) {
        subj.next(nextVal);
        console.log("Input subject updated");
      } else {
        console.error("No input subject found for", port.id);
      }

      updateNodeData(data.id, {
        ports: data.ports.map((port) => (port.id === port.id ? { ...port, value: nextVal } : port)),
      });
    }

    const outputPorts = data.ports.filter((p) => p.type === PortType.OUT);

    const subs = outputPorts
      .map((p) => {
        const out$ = circuitInstance.outputs[p.id];
        console.log("out$", out$);
        if (!out$) return null;
        return out$.subscribe((v) => {
          console.log("subscribe", v);
          updateNodeData(data.id, {
            ports: data.ports.map((port) => (port.id === p.id ? { ...port, value: v } : port)),
          });
        });
      })
      .filter(Boolean);

    console.log("subs", subs);

    return () => subs.forEach((s) => s?.unsubscribe());
  }, [circuitInstance, JSON.stringify(sourceEdges)]);

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
            cursor: "default",
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
