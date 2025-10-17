export const NAND_NAME = "NAND";

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
  position?: {
    x?: number;
    y?: number;
  };
};

export type Chip = {
  id: string;
  name: string;
  // type?: NodeType;
  value?: boolean;
  position?: {
    x?: number;
    y?: number;
  };
};

export type Wire = {
  id: string;
  sourceId: string;
  targetId: string;
  sourcePortId: string | null;
  targetPortId: string | null;
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
