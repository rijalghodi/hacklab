import { ChipName, Circuit, CircuitNode, CircuitSource, NodeType } from "./types/flow";

// ===== Helper Functions =====

/**
 * Finds a chip definition by name and type
 */
const findChipDefinition = (chipName: string, chipType: NodeType, definitions: Circuit[]): Circuit | undefined => {
    console.log(`[FIND_CHIP_DEFINITION] Looking for chip: "${chipName}" of type: "${chipType}"`);
    const result = definitions.find((def) => def.name === chipName && def.type === chipType);
    console.log(`[FIND_CHIP_DEFINITION] Found:`, result ? `"${result.name}"` : "NOT FOUND");
    return result;
};

/**
 * Finds a chip definition by name only
 */
const findChipByName = (chipName: string, definitions: Circuit[]): Circuit | undefined => {
    console.log(`[FIND_CHIP_BY_NAME] Looking for chip: "${chipName}"`);
    const result = definitions.find((definition) => definition.name === chipName);
    console.log(`[FIND_CHIP_BY_NAME] Found:`, result ? `"${result.name}"` : "NOT FOUND");
    return result;
};

/**
 * Creates a simple input node
 */
const buildInNode = (chipName: string): CircuitNode => {
    console.log(`[BUILD_IN_NODE] Creating input node: "${chipName}"`);
    const node = {
        name: chipName,
        type: NodeType.IN,
    };
    console.log(`[BUILD_IN_NODE] Created:`, node);
    return node;
};

/**
 * Creates a simple output tree for input nodes
 */
const buildInSources = (chipName: string): CircuitSource[] => {
    console.log(`[BUILD_IN_SOURCES] Creating input sources for: "${chipName}"`);
    const sources = [
        {
            portName: chipName,
            nodes: [buildInNode(chipName)],
        },
    ];
    console.log(`[BUILD_IN_SOURCES] Created sources:`, sources);
    return sources;
};

/**
 * Checks if this is a base case (input node)
 */
const isInChip = (chipType: NodeType): boolean => {
    const result = chipType === NodeType.IN;
    console.log(`[IS_IN_CHIP] Type: "${chipType}" -> Is Input: ${result}`);
    return result;
};

/**
 * Checks if this is a NAND chip (special case)
 */
const _isNandChip = (chipName: string, chipType: NodeType): boolean => {
    const result = chipName === ChipName.NAND && chipType === NodeType.CHIP;
    console.log(`[IS_NAND_CHIP] Name: "${chipName}", Type: "${chipType}" -> Is NAND: ${result}`);
    return result;
};

// ===== Main Functions =====

type ChipMinimal = {
    name: string;
    type: NodeType;
};

//  ==== Build Circuit Node ====
const buildCircuitNode = (chip: ChipMinimal, definitions: Circuit[], parentCircuit?: Circuit): CircuitNode => {
    console.log("==================================== BUILD CIRCUIT NODE ====================================");
    console.log(`[BUILD_CIRCUIT_NODE] Starting - Name: "${chip.name}", Type: "${chip.type}"`);
    console.log(`[BUILD_CIRCUIT_NODE] Previous Sources:`);

    // Create circuit node
    const circuitNode: CircuitNode = {
        name: chip.name,
        type: chip.type,
    };
    console.log(`[BUILD_CIRCUIT_NODE] Created base node:`, circuitNode);

    // Base case: Input node
    if (isInChip(chip.type)) {
        return circuitNode;
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

        // Find edges that target this input port
        // Use parent circuit if available, otherwise use the chip's own circuit
        const circuitToSearch = parentCircuit || circuit;
        const edgesToInputPort = circuitToSearch.edges?.filter((edge) => edge.targetPortId === inputPort.id) ?? [];
        console.log(
            `[BUILD_CIRCUIT_NODE] Edges to input port "${inputPort.name}" in circuit "${circuitToSearch.name}":`,
            edgesToInputPort,
        );

        if (edgesToInputPort.length === 0) {
            console.log(`[BUILD_CIRCUIT_NODE] No edges to input port "${inputPort.name}" - creating input node`);
            // This is an external input, create an input node
            const inputNode: CircuitNode = {
                name: inputPort.name,
                type: NodeType.IN,
            };
            circuitSources.push({
                portName: inputPort.name,
                nodes: [inputNode],
            });
            continue;
        }

        // Handle connections from other nodes to this input port
        const connectedNodes: CircuitNode[] = [];
        for (const edge of edgesToInputPort) {
            // Look for source node in the parent circuit (where the edge is defined)
            const sourceNode = circuitToSearch.nodes.find((node) => node.id === edge.sourceId);
            if (!sourceNode) {
                throw new Error(`buildInputConnections: source node not found`);
            }

            console.log(`[BUILD_CIRCUIT_NODE] Building circuit for source node:`, sourceNode);

            // If the source node is an input node, create a simple input node
            if (sourceNode.type === NodeType.IN) {
                const inputNode: CircuitNode = {
                    name: sourceNode.name,
                    type: NodeType.IN,
                };
                connectedNodes.push(inputNode);
            } else {
                // For other types, recursively build the circuit
                const circuitTreeNode = buildCircuitNode(sourceNode, definitions, circuitToSearch);
                connectedNodes.push(circuitTreeNode);
            }
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
    console.log("==================================== BUILD CIRCUIT SOURCES ====================================");
    const { name: chipName, type: chipType } = chip;
    console.log(`[BUILD_CIRCUIT_SOURCES] Starting - Name: "${chipName}", Type: "${chipType}"`);
    console.log(
        `[BUILD_CIRCUIT_SOURCES] Available definitions:`,
        definitions.map((d) => d.name),
    );

    // Exclude OUT nodes
    if (chipType == NodeType.OUT) {
        console.log(`[BUILD_CIRCUIT_SOURCES] Excluding OUT node: "${chipName}"`);
        return [];
    }

    // Base case: Input node
    if (chipType == NodeType.IN) {
        console.log(`[BUILD_CIRCUIT_SOURCES] Base case - Input node: "${chipName}"`);
        const result = buildInSources(chipName);
        console.log(`[BUILD_CIRCUIT_SOURCES] Input sources result:`, result);
        return result;
    }

    // General case: Complex chip
    console.log(`[BUILD_CIRCUIT_SOURCES] General case - Complex chip: "${chipName}"`);
    const circuit = findChipByName(chipName, definitions);
    console.log(`[BUILD_CIRCUIT_SOURCES] Found circuit:`, circuit);
    if (!circuit) {
        console.error(`[BUILD_CIRCUIT_SOURCES] ERROR: Chip '${chipName}' not found in definitions`);
        throw new Error(`buildCircuitTree: chip '${chipName}' not found`);
    }

    const inputPorts = circuit.nodes.filter((node) => node.type === NodeType.IN);
    console.log(`[BUILD_CIRCUIT_SOURCES] Input ports:`, inputPorts);

    const outputPorts = circuit.nodes.filter((node) => node.type === NodeType.OUT);
    console.log(`[BUILD_CIRCUIT_SOURCES] Output ports:`, outputPorts);
    const sources: CircuitSource[] = [];
    console.log(`[BUILD_CIRCUIT_SOURCES] Processing ${outputPorts.length} output ports...`);

    for (const outputPort of outputPorts) {
        const outputPortName = outputPort.name;
        console.log(`[BUILD_CIRCUIT_SOURCES] Processing output port: "${outputPortName}"`);

        if (chip.type == NodeType.IN) {
            console.log(`[BUILD_CIRCUIT_SOURCES] Chip is IN type, building input sources for: "${outputPortName}"`);
            const inputSources = buildInSources(outputPortName);
            console.log(`[BUILD_CIRCUIT_SOURCES] Input sources for "${outputPortName}":`, inputSources);
            sources.push(...inputSources);
            continue;
        }

        if (_isNandChip(chip.name, chip.type)) {
            console.log(`[BUILD_CIRCUIT_SOURCES] Special case - NAND chip: "${chip.name}"`);
            const circuitNode = buildCircuitNode({ name: chip.name, type: chip.type }, definitions, circuit);
            console.log(`[BUILD_CIRCUIT_SOURCES] NAND circuit node:`, circuitNode);
            const nandSource = {
                portName: outputPortName,
                nodes: [circuitNode],
            };
            console.log(`[BUILD_CIRCUIT_SOURCES] Adding NAND source:`, nandSource);
            sources.push(nandSource);
            continue;
        }

        const edgesToOutputPort = circuit.edges?.filter((edge) => edge.targetId === outputPort.id) ?? [];
        console.log(`[BUILD_CIRCUIT_SOURCES] Edges to output port "${outputPortName}":`, edgesToOutputPort);

        const nodes: CircuitNode[] = [];
        for (const edge of edgesToOutputPort) {
            console.log(`[BUILD_CIRCUIT_SOURCES] Processing edge to output:`, edge);
            const sourceNode = circuit.nodes.find((node) => node.id === edge.sourceId);
            if (!sourceNode) {
                console.log(`[BUILD_CIRCUIT_SOURCES] Source node not found for edge:`, edge);
                continue;
            }
            console.log(`[BUILD_CIRCUIT_SOURCES] Found source node:`, sourceNode);

            const circuitNode = buildCircuitNode(sourceNode, definitions, circuit);
            console.log(`[BUILD_CIRCUIT_SOURCES] Built circuit node:`, circuitNode);
            nodes.push(circuitNode);
        }

        const outputSource = {
            portName: outputPortName,
            nodes: nodes,
        };
        console.log(`[BUILD_CIRCUIT_SOURCES] Adding output source:`, outputSource);
        sources.push(outputSource);
    }

    console.log(`[BUILD_CIRCUIT_SOURCES] Final sources:`, sources);
    console.log("==================================== BUILD CIRCUIT SOURCES END ====================================");
    return sources;
};

//  ==== Compute Output Circuit Node ====
export const computeCircuitNode = (circuitNode: CircuitNode, inputValues: Record<string, boolean>): boolean => {
    console.log("==================================== COMPUTE CIRCUIT NODE ====================================");
    console.log(`[COMPUTE_CIRCUIT_NODE] Computing node:`, circuitNode);
    console.log(`[COMPUTE_CIRCUIT_NODE] Input values:`, inputValues);

    if (circuitNode.type === NodeType.IN) {
        const result = inputValues[circuitNode.name];
        console.log(`[COMPUTE_CIRCUIT_NODE] Input node "${circuitNode.name}" -> value: ${result}`);
        return result;
    }

    if (circuitNode.type === NodeType.CHIP && circuitNode.name === ChipName.NAND) {
        console.log(`[COMPUTE_CIRCUIT_NODE] Processing NAND chip: "${circuitNode.name}"`);
        if (circuitNode.sources === undefined) {
            console.error(`[COMPUTE_CIRCUIT_NODE] ERROR: Sources not found for NAND: "${circuitNode.name}"`);
            throw new Error(`computeOutputCircuitNode: inputs NAND id '${circuitNode.name}' not found`);
        }
        console.log(`[COMPUTE_CIRCUIT_NODE] NAND sources:`, circuitNode.sources);

        const preValues = computeCircuitSources(circuitNode.sources, inputValues);
        console.log(`[COMPUTE_CIRCUIT_NODE] NAND pre-values:`, preValues);
        if (preValues === undefined) {
            console.error(`[COMPUTE_CIRCUIT_NODE] ERROR: Pre-values not found for NAND: "${circuitNode.name}"`);
            throw new Error(`computeOutputCircuitNode: prev values NAND id '${circuitNode.name}' not found`);
        }
        const result = !(preValues.a && preValues.b);
        console.log(`[COMPUTE_CIRCUIT_NODE] NAND result: !(${preValues.a} && ${preValues.b}) = ${result}`);
        console.log(
            "==================================== COMPUTE CIRCUIT NODE END ====================================",
        );
        return result;
    }

    console.error(
        `[COMPUTE_CIRCUIT_NODE] ERROR: Unsupported chip type: "${circuitNode.type}" and name: "${circuitNode.name}"`,
    );
    throw new Error(
        `computeOutputCircuitNode: unsupported chip type '${circuitNode.type}' and name '${circuitNode.name}'`,
    );
};

//  ==== Compute Output Circuit Tree ====
export const computeCircuitSources = (
    circuitSources: CircuitSource[],
    inputValues: Record<string, boolean>,
): Record<string, boolean> => {
    console.log("==================================== COMPUTE CIRCUIT SOURCES ====================================");
    console.log(`[COMPUTE_CIRCUIT_SOURCES] Computing sources:`, circuitSources);
    console.log(`[COMPUTE_CIRCUIT_SOURCES] Input values:`, inputValues);

    const outputValues: Record<string, boolean> = {};

    // Compute output value for each output port
    for (const source of circuitSources) {
        const outputPortNodes = source.nodes;
        const sourcePortName = source.portName;
        console.log(
            `[COMPUTE_CIRCUIT_SOURCES] Processing source port: "${sourcePortName}" with ${outputPortNodes.length} nodes`,
        );

        // Process each node connected to this output port
        for (const circuitNode of outputPortNodes) {
            console.log(`[COMPUTE_CIRCUIT_SOURCES] Computing node for port "${sourcePortName}":`, circuitNode);
            const computedValue = computeCircuitNode(circuitNode, inputValues);
            console.log(`[COMPUTE_CIRCUIT_SOURCES] Computed value for "${sourcePortName}": ${computedValue}`);
            outputValues[sourcePortName] = computedValue;
            if (computedValue === true) {
                console.log(`[COMPUTE_CIRCUIT_SOURCES] Early break for "${sourcePortName}" (value is true)`);
                break;
            }
        }
    }

    console.log(`[COMPUTE_CIRCUIT_SOURCES] Final output values:`, outputValues);
    console.log(
        "==================================== COMPUTE CIRCUIT SOURCES END ====================================",
    );
    return outputValues;
};

// ===== Compute Output Circuit Module ====
export const computeOutputChip = (
    chipName: string,
    inputValues: Record<string, boolean>,
    definitions: Circuit[],
): Record<string, boolean> => {
    console.log("==================================== COMPUTE OUTPUT CHIP ====================================");
    console.log(`[COMPUTE_OUTPUT_CHIP] Computing chip: "${chipName}"`);
    console.log(`[COMPUTE_OUTPUT_CHIP] Input values:`, inputValues);
    console.log(
        `[COMPUTE_OUTPUT_CHIP] Available definitions:`,
        definitions.map((d) => d.name),
    );

    const circuitSources = buildCircuitSources({ name: chipName, type: NodeType.CHIP }, definitions);
    console.log(`[COMPUTE_OUTPUT_CHIP] Built circuit tree:`, circuitSources);

    const result = computeCircuitSources(circuitSources, inputValues);
    console.log(`[COMPUTE_OUTPUT_CHIP] Final result:`, result);
    console.log("==================================== COMPUTE OUTPUT CHIP END ====================================");
    return result;
};
