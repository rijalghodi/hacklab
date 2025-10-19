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
