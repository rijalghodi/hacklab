"use client";

import { ChipName, CircuitModule, NAND_OUT_NAME, NodeType } from "../types/flow";

export const builtInChips: CircuitModule[] = [
  {
    type: NodeType.IN,
    name: ChipName.IN,
    color: "#854d0e",
    nodes: [{ type: NodeType.OUT, name: ChipName.OUT, id: "out" }],
    version: "1.0",
    createdAt: "2025-09-16T00:00:00Z",
    createdBy: "system",
  },
  {
    type: NodeType.OUT,
    name: ChipName.OUT,
    color: "#854d0e",
    nodes: [{ type: NodeType.IN, name: ChipName.IN, id: "in" }],
    version: "1.0",
    createdAt: "2025-09-16T00:00:00Z",
    createdBy: "system",
  },
  {
    type: NodeType.CHIP,
    name: ChipName.NAND,
    color: "#854d0e",
    nodes: [
      { type: NodeType.IN, name: "a", id: "a" },
      { type: NodeType.IN, name: "b", id: "b" },
      { type: NodeType.OUT, name: NAND_OUT_NAME, id: "out" },
    ],
    edges: [
      {
        id: "a--out",
        sourceId: "a",
        sourcePortId: "a",
        targetId: "out",
        targetPortId: "out",
      },
      {
        id: "b--out",
        sourceId: "b",
        sourcePortId: "b",
        targetId: "out",
        targetPortId: "out",
      },
    ],
    version: "1.0",
    createdAt: "2025-09-16T00:00:00Z",
    createdBy: "system",
  },
  {
    type: NodeType.CHIP,
    name: "NOT",
    color: "#831843",
    nodes: [
      {
        type: NodeType.CHIP,
        name: "NAND",
        id: "nand",
      },
      { type: NodeType.IN, name: "in", id: "in" },
      { type: NodeType.OUT, name: "out", id: "out" },
    ],
    edges: [
      {
        id: "in--nand.a",
        sourceId: "in",
        sourcePortId: "in",
        targetId: "nand",
        targetPortId: "a",
      },
      {
        id: "in--nand.b",
        sourceId: "in",
        sourcePortId: "in",
        targetId: "nand",
        targetPortId: "b",
      },
      {
        id: "nand.out--out",
        sourceId: "nand",
        sourcePortId: "out",
        targetId: "out",
        targetPortId: "out",
      },
    ],
    version: "1.0",
    createdAt: "2025-09-16T00:00:00Z",
    createdBy: "system",
  },
  {
    type: NodeType.CHIP,
    name: "AND",
    color: "#831843",
    nodes: [
      {
        type: NodeType.CHIP,
        name: "NAND",
        id: "nand",
      },
      {
        type: NodeType.CHIP,
        name: "NOT",
        id: "not",
      },
      { type: NodeType.IN, name: "a", id: "a" },
      { type: NodeType.IN, name: "b", id: "b" },
      { type: NodeType.OUT, name: "out", id: "out" },
    ],
    edges: [
      {
        id: "in--nand.a",
        sourceId: "a",
        sourcePortId: "a",
        targetId: "nand",
        targetPortId: "a",
      },
      {
        id: "in--nand.b",
        sourceId: "b",
        sourcePortId: "b",
        targetId: "nand",
        targetPortId: "b",
      },
      {
        id: "nand.out--not.in",
        sourceId: "nand",
        sourcePortId: "out",
        targetId: "not",
        targetPortId: "in",
      },
      {
        id: "not.out--out",
        sourceId: "not",
        sourcePortId: "out",
        targetId: "out",
        targetPortId: "out",
      },
    ],
    version: "1.0",
    createdAt: "2025-09-16T00:00:00Z",
    createdBy: "system",
  },
];

// const NOT_TEST = [
//   {
//     type: NodeType.OUT,
//     name: "out",
//     id: "out",
//     prevEdges: [
//       {
//         id: "nand.out--out",
//         sourceId: "nand",
//         sourcePortId: "out",
//         targetId: "out",
//         targetPortId: "out",
//         prevNode: {
//           type: NodeType.CHIP,
//           name: "NAND",
//           id: "nand",
//           prevEdges: [
//             {
//               id: "in--nand.a",
//               sourceId: "in",
//               sourcePortId: "in",
//               targetId: "nand",
//               targetPortId: "a",
//               prevNode: {
//                 type: NodeType.IN,
//                 name: "in",
//                 id: "in",
//               },
//             },
//             {
//               id: "in--nand.b",
//               sourceId: "in",
//               sourcePortId: "in",
//               targetId: "nand",
//               targetPortId: "b",
//               prevNode: {
//                 type: NodeType.IN,
//                 name: "in",
//                 id: "in",
//               },
//             },
//           ],
//         },
//       },
//     ],
//   },
// ];

// const AND_TEST = [
//   {
//     type: NodeType.OUT,
//     name: "out",
//     id: "out",
//     prevEdges: [
//       {
//         id: "nand.out--out",
//         sourceId: "nand",
//         sourcePortId: "out",
//         targetId: "out",
//         targetPortId: "out",
//         prevNode: {
//           type: NodeType.CHIP,
//           name: "NAND",
//           id: "nand",
//           prevEdges: [
//             {
//               id: "in--nand.a",
//               sourceId: "in",
//               sourcePortId: "in",
//               targetId: "nand",
//               targetPortId: "a",
//               prevNode: {
//                 type: NodeType.IN,
//                 name: "in",
//                 id: "in",
//               },
//             },
//             {
//               id: "in--nand.b",
//               sourceId: "in",
//               sourcePortId: "in",
//               targetId: "nand",
//               targetPortId: "b",
//               prevNode: {
//                 type: NodeType.IN,
//                 name: "in",
//                 id: "in",
//               },
//             },
//           ],
//         },
//       },
//     ],
//   },
// ];

// export const getChipDefintion = (name: string) => {
//   const savedChips = useSavedChips((state) => state.savedChips);
//   return [...builtInChips, ...savedChips].find((chip) => chip.name === name);
// };
