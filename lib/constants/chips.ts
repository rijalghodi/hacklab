import type { CircuitChip } from "../types/chips";
import { NodeType, PortType } from "../types/chips";

// Input node
export const inChip: CircuitChip = {
  id: "in",
  name: "IN",
  color: "#854d0e",
  type: NodeType.IN,
  chips: [],
  // ports: [{ id: "in.port-out", name: "out", type: PortType.OUT }],
  wires: [],
  definitions: [],
};

// Output node
export const outChip: CircuitChip = {
  id: "out",
  name: "OUT",
  color: "#854d0e",
  type: NodeType.OUT,
  chips: [],
  // ports: [{ id: "out.port-in", name: "in", type: PortType.IN }],
  wires: [],
  definitions: [],
};

// NAND
export const nandChip: CircuitChip = {
  id: "nand",
  name: "NAND",
  type: NodeType.CHIP,
  chips: [],
  ports: [
    { id: "nand.port-a", name: "a", type: PortType.IN },
    { id: "nand.port-b", name: "b", type: PortType.IN },
    { id: "nand.port-out", name: "out", type: PortType.OUT },
  ],
  wires: [],
  definitions: [],
};

// NOT

export const notChip: CircuitChip = {
  id: "not",
  name: "NOT",
  chips: [
    {
      name: "NAND",
      id: "not.chip-nand",
    },
  ],
  ports: [
    { id: "not.port-in", name: "in", type: PortType.IN },
    { id: "not.port-out", name: "out", type: PortType.OUT },
  ],
  wires: [
    {
      id: "not.wire-1",
      sourceId: "not.port-in",
      sourcePortId: null,
      targetId: "not.chip-nand",
      targetPortId: "nand.port-a",
    },
    {
      id: "not.wire-2",
      sourceId: "not.port-in",
      sourcePortId: null,
      targetId: "not.chip-nand",
      targetPortId: "nand.port-b",
    },
    {
      id: "not.wire-3",
      sourceId: "not.chip-nand",
      sourcePortId: "nand.port-out",
      targetId: "not.port-out",
      targetPortId: null,
    },
  ],
  definitions: [nandChip],
};

// AND
export const andChip: CircuitChip = {
  id: "and",
  name: "AND",
  chips: [
    {
      name: "NAND",
      id: "and.chip-nand",
    },
    {
      name: "NOT",
      id: "and.chip-not",
    },
  ],
  ports: [
    { id: "and.port-a", name: "a", type: PortType.IN },
    { id: "and.port-b", name: "b", type: PortType.IN },
    { id: "and.port-out", name: "out", type: PortType.OUT },
  ],
  wires: [
    {
      id: "and.wire-1",
      sourceId: "and.port-a",
      sourcePortId: null,
      targetId: "and.chip-nand",
      targetPortId: "nand.port-a",
    },
    {
      id: "and.wire-2",
      sourceId: "and.port-b",
      sourcePortId: null,
      targetId: "and.chip-nand",
      targetPortId: "nand.port-b",
    },
    {
      id: "and.wire-3",
      sourceId: "and.chip-nand",
      sourcePortId: "nand.port-out",
      targetId: "and.chip-not",
      targetPortId: "not.port-in",
    },
    {
      id: "and.wire-4",
      sourceId: "and.chip-not",
      sourcePortId: "not.port-out",
      targetId: "and.port-out",
      targetPortId: null,
    },
  ],
  definitions: [nandChip, notChip],
};

// OR
export const orChip: CircuitChip = {
  id: "or",
  name: "OR",
  chips: [
    {
      name: "NOT",
      id: "or.chip-not-a",
    },
    {
      name: "NOT",
      id: "or.chip-not-b",
    },
    {
      name: "NAND",
      id: "or.chip-nand",
    },
  ],
  ports: [
    { id: "or.port-a", name: "a", type: PortType.IN },
    { id: "or.port-b", name: "b", type: PortType.IN },
    { id: "or.port-out", name: "out", type: PortType.OUT },
  ],
  wires: [
    {
      id: "or.wire-1",
      sourceId: "or.port-a",
      sourcePortId: null,
      targetId: "or.chip-not-a",
      targetPortId: "not.port-in",
    },
    {
      id: "or.wire-2",
      sourceId: "or.port-b",
      sourcePortId: null,
      targetId: "or.chip-not-b",
      targetPortId: "not.port-in",
    },
    {
      id: "or.wire-3",
      sourceId: "or.chip-not-a",
      sourcePortId: "not.port-out",
      targetId: "or.chip-nand",
      targetPortId: "nand.port-a",
    },
    {
      id: "or.wire-4",
      sourceId: "or.chip-not-b",
      sourcePortId: "not.port-out",
      targetId: "or.chip-nand",
      targetPortId: "nand.port-b",
    },
    {
      id: "or.wire-5",
      sourceId: "or.chip-nand",
      sourcePortId: "nand.port-out",
      targetId: "or.port-out",
      targetPortId: null,
    },
  ],
  definitions: [nandChip, notChip],
};

// MUX
export const muxChip: CircuitChip = {
  id: "mux",
  name: "MUX",
  chips: [
    {
      name: "NOT",
      id: "mux.chip-not-sel",
    },
    {
      name: "AND",
      id: "mux.chip-and-not-sel-a",
    },
    {
      name: "AND",
      id: "mux.chip-and-sel-b",
    },
    {
      name: "OR",
      id: "mux.chip-or",
    },
  ],
  ports: [
    { id: "mux.port-a", name: "a", type: PortType.IN },
    { id: "mux.port-b", name: "b", type: PortType.IN },
    { id: "mux.port-sel", name: "sel", type: PortType.IN },
    { id: "mux.port-out", name: "out", type: PortType.OUT },
  ],
  wires: [
    {
      id: "mux.wire-1",
      sourceId: "mux.port-sel",
      sourcePortId: null,
      targetId: "mux.chip-not-sel",
      targetPortId: "not.port-in",
    },
    {
      id: "mux.wire-2",
      sourceId: "mux.chip-not-sel",
      sourcePortId: "not.port-out",
      targetId: "mux.chip-and-not-sel-a",
      targetPortId: "and.port-a",
    },
    {
      id: "mux.wire-3",
      sourceId: "mux.port-a",
      sourcePortId: null,
      targetId: "mux.chip-and-not-sel-a",
      targetPortId: "and.port-b",
    },
    {
      id: "mux.wire-4",
      sourceId: "mux.port-sel",
      sourcePortId: null,
      targetId: "mux.chip-and-sel-b",
      targetPortId: "and.port-a",
    },
    {
      id: "mux.wire-5",
      sourceId: "mux.port-b",
      sourcePortId: null,
      targetId: "mux.chip-and-sel-b",
      targetPortId: "and.port-b",
    },
    {
      id: "mux.wire-6",
      sourceId: "mux.chip-and-not-sel-a",
      sourcePortId: "and.port-out",
      targetId: "mux.chip-or",
      targetPortId: "or.port-a",
    },
    {
      id: "mux.wire-7",
      sourceId: "mux.chip-and-sel-b",
      sourcePortId: "and.port-out",
      targetId: "mux.chip-or",
      targetPortId: "or.port-b",
    },
    {
      id: "mux.wire-8",
      sourceId: "mux.chip-or",
      sourcePortId: "or.port-out",
      targetId: "mux.port-out",
      targetPortId: null,
    },
  ],
  definitions: [nandChip, notChip, andChip, orChip],
};

export const builtInChips: CircuitChip[] = [inChip, outChip, nandChip];
