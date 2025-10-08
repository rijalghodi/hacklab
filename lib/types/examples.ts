import type { CircuitChip } from "./chips";

// example NAND
export const nandChip: CircuitChip = {
  name: "NAND",
  chips: [],
  ports: [
    { id: "nand.port-a", name: "a", type: "IN" },
    { id: "nand.port-b", name: "b", type: "IN" },
    { id: "nand.port-out", name: "out", type: "OUT" },
  ],
  wires: [],
  definitions: [],
};

// example NOT

export const notChip: CircuitChip = {
  name: "NOT",
  chips: [
    {
      name: "NAND",
      id: "not.chip-nand",
    },
  ],
  ports: [
    { id: "not.port-in", name: "in", type: "IN" },
    { id: "not.port-out", name: "out", type: "OUT" },
  ],
  wires: [
    {
      id: "not.wire-1",
      sourceId: "not.port-in",
      targetId: "not.chip-nand",
      targetPortId: "nand.port-a",
    },
    {
      id: "not.wire-2",
      sourceId: "not.port-in",
      targetId: "not.chip-nand",
      targetPortId: "nand.port-b",
    },
    {
      id: "not.wire-3",
      sourceId: "not.chip-nand",
      sourcePortId: "nand.port-out",
      targetId: "not.port-out",
    },
  ],
  definitions: [nandChip],
};

// example AND gate
export const andChip: CircuitChip = {
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
    { id: "and.port-a", name: "a", type: "IN" },
    { id: "and.port-b", name: "b", type: "IN" },
    { id: "and.port-out", name: "out", type: "OUT" },
  ],
  wires: [
    {
      id: "and.wire-1",
      sourceId: "and.port-a",
      targetId: "and.chip-nand",
      targetPortId: "nand.port-a",
    },
    {
      id: "and.wire-2",
      sourceId: "and.port-b",
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
    },
  ],
  definitions: [nandChip, notChip],
};

// example OR gate
export const orChip: CircuitChip = {
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
    { id: "or.port-a", name: "a", type: "IN" },
    { id: "or.port-b", name: "b", type: "IN" },
    { id: "or.port-out", name: "out", type: "OUT" },
  ],
  wires: [
    {
      id: "or.wire-1",
      sourceId: "or.port-a",
      targetId: "or.chip-not-a",
      targetPortId: "not.port-in",
    },
    {
      id: "or.wire-2",
      sourceId: "or.port-b",
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
    },
  ],
  definitions: [nandChip, notChip],
};

// example MUX (multiplexer) gate
export const muxChip: CircuitChip = {
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
    { id: "mux.port-a", name: "a", type: "IN" },
    { id: "mux.port-b", name: "b", type: "IN" },
    { id: "mux.port-sel", name: "sel", type: "IN" },
    { id: "mux.port-out", name: "out", type: "OUT" },
  ],
  wires: [
    {
      id: "mux.wire-1",
      sourceId: "mux.port-sel",
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
      targetId: "mux.chip-and-not-sel-a",
      targetPortId: "and.port-b",
    },
    {
      id: "mux.wire-4",
      sourceId: "mux.port-sel",
      targetId: "mux.chip-and-sel-b",
      targetPortId: "and.port-a",
    },
    {
      id: "mux.wire-5",
      sourceId: "mux.port-b",
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
    },
  ],
  definitions: [nandChip, notChip, andChip, orChip],
};
