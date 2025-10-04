import { ChipName, Circuit, CircuitNode, CircuitSource, NodeType } from "./types/flow";

// ===== Helper Functions =====

/**
 * Finds a chip definition by name and type
 */
const findChipDefinition = (chipName: string, chipType: NodeType, definitions: Circuit[]): Circuit | undefined => {
  return definitions.find((def) => def.name === chipName && def.type === chipType);
};

/**
 * Finds a chip definition by name only
 */
const findChipByName = (chipName: string, definitions: Circuit[]): Circuit | undefined => {
  return definitions.find((definition) => definition.name === chipName);
};

/**
 * Creates a simple input node
 */
const buildInNode = (chipName: string): CircuitNode => ({
  name: chipName,
  type: NodeType.IN,
});

/**
 * Creates a simple output tree for input nodes
 */
const buildInSources = (chipName: string): CircuitSource[] => [
  {
    portName: chipName,
    nodes: [buildInNode(chipName)],
  },
];

/**
 * Checks if this is a base case (input node)
 */
const isInChip = (chipType: NodeType): boolean => chipType === NodeType.IN;

/**
 * Checks if this is a NAND chip (special case)
 */
const isNandChip = (chipName: string, chipType: NodeType): boolean =>
  chipName === ChipName.NAND && chipType === NodeType.CHIP;

/**
 * Builds input connections for a chip
 */
// const buildInputConnections2 = (
//   chip: ChipMinimal,
//   definitions: Circuit[],
//   prevSources: CircuitSource[] | null,
// ): CircuitSource[] => {
//   console.log("----------------------------------- BUILD INPUT CONNECTIONS -----------------------------------");
//   console.log("chipName", chip.name, "chipType", chip.type);
//   const circuit = findChipDefinition(chip.name, chip.type, definitions);
//   if (!circuit) {
//     throw new Error(`buildInputConnections: chip '${chip.name}' not found`);
//   }
//   const inputPorts = circuit.nodes?.filter((node) => node.type === NodeType.IN);
//   if (!inputPorts) {
//     throw new Error(`buildInputConnections: input ports not found`);
//   }

//   const circuitSources: CircuitSource[] = [];

//   for (const inputPort of inputPorts) {
//     console.log("inputPort", inputPort);
//     if (inputPort.type === NodeType.IN) {
//       console.log("BUILD INPUT CONNECTIONS: INPUT PORT IS AN INPUT PORT");
//       // Handle direct input connection
//       const internalSources = buildCircuitSources({ name: inputPort.name, type: inputPort.type }, definitions);
//       circuitSources.push(...internalSources);
//       continue;
//     }

//     console.log("BUILD INPUT CONNECTIONS: INPUT PORT IS A CHIP-TO-CHIP CONNECTION");
//     // Handle chip-to-chip connections
//     const edgesToInputPort = circuit.edges?.filter((edge) => edge.targetPortId === inputPort.id) ?? [];
//     const connectedNodes: CircuitNode[] = [];

//     for (const edge of edgesToInputPort) {
//       const sourceNode = circuit.nodes.find((node) => node.id === edge.sourceId);
//       if (!sourceNode) {
//         throw new Error(`buildInputConnections: source node not found`);
//       }

//       const circuitTreeNode = buildCircuitNode(sourceNode, definitions, prevSources);
//       connectedNodes.push(circuitTreeNode);
//     }

//     circuitSources.push({
//       portName: inputPort.name,
//       nodes: connectedNodes,
//     });
//   }

//   return circuitSources;
// };

/**
 * Builds output connections for a chip
 */
// const buildOutputConnection1s = (chip: Circuit, definitions: Circuit[]): CircuitSource[] => {
//   // Exclude IN and OUT nodes
//   if (chip.type === NodeType.IN || chip.type === NodeType.OUT) {
//     return [];
//   }
//   const inputPorts = chip.nodes.filter((node) => node.type === NodeType.IN);
//   const prevChips: ChipMinimal[] | null = inputPorts.map((inputPort) => {
//     // find edge
//     return {
//       name: inputPort.name,
//       type: inputPort.type,
//     };
//   });

//   const outputPorts = chip.nodes.filter((node) => node.type === NodeType.OUT);
//   const sources: CircuitSource[] = [];

//   for (const outputPort of outputPorts) {
//     const outputPortName = outputPort.name;

//     if (isINNode(chip.type)) {
//       sources.push({
//         portName: outputPortName,
//         nodes: [buildINNode(outputPortName)],
//       });
//       continue;
//     }

//     if (isNandChip(chip.name, chip.type)) {
//       console.log("BUILD NAND CHIP");
//       const circuitNode = buildCircuitNode({ name: chip.name, type: chip.type }, definitions, prevSources);
//       console.log("circuitNode", circuitNode);
//       sources.push({
//         portName: outputPortName,
//         nodes: [circuitNode],
//       });
//       continue;
//     }

//     sources.push({
//       portName: outputPortName,
//       nodes: [],
//     });
//     const edgesToOutputPort = chip.edges?.filter((edge) => edge.targetId === outputPort.id) ?? [];

//     for (const edge of edgesToOutputPort) {
//       const sourceNode = chip.nodes.find((node) => node.id === edge.sourceId);
//       if (!sourceNode) {
//         continue;
//       }

//       const circuitTreeNode = buildCircuitNode(sourceNode, definitions, prevSources);
//       sources.push({
//         portName: outputPortName,
//         nodes: [circuitTreeNode],
//       });
//     }
//   }

//   return sources;
// };

// ===== Main Functions =====

type ChipMinimal = {
  name: string;
  type: NodeType;
};

//  ==== Build Circuit Node ====
const buildCircuitNode = (
  chip: ChipMinimal,
  definitions: Circuit[],
  prevSources: CircuitSource[] | null,
): CircuitNode => {
  console.log("----------------------------------- BUILD CIRCUIT NODE -----------------------------------");
  console.log("chipName", chip.name, "chipType", chip.type);

  // Create circuit node
  const circuitNode: CircuitNode = {
    name: chip.name,
    type: chip.type,
  };

  // Base case: Input node
  if (isInChip(chip.type) && !prevSources) {
    return circuitNode;
  }

  if (isInChip(chip.type) && prevSources) {
    return {
      name: chip.name,
      type: chip.type,
      sources: prevSources,
    };
  }

  const circuit = findChipDefinition(chip.name, chip.type, definitions);
  if (!circuit) {
    throw new Error(`buildInputConnections: chip '${chip.name}' not found`);
  }
  const inputPorts = circuit.nodes?.filter((node) => node.type === NodeType.IN);
  if (!inputPorts) {
    throw new Error(`buildInputConnections: input ports not found`);
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
        throw new Error(`buildInputConnections: source node not found`);
      }

      const circuitTreeNode = buildCircuitNode(sourceNode, definitions, prevSources);
      connectedNodes.push(circuitTreeNode);
    }

    circuitSources.push({
      portName: inputPort.name,
      nodes: connectedNodes,
    });
  }

  circuitNode.sources = circuitSources;

  return circuitNode;
};

//  ==== Build Circuit Sources ====
export const buildCircuitSources = (chip: ChipMinimal, definitions: Circuit[]): CircuitSource[] => {
  console.log("----------------------------------- BUILD CIRCUIT SOURCES -----------------------------------");
  const { name: chipName, type: chipType } = chip;
  console.log("chipName", chipName, "chipType", chipType);

  // Exclude OUT nodes
  if (chipType == NodeType.OUT) {
    return [];
  }

  // Base case: Input node
  if (chipType == NodeType.IN) {
    return buildInSources(chipName);
  }

  // General case: Complex chip
  const circuit = findChipByName(chipName, definitions);
  console.log("circuit", circuit);
  if (!circuit) {
    throw new Error(`buildCircuitTree: chip '${chipName}' not found`);
  }

  const inputPorts = circuit.nodes.filter((node) => node.type === NodeType.IN);
  const prevSources: CircuitSource[] = inputPorts.map((inputPort) => {
    const edges = circuit.edges?.filter((edge) => edge.targetPortId === inputPort.id);
    if (!edges) {
      throw new Error(`buildCircuitSources: edges not found`);
    }
    const nodes = edges.map((edge) => circuit.nodes.find((node) => node.id === edge.sourceId));
    if (!nodes) {
      throw new Error(`buildCircuitSources: nodes not found`);
    }
    return {
      portName: inputPort.name,
      nodes: nodes.map((node) => ({ name: node?.name ?? "", type: node?.type ?? NodeType.IN })),
    };
  });

  const outputPorts = circuit.nodes.filter((node) => node.type === NodeType.OUT);
  console.log("outputPorts", outputPorts);
  const sources: CircuitSource[] = [];

  for (const outputPort of outputPorts) {
    const outputPortName = outputPort.name;

    if (chip.type == NodeType.IN) {
      sources.push(...buildInSources(outputPortName));
      continue;
    }

    if (chip.name === ChipName.NAND && chip.type === NodeType.CHIP) {
      console.log("BUILD NAND CHIP");
      const circuitNode = buildCircuitNode({ name: chip.name, type: chip.type }, definitions, prevSources);
      console.log("NAND circuitNode", circuitNode);
      sources.push({
        portName: outputPortName,
        nodes: [circuitNode],
      });
      continue;
    }

    const edgesToOutputPort = circuit.edges?.filter((edge) => edge.targetId === outputPort.id) ?? [];

    const nodes: CircuitNode[] = [];
    for (const edge of edgesToOutputPort) {
      const sourceNode = circuit.nodes.find((node) => node.id === edge.sourceId);
      if (!sourceNode) {
        continue;
      }

      const circuitNode = buildCircuitNode(sourceNode, definitions, prevSources);
      nodes.push(circuitNode);
    }

    sources.push({
      portName: outputPortName,
      nodes: nodes,
    });
  }

  return sources;
};

//  ==== Compute Output Circuit Node ====
export const computeCircuitNode = (circuitNode: CircuitNode, inputValues: Record<string, boolean>): boolean => {
  if (circuitNode.type === NodeType.IN) {
    return inputValues[circuitNode.name];
  }
  if (circuitNode.type === NodeType.CHIP && circuitNode.name === ChipName.NAND) {
    if (circuitNode.sources === undefined) {
      throw new Error(`computeOutputCircuitNode: inputs NAND id '${circuitNode.name}' not found`);
    }

    const preValues = computeCircuitSources(circuitNode.sources, inputValues);
    if (preValues === undefined) {
      throw new Error(`computeOutputCircuitNode: prev values NAND id '${circuitNode.name}' not found`);
    }
    return !(preValues.a && preValues.b);
  }
  throw new Error(
    `computeOutputCircuitNode: unsupported chip type '${circuitNode.type}' and name '${circuitNode.name}'`,
  );
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
  definitions: Circuit[],
): Record<string, boolean> => {
  console.log("----------------------------------- COMPUTE OUTPUT CHIP -----------------------------------");
  console.log("chipName", chipName, "inputValues", inputValues);
  console.log("definitions", definitions);
  const circuitTree = buildCircuitSources({ name: chipName, type: NodeType.CHIP }, definitions);
  console.log("----------------------------RESULT------------------------------------------");
  console.log("circuitTree", circuitTree);
  return computeCircuitSources(circuitTree, inputValues);
  // return {};
};
