// type Position = {
//   x: number;
//   y: number;
// };

// export type Port = {
//   id: string;
//   name: string; // e.g. "a", "b", "out"
//   label?: string;
//   type: "input" | "output" | "clock";
// };

// export type Chip = {
//   id: string;
//   name: string; // e.g. "AND", "OR", "FULL_ADDER"
//   label?: string;
//   color?: string;
//   position?: Position;
//   ports: Port[]; // pin definitions
// };

// export type Wire = {
//   id: string;
//   sourceId: string; // Chip.id or Port.id with prefix "port."
//   targetId: string; // Chip.id or Port.id with prefix "port."
//   sourcePortId?: string; // Port.id of source
//   targetPortId?: string; // Port.id of target
// };

// export type CircuitPort = {
//   id: string;
//   type: "input" | "output" | "clock";
//   name: string;
//   label?: string;
// };

// export type CircuitModule = {
//   label: string;
//   name: string; // e.g. "ALU"
//   chips: Chip[]; // minus input and output nodes
//   wires: Wire[];
//   ports: CircuitPort[];
//   version?: string;
//   createdAt?: string;
//   createdBy?: string;
// };

// export type Circuit = CircuitModule & {
//   definitions: CircuitModule[];
// };

// // Example
// export const NotGate: Circuit = {
//   label: "NOT Gate",
//   name: "NOT",
//   chips: [
//     {
//       id: "nand1",
//       name: "NAND",
//       label: "NAND1",
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
//       label: "in",
//     },
//     {
//       id: "out",
//       type: "output",
//       name: "out",
//       label: "out",
//     },
//   ],
//   version: "1.0",
//   createdAt: "2025-09-16T00:00:00Z",
//   createdBy: "system",
//   definitions: [
//     {
//       label: "NAND",
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
