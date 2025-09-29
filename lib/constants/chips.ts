import { CircuitModule, Port, PortType } from "../types/flow";

export const builtInPorts: Port[] = [
  { id: "in", type: PortType.IN, name: "in" },
  { id: "out", type: PortType.OUT, name: "out" },
];

export const builtInChips: CircuitModule[] = [
  {
    name: "NAND",
    color: "#854d0e",
    ports: [
      { id: "a", type: PortType.IN, name: "a" },
      { id: "b", type: PortType.IN, name: "b" },
      { id: "out", type: PortType.OUT, name: "out" },
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
        // ports: [
        //   { id: "a", name: PortName.IN, label: "a" },
        //   { id: "b", name: PortName.IN, label: "b" },
        //   { id: "out", name: PortName.OUT, label: "out" },
        // ],
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
      { id: "in", type: PortType.IN, name: "in" },
      { id: "out", type: PortType.OUT, name: "out" },
    ],
    version: "1.0",
    createdAt: "2025-09-16T00:00:00Z",
    createdBy: "system",
  },
];
