import type { Node } from "@xyflow/react";

import { builtInChips } from "./constants/chips";
import { getSavedChipFromLocalStorage } from "./flow-utils";
import { CircuitChip, NodeType, PortType } from "./types/chips";
import { generateId } from "./utils";

export interface CreateNodeParams {
  position: { x: number; y: number };
  chipType: string;
}

export function createNodeFromChip({ chipType, position }: CreateNodeParams): Node<CircuitChip> {
  const chipDef = builtInChips.find((chip) => chip.chipType === chipType) || getSavedChipFromLocalStorage(chipType);

  if (!chipDef) {
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
      definitions: chipDef.definitions,
    },
  };
}
