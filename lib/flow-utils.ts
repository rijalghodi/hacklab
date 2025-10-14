"use client";

import type { Node } from "@xyflow/react";
import type { Edge } from "@xyflow/react";

import { LOCAL_STORAGE_SAVED_CHIPS } from "./constants/names";
import type { Chip, Wire } from "./types/chips";
import { CircuitChip, NodeType, Port, PortType } from "./types/chips";

export function flowToCircuit(
  nodes: Node<CircuitChip>[],
  edges: Edge<Wire>[],
): Pick<CircuitChip, "chips" | "ports" | "wires"> {
  console.log("555", nodes, edges);
  const chips: Chip[] = nodes
    .filter((node) => node.type === NodeType.CHIP)
    .map((node) => ({
      id: node.id,
      name: node.data.name,
    }));

  const ports: Port[] = nodes
    .filter((node) => node.type === NodeType.IN || node.type === NodeType.OUT)
    .map((node) => ({
      id: node.data.id,
      name: node.data.name,
      type: node.type === NodeType.IN ? PortType.IN : PortType.OUT,
    }));

  const wires = edges.map((edge) => {
    return {
      id: edge.id,
      sourceId: edge.data?.sourceId || "",
      targetId: edge.data?.targetId || "",
      sourcePortId: edge.data?.sourcePortId,
      targetPortId: edge.data?.targetPortId,
    };
  });

  return {
    chips,
    wires,
    ports,
  };
}

export function circuitToFlow(circuit: Pick<CircuitChip, "chips" | "ports" | "wires">): {
  nodes: Node<CircuitChip>[];
  edges: Edge<Wire>[];
} {
  console.log("circuit", circuit);

  // Get saved chips from local storage using constants.LOCAL_STORAGE_SAVED_CHIPS
  let savedChips: any[] = [];
  if (typeof window !== "undefined") {
    try {
      const chipsStr = window.localStorage.getItem(LOCAL_STORAGE_SAVED_CHIPS);
      if (chipsStr) {
        const ls = JSON.parse(chipsStr);
        savedChips = ls.state.savedChips;
      }
    } catch (_e) {
      savedChips = [];
    }
  }

  const nodes: Node<CircuitChip>[] =
    circuit.chips
      ?.map((chip) => {
        const savedChip = savedChips.find((savedChip) => savedChip.id === chip.id);
        if (!savedChip) {
          return null;
        }
        return {
          id: chip.id,
          position: { x: 100, y: 100 },
          type: NodeType.CHIP,
          data: {
            id: chip.id,
            name: chip.name,
            chips: savedChip.chips,
            wires: savedChip.wires,
            ports: savedChip.ports,
            definitions: savedChip.definitions,
          },
        } as Node<CircuitChip>;
      })
      .filter((node): node is Node<CircuitChip> => node !== null) || [];

  const portNodes: Node<CircuitChip>[] =
    circuit.ports
      ?.map((port) => {
        if (port.type !== PortType.IN && port.type !== PortType.OUT) {
          return null;
        }
        const nodeType = port.type === PortType.IN ? NodeType.IN : NodeType.OUT;
        return {
          id: port.id,
          type: nodeType,
          data: {
            id: port.id,
            name: port.name,
            type: nodeType,
            value: port.value,
            ports: [
              {
                id: port.id,
                name: port.name,
                type: port.type,
                value: port.value,
              },
            ],
          },
          position: { x: 100, y: 100 },
        } as Node<CircuitChip>;
      })
      .filter((node): node is Node<CircuitChip> => node !== null) || [];

  console.log("123 portNodes", portNodes);
  const edges: Edge<Wire>[] =
    circuit.wires?.map((wire) => ({
      id: wire.id,
      source: wire.sourceId,
      target: wire.targetId,
      sourceHandle: wire.sourcePortId,
      targetHandle: wire.targetPortId,
      type: "wire",
      data: {
        id: wire.id,
        sourceId: wire.sourceId,
        targetId: wire.targetId,
        sourcePortId: wire.sourcePortId,
        targetPortId: wire.targetPortId,
      },
    })) || [];

  console.log("123 edges", edges);
  return {
    nodes: [...nodes, ...portNodes],
    edges,
  };
}
