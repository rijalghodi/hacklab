import type { Node } from "@xyflow/react";

import { builtInChips } from "./constants/chips";
import { getSavedChipFromDB } from "./flow-utils";
import { logger } from "./logger";
import { CircuitChip, NodeType, PortType } from "./types/chips";
import { generateId } from "./utils";

export interface CreateNodeParams {
  position: { x: number; y: number };
  chipType: string;
}

export async function createNodeFromChip({ chipType, position }: CreateNodeParams): Promise<Node<CircuitChip>> {
  const chipDef = builtInChips.find((chip) => chip.chipType === chipType) || (await getSavedChipFromDB(chipType));

  if (!chipDef) {
    logger.error({
      group: "createNodeFromChip",
      message: `Chip definition not found for chip type '${chipType}'`,
      data: { chipType, builtInChips },
    });
    throw new Error(`Chip definition not found for chip type '${chipType}'`);
  }

  const nodeId = generateId();
  const type: NodeType =
    chipDef.type === NodeType.IN ? NodeType.IN : chipDef.type === NodeType.OUT ? NodeType.OUT : NodeType.CHIP;

  let name = chipDef.name;
  let ports = chipDef.ports;

  if (type === NodeType.IN) {
    name = "IN";
    ports = [
      {
        id: nodeId,
        name,
        type: PortType.OUT,
      },
    ];
  } else if (type === NodeType.OUT) {
    name = "OUT";
    ports = [
      {
        id: nodeId,
        name,
        type: PortType.IN,
      },
    ];
  }

  return {
    id: nodeId,
    position,
    type,
    data: {
      id: nodeId,
      chipType: chipDef.chipType,
      name,
      chips: chipDef.chips,
      wires: chipDef.wires,
      ports,
      definitions: [],
    },
  };
}
