export enum PortType {
  IN = "in",
  OUT = "out",
}

export enum NodeType {
  CHIP = "chip",
  IN = "in",
  OUT = "out",
}

export type Port = {
  id: string;
  name: string;
  type: PortType;
  value?: boolean;
};

export type Chip = {
  id: string;
  name: string;
  type?: NodeType;
  value?: boolean;
};

export type Wire = {
  id: string;
  sourceId: string;
  targetId: string;
  sourcePortId?: string;
  targetPortId?: string;
  value?: boolean;
  color?: string;
};

export type CircuitChip = {
  id: string;
  name: string;
  type?: NodeType;
  color?: string;
  chips?: Chip[];
  wires?: Wire[];
  ports?: Port[];
  definitions?: CircuitChip[];
};
