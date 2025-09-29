import { Edge, Node } from "@xyflow/react";

export enum PortType {
  IN = "IN",
  OUT = "OUT",
}

type Position = {
  x: number;
  y: number;
};

export type Port = {
  id: string;
  name: string; // e.g. "a", "b", "out"
  type: PortType;
  color?: string;
  label?: string;
};

export type StatefulPort = Port & {
  value?: boolean;
};

export type Chip = {
  id: string;
  name: string; // e.g. "AND", "OR", "FULL_ADDER"
  color?: string;
  position?: Position;
  ports?: Port[]; // pin definitions
};

export type StatefulChip = Omit<Chip, "ports"> & {
  ports?: StatefulPort[];
};

export type Wire = {
  id: string;
  sourceId: string; // Chip.id or Port.id with prefix "port."
  targetId: string; // Chip.id or Port.id with prefix "port."
  sourcePortId?: string; // Port.id of source
  targetPortId?: string; // Port.id of target
  color?: string;
};

export type StatefulWire = Wire & {
  value?: boolean;
};

export type CircuitPort = {
  id: string;
  type: PortType;
  name: string; // "IN", "OUT", "CLK"
  label?: string;
};

export type StatefulCircuitPort = CircuitPort & {
  value?: boolean;
};

export type CircuitModule = {
  name: string; // e.g. "ALU"
  label?: string; // e.g. "ALU 1"
  description?: string;
  color?: string;
  chips?: Chip[]; // minus input and output nodes
  wires?: Wire[];
  ports?: CircuitPort[];
  version?: string;
  createdAt?: string;
  createdBy?: string;
};

export type StatefulCircuitModule = Omit<CircuitModule, "chips" | "wires" | "ports"> & {
  chips?: StatefulChip[];
  wires?: StatefulWire[];
  ports?: StatefulCircuitPort[];
};

export type Circuit = {
  name: string;
  chips: Node<Chip>[];
  wires: Edge<Wire>[];
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
