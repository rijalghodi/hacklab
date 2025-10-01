import { ChipName, CircuitModule, CircuitNode, CircuitTree, NAND_OUT_NAME, NodeType } from "./types/flow";

// ===== Helper Functions =====

/**
 * Finds a chip definition by name and type
 */
const findChipDefinition = (
  chipName: string,
  chipType: NodeType,
  definitions: CircuitModule[],
): CircuitModule | undefined => {
  return definitions.find((def) => def.name === chipName && def.type === chipType);
};

/**
 * Finds a chip definition by name only
 */
const findChipByName = (chipName: string, definitions: CircuitModule[]): CircuitModule | undefined => {
  return definitions.find((definition) => definition.name === chipName);
};

/**
 * Creates a simple input node
 */
const createInputNode = (chipName: string): CircuitNode => ({
  name: chipName,
  type: NodeType.IN,
});

/**
 * Creates a simple output tree for input nodes
 */
const createInputOutputTree = (chipName: string): CircuitTree => ({
  [ChipName.OUT]: [createInputNode(chipName)],
});

/**
 * Checks if this is a base case (input node)
 */
const isBaseCase = (chipType: NodeType): boolean => chipType === NodeType.IN;

/**
 * Checks if this is a NAND chip (special case)
 */
const isNandChip = (chipName: string, chipType: NodeType): boolean =>
  chipName === ChipName.NAND && chipType === NodeType.CHIP;

/**
 * Builds input connections for a chip
 */
const buildInputConnections = (chip: CircuitModule, definitions: CircuitModule[]): Record<string, CircuitNode[]> => {
  const inputPorts = chip.nodes?.filter((node) => node.type === NodeType.IN);
  if (!inputPorts) {
    throw new Error("buildInputConnections: input ports not found");
  }

  const circuitNodeInputs: Record<string, CircuitNode[]> = {};

  for (const inputPort of inputPorts) {
    if (inputPort.type === NodeType.IN) {
      // Handle direct input connection
      const internalTree = buildCircuitTree(inputPort.type, inputPort.name, definitions);
      circuitNodeInputs[inputPort.name] = internalTree[ChipName.OUT];
      continue;
    }

    // Handle chip-to-chip connections
    const edgesToInputPort = chip.edges?.filter((edge) => edge.targetPortId === inputPort.id) ?? [];
    const connectedNodes: CircuitNode[] = [];

    for (const edge of edgesToInputPort) {
      const sourceNode = chip.nodes.find((node) => node.id === edge.sourceId);
      if (!sourceNode) {
        throw new Error("buildInputConnections: source node not found");
      }

      const circuitTreeNode = buildCircuitNode(sourceNode.type, sourceNode.name, definitions);
      connectedNodes.push(circuitTreeNode);
    }

    circuitNodeInputs[inputPort.name] = connectedNodes;
  }

  return circuitNodeInputs;
};

/**
 * Builds output connections for a chip
 */
const buildOutputConnections = (chip: CircuitModule, definitions: CircuitModule[]): Record<string, CircuitNode[]> => {
  const outputPorts = chip.nodes.filter((node) => node.type === NodeType.OUT);
  const circuitTree: Record<string, CircuitNode[]> = {};

  for (const outputPort of outputPorts) {
    const outputPortName = outputPort.name;
    circuitTree[outputPortName] = [];

    const edgesToOutputPort = chip.edges?.filter((edge) => edge.targetId === outputPort.id) ?? [];

    for (const edge of edgesToOutputPort) {
      const sourceNode = chip.nodes.find((node) => node.id === edge.sourceId);
      if (!sourceNode) {
        continue;
      }

      const circuitTreeNode = buildCircuitNode(sourceNode.type, sourceNode.name, definitions);
      circuitTree[outputPortName].push(circuitTreeNode);
    }
  }

  return circuitTree;
};

// ===== Main Functions =====

//  ==== Build Circuit Node ====
const buildCircuitNode = (chipType: NodeType, chipName: string, definitions: CircuitModule[]): CircuitNode => {
  console.log("----------------------------------- BUILD CIRCUIT NODE -----------------------------------");
  console.log("chipName", chipName, "chipType", chipType);

  // Base case: Input node
  if (isBaseCase(chipType)) {
    return createInputNode(chipName);
  }

  // Find chip definition
  const chip = findChipDefinition(chipName, chipType, definitions);
  console.log("chip", chip);
  if (!chip) {
    throw new Error(`buildCircuitNode: chip ${chipName} of type ${chipType} not found`);
  }

  // Create circuit node
  const circuitNode: CircuitNode = {
    name: chipName,
    type: chipType,
  };

  // Build input connections
  const inputConnections = buildInputConnections(chip, definitions);
  circuitNode.inputs = inputConnections;

  return circuitNode;
};

//  ==== Build Circuit Tree ====
export const buildCircuitTree = (chipType: NodeType, chipName: string, definitions: CircuitModule[]): CircuitTree => {
  console.log("----------------------------------- BUILD CIRCUIT TREE -----------------------------------");
  console.log("chipName", chipName, "chipType", chipType);

  // Base case: Input node
  if (isBaseCase(chipType)) {
    return createInputOutputTree(chipName);
  }

  // Special case: NAND chip
  if (isNandChip(chipName, chipType)) {
    console.log("BUILD NAND CHIP");
    const circuitNode = buildCircuitNode(chipType, chipName, definitions);
    console.log("circuitNode", circuitNode);
    return {
      [NAND_OUT_NAME]: [circuitNode],
    };
  }

  // General case: Complex chip
  const chip = findChipByName(chipName, definitions);
  console.log("chip", chip);
  if (!chip) {
    throw new Error(`buildCircuitTree: chip ${chipName} not found`);
  }

  return buildOutputConnections(chip, definitions);
};

//  ==== Compute Output Circuit Node ====
export const computeOutputCircuitNode = (circuitNode: CircuitNode, inputValues: Record<string, boolean>): boolean => {
  if (circuitNode.type === NodeType.IN) {
    return inputValues[circuitNode.name];
  }
  if (circuitNode.type === NodeType.CHIP && circuitNode.name === ChipName.NAND) {
    if (circuitNode.inputs === undefined) {
      throw new Error("computeOutputCircuitNode: inputs NAND id " + circuitNode.id + " not found");
    }

    const preValues = computeOutputCircuitTree(circuitNode.inputs, inputValues);
    if (preValues === undefined) {
      throw new Error("computeOutputCircuitNode: prev values NAND id " + circuitNode.id + " not found");
    }
    return !(preValues.a && preValues.b);
  }
  throw new Error("computeOutputCircuitNode: unsupported chip name" + circuitNode.name);
};

//  ==== Compute Output Circuit Tree ====
export const computeOutputCircuitTree = (
  circuitTree: CircuitTree,
  inputValues: Record<string, boolean>,
): Record<string, boolean> => {
  const outputValues: Record<string, boolean> = {};

  // Compute output value for each output port
  for (const outputPortName in circuitTree) {
    const outputPortNodes = circuitTree[outputPortName];

    // Process each node connected to this output port
    for (const circuitNode of outputPortNodes) {
      const computedValue = computeOutputCircuitNode(circuitNode, inputValues);
      outputValues[outputPortName] = computedValue;
      if (computedValue === true) {
        break;
      }
    }
  }

  return outputValues;
};

// ===== Compute Output Circuit Module ====
export const computeOutputChip = (
  chipName: string,
  inputValues: Record<string, boolean>,
  definitions: CircuitModule[],
): Record<string, boolean> => {
  console.log("----------------------------------- COMPUTE OUTPUT CHIP -----------------------------------");
  console.log("chipName", chipName, "inputValues", inputValues);
  console.log("definitions", definitions);
  const circuitTree = buildCircuitTree(NodeType.CHIP, chipName, definitions);
  console.log("----------------------------------------------------------------------");
  console.log("circuitTree", circuitTree);
  return computeOutputCircuitTree(circuitTree, inputValues);
  // return {};
};
