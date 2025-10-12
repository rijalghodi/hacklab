// "use client";

// import { ChipName, Circuit, NAND_OUT_NAME, NodeType } from "../types/flow";

// export const builtInChips: Circuit[] = [
//   {
//     type: NodeType.IN,
//     name: ChipName.IN,
//     color: "#854d0e",
//     nodes: [{ type: NodeType.OUT, name: ChipName.OUT, id: "out" }],
//     version: "1.0",
//     createdAt: "2025-09-16T00:00:00Z",
//     createdBy: "system",
//   },
//   {
//     type: NodeType.OUT,
//     name: ChipName.OUT,
//     color: "#854d0e",
//     nodes: [{ type: NodeType.IN, name: ChipName.IN, id: "in" }],
//     version: "1.0",
//     createdAt: "2025-09-16T00:00:00Z",
//     createdBy: "system",
//   },
//   {
//     type: NodeType.CHIP,
//     name: ChipName.NAND,
//     color: "#854d0e",
//     nodes: [
//       { type: NodeType.IN, name: "a", id: "nand.a" },
//       { type: NodeType.IN, name: "b", id: "nand.b" },
//       { type: NodeType.OUT, name: NAND_OUT_NAME, id: "nand.out" },
//     ],
//     edges: [
//       {
//         id: "nand.a--nand.out",
//         sourceId: "nand.a",
//         sourcePortId: "out",
//         targetId: "nand.out",
//         targetPortId: "in",
//       },
//       {
//         id: "nand.b--nand.out",
//         sourceId: "nand.b",
//         sourcePortId: "out",
//         targetId: "nand.out",
//         targetPortId: "in",
//       },
//     ],
//     version: "1.0",
//     createdAt: "2025-09-16T00:00:00Z",
//     createdBy: "system",
//   },
//   {
//     type: NodeType.CHIP,
//     name: "NOT",
//     color: "#831843",
//     nodes: [
//       {
//         type: NodeType.CHIP,
//         name: "NAND",
//         id: "not.nand",
//       },
//       { type: NodeType.IN, name: "in", id: "not.in" },
//       { type: NodeType.OUT, name: "out", id: "not.out" },
//     ],
//     edges: [
//       {
//         id: "not.in--not.nand.a",
//         sourceId: "not.in",
//         sourcePortId: "out",
//         targetId: "not.nand",
//         targetPortId: "nand.a",
//       },
//       {
//         id: "not.in--not.nand.b",
//         sourceId: "not.in",
//         sourcePortId: "out",
//         targetId: "not.nand",
//         targetPortId: "nand.b",
//       },
//       {
//         id: "not.nand.out--not.out",
//         sourceId: "not.nand",
//         sourcePortId: "nand.out",
//         targetId: "not.out",
//         targetPortId: "in",
//       },
//     ],
//     version: "1.0",
//     createdAt: "2025-09-16T00:00:00Z",
//     createdBy: "system",
//   },
//   {
//     type: NodeType.CHIP,
//     name: "AND",
//     color: "#831843",
//     nodes: [
//       {
//         type: NodeType.CHIP,
//         name: "NAND",
//         id: "and.nand",
//       },
//       {
//         type: NodeType.CHIP,
//         name: "NOT",
//         id: "and.not",
//       },
//       { type: NodeType.IN, name: "a", id: "and.a" },
//       { type: NodeType.IN, name: "b", id: "and.b" },
//       { type: NodeType.OUT, name: "out", id: "and.out" },
//     ],
//     edges: [
//       {
//         id: "and.a--and.nand.a",
//         sourceId: "and.a",
//         sourcePortId: "in",
//         targetId: "and.nand",
//         targetPortId: "nand.a",
//       },
//       {
//         id: "and.b--and.nand.b",
//         sourceId: "and.b",
//         sourcePortId: "in",
//         targetId: "and.nand",
//         targetPortId: "nand.b",
//       },
//       {
//         id: "and.nand.out--and.not.in",
//         sourceId: "and.nand",
//         sourcePortId: "nand.out",
//         targetId: "and.not",
//         targetPortId: "not.in",
//       },
//       {
//         id: "and.not.out--and.out",
//         sourceId: "and.not",
//         sourcePortId: "not.out",
//         targetId: "and.out",
//         targetPortId: "out",
//       },
//     ],
//     version: "1.0",
//     createdAt: "2025-09-16T00:00:00Z",
//     createdBy: "system",
//   },
// ];
