import { Chip, CircuitChip, CircuitTreeNode, CircuitTreeNodeType, NAND_CHIP_TYPE, PortType } from "@/lib/types";

import { nandTree } from "../constants/trees";
import { logger } from "../logger";

export const convertCircuitToTree = (circuit: CircuitChip): CircuitTreeNode[] => {
  // if circuit is a NAND chip, return the NAND tree
  if (circuit.chipType === NAND_CHIP_TYPE) {
    return nandTree;
  }
  // Find all output ports - these will be the root nodes of our tree
  const outputPorts = circuit.ports?.filter((port) => port.type === PortType.OUT) || [];

  return outputPorts.map((outputPort) => {
    return buildTreeItemFromPort(circuit, outputPort.id);
  });
};

const buildTreeItemFromPort = (circuit: CircuitChip, portId: string): CircuitTreeNode => {
  const port = circuit.ports?.find((p) => p.id === portId);
  if (!port) {
    throw new Error(`Port ${portId} not found`);
  }

  // Find wires that connect to this port as target
  const incomingWires = circuit.wires?.filter((wire) => wire.targetId === portId) || [];

  const sources: CircuitTreeNode[] = incomingWires.map((wire) => {
    return buildTreeItemFromWire(circuit, wire.id);
  });

  return {
    id: portId,
    type: CircuitTreeNodeType.PORT,
    sources,
  };
};

const buildTreeItemFromWire = (circuit: CircuitChip, wireId: string): CircuitTreeNode => {
  const wire = circuit.wires?.find((w) => w.id === wireId);
  if (!wire) {
    throw new Error(`Wire ${wireId} not found`);
  }

  // Find the source of this wire
  const sourceItem = buildTreeItemFromSource(circuit, wire.sourceId, wire.sourcePortId);

  return {
    id: wireId,
    type: CircuitTreeNodeType.WIRE,
    sources: [sourceItem],
  };
};

const buildTreeItemFromSource = (
  circuit: CircuitChip,
  sourceId: string,
  sourcePortId: string | null,
): CircuitTreeNode => {
  // Check if sourceId is a port
  const port = circuit.ports?.find((p) => p.id === sourceId);
  if (port) {
    return buildTreeItemFromPort(circuit, sourceId);
  }

  // Check if sourceId is a chip
  const chip = circuit.chips?.find((c) => c.id === sourceId);
  if (chip) {
    return buildTreeFromChip(circuit, chip.id, sourcePortId);
  }

  throw new Error(`Source ${sourceId} not found`);
};

const buildTreeFromChip = (circuit: CircuitChip, chipId: string, portId: string | null): CircuitTreeNode => {
  const chip = circuit.chips?.find((c) => c.id === chipId);
  if (!chip) {
    throw new Error(`Chip ${chipId} not found`);
  }

  // Base chip (NAND)
  if (chip.chipType === NAND_CHIP_TYPE) {
    return expandNandChip(circuit, chip, portId);
  }

  // Composite chip (has definitions)
  // console.log("789", circuit.definitions);
  logger.debug({
    group: "circuit-to-tree",
    message: "",
    data: {
      definitions: circuit.definitions,
      chip: chip,
    },
  });
  const chipDefinition = circuit.definitions?.find((def) => def.chipType === chip.chipType);

  if (!chipDefinition) {
    throw new Error(`Chip definition ${chip.chipType} not found`);
  }

  return expandCompositeChipWithParentConnections(circuit, chipDefinition, chipId, portId);
};

const expandNandChip = (circuit: CircuitChip, chip: Chip, portId: string | null): CircuitTreeNode => {
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
      sources: [buildTreeItemFromWire(circuit, wire.id)],
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
  circuit: CircuitChip,
  chipDefinition: CircuitChip,
  chipId: string,
  portId: string | null,
): CircuitTreeNode => {
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
      const parentInput = buildTreeItemFromSource(circuit, inputWires[0].sourceId, inputWires[0].sourcePortId);

      // Then, create a tree that replaces the composite chip's input with the parent input
      return createCustomCompositeTree(chipDefinition, portId, parentInput);
    }

    // For now, let's use the original expansion and see if we can fix it differently
    return buildTreeItemFromPort(chipDefinition, portId);
  }

  // No incoming wires, use the original expansion
  return buildTreeItemFromPort(chipDefinition, portId);
};

const createCustomCompositeTree = (
  chipDefinition: CircuitChip,
  portId: string,
  parentInput: CircuitTreeNode,
): CircuitTreeNode => {
  // Find the port in the chip definition
  const port = chipDefinition.ports?.find((p) => p.id === portId);
  if (!port) {
    throw new Error(`Port ${portId} not found in chip definition`);
  }

  // Build the tree for this port in the chip definition
  let tree = buildTreeItemFromPort(chipDefinition, portId);

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
