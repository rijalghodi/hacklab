import type { Node } from "@xyflow/react";

import { CircuitChip, NodeType, PortType } from "./types/chips";
import { generateId } from "./utils";

export interface CreateNodeParams {
  chipDef: CircuitChip;
  position: { x: number; y: number };
  droppedName: string;
}

export function createNodeFromChip({ chipDef, position, droppedName }: CreateNodeParams): Node<CircuitChip> {
  const id = generateId();
  const type: NodeType =
    chipDef.type === NodeType.IN ? NodeType.IN : chipDef.type === NodeType.OUT ? NodeType.OUT : NodeType.CHIP;

  let name = droppedName;
  let ports = chipDef.ports;

  if (type === NodeType.IN) {
    name = "IN";
    ports = [
      {
        id,
        name,
        type: PortType.OUT,
      },
    ];
  } else if (type === NodeType.OUT) {
    name = "OUT";
    ports = [
      {
        id,
        name,
        type: PortType.IN,
      },
    ];
  }

  return {
    id,
    position,
    type,
    data: {
      id,
      name,
      chips: chipDef.chips,
      wires: chipDef.wires,
      ports,
      definitions: chipDef.definitions,
    },
  };
}
