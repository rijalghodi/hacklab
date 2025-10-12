// export enum NodeType {
//   IN = "IN",
//   OUT = "OUT",
//   CHIP = "CHIP",
// }

// export enum ChipName {
//   IN = "IN",
//   OUT = "OUT",
//   NAND = "NAND",
//   NOT = "NOT",
// }

// export const NAND_OUT_NAME = "out";

// export type PortType = NodeType.IN | NodeType.OUT;
// export type ChipType = NodeType;

// type Position = {
//   x: number;
//   y: number;
// };

// // Port

// export type BasePort = {
//   name: string; // e.g. "a", "b", "out"
//   type: PortType;
//   color?: string;
//   label?: string;
// };

// export type Port = BasePort & {
//   id: string;
// };

// export type StatefulPort = Port & {
//   value?: boolean;
// };

// // Chip

// export type BaseChip = {
//   name: string | ChipName; // e.g. "AND", "OR", "FULL_ADDER"
//   color?: string;
//   position?: Position;
//   type: ChipType;
//   // ports?: Port[];
// };

// export type Chip = BaseChip & {
//   id: string;
// };

// export type StatefulChip = Omit<Chip, "ports"> & {
//   ports?: StatefulPort[];
// };

// export type Wire = {
//   id: string;
//   sourceId: string; // Chip.id or Port.id with prefix "port."
//   targetId: string; // Chip.id or Port.id with prefix "port."
//   sourcePortId?: string | null; // Port.id of source
//   targetPortId?: string | null; // Port.id of target
//   color?: string;
// };

// export type StatefulWire = Wire & {
//   value?: boolean;
// };

// export type Circuit = {
//   type: NodeType;
//   name: string; // e.g. "ALU"
//   label?: string; // e.g. "ALU 1"
//   description?: string;
//   color?: string;
//   nodes: Chip[];
//   edges?: Wire[];
//   version?: string;
//   createdAt?: string;
//   createdBy?: string;
// };

// // ==== Circuit Tree ====

// export type CircuitSource = {
//   portName: string; // port id
//   nodes: CircuitNode[];
// };

// export type CircuitNode = {
//   name: string;
//   type: NodeType;
//   sources?: CircuitSource[];
// };
