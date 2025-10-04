import { ChipName, CircuitModule, CircuitNode, CircuitSource, NodeType } from "./types/flow";

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
const inputSource = (chipName: string): CircuitSource => ({
  portName: chipName,
  nodes: [createInputNode(chipName)],
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
const buildInputConnections = (
  chip: ChipMinimal,
  definitions: CircuitModule[],
  prevChips: ChipMinimal[] | null,
): CircuitSource[] => {
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

  const circuitSources: CircuitSource[] = [];

  for (const inputPort of inputPorts) {
    console.log("inputPort", inputPort);
    if (inputPort.type === NodeType.IN) {
      console.log("BUILD INPUT CONNECTIONS: INPUT PORT IS AN INPUT PORT");
      // Handle direct input connection
      const internalSources = buildCircuitSources({ name: inputPort.name, type: inputPort.type }, definitions);
      circuitSources.push(...internalSources);
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

      const circuitTreeNode = buildCircuitNode(sourceNode, definitions, prevChips);
      connectedNodes.push(circuitTreeNode);
    }

    circuitSources.push({
      portName: inputPort.name,
      nodes: connectedNodes,
    });
  }

  return circuitSources;
};

/**
 * Builds output connections for a chip
 */
const buildOutputConnections = (chip: CircuitModule, definitions: CircuitModule[]): CircuitSource[] => {
  // Exclude IN and OUT nodes
  if (chip.type === NodeType.IN || chip.type === NodeType.OUT) {
    return [];
  }
  const inputPorts = chip.nodes.filter((node) => node.type === NodeType.IN);
  const prevChips: ChipMinimal[] | null = inputPorts.map((inputPort) => {
    // find edge
    return {
      name: inputPort.name,
      type: inputPort.type,
    };
  });

  const outputPorts = chip.nodes.filter((node) => node.type === NodeType.OUT);
  const sources: CircuitSource[] = [];

  for (const outputPort of outputPorts) {
    const outputPortName = outputPort.name;

    if (isBaseCase(chip.type)) {
      sources.push({
        portName: outputPortName,
        nodes: [createInputNode(outputPortName)],
      });
      continue;
    }

    if (isNandChip(chip.name, chip.type)) {
      console.log("BUILD NAND CHIP");
      const circuitNode = buildCircuitNode({ name: chip.name, type: chip.type }, definitions, prevChips);
      console.log("circuitNode", circuitNode);
      sources.push({
        portName: outputPortName,
        nodes: [circuitNode],
      });
      continue;
    }

    sources.push({
      portName: outputPortName,
      nodes: [],
    });
    const edgesToOutputPort = chip.edges?.filter((edge) => edge.targetId === outputPort.id) ?? [];

    for (const edge of edgesToOutputPort) {
      const sourceNode = chip.nodes.find((node) => node.id === edge.sourceId);
      if (!sourceNode) {
        continue;
      }

      const circuitTreeNode = buildCircuitNode(sourceNode, definitions, prevChips);
      sources.push({
        portName: outputPortName,
        nodes: [circuitTreeNode],
      });
    }
  }

  return sources;
};

// ===== Main Functions =====

type ChipMinimal = {
  name: string;
  type: NodeType;
};

//  ==== Build Circuit Node ====
const buildCircuitNode = (
  chip: ChipMinimal,
  definitions: CircuitModule[],
  prevChips: ChipMinimal[] | null,
): CircuitNode => {
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
  if (isBaseCase(chip.type) && !prevChips) {
    return circuitNode;
  }

  // Build input connections
  const inputConnections = buildInputConnections(chip, definitions, prevChips);
  circuitNode.sources = inputConnections;

  return circuitNode;
};

//  ==== Build Circuit Sources ====
export const buildCircuitSources = (chip: ChipMinimal, definitions: CircuitModule[]): CircuitSource[] => {
  console.log("----------------------------------- BUILD CIRCUIT TREE -----------------------------------");
  const { name: chipName, type: chipType } = chip;
  console.log("chipName", chipName, "chipType", chipType);

  // Base case: Input node
  if (isBaseCase(chipType)) {
    return [inputSource(chipName)];
  }

  const prevChip: ChipMinimal | null = null;

  // General case: Complex chip
  const circuitModule = findChipByName(chipName, definitions);
  console.log("circuitModule", circuitModule);
  if (!circuitModule) {
    throw new Error(`buildCircuitTree: chip '${chipName}' not found`);
  }

  return buildOutputConnections(circuitModule, definitions);
};

//  ==== Compute Output Circuit Node ====
export const computeCircuitNode = (circuitNode: CircuitNode, inputValues: Record<string, boolean>): boolean => {
  if (circuitNode.type === NodeType.IN) {
    return inputValues[circuitNode.name];
  }
  if (circuitNode.type === NodeType.CHIP && circuitNode.name === ChipName.NAND) {
    if (circuitNode.sources === undefined) {
      throw new Error("computeOutputCircuitNode: inputs NAND id " + circuitNode.name + " not found");
    }

    const preValues = computeCircuitSources(circuitNode.sources, inputValues);
    if (preValues === undefined) {
      throw new Error("computeOutputCircuitNode: prev values NAND id " + circuitNode.name + " not found");
    }
    return !(preValues.a && preValues.b);
  }
  throw new Error("computeOutputCircuitNode: unsupported chip name" + circuitNode.name);
};

//  ==== Compute Output Circuit Tree ====
export const computeCircuitSources = (
  circuitSources: CircuitSource[],
  inputValues: Record<string, boolean>,
): Record<string, boolean> => {
  const outputValues: Record<string, boolean> = {};

  // Compute output value for each output port
  for (const source of circuitSources) {
    const outputPortNodes = source.nodes;
    const sourcePortName = source.portName;

    // Process each node connected to this output port
    for (const circuitNode of outputPortNodes) {
      const computedValue = computeCircuitNode(circuitNode, inputValues);
      outputValues[sourcePortName] = computedValue;
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
  const circuitTree = buildCircuitSources({ name: chipName, type: NodeType.CHIP }, definitions);
  console.log("----------------------------------------------------------------------");
  console.log("circuitTree", circuitTree);
  return computeCircuitSources(circuitTree, inputValues);
  // return {};
};
