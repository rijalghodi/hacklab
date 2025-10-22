"use client";

import { Edge, type Node, type NodeProps, Position, useEdges, useReactFlow } from "@xyflow/react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { CircuitPort, Gates, LogicGate } from "@/lib/circuit-signals";
import { tryCatch } from "@/lib/try-catch";
import { CircuitChip, NAND_CHIP_TYPE, PortType, Wire } from "@/lib/types/chips";
import { cn, getBgBorderTextColor } from "@/lib/utils";
import { useAllChips, useSavedChip } from "@/hooks";

import { PortHandle } from "./port-handle";

// UI constants for chip rendering
const PORT_SPACING = 10;
const MIN_CHIP_HEIGHT = 20;
const MIN_CHIP_WIDTH = 50;
const PORT_OFFSET_MULTIPLIER = 0.5;
const CENTER_INDEX_OFFSET = 0.5;

/**
 * Builds a circuit using custom signals instead of RxJS BehaviorSubject
 * This is much faster and simpler than the RxJS approach
 */
function buildCustomCircuit(def: CircuitChip): {
  inputs: Record<string, CircuitPort>;
  outputs: Record<string, CircuitPort>;
  gates: LogicGate[];
} {
  const inputs: Record<string, CircuitPort> = {};
  const outputs: Record<string, CircuitPort> = {};
  const gates: LogicGate[] = [];

  // Step 1: Create input/output ports for the chip
  for (const p of def.ports || []) {
    const port = new CircuitPort(p.value ?? false, p.id);
    if (p.type === PortType.IN) {
      inputs[p.id] = port;
    } else {
      outputs[p.id] = port;
    }
  }

  // Step 2: Create all the internal logic gates
  const chips: Record<string, ReturnType<typeof buildCustomCircuit>> = {};
  for (const chip of def.chips || []) {
    // Handle primitive NAND gates
    if (chip.chipType === NAND_CHIP_TYPE) {
      const nandGate = Gates.NAND();
      gates.push(nandGate);

      chips[chip.id] = {
        inputs: {
          "nand.port-a": nandGate.getInput(0),
          "nand.port-b": nandGate.getInput(1),
        },
        outputs: {
          "nand.port-out": nandGate.getOutput(0),
        },
        gates: [nandGate],
      };
      continue;
    }

    // Handle composite gates (like AND, OR, etc.) recursively
    const subDef = def.definitions?.find((d) => d.chipType === chip.chipType);
    if (!subDef) throw new Error(`Missing definition for chip '${chip.chipType}'`);

    const subCircuit = buildCustomCircuit({ ...subDef, id: chip.id, definitions: def.definitions });
    chips[chip.id] = subCircuit;
    gates.push(...subCircuit.gates);
  }

  // Step 2.5: Handle primitive gates (like simple NAND) that have no internal chips
  if (def.chipType === NAND_CHIP_TYPE && def.chips?.length === 0) {
    const nandGate = Gates.NAND();
    gates.push(nandGate);

    // Connect input ports to gate inputs
    const inputPorts = Object.values(inputs);
    if (inputPorts.length >= 2) {
      inputPorts[0].connect(nandGate.getInput(0));
      inputPorts[1].connect(nandGate.getInput(1));
    }

    // Connect gate output to output port
    const outputPorts = Object.values(outputs);
    if (outputPorts.length >= 1) {
      nandGate.getOutput(0).connect(outputPorts[0]);
    }
  }

  // Step 3: Connect all the wires between ports
  for (const w of def.wires || []) {
    // Find the source port (where signal comes from)
    let srcPort: CircuitPort | undefined;
    if (outputs[w.sourceId]) {
      srcPort = outputs[w.sourceId];
    } else if (chips[w.sourceId] && w.sourcePortId) {
      srcPort = chips[w.sourceId].outputs[w.sourcePortId];
    } else if (inputs[w.sourceId]) {
      srcPort = inputs[w.sourceId];
    }
    if (!srcPort) throw new Error(`Invalid source: ${w.sourceId}`);

    // Find the target port (where signal goes to)
    let tgtPort: CircuitPort | undefined;
    if (inputs[w.targetId]) {
      tgtPort = inputs[w.targetId];
    } else if (chips[w.targetId] && w.targetPortId) {
      tgtPort = chips[w.targetId].inputs[w.targetPortId];
    } else if (outputs[w.targetId]) {
      tgtPort = outputs[w.targetId];
    }
    if (!tgtPort) throw new Error(`Invalid target: ${w.targetId}`);

    // Connect the ports - this creates the signal flow
    srcPort.connect(tgtPort);
  }

  return { inputs, outputs, gates };
}

/**
 * Custom chip node component using fast custom signals instead of RxJS
 * This component renders a circuit chip and handles signal propagation
 */
export function ChipNodeCustom(props: NodeProps<Node<CircuitChip>>) {
  const { data, selected } = props;
  const circuitChip = useSavedChip(data.chipType);
  const definitions = useAllChips();
  const { updateNodeData } = useReactFlow<Node<CircuitChip>, Edge<Wire>>();
  const edges = useEdges<Edge<Wire>>();

  // Refs to store circuit instance and subscriptions
  const subscriptionsRef = useRef<(() => void)[]>([]);
  const circuitInstanceRef = useRef<ReturnType<typeof buildCustomCircuit> | null>(null);
  const lastCircuitChipRef = useRef<CircuitChip | null>(null);

  // State to force re-renders when circuit values change
  const [, forceUpdate] = useState({});

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
  // circuitChip is now loaded asynchronously above

  // Build the circuit instance (only when chip definition changes)
  useEffect(() => {
    if (!circuitChip) {
      return;
    }

    if (!circuitChip) {
      toast.error(`No chip definition for '${data.chipType}'`);
      return;
    }

    // Only rebuild if the chip definition actually changed
    const hasChanged = lastCircuitChipRef.current !== circuitChip;
    if (hasChanged) {
      // Clean up old circuit
      if (circuitInstanceRef.current?.gates) {
        circuitInstanceRef.current.gates.forEach((gate) => gate.destroy());
      }
      subscriptionsRef.current.forEach((unsubscribe) => unsubscribe());
      subscriptionsRef.current = [];

      // Build new circuit
      const [circuitInstance, error] = tryCatch(() => buildCustomCircuit({ ...circuitChip, id: data.id, definitions }));
      if (error) {
        toast.error(`Failed to build circuit: ${error.message}`);
        return;
      }

      circuitInstanceRef.current = circuitInstance;
      lastCircuitChipRef.current = circuitChip as CircuitChip;

      // Force re-render to pick up the new circuit instance
      forceUpdate({});
    }
  }, [circuitChip]);

  // Get the current circuit instance
  const circuitInstance = circuitInstanceRef.current;

  // Separate input and output ports
  const { inputPorts, outputPorts } = useMemo(() => {
    const ports = data?.ports || [];
    return {
      inputPorts: ports.filter((port) => port.type === PortType.IN),
      outputPorts: ports.filter((port) => port.type === PortType.OUT),
    };
  }, [data?.ports]);

  // Effect 1: Update input ports when edges change (signal comes IN)
  useEffect(() => {
    if (!circuitInstance || !data?.ports) return;

    // For each incoming wire, update the corresponding input port
    for (const source of sourceEdges) {
      if (!source?.targetPortId) continue;

      const port = data.ports.find((port) => port.id === source.targetPortId);
      if (port?.type !== PortType.IN) continue;

      const edgeValue = source.value ?? false;
      const circuitPort = circuitInstance.inputs[port.id];

      if (circuitPort && circuitPort.value !== edgeValue) {
        circuitPort.value = edgeValue; // This triggers the circuit logic internally
      }
    }
  }, [circuitInstance, sourceEdges, data.ports]);

  // Effect 2: Listen to output port changes (signal goes OUT)
  useEffect(() => {
    if (!circuitInstance || !data?.ports) return;

    // Clean up old subscriptions
    subscriptionsRef.current.forEach((unsubscribe) => unsubscribe());
    subscriptionsRef.current = [];

    // Subscribe to each output port to update the UI when values change
    const subscriptions = outputPorts
      .map((port) => {
        const outputPort = circuitInstance.outputs[port.id];
        if (!outputPort) return null;

        return outputPort.subscribe((value) => {
          // Only update UI if the value actually changed
          if (port.value !== value) {
            // Update the node data which will trigger a re-render
            updateNodeData(data.id, {
              ports: data.ports?.map((p) => (p.id === port.id ? { ...p, value } : p)),
            });
          }
        });
      })
      .filter(Boolean);

    subscriptionsRef.current = subscriptions.filter(Boolean) as (() => void)[];

    return () => {
      subscriptionsRef.current.forEach((unsubscribe) => unsubscribe());
      subscriptionsRef.current = [];
    };
  }, [circuitInstance, data.id, outputPorts, updateNodeData]);

  // Effect 3: Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (circuitInstanceRef.current?.gates) {
        circuitInstanceRef.current.gates.forEach((gate) => gate.destroy());
      }
      subscriptionsRef.current.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

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

      {/* Input ports (left side) */}
      {inputPorts.map((port, index) => (
        <PortHandle
          key={port.id}
          id={port.id}
          name={port.name ?? port.type}
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

      {/* Output ports (right side) */}
      {outputPorts.map((port, index) => (
        <PortHandle
          key={port.id}
          id={port.id}
          name={port.name ?? port.type}
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
