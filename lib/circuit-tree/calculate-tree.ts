import { CircuitTreeNode, CircuitTreeNodeType } from "@/lib/types";

import { logger } from "../logger";

export type PassedValue = Record<string, boolean>;

export function calculateTree(tree: CircuitTreeNode[], passedValues: PassedValue): [PassedValue, CircuitTreeNode[]] {
  logger.info({ group: "calculate-tree", message: "[calculateTree]", data: { tree, passedValues } });
  const outputValues: PassedValue = {};

  for (let i = 0; i < tree.length; i++) {
    tree[i] = calculateNode(tree[i], passedValues);
    outputValues[tree[i].id] = tree[i].value || false;
  }

  return [outputValues, tree];
}

function calculateNode(node: CircuitTreeNode, passedValues: PassedValue): CircuitTreeNode {
  logger.info({ group: "calculate-tree", message: "[calculateNode]", data: { node, passedValues } });
  if (node.type === CircuitTreeNodeType.PORT) {
    return calculatePort(node, passedValues);
  }

  if (node.type === CircuitTreeNodeType.WIRE) {
    return calculateWire(node, passedValues);
  }

  if (node.type === CircuitTreeNodeType.NAND_CHIP) {
    return calculateNandChip(node, passedValues);
  }

  throw new Error(`Unknown node type: ${node.type}`);
}

function calculatePort(node: CircuitTreeNode, passedValues: PassedValue): CircuitTreeNode {
  logger.info({ group: "calculate-tree", message: "[calculatePort]", data: { node, passedValues } });
  if (passedValues[node.id] !== undefined) {
    node.value = passedValues[node.id];
    return node;
  }

  return calculateNodeWithSources(node, passedValues, "Port");
}

function calculateWire(node: CircuitTreeNode, passedValues: PassedValue): CircuitTreeNode {
  logger.info({ group: "calculate-tree", message: "[calculateWire]", data: { node, passedValues } });
  return calculateNodeWithSources(node, passedValues, "Wire");
}

function calculateNodeWithSources(
  node: CircuitTreeNode,
  passedValues: PassedValue,
  type: "Wire" | "Port",
): CircuitTreeNode {
  logger.info({ group: "calculate-tree", message: "[calculateNodeWithSources]", data: { node, passedValues, type } });
  if (!node.sources || node.sources.length === 0) {
    logger.error({
      group: "calculate-tree",
      message: `${type} ${node.id} has no value or sources`,
      data: { node, passedValues, type },
    });
    throw new Error(`${type} ${node.id} has no value or sources`);
  }

  const sourcesLength = node.sources.length;
  const newSources = new Array(sourcesLength);
  let nodeValue = false;

  for (let i = 0; i < sourcesLength; i++) {
    const calculatedSource = calculateNode(node.sources[i], passedValues);
    newSources[i] = calculatedSource;
    if (calculatedSource.value) {
      nodeValue = true;
    }
  }

  node.value = nodeValue;
  node.sources = newSources;

  return node;
}

function calculateNandChip(node: CircuitTreeNode, passedValues: PassedValue): CircuitTreeNode {
  logger.info({ group: "calculate-tree", message: "[calculateNandChip]", data: { node, passedValues } });
  if (!node.sources || node.sources.length < 2) {
    throw new Error(`NAND chip ${node.id} has no value or sources`);
  }

  const sourcesLength = node.sources.length;
  const newSources = new Array(sourcesLength);

  for (let i = 0; i < sourcesLength; i++) {
    newSources[i] = calculateNode(node.sources[i], passedValues);
  }

  const nodeValue = !(newSources[0].value && newSources[1].value);

  node.value = nodeValue;
  node.sources = newSources;

  return node;
}
