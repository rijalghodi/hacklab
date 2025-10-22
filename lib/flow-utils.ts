"use client";

import type { Node } from "@xyflow/react";
import type { Edge } from "@xyflow/react";

import { builtInChips } from "./constants/chips";
import { chipsDb, CircuitChipDB } from "./db/chips-db";
// import { LOCAL_STORAGE_SAVED_CHIPS } from "./constants/names";
import { logger } from "./logger";
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
  logger.debug({
    group: "flowToCircuit",
    message: `Converting flow to circuit: ${nodes.length} nodes, ${edges.length} edges`,
  });
  const chips: Chip[] = nodes
    .filter((node) => node.type === NodeType.CHIP)
    .map((node) => ({
      id: node.id,
      name: node.data.name,
      chipType: node.data.chipType,
      position: getValidPosition(node.position),
    }));

  const ports: Port[] = nodes
    .filter((node) => node.type === NodeType.IN || node.type === NodeType.OUT)
    .map((node) => ({
      id: node.data.id,
      name: node.data.name,
      type: node.type === NodeType.IN ? PortType.IN : PortType.OUT,
      chipType: node.data.chipType,
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

export async function circuitToFlow(circuit: Pick<CircuitChip, "chips" | "ports" | "wires">): Promise<{
  nodes: Node<CircuitChip>[];
  edges: Edge<Wire>[];
}> {
  logger.debug({
    group: "circuitToFlow",
    message: `Converting circuit to flow: ${circuit.chips?.length || 0} chips, ${circuit.wires?.length || 0} wires`,
  });

  const savedChips = await getSavedChipsFromDB();
  if (!savedChips) {
    throw new Error("Failed to get saved chips from DB");
  }

  const allChips = [...savedChips, ...builtInChips];
  logger.debug({
    group: "circuitToFlow",
    message: `Found ${allChips.length} total chips (${savedChips.length} saved + ${builtInChips.length} built-in)`,
  });

  logger.debug({
    group: "circuitToFlow",
    message: "All chips:",
    data: allChips,
  });

  const nodes: Node<CircuitChip>[] =
    circuit.chips
      ?.map((chip) => {
        const savedChip = allChips.find((savedChip) => savedChip.chipType === chip.chipType);
        if (!savedChip) {
          return null;
        }
        return {
          id: chip.id,
          position: getValidPosition(chip.position),
          type: NodeType.CHIP,
          data: {
            id: chip.id,
            name: savedChip.name || savedChip.chipType,
            chipType: savedChip.chipType,
            chips: savedChip.chips,
            wires: savedChip.wires,
            ports: savedChip.ports,
          },
        } as Node<CircuitChip>;
      })
      .filter((node): node is Node<CircuitChip> => node !== null) || [];

  logger.debug({ group: "circuitToFlow", message: `Created ${nodes.length} chip nodes`, data: nodes });

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
            chipType: nodeType,
            value: port.value,
            definitions: [],
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

  logger.debug({ group: "circuitToFlow", message: `Created ${portNodes.length} port nodes`, data: portNodes });
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

  logger.debug({ group: "circuitToFlow", message: `Created ${edges.length} edges`, data: edges });

  return {
    nodes: [...nodes, ...portNodes],
    edges,
  };
}

export async function getSavedChipsFromDB(): Promise<CircuitChipDB[]> {
  if (typeof window !== "undefined") {
    try {
      // const chipsStr = window.localStorage.getItem(LOCAL_STORAGE_SAVED_CHIPS);
      const savedChips = await chipsDb.savedChips.toArray();
      return savedChips;
    } catch (error) {
      logger.error({ group: "getSavedChipsFromLocalStorage", message: `Error getting saved chips: ${error}` });
      return [];
    }
  }
  return [];
}

export async function getSavedChipFromDB(chipType: string): Promise<CircuitChipDB | null> {
  const savedChips = await getSavedChipsFromDB();
  return savedChips.find((chip) => chip.chipType === chipType) || null;
}
