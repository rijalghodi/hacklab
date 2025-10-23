import { CircuitChip, CircuitTreeNode, CircuitTreeNodeType, NAND_CHIP_TYPE, PortType } from "@/lib/types";

import { nandTree } from "../constants/trees";
import { logger } from "../logger";

export const convertCircuitChipToTree = (circuitChip: CircuitChip): CircuitTreeNode[] => {
  logger.info({ group: "circuit-to-tree", message: "[convertCircuitChipToTree]", data: { circuitChip } });

  // if circuit is a NAND chip, return the NAND tree
  if (circuitChip.chipType === NAND_CHIP_TYPE) {
    return nandTree;
  }
  // Find all output ports - these will be the root nodes of our tree
  const outputPorts = circuitChip.ports?.filter((port) => port.type === PortType.OUT) || [];

  return outputPorts.map((outputPort) => {
    return buildTreeNodeFromOutputPort(circuitChip, outputPort.id);
  });
};

const buildTreeNodeFromOutputPort = (circuitChip: Omit<CircuitChip, "id">, outputPortId: string): CircuitTreeNode => {
  logger.info({
    group: "circuit-to-tree",
    message: "[buildTreeNodeFromOutputPort]",
    data: { circuitChip, portId: outputPortId },
  });

  const port = circuitChip.ports?.find((p) => p.id === outputPortId);
  if (!port) {
    throw new Error(`Port ${outputPortId} not found`);
  }

  // Find wires that connect to this port as target
  const lastWires = circuitChip.wires?.filter((wire) => wire.targetId === outputPortId) || [];

  const sources: CircuitTreeNode[] = lastWires.map((wire) => {
    return buildTreeNodeFromLastWire(circuitChip, wire.id);
  });

  return {
    id: outputPortId,
    type: CircuitTreeNodeType.PORT,
    sources,
  };
};

const buildTreeNodeFromLastWire = (circuitChip: Omit<CircuitChip, "id">, wireId: string): CircuitTreeNode => {
  logger.info({ group: "circuit-to-tree", message: "[buildTreeNodeFromLastWire]", data: { circuitChip, wireId } });

  const wire = circuitChip.wires?.find((w) => w.id === wireId);
  if (!wire) {
    throw new Error(`Wire ${wireId} not found`);
  }

  // Find the source of this wire
  const sourceItem = buildTreeNodeFromSource(circuitChip, wire.sourceId, wire.sourcePortId);

  return {
    id: wireId,
    type: CircuitTreeNodeType.WIRE,
    sources: [sourceItem],
  };
};

const buildTreeNodeFromSource = (
  circuitChip: Omit<CircuitChip, "id">,
  sourceId: string,
  sourcePortId: string | null, // outputPortId in chip
  // parentCircuitChip: Omit<CircuitChip, "id"> | null,
): CircuitTreeNode => {
  logger.info({
    group: "circuit-to-tree",
    message: "[buildTreeNodeFromSource]",
    data: { circuitChip, sourceId, sourcePortId },
  });

  // Check if sourceId is an input port
  const inputPort = circuitChip.ports?.find((p) => p.id === sourceId && p.type === PortType.IN);
  if (inputPort) {
    return buildTreeNodeFromOutputPort(circuitChip, inputPort.id);
  }

  // Check if sourceId is a chip
  // const parentCircuitChip = circuitChip;
  const chip = circuitChip.chips?.find((c) => c.id === sourceId);

  if (chip) {
    return buildTreeNodeFromChip(circuitChip, chip.id, sourcePortId);
  }

  throw new Error(`Source ${sourceId} not found`);
};

const buildTreeNodeFromChip = (
  parentCircuitChip: Omit<CircuitChip, "id">,
  chipId: string,
  outputPortId: string | null,
): CircuitTreeNode => {
  logger.info({
    group: "circuit-to-tree",
    message: "[buildTreeNodeFromChip]",
    data: { circuit: parentCircuitChip, chipId, portId: outputPortId },
  });
  const chip = parentCircuitChip.chips?.find((c) => c.id === chipId);
  if (!chip) {
    throw new Error(`Chip ${chipId} not found`);
  }

  // Base chip (NAND)
  if (chip.chipType === NAND_CHIP_TYPE) {
    return expandNandChip(parentCircuitChip, chipId);
  }

  const chipDefinition = parentCircuitChip.definitions.find((def) => def.chipType === chip.chipType);

  if (!chipDefinition) {
    logger.error({
      group: "circuit-to-tree",
      message: `Chip definition ${chip.chipType} not found`,
      data: { circuit: parentCircuitChip, chip },
    });
    throw new Error(`Chip definition ${chip.chipType} not found`);
  }

  const currentCircuit = { ...chipDefinition, definitions: parentCircuitChip.definitions };
  const parentCircuit = { ...parentCircuitChip, definitions: parentCircuitChip.definitions };

  return expandCompositeChipWithParentConnections(parentCircuit, currentCircuit, chipId, outputPortId);
};

const expandNandChip = (circuit: Omit<CircuitChip, "id">, chipId: string): CircuitTreeNode => {
  logger.info({ group: "circuit-to-tree", message: "[expandNandChip]", data: { circuit, chipId } });

  // For base chips, we need to create the internal port structure

  // Find wires that connect to this chip's input ports
  const inputWires = circuit.wires?.filter((wire) => wire.targetId === chipId) || [];

  const sources: CircuitTreeNode[] = inputWires.map((wire) => {
    if (!wire.targetPortId) {
      throw new Error(`Target port ID required for base chip expansion`);
    }

    const inputPort: CircuitTreeNode = {
      id: wire.targetPortId,
      type: CircuitTreeNodeType.PORT,
      sources: [buildTreeNodeFromLastWire(circuit, wire.id)],
    };
    return inputPort;
  });

  return {
    id: "nand.port-out",
    type: CircuitTreeNodeType.PORT,
    sources: [
      {
        id: chipId,
        type: CircuitTreeNodeType.NAND_CHIP,
        sources,
      },
    ],
  };
};

const expandCompositeChipWithParentConnections = (
  parentCircuit: Omit<CircuitChip, "id">,
  currentCircuit: Omit<CircuitChip, "id">,
  chipId: string,
  outputPortId: string | null,
): CircuitTreeNode => {
  logger.info({
    group: "circuit-to-tree",
    message: "[expandCompositeChipWithParentConnections]",
    data: { circuit: parentCircuit, currentCircuit, chipId, outputPortId },
  });

  if (!outputPortId) {
    throw new Error(`Port ID required for composite chip expansion`);
  }

  // Find the output port in the chip definition
  const outputPort = currentCircuit.ports?.find((p) => p.id === outputPortId);
  if (!outputPort) {
    throw new Error(`Port ${outputPortId} not found in chip definition`);
  }

  // Find wires in the parent circuit that connect to this composite chip
  const incomingWires = parentCircuit.wires?.filter((wire) => wire.targetId === chipId) || [];

  if (incomingWires.length > 0) {
    // This composite chip receives input from parent circuit
    // We need to create a tree that connects the parent input to the composite chip's output

    // Find the input port that receives input from parent circuit
    const inputWires = incomingWires.filter((wire) =>
      currentCircuit.ports?.some((port) => port.id === wire.targetPortId && port.type === PortType.IN),
    );

    if (inputWires.length > 0) {
      // Create a custom tree structure that connects parent input to composite chip output
      // First, get the parent circuit's input
      const parentInput = buildTreeNodeFromSource(parentCircuit, inputWires[0].sourceId, inputWires[0].sourcePortId);

      // Then, create a tree that replaces the composite chip's input with the parent input
      return createCustomCompositeTree(currentCircuit, outputPortId, parentInput);
    }
  }

  // No incoming wires or no input wires found, use the original expansion
  return buildTreeNodeFromOutputPort(currentCircuit, outputPortId);
};

const createCustomCompositeTree = (
  // _parentCircuit: Omit<CircuitChip, "id">,
  currentCircuit: Omit<CircuitChip, "id">,
  portId: string,
  parentInput: CircuitTreeNode,
): CircuitTreeNode => {
  logger.info({
    group: "circuit-to-tree",
    message: "[createCustomCompositeTree]",
    data: { currentCircuit, portId, parentInput },
  });
  // Find the port in the chip definition
  const port = currentCircuit.ports?.find((p) => p.id === portId);
  if (!port) {
    throw new Error(`Port ${portId} not found in chip definition`);
  }

  // Build the tree for this port in the chip definition
  let tree = buildTreeNodeFromOutputPort(currentCircuit, portId);

  // Replace any references to the input port with the parent input FIRST
  const inputPortId = currentCircuit.ports?.find((p) => p.type === PortType.IN)?.id || "";
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
