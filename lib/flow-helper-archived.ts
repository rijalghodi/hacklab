// import { ChipName, CircuitModule, CircuitNode, CircuitOutputs, NAND_OUT_NAME, NodeType } from "./types/flow";

// //  ==== Build Circuit Node ====
// const buildCircuitNode = (chipType: NodeType, chipName: string, definitions: CircuitModule[]): CircuitNode => {
//   console.log("----------------------------------- BUILD CIRCUIT NODE -----------------------------------");
//   console.log("chipName", chipName, "chipType", chipType);

//   if (chipType === NodeType.IN) {
//     return {
//       name: chipName,
//       type: chipType,
//     };
//   }

//   // if (chipType === NodeType.CHIP && chipName === ChipName.NAND) {
//   //   const internalTree = buildCircuitTree(chipType, chipName, definitions);
//   //   return {
//   //     name: chipName,
//   //     type: chipType,
//   //     inputs: internalTree,
//   //   };
//   // }

//   const chip = definitions.find((def) => def.name === chipName && def.type === chipType);
//   console.log("chip", chip);

//   if (!chip) {
//     throw new Error("buildCircuitNode: chip " + chipName + " not found");
//   }
//   const circuitNode: CircuitNode = {
//     name: chipName,
//     type: chipType,
//   };

//   // Find all input ports in the circuit
//   const inputNodes = chip.nodes?.filter((node) => node.type === NodeType.IN);
//   console.log("inputNodes", inputNodes);
//   if (!inputNodes) {
//     throw new Error("constructSource: input ports not found");
//   }

//   // Build inputs mapping for each input port
//   const circuitNodeInputs: Record<string, CircuitNode[]> = {};

//   for (const inputNode of inputNodes) {
//     if (inputNode.type === NodeType.IN) {
//       const internalTree = buildCircuitTree(inputNode.type, inputNode.name, definitions);
//       console.log("internalTree", internalTree);
//       circuitNodeInputs[inputNode.name] = internalTree[ChipName.OUT];
//       continue;
//     }

//     // Find all edges that connect to this input port
//     const edgesToInputPort = chip.edges?.filter((edge) => edge.targetPortId === inputNode.id) ?? [];

//     // Build circuit tree nodes for each connected source
//     const inputNodes: CircuitNode[] = [];

//     for (const edge of edgesToInputPort) {
//       const sourceNode = chip.nodes.find((node) => node.id === edge.sourceId);
//       if (!sourceNode) {
//         throw new Error("constructSource: node not found");
//       }

//       let circuitTreeNode: CircuitNode;
//       circuitTreeNode = buildCircuitNode(sourceNode.type, sourceNode.name, definitions);

//       // if (sourceNode.type === NodeType.IN) {
//       //   circuitTreeNode = {
//       //     id: sourceNode.id,
//       //     name: sourceNode.name,
//       //     type: sourceNode.type,
//       //   };
//       // } else if (sourceNode.type === NodeType.CHIP && sourceNode.name !== ChipName.NAND) {
//       //   const internalTree = buildCircuitTree(sourceNode.name, definitions);
//       //   circuitTreeNode = {
//       //     id: sourceNode.id,
//       //     name: sourceNode.name,
//       //     type: sourceNode.type,
//       //     inputs: internalTree,
//       //   };
//       // } else {
//       //   circuitTreeNode = buildCircuitNode(sourceNode.name, definitions);
//       // }

//       inputNodes.push(circuitTreeNode);
//     }

//     circuitNodeInputs[inputNode.name] = inputNodes;
//   }

//   circuitNode.sources = circuitNodeInputs;
//   return circuitNode;
// };

// //  ==== Build Circuit Tree ====
// export const buildCircuitTree = (
//   chipType: NodeType,
//   chipName: string,
//   definitions: CircuitModule[],
// ): CircuitOutputs => {
//   console.log("----------------------------------- BUILD CIRCUIT TREE -----------------------------------");
//   console.log("chipName", chipName, "chipType", chipType);

//   if (chipType === NodeType.IN) {
//     return {
//       [ChipName.OUT]: [
//         {
//           name: chipName,
//           type: chipType,
//         },
//       ],
//     };
//   }

//   if (chipName === ChipName.NAND && chipType === NodeType.CHIP) {
//     console.log("BUILD NAND CHIP");
//     const circuitNode = buildCircuitNode(chipType, chipName, definitions);
//     console.log("circuitNode", circuitNode);
//     return {
//       [NAND_OUT_NAME]: [circuitNode],
//     };
//   }

//   const chip = definitions.find((definition) => definition.name === chipName);
//   console.log("chip", chip);
//   if (!chip) {
//     throw new Error("buildCircuitTree: chip not found");
//   }
//   // Find all output ports in the circuit
//   const outputPorts = chip.nodes.filter((node) => node.type === NodeType.OUT);
//   console.log("outputPorts", outputPorts);
//   const circuitTree: Record<string, CircuitNode[]> = {};

//   // Build circuit tree for each output port
//   for (const outputPort of outputPorts) {
//     const outputPortName = outputPort.name;
//     circuitTree[outputPortName] = [];

//     // Find all edges connected to this output port
//     const edgesToOutputPort = chip.edges?.filter((edge) => edge.targetId === outputPort.id) ?? [];

//     // Build circuit tree nodes for each connected source
//     for (const edge of edgesToOutputPort) {
//       const sourceNode = chip.nodes.find((node) => node.id === edge.sourceId);
//       if (!sourceNode) {
//         continue;
//       }

//       const circuitTreeNode = buildCircuitNode(sourceNode.type, sourceNode.name, definitions);
//       circuitTree[outputPortName].push(circuitTreeNode);
//     }
//   }

//   return circuitTree;
// };

// //  ==== Compute Output Circuit Node ====
// export const computeOutputCircuitNode = (circuitNode: CircuitNode, inputValues: Record<string, boolean>): boolean => {
//   if (circuitNode.type === NodeType.IN) {
//     return inputValues[circuitNode.name];
//   }
//   if (circuitNode.type === NodeType.CHIP && circuitNode.name === ChipName.NAND) {
//     if (circuitNode.sources === undefined) {
//       throw new Error("computeOutputCircuitNode: inputs NAND id " + circuitNode.id + " not found");
//     }

//     const preValues = computeOutputCircuitTree(circuitNode.sources, inputValues);
//     if (preValues === undefined) {
//       throw new Error("computeOutputCircuitNode: prev values NAND id " + circuitNode.id + " not found");
//     }
//     return !(preValues.a && preValues.b);
//   }
//   throw new Error("computeOutputCircuitNode: unsupported chip name" + circuitNode.name);
// };

// //  ==== Compute Output Circuit Tree ====
// export const computeOutputCircuitTree = (
//   circuitTree: CircuitOutputs,
//   inputValues: Record<string, boolean>,
// ): Record<string, boolean> => {
//   const outputValues: Record<string, boolean> = {};

//   // Compute output value for each output port
//   for (const outputPortName in circuitTree) {
//     const outputPortNodes = circuitTree[outputPortName];

//     // Process each node connected to this output port
//     for (const circuitNode of outputPortNodes) {
//       const computedValue = computeOutputCircuitNode(circuitNode, inputValues);
//       outputValues[outputPortName] = computedValue;
//       if (computedValue === true) {
//         break;
//       }
//     }
//   }

//   return outputValues;
// };

// // ===== Compute Output Circuit Module ====
// export const computeOutputChip = (
//   chipName: string,
//   inputValues: Record<string, boolean>,
//   definitions: CircuitModule[],
// ): Record<string, boolean> => {
//   console.log("----------------------------------- COMPUTE OUTPUT CHIP -----------------------------------");
//   console.log("chipName", chipName, "inputValues", inputValues);
//   console.log("definitions", definitions);
//   const circuitTree = buildCircuitTree(NodeType.CHIP, chipName, definitions);
//   console.log("----------------------------------------------------------------------");
//   console.log("circuitTree", circuitTree);
//   return computeOutputCircuitTree(circuitTree, inputValues);
//   // return {};
// };
