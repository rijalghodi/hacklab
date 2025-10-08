type PortType = "IN" | "OUT";

export interface Port {
  id: string;
  name: string;
  type: PortType;
  value?: boolean;
}

export interface Chip {
  id: string;
  name: string;
  value?: boolean;
}

export interface Wire {
  id: string;
  sourceId: string;
  targetId: string;
  sourcePortId?: string;
  targetPortId?: string;
  value?: boolean;
}

export interface CircuitChip {
  name: string;
  chips: Chip[];
  wires: Wire[];
  ports: Port[];
  definitions: CircuitChip[];
}
