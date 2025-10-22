import {
  Chip,
  CircuitChip,
  CircuitChipDefinition,
  CircuitTreeNode,
  CircuitTreeNodeType,
  NAND_CHIP_TYPE,
  PortType,
} from "@/lib/types";

import { nandTree } from "../constants/trees";
import { logger } from "../logger";

export const convertCircuitToTree = (circuit: CircuitChip): CircuitTreeNode[] => {
  logger.info({ group: "circuit-to-tree", message: "[convertCircuitToTree]", data: { circuit } });

  // if circuit is a NAND chip, return the NAND tree
  if (circuit.chipType === NAND_CHIP_TYPE) {
    return nandTree;
  }
  // Find all output ports - these will be the root nodes of our tree
  const outputPorts = circuit.ports?.filter((port) => port.type === PortType.OUT) || [];

  return outputPorts.map((outputPort) => {
    return buildTreeItemFromPort(circuit, circuit.definitions, outputPort.id);
  });
};

const buildTreeItemFromPort = (
  circuit: CircuitChipDefinition,
  definitions: CircuitChipDefinition[],
  portId: string,
): CircuitTreeNode => {
  logger.info({ group: "circuit-to-tree", message: "[buildTreeItemFromPort]", data: { circuit, portId } });

  const port = circuit.ports?.find((p) => p.id === portId);
  if (!port) {
    throw new Error(`Port ${portId} not found`);
  }

  // Find wires that connect to this port as target
  const incomingWires = circuit.wires?.filter((wire) => wire.targetId === portId) || [];

  const sources: CircuitTreeNode[] = incomingWires.map((wire) => {
    return buildTreeItemFromWire(circuit, definitions, wire.id);
  });

  return {
    id: portId,
    type: CircuitTreeNodeType.PORT,
    sources,
  };
};

const buildTreeItemFromWire = (
  circuit: CircuitChipDefinition,
  definitions: CircuitChipDefinition[],
  wireId: string,
): CircuitTreeNode => {
  logger.info({ group: "circuit-to-tree", message: "[buildTreeItemFromWire]", data: { circuit, wireId } });

  const wire = circuit.wires?.find((w) => w.id === wireId);
  if (!wire) {
    throw new Error(`Wire ${wireId} not found`);
  }

  // Find the source of this wire
  const sourceItem = buildTreeItemFromSource(circuit, definitions, wire.sourceId, wire.sourcePortId);

  return {
    id: wireId,
    type: CircuitTreeNodeType.WIRE,
    sources: [sourceItem],
  };
};

const buildTreeItemFromSource = (
  circuit: CircuitChipDefinition,
  definitions: CircuitChipDefinition[],
  sourceId: string,
  sourcePortId: string | null,
): CircuitTreeNode => {
  logger.info({
    group: "circuit-to-tree",
    message: "[buildTreeItemFromSource]",
    data: { circuit, sourceId, sourcePortId },
  });

  // Check if sourceId is a port
  const port = circuit.ports?.find((p) => p.id === sourceId);
  if (port) {
    return buildTreeItemFromPort(circuit, definitions, sourceId);
  }

  // Check if sourceId is a chip
  const chip = circuit.chips?.find((c) => c.id === sourceId);
  if (chip) {
    return buildTreeItemFromChip(circuit, definitions, chip.id, sourcePortId);
  }

  throw new Error(`Source ${sourceId} not found`);
};

const buildTreeItemFromChip = (
  circuit: CircuitChipDefinition,
  definitions: CircuitChipDefinition[],
  chipId: string,
  portId: string | null,
): CircuitTreeNode => {
  logger.info({ group: "circuit-to-tree", message: "[buildTreeItemFromChip]", data: { circuit, chipId, portId } });
  const chip = circuit.chips?.find((c) => c.id === chipId);
  if (!chip) {
    throw new Error(`Chip ${chipId} not found`);
  }

  // Base chip (NAND)
  if (chip.chipType === NAND_CHIP_TYPE) {
    return expandNandChip(circuit, definitions, chip, portId);
  }

  // Composite chip (has definitions)
  // console.log("789", circuit.definitions);
  logger.debug({
    group: "circuit-to-tree",
    message: "",
    data: {
      circuit: circuit,
      definitions: definitions,
      chip: chip,
    },
  });
  const chipDefinition = definitions.find((def) => def.chipType === chip.chipType);

  if (!chipDefinition) {
    logger.error({
      group: "circuit-to-tree",
      message: `Chip definition ${chip.chipType} not found`,
      data: { circuit, chip },
    });
    throw new Error(`Chip definition ${chip.chipType} not found`);
  }

  return expandCompositeChipWithParentConnections(circuit, chipDefinition, definitions, chipId, portId);
};

const expandNandChip = (
  circuit: CircuitChipDefinition,
  definitions: CircuitChipDefinition[],
  chip: Chip,
  portId: string | null,
): CircuitTreeNode => {
  logger.info({ group: "circuit-to-tree", message: "[expandNandChip]", data: { circuit, chip, portId } });
  if (!portId) {
    throw new Error(`Port ID required for base chip expansion`);
  }

  // For base chips, we need to create the internal port structure

  // Find wires that connect to this chip's input ports
  const inputWires = circuit.wires?.filter((wire) => wire.targetId === chip.id) || [];

  const sources: CircuitTreeNode[] = inputWires.map((wire) => {
    if (!wire.targetPortId) {
      throw new Error(`Target port ID required for base chip expansion`);
    }

    const inputPort: CircuitTreeNode = {
      id: wire.targetPortId,
      type: CircuitTreeNodeType.PORT,
      sources: [buildTreeItemFromWire(circuit, definitions, wire.id)],
    };
    return inputPort;
  });

  return {
    id: chip.id,
    type: CircuitTreeNodeType.NAND_CHIP,
    sources,
  };
};

const expandCompositeChipWithParentConnections = (
  circuit: CircuitChipDefinition,
  chipDefinition: CircuitChipDefinition,
  definitions: CircuitChipDefinition[],
  chipId: string,
  portId: string | null,
): CircuitTreeNode => {
  logger.info({
    group: "circuit-to-tree",
    message: "[expandCompositeChipWithParentConnections]",
    data: { circuit, chipDefinition, chipId, portId },
  });

  // chipDefinition.definitions = circuit.definitions || [];
  // const definitions = circuit.definitions || [];
  // chipDefinition.definitions = circuit.definitions;

  if (!portId) {
    throw new Error(`Port ID required for composite chip expansion`);
  }

  // Find the port in the chip definition
  const port = chipDefinition.ports?.find((p) => p.id === portId);
  if (!port) {
    throw new Error(`Port ${portId} not found in chip definition`);
  }

  // Find wires in the parent circuit that connect to this composite chip
  const incomingWires = circuit.wires?.filter((wire) => wire.targetId === chipId) || [];

  if (incomingWires.length > 0) {
    // This composite chip receives input from parent circuit
    // We need to create a tree that connects the parent input to the composite chip's output

    // Find the input port that receives input from parent circuit
    const inputWires = incomingWires.filter((wire) =>
      chipDefinition.ports?.some((port) => port.id === wire.targetPortId && port.type === PortType.IN),
    );

    if (inputWires.length > 0) {
      // Create a custom tree structure that connects parent input to composite chip output
      // First, get the parent circuit's input
      const parentInput = buildTreeItemFromSource(
        circuit,
        definitions,
        inputWires[0].sourceId,
        inputWires[0].sourcePortId,
      );

      // Then, create a tree that replaces the composite chip's input with the parent input
      return createCustomCompositeTree(chipDefinition, definitions, portId, parentInput);
    }

    // For now, let's use the original expansion and see if we can fix it differently
    return buildTreeItemFromPort(chipDefinition, definitions, portId);
  }

  // No incoming wires, use the original expansion
  return buildTreeItemFromPort(chipDefinition, definitions, portId);
};

const createCustomCompositeTree = (
  // circuit: CircuitChip,
  chipDefinition: CircuitChipDefinition,
  definitions: CircuitChipDefinition[],
  portId: string,
  parentInput: CircuitTreeNode,
): CircuitTreeNode => {
  logger.info({
    group: "circuit-to-tree",
    message: "[createCustomCompositeTree]",
    data: { chipDefinition, portId, parentInput },
  });
  // Find the port in the chip definition
  const port = chipDefinition.ports?.find((p) => p.id === portId);
  if (!port) {
    throw new Error(`Port ${portId} not found in chip definition`);
  }

  // Build the tree for this port in the chip definition
  let tree = buildTreeItemFromPort(chipDefinition, definitions, portId);

  // Replace any references to the input port with the parent input FIRST
  const inputPortId = chipDefinition.ports?.find((p) => p.type === PortType.IN)?.id || "";
  tree = replaceInputPortInTree(tree, inputPortId, parentInput);

  return tree;
};

const replaceInputPortInTree = (
  tree: CircuitTreeNode,
  inputPortId: string,
  replacement: CircuitTreeNode,
): CircuitTreeNode => {
  logger.info({
    group: "circuit-to-tree",
    message: "[replaceInputPortInTree]",
    data: { tree, inputPortId, replacement },
  });
  if (tree.id === inputPortId) {
    return replacement;
  }

  if (tree.sources) {
    return {
      ...tree,
      sources: tree.sources.map((source) => replaceInputPortInTree(source, inputPortId, replacement)),
    };
  }

  return tree;
};
