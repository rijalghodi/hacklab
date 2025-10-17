"use client";

import type { Node } from "@xyflow/react";
import type { Edge } from "@xyflow/react";

import { builtInChips } from "./constants/chips";
import { LOCAL_STORAGE_SAVED_CHIPS } from "./constants/names";
import type { Chip, Wire } from "./types/chips";
import { CircuitChip, NodeType, Port, PortType } from "./types/chips";

export function isValidPosition(position: { x?: number; y?: number }): boolean {
  return (
    position !== undefined && position !== null && typeof position.x === "number" && typeof position.y === "number"
  );
}

export function getValidPosition(position?: { x?: number; y?: number }): { x: number; y: number } {
  if (!position || !isValidPosition(position)) {
    return { x: 0, y: 0 };
  }
  return { x: position.x!, y: position.y! };
}

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
      position: getValidPosition(node.position),
    }));

  const ports: Port[] = nodes
    .filter((node) => node.type === NodeType.IN || node.type === NodeType.OUT)
    .map((node) => ({
      id: node.data.id,
      name: node.data.name,
      type: node.type === NodeType.IN ? PortType.IN : PortType.OUT,
      position: getValidPosition(node.position),
    }));

  const wires = edges.map((edge) => {
    return {
      id: edge.id,
      sourceId: edge.data?.sourceId || "",
      targetId: edge.data?.targetId || "",
      sourcePortId: edge.data?.sourcePortId || null,
      targetPortId: edge.data?.targetPortId || null,
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
  // let savedChips: CircuitChip[] = [];
  const savedChips = getSavedChipsFromLocalStorage();
  // if (typeof window !== "undefined") {
  //   try {
  //     const chipsStr = window.localStorage.getItem(LOCAL_STORAGE_SAVED_CHIPS);
  //     if (chipsStr) {
  //       const ls = JSON.parse(chipsStr);
  //       savedChips = ls.state.savedChips;
  //     }
  //   } catch (_e) {
  //     savedChips = [];
  //   }
  // }
  const allChips = [...savedChips, ...builtInChips];
  console.log("234 allChips", allChips);

  const nodes: Node<CircuitChip>[] =
    circuit.chips
      ?.map((chip) => {
        const savedChip = allChips.find((savedChip) => savedChip.name === chip.name);
        if (!savedChip) {
          return null;
        }
        return {
          id: chip.id,
          position: getValidPosition(chip.position),
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

  // console.log("234 nodes", circuit);
  console.log("234 nodes", nodes);

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
          position: getValidPosition(port.position),
        } as Node<CircuitChip>;
      })
      .filter((node): node is Node<CircuitChip> => node !== null) || [];

  console.log("234 portNodes", portNodes);
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

  console.log("234 edges", edges);
  return {
    nodes: [...nodes, ...portNodes],
    edges,
  };
}

export function getSavedChipsFromLocalStorage(): CircuitChip[] {
  if (typeof window !== "undefined") {
    try {
      const chipsStr = window.localStorage.getItem(LOCAL_STORAGE_SAVED_CHIPS);
      if (chipsStr) {
        const ls = JSON.parse(chipsStr);
        return ls.state.savedChips;
      }
    } catch (_e) {
      return [];
    }
  }
  return [];
}

export function getSavedChipFromLocalStorage(chipId: string): CircuitChip | null {
  const savedChips = getSavedChipsFromLocalStorage();
  return savedChips.find((chip) => chip.id === chipId) || null;
}
