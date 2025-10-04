import { Edge as XYFlowEdge, Node as XYFlowNode } from "@xyflow/react";

export enum NodeType {
  IN = "IN",
  OUT = "OUT",
  CHIP = "CHIP",
}

export enum ChipName {
  IN = "IN",
  OUT = "OUT",
  NAND = "NAND",
  NOT = "NOT",
}

export const NAND_OUT_NAME = "out";

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
  name: string | ChipName; // e.g. "AND", "OR", "FULL_ADDER"
  color?: string;
  position?: Position;
  type: ChipType;
  // ports?: Port[];
};

export type Chip = BaseChip & {
  id: string;
};

export type StatefulChip = Omit<Chip, "ports"> & {
  ports?: StatefulPort[];
};

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

export type Circuit = {
  type: NodeType;
  name: string; // e.g. "ALU"
  label?: string; // e.g. "ALU 1"
  description?: string;
  color?: string;
  nodes: Chip[];
  edges?: Wire[];
  version?: string;
  createdAt?: string;
  createdBy?: string;
};

// export type Circuit = {
//   name: string;
//   nodes: XYFlowNode<StatefulChip>[];
//   edges: XYFlowEdge<StatefulWire>[];
// };

// ==== Circuit Tree ====

export type CircuitSource = {
  portName: string; // port id
  nodes: CircuitNode[];
};

export type CircuitNode = {
  // id?: string;
  name: string;
  type: NodeType;
  sources?: CircuitSource[];
};

export type CircuitOutputs = Record<string, CircuitNode[]>;

// export type InputConnections = Record<string, CircuitNode[]>;
// export type CircuitTree1 = {
//   name: string;
//   outputs: InputConnections;
// };

// version?: string;
// createdAt?: string;
// createdBy?: string;

// export type CircuitTreeOut = {
//   value?: boolean;
//   name: string;
//   id: string;
//   sources: Record<string, CircuitSource[]>;
// };

// export type CircuitTree = {
//   version?: string;
//   createdAt?: string;
//   createdBy?: string;
//   // outputs: CircuitTreeOut[];
//   sources: Record<string, CircuitSource[]>;
// };

// === Example ===
const nandExample: CircuitOutputs = {
  out: [
    {
      name: "NAND",
      type: NodeType.CHIP,
      sources: [
        {
          portName: "a",
          nodes: [
            {
              name: "a",
              type: NodeType.IN,
            },
          ],
        },
        {
          portName: "b",
          nodes: [
            {
              name: "b",
              type: NodeType.IN,
            },
          ],
        },
      ],
    },
  ],
};

export const exampleCircuitTree0: CircuitOutputs = {
  out: [
    {
      name: "out",
      type: NodeType.OUT,
      sources: [
        {
          portName: "a",
          nodes: [
            {
              name: "NOT",
              type: NodeType.CHIP,
              sources: [
                {
                  portName: "in",
                  nodes: [
                    {
                      name: "in",
                      type: NodeType.IN,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
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
