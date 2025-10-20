import { NAND_CHIP_TYPE, PortType } from "../types/chips";
import { CircuitChip } from "../types/chips";

export const nandChipDemo: CircuitChip = {
  id: "nand-demo",
  name: "NAND DEMO",
  chipType: "nand-demo",
  chips: [
    {
      chipType: NAND_CHIP_TYPE,
      id: "nand",
      position: { x: 0, y: 0 },
    },
  ],
  ports: [
    { id: "a", name: "a", type: PortType.IN, position: { x: -110, y: -20 } },
    { id: "b", name: "b", type: PortType.IN, position: { x: -110, y: 30 } },
    { id: "out", name: "out", type: PortType.OUT, position: { x: 90, y: 3 } },
  ],
  wires: [
    {
      id: "wire-1",
      sourceId: "a",
      sourcePortId: "a",
      targetId: "nand",
      targetPortId: "nand.port-a",
    },
    {
      id: "wire-2",
      sourceId: "b",
      sourcePortId: "b",
      targetId: "nand",
      targetPortId: "nand.port-b",
    },
    {
      id: "wire-3",
      sourceId: "nand",
      sourcePortId: "nand.port-out",
      targetId: "out",
      targetPortId: "out",
    },
  ],
  definitions: [],
};

export const notChip: CircuitChip = {
  id: "vf2103l8",
  name: "NOT",
  chipType: "vf2103l8",
  color: "#d04242",
  chips: [
    {
      id: "35iark5p",
      chipType: "nand",
      position: { x: 337, y: 191 },
    },
  ],
  wires: [
    {
      id: "zk2c96ev",
      sourceId: "ysv3o6cg",
      targetId: "35iark5p",
      sourcePortId: "ysv3o6cg",
      targetPortId: "nand.port-a",
    },
    {
      id: "jm77jips",
      sourceId: "35iark5p",
      targetId: "9861akqh",
      sourcePortId: "nand.port-out",
      targetPortId: "9861akqh",
    },
    {
      id: "yjqpg01u",
      sourceId: "ysv3o6cg",
      targetId: "35iark5p",
      sourcePortId: "ysv3o6cg",
      targetPortId: "nand.port-b",
    },
  ],
  ports: [
    {
      id: "ysv3o6cg",
      name: "IN",
      type: PortType.IN,
      position: { x: 201.5, y: 192.5 },
    },
    {
      id: "9861akqh",
      name: "OUT",
      type: PortType.OUT,
      position: { x: 460, y: 194.5 },
    },
  ],
  definitions: [],
};

export const andChip: CircuitChip = {
  id: "tpmukpvw",
  name: "AND",
  chipType: "tpmukpvw",
  color: "#1c71d8",
  chips: [
    {
      id: "bu0sn94u",
      chipType: "nand",
      position: { x: 291, y: 196 },
    },
    {
      id: "b1jl6qad",
      chipType: "vf2103l8",
      position: { x: 412, y: 197 },
    },
  ],
  wires: [
    {
      id: "3rpmjn4x",
      sourceId: "xqz6exxl",
      targetId: "bu0sn94u",
      sourcePortId: "xqz6exxl",
      targetPortId: "nand.port-a",
    },
    {
      id: "pyjyzaal",
      sourceId: "23xwycvx",
      targetId: "bu0sn94u",
      sourcePortId: "23xwycvx",
      targetPortId: "nand.port-b",
    },
    {
      id: "j83ipyxz",
      sourceId: "bu0sn94u",
      targetId: "b1jl6qad",
      sourcePortId: "nand.port-out",
      targetPortId: "ysv3o6cg",
    },
    {
      id: "7b98ixi8",
      sourceId: "b1jl6qad",
      targetId: "eoqc0cw1",
      sourcePortId: "9861akqh",
      targetPortId: "eoqc0cw1",
    },
  ],
  ports: [
    {
      id: "xqz6exxl",
      name: "IN",
      type: PortType.IN,
      position: { x: 165.5, y: 159 },
    },
    {
      id: "23xwycvx",
      name: "IN",
      type: PortType.IN,
      position: { x: 170.5, y: 227 },
    },
    {
      id: "eoqc0cw1",
      name: "OUT",
      type: PortType.OUT,
      position: { x: 556.5, y: 228.5 },
    },
  ],
  definitions: [],
};

export const orChip: CircuitChip = {
  id: "peyb7gaa",
  name: "OR",
  chipType: "peyb7gaa",
  color: "#f5c211",
  chips: [
    {
      id: "d5sqq6ht",
      chipType: "vf2103l8",
      position: { x: 273, y: 178.5 },
    },
    {
      id: "0c0tb8w8",
      chipType: "vf2103l8",
      position: { x: 278, y: 269 },
    },
    {
      id: "oedr7ivx",
      chipType: "tpmukpvw",
      position: { x: 399, y: 229 },
    },
    {
      id: "stygln64",
      chipType: "vf2103l8",
      position: { x: 525, y: 244.5 },
    },
  ],
  wires: [
    {
      id: "kjass87f",
      sourceId: "0z5b3wkd",
      targetId: "d5sqq6ht",
      sourcePortId: "0z5b3wkd",
      targetPortId: "ysv3o6cg",
    },
    {
      id: "b1kn780k",
      sourceId: "zpom4gld",
      targetId: "0c0tb8w8",
      sourcePortId: "zpom4gld",
      targetPortId: "ysv3o6cg",
    },
    {
      id: "pkiewre7",
      sourceId: "0c0tb8w8",
      targetId: "oedr7ivx",
      sourcePortId: "9861akqh",
      targetPortId: "23xwycvx",
    },
    {
      id: "vatdioqs",
      sourceId: "d5sqq6ht",
      targetId: "oedr7ivx",
      sourcePortId: "9861akqh",
      targetPortId: "xqz6exxl",
    },
    {
      id: "kd0moe7g",
      sourceId: "oedr7ivx",
      targetId: "stygln64",
      sourcePortId: "eoqc0cw1",
      targetPortId: "ysv3o6cg",
    },
    {
      id: "0xprb7ee",
      sourceId: "stygln64",
      targetId: "z0aznhjz",
      sourcePortId: "9861akqh",
      targetPortId: "z0aznhjz",
    },
  ],
  ports: [
    {
      id: "0z5b3wkd",
      name: "IN",
      type: PortType.IN,
      position: { x: 149.5, y: 178.5 },
    },
    {
      id: "zpom4gld",
      name: "IN",
      type: PortType.IN,
      position: { x: 157, y: 270 },
    },
    {
      id: "z0aznhjz",
      name: "OUT",
      type: PortType.OUT,
      position: { x: 642, y: 237.5 },
    },
  ],
  definitions: [],
};

export const xorChip: CircuitChip = {
  id: "0tv6m1kx",
  name: "XOR",
  chipType: "0tv6m1kx",
  color: "#c51286",
  chips: [
    {
      id: "cfbtizco",
      chipType: "vf2103l8",
      position: { x: 234.5, y: 126 },
    },
    {
      id: "vfa2obvv",
      chipType: "vf2103l8",
      position: { x: 245.5, y: 269.5 },
    },
    {
      id: "6obbpnkk",
      chipType: "tpmukpvw",
      position: { x: 405.5, y: 165.5 },
    },
    {
      id: "g8c4d8b6",
      chipType: "tpmukpvw",
      position: { x: 416.5, y: 223 },
    },
    {
      id: "rrghvr5f",
      chipType: "peyb7gaa",
      position: { x: 514.5, y: 196.5 },
    },
  ],
  wires: [
    {
      id: "02nw5vso",
      sourceId: "yjh8of4u",
      targetId: "cfbtizco",
      sourcePortId: "yjh8of4u",
      targetPortId: "ysv3o6cg",
    },
    {
      id: "ru0yzaek",
      sourceId: "8yczb1ge",
      targetId: "6obbpnkk",
      sourcePortId: "8yczb1ge",
      targetPortId: "23xwycvx",
    },
    {
      id: "pppdnrn3",
      sourceId: "cfbtizco",
      targetId: "6obbpnkk",
      sourcePortId: "9861akqh",
      targetPortId: "xqz6exxl",
    },
    {
      id: "isr4597y",
      sourceId: "8yczb1ge",
      targetId: "vfa2obvv",
      sourcePortId: "8yczb1ge",
      targetPortId: "ysv3o6cg",
    },
    {
      id: "qzm7cclh",
      sourceId: "yjh8of4u",
      targetId: "g8c4d8b6",
      sourcePortId: "yjh8of4u",
      targetPortId: "xqz6exxl",
    },
    {
      id: "upfoi5tn",
      sourceId: "vfa2obvv",
      targetId: "g8c4d8b6",
      sourcePortId: "9861akqh",
      targetPortId: "23xwycvx",
    },
    {
      id: "tm7d0wn7",
      sourceId: "6obbpnkk",
      targetId: "rrghvr5f",
      sourcePortId: "eoqc0cw1",
      targetPortId: "0z5b3wkd",
    },
    {
      id: "lt60zfbg",
      sourceId: "g8c4d8b6",
      targetId: "rrghvr5f",
      sourcePortId: "eoqc0cw1",
      targetPortId: "zpom4gld",
    },
    {
      id: "i8itryy1",
      sourceId: "rrghvr5f",
      targetId: "8pn06nig",
      sourcePortId: "z0aznhjz",
      targetPortId: "8pn06nig",
    },
  ],
  ports: [
    {
      id: "yjh8of4u",
      name: "IN",
      type: PortType.IN,
      position: { x: 140.5, y: 128.5 },
    },
    {
      id: "8yczb1ge",
      name: "IN",
      type: PortType.IN,
      position: { x: 142, y: 249.5 },
    },
    {
      id: "8pn06nig",
      name: "OUT",
      type: PortType.OUT,
      position: { x: 623.5, y: 209.5 },
    },
  ],
  definitions: [],
};

export const halfAdderChip: CircuitChip = {
  id: "i3pgkhyq",
  name: "HALF ADDER",
  chipType: "i3pgkhyq",
  color: "#e66100",
  chips: [
    {
      id: "po9dbqzi",
      chipType: "0tv6m1kx",
      position: { x: 282, y: 158 },
    },
    {
      id: "llv6d8da",
      chipType: "tpmukpvw",
      position: { x: 309.5, y: 223.5 },
    },
  ],
  wires: [
    {
      id: "xxwjj78g",
      sourceId: "3frzgrxa",
      targetId: "po9dbqzi",
      sourcePortId: "3frzgrxa",
      targetPortId: "yjh8of4u",
    },
    {
      id: "9g0bovok",
      sourceId: "vxw5oows",
      targetId: "po9dbqzi",
      sourcePortId: "vxw5oows",
      targetPortId: "8yczb1ge",
    },
    {
      id: "nza01rv8",
      sourceId: "po9dbqzi",
      targetId: "1iuh3uej",
      sourcePortId: "8pn06nig",
      targetPortId: "1iuh3uej",
    },
    {
      id: "iy7uf88q",
      sourceId: "3frzgrxa",
      targetId: "llv6d8da",
      sourcePortId: "3frzgrxa",
      targetPortId: "xqz6exxl",
    },
    {
      id: "r5wtyiyg",
      sourceId: "vxw5oows",
      targetId: "llv6d8da",
      sourcePortId: "vxw5oows",
      targetPortId: "23xwycvx",
    },
    {
      id: "9gxxkiv3",
      sourceId: "llv6d8da",
      targetId: "bi7y16u0",
      sourcePortId: "eoqc0cw1",
      targetPortId: "bi7y16u0",
    },
  ],
  ports: [
    {
      id: "3frzgrxa",
      name: "a",
      type: PortType.IN,
      position: { x: 158, y: 122 },
    },
    {
      id: "vxw5oows",
      name: "b",
      type: PortType.IN,
      position: { x: 166, y: 232.5 },
    },
    {
      id: "1iuh3uej",
      name: "sum",
      type: PortType.OUT,
      position: { x: 435, y: 126 },
    },
    {
      id: "bi7y16u0",
      name: "carry",
      type: PortType.OUT,
      position: { x: 417.5, y: 227 },
    },
  ],
  definitions: [],
};

export const fullAdderChip: CircuitChip = {
  id: "ax1r3yhc",
  name: "FULL ADDER",
  chipType: "ax1r3yhc",
  color: "#2c7e06",
  chips: [
    {
      id: "xt90ni5r",
      chipType: "i3pgkhyq",
      position: { x: 257, y: 182 },
    },
    {
      id: "r6wgxk88",
      chipType: "i3pgkhyq",
      position: { x: 270.5, y: 268 },
    },
    {
      id: "11m8ug0b",
      chipType: "peyb7gaa",
      position: { x: 433, y: 214 },
    },
  ],
  wires: [
    {
      id: "9otvhym2",
      sourceId: "h9nb1yzv",
      targetId: "xt90ni5r",
      sourcePortId: "h9nb1yzv",
      targetPortId: "3frzgrxa",
    },
    {
      id: "9r8o18gy",
      sourceId: "uhfcpxgb",
      targetId: "xt90ni5r",
      sourcePortId: "uhfcpxgb",
      targetPortId: "vxw5oows",
    },
    {
      id: "m4680skr",
      sourceId: "xt90ni5r",
      targetId: "r6wgxk88",
      sourcePortId: "1iuh3uej",
      targetPortId: "3frzgrxa",
    },
    {
      id: "vp0f4f01",
      sourceId: "3bpjlfdp",
      targetId: "r6wgxk88",
      sourcePortId: "3bpjlfdp",
      targetPortId: "vxw5oows",
    },
    {
      id: "gnd4vsie",
      sourceId: "xt90ni5r",
      targetId: "11m8ug0b",
      sourcePortId: "bi7y16u0",
      targetPortId: "0z5b3wkd",
    },
    {
      id: "wc4j4jxe",
      sourceId: "r6wgxk88",
      targetId: "11m8ug0b",
      sourcePortId: "bi7y16u0",
      targetPortId: "zpom4gld",
    },
    {
      id: "sr2hsbj9",
      sourceId: "11m8ug0b",
      targetId: "dy02r5z1",
      sourcePortId: "z0aznhjz",
      targetPortId: "dy02r5z1",
    },
    {
      id: "p47w99fm",
      sourceId: "r6wgxk88",
      targetId: "ec9o5570",
      sourcePortId: "1iuh3uej",
      targetPortId: "ec9o5570",
    },
  ],
  ports: [
    {
      id: "h9nb1yzv",
      name: "a",
      type: PortType.IN,
      position: { x: 97.5, y: 141 },
    },
    {
      id: "uhfcpxgb",
      name: "b",
      type: PortType.IN,
      position: { x: 94, y: 209 },
    },
    {
      id: "3bpjlfdp",
      name: "c",
      type: PortType.IN,
      position: { x: 104.5, y: 264.5 },
    },
    {
      id: "ec9o5570",
      name: "sum",
      type: PortType.OUT,
      position: { x: 567.5, y: 182.5 },
    },
    {
      id: "dy02r5z1",
      name: "carry",
      type: PortType.OUT,
      position: { x: 577, y: 247 },
    },
  ],
  definitions: [],
};
