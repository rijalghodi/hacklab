import { CircuitChip, CircuitTreeNode, CircuitTreeNodeType, NAND_CHIP_TYPE, PortType } from "@/lib/types";

import { nandTree } from "../constants/trees";
import { logger } from "../logger";

export const convertCircuitToTree = (
  circuiit: CircuitChip,
  parentSources: CircuitTreeNode[] | null,
): CircuitTreeNode[] => {
  logger.info({ group: "circuit-to-tree", message: "[convertCircuitChipToTree]", data: { circuitChip: circuiit } });

  let sources: CircuitTreeNode[] = [];

  // if circuit is a NAND chip, return the NAND tree
  if (circuiit.chipType === NAND_CHIP_TYPE) {
    sources = nandTree;
  } else {
    // Find all output ports - these will be the root nodes of our tree
    const outputPorts = circuiit.ports?.filter((port) => port.type === PortType.OUT) || [];

    sources = outputPorts.map((outputPort) => {
      return buildTreeNodeFromOutputPort(circuiit, outputPort.id);
    });
  }

  // connect to parent sources
  if (parentSources && parentSources.length > 0) {
    for (let i = 0; i < sources.length; i++) {
      const sourceReplaced = replaceChildSourceWithParentSources(sources[i], parentSources);
      sources[i] = sourceReplaced;
    }
  }

  return sources;
};

const replaceChildSourceWithParentSources = (
  childSource: CircuitTreeNode,
  parentSources: CircuitTreeNode[],
): CircuitTreeNode => {
  const matchedParentSource = parentSources?.find((ps) => ps.id === childSource.id && ps.chipId === childSource.chipId);

  if (matchedParentSource) {
    return matchedParentSource;
  }

  if (childSource.sources) {
    for (let i = 0; i < childSource.sources.length; i++) {
      const s = childSource.sources[i];
      const sReplaced = replaceChildSourceWithParentSources(s, parentSources);
      childSource.sources[i] = sReplaced;
    }

    return childSource;
  }

  return childSource;
};

const buildTreeNodeFromOutputPort = (circuit: CircuitChip, outputPortId: string): CircuitTreeNode => {
  logger.info({
    group: "circuit-to-tree",
    message: "[buildTreeNodeFromOutputPort]",
    data: { circuit, portId: outputPortId },
  });

  const port = circuit.ports?.find((p) => p.id === outputPortId);
  if (!port) {
    throw new Error(`Port ${outputPortId} not found`);
  }

  // Find wires that connect to this port as target
  const lastWires = circuit.wires?.filter((wire) => wire.targetId === outputPortId) || [];

  const sources: CircuitTreeNode[] = lastWires.map((wire) => {
    return buildTreeNodeFromWire(circuit, wire.id);
  });

  return {
    id: outputPortId,
    chipId: circuit.id,
    type: CircuitTreeNodeType.PORT,
    sources,
  };
};

const buildTreeNodeFromWire = (circuit: CircuitChip, wireId: string): CircuitTreeNode => {
  logger.info({ group: "circuit-to-tree", message: "[buildTreeNodeFromWire]", data: { circuit, wireId } });

  const wire = circuit.wires?.find((w) => w.id === wireId);
  if (!wire) {
    throw new Error(`Wire ${wireId} not found`);
  }

  // Find the source of this wire
  const sourceItem = buildTreeNodeFromSource(circuit, wire.sourceId, wire.sourcePortId);

  return {
    id: wireId,
    type: CircuitTreeNodeType.WIRE,
    sources: [sourceItem],
  };
};

const buildTreeNodeFromSource = (
  circuit: CircuitChip,
  sourceId: string,
  sourcePortId: string | null, // outputPortId in chip
  // parentSource: CircuitTreeNode | null,
): CircuitTreeNode => {
  logger.info({
    group: "circuit-to-tree",
    message: "[buildTreeNodeFromSource]",
    data: { circuitChip: circuit, sourceId, sourcePortId },
  });

  // Check if sourceId is an input port
  const inputPort = circuit.ports?.find((p) => p.id === sourceId && p.type === PortType.IN);
  if (inputPort) {
    return {
      id: sourceId,
      chipId: circuit.id,
      type: CircuitTreeNodeType.PORT,
      sources: [],
    };
    // return buildTreeNodeFromOutputPort(circuit, inputPort.id);
  }

  // Check if sourceId is a chip
  const chip = circuit.chips?.find((c) => c.id === sourceId);

  if (!chip) {
    throw new Error(`Source ${sourceId} not found`);
  }

  if (!sourcePortId) {
    throw new Error(`SourcePortId for ${sourceId} not found`);
  }

  return buildTreeNodeFromChip(circuit, chip.id, sourcePortId);
};

const buildTreeNodeFromChip = (circuit: CircuitChip, chipId: string, outputPortId: string): CircuitTreeNode => {
  logger.info({
    group: "circuit-to-tree",
    message: "[buildTreeNodeFromChip]",
    data: { circuit: circuit, chipId, portId: outputPortId },
  });
  const chip = circuit.chips?.find((c) => c.id === chipId);
  if (!chip) {
    throw new Error(`Chip ${chipId} not found`);
  }

  const childCircuit = circuit.definitions.find((def) => def.chipType === chip.chipType) as CircuitChip;
  childCircuit.definitions = circuit.definitions;

  if (!childCircuit) {
    logger.error({
      group: "circuit-to-tree",
      message: `Chip definition ${chip.chipType} not found`,
      data: { circuit: circuit, chip },
    });
    throw new Error(`Chip definition ${chip.chipType} not found`);
  }

  // parent sources
  const childInputPorts = childCircuit.ports?.filter((p) => p.type === PortType.IN);
  let parentSources: CircuitTreeNode[] | null = null;

  if (childInputPorts && childInputPorts.length > 0) {
    parentSources = childInputPorts
      .map((p) => {
        // find wire
        const parentWires = circuit.wires?.filter((w) => w.targetPortId === p.id);
        if (!parentWires) return null;

        const parentWireSources = parentWires.map((pw) => buildTreeNodeFromWire(circuit, pw.id));

        return {
          id: p.id,
          type: CircuitTreeNodeType.PORT,
          chipId: childCircuit.id,
          sources: parentWireSources,
        };
      })
      .filter((p) => p != null);
  }

  const sources = convertCircuitToTree(childCircuit, parentSources);

  return {
    id: outputPortId,
    chipId: chipId,
    type: CircuitTreeNodeType.PORT,
    sources,
  };
};

// const expandNandChip = (circuit: Omit<CircuitChip, "id">, chipId: string): CircuitTreeNode => {
//   logger.info({ group: "circuit-to-tree", message: "[expandNandChip]", data: { circuit, chipId } });

//   // For base chips, we need to create the internal port structure

//   // Find wires that connect to this chip's input ports
//   const inputWires = circuit.wires?.filter((wire) => wire.targetId === chipId) || [];

//   const sources: CircuitTreeNode[] = inputWires.map((wire) => {
//     if (!wire.targetPortId) {
//       throw new Error(`Target port ID required for base chip expansion`);
//     }

//     const inputPort: CircuitTreeNode = {
//       id: wire.targetPortId,
//       type: CircuitTreeNodeType.PORT,
//       sources: [buildTreeNodeFromWire(circuit, wire.id)],
//     };
//     return inputPort;
//   });

//   return {
//     id: "nand.port-out",
//     type: CircuitTreeNodeType.PORT,
//     sources: [
//       {
//         id: chipId,
//         type: CircuitTreeNodeType.NAND_CHIP,
//         sources,
//       },
//     ],
//   };
// };

// const expandCompositeChipWithParentConnections = (
//   parentCircuit: Omit<CircuitChip, "id">,
//   currentCircuit: Omit<CircuitChip, "id">,
//   chipId: string,
//   outputPortId: string | null,
// ): CircuitTreeNode => {
//   logger.info({
//     group: "circuit-to-tree",
//     message: "[expandCompositeChipWithParentConnections]",
//     data: { circuit: parentCircuit, currentCircuit, chipId, outputPortId },
//   });

//   if (!outputPortId) {
//     throw new Error(`Port ID required for composite chip expansion`);
//   }

//   // Find the output port in the chip definition
//   const outputPort = currentCircuit.ports?.find((p) => p.id === outputPortId);
//   if (!outputPort) {
//     throw new Error(`Port ${outputPortId} not found in chip definition`);
//   }

//   // Find wires in the parent circuit that connect to this composite chip
//   const incomingWires = parentCircuit.wires?.filter((wire) => wire.targetId === chipId) || [];

//   if (incomingWires.length > 0) {
//     // This composite chip receives input from parent circuit
//     // We need to create a tree that connects the parent input to the composite chip's output

//     // Find the input port that receives input from parent circuit
//     const inputWires = incomingWires.filter((wire) =>
//       currentCircuit.ports?.some((port) => port.id === wire.targetPortId && port.type === PortType.IN),
//     );

//     if (inputWires.length > 0) {
//       // Create a custom tree structure that connects parent input to composite chip output
//       // First, get the parent circuit's input
//       const parentInput = buildTreeNodeFromSource(parentCircuit, inputWires[0].sourceId, inputWires[0].sourcePortId);

//       // Then, create a tree that replaces the composite chip's input with the parent input
//       return createCustomCompositeTree(currentCircuit, outputPortId, parentInput);
//     }
//   }

//   // No incoming wires or no input wires found, use the original expansion
//   return buildTreeNodeFromOutputPort(currentCircuit, outputPortId);
// };

// const createCustomCompositeTree = (
//   // _parentCircuit: Omit<CircuitChip, "id">,
//   currentCircuit: Omit<CircuitChip, "id">,
//   portId: string,
//   parentInput: CircuitTreeNode,
// ): CircuitTreeNode => {
//   logger.info({
//     group: "circuit-to-tree",
//     message: "[createCustomCompositeTree]",
//     data: { currentCircuit, portId, parentInput },
//   });
//   // Find the port in the chip definition
//   const port = currentCircuit.ports?.find((p) => p.id === portId);
//   if (!port) {
//     throw new Error(`Port ${portId} not found in chip definition`);
//   }

//   // Build the tree for this port in the chip definition
//   let tree = buildTreeNodeFromOutputPort(currentCircuit, portId);

//   // Replace any references to the input port with the parent input FIRST
//   const inputPortId = currentCircuit.ports?.find((p) => p.type === PortType.IN)?.id || "";
//   tree = replaceInputPortInTree(tree, inputPortId, parentInput);

//   return tree;
// };

// const replaceInputPortInTree = (
//   tree: CircuitTreeNode,
//   inputPortId: string,
//   replacement: CircuitTreeNode,
// ): CircuitTreeNode => {
//   logger.info({
//     group: "circuit-to-tree",
//     message: "[replaceInputPortInTree]",
//     data: { tree, inputPortId, replacement },
//   });
//   if (tree.id === inputPortId) {
//     return replacement;
//   }

//   if (tree.sources) {
//     return {
//       ...tree,
//       sources: tree.sources.map((source) => replaceInputPortInTree(source, inputPortId, replacement)),
//     };
//   }

//   return tree;
// };
