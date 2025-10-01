import { Chip, ChipName, CircuitModule, CircuitTreeNode, CircuitTree, NodeType } from "./types/flow";

const buildCircuitNode = (chip: Chip, circuit: CircuitModule, definitions: CircuitModule[]): CircuitTreeNode => {
  let circuitNode: CircuitTreeNode = {
    id: chip.id,
    name: chip.name,
    type: chip.type,
  };

  // find the input edges
  const inputEdges = circuit.edges?.filter((edge) => edge.targetId === chip.id);
  if (!inputEdges) {
    throw new Error("constructSource: input edges not found");
  }

  // input ports of the chip
  const inputPorts = circuit.nodes?.filter((node) => node.type === NodeType.IN);
  if (!inputPorts) {
    throw new Error("constructSource: input ports not found");
  }

  const circuitNodeInputsArr: { inputPortName: string; inputs: CircuitTreeNode[] }[] = inputPorts.map((inputPort) => {
    // Find all edges that connect to this input port
    const inputEdges = circuit.edges?.filter((edge) => edge.targetPortId === inputPort.id) ?? [];

    // For each edge, find the source node and construct a CircuitTreeNode
    const inputs: CircuitTreeNode[] = inputEdges.map((edge) => {
      const node = circuit.nodes.find((node) => node.id === edge.sourceId);
      if (!node) {
        throw new Error("constructSource: node not found");
      }

      if (node.type === NodeType.IN) {
        return { id: node.id, name: node.name, type: node.type };
      }

      if (node.type === NodeType.CHIP && node.name != ChipName.NAND) {
        // restruct the advance chip into nand chips
        const internalCircuit = definitions.find((definition) => definition.name === node.name);
        if (!internalCircuit) {
          throw new Error("buildCircuitNode: internal circuit not found");
        }
        const tree = buildCircuitTree(internalCircuit, definitions);
        return { id: node.id, name: node.name, type: node.type, inputs: tree };
      }

      return buildCircuitNode(node, circuit, definitions);
    });

    return {
      inputPortName: inputPort.name,
      inputs,
    };
  });

  const circuitNodeInputs: Record<string, CircuitTreeNode[]> = Object.fromEntries(
    circuitNodeInputsArr.map((input) => {
      return [input.inputPortName, input.inputs];
    }),
  );

  circuitNode.inputs = circuitNodeInputs;

  return circuitNode;
};

export const buildCircuitTree = (circuit: CircuitModule, definitions: CircuitModule[]): CircuitTree => {
  //  find output ports
  const outputPorts = circuit.nodes.filter((node) => node.type === NodeType.OUT);

  let tree: Record<string, CircuitTreeNode[]> = {};

  // For each output port, find the edges
  for (const outputPort of outputPorts) {
    tree[outputPort.name] = [];

    const outputEdges = circuit.edges?.filter((edge) => edge.targetId === outputPort.id);
    if (!outputEdges) {
      continue;
    }

    // for each edge, find the source (chip)
    for (const outputEdge of outputEdges) {
      const sourceId = outputEdge.sourceId;
      const node = circuit.nodes.find((node) => node.id === sourceId);
      if (!node) {
        continue;
      }

      const treeNode = buildCircuitNode(node, circuit, definitions);
      tree[outputPort.name].push(treeNode);
    }
  }

  return tree;
};

export const computeOutputCircuitNode = (node: CircuitTreeNode, inputValues: Record<string, boolean>): boolean => {
  if (node.type === NodeType.IN) {
    return inputValues[node.name];
  }
  return false;
};

export const computeOutputCircuitTree = (
  tree: CircuitTree,
  inputValues: Record<string, boolean>,
): Record<string, boolean> => {
  const outputValues: Record<string, boolean> = {};

  for (const outputPortName in tree) {
    // outputValues[outputPortName] = computeOutputCircuitNode(tree[outputPortName], inputValues);

    for (const treeNode of tree[outputPortName]) {
      const outputValue = computeOutputCircuitNode(treeNode, inputValues);
      outputValues[outputPortName] = outputValue;
    }
  }
  return {};
};
