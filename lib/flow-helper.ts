import { Chip, ChipName, CircuitModule, CircuitNode, CircuitOutputs, NAND_OUT_NAME, NodeType } from "./types/flow";

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
const createInputOutputTree = (chipName: string): CircuitOutputs => ({
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
const buildInputConnections = (chip: ChipMinimal, definitions: CircuitModule[]): Record<string, CircuitNode[]> => {
  console.log("----------------------------------- BUILD INPUT CONNECTIONS -----------------------------------");
  console.log("chipName", chip.name, "chipType", chip.type);
  const circuit = findChipDefinition(chip.name, chip.type, definitions);
  if (!circuit) {
    throw new Error("buildInputConnections: chip '" + chip.name + "' not found");
  }
  const inputPorts = circuit.nodes?.filter((node) => node.type === NodeType.IN);
  if (!inputPorts) {
    throw new Error("buildInputConnections: input ports not found");
  }

  const circuitNodeInputs: Record<string, CircuitNode[]> = {};

  for (const inputPort of inputPorts) {
    console.log("inputPort", inputPort);
    if (inputPort.type === NodeType.IN) {
      console.log("BUILD INPUT CONNECTIONS: INPUT PORT IS AN INPUT PORT");
      // Handle direct input connection
      const internalTree = buildCircuitOutputs({ name: inputPort.name, type: inputPort.type }, definitions);
      circuitNodeInputs[inputPort.name] = internalTree[ChipName.OUT];
      continue;
    }

    console.log("BUILD INPUT CONNECTIONS: INPUT PORT IS A CHIP-TO-CHIP CONNECTION");
    // Handle chip-to-chip connections
    const edgesToInputPort = circuit.edges?.filter((edge) => edge.targetPortId === inputPort.id) ?? [];
    const connectedNodes: CircuitNode[] = [];

    for (const edge of edgesToInputPort) {
      const sourceNode = circuit.nodes.find((node) => node.id === edge.sourceId);
      if (!sourceNode) {
        throw new Error("buildInputConnections: source node not found");
      }

      const circuitTreeNode = buildCircuitNode(sourceNode, definitions);
      connectedNodes.push(circuitTreeNode);
    }

    circuitNodeInputs[inputPort.name] = connectedNodes;
  }

  return circuitNodeInputs;
};

/**
 * Builds output connections for a chip
 */
const buildOutputConnections = (chip: CircuitModule, definitions: CircuitModule[]): CircuitOutputs => {
  const outputPorts = chip.nodes.filter((node) => node.type === NodeType.OUT);
  const outputs: CircuitOutputs = {};

  // Base case: Input node
  // if (isBaseCase(chipType)) {
  //   return createInputOutputTree(chipName);
  // }

  // Special case: NAND chip
  // if (isNandChip(chip.name, chip.type)) {
  //   console.log("BUILD NAND CHIP");
  //   const circuitNode = buildCircuitNode({ name: chip.name, type: chip.type }, definitions);
  //   console.log("circuitNode", circuitNode);
  //   return {
  //     [NAND_OUT_NAME]: [circuitNode],
  //   };
  // }

  for (const outputPort of outputPorts) {
    const outputPortName = outputPort.name;

    if (isBaseCase(chip.type)) {
      outputs[outputPortName] = [createInputNode(outputPortName)];
      continue;
    }

    if (isNandChip(chip.name, chip.type)) {
      console.log("BUILD NAND CHIP");
      const circuitNode = buildCircuitNode({ name: chip.name, type: chip.type }, definitions);
      console.log("circuitNode", circuitNode);
      outputs[outputPortName] = [circuitNode];
      continue;
    }

    outputs[outputPortName] = [];
    const edgesToOutputPort = chip.edges?.filter((edge) => edge.targetId === outputPort.id) ?? [];

    for (const edge of edgesToOutputPort) {
      const sourceNode = chip.nodes.find((node) => node.id === edge.sourceId);
      if (!sourceNode) {
        continue;
      }

      const circuitTreeNode = buildCircuitNode(sourceNode, definitions);
      outputs[outputPortName].push(circuitTreeNode);
    }
  }

  return outputs;
};

// ===== Main Functions =====

type ChipMinimal = {
  name: string;
  type: NodeType;
};

//  ==== Build Circuit Node ====
const buildCircuitNode = (chip: ChipMinimal, definitions: CircuitModule[], prevChip?: ChipMinimal): CircuitNode => {
  console.log("----------------------------------- BUILD CIRCUIT NODE -----------------------------------");
  console.log("chipName", chip.name, "chipType", chip.type);

  const chipName = chip.name;
  const chipType = chip.type;

  // Create circuit node
  const circuitNode: CircuitNode = {
    name: chipName,
    type: chipType,
  };

  // Base case: Input node
  if (isBaseCase(chip.type) && !prevChip) {
    return circuitNode;
  }

  // if (isNandChip(chip.name, chip.type)) {
  //   console.log("BUILD NAND CHIP");
  //   const circuitNode = buildCircuitNode({ name: chip.name, type: chip.type }, definitions);
  //   console.log("circuitNode", circuitNode);
  //   return circuitNode;
  // }

  // Build input connections
  const inputConnections = buildInputConnections(chip, definitions);
  circuitNode.inputs = inputConnections;

  return circuitNode;
};

//  ==== Build Circuit Tree ====
export const buildCircuitOutputs = (chip: ChipMinimal, definitions: CircuitModule[]): CircuitOutputs => {
  console.log("----------------------------------- BUILD CIRCUIT TREE -----------------------------------");
  console.log("chipName", chip.name, "chipType", chip.type);

  const chipName = chip.name;
  const chipType = chip.type;

  // Base case: Input node
  if (isBaseCase(chipType)) {
    return createInputOutputTree(chipName);
  }

  // Special case: NAND chip
  // if (isNandChip(chipName, chipType)) {
  //   console.log("BUILD NAND CHIP");
  //   const circuitNode = buildCircuitNode({ name: chipName, type: chipType }, definitions);
  //   console.log("circuitNode", circuitNode);
  //   return {
  //     [NAND_OUT_NAME]: [circuitNode],
  //   };
  // }

  // General case: Complex chip
  const circuitModule = findChipByName(chipName, definitions);
  console.log("circuitModule", circuitModule);
  if (!circuitModule) {
    throw new Error(`buildCircuitTree: chip '${chipName}' not found`);
  }

  return buildOutputConnections(circuitModule, definitions);
};

// ===== build main circuit tree =====
// const buildMainCircuitTree = (chipName: string, definitions: CircuitModule[]): CircuitTree => {
//   const chip = findChipByName(chipName, definitions);
//   if (!chip) {
//     throw new Error(`buildMainCircuitTree: chip ${chipName} not found`);
//   }
//   return buildOutputConnections(chip, definitions);
// };

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
  circuitTree: CircuitOutputs,
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
  const circuitTree = buildCircuitOutputs({ name: chipName, type: NodeType.CHIP }, definitions);
  console.log("----------------------------------------------------------------------");
  console.log("circuitTree", circuitTree);
  return computeOutputCircuitTree(circuitTree, inputValues);
  // return {};
};
