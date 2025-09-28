import { CircuitModule } from "../types/flow";

export const builtInChips: CircuitModule[] = [
  {
    name: "NAND",
    color: "#854d0e",
    chips: [],
    wires: [],
    ports: [
      { id: "a", type: "input", name: "a" },
      { id: "b", type: "input", name: "b" },
      { id: "out", type: "output", name: "out" },
    ],
    version: "1.0",
    createdAt: "2025-09-16T00:00:00Z",
    createdBy: "system",
  },
  {
    name: "NOT",
    color: "#831843",
    chips: [
      {
        id: "nand1",
        name: "NAND",
        ports: [
          { id: "a", type: "input", name: "a" },
          { id: "b", type: "input", name: "b" },
          { id: "out", type: "output", name: "out" },
        ],
      },
    ],
    wires: [
      {
        id: "w1",
        sourceId: "port.in",
        targetId: "nand1",
        targetPortId: "a",
      },
      {
        id: "w2",
        sourceId: "port.in",
        targetId: "nand1",
        targetPortId: "b",
      },
      {
        id: "w3",
        sourceId: "nand1",
        targetId: "port.out",
        sourcePortId: "out",
      },
    ],
    ports: [
      { id: "in", type: "input", name: "in" },
      { id: "out", type: "output", name: "out" },
    ],
    version: "1.0",
    createdAt: "2025-09-16T00:00:00Z",
    createdBy: "system",
  },
];
