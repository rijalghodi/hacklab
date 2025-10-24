import { CircuitChip, CircuitTreeNode, CircuitTreeNodeType, NAND_CHIP_TYPE, PortType } from "../types";
import { logger } from "../logger";
import { NAND_PORT_A_ID, NAND_PORT_B_ID, NAND_PORT_OUT_ID, nandChip } from "@/lib/constants/chips";

export const convertCircuitToTree = (
  circuiit: CircuitChip,
  parentSources: CircuitTreeNode[] | null = null,
): CircuitTreeNode[] => {
  logger.info({
    group: "circuit-to-tree",
    message: "[convertCircuitChipToTree]",
    data: { circuitChip: circuiit },
  });

  let sources: CircuitTreeNode[] = [];

  // if circuit is a NAND chip, return the NAND tree
  if (circuiit.chipType === NAND_CHIP_TYPE) {
    sources = [
      {
        id: NAND_PORT_OUT_ID,
        type: CircuitTreeNodeType.PORT,
        chipId: "nand",
        sources: [
          {
            id: "nand",
            type: CircuitTreeNodeType.NAND_CHIP,
            sources: [
              {
                id: NAND_PORT_A_ID,
                type: CircuitTreeNodeType.PORT,
                chipId: "nand",
                sources: [],
              },
              {
                id: NAND_PORT_B_ID,
                type: CircuitTreeNodeType.PORT,
                chipId: "nand",
                sources: [],
              },
            ],
          },
        ],
      },
    ];
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

  logger.info({
    group: "circuit-to-tree",
    message: "replaceChildSourceWithParentSources",
    data: {
      parentSources,
      childSource,
    },
  });
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
  logger.info({
    group: "circuit-to-tree",
    message: "[buildTreeNodeFromWire]",
    data: { circuit, wireId },
  });

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

  let childCircuit: CircuitChip;

  if (chip.chipType === NAND_CHIP_TYPE) {
    childCircuit = nandChip;
  } else {
    childCircuit = circuit.definitions.find((def) => def.chipType === chip.chipType) as CircuitChip;

    if (!childCircuit) {
      logger.error({
        group: "circuit-to-tree",
        message: `Chip definition ${chip.chipType} not found`,
        data: { circuit: circuit, chip },
      });
      throw new Error(`Chip definition ${chip.chipType} not found`);
    }

    childCircuit.definitions = circuit.definitions;
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
