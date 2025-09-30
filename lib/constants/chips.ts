"use client";

import { CircuitModule, NodeType } from "../types/flow";

export const builtInChips: CircuitModule[] = [
  {
    name: NodeType.IN,
    type: NodeType.IN,
    color: "#854d0e",
    nodes: [{ type: NodeType.OUT, name: NodeType.OUT, id: "out" }],
  },
  {
    name: NodeType.OUT,
    type: NodeType.OUT,
    color: "#854d0e",
    nodes: [{ type: NodeType.IN, name: NodeType.IN, id: "in" }],
  },
  {
    name: "NAND",
    type: NodeType.CHIP,
    color: "#854d0e",
    nodes: [
      { type: NodeType.IN, name: "a", id: "a" },
      { type: NodeType.IN, name: "b", id: "b" },
      { type: NodeType.OUT, name: "out", id: "out" },
    ],
    version: "1.0",
    createdAt: "2025-09-16T00:00:00Z",
    createdBy: "system",
  },
  {
    name: "NOT",
    type: NodeType.CHIP,
    color: "#831843",
    nodes: [
      {
        name: "NAND",
        id: "nand",
        type: NodeType.CHIP,
      },
      { type: NodeType.IN, name: "in", id: "in" },
      { type: NodeType.OUT, name: "out", id: "out" },
    ],
    edges: [
      {
        id: "in.nand.a",
        sourceId: "in",
        targetId: "nand",
        targetPortId: "a",
      },
      {
        id: "in.nand.b",
        sourceId: "in",
        targetId: "nand",
        targetPortId: "b",
      },
      {
        id: "nand.out",
        sourceId: "nand",
        targetId: "out",
        sourcePortId: "out",
      },
    ],
    // ports: [
    //   { type: PortType.IN, name: "in" },
    //   { type: PortType.OUT, name: "out" },
    // ],
    version: "1.0",
    createdAt: "2025-09-16T00:00:00Z",
    createdBy: "system",
  },
];

// export const getChipDefintion = (name: string) => {
//   const savedChips = useSavedChips((state) => state.savedChips);
//   return [...builtInChips, ...savedChips].find((chip) => chip.name === name);
// };
