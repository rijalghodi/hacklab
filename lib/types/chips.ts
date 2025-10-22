export const NAND_NAME = "NAND";
export const NAND_CHIP_TYPE = "nand";

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
  name?: string;
  type: PortType;
  value?: boolean;
  position?: {
    x?: number;
    y?: number;
  };
};

export type Chip = {
  id: string;
  chipType: string;
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

export type CircuitChipDefinition = Omit<CircuitChip, "definitions" | "id">;

export type CircuitChip = {
  id: string;
  chipType: string; // must unique
  name: string; // must unique
  type?: NodeType;
  color?: string;
  chips?: Chip[];
  wires?: Wire[];
  ports?: Port[];
  definitions: CircuitChipDefinition[];
};

export enum CircuitTreeNodeType {
  PORT = "port",
  WIRE = "wire",
  NAND_CHIP = "nand-chip",
}

export type CircuitTreeNode = {
  id: string;
  type: CircuitTreeNodeType;
  sources?: CircuitTreeNode[];
  value?: boolean;
};
