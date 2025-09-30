import { Edge as XYFlowEdge, Node as XYFlowNode } from "@xyflow/react";

export enum NodeType {
  IN = "IN",
  OUT = "OUT",
  CHIP = "CHIP",
}

export type PortType = NodeType.IN | NodeType.OUT;
export type ChipType = NodeType;

type Position = {
  x: number;
  y: number;
};

// Port

export type BasePort = {
  name: string; // e.g. "a", "b", "out"
  type: PortType;
  color?: string;
  label?: string;
};

export type Port = BasePort & {
  id: string;
};

export type StatefulPort = Port & {
  value?: boolean;
};

// Chip

export type BaseChip = {
  name: string; // e.g. "AND", "OR", "FULL_ADDER"
  color?: string;
  position?: Position;
  type: ChipType;
  ports?: Port[];
};

export type Chip = BaseChip & {
  id: string;
};

export type StatefulChip = Omit<Chip, "ports"> & {
  ports?: StatefulPort[];
};

// Node
// export type BaseNode = BaseChip;
// export type Node = Chip;
// export type StatefulNode = StatefulPort | StatefulChip;

export type Wire = {
  id: string;
  sourceId: string; // Chip.id or Port.id with prefix "port."
  targetId: string; // Chip.id or Port.id with prefix "port."
  sourcePortId?: string | null; // Port.id of source
  targetPortId?: string | null; // Port.id of target
  color?: string;
};

export type StatefulWire = Wire & {
  value?: boolean;
};

export type CircuitModule = {
  type: NodeType;
  name: string; // e.g. "ALU"
  label?: string; // e.g. "ALU 1"
  description?: string;
  color?: string;
  nodes?: Chip[];
  edges?: Wire[];
  version?: string;
  createdAt?: string;
  createdBy?: string;
};

// export type StatefulCircuitModule = Omit<CircuitModule, "chips" | "wires" | "ports"> & {
//   nodes?: StatefulChip[];
//   edges?: StatefulWire[];
// };

export type Circuit = {
  name: string;
  nodes: XYFlowNode<StatefulChip>[];
  edges: XYFlowEdge<StatefulWire>[];
};

// export type Circuit = CircuitModule & {
//   definitions: CircuitModule[];
// };

// Example
// export const NotGate: Circuit = {
//   name: "NOT",
//   chips: [
//     {
//       id: "nand1",
//       name: "NAND",
//       position: { x: 100, y: 100 },
//       ports: [
//         { id: "a", name: "a", type: "input" },
//         { id: "b", name: "b", type: "input" },
//         { id: "out", name: "out", type: "output" },
//       ],
//     },
//   ],
//   wires: [
//     {
//       id: "w1",
//       sourceId: "port.in",
//       targetId: "nand1",
//       targetPortId: "a",
//     },
//     {
//       id: "w2",
//       sourceId: "port.in",
//       targetId: "nand1",
//       targetPortId: "b",
//     },
//     {
//       id: "w3",
//       sourceId: "nand1",
//       targetId: "port.out",
//       sourcePortId: "out",
//     },
//   ],
//   ports: [
//     {
//       id: "in",
//       type: "input",
//       name: "in",
//     },
//     {
//       id: "out",
//       type: "output",
//       name: "out",
//     },
//   ],
//   version: "1.0",
//   createdAt: "2025-09-16T00:00:00Z",
//   createdBy: "system",
//   definitions: [
//     {
//       name: "NAND",
//       chips: [],
//       wires: [],
//       ports: [
//         { id: "a", type: "input", name: "a" },
//         { id: "b", type: "input", name: "b" },
//         { id: "out", type: "output", name: "out" },
//       ],
//       version: "1.0",
//       createdAt: "2025-09-16T00:00:00Z",
//       createdBy: "system",
//     },
//   ],
// };
